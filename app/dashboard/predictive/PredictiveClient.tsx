'use client';

import { useState } from 'react';
import { BrainCircuit, AlertTriangle, ShieldCheck, CalendarClock, X, UserCheck } from 'lucide-react';

type PredictiveCharger = {
    id: string;
    stationId: string;
    city: string;
    country: string;
    brand: string;
    riskScore: number;
    predictedComponent: string;
    preventiveAction: { label: string; color: string };
    daysToFailure: number;
};

type Tech = {
    id: string;
    name: string;
    contractor: string;
};

type ScheduleEntry = {
    chargerId: string;
    stationId: string;
    techId: string;
    techName: string;
    scheduledDate: string;
    action: string;
};

export default function PredictiveClient({ chargers, technicians }: { chargers: PredictiveCharger[], technicians: Tech[] }) {
    const [scheduleModal, setScheduleModal] = useState<PredictiveCharger | null>(null);
    const [selectedTech, setSelectedTech] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [scheduledEntries, setScheduledEntries] = useState<ScheduleEntry[]>([]);

    // Search and Sort state
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<keyof PredictiveCharger>('riskScore');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleSort = (key: keyof PredictiveCharger) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const handleSchedule = () => {
        if (!scheduleModal || !selectedTech || !selectedDate) return;
        const tech = technicians.find(t => t.id === selectedTech);
        if (!tech) return;

        setScheduledEntries(prev => [...prev, {
            chargerId: scheduleModal.id,
            stationId: scheduleModal.stationId,
            techId: tech.id,
            techName: tech.name,
            scheduledDate: selectedDate,
            action: scheduleModal.preventiveAction.label
        }]);
        setScheduleModal(null);
        setSelectedTech('');
        setSelectedDate('');
    };

    const isScheduled = (chargerId: string) => scheduledEntries.some(e => e.chargerId === chargerId);
    const getSchedule = (chargerId: string) => scheduledEntries.find(e => e.chargerId === chargerId);

    // Calculate max date for each charger (today + daysToFailure)
    const getMaxDate = (daysToFailure: number) => {
        const d = new Date();
        d.setDate(d.getDate() + daysToFailure);
        return d.toISOString().split('T')[0];
    };
    const getMinDate = () => new Date().toISOString().split('T')[0];

    const filteredAndSortedChargers = chargers
        .filter(c => {
            if (search && !c.stationId.toLowerCase().includes(search.toLowerCase()) && !c.city.toLowerCase().includes(search.toLowerCase()) && !c.predictedComponent.toLowerCase().includes(search.toLowerCase())) return false;
            // Default to showing only significant risks (> 30) if no search is active
            if (!search && c.riskScore <= 30) return false;
            return true;
        })
        .sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                        Predictive Maintenance AI
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Analyzes telemetry streams to predict hardware failures before they cause operational downtime.</p>
                </div>
                <div>
                    <span style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ActivityStatus /> LIVE FEED MODEL
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '8px' }}>ASSETS SCANNED (24H)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{chargers.length}</div>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600, marginBottom: '8px' }}>CRITICAL RISK (&gt;80%)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{chargers.filter(c => c.riskScore > 80).length}</div>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, marginBottom: '8px' }}>ELEVATED RISK (&gt;50%)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{chargers.filter(c => c.riskScore > 50 && c.riskScore <= 80).length}</div>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, marginBottom: '8px' }}>HEALTHY</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{chargers.filter(c => c.riskScore <= 50).length}</div>
                </div>
            </div>

            {/* Scheduled Maintenance Section */}
            {scheduledEntries.length > 0 && (
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid #10b981', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={18} /> Scheduled Preventive Maintenance ({scheduledEntries.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {scheduledEntries.map((entry, i) => (
                            <div key={i} style={{ backgroundColor: 'var(--color-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-surface-hover)' }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{entry.stationId}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{entry.action}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#10b981' }}>{entry.techName}</span>
                                    <span style={{ color: '#3b82f6' }}>{entry.scheduledDate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--color-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>At-Risk Hardware Components</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search assets or components..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                paddingLeft: '32px',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-surface-hover)',
                                borderRadius: '6px',
                                color: '#fff',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                        />
                        <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-bg)' }}>
                        <tr style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                            <th onClick={() => handleSort('stationId')} style={{ padding: '16px 20px', cursor: 'pointer' }}>
                                STATION ASSET {sortKey === 'stationId' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('predictedComponent')} style={{ padding: '16px 20px', cursor: 'pointer' }}>
                                FLAGGED COMPONENT {sortKey === 'predictedComponent' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('riskScore')} style={{ padding: '16px 20px', cursor: 'pointer' }}>
                                PROBABILITY {sortKey === 'riskScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('daysToFailure')} style={{ padding: '16px 20px', cursor: 'pointer' }}>
                                EST. SURVIVAL {sortKey === 'daysToFailure' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th style={{ padding: '16px 20px' }}>PREVENTIVE ACTION</th>
                            <th style={{ padding: '16px 20px' }}>SCHEDULE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedChargers.slice(0, 15).map((charger) => (
                            <tr key={charger.id} style={{ borderBottom: '1px solid var(--color-surface-hover)' }}>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontWeight: 600 }}>{charger.stationId}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{charger.city}, {charger.country}</div>
                                </td>
                                <td style={{ padding: '16px 20px', fontWeight: 500 }}>
                                    {charger.predictedComponent}
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${charger.riskScore}%`,
                                                height: '100%',
                                                backgroundColor: charger.riskScore > 80 ? '#ef4444' : charger.riskScore > 50 ? '#f59e0b' : '#3b82f6'
                                            }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: charger.riskScore > 80 ? '#ef4444' : charger.riskScore > 50 ? '#f59e0b' : '#3b82f6' }}>
                                            {charger.riskScore}%
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: charger.daysToFailure < 10 ? '#ef4444' : 'var(--color-text)' }}>
                                        <CalendarClock size={16} /> ~{charger.daysToFailure} days
                                    </span>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{ backgroundColor: charger.preventiveAction.color, color: 'white', padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block' }}>
                                        {charger.preventiveAction.label}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    {isScheduled(charger.id) ? (
                                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ShieldCheck size={16} /> {getSchedule(charger.id)?.scheduledDate}
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setScheduleModal(charger)}
                                            style={{
                                                backgroundColor: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)',
                                                padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
                                            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                                        >
                                            Schedule Tech
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Schedule Modal */}
            {scheduleModal && (
                <>
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 }}
                        onClick={() => setScheduleModal(null)}
                    />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        backgroundColor: 'var(--color-surface)', borderRadius: '16px', padding: '32px',
                        width: '440px', maxWidth: '90vw', zIndex: 1001,
                        border: '1px solid var(--color-surface-hover)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Schedule Preventive Maintenance</h3>
                            <button onClick={() => setScheduleModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>{scheduleModal.stationId}</div>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{scheduleModal.city}, {scheduleModal.country}</div>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                                <span style={{ color: scheduleModal.riskScore > 80 ? '#ef4444' : '#f59e0b' }}>Risk: {scheduleModal.riskScore}%</span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Component: {scheduleModal.predictedComponent}</span>
                            </div>
                            <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#ef4444' }}>
                                Must be serviced within {scheduleModal.daysToFailure} days
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '6px' }}>ASSIGN TECHNICIAN</label>
                            <select
                                value={selectedTech}
                                onChange={e => setSelectedTech(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-surface-hover)',
                                    borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.9rem'
                                }}
                            >
                                <option value="">Select technician...</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.name} — {tech.contractor}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '6px' }}>SCHEDULED DATE</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                min={getMinDate()}
                                max={getMaxDate(scheduleModal.daysToFailure)}
                                style={{
                                    width: '100%', padding: '10px 14px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-surface-hover)',
                                    borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.9rem'
                                }}
                            />
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                Deadline: {getMaxDate(scheduleModal.daysToFailure)} (based on estimated survival)
                            </div>
                        </div>

                        <button
                            onClick={handleSchedule}
                            disabled={!selectedTech || !selectedDate}
                            style={{
                                width: '100%', padding: '12px', backgroundColor: (!selectedTech || !selectedDate) ? 'var(--color-surface-hover)' : 'var(--color-primary)',
                                color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: (!selectedTech || !selectedDate) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Confirm Schedule
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function ActivityStatus() {
    return (
        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '50%' }}>
            <span style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#8b5cf6', borderRadius: '50%', opacity: 0.7 }} className="animate-ping"></span>
        </span>
    );
}
