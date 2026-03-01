import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic';
import DispatchClient from './DispatchClient';
import DispatchLogClient from './DispatchLogClient';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function DispatchPage({ searchParams }: { searchParams: Promise<{ ticketId?: string }> }) {
    const { ticketId } = await searchParams;

    // Fetch all tickets for the main dispatch view, including historical/closed
    const allTickets = await prisma.ticket.findMany({
        include: {
            charger: true,
            technician: true
        },
        orderBy: { createdAt: 'desc' }
    }) as any[];

    // Only show dispatch workflow when an explicit ticketId is provided
    const activeDispatchTicket = ticketId
        ? allTickets.find((t: any) => t.id === ticketId && t.status === 'Open')
        : null;

    // Fetch all available technicians for matching if we are in Dispatch workflow
    const technicians = activeDispatchTicket ? await prisma.technician.findMany({
        where: { isAvailable: true }
    }) : [];

    return (
        <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>AI Smart Dispatch Engine</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Cross-contractor optimization & dynamic routing.</p>
                </div>
            </div>

            {activeDispatchTicket ? (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <Link href="/dashboard/dispatch" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            &larr; Back to Dispatch Overview
                        </Link>
                    </div>
                    <DispatchClient ticket={activeDispatchTicket} technicians={technicians} />
                </div>
            ) : (
                <DispatchLogClient initialTickets={allTickets} />
            )}
        </div>
    );
}
