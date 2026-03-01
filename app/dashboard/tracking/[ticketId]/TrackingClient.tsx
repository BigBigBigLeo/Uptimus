'use client';

import { useState, useEffect } from 'react';
import { calculateDistance, calculateETA } from '@/lib/routing';
import { AlertTriangle, Clock, MapPin, Truck, CheckCircle2, ShieldAlert, BrainCircuit, Wrench, FileCheck, Phone, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/app/components/Map'), {
    ssr: false,
    loading: () => <div style={{ height: '400px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>Initializing geospatial data...</div>
});

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Open': return '#ef4444';
        case 'Assigned': return '#3b82f6';
        case 'En Route': return '#f59e0b';
        case 'On Site': return '#8b5cf6';
        case 'Completed':
        case 'Closed': return '#10b981';
        default: return '#afb2b5';
    }
};

// Mock some AI insights based on fault code for the timeline
const getAiInsights = (faultCode: string) => {
    if (faultCode?.includes('TEMP') || faultCode?.includes('COOL')) {
        return { parts: 'Thermal Sensor Assy, Coolant 1L', tools: 'Thermal Imager', prob: '92%' };
    }
    if (faultCode?.includes('NACS') || faultCode?.includes('CABLE')) {
        return { parts: 'NACS Liquid Cable Variant C', tools: 'Torque Wrench, Fluke DMM', prob: '88%' };
    }
    return { parts: 'Standard Diagnostics Kit', tools: 'L2 Toolkit', prob: '75%' };
};

