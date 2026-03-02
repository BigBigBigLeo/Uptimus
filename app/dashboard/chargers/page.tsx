import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import ChargerListClient from './ChargerListClient';
import styles from './chargers.module.css';
import { Zap, Activity, ShieldCheck } from 'lucide-react';
import dashStyles from '../page.module.css';

export default async function ChargersPage() {
    const chargers = await prisma.charger.findMany({
        orderBy: { stationId: 'asc' }
    });

    return (
        <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1600px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Network Overview</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Live telemetry and asset health status.</p>
            </div>

            <div className={dashStyles.kpiGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className={dashStyles.kpiCard}>
                    <div className={dashStyles.kpiIconWrapper} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <Zap size={24} />
                    </div>
                    <div className={dashStyles.kpiValue}>98.7<span className={dashStyles.kpiUnit}>%</span></div>
                    <div className={dashStyles.kpiLabel}>NETWORK UPTIME</div>
                    <div className={dashStyles.kpiSubLabel} style={{ color: '#10b981', fontWeight: 600 }}>↑ 0.4% from last month</div>
                </div>
                <div className={dashStyles.kpiCard}>
                    <div className={dashStyles.kpiIconWrapper} style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <Activity size={24} />
                    </div>
                    <div className={dashStyles.kpiValue}>42.3<span className={dashStyles.kpiUnit}>%</span></div>
                    <div className={dashStyles.kpiLabel}>UTILIZATION RATE</div>
                    <div className={dashStyles.kpiSubLabel} style={{ color: '#10b981', fontWeight: 600 }}>↑ 2.1% from last month</div>
                </div>
                <div className={dashStyles.kpiCard}>
                    <div className={dashStyles.kpiIconWrapper} style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div className={dashStyles.kpiValue}>99.1<span className={dashStyles.kpiUnit}>%</span></div>
                    <div className={dashStyles.kpiLabel}>HARDWARE RELIABILITY</div>
                    <div className={dashStyles.kpiSubLabel}>Avg MTBF: 1.2 years</div>
                </div>
            </div>


            {/* We pass the chargers to a Client Component to handle filtering and the interactive map */}
            <ChargerListClient initialChargers={chargers as any} />
        </div>
    );
}
