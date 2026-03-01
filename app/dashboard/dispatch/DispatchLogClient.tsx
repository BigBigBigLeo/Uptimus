'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowUpDown, Clock, ExternalLink } from 'lucide-react';

type Ticket = {
    id: string;
    status: string;
    faultCode: string;
    slaDeadline: string;
    charger: {
        stationId: string;
        city: string;
    };
    technician?: {
        name: string;
        contractor: string;
        imageUrl?: string | null;
        certs: string;
    } | null;
};

export default function DispatchLogClient({ initialTickets }: { initialTickets: Ticket[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortKey, setSortKey] = useState<'id' | 'status' | 'deadline' | 'station' | 'technician'>('deadline');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredTickets = initialTickets.filter(ticket => {
        const matchesSearch = ticket.charger.stationId.toLowerCase().includes(search.toLowerCase()) ||
            ticket.id.toLowerCase().includes(search.toLowerCase()) ||
            ticket.charger.city.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const sortedTickets = [...filteredTickets].sort((a, b) => {
        let valA, valB;
        if (sortKey === 'id') {
            valA = a.id;
            valB = b.id;
        } else if (sortKey === 'status') {
            valA = a.status;
            valB = b.status;
        } else if (sortKey === 'station') {
            valA = a.charger.stationId;
            valB = b.charger.stationId;
        } else if (sortKey === 'technician') {
            valA = a.technician?.name || 'Z'; // Unassigned typically sorts to bottom
            valB = b.technician?.name || 'Z';
        } else {
            valA = new Date(a.slaDeadline).getTime();
            valB = new Date(b.slaDeadline).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleSort = (key: 'id' | 'status' | 'deadline' | 'station' | 'technician') => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>All Dispatched Tickets</h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{sortedTickets.length} results</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <input
                            type="text"
                            placeholder="Search station, city, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 12px 10px 36px',
                                backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--glass-border)',
                                borderRadius: '8px', color: '#fff', outline: 'none'
                            }}
                        />
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: '8px 12px', backgroundColor: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff'
                            }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Open">Open</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                        <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                            <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => toggleSort('id')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    TICKET ID <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => toggleSort('station')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    STATION <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => toggleSort('status')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    STATUS <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => toggleSort('technician')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    TECHNICIAN <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => toggleSort('deadline')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    SLA DEADLINE <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th style={{ padding: '16px 20px', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTickets.map((ticket) => (
                            <tr key={ticket.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 600 }}>#{ticket.id.slice(-6).toUpperCase()}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontWeight: 600 }}>{ticket.charger.stationId}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{ticket.charger.city}</div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: ticket.status === 'Open' ? 'rgba(239, 68, 68, 0.15)' : ticket.status === 'Assigned' ? 'rgba(245, 158, 11, 0.15)' : ticket.status === 'Closed' ? 'rgba(100, 116, 139, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                                        color: ticket.status === 'Open' ? '#ef4444' : ticket.status === 'Assigned' ? '#f59e0b' : ticket.status === 'Closed' ? '#94a3b8' : '#0ea5e9',
                                        border: `1px solid ${ticket.status === 'Open' ? 'rgba(239, 68, 68, 0.2)' : ticket.status === 'Assigned' ? 'rgba(245, 158, 11, 0.2)' : ticket.status === 'Closed' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(14, 165, 233, 0.2)'}`
                                    }}>
                                        {ticket.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    {ticket.technician ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {ticket.technician.imageUrl ? (
                                                <img src={ticket.technician.imageUrl} alt="Tech" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                            ) : (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                    {ticket.technician.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{ticket.technician.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{ticket.technician.contractor} • {ticket.technician.certs ? ticket.technician.certs.split(',')[0] : 'Certified'}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Unassigned</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 20px', color: ticket.status === 'Closed' ? 'var(--color-text-secondary)' : '#ef4444', fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} />
                                        {`${new Date(ticket.slaDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })} ${new Date(ticket.slaDeadline).getHours().toString().padStart(2, '0')}:${new Date(ticket.slaDeadline).getMinutes().toString().padStart(2, '0')}`}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                    {ticket.status === 'Open' ? (
                                        <Link href={`/dashboard/dispatch?ticketId=${ticket.id}`} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'filter 0.2s' }}>
                                            Dispatch
                                        </Link>
                                    ) : (
                                        <Link href={`/dashboard/tracking/${ticket.id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {ticket.status === 'Closed' ? 'View Log' : 'Track'} <ExternalLink size={14} />
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {
                    sortedTickets.length === 0 && (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            <p>No dispatches matching your current filters.</p>
                        </div>
                    )
                }
            </div >
        </div >
    );
}
