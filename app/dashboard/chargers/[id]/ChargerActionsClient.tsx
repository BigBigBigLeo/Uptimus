'use client';

import { useState } from 'react';
import styles from './detail.module.css';
import { Loader2 } from 'lucide-react';

export default function ChargerActionsClient({ chargerId, status }: { chargerId: string, status: string }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const handleTriage = async () => {
        setLoading(true);
        setMsg('Step 1: Establishing remote connection to unit...');

        try {
            await new Promise(r => setTimeout(r, 1200));
            setMsg('Step 2: Sending Soft Reset command to power module...');

            await new Promise(r => setTimeout(r, 1500));
            setMsg('Error: Hardware response timeout from module A.');

            await new Promise(r => setTimeout(r, 1500));
            setMsg('Auto-creating physical dispatch ticket based on SLA...');

            const res = await fetch('/api/triage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chargerId })
            });
            const data = await res.json();

            if (data.success) {
                if (data.ticket) {
                    setMsg('Dispatch ticket created. Redirecting to AI Smart Dispatch Engine...');
                    setTimeout(() => {
                        window.location.href = `/dashboard/dispatch?ticketId=${data.ticket.id}`;
                    }, 1500);
                } else {
                    setMsg(data.triageResult);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        } catch (err) {
            setMsg('Failed to reach triage API');
        }
        setLoading(false);
    };

    return (
        <div className="animate-enter">
            <div className={styles.actions}>
                <button
                    className={styles.btnSecondary}
                    onClick={handleTriage}
                    disabled={loading || status !== 'Faulted'}
                >
                    {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Loader2 size={16} className="animate-spin" /> Diagnostic Override...</span> : 'Soft Reset'}
                </button>
                <button className={styles.btnSecondary} disabled={status === 'Faulted'}>Unlock Connector</button>
                <button className={styles.btnSecondary} disabled={status === 'Faulted'}>Clear Faults</button>
            </div>
            {msg && <div style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: '12px', fontWeight: 500 }}>{msg}</div>}
        </div>
    );
}
