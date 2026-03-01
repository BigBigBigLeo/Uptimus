'use client';

import { useState } from 'react';
import { X, Phone, Mail, MapPin, Award, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/app/components/Map'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>
});

export default function TechnicianListClient({ technicians }: { technicians: any[] }) {
    const [selectedTech, setSelectedTech] = useState<any | null>(null);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredTechs = technicians
        .filter(t => {
            if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.contractor.toLowerCase().includes(search.toLowerCase()) && !t.city.toLowerCase().includes(search.toLowerCase())) return false;
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
        <div style={{ position: 'relative' }}>
            {/* Search Bar */}
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        placeholder="Search technicians by name, contractor, or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingLeft: '40px',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-surface-hover)',
                            borderRadius: '8px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-surface-hover)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-surface-hover)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                            <th onClick={() => handleSort('name')} style={{ padding: '16px', cursor: 'pointer' }}>
                                NAME {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('contractor')} style={{ padding: '16px', cursor: 'pointer' }}>
                                CONTRACTOR {sortKey === 'contractor' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('country')} style={{ padding: '16px', cursor: 'pointer' }}>
                                REGION {sortKey === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th style={{ padding: '16px' }}>CERTIFICATIONS</th>
                            <th onClick={() => handleSort('avgMttrHours')} style={{ padding: '16px', cursor: 'pointer' }}>
                                AVG MTTR {sortKey === 'avgMttrHours' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('isAvailable')} style={{ padding: '16px', cursor: 'pointer' }}>
                                STATUS {sortKey === 'isAvailable' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTechs.map((tech: any) => (
                            <tr
                                key={tech.id}
                                style={{ borderBottom: '1px solid var(--color-surface-hover)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                onClick={() => setSelectedTech(tech)}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td style={{ padding: '16px', fontWeight: 600 }}>{tech.name}</td>
                                <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>{tech.contractor}</td>
                                <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>{tech.country}</td>
                                <td style={{ padding: '16px', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {tech.certs.split(',').map((cert: string, i: number) => (
                                            <span key={i} style={{ backgroundColor: 'var(--color-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-surface-hover)' }}>{cert.trim()}</span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontWeight: 500 }}>{tech.avgMttrHours.toFixed(1)}h</td>
                                <td style={{ padding: '16px' }}>
                                    {tech.isAvailable
                                        ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></div> Available</span>
                                        : <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div> On Job</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedTech && (
                <>
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 900 }}
                        onClick={() => setSelectedTech(null)}
                    />
                    <div style={{
                        position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', backgroundColor: 'var(--color-surface)',
                        borderLeft: '1px solid var(--color-surface-hover)', zIndex: 1000, padding: '24px', overflowY: 'auto',
                        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', transform: 'translateX(0)', transition: 'transform 0.3s'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {selectedTech.imageUrl ? (
                                    <div style={{ width: '80px', height: '100px', backgroundColor: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-surface-hover)', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={selectedTech.imageUrl} alt={selectedTech.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '80px', height: '100px', backgroundColor: 'var(--color-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-secondary)', border: '1px solid var(--color-surface-hover)' }}>
                                        {selectedTech.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{selectedTech.name}</h2>
                                    <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                        <Award size={14} /> {selectedTech.contractor}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTech(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                                <Phone size={18} color="var(--color-text-secondary)" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>PHONE</div>
                                    <div>{selectedTech.contactPhone || '+31 6 1234 5678'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                                <Mail size={18} color="var(--color-text-secondary)" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>EMAIL</div>
                                    <div>{selectedTech.name.toLowerCase().replace(' ', '.')}@{selectedTech.contractor.toLowerCase().replace(' ', '')}.com</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                                <MapPin size={18} color="var(--color-text-secondary)" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>BASE LOCATION</div>
                                    <div>{selectedTech.city}, {selectedTech.country}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                                <MapPin size={18} color="#10b981" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>REAL-TIME LOCATION</div>
                                    <div>{selectedTech.street ? `${selectedTech.street}, ${selectedTech.city}` : `${selectedTech.city} Center`}</div>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--color-surface-hover)', paddingBottom: '8px' }}>Real-Time Location</h3>
                        <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--color-surface-hover)' }}>
                            <MapComponent technicians={[{
                                id: selectedTech.id,
                                isAvailable: selectedTech.isAvailable,
                                lat: selectedTech.lat,
                                lng: selectedTech.lng,
                                name: selectedTech.name,
                                contractor: selectedTech.contractor
                            }]} />
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--color-surface-hover)', paddingBottom: '8px' }}>Performance Snapshot</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-surface-hover)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>AVG MTTR</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {selectedTech.avgMttrHours.toFixed(1)}h <Clock size={16} color="#10b981" />
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-surface-hover)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>FIRST-TIME FIX</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>94%</div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--color-surface-hover)', paddingBottom: '8px' }}>Active Certifications</h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {selectedTech.certs.split(',').map((cert: string, i: number) => (
                                <span key={i} style={{ backgroundColor: 'var(--color-bg)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600 }}>{cert.trim()}</span>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
