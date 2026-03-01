import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import TrackingClient from './TrackingClient';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function TrackingPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params;
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            charger: {
                include: {
                    telemetryLogs: {
                        where: { eventType: 'RepairCompleted' },
                        orderBy: { timestamp: 'desc' },
                        take: 1
                    }
                }
            },
            technician: true
        }
    });

    if (!ticket) return notFound();

    return (
        <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div style={{ marginBottom: '20px', position: 'relative', zIndex: 9999 }}>
                <a href="/dashboard/dispatch" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', position: 'relative', zIndex: 9999 }}>
                    &larr; Back to Dispatch Overview
                </a>
            </div>
            <TrackingClient ticket={ticket} />
        </div>
    );
}
