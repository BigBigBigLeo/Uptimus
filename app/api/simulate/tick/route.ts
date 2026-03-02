import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateDistance, calculateETA, simulateRouteWaypoints } from '@/lib/routing';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results = {
            faultsInjected: 0,
            techniciansMoved: 0,
        };

        // 1. Random Fault Injection (approx 1-2% of available chargers)
        const availableChargers = await prisma.charger.findMany({
            where: { status: 'Available' }
        });

        for (const charger of availableChargers) {
            if (Math.random() < 0.02) {
                const faults = ['Power Module Failure', 'Connector B Fault', 'Lock Failure', 'Overheating'];
                const randomFault = faults[Math.floor(Math.random() * faults.length)];

                await prisma.charger.update({
                    where: { id: charger.id },
                    data: {
                        status: 'Faulted',
                        faultCount: charger.faultCount + 1
                    }
                });

                await prisma.telemetryLog.create({
                    data: {
                        chargerId: charger.id,
                        eventType: 'FaultTriggered',
                        details: `Simulated fault: ${randomFault}`
                    }
                });

                results.faultsInjected++;
                // Limit fault injection to max 1 per tick to avoid overwhelming the demo
                if (results.faultsInjected >= 1) break;
            }
        }

        // 2. GPS Movement Simulation for Technicians "En Route"
        // Find all tickets that are "En Route"
        const activeTickets = await prisma.ticket.findMany({
            where: { status: 'En Route', technicianId: { not: null } },
            include: { charger: true, technician: true }
        });

        for (const ticket of activeTickets) {
            if (!ticket.technician || !ticket.charger) continue;

            const tech = ticket.technician;
            const target = ticket.charger;

            const dist = calculateDistance(tech.lat, tech.lng, target.lat, target.lng);

            // If we are very close (< 0.5km), set status to 'On Site'
            if (dist < 0.5) {
                await prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { status: 'On Site' }
                });
                // We can optionally create a telemetry log here
            } else {
                // Otherwise, move them closer. We use simulateRouteWaypoints and take the first step towards the target.
                const waypoints = simulateRouteWaypoints(tech.lat, tech.lng, target.lat, target.lng, 10);
                // waypoints[0] is start, waypoints[1] is the next step
                const nextStep = waypoints[1];

                if (nextStep) {
                    await prisma.technician.update({
                        where: { id: tech.id },
                        data: {
                            lat: nextStep.lat,
                            lng: nextStep.lng
                        }
                    });
                    results.techniciansMoved++;
                }
            }
        }

        // 3. Remote Fix Automation (50% success rate to clear faults before ticket generation)
        const unassignedFaults = await prisma.charger.findMany({
            where: {
                status: 'Faulted',
                tickets: { none: { status: { in: ['Open', 'Assigned', 'En Route', 'On Site'] } } }
            }
        });

        for (const charger of unassignedFaults) {
            // 50% chance to automatically resolve the issue remotely
            const success = Math.random() > 0.5;
            const actions = ['Soft Reset', 'Unlock Connector', 'Clear Faults'];
            const action = actions[Math.floor(Math.random() * actions.length)];

            await prisma.telemetryLog.create({
                data: {
                    chargerId: charger.id,
                    eventType: 'RemoteCommand',
                    details: `Auto-Intellgient action attempted: ${action}. Success: ${success}`
                }
            });

            if (success) {
                await prisma.charger.update({
                    where: { id: charger.id },
                    data: { status: 'Available' }
                });
                await prisma.telemetryLog.create({
                    data: {
                        chargerId: charger.id,
                        eventType: 'SystemRecovery',
                        details: `Fault cleared remotely by AI module.`
                    }
                });
            } else {
                // Create an Open Ticket physically dispatching help since remote failed
                await prisma.ticket.create({
                    data: {
                        chargerId: charger.id,
                        faultCode: 'Remote Override Failure',
                        status: 'Open',
                        slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours SLA
                    }
                });
            }
        }

        // 4. Job Completion Automation (Close tickets that are 'On Site')
        const onSiteTickets = await prisma.ticket.findMany({
            where: { status: 'On Site', technicianId: { not: null } }
        });

        for (const ticket of onSiteTickets) {
            // 30% chance per tick to finish the job once on site
            if (Math.random() > 0.7 && ticket.technicianId) {
                await prisma.$transaction([
                    prisma.ticket.update({
                        where: { id: ticket.id },
                        data: { status: 'Closed' }
                    }),
                    prisma.charger.update({
                        where: { id: ticket.chargerId },
                        data: { status: 'Available' }
                    }),
                    prisma.technician.update({
                        where: { id: ticket.technicianId },
                        data: { isAvailable: true }
                    }),
                    prisma.telemetryLog.create({
                        data: {
                            chargerId: ticket.chargerId,
                            eventType: 'RepairCompleted',
                            details: `Physical repair completed by technician. Hardware functioning nominally.`
                        }
                    })
                ]);
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Simulation Tick Error:', error);
        return NextResponse.json({ success: false, error: 'Simulation failed' }, { status: 500 });
    }
}
