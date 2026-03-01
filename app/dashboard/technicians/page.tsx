import { Users, Filter, Download } from 'lucide-react';
export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';
import NetworkMap from '../../components/MapWrapper';
import TechnicianListClient from './TechnicianListClient';

const prisma = new PrismaClient();

export default async function TechniciansPage() {
    const technicians = await prisma.technician.findMany({
        orderBy: { name: 'asc' }
    });

    const chargers = await prisma.charger.findMany();

    return (
        <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Workforce Management</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Live directory of cross-contractor field personnel.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '6px', cursor: 'pointer', color: '#fff' }}><Filter size={16} /> Filter</button>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '6px', cursor: 'pointer', color: '#fff' }}><Download size={16} /> Export</button>
                </div>
            </div>

            <div style={{ height: '400px', marginBottom: 'var(--spacing-lg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-surface-hover)' }}>
                <NetworkMap chargers={chargers} technicians={technicians} />
            </div>

            <TechnicianListClient technicians={technicians} />
        </div>
    );
}
