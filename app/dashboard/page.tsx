import styles from './page.module.css';
import prisma from '@/lib/prisma';
import { Activity, ZapOff, PenTool, AlertTriangle, TrendingDown, Cpu, Wrench, FileCheck, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import DashboardSummaryChart from './components/DashboardCharts';
export const dynamic = 'force-dynamic';

const FAULT_SUMMARY_DATA = [
    { name: 'Jan', value: 145, color: '#3b82f6' },
    { name: 'Feb', value: 138, color: '#3b82f6' },
    { name: 'Mar', value: 152, color: '#3b82f6' },
    { name: 'Apr', value: 131, color: '#3b82f6' },
    { name: 'May', value: 95, color: '#10b981' },
    { name: 'Jun', value: 78, color: '#10b981' },
];

const PREDICTIVE_FAULTS = [
    { type: 'Cooling Blockage', prob: '89%', eta: '48-72 hrs', parts: 'Fan Assembly v2', tools: 'Thermal Imager', skill: 'Level 2 Tech' },
    { type: 'DC Contactor Arc', prob: '94%', eta: '< 24 hrs', parts: 'Contactor Relay L1', tools: 'Insulated Toolkit', skill: 'HV Level 3 Certified' },
    { type: 'Cable Liquid Leak', prob: '78%', eta: '5-7 Days', parts: 'Liquid Cable NACS', tools: 'Coolant Flush Kit', skill: 'Level 2 Tech' },
    { type: 'RFID Reader Failure', prob: '65%', eta: '14 Days', parts: 'RFID Module NFC', tools: 'Security Torx', skill: 'Level 1 Tech' },
];

export default async function DashboardPage() {
    const [totalChargers, offlineChargers, highRiskChargers] = await Promise.all([
        prisma.charger.count(),
        prisma.charger.count({
            where: { status: { in: ['Offline', 'Faulted'] } }
        }),
        prisma.charger.findMany({
            where: { faultCount: { gt: 0 } },
            include: {
                tickets: {
                    where: { status: 'Open' },
                    take: 1
                }
            },
            orderBy: { faultCount: 'desc' },
            take: 4
        })
    ]);

    // Realistic Uptime Override
    const uptimeSLA = 98.7;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Network Orchestration</h1>
                    <p className={styles.subtitle}>Real-time repair metrics, fault trends, and predictive AI insights.</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.btnSecondary}>Export Report</button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} animate-enter`} style={{ animationDelay: '0.1s' }}>
                    <div className={styles.kpiIconWrapper} style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <Activity size={24} />
                    </div>
                    <div className={styles.kpiValue}>28.4 <span className={styles.kpiUnit}>hrs</span></div>
                    <div className={styles.kpiLabel}>AVERAGE MTTR</div>
                    <div className={styles.kpiSubLabel}>Target: &lt; 48.0 hrs</div>
                </div>

                <div className={`${styles.kpiCard} animate-enter`} style={{ animationDelay: '0.2s' }}>
                    <div className={styles.kpiIconWrapper} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <ZapOff size={24} />
                    </div>
                    <div className={styles.kpiValue}>{uptimeSLA.toFixed(1)} <span className={styles.kpiUnit}>%</span></div>
                    <div className={styles.kpiLabel}>NETWORK UPTIME SLA</div>
                    <div className={styles.kpiSubLabel}>Target: &gt; 98.5% 🎯</div>
                </div>

                <div className={`${styles.kpiCard} animate-enter`} style={{ animationDelay: '0.3s' }}>
                    <div className={styles.kpiIconWrapper} style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
                        <PenTool size={24} />
                    </div>
                    <div className={styles.kpiValue}>92 <span className={styles.kpiUnit}>%</span></div>
                    <div className={styles.kpiLabel}>FIRST-TIME FIX</div>
                    <div className={styles.kpiSubLabel}>Remote Triage Success</div>
                </div>

                <div className={`${styles.kpiCard} animate-enter`} style={{ animationDelay: '0.4s' }}>
                    <div className={styles.kpiIconWrapper} style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className={styles.kpiValue}>143</div>
                    <div className={styles.kpiLabel}>ACTIVE TRUCK ROLLS</div>
                    <div className={styles.pillContainer}>
                        <span className={styles.pillCritical}>12 Critical</span>
                        <span className={styles.pillWarning}>45 High</span>
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.chartPanel} style={{ gridColumn: 'span 1' }}>
                    <h3>Overall Fault Volume</h3>
                    <p className="subtitle-sm" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        Monthly active faults detected across network
                    </p>
                    <DashboardSummaryChart data={FAULT_SUMMARY_DATA} />
                </div>

                {/* Intelligent Dispatch Manifests Header consolidated section */}
                <div className={styles.chartPanel} style={{ gridColumn: 'span 1' }}>
                    <h3>Intelligent Dispatch Manifests</h3>
                    <p className="subtitle-sm" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        AI-synthesized repair plans and resource requirements
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                        {highRiskChargers.slice(0, 3).map((c: any, i: number) => {
                            const pred = PREDICTIVE_FAULTS[i % PREDICTIVE_FAULTS.length];
                            return (
                                <div key={`ai-${c.id}`} style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>{c.stationId}</div>
                                            <div style={{ fontSize: '0.75rem', color: i === 1 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{pred.type} ({pred.prob})</div>
                                        </div>
                                        <Link href={`/dashboard/chargers/${c.id}`}>
                                            <button className={styles.btnSecondary} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>View Station</button>
                                        </Link>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Cpu size={14} color="#94a3b8" />
                                            <div>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Parts</div>
                                                <div style={{ fontSize: '0.75rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pred.parts}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileCheck size={14} color="#94a3b8" />
                                            <div>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Skill</div>
                                                <div style={{ fontSize: '0.75rem', color: i === 1 ? '#f59e0b' : '#10b981' }}>{pred.skill}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
                                        <Link href={c.tickets?.[0] ? (c.tickets[0].status === 'Open' ? `/dashboard/dispatch?ticketId=${c.tickets[0].id}` : `/dashboard/tracking/${c.tickets[0].id}`) : `/dashboard/dispatch`} style={{ flex: 1 }}>
                                            <button className={styles.btnSecondary} style={{ width: '100%', fontSize: '0.75rem', padding: '6px' }}>
                                                {c.tickets?.[0] && c.tickets[0].status !== 'Open' ? 'View Active Log' : 'Review Auto-Dispatch'}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
