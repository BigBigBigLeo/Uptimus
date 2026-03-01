"use client";

import styles from './page.module.css';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock, ShieldCheck, Cpu } from 'lucide-react';

const UPTIME_DATA = [
    { name: 'Mon', uptime: 98.2, prediction: 98.1 },
    { name: 'Tue', uptime: 98.5, prediction: 98.4 },
    { name: 'Wed', uptime: 98.1, prediction: 98.3 },
    { name: 'Thu', uptime: 98.4, prediction: 98.5 },
    { name: 'Fri', uptime: 98.8, prediction: 98.7 },
    { name: 'Sat', uptime: 99.1, prediction: 98.9 },
    { name: 'Sun', uptime: 99.3, prediction: 99.2 },
];

const SLA_DATA = [
    { name: 'Northeast', met: 94, missed: 6 },
    { name: 'Southeast', met: 88, missed: 12 },
    { name: 'Midwest', met: 96, missed: 4 },
    { name: 'West Coast', met: 91, missed: 9 },
    { name: 'Southwest', met: 85, missed: 15 },
];

const FAULT_DATA = [
    { name: 'Cooling Sys', value: 35 },
    { name: 'RFID/Auth', value: 25 },
    { name: 'Power Mod', value: 20 },
    { name: 'Network', value: 15 },
    { name: 'Other', value: 5 },
];

const RISK_PROFILE_DATA = [
    { name: 'Healthy (No Action)', value: 65 },
    { name: 'Monitor (Low Risk)', value: 22 },
    { name: 'Triaged (Med Risk)', value: 9 },
    { name: 'Auto-Replace (High Risk)', value: 4 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const RISK_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Network Intelligence</h1>
                    <p className={styles.subtitle}>Deep-dive analytics on asset reliability, contractor SLAs, and proactive telemetry.</p>
                </div>
            </div>

            {/* AI Execution Flow Section */}
            <div className={styles.aiFlowContainer}>
                <h3 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Cpu size={20} color="#8b5cf6" />
                    AI Execution Flow (Last 30 Days)
                </h3>
                <div className={styles.aiFlowList}>
                    <div className={styles.aiFlowCard}>
                        <div className={styles.aiFlowIcon} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Activity size={24} />
                        </div>
                        <div className={styles.aiFlowContent}>
                            <h4>Anomalies Detected</h4>
                            <div className={styles.aiFlowValue}>2,419</div>
                            <p>Raw telemetry flags</p>
                        </div>
                    </div>

                    <div className={styles.aiFlowStep}>→</div>

                    <div className={styles.aiFlowCard}>
                        <div className={styles.aiFlowIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <Clock size={24} />
                        </div>
                        <div className={styles.aiFlowContent}>
                            <h4>Auto-Triaged</h4>
                            <div className={styles.aiFlowValue}>1,842</div>
                            <p>Filtered noise vs real faults</p>
                        </div>
                    </div>

                    <div className={styles.aiFlowStep}>→</div>

                    <div className={styles.aiFlowCard}>
                        <div className={styles.aiFlowIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <div className={styles.aiFlowContent}>
                            <h4>Smart Dispatches</h4>
                            <div className={styles.aiFlowValue}>341</div>
                            <p>Truck rolls initiated</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.chartGrid}>
                {/* Uptime Trend Line Chart */}
                <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
                    <h3>Network Uptime vs. AI Prediction model</h3>
                    <p className="subtitle-sm" style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>Historic trailing 7-day uptime mapped against Uptimus predictive modeling.</p>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={UPTIME_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                                <YAxis domain={[95, 100]} stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="uptime" stroke="#10b981" name="Actual Uptime" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="prediction" stroke="#8b5cf6" name="AI Prediction" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SLAs Met Bar Chart */}
                <div className={styles.chartCard}>
                    <h3>Contractor SLA Performance</h3>
                    <p className="subtitle-sm" style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>Regional compliance rates for 48-hour MTTR</p>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={SLA_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Bar dataKey="met" stackId="a" fill="#3b82f6" name="SLA Met" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="missed" stackId="a" fill="#ef4444" name="SLA Missed" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Fault Categories Pie Chart */}
                <div className={styles.chartCard}>
                    <h3>Hardware Fault Distribution</h3>
                    <p className="subtitle-sm" style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>Root cause analysis breakdown by component layer</p>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={FAULT_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: 'var(--color-text-secondary)' }}
                                >
                                    {FAULT_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Predictive Maintenance Risk Profile */}
                <div className={styles.chartCard}>
                    <h3>Asset Replacement Risk Profile</h3>
                    <p className="subtitle-sm" style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>AI-driven health scoring across the network fleet</p>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={RISK_PROFILE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {RISK_PROFILE_DATA.map((entry, index) => (
                                        <Cell key={`risk-cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-surface-hover)', borderRadius: '8px' }}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
