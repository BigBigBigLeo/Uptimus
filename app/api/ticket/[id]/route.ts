import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                charger: true,
                technician: true
            }
        });

        if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
