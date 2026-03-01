import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import TechnicianClient from './TechnicianClient';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function TechnicianPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params;
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            charger: true,
            technician: true
        }
    });

    if (!ticket || !ticket.technician) return notFound();

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#0f172a' }}>
            <header style={{ backgroundColor: '#ffffff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 700 }}>U</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>UPTIMUS</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '1px' }}>EXECUTION HUB</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ticket.technician.name}</div>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {ticket.technician.name.charAt(0)}
                    </div>
                </div>
            </header>

            <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '16px' }}>
                    <Link href={`/dashboard/tracking/${ticket.id}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        &larr; Back to Ticket Tracking
                    </Link>
                </div>
                <TechnicianClient ticket={ticket} />
            </div>
        </div>
    );
}