export default function TrackingClient({ ticket }: { ticket: any }) {
    const [mounted, setMounted] = useState(false);
    const [techLocation, setTechLocation] = useState({ lat: ticket.technician?.lat || ticket.charger.lat, lng: ticket.technician?.lng || ticket.charger.lng });
    const [status, setStatus] = useState(ticket.status);

    useEffect(() => {
        setMounted(true);
        if (status === 'Completed' || status === 'Closed' || !ticket.technician) return;

        const interval = setInterval(() => {
            fetch('/api/simulate/tick')
                .then(() => fetch(`/api/ticket/${ticket.id}`))
                .then(res => res.json())
                .then(data => {
                    if (data && data.ticket && data.ticket.technician) {
                        setTechLocation({ lat: data.ticket.technician.lat, lng: data.ticket.technician.lng });
                        setStatus(data.ticket.status);
                    }
                });
        }, 5000);

        return () => clearInterval(interval);
    }, [ticket.id, status, ticket.technician]);

    const target = ticket.charger;

    let dist = 0;
    let eta = { formatted: 'N/A' };

    if (ticket.technician) {
        dist = calculateDistance(techLocation.lat, techLocation.lng, target.lat, target.lng);
        eta = calculateETA(dist);
    }

    const chargersForMap = [
        { id: target.id, stationId: target.stationId, brand: target.brand, city: target.city, lat: target.lat, lng: target.lng, status: status === 'Closed' || status === 'Completed' ? 'Online' : 'Faulted' }
    ];
    const techniciansForMap = ticket.technician ? [
        {
            id: ticket.technician.id,
            name: ticket.technician.name,
            contractor: ticket.technician.contractor,
            isAvailable: false,
            lat: techLocation.lat,
            lng: techLocation.lng
        }
    ] : [];

    const aiInfo = getAiInsights(ticket.faultCode || '');

    // Create logical timeline dates based on ticket actual timestamps
    const createdDate = new Date(ticket.createdAt);
    const updatedDate = new Date(ticket.updatedAt);

    // Simulate events after creation:
    const triageDate = new Date(createdDate.getTime() + 1000 * 60 * 1); // 1 min after fault
    const dispatchDate = new Date(createdDate.getTime() + 1000 * 60 * 15); // 15 mins after fault
    const enRouteDate = new Date(createdDate.getTime() + 1000 * 60 * 22); // 22 mins after fault

    // On-site 45 min prior to completion, or current time if active
    const completedOrClosed = status === 'Completed' || status === 'Closed';
    const onSiteDate = completedOrClosed ? new Date(updatedDate.getTime() - 1000 * 60 * 45) : new Date(Date.now() - 1000 * 60 * 5);

    const telemetryLogs = ticket.charger?.telemetryLogs || [];
    const finalReport = telemetryLogs.length > 0 ? telemetryLogs[0].details : 'Issue resolved remotely and parts verified via AI dispatch manifest. Status marked nominal.';

    const formatSlaTime = (dateStr: string) => {
        if (!mounted) return '--:--';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatTimelineTime = (dateObj: Date | null, isActive: boolean) => {
        if (!mounted) return '--:--';
        if (!isActive || !dateObj) return 'Pending';
        const d = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const t = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${d} • ${t}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
    };

    // Determine timeline step progression
    const steps = ['Open', 'Assigned', 'En Route', 'On Site', 'Completed', 'Closed'];
    const currentStepIndex = steps.indexOf(status) !== -1 ? steps.indexOf(status) : 0;

    const timelineItems = [
        {
            title: 'Fault Detected & Ticket Created',
            icon: <ShieldAlert size={20} />,
            color: '#ef4444',
            time: formatTimelineTime(createdDate, currentStepIndex >= 0),
            active: currentStepIndex >= 0,
            content: (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong style={{ color: '#f8fafc' }}>Charger:</strong> {target.stationId} ({target.brand} {target.model})</div>
                    <div><strong style={{ color: '#ef4444' }}>Fault Code Trigger:</strong> {ticket.faultCode || 'ERR_UNKNOWN'}</div>
                    <div><strong style={{ color: '#f8fafc' }}>SLA Requirement:</strong> Tier {target.slaTier} - Deadline: {formatSlaTime(ticket.slaDeadline)}</div>
                </div>
            )
        },
        {
            title: 'AI Smart Triage',
            icon: <BrainCircuit size={20} />,
            color: '#8b5cf6',
            time: formatTimelineTime(triageDate, currentStepIndex >= 0),
            active: currentStepIndex >= 0,
            content: (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(139, 92, 246, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <div><strong style={{ color: '#c4b5fd' }}>Diagnostic Insight:</strong> Pattern match found. Proceeding with remote orchestration.</div>
                    <div><strong style={{ color: '#c4b5fd' }}>Confidence Score:</strong> {aiInfo.prob}</div>
                    <div><strong style={{ color: '#c4b5fd' }}>Required Parts Manifest:</strong> {aiInfo.parts}</div>
                    <div><strong style={{ color: '#c4b5fd' }}>Required Tools:</strong> {aiInfo.tools}</div>
                </div>
            )
        },
        {
            title: 'Technician Dispatched',
            icon: <Truck size={20} />,
            color: '#3b82f6',
            time: formatTimelineTime(dispatchDate, currentStepIndex >= 1),
            active: currentStepIndex >= 1,
            content: ticket.technician ? (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong style={{ color: '#f8fafc' }}>Resource Assigned:</strong> {ticket.technician.name}</div>
                    <div><strong style={{ color: '#f8fafc' }}>Contractor Unit:</strong> {ticket.technician.contractor}</div>
                    <div><strong style={{ color: '#f8fafc' }}>Verified Qualifications:</strong> {ticket.technician.certs}</div>
                    <div><strong style={{ color: '#f8fafc' }}>Briefing:</strong> Digital fault dossier and repair orchestration guide transmitted to technician device.</div>
                </div>
            ) : (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Awaiting contractor acceptance in local pool...</div>
            )
        },
        {
            title: 'Live Tracking (En Route)',
            icon: <MapPin size={20} />,
            color: '#f59e0b',
            time: formatTimelineTime(enRouteDate, currentStepIndex >= 2),
            active: currentStepIndex >= 2,
            content: currentStepIndex >= 2 && ticket.technician ? (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 600 }}>Technician has acknowledged assignment and is navigating to site.</div>
                    {currentStepIndex <= 3 && (
                        <div style={{ display: 'flex', gap: '16px', backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <div><strong style={{ color: '#f59e0b' }}>Distance Remaining:</strong> {dist.toFixed(1)} km</div>
                            <div><strong style={{ color: '#f59e0b' }}>Est. Arrival:</strong> {eta.formatted}</div>
                        </div>
                    )}
                </div>
            ) : null
        },
        {
            title: 'On-Site Diagnostic & Repair',
            icon: <Wrench size={20} />,
            color: '#14b8a6',
            time: formatTimelineTime(onSiteDate, currentStepIndex >= 3),
            active: currentStepIndex >= 3,
            content: currentStepIndex >= 3 ? (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {currentStepIndex >= 4 ? 'Repair actions logged and telemetry validated against central manifest.' : 'Technician arrived. Currently executing locked-out repair protocol.'}
                    <div style={{ marginTop: '6px' }}><strong>Status:</strong> {currentStepIndex >= 4 ? 'Complete' : 'Working'}</div>
                </div>
            ) : null
        },
        {
            title: 'Resolution & QC Check',
            icon: <CheckCircle2 size={20} />,
            color: '#10b981',
            time: formatTimelineTime(updatedDate, currentStepIndex >= 4),
            active: currentStepIndex >= 4,
            content: currentStepIndex >= 4 ? (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div><strong style={{ color: '#6ee7b7' }}>Charger State Check:</strong> <span style={{ color: '#10b981', fontWeight: 600 }}>Online</span></div>
                        <div><strong style={{ color: '#6ee7b7' }}>SLA Target Met:</strong> <span style={{ color: '#10b981', fontWeight: 600 }}>Yes</span></div>
                    </div>
                    <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <strong style={{ color: '#6ee7b7' }}>Technician / Orchestration Report:</strong><br />
                        <span style={{ fontStyle: 'italic' }}>{finalReport}</span>
                    </div>
                </div>
            ) : null
        }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 2fr', gap: 'var(--spacing-xl)', minHeight: '800px', alignItems: 'start' }}>
            {/* Left Side: Timeline Log */}
            <div style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', padding: 'var(--spacing-xl)', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Ticket Log History
                        <span style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>#{ticket.id.slice(-6).toUpperCase()}</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
                        Comprehensive audit log tracking all AI triggers, remote commands, field execution steps, and resolution timestamps for this service incident.
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: `rgba(${getStatusColor(status) === '#ef4444' ? '239, 68, 68' : getStatusColor(status) === '#3b82f6' ? '59, 130, 246' : getStatusColor(status) === '#f59e0b' ? '245, 158, 11' : getStatusColor(status) === '#8b5cf6' ? '139, 92, 246' : '16, 185, 129'}, 0.1)`, border: `1px solid ${getStatusColor(status)}33`, color: getStatusColor(status), padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getStatusColor(status) }}></div>
                        TICKET STATUS: {status.toUpperCase()}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
                    {/* Timeline Line background */}
                    <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', backgroundColor: 'var(--color-surface-hover)', zIndex: 0 }}></div>

                    {timelineItems.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '20px', paddingBottom: index === timelineItems.length - 1 ? '0' : '32px', position: 'relative', zIndex: 1, opacity: item.active ? 1 : 0.4 }}>
                            <div style={{ width: '48px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: item.active ? `${item.color}22` : 'var(--color-surface-hover)', border: `2px solid ${item.active ? item.color : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.active ? item.color : 'var(--color-text-secondary)', zIndex: 2 }}>
                                    {item.icon}
                                </div>
                            </div>
                            <div style={{ flex: 1, paddingTop: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: item.active ? '#fff' : 'var(--color-text-secondary)', margin: 0 }}>{item.title}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '2px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{item.time}</span>
                                </div>
                                {item.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Map and Info Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                {/* Embedded Map */}
                <div style={{ height: '450px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
                    <MapComponent chargers={chargersForMap} technicians={techniciansForMap} />
                </div>

                {/* Technician Contact Card (if assigned) */}
                {ticket.technician && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                        <div style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', padding: 'var(--spacing-lg)', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                {ticket.technician.imageUrl ? (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(59, 130, 246, 0.5)' }}>
                                        <img src={ticket.technician.imageUrl} alt={ticket.technician.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                        <Phone size={20} />
                                    </div>
                                )}
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Field Contact</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Direct access to technician</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Name</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ticket.technician.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Phone</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#3b82f6' }}>{ticket.technician.contactPhone || '(800) 555-0199'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Avg. MTTR</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ticket.technician.avgMttrHours} hrs</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', padding: 'var(--spacing-lg)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '16px' }}>
                                <Info size={24} />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Field Service App</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                                View the real-time interface used by the field technician to diagnose, log parts, and validate the repair.
                            </p>
                            <button onClick={() => window.open(`/technician/${ticket.id}`, '_blank')} style={{ padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'filter 0.2s' }}>
                                Launch Tech Device View
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
