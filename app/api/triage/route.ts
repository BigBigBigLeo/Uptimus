import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { chargerId } = await req.json();

        const charger = await prisma.charger.findUnique({
            where: { id: chargerId }
        });

        if (!charger) {
            return NextResponse.json({ error: 'Charger not found' }, { status: 404 });
        }

        // Simulate a sequence of automated actions taken by the platform
        await prisma.telemetryLog.createMany({
            data: [
                {
                    chargerId: charger.id,
                    eventType: 'PlatformEvent',
                    details: 'AI Anomaly detected. Initiating automated remote triage protocol.'
                },
                {
                    chargerId: charger.id,
                    eventType: 'RemoteCommand',
                    details: `Pinging power module via OCPP Diagnostic Status Request.`
                },
                {
                    chargerId: charger.id,
                    eventType: 'SystemError',
                    details: `Hardware response timeout block A. Status: Offline.`
                },
                {
                    chargerId: charger.id,
                    eventType: 'RemoteCommand',
                    details: `Sending Level 2 Soft Reset Command.`
                }
            ]
        });

        const isAutoResolved = Math.random() > 0.4; // 60% chance to auto-resolve

        if (isAutoResolved) {
            await prisma.telemetryLog.create({
                data: {
                    chargerId: charger.id,
                    eventType: 'PlatformEvent',
                    details: 'Remote Soft Reset SUCCESS. Hardware fault cleared. Status restored to Available.'
                }
            });

            await prisma.charger.update({
                where: { id: charger.id },
                data: { status: 'Available' }
            });

            return NextResponse.json({
                success: true,
                triageResult: 'Remote recovery SUCCEEDED. Asset restored.',
                ticket: null
            });
        }

        // Auto-create Ticket on failure
        await prisma.telemetryLog.create({
            data: {
                chargerId: charger.id,
                eventType: 'SystemError',
                details: 'Reset failed. Hardware fault confirmed. Escalating to field dispatch routing.'
            }
        });

        // Determine SLA Deadline based on Tier
        const now = new Date();
        const deadlineHours = charger.slaTier === 'Critical' ? 4 : charger.slaTier === 'Premium' ? 12 : 24;
        const slaDeadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);

        const ticket = await prisma.ticket.create({
            data: {
                chargerId: charger.id,
                faultCode: 'Intermittent Module Failure',
                status: 'Open',
                slaDeadline: slaDeadline
            }
        });

        return NextResponse.json({
            success: true,
            triageResult: 'Remote recovery failed. Escalated to dispatch.',
            ticket: ticket
        });

    } catch (error) {
        console.error('Triage Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
