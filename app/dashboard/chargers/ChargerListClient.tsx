'use client';

import { useState } from 'react';
import styles from './chargers.module.css';
import { Search, Filter, MapPin, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/app/components/Map'), {
    ssr: false,
    loading: () => (
        <div className={styles.mapPlaceholder}>
            <MapPin size={48} color="var(--color-text-secondary)" opacity={0.5} />
            <p>Loading Map...</p>
        </div>
    )
});

type Charger = {
    id: string;
    stationId: string;
    brand: string;
    model: string;
    status: string;
    country: string;
    city: string;
    slaTier: string;
    powerKw: number;
    connectorType: string;
    lat: number;
    lng: number;
};

export default function ChargerListClient({ initialChargers }: { initialChargers: Charger[] }) {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<keyof Charger>('stationId');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: keyof Charger) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredChargers = initialChargers
        .filter(c => {
            if (filter !== 'All' && c.status !== filter && c.country !== filter) return false;
            if (search && !c.stationId.toLowerCase().includes(search.toLowerCase()) && !c.city.toLowerCase().includes(search.toLowerCase())) return false;
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
        <div className={styles.container}>
            {/* Top Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.icon} />
                    <input
                        type="text"
                        placeholder="Search by Station ID or City..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.filters}>
                    <button className={filter === 'All' ? styles.btnActive : styles.btn} onClick={() => setFilter('All')}>All</button>
                    <button className={filter === 'Faulted' ? styles.btnActive : styles.btn} onClick={() => setFilter('Faulted')}>Faulted</button>
                    <button className={filter === 'Offline' ? styles.btnActive : styles.btn} onClick={() => setFilter('Offline')}>Offline</button>
                    <div className={styles.divider}></div>
                    <button className={filter === 'DE' ? styles.btnActive : styles.btn} onClick={() => setFilter('DE')}>Germany</button>
                    <button className={filter === 'NL' ? styles.btnActive : styles.btn} onClick={() => setFilter('NL')}>Netherlands</button>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Table View */}
                <div className={styles.tablePanel}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                    Status {sortKey === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('stationId')} style={{ cursor: 'pointer' }}>
                                    Station ID {sortKey === 'stationId' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('city')} style={{ cursor: 'pointer' }}>
                                    Location {sortKey === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('powerKw')} style={{ cursor: 'pointer' }}>
                                    Brand / Power {sortKey === 'powerKw' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>SLA Tier</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChargers.map(charger => (
                                <tr key={charger.id} className={styles.tr}>
                                    <td>
                                        {charger.status === 'Available' ? <CheckCircle color="#10b981" size={18} /> :
                                            charger.status === 'Faulted' ? <AlertTriangle color="#ef4444" size={18} /> :
                                                <Zap color="#f59e0b" size={18} />}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{charger.stationId}</td>
                                    <td>{charger.city}, {charger.country}</td>
                                    <td>{charger.brand} ({charger.powerKw}kW)</td>
                                    <td>
                                        <span className={styles.badge}>{charger.slaTier}</span>
                                    </td>
                                    <td>
                                        <a href={`/dashboard/chargers/${charger.id}`} className={styles.linkBtn}>Details</a>
                                    </td>
                                </tr>
                            ))}
                            {filteredChargers.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                        No chargers found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Map Placeholder */}
                <div className={styles.mapPanel}>
                    <MapComponent chargers={filteredChargers} />
                </div>
            </div>
        </div>
    );
}
