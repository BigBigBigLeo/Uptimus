'use client';

import { useState } from 'react';
import styles from './dispatch.module.css';
import { AlertCircle, MapPin, Clock, Award, Phone, CheckCircle, UserCheck, Activity, Search, ShieldCheck, X } from 'lucide-react';
import { calculateDistance, calculateETA } from '@/lib/routing';

type Technician = {
    id: string;
    name: string;
    contractor: string;
    lat: number;
    lng: number;
    certs: string;
    avgMttrHours: number;
    isAvailable: boolean;
};

type Ticket = {
    id: string;
    faultCode: string;
    slaDeadline: Date;
    charger: {
        stationId: string;
        brand: string;
        model: string;
        city: string;
        lat: number;
        lng: number;
    };
};

export default function DispatchClient({ ticket, technicians }: { ticket: Ticket, technicians: Technician[] }) {
    const [assigned, setAssigned] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'details' | 'history' | 'techs'>('techs');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'score' | 'distance' | 'mttr'>('score');

    // AI Scoring Engine
    const matches = technicians.map(tech => {
        const dist = calculateDistance(ticket.charger.lat, ticket.charger.lng, tech.lat, tech.lng);
        const eta = calculateETA(dist);
        const hasDC = tech.certs.includes('DC Fast Certified');
        const hasBrand = tech.certs.includes(ticket.charger.brand);

        let score = 50;
        score -= Math.min(dist / 5, 30);
        if (hasDC) score += 20;
        if (hasBrand) score += 20;
        if (tech.avgMttrHours < 2) score += 20;

        return {
            technician: tech,
            dist,
            eta: eta.minutes,
            score: Math.min(Math.round(score), 99)
        };
    });

    const filteredAndSortedTechs = matches
        .filter(m => {
            if (search && !m.technician.name.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortKey === 'score') return b.score - a.score;
            if (sortKey === 'distance') return a.dist - b.dist;
            if (sortKey === 'mttr') return a.technician.avgMttrHours - b.technician.avgMttrHours;
            return 0;
        });

    const handleAssign = async (techId: string) => {
        setAssigned(techId);
        try {
            await fetch('/api/ticket/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId: ticket.id, technicianId: techId })
            });
            await new Promise(r => setTimeout(r, 600));
            window.location.href = `/dashboard/tracking/${ticket.id}`;
        } catch (err) {
            console.error(err);
            setAssigned(null);
        }
    };

    const currentTabStyles = (tab: string) => ({
        flex: 1,
        padding: '10px',
        backgroundColor: selectedTab === tab ? 'var(--color-primary)' : 'var(--color-surface)',
        color: selectedTab === tab ? 'white' : 'var(--color-text-secondary)',
        border: '1px solid var(--color-surface-hover)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    });

    return (
        <div className={styles.container}>
            {/* TICKET SUMMARY PANEL */}
            <div className={styles.summaryPanel}>
                <div className={styles.ticketBadge}>
                    <AlertCircle size={14} /> CRITICAL FAULT
                </div>
                <h2 className={styles.ticketTitle}>EV Charger Station - {ticket.charger.city}</h2>

                <div className={styles.ticketDetails}>
                    <div className={styles.detailRow}>
                        <span>TICKET ID</span>
                        <strong>{ticket.id.slice(-6).toUpperCase()}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', margin: '20px 0' }}>
                        <button onClick={() => setSelectedTab('techs')} style={currentTabStyles('techs')}><UserCheck size={18} /> Matches</button>
                        <button onClick={() => setSelectedTab('details')} style={currentTabStyles('details')}><Activity size={18} /> Details</button>
                        <button onClick={() => setSelectedTab('history')} style={currentTabStyles('history')}><Clock size={18} /> History</button>
                    </div>

                    {selectedTab === 'techs' && (
                        <div style={{ animation: 'fadeIn 0.4s' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 12px', paddingLeft: '36px',
                                            backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-surface-hover)',
                                            borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none'
                                        }}
                                    />
                                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                </div>
                                <select
                                    value={sortKey}
                                    onChange={(e) => setSortKey(e.target.value as any)}
                                    style={{
                                        padding: '8px 12px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-surface-hover)',
                                        borderRadius: '8px', color: '#fff', fontSize: '0.85rem'
                                    }}
                                >
                                    <option value="score">Sort: AI Score</option>
                                    <option value="distance">Sort: Distance</option>
                                    <option value="mttr">Sort: MTTR</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {filteredAndSortedTechs.map((match) => (
                                    <div
                                        key={match.technician.id}
                                        style={{
                                            backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '12px',
                                            border: assigned === match.technician.id ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-hover)',
                                            transition: 'all 0.2s', position: 'relative',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => !assigned && handleAssign(match.technician.id)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{match.technician.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Award size={14} color="#3b82f6" /> {match.technician.contractor}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>{match.score}%</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>MATCH SCORE</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                <MapPin size={14} color="var(--color-text-secondary)" />
                                                <span>{match.dist.toFixed(1)} km away</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                <Clock size={14} color="var(--color-text-secondary)" />
                                                <span>ETA: {match.eta} min</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                <Activity size={14} color="var(--color-text-secondary)" />
                                                <span>MTTR: {match.technician.avgMttrHours}h</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                <ShieldCheck size={14} color="#10b981" />
                                                <span style={{ color: '#10b981' }}>{match.technician.certs.split(',')[0]}</span>
                                            </div>
                                        </div>

                                        <button
                                            style={{
                                                width: '100%', padding: '10px',
                                                backgroundColor: assigned === match.technician.id ? '#10b981' : 'var(--color-surface-hover)',
                                                color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: assigned ? 'not-allowed' : 'pointer'
                                            }}
                                            disabled={assigned !== null}
                                        >
                                            {assigned === match.technician.id ? 'Technician Assigned' : 'Assign to Ticket'}
                                        </button>
                                    </div>
                                ))}
                                {filteredAndSortedTechs.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                                        No technicians matching "{search}"
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'details' && (
                        <div style={{ animation: 'fadeIn 0.4s' }}>
                            <div className={styles.detailRow}>
                                <span>FAULT TYPE</span>
                                <strong>{ticket.faultCode}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>STATION MODEL</span>
                                <strong>{ticket.charger.brand} {ticket.charger.model}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>SLA REMAINING</span>
                                <strong className={styles.slaAlert}>
                                    <Clock size={16} style={{ marginRight: '4px' }} />
                                    {Math.max(0, Math.round((new Date(ticket.slaDeadline).getTime() - new Date().getTime()) / 3600000))}h
                                </strong>
                            </div>
                            <div className={styles.triageBox}>
                                <div className={styles.triageHeader}>
                                    <Award size={18} /> AI Triage Analysis
                                </div>
                                <p className={styles.triageText}>
                                    Telemetry analysis indicates physical component failure matching {ticket.faultCode}.
                                    Remote reset attempts exhausted. Physical dispatch required.
                                </p>
                                <div className={styles.triagePills}>
                                    <span className={styles.pill}>DC FAST CERT</span>
                                    <span className={styles.pill}>{ticket.charger.brand.toUpperCase()} CERT</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'history' && (
                        <div style={{ animation: 'fadeIn 0.4s', textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                            Asset history coming soon!
                        </div>
                    )}
                </div>
            </div>

            {/* TECH RANKING PANEL (OLD - REMOVED OR REPLACED BY TABS) */}
            {/* The content below is replaced by the tabbed interface above */}
            {/*
            <div className={styles.rankingPanel}>
                <h3>Technician Matches</h3>
                <p className={styles.subtext}>Ranked by compatibility score, SLAs, and distance.</p>

                <div className={styles.techList}>
                    {rankedTechs.map((tech, index) => (
                        <div key={tech.id} className={`${styles.techCard} ${index === 0 ? styles.topMatch : ''}`}>
                            {index === 0 && <div className={styles.topMatchLabel}>BEST MATCH</div>}

                            <div className={styles.techInfo}>
                                <div className={styles.techAvatar}>{tech.name.charAt(0)}</div>
                                <div>
                                    <h4 className={styles.techName}>{tech.name}</h4>
                                    <div className={styles.techContractor}>{tech.contractor} • <Phone size={10} style={{ display: 'inline', marginLeft: '4px' }} /> +31 {10000000 + (tech.name.length * 1234567 + (tech.contractor ? tech.contractor.length : 5) * 7654321) % 80000000}</div>
                                    <div className={styles.techStars}>★ {(5 - tech.avgMttrHours * 0.5).toFixed(1)} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>{Math.floor(tech.id.length * 7)} Jobs Completed</span></div>
                                </div>
                            </div>

                            <div className={styles.techDetails}>
                                <div className={styles.techCertRow}>
                                    <CheckCircle size={14} color="#3b82f6" /> {tech.certs.split(',')[0]}
                                </div>
                                <div className={styles.techStatus}>
                                    <div className={styles.dotArray}></div> {tech.isAvailable ? 'Available Now' : 'Busy'}
                                </div>
                                <div className={styles.techRoute}>
                                    <MapPin size={14} color="var(--color-text-secondary)" />
                                    {tech.dist.toFixed(1)} km away (Est. {tech.etaStr})
                                </div>
                            </div>

                            <div className={styles.techScoreArea}>
                                <div className={styles.scoreCircle}>
                                    <span>{tech.score}%</span>
                                </div>
                                <button
                                    className={styles.assignBtn}
                                    onClick={() => handleAssign(tech.id)}
                                    disabled={assigned !== null}
                                >
                                    {assigned === tech.id ? 'Assigning...' : 'Assign →'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            */}
        </div>
    );
}
