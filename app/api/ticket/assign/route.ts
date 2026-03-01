import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { ticketId, technicianId } = await req.json();

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                technicianId: technicianId,
                status: 'En Route'
            }
        });

        await prisma.technician.update({
            where: { id: technicianId },
            data: { isAvailable: false }
        });

        return NextResponse.json({ success: true, ticket: updatedTicket });
    } catch (error) {
        console.error('Assignment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
