'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, UploadCloud, Tag, FileText, Zap, AlertTriangle, MapPin, Camera, Cpu, Image as ImageIcon, MessageSquare, Wrench } from 'lucide-react';
import styles from './technician.module.css';

export default function TechnicianClient({ ticket }: { ticket: any }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const [activeStep, setActiveStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const [rootCauseSystem, setRootCauseSystem] = useState<string | null>(null);
    const [rootCauseMode, setRootCauseMode] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [photoUploaded, setPhotoUploaded] = useState(false);
    const [jobCompleted, setJobCompleted] = useState(false);

    // Dynamic AI Copilot Dialog based on fault code
    const formatFaultCode = ticket.faultCode || 'ERR_UNKNOWN';
    const isCooling = formatFaultCode.includes('TEMP') || formatFaultCode.includes('COOL');
    const isCable = formatFaultCode.includes('NACS') || formatFaultCode.includes('CABLE');

    const [copilotMessages, setCopilotMessages] = useState([
        { role: 'ai', text: `Based on the active ${formatFaultCode} logs, I have synthesized a repair plan. Probability of success is high if you follow the diagnostic tree.` },
        {
            role: 'ai', text: isCooling
                ? 'The thermal sensor near the liquid pump is reporting 95°C. Check the coolant reservoir level first. If normal, the pump relay is likely stuck.'
                : isCable
                    ? 'Resistance on the DC+ pin is reading infinite. This indicates a severed contact or arc damage within the handle. Visual inspection of the cable NACS adapter is required.'
                    : 'Primary AC/DC converter board indicates an under-voltage string. Please verify the voltage across terminals T1 and T2 before replacing.'
        }
    ]);
    const [chatInput, setChatInput] = useState('');

    const handleCopilotSend = () => {
        if (!chatInput.trim()) return;
        setCopilotMessages([...copilotMessages, { role: 'user', text: chatInput }]);
        const query = chatInput.toLowerCase();
        setChatInput('');

        // Simulate AI response
        setTimeout(() => {
            let aiResponse = "I've logged that measurement. Proceed to the next step in the execution flow.";
            if (query.includes('voltage') || query.includes('volt')) aiResponse = 'Voltage matches the expected 480V 3-phase supply. The issue is definitively downstream in the conversion module.';
            if (query.includes('coolant') || query.includes('fluid') || query.includes('level')) aiResponse = 'If the coolant is below the MIN line, top up using ONLY specified Glycol mixture. Do not substitute.';
            if (query.includes('pin') || query.includes('contact')) aiResponse = 'If pin damage is visible, the entire cable assembly must be replaced. Do not attempt field splicing.';

            setCopilotMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
        }, 1000);
    };

    const steps = [
        { id: 1, title: 'Safety Isolation & LOTO', desc: 'Verify zero voltage on DC bus bars. Lock out site breaker.', requiresUpload: false, image: null },
        { id: 2, title: 'Visual Inspection & Documentation', desc: 'Examine internal components for arc flash or burn marks.', requiresUpload: true, image: '/ev_charger_internals.png' },
        { id: 3, title: isCooling ? 'Coolant System Bleed' : isCable ? 'Cable Assembly Swap' : 'Power Module Replacement', desc: 'Follow torque specifications on all terminals.', requiresUpload: false, image: null },
        { id: 4, title: 'Firmware Diagnostics', desc: 'Run diagnostic suite and clear active faults.', requiresUpload: false, image: null },
        { id: 5, title: 'Final Charge Test', desc: 'Initiate 5min active session via test vehicle or dummy load.', requiresUpload: false, image: null }
    ];

    const primarySystems = ['Power Module', 'Cooling System', 'HMI / Screen', 'Cable Management', 'Networking Gateway'];
    const failureModes = ['Blown Fuse', 'Overheating', 'Software Glitch', 'Vandalism', 'Wear & Tear', 'Component Failure'];

    const completeStep = (id: number) => {
        if (!completedSteps.includes(id)) {
            setCompletedSteps([...completedSteps, id]);
        }
        if (activeStep < steps.length) {
            setActiveStep(activeStep + 1);
        }
    };

    const submitJob = async () => {
        try {
            const res = await fetch('/api/ticket/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: ticket.id,
                    rootCauseSystem,
                    rootCauseMode,
                    notes
                })
            });

            const data = await res.json();
            if (data.success) setJobCompleted(true);
        } catch (err) {
            console.error('Failed to submit job:', err);
        }
    };

    if (jobCompleted) {
        return (
            <div className={styles.successScreen} style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <Check size={48} color="#10b981" />
                </div>
                <h2>Job Completed Successfully</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Asset <strong>{ticket.charger.stationId}</strong> has been marked Available and SLA constraints are met.</p>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '0.85rem' }}>QC Report has been transmitted to network operations.</p>
                <button className={styles.btnPrimary} style={{ marginTop: '32px', maxWidth: '200px' }} onClick={() => window.close()}>Close Tech Overlay</button>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {/* LEFT COLUMN: Checklist & Tags */}
            <div className={styles.leftCol}>
                <div className={styles.assetHeader}>
                    <div className={styles.assetIcon}><Zap size={24} color="#3b82f6" /></div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>{ticket.charger.brand} {ticket.charger.model}</h1>
                            <span className={styles.badge}>STATION {ticket.charger.stationId}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', marginTop: '6px' }}>
                            <MapPin size={14} style={{ marginRight: '4px' }} /> {ticket.charger.city}, {ticket.charger.country} •
                            <span style={{ color: '#ef4444', marginLeft: '8px', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                                <AlertTriangle size={14} style={{ marginRight: '4px' }} /> {ticket.faultCode}
                            </span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', paddingLeft: '24px', borderLeft: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>SLA REMAINING</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={18} /> 03:59:12
                        </div>
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Wrench size={18} color="#3b82f6" /> ORCHESTRATED EXECUTION FLOW</h3>
                        <span className={styles.pillBlue} style={{ fontSize: '0.75rem' }}>STEP {Math.max(1, activeStep)} OF {steps.length}</span>
                    </div>

                    <div className={styles.stepList}>
                        {steps.map(step => {
                            const isCompleted = completedSteps.includes(step.id);
                            const isActive = activeStep === step.id;

                            return (
                                <div key={step.id} className={`${styles.stepCard} ${isActive ? styles.stepActive : ''}`}>
                                    <div className={styles.stepCheckbox} onClick={() => isActive && completeStep(step.id)}>
                                        {isCompleted && <Check size={16} color="#fff" />}
                                    </div>
                                    <div className={styles.stepContent}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ fontWeight: isActive ? 600 : 500, color: isCompleted ? 'var(--color-text-secondary)' : '#f8fafc', margin: 0 }}>{step.title}</h4>
                                            {isCompleted && <span className={styles.pillGreen}>✓ Done</span>}
                                            {isActive && !isCompleted && <span className={styles.pillBlue}>ACTIVE</span>}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>{step.desc}</p>

                                        {step.image && (isActive || isCompleted) && (
                                            <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                                <img src={step.image} alt="Reference Photo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                            </div>
                                        )}

                                        {isActive && step.requiresUpload && (
                                            <button className={styles.btnSecondary} style={{ marginTop: '16px' }}>
                                                <UploadCloud size={16} /> Capture Serial Number Barcode
                                            </button>
                                        )}

                                        {isActive && (
                                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                                <button className={styles.btnPrimary} style={{ width: 'auto', padding: '8px 24px', fontSize: '0.85rem' }} onClick={() => completeStep(step.id)}>
                                                    Mark Complete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Tag size={18} color="#8b5cf6" /> ROOT CAUSE TAGGING</h3>
                    </div>

                    <div style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '12px', letterSpacing: '0.05em' }}>PRIMARY SYSTEM</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {primarySystems.map(sys => (
                                    <button key={sys} className={rootCauseSystem === sys ? styles.tagActive : styles.tag} onClick={() => setRootCauseSystem(sys)}>
                                        {sys}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '12px', letterSpacing: '0.05em' }}>FAILURE MODE</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {failureModes.map(mode => (
                                    <button key={mode} className={rootCauseMode === mode ? styles.tagActiveBlue : styles.tag} onClick={() => setRootCauseMode(mode)}>
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '12px', letterSpacing: '0.05em' }}>TECHNICIAN NOTES</div>
                        <textarea
                            className={styles.textarea}
                            placeholder="Enter detailed repair notes, parts consumed, and any observations for the network operations center..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Docs & Copilot */}
            <div className={styles.rightCol}>

                {/* Embedded Live Site Cam utilizing the generated image */}
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Camera size={18} color="#10b981" /> LIVE SITE CAM</h3>
                    </div>
                    <div style={{ padding: '16px' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                            <img src="/ev_charger_live_cam.png" alt="Live Charger Feed" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }}></div>

                            <span style={{ position: 'absolute', top: 12, right: 12, color: '#ef4444', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 2s infinite' }} /> LIVE
                            </span>
                            <div style={{ position: 'absolute', bottom: 12, left: 12, color: '#e2e8f0', fontSize: '11px', fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
                                CAM_02_{ticket.charger.stationId} • 1080p • {mounted ? new Date().toLocaleTimeString() : '--:--:--'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Copilot Simulator */}
                <div className={styles.panel} style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
                    <div className={styles.panelHeader}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Cpu size={18} color="#f59e0b" /> UPTIMUS COPILOT</h3>
                        <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></div> Online</span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {copilotMessages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'ai' ? 'row' : 'row-reverse' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: msg.role === 'ai' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {msg.role === 'ai' ? <Cpu size={16} color="#3b82f6" /> : <MessageSquare size={16} color="#10b981" />}
                                </div>
                                <div style={{ backgroundColor: msg.role === 'ai' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${msg.role === 'ai' ? 'var(--glass-border)' : 'rgba(16, 185, 129, 0.3)'}`, padding: '12px 16px', borderRadius: '12px', borderTopLeftRadius: msg.role === 'ai' ? '4px' : '12px', borderTopRightRadius: msg.role === 'user' ? '4px' : '12px', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, maxWidth: '85%' }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="Ask Copilot about voltages, specs, or procedures..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
                                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none', backgroundColor: 'rgba(30, 41, 59, 0.6)', color: '#fff', fontSize: '0.85rem' }}
                            />
                            <button className={styles.btnSecondary} onClick={handleCopilotSend} style={{ padding: '0 16px', color: '#3b82f6' }}>Send</button>
                        </div>
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><FileText size={18} color="#ec4899" /> DOCUMENTATION</h3>
                    </div>
                    <div className={styles.docList}>
                        <div className={styles.docItem}>
                            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>PDF</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{ticket.charger.brand} Service Manual</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>v2.4 • 12MB</div>
                            </div>
                        </div>
                        <div className={styles.docItem}>
                            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>SCH</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>Wiring Diagram - {ticket.charger.model}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Schematic A4</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Check size={18} color="#10b981" /> JOB COMPLETION SIGN-OFF</h3>
                    </div>
                    <div style={{ padding: '24px', textAlign: 'center' }}>

                        {!photoUploaded ? (
                            <button
                                className={styles.btnSecondary}
                                style={{ width: '100%', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: '14px' }}
                                onClick={() => setPhotoUploaded(true)}
                            >
                                <ImageIcon size={18} /> Upload Repair Evidence Photo
                            </button>
                        ) : (
                            <div style={{ width: '100%', marginBottom: '20px', padding: '14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <Check size={18} /> Evidence Uploaded
                            </div>
                        )}

                        <button
                            className={styles.btnPrimary}
                            disabled={completedSteps.length < steps.length || !rootCauseSystem || !rootCauseMode || !photoUploaded}
                            onClick={submitJob}
                            style={{
                                opacity: (completedSteps.length < steps.length || !rootCauseSystem || !rootCauseMode || !photoUploaded) ? 0.5 : 1,
                                cursor: (completedSteps.length < steps.length || !rootCauseSystem || !rootCauseMode || !photoUploaded) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Complete & Sign-Off Ticket
                        </button>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '16px', lineHeight: 1.5 }}>
                            By signing off, you certify all checks passed and the charger is safe to energize.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
