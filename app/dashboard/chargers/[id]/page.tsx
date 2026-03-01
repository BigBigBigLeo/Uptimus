import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import styles from './detail.module.css';
import ChargerActionsClient from './ChargerActionsClient';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function ChargerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const charger = await prisma.charger.findUnique({
        where: { id },
        include: {
            tickets: {
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            telemetryLogs: {
                orderBy: { timestamp: 'desc' },
                take: 6
            }
        }
    });

    if (!charger) return notFound();

    return (
        <div className={styles.container}>
            <div style={{ marginBottom: '16px' }}>
                <Link href="/dashboard/chargers" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    &larr; Back to Network Overview
                </Link>
            </div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{charger.brand} {charger.model} <span className={styles.stationBadge}>STATION {charger.stationId}</span></h1>
                    <p className={styles.subtitle}>{charger.city}, {charger.country} • Power: {charger.powerKw}kW</p>
                </div>
                <div className={styles.statusBox}>
                    <div className={styles.statusLabel}>CURRENT STATUS</div>
                    <div className={charger.status === 'Available' ? styles.statusGreen : styles.statusRed}>{charger.status}</div>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.panel}>
                    <h3>Remote Diagnostics</h3>
                    {charger.status === 'Faulted' ? (
                        <div className={styles.faultAlert}>
                            <strong>Current Fault:</strong> {(charger as any).faultCode}
                        </div>
                    ) : (
                        <div className={styles.okAlert}>All systems nominal.</div>
                    )}

                    <ChargerActionsClient chargerId={charger.id} status={charger.status} />
                </div>

                <div className={styles.panel}>
                    <h3>SLA & Performance</h3>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        {charger.modelImageUrl && (
                            <div style={{ flex: '0 0 120px', height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-surface-hover)', backgroundColor: '#fff' }}>
                                <img src={charger.modelImageUrl} alt={charger.model} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        )}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className={styles.statRow}>
                                <span>SLA Tier:</span>
                                <strong>{charger.slaTier}</strong>
                            </div>
                            <div className={styles.statRow}>
                                <span>Session Success Rate:</span>
                                <strong style={{ color: '#10b981' }}>98.2%</strong>
                            </div>
                            <div className={styles.statRow}>
                                <span>Firmware Version:</span>
                                <strong>v2.4.11-stable</strong>
                            </div>
                            <div className={styles.statRow}>
                                <span>Install Date:</span>
                                <strong>14 Oct 2023</strong>
                            </div>
                            <div className={styles.statRow}>
                                <span>Peak Usage:</span>
                                <strong>18:00 - 21:00 CET</strong>
                            </div>
                            <div className={styles.statRow}>
                                <span>Historical Faults:</span>
                                <strong>{charger.faultCount}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.panelFull}>
                <h3>Automated Diagnostics Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    {charger.telemetryLogs.map((log: any) => (
                        <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', borderLeft: log.eventType === 'SystemError' ? '3px solid #ef4444' : log.eventType === 'RemoteCommand' ? '3px solid #3b82f6' : '3px solid #10b981' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', minWidth: '70px', marginTop: '2px' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: log.eventType === 'SystemError' ? '#ef4444' : log.eventType === 'RemoteCommand' ? '#3b82f6' : '#10b981', marginBottom: '2px' }}>{log.eventType.toUpperCase()}</div>
                                <div style={{ fontSize: '0.95rem' }}>{log.details}</div>
                            </div>
                        </div>
                    ))}
                    {charger.telemetryLogs.length === 0 && (
                        <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No recent automated actions logged.</div>
                    )}
                </div>
            </div>

            <div className={styles.panelFull}>
                <h3>Recent Tickets</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Fault</th>
                            <th>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {charger.tickets.map((t: any) => (
                            <tr key={t.id}>
                                <td>{t.id.slice(-6).toUpperCase()}</td>
                                <td>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: t.status === 'Open' ? '#fee2e2' : t.status === 'Assigned' ? '#fef3c7' : t.status === 'Closed' ? '#f1f5f9' : '#e0f2fe',
                                        color: t.status === 'Open' ? '#ef4444' : t.status === 'Assigned' ? '#d97706' : t.status === 'Closed' ? '#64748b' : '#0ea5e9'
                                    }}>
                                        {t.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>{t.faultCode}</td>
                                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                                <td><a href={`/dashboard/tracking/${t.id}`} className={styles.link}>View</a></td>
                            </tr>
                        ))}
                        {charger.tickets.length === 0 && (
                            <tr>
                                <td colSpan={5}>No recent repairs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
