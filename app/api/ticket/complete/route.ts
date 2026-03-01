import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { ticketId, rootCauseSystem, rootCauseMode, notes } = await req.json();

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { charger: true }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Process Job Completion:
        // 1. Update Ticket to Closed
        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'Closed' }
        });

        // 2. Clear fault on the charger and mark Available
        await prisma.charger.update({
            where: { id: ticket.chargerId },
            data: {
                status: 'Available'
            }
        });

        // 3. Free up the technician
        if (ticket.technicianId) {
            await prisma.technician.update({
                where: { id: ticket.technicianId },
                data: { isAvailable: true }
            });
        }

        // 4. Create an audit/telemetry log of the fix
        await prisma.telemetryLog.create({
            data: {
                chargerId: ticket.chargerId,
                eventType: 'RepairCompleted',
                details: `Field repair completed. System: ${rootCauseSystem}, Mode: ${rootCauseMode}. Notes: ${notes}`
            }
        });

        return NextResponse.json({ success: true, ticket: updatedTicket });

    } catch (error) {
        console.error('Completion Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
