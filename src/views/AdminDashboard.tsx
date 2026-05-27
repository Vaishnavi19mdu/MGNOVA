/**
 * AdminDashboard.tsx
 * MGNOVA — Luxury AI-Assisted Freelance Collaboration Ecosystem
 * Admin Command Center — accessible only to users with isAdmin: true in Firestore
 *
 * FULLY RESPONSIVE: Mobile (< 640px), Tablet (640–1099px), Desktop (≥ 1100px)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ShieldAlert, ArrowLeftRight, Landmark,
  BarChart3, TrendingUp, MessageSquareWarning, DollarSign,
  Bell, Search, Menu, X, ChevronDown, LogOut, Settings,
  ChevronRight, AlertTriangle, CheckCircle2, Clock, Pause,
  Eye, Snowflake, Flag, Gavel, Download, FileText, RefreshCw,
  Activity, Zap, Filter, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  CircleDot, Shield, CreditCard, Star, Hash,
} from 'lucide-react';

import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection, query, where, onSnapshot, doc, getDoc,
  getDocs, updateDoc, serverTimestamp, orderBy, limit,
} from 'firebase/firestore';

// ─── Brand Palette ─────────────────────────────────────────────────────────────
const C = {
  ivory:       '#F7F3EE',
  coffee:      '#4B362F',
  gray:        '#999999',
  grayLight:   '#F0EDEA',
  green:       '#66806A',
  greenLight:  '#EEF3EF',
  greenMid:    '#D4E4D7',
  gold:        '#D4AF37',
  goldLight:   '#FBF5E0',
  goldMid:     '#F0E08A',
  copper:      '#7B4B3A',
  copperLight: '#F5EBE8',
  rodeo:       '#C7A19A',
  rodeoLight:  '#FBF4F2',
  red:         '#C0392B',
  redLight:    '#FDEAEA',
  white:       '#FFFFFF',
  sidebar:     '#2E211B',
  sidebarMid:  '#3A2920',
  sidebarText: '#EDE8E3',
  sidebarSub:  '#A89890',
  border:      'rgba(199,161,154,0.25)',
  shadow:      'rgba(75,54,47,0.10)',
} as const;

const FONT = "'Satoshi', -apple-system, sans-serif";

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ─── Responsive breakpoints ───────────────────────────────────────────────────
// mobile  < 640
// tablet  640–1099
// desktop ≥ 1100

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'overview',     label: 'Overview',         icon: LayoutDashboard },
  { key: 'users',        label: 'Users',             icon: Users },
  { key: 'fraud',        label: 'Fraud Monitoring',  icon: ShieldAlert },
  { key: 'transactions', label: 'Transactions',      icon: ArrowLeftRight },
  { key: 'escrow',       label: 'Escrow Audits',     icon: Landmark },
  { key: 'reports',      label: 'Reports',           icon: FileText },
  { key: 'analytics',    label: 'Analytics',         icon: BarChart3 },
  { key: 'disputes',     label: 'Disputes',          icon: MessageSquareWarning },
  { key: 'revenue',      label: 'Revenue',           icon: DollarSign },
  { key: 'notifications',label: 'Notifications',     icon: Bell },
  { key: 'settings',     label: 'Settings',          icon: Settings },
] as const;

type NavKey = typeof NAV_ITEMS[number]['key'];

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmt = {
  currency: (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(0)}`,
  percent: (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`,
  number:  (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
    : String(n),
  date: (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
};

// ─── Mini Sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:     { bg: C.greenLight,  color: C.green,  label: 'Active'     },
    completed:  { bg: C.greenLight,  color: C.green,  label: 'Completed'  },
    pending:    { bg: C.goldLight,   color: C.gold,   label: 'Pending'    },
    flagged:    { bg: C.redLight,    color: C.red,    label: 'Flagged'    },
    high:       { bg: C.redLight,    color: C.red,    label: 'High Risk'  },
    medium:     { bg: C.goldLight,   color: C.gold,   label: 'Medium'     },
    low:        { bg: C.greenLight,  color: C.green,  label: 'Low Risk'   },
    disputed:   { bg: C.copperLight, color: C.copper, label: 'Disputed'   },
    resolved:   { bg: C.greenLight,  color: C.green,  label: 'Resolved'   },
    frozen:     { bg: '#EEF2FB',     color: '#3B5BDB', label: 'Frozen'    },
    released:   { bg: C.greenLight,  color: C.green,  label: 'Released'   },
    verified:   { bg: C.greenLight,  color: C.green,  label: 'Verified'   },
    unverified: { bg: C.goldLight,   color: C.gold,   label: 'Unverified' },
    talent:     { bg: '#EEF2FB',     color: '#3B5BDB', label: 'Talent'    },
    visionary:  { bg: C.goldLight,   color: C.gold,   label: 'Visionary'  },
  };
  const { bg, color, label } = map[status] ?? { bg: C.grayLight, color: C.gray, label: status };
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: bg, color, fontFamily: FONT, letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ─── Risk Score Ring ──────────────────────────────────────────────────────────
function RiskRing({ score }: { score: number }) {
  const color = score >= 75 ? C.red : score >= 45 ? C.gold : C.green;
  const r = 18; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
      <svg width={44} height={44} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={22} cy={22} r={r} fill="none" stroke={`${color}25`} strokeWidth={3} />
        <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 10, fontWeight: 800, color, fontFamily: FONT,
      }}>{score}%</span>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string | number; sub?: string;
  growth?: number; sparkData?: number[]; accent?: string;
  icon: React.ElementType;
}
function StatCard({ label, value, sub, growth, sparkData, accent = C.green, icon: Icon }: StatCardProps) {
  const up = (growth ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
        padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: `0 2px 12px ${C.shadow}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
          <p style={{ fontSize: 10, color: C.gray, fontFamily: FONT, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0 }}>
            {label}
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: C.coffee, fontFamily: FONT, margin: '5px 0 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: 11, color: C.gray, fontFamily: FONT, margin: '3px 0 0' }}>{sub}</p>}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={16} color={accent} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        {growth !== undefined ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 600, fontFamily: FONT,
            color: up ? C.green : C.red,
          }}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {fmt.percent(Math.abs(growth ?? 0))} vs last mo
          </span>
        ) : <span />}
        {sparkData && <Sparkline data={sparkData} color={accent} />}
      </div>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, fontFamily: FONT, margin: 0, letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      {action && (
        <button onClick={onAction} style={{
          fontSize: 12, color: C.green, fontWeight: 600, background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: FONT,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Card Shell ───────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
      padding: 20, boxShadow: `0 2px 12px ${C.shadow}`, ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Scrollable Table Wrapper ──────────────────────────────────────────────────
function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any, margin: '0 -20px', padding: '0 20px' }}>
      <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', fontFamily: FONT, fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '10px 12px',
                fontSize: 10, fontWeight: 600, color: C.gray,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                borderBottom: `1px solid ${C.border}`,
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '11px 12px', color: C.coffee, verticalAlign: 'middle' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({ label, icon: Icon, onClick, variant = 'ghost' }: {
  label: string; icon?: React.ElementType; onClick?: () => void;
  variant?: 'ghost' | 'danger' | 'primary' | 'warning';
}) {
  const styles: Record<string, React.CSSProperties> = {
    ghost:   { background: C.grayLight,   color: C.coffee, border: `1px solid ${C.border}` },
    danger:  { background: C.redLight,    color: C.red,    border: `1px solid ${C.red}30`  },
    primary: { background: C.greenLight,  color: C.green,  border: `1px solid ${C.green}40`},
    warning: { background: C.goldLight,   color: C.gold,   border: `1px solid ${C.gold}40` },
  };
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
      cursor: 'pointer', fontFamily: FONT, transition: 'opacity 0.15s',
      ...styles[variant],
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {Icon && <Icon size={12} />} {label}
    </button>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, label }: { data: { month: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div>
      <p style={{ fontSize: 10, color: C.gray, fontFamily: FONT, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', borderRadius: 4,
              height: `${(d.value / max) * 78}px`,
              background: i === data.length - 1 ? C.green : `${C.green}40`,
              transition: 'all 0.3s', minHeight: 4,
            }} />
            <span style={{ fontSize: 8, color: C.gray, fontFamily: FONT }}>{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Line Chart ──────────────────────────────────────────────────────────────
function LineChart({ datasets, labels }: { datasets: { name: string; data: number[]; color: string }[]; labels: string[] }) {
  const allVals = datasets.flatMap(d => d.data);
  const max = Math.max(...allVals); const min = Math.min(...allVals, 0);
  const range = max - min || 1;
  const W = 480; const H = 110;
  const xStep = W / (labels.length - 1);
  const toY = (v: number) => H - ((v - min) / range) * (H - 10) - 5;
  const toX = (i: number) => i * xStep;

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 22}`} style={{ display: 'block', minWidth: 280, fontFamily: FONT }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = H - f * (H - 10) - 5;
          return <line key={f} x1={0} y1={y} x2={W} y2={y} stroke={`${C.border}`} strokeWidth={0.8} />;
        })}
        {datasets.map(ds => {
          const pts = ds.data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
          const areaBot = `${toX(ds.data.length - 1)},${H} ${toX(0)},${H}`;
          return (
            <g key={ds.name}>
              <polygon points={`${pts} ${areaBot}`} fill={ds.color} opacity={0.06} />
              <polyline points={pts} fill="none" stroke={ds.color} strokeWidth={2}
                strokeLinejoin="round" strokeLinecap="round" />
            </g>
          );
        })}
        {labels.map((l, i) => (
          <text key={i} x={toX(i)} y={H + 17} textAnchor="middle"
            fontSize={9} fill={C.gray} fontFamily={FONT}>{l}</text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
        {datasets.map(ds => (
          <div key={ds.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 3, borderRadius: 2, background: ds.color }} />
            <span style={{ fontSize: 11, color: C.gray, fontFamily: FONT }}>{ds.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
function Heatmap({ data, title }: { data: number[][]; title: string }) {
  const max = Math.max(...data.flat());
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['00', '04', '08', '12', '16', '20'];
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
      <p style={{ fontSize: 10, color: C.gray, fontFamily: FONT, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{title}</p>
      <div style={{ minWidth: 260 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 4, paddingLeft: 28 }}>
          {hours.map(h => (
            <div key={h} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: C.gray, fontFamily: FONT }}>{h}h</div>
          ))}
        </div>
        {data.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: C.gray, fontFamily: FONT, width: 24, flexShrink: 0 }}>{days[i]}</span>
            {row.map((v, j) => {
              const intensity = v / max;
              const bg = intensity > 0.7 ? C.red : intensity > 0.4 ? C.gold : intensity > 0.1 ? C.green : C.grayLight;
              return (
                <div key={j} title={`${v} events`} style={{
                  flex: 1, height: 14, borderRadius: 3,
                  background: bg, opacity: 0.2 + intensity * 0.8,
                }} />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <span style={{ fontSize: 9, color: C.gray, fontFamily: FONT }}>Low</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map(f => (
          <div key={f} style={{ width: 11, height: 11, borderRadius: 3, background: f > 0.7 ? C.red : f > 0.4 ? C.gold : C.green, opacity: 0.2 + f * 0.8 }} />
        ))}
        <span style={{ fontSize: 9, color: C.gray, fontFamily: FONT }}>High</span>
      </div>
    </div>
  );
}

// ─── Activity Feed Item ───────────────────────────────────────────────────────
function FeedItem({ type, message, time, isNew }: { type: 'fraud' | 'payment' | 'dispute' | 'user' | 'escrow'; message: string; time: string; isNew?: boolean }) {
  const icon = { fraud: ShieldAlert, payment: CreditCard, dispute: Gavel, user: Users, escrow: Landmark }[type];
  const color = { fraud: C.red, payment: C.green, dispute: C.copper, user: '#3B5BDB', escrow: C.gold }[type];
  const Icon = icon;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '11px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: C.coffee, fontFamily: FONT, margin: '0 0 2px', lineHeight: 1.4, wordBreak: 'break-word' }}>{message}</p>
        <p style={{ fontSize: 10, color: C.gray, fontFamily: FONT, margin: 0 }}>{time}</p>
      </div>
      {isNew && <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0, marginTop: 6 }} />}
    </div>
  );
}

// ─── STATIC DEMO DATA ─────────────────────────────────────────────────────────
const DEMO_FRAUD_ALERTS = [
  { id: 'FA-001', account: 'u_9284', email: 'xander.vm@proton.me', riskScore: 92, flags: ['Rapid proposal spam', 'VPN detected', 'Payment failure x4'], status: 'high', date: '2025-07-14' },
  { id: 'FA-002', account: 'u_4471', email: 'liona.rc@tempmail.com', riskScore: 76, flags: ['Duplicate identity', 'Multiple IPs'], status: 'high', date: '2025-07-13' },
  { id: 'FA-003', account: 'u_6612', email: 'devpro.x@yopmail.com', riskScore: 55, flags: ['Abnormal login pattern'], status: 'medium', date: '2025-07-12' },
  { id: 'FA-004', account: 'u_1123', email: 'alice.m@gmail.com', riskScore: 22, flags: ['Minor anomaly'], status: 'low', date: '2025-07-11' },
];

const DEMO_ESCROW = [
  { id: 'MGN-TRX-928184', project: 'Brand Identity System', client: 'The Aurelian Group', talent: 'Alice Mercer', amount: 12500, milestone: 'Final Delivery', status: 'pending', commission: 625, date: '2025-07-14' },
  { id: 'MGN-TRX-839201', project: 'Mobile App MVP', client: 'NovaTech Inc.', talent: 'Marcus Webb', amount: 8200, milestone: 'Phase 1 Complete', status: 'released', commission: 410, date: '2025-07-12' },
  { id: 'MGN-INV-392814', project: 'Campaign Strategy', client: 'Luxe Media', talent: 'Priya Nair', amount: 5000, milestone: 'Research Deck', status: 'disputed', commission: 250, date: '2025-07-10' },
  { id: 'MGN-TRX-772091', project: 'Product Photography', client: 'Atelier Co.', talent: 'Jordan Ellis', amount: 3800, milestone: 'Shoot Complete', status: 'completed', commission: 190, date: '2025-07-08' },
  { id: 'MGN-INV-221009', project: 'SaaS Development', client: 'QuantumLabs', talent: 'Sofia Reyes', amount: 22000, milestone: 'Sprint 3', status: 'frozen', commission: 1100, date: '2025-07-06' },
];

const DEMO_USERS = [
  { uid: 'u_0001', name: 'Alice Mercer', email: 'alice@mercer.io', role: 'talent', status: 'verified', reputation: 98, projects: 24, flagged: false, joinDate: '2024-03-12' },
  { uid: 'u_0002', name: 'Darian Cross', email: 'darian@novaco.io', role: 'visionary', status: 'verified', reputation: 91, projects: 8, flagged: false, joinDate: '2024-06-01' },
  { uid: 'u_0003', name: 'Priya Nair', email: 'priya.n@freelance.co', role: 'talent', status: 'verified', reputation: 87, projects: 16, flagged: false, joinDate: '2024-05-18' },
  { uid: 'u_0004', name: 'xander.vm', email: 'xander.vm@proton.me', role: 'talent', status: 'unverified', reputation: 12, projects: 0, flagged: true, joinDate: '2025-07-13' },
  { uid: 'u_0005', name: 'Marcus Webb', email: 'marcus@webb.studio', role: 'talent', status: 'verified', reputation: 94, projects: 31, flagged: false, joinDate: '2024-01-22' },
  { uid: 'u_0006', name: 'Luxe Media', email: 'ops@luxemedia.co', role: 'visionary', status: 'verified', reputation: 79, projects: 5, flagged: false, joinDate: '2024-09-10' },
];

const DEMO_DISPUTES = [
  { id: 'DSP-0014', project: 'Campaign Strategy', client: 'Luxe Media', talent: 'Priya Nair', amount: 5000, evidence: 3, status: 'disputed', opened: '2025-07-10', deadline: '2025-07-20' },
  { id: 'DSP-0011', project: 'Logo Redesign', client: 'Atelier Co.', talent: 'Jordan Ellis', amount: 2200, evidence: 5, status: 'resolved', opened: '2025-06-28', deadline: '2025-07-08' },
  { id: 'DSP-0009', project: 'SaaS Dashboard', client: 'QuantumLabs', talent: 'Sofia Reyes', amount: 9400, evidence: 2, status: 'disputed', opened: '2025-07-05', deadline: '2025-07-15' },
];

const DEMO_ACTIVITY = [
  { type: 'fraud' as const, message: 'High-risk account xander.vm@proton.me flagged by AI monitoring system', time: '2 min ago', isNew: true },
  { type: 'escrow' as const, message: 'Escrow MGN-TRX-839201 released — $8,200 to Marcus Webb', time: '18 min ago', isNew: true },
  { type: 'dispute' as const, message: 'Dispute DSP-0009 escalated — QuantumLabs vs Sofia Reyes', time: '1 hr ago', isNew: false },
  { type: 'user' as const, message: 'New talent registration: jordan.e@design.co — verification pending', time: '2 hr ago', isNew: false },
  { type: 'payment' as const, message: 'Commission payout processed — $1,100 (MGN-INV-221009)', time: '3 hr ago', isNew: false },
  { type: 'user' as const, message: 'Visionary profile verified: Darian Cross / NovaCo', time: '5 hr ago', isNew: false },
  { type: 'fraud' as const, message: 'Medium risk pattern detected on account u_6612', time: '7 hr ago', isNew: false },
];

const MONTHLY = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
const REVENUE_DATA = [{ month: 'Jan', value: 41200 }, { month: 'Feb', value: 52800 }, { month: 'Mar', value: 48100 }, { month: 'Apr', value: 61400 }, { month: 'May', value: 58900 }, { month: 'Jun', value: 73200 }, { month: 'Jul', value: 81400 }];
const SPARK_REVENUE    = [41, 52, 48, 61, 59, 73, 81];
const SPARK_USERS      = [210, 240, 290, 310, 380, 420, 471];
const SPARK_CONTRACTS  = [28, 34, 29, 41, 38, 52, 61];
const SPARK_ESCROW     = [180, 210, 195, 240, 270, 290, 312];
const SPARK_FRAUD      = [2, 5, 3, 7, 4, 6, 8];
const FRAUD_HEATMAP    = [
  [1, 0, 2, 4, 5, 3], [0, 1, 1, 3, 2, 1], [2, 3, 5, 8, 6, 4],
  [1, 2, 4, 7, 9, 5], [3, 2, 3, 5, 4, 2], [0, 0, 1, 2, 1, 0], [0, 0, 0, 1, 0, 0],
];

// ─── PAGE VIEWS ───────────────────────────────────────────────────────────────

function OverviewView({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const isNarrow = isMobile || isTablet;
  return (
    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Stat Cards — 2 cols on mobile, 3 on tablet, auto on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? 'repeat(2, 1fr)'
          : isTablet
            ? 'repeat(3, 1fr)'
            : 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: isMobile ? 10 : 14,
        marginBottom: 20,
      }}>
        <StatCard label="Total Platform Revenue" value={fmt.currency(416800)} sub="All time" growth={11.2} sparkData={SPARK_REVENUE} accent={C.green} icon={DollarSign} />
        <StatCard label="Active Users" value={fmt.number(471)} sub="392 verified" growth={8.4} sparkData={SPARK_USERS} accent={'#3B5BDB'} icon={Users} />
        <StatCard label="Active Contracts" value={fmt.number(61)} sub="14 awaiting action" growth={17.3} sparkData={SPARK_CONTRACTS} accent={C.gold} icon={ArrowLeftRight} />
        <StatCard label="Escrow Volume" value={fmt.currency(312000)} sub="This month" growth={6.9} sparkData={SPARK_ESCROW} accent={C.copper} icon={Landmark} />
        <StatCard label="Fraud Alerts" value={8} sub="4 high risk" growth={-12.0} sparkData={SPARK_FRAUD} accent={C.red} icon={ShieldAlert} />
        <StatCard label="Monthly Growth" value="+11.2%" sub="vs June 2025" growth={11.2} sparkData={SPARK_REVENUE} accent={C.green} icon={TrendingUp} />
      </div>

      {/* Charts — stack on mobile, side-by-side on tablet+ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr',
        gap: 14, marginBottom: 16,
      }}>
        <Card>
          <SectionHeader title="Revenue Growth" />
          <BarChart data={REVENUE_DATA} label="Monthly platform revenue (USD)" />
        </Card>
        <Card>
          <SectionHeader title="Platform Activity" />
          <LineChart
            labels={MONTHLY}
            datasets={[
              { name: 'Contracts', data: SPARK_CONTRACTS, color: C.green },
              { name: 'Users', data: [21, 24, 29, 31, 38, 42, 47], color: '#3B5BDB' },
            ]}
          />
        </Card>
      </div>

      {/* Bottom row — stack on mobile/tablet */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isNarrow ? '1fr' : '1fr 340px',
        gap: 14,
      }}>
        <Card>
          <SectionHeader title="Recent Fraud Alerts" action="View All" />
          <Table
            headers={['Account', 'Risk', 'Flags', 'Status', '']}
            rows={DEMO_FRAUD_ALERTS.slice(0, 3).map(f => [
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.coffee, fontFamily: FONT }}>{f.account}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.gray, fontFamily: FONT }}>{f.email}</p>
              </div>,
              <RiskRing score={f.riskScore} />,
              <span style={{ fontSize: 11, color: C.gray, fontFamily: FONT }}>{f.flags[0]}</span>,
              <Badge status={f.status} />,
              <ActionBtn label="Review" variant="ghost" />,
            ])}
          />
        </Card>
        <Card>
          <SectionHeader title="Live Activity Feed" />
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {DEMO_ACTIVITY.slice(0, 5).map((a, i) => <FeedItem key={i} {...a} />)}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// Users View
function UsersView({ showToast, isMobile }: { showToast: (msg: string, type?: ToastType) => void; isMobile: boolean }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'talent' | 'visionary' | 'flagged'>('all');
  const filtered = DEMO_USERS.filter(u => {
    if (filter === 'flagged') return u.flagged;
    if (filter === 'talent') return u.role === 'talent';
    if (filter === 'visionary') return u.role === 'visionary';
    return true;
  }).filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['all', 'talent', 'visionary', 'flagged'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: FONT, border: 'none',
                background: filter === f ? C.coffee : C.grayLight,
                color: filter === f ? C.ivory : C.gray,
                transition: 'all 0.15s',
              }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
          <div style={{ position: 'relative', width: isMobile ? '100%' : 200 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.gray }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12,
                fontFamily: FONT, outline: 'none', color: C.coffee, background: C.white,
                width: '100%', boxSizing: 'border-box',
              }} />
          </div>
        </div>

        <Table
          headers={['User', 'Role', 'Status', 'Rep', 'Projects', 'Joined', 'Actions']}
          rows={filtered.map(u => [
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, background: u.flagged ? C.redLight : C.greenLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: u.flagged ? C.red : C.green, fontFamily: FONT, flexShrink: 0,
              }}>
                {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: u.flagged ? C.red : C.coffee, fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{u.name}</p>
                <p style={{ margin: 0, fontSize: 10, color: C.gray, fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{u.email}</p>
              </div>
            </div>,
            <Badge status={u.role} />,
            <Badge status={u.status} />,
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={11} color={C.gold} fill={C.gold} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.coffee, fontFamily: FONT }}>{u.reputation}</span>
            </div>,
            <span style={{ fontSize: 12, color: C.coffee, fontFamily: FONT }}>{u.projects}</span>,
            <span style={{ fontSize: 11, color: C.gray, fontFamily: FONT, whiteSpace: 'nowrap' }}>{fmt.date(u.joinDate)}</span>,
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <ActionBtn label="View" icon={Eye} variant="ghost" onClick={() => showToast(`Viewing profile: ${u.name}`, 'info')} />
              {u.flagged && <ActionBtn label="Suspend" icon={Pause} variant="danger" onClick={() => showToast(`${u.name} suspended`, 'danger')} />}
              {!u.flagged && <ActionBtn label="Flag" icon={Flag} variant="warning" onClick={() => showToast(`⚑ ${u.name} has been flagged`, 'warning')} />}
            </div>,
          ])}
        />
      </Card>
    </motion.div>
  );
}

// Fraud Monitoring
function FraudView({ showToast, isMobile, isTablet }: { showToast: (msg: string, type?: ToastType) => void; isMobile: boolean; isTablet: boolean }) {
  const isNarrow = isMobile || isTablet;
  return (
    <motion.div key="fraud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 300px', gap: 14, marginBottom: 16 }}>
        <Card>
          <SectionHeader title="Fraud Detection Heatmap" />
          <Heatmap data={FRAUD_HEATMAP} title="Risk events by day × time" />
        </Card>
        <Card>
          <SectionHeader title="Risk Distribution" />
          {[{ label: 'High Risk', count: 4, color: C.red }, { label: 'Medium Risk', count: 3, color: C.gold }, { label: 'Low Risk', count: 12, color: C.green }].map(r => (
            <div key={r.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.coffee, fontFamily: FONT }}>{r.label}</span>
                <span style={{ fontSize: 12, color: C.gray, fontFamily: FONT }}>{r.count} accounts</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: C.grayLight }}>
                <div style={{ height: '100%', borderRadius: 3, background: r.color, width: `${(r.count / 19) * 100}%`, transition: 'width 0.6s' }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <SectionHeader title="Suspicious Accounts" />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {DEMO_FRAUD_ALERTS.map(f => (
            <div key={f.id} style={{
              border: `1px solid ${f.status === 'high' ? `${C.red}30` : f.status === 'medium' ? `${C.gold}30` : C.border}`,
              borderRadius: 14, padding: 16,
              background: f.status === 'high' ? `${C.redLight}60` : C.white,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.coffee, fontFamily: FONT }}>{f.account}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.gray, fontFamily: FONT, wordBreak: 'break-all' }}>{f.email}</p>
                </div>
                <RiskRing score={f.riskScore} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {f.flags.map(flag => (
                  <span key={flag} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, background: C.copperLight, color: C.copper, fontFamily: FONT }}>{flag}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <ActionBtn label="Review" icon={Eye} variant="ghost" onClick={() => showToast(`Reviewing account ${f.account}`, 'info')} />
                <ActionBtn label="Suspend" icon={Pause} variant="danger" onClick={() => showToast(`⏸ Account ${f.account} suspended`, 'danger')} />
                <ActionBtn label="Clear" icon={CheckCircle2} variant="primary" onClick={() => showToast(`✓ Account ${f.account} cleared`, 'success')} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// Escrow Audits
function EscrowView({ showToast, isMobile }: { showToast: (msg: string, type?: ToastType) => void; isMobile: boolean }) {
  return (
    <motion.div key="escrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Pending Releases', value: 2, color: C.gold },
          { label: 'Disputed', value: 2, color: C.red },
          { label: 'Completed', value: 8, color: C.green },
          { label: 'Commissions', value: fmt.currency(2575), color: C.copper },
        ].map(s => (
          <div key={s.label} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', boxShadow: `0 2px 8px ${C.shadow}` }}>
            <p style={{ fontSize: 10, color: C.gray, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: FONT, margin: '0 0 5px' }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: FONT, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <SectionHeader title="Escrow Audit Log" />
        <Table
          headers={['Transaction ID', 'Project', 'Parties', 'Amount', 'Commission', 'Status', 'Date', 'Actions']}
          rows={DEMO_ESCROW.map(e => [
            <span style={{ fontSize: 11, fontWeight: 700, color: C.copper, fontFamily: FONT, whiteSpace: 'nowrap' }}>{e.id}</span>,
            <span style={{ fontSize: 12, color: C.coffee, fontFamily: FONT, whiteSpace: 'nowrap' }}>{e.project}</span>,
            <div>
              <p style={{ margin: 0, fontSize: 11, color: C.coffee, fontFamily: FONT }}>{e.client}</p>
              <p style={{ margin: 0, fontSize: 10, color: C.gray, fontFamily: FONT }}>→ {e.talent}</p>
            </div>,
            <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: FONT, whiteSpace: 'nowrap' }}>{fmt.currency(e.amount)}</span>,
            <span style={{ fontSize: 11, color: C.green, fontFamily: FONT }}>{fmt.currency(e.commission)}</span>,
            <Badge status={e.status} />,
            <span style={{ fontSize: 11, color: C.gray, fontFamily: FONT, whiteSpace: 'nowrap' }}>{fmt.date(e.date)}</span>,
            <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
              {e.status === 'pending' && <ActionBtn label="Release" icon={CheckCircle2} variant="primary" onClick={() => showToast(`✓ Escrow ${e.id} released to ${e.talent}`, 'success')} />}
              {e.status === 'disputed' && <ActionBtn label="Freeze" icon={Snowflake} variant="warning" onClick={() => showToast(`⏸ Escrow ${e.id} frozen`, 'warning')} />}
              <ActionBtn label="Audit" icon={Eye} variant="ghost" onClick={() => showToast(`Auditing ${e.id}`, 'info')} />
            </div>,
          ])}
        />
      </Card>
    </motion.div>
  );
}

// Analytics
function AnalyticsView({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const isNarrow = isMobile || isTablet;
  return (
    <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card>
          <SectionHeader title="Contract Volume" />
          <LineChart labels={MONTHLY} datasets={[
            { name: 'Contracts', data: SPARK_CONTRACTS, color: C.green },
            { name: 'Disputes', data: [1, 2, 1, 3, 2, 4, 3], color: C.red },
          ]} />
        </Card>
        <Card>
          <SectionHeader title="Revenue Breakdown" />
          <BarChart data={REVENUE_DATA} label="Monthly revenue" />
        </Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr', gap: 14 }}>
        <Card>
          <SectionHeader title="User Growth" />
          <LineChart labels={MONTHLY} datasets={[
            { name: 'Talent', data: [120, 145, 180, 190, 220, 250, 280], color: '#3B5BDB' },
            { name: 'Visionary', data: [90, 95, 110, 120, 160, 170, 191], color: C.gold },
          ]} />
        </Card>
        <Card>
          <SectionHeader title="Fraud Detection Trends" />
          <LineChart labels={MONTHLY} datasets={[
            { name: 'Fraud Events', data: SPARK_FRAUD, color: C.red },
            { name: 'Resolved', data: [1, 4, 2, 6, 3, 5, 6], color: C.green },
          ]} />
        </Card>
      </div>
    </motion.div>
  );
}

// ─── Dispute Detail Modal ─────────────────────────────────────────────────────
type DisputeRecord = typeof DEMO_DISPUTES[number] & { status: string };

function DisputeDetailModal({ dispute, onClose, onAction }: {
  dispute: DisputeRecord; onClose: () => void; onAction: (action: string, id: string) => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const daysLeft = Math.max(0, Math.round((new Date(dispute.deadline).getTime() - Date.now()) / 86400000));
  const timeline = [
    { by: dispute.client,   time: fmt.date(dispute.opened), note: 'Dispute opened — client claims deliverable not met.' },
    { by: 'MGNOVA System',  time: fmt.date(dispute.opened), note: 'Escrow automatically frozen pending review.' },
    { by: dispute.talent,   time: fmt.date(dispute.opened), note: `${dispute.evidence} evidence files submitted by talent.` },
    { by: 'Admin Review',   time: 'Pending',                note: 'Awaiting admin adjudication.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(30,20,15,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        style={{ background: C.white, borderRadius: 20, width: '100%', maxWidth: 660, boxShadow: '0 32px 80px rgba(0,0,0,0.35)', overflow: 'hidden', margin: 'auto' }}
      >
        <div style={{ padding: '18px 22px', background: C.ivory, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.copper, fontFamily: FONT, letterSpacing: '0.08em' }}>{dispute.id}</span>
              <Badge status={dispute.status} />
            </div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.coffee, fontFamily: FONT }}>{dispute.project}</h2>
          </div>
          <button onClick={onClose} style={{ background: C.grayLight, border: `1px solid ${C.border}`, borderRadius: 9, cursor: 'pointer', padding: '7px 9px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <X size={16} color={C.coffee} />
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Escrow Held', value: fmt.currency(dispute.amount), color: C.copper },
              { label: 'Evidence Files', value: `${dispute.evidence} files`, color: '#3B5BDB' },
              { label: 'Deadline', value: daysLeft > 0 ? `${daysLeft}d left` : 'Overdue', color: daysLeft > 3 ? C.green : C.red },
            ].map(s => (
              <div key={s.label} style={{ background: C.ivory, borderRadius: 10, padding: '11px 13px', border: `1px solid ${C.border}` }}>
                <p style={{ margin: '0 0 3px', fontSize: 9, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONT }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ role: 'Client', name: dispute.client, color: C.copper, bg: C.copperLight }, { role: 'Talent', name: dispute.talent, color: '#3B5BDB', bg: '#EEF2FB' }].map(p => (
              <div key={p.role} style={{ border: `1px solid ${p.color}30`, borderRadius: 10, padding: '12px 14px', background: `${p.bg}60` }}>
                <p style={{ margin: '0 0 3px', fontSize: 9, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONT }}>{p.role}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.coffee, fontFamily: FONT }}>{p.name}</p>
              </div>
            ))}
          </div>

          <div>
            <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONT }}>Case Timeline</p>
            {timeline.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: i === timeline.length - 1 ? C.gray : C.green, flexShrink: 0, marginTop: 3 }} />
                  {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, minHeight: 20 }} />}
                </div>
                <div style={{ paddingBottom: i < timeline.length - 1 ? 14 : 0 }}>
                  <p style={{ margin: '0 0 1px', fontSize: 11, fontWeight: 700, color: C.coffee, fontFamily: FONT }}>{t.by}</p>
                  <p style={{ margin: '0 0 2px', fontSize: 10, color: C.gray, fontFamily: FONT }}>{t.time}</p>
                  <p style={{ margin: 0, fontSize: 12, color: C.coffee, fontFamily: FONT, lineHeight: 1.5 }}>{t.note}</p>
                </div>
              </div>
            ))}
          </div>

          {dispute.status === 'disputed' && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
              <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONT }}>Admin Actions</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ActionBtn label="Release to Talent" icon={CheckCircle2} variant="primary" onClick={() => { onAction('resolve-talent', dispute.id); onClose(); }} />
                <ActionBtn label="Refund Client" icon={Gavel} variant="warning" onClick={() => { onAction('resolve-client', dispute.id); onClose(); }} />
                <ActionBtn label="Freeze Escrow" icon={Snowflake} variant="ghost" onClick={() => { onAction('freeze', dispute.id); onClose(); }} />
                <ActionBtn label="Flag Both" icon={Flag} variant="danger" onClick={() => { onAction('flag-both', dispute.id); onClose(); }} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Disputes
function DisputesView({ showToast, isMobile }: { showToast: (msg: string, type?: ToastType) => void; isMobile: boolean }) {
  const [disputes, setDisputes] = useState(DEMO_DISPUTES.map(d => ({ ...d })));
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);

  const handleAction = (action: string, id: string) => {
    setDisputes(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (action === 'resolve-talent' || action === 'resolve-client') return { ...d, status: 'resolved' };
      if (action === 'freeze') return { ...d, status: 'frozen' };
      return d;
    }));
    const msgs: Record<string, [string, ToastType]> = {
      'resolve-talent': ['✓ Escrow released to talent — dispute resolved', 'success'],
      'resolve-client':  ['✓ Escrow refunded to client — dispute resolved', 'success'],
      'freeze':          ['⏸ Escrow frozen — pending further review', 'warning'],
      'flag-both':       ['⚑ Both users flagged for review', 'danger'],
    };
    const [msg, type] = msgs[action] ?? ['Action applied', 'success'];
    showToast(msg, type);
  };

  return (
    <>
      <motion.div key="disputes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {disputes.map(d => (
            <Card key={d.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.copper, fontFamily: FONT, letterSpacing: '0.06em' }}>{d.id}</span>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, fontFamily: FONT, margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.project}</h3>
                </div>
                <div style={{ flexShrink: 0 }}><Badge status={d.status} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 14 }}>
                {[
                  { label: 'Client', value: d.client },
                  { label: 'Talent', value: d.talent },
                  { label: 'Escrow', value: fmt.currency(d.amount) },
                  { label: 'Evidence', value: `${d.evidence} files` },
                  { label: 'Opened', value: fmt.date(d.opened) },
                  { label: 'Deadline', value: fmt.date(d.deadline) },
                ].map(f => (
                  <div key={f.label}>
                    <p style={{ margin: '0 0 1px', fontSize: 9, color: C.gray, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT }}>{f.label}</p>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.coffee, fontFamily: FONT }}>{f.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                <ActionBtn label="Review" icon={Eye} variant="ghost" onClick={() => setSelectedDispute(d)} />
                {d.status === 'disputed' && <>
                  <ActionBtn label="Freeze" icon={Snowflake} variant="warning" onClick={() => handleAction('freeze', d.id)} />
                  <ActionBtn label="Resolve" icon={Gavel} variant="primary" onClick={() => setSelectedDispute(d)} />
                </>}
                <ActionBtn label="Flag" icon={Flag} variant="danger" onClick={() => showToast(`⚑ User flagged in ${d.id}`, 'danger')} />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
      <AnimatePresence>
        {selectedDispute && (
          <DisputeDetailModal dispute={selectedDispute} onClose={() => setSelectedDispute(null)} onAction={handleAction} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── PDF Preview Modal ────────────────────────────────────────────────────────
declare global { interface Window { pdfjsLib: any; } }

function PDFPreviewModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus]         = useState<'loading' | 'ready' | 'error'>('loading');
  const [pageNum, setPageNum]       = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale]           = useState(1.2);
  const pdfRef = useRef<any>(null);
  const renderingRef = useRef(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    const loadPdfJs = async () => {
      if (!window.pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          s.onload = () => resolve(); s.onerror = () => reject();
          document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      try {
        const pdf = await window.pdfjsLib.getDocument(url).promise;
        pdfRef.current = pdf; setTotalPages(pdf.numPages); setStatus('ready');
      } catch { setStatus('error'); }
    };
    loadPdfJs();
    return () => window.removeEventListener('keydown', h);
  }, [url, onClose]);

  useEffect(() => {
    if (status !== 'ready' || !pdfRef.current || !containerRef.current || renderingRef.current) return;
    renderingRef.current = true;
    (async () => {
      const page = await pdfRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const container = containerRef.current!;
      container.innerHTML = '';
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width; canvas.height = viewport.height;
      canvas.style.cssText = 'display:block;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.18);max-width:100%;';
      container.appendChild(canvas);
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
      renderingRef.current = false;
    })().catch(() => { renderingRef.current = false; });
  }, [status, pageNum, scale]);

  const handleDownload = async () => {
    try {
      const res = await fetch(url); const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      a.download = title.toLowerCase().replace(/[\s/]+/g, '_') + '.pdf';
      a.click();
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(30,20,15,0.82)', display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: '16px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        style={{ background: C.white, borderRadius: 18, width: '100%', maxWidth: 860, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${C.border}`, background: C.ivory, flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.copperLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={13} color={C.copper} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          </div>
          {status === 'ready' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum === 1} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: pageNum === 1 ? 'not-allowed' : 'pointer', fontSize: 13, opacity: pageNum === 1 ? 0.4 : 1 }}>‹</button>
              <span style={{ fontSize: 11, color: C.gray, fontFamily: FONT, whiteSpace: 'nowrap' }}>{pageNum}/{totalPages}</span>
              <button onClick={() => setPageNum(p => Math.min(totalPages, p + 1))} disabled={pageNum === totalPages} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: pageNum === totalPages ? 'not-allowed' : 'pointer', fontSize: 13, opacity: pageNum === totalPages ? 0.4 : 1 }}>›</button>
              <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 13 }}>−</button>
              <span style={{ fontSize: 10, color: C.gray, fontFamily: FONT }}>{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 13 }}>+</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            {status === 'ready' && <button onClick={handleDownload} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: FONT, cursor: 'pointer', background: C.greenLight, color: C.green, border: `1px solid ${C.green}40` }}><Download size={12} /> Download</button>}
            <button onClick={onClose} style={{ background: C.grayLight, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}><X size={14} color={C.coffee} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', background: '#D8D3CD', padding: '20px 12px' }}>
          {status === 'loading' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.copper, animation: 'spin 0.8s linear infinite' }} /><span style={{ fontSize: 12, color: C.gray, fontFamily: FONT }}>Loading PDF…</span></div>}
          {status === 'error' && <div style={{ textAlign: 'center', padding: 32 }}><FileText size={40} color={C.gray} /><p style={{ fontSize: 14, fontWeight: 700, color: C.coffee, fontFamily: FONT, marginTop: 12 }}>Could not load PDF</p></div>}
          <div ref={containerRef} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Reports
function ReportsView({ showToast, isMobile }: { showToast: (msg: string, type?: ToastType) => void; isMobile: boolean }) {
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string } | null>(null);
  const reports = [
    { title: 'Monthly Revenue Report',  subtitle: 'July 2025 — Earnings, commissions, payouts', icon: DollarSign,  color: C.green,   file: '/monthly_revenue_report_july2025.pdf' },
    { title: 'Fraud Audit Summary',     subtitle: 'July 2025 — Risk flags, resolutions',        icon: ShieldAlert, color: C.red,     file: '/fraud_audit_summary_july2025.pdf'     },
    { title: 'Escrow Audit Log',        subtitle: 'July 2025 — All escrow movements',           icon: Landmark,    color: C.copper,  file: '/escrow_audit_log_july2025.pdf'        },
    { title: 'User Activity Report',    subtitle: 'July 2025 — Registrations, verifications',   icon: Users,       color: '#3B5BDB', file: '/user_activity_report_july2025.pdf'    },
    { title: 'Dispute Resolution Log',  subtitle: 'July 2025 — Cases opened, resolved',         icon: Gavel,       color: C.gold,    file: '/dispute_resolution_log_july2025.pdf'  },
    { title: 'Contract Analytics',      subtitle: 'Q2 2025 — Volumes, milestones',              icon: BarChart3,   color: C.green,   file: '/contract_analytics_q2_2025.pdf'       },
  ];
  const handleDownload = async (file: string | null, title: string) => {
    if (!file) { showToast(`No PDF available for "${title}"`, 'warning'); return; }
    try {
      showToast('Preparing download…', 'info');
      const res = await fetch(file); if (!res.ok) throw new Error();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([await res.blob()], { type: 'application/pdf' }));
      a.download = title.toLowerCase().replace(/[\s/]+/g, '_') + '.pdf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showToast(`✓ Downloaded: ${title}`, 'success');
    } catch { showToast(`Could not download "${title}"`, 'danger'); }
  };

  return (
    <>
      <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {reports.map(r => {
            const Icon = r.icon;
            return (
              <Card key={r.title} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${r.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={r.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.coffee, fontFamily: FONT }}>{r.title}</h3>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: C.gray, fontFamily: FONT }}>{r.subtitle}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <ActionBtn label="Download PDF" icon={Download} variant="primary" onClick={() => handleDownload(r.file, r.title)} />
                  <ActionBtn label="Preview" icon={Eye} variant="ghost" onClick={() => { if (!r.file) { showToast(`No PDF for "${r.title}"`, 'warning'); return; } setPreviewFile({ url: r.file, title: r.title }); }} />
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>
      <AnimatePresence>{previewFile && <PDFPreviewModal url={previewFile.url} title={previewFile.title} onClose={() => setPreviewFile(null)} />}</AnimatePresence>
    </>
  );
}

// Revenue View
function RevenueView({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const isNarrow = isMobile || isTablet;
  const breakdown = [
    { label: 'Platform Commissions (5%)', amount: 81400 * 0.05, growth: 11.2 },
    { label: 'Premium Listing Fees', amount: 4200, growth: 8.1 },
    { label: 'AI Matching Credits', amount: 3100, growth: 22.4 },
    { label: 'Dispute Resolution Fees', amount: 900, growth: -3.2 },
  ];
  return (
    <motion.div key="revenue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 360px', gap: 14, marginBottom: 14 }}>
        <Card>
          <SectionHeader title="Revenue Growth" />
          <BarChart data={REVENUE_DATA} label="Monthly revenue (USD)" />
        </Card>
        <Card>
          <SectionHeader title="Revenue Sources" />
          {breakdown.map(b => (
            <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, gap: 8 }}>
              <span style={{ fontSize: 12, color: C.coffee, fontFamily: FONT, flex: 1 }}>{b.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: FONT }}>{fmt.currency(b.amount)}</span>
                <span style={{ fontSize: 11, color: b.growth > 0 ? C.green : C.red, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {b.growth > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(b.growth).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <SectionHeader title="Payout Log" />
        <Table
          headers={['ID', 'Talent', 'Project', 'Amount', 'Commission', 'Net', 'Date', 'Status']}
          rows={DEMO_ESCROW.filter(e => e.status === 'released' || e.status === 'completed').map(e => [
            <span style={{ fontSize: 11, fontWeight: 700, color: C.copper, fontFamily: FONT, whiteSpace: 'nowrap' }}>{e.id}</span>,
            <span style={{ fontSize: 12, color: C.coffee, fontFamily: FONT }}>{e.talent}</span>,
            <span style={{ fontSize: 12, color: C.gray, fontFamily: FONT }}>{e.project}</span>,
            <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: FONT }}>{fmt.currency(e.amount)}</span>,
            <span style={{ fontSize: 11, color: C.green, fontFamily: FONT }}>{fmt.currency(e.commission)}</span>,
            <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: FONT }}>{fmt.currency(e.amount - e.commission)}</span>,
            <span style={{ fontSize: 11, color: C.gray, fontFamily: FONT, whiteSpace: 'nowrap' }}>{fmt.date(e.date)}</span>,
            <Badge status={e.status} />,
          ])}
        />
      </Card>
    </motion.div>
  );
}

// Notifications
function NotificationsView() {
  const items = [
    { type: 'fraud' as const,   message: 'High-risk account xander.vm@proton.me detected — AI risk score 92%',               time: '2 min ago',  isNew: true  },
    { type: 'payment' as const, message: 'Escrow MGN-TRX-839201 — $8,200 successfully released to Marcus Webb',              time: '18 min ago', isNew: true  },
    { type: 'dispute' as const, message: 'Dispute DSP-0009 escalated — QuantumLabs vs Sofia Reyes — deadline in 10 days',    time: '1 hr ago',   isNew: true  },
    { type: 'user' as const,    message: 'Verification request from 3 new talent accounts pending review',                    time: '2 hr ago',   isNew: false },
    { type: 'escrow' as const,  message: 'Escrow MGN-INV-221009 frozen — dispute investigation underway',                    time: '4 hr ago',   isNew: false },
    { type: 'payment' as const, message: 'Commission batch payout of $2,575 processed to admin wallet',                      time: '6 hr ago',   isNew: false },
    { type: 'fraud' as const,   message: 'Medium risk pattern resolved — account u_6612 cleared after review',               time: '8 hr ago',   isNew: false },
    { type: 'user' as const,    message: 'Visionary account Luxe Media passed enhanced KYC verification',                    time: '10 hr ago',  isNew: false },
  ];
  return (
    <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card><SectionHeader title="All Notifications" />{items.map((a, i) => <FeedItem key={i} {...a} />)}</Card>
    </motion.div>
  );
}

// Transactions View
function TransactionsView() {
  return (
    <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>
        <SectionHeader title="All Transactions" />
        <Table
          headers={['ID', 'Project', 'Client → Talent', 'Amount', 'Commission', 'Status', 'Date']}
          rows={DEMO_ESCROW.map(e => [
            <span style={{ fontSize: 11, fontWeight: 700, color: C.copper, fontFamily: FONT, whiteSpace: 'nowrap' }}>{e.id}</span>,
            <span style={{ fontSize: 12, color: C.coffee, fontFamily: FONT }}>{e.project}</span>,
            <div>
              <p style={{ margin: 0, fontSize: 11, color: C.coffee, fontFamily: FONT }}>{e.client}</p>
              <p style={{ margin: 0, fontSize: 10, color: C.gray, fontFamily: FONT }}>→ {e.talent}</p>
            </div>,
            <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: FONT, whiteSpace: 'nowrap' }}>{fmt.currency(e.amount)}</span>,
            <span style={{ fontSize: 11, color: C.green, fontFamily: FONT }}>{fmt.currency(e.commission)}</span>,
            <Badge status={e.status} />,
            <span style={{ fontSize: 11, color: C.gray, fontFamily: FONT, whiteSpace: 'nowrap' }}>{fmt.date(e.date)}</span>,
          ])}
        />
      </Card>
    </motion.div>
  );
}

// Settings View
function AdminSettingsView({ adminEmail, isMobile, isTablet }: { adminEmail: string; isMobile: boolean; isTablet: boolean }) {
  return (
    <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '1fr 1fr', gap: 14 }}>
        <Card>
          <SectionHeader title="Admin Profile" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[{ label: 'Email', value: adminEmail }, { label: 'Role', value: 'Super Admin' }, { label: 'Access Level', value: 'Full Platform Access' }].map(f => (
              <div key={f.label}>
                <p style={{ margin: '0 0 3px', fontSize: 10, color: C.gray, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: FONT }}>{f.label}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.coffee, fontFamily: FONT }}>{f.value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Platform Config" />
          {[
            { label: 'Commission Rate', value: '5.0%' },
            { label: 'Dispute Window', value: '10 days' },
            { label: 'Escrow Hold Period', value: '48 hours' },
            { label: 'AI Risk Threshold', value: '75% (High Alert)' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, gap: 8 }}>
              <span style={{ fontSize: 12, color: C.coffee, fontFamily: FONT }}>{f.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: FONT }}>{f.value}</span>
            </div>
          ))}
        </Card>
      </div>
    </motion.div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ activePage, onNav, isMobile, open, onClose }: {
  activePage: NavKey; onNav: (k: NavKey) => void;
  isMobile: boolean; open: boolean; onClose: () => void;
}) {
  const content = (
    <div style={{ width: 240, minHeight: '100vh', background: C.sidebar, display: 'flex', flexDirection: 'column', borderRight: 'rgba(255,255,255,0.06) 1px solid', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: 'rgba(255,255,255,0.07) 1px solid', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={14} color={C.sidebar} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: C.sidebarText, letterSpacing: '-0.03em', fontFamily: FONT }}>MG</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: C.gold, letterSpacing: '-0.03em', fontFamily: FONT }}>NOVA</span>
            </div>
            <p style={{ margin: 0, fontSize: 9, color: C.sidebarSub, fontFamily: FONT, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Admin Console</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: C.sidebarSub, display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activePage === key;
          return (
            <button key={key} onClick={() => { onNav(key); if (isMobile) onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                padding: '9px 11px', borderRadius: 9, border: 'none', cursor: 'pointer',
                marginBottom: 1, textAlign: 'left',
                background: isActive ? `${C.gold}20` : 'transparent',
                color: isActive ? C.gold : C.sidebarSub,
                transition: 'all 0.15s', position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget.style.background = 'rgba(255,255,255,0.05)'); }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget.style.background = 'transparent'); }}
            >
              {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, borderRadius: '0 2px 2px 0', background: C.gold }} />}
              <Icon size={14} />
              <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, fontFamily: FONT, letterSpacing: '-0.01em' }}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: 'rgba(255,255,255,0.07) 1px solid' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${C.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: C.gold, fontFamily: FONT }}>A</div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.sidebarText, fontFamily: FONT }}>Super Admin</p>
            <p style={{ margin: 0, fontSize: 9, color: C.sidebarSub, fontFamily: FONT }}>Full Access</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isMobile) return content;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(30,20,15,0.6)', zIndex: 90 }} />
          <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
            transition={{ type: 'tween', duration: 0.22 }}
            style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 91 }}>
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ page, isMobile, isTablet, onMenuClick, adminEmail, fraudCount, onNotifClick, unread, onLogout }: {
  page: NavKey; isMobile: boolean; isTablet: boolean; onMenuClick: () => void;
  adminEmail: string; fraudCount: number; onNotifClick: () => void; unread: number; onLogout: () => void;
}) {
  const meta = NAV_ITEMS.find(n => n.key === page);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const isDesktop = !isMobile && !isTablet;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(247,243,238,0.96)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
      padding: isMobile ? '10px 14px' : '11px 24px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {(isMobile || isTablet) && (
        <button onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: 8, flexShrink: 0 }}>
          <Menu size={20} color={C.coffee} />
        </button>
      )}

      {/* Breadcrumb — desktop only */}
      {isDesktop && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: C.gray, fontFamily: FONT }}>Admin</span>
          <ChevronRight size={11} color={C.gray} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.coffee, fontFamily: FONT }}>{meta?.label}</span>
        </div>
      )}

      {/* Page title on mobile/tablet */}
      {(isMobile || isTablet) && (
        <span style={{ fontSize: 14, fontWeight: 700, color: C.coffee, fontFamily: FONT, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta?.label}</span>
      )}

      {/* Search — desktop only */}
      {isDesktop && (
        <div style={{ position: 'relative', flex: 1, maxWidth: 340, margin: '0 auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.gray }} />
          <input placeholder="Search users, transactions, disputes…"
            style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 12, fontFamily: FONT, outline: 'none', color: C.coffee, background: C.white, boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = C.green)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
        {/* Fraud alert pill — tablet+ */}
        {fraudCount > 0 && !isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: C.redLight, border: `1px solid ${C.red}30`, cursor: 'pointer' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.red, animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.red, fontFamily: FONT, whiteSpace: 'nowrap' }}>{fraudCount} Alerts</span>
          </div>
        )}

        {/* Notifications */}
        <button onClick={onNotifClick} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 8, display: 'flex' }}>
          <Bell size={18} color={C.coffee} />
          {unread > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: 3, right: 3, width: 15, height: 15, borderRadius: '50%', background: C.copper, color: '#fff', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: FONT }}>{unread}</motion.span>
          )}
        </button>

        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setAvatarOpen(!avatarOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.goldLight, border: `2px solid ${C.gold}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: C.gold, fontFamily: FONT }}>A</div>
            {isDesktop && (
              <>
                <div style={{ lineHeight: 1.2 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.coffee, fontFamily: FONT }}>Admin</p>
                  <p style={{ margin: 0, fontSize: 9, color: C.gray, fontFamily: FONT }}>{adminEmail.split('@')[0]}</p>
                </div>
                <ChevronDown size={11} color={C.gray} />
              </>
            )}
          </button>

          <AnimatePresence>
            {avatarOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 59 }} onClick={() => setAvatarOpen(false)} />
                <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 190, background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: `0 16px 48px ${C.shadow}`, zIndex: 60, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 13px', background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: FONT }}>Super Admin</p>
                    <p style={{ fontSize: 10, color: C.gray, margin: '2px 0 0', fontFamily: FONT, wordBreak: 'break-all' }}>{adminEmail}</p>
                  </div>
                  <div style={{ padding: 5 }}>
                    <button onClick={() => { onLogout(); setAvatarOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 7, cursor: 'pointer', color: C.red, fontSize: 12, fontFamily: FONT }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = C.redLight)}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────────
function NotifPanel({ open, onClose, isMobile }: { open: boolean; onClose: () => void; isMobile: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 79 }} onClick={onClose} />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 80, width: isMobile ? '100vw' : 320, background: C.white, borderLeft: `1px solid ${C.border}`, boxShadow: `-16px 0 48px ${C.shadow}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, fontFamily: FONT, margin: 0 }}>Notifications</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: C.gray }}><X size={17} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 18px' }}>
              {DEMO_ACTIVITY.map((a, i) => <FeedItem key={i} {...a} />)}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'warning' | 'danger' | 'info';
interface ToastState { message: string; type: ToastType }

function Toast({ message, type = 'success', onDismiss }: { message: string; type?: ToastType; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3200); return () => clearTimeout(t); }, [onDismiss]);
  const cfg = {
    success: { bg: C.coffee,  icon: CheckCircle2,  iconColor: C.gold      },
    warning: { bg: '#5A3E00', icon: AlertTriangle,  iconColor: C.gold      },
    danger:  { bg: '#5C1A1A', icon: ShieldAlert,    iconColor: '#FF6B6B'   },
    info:    { bg: '#1A2E4A', icon: Bell,           iconColor: '#74B9FF'   },
  }[type];
  const Icon = cfg.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
      style={{ position: 'fixed', bottom: 24, right: 16, zIndex: 300, background: cfg.bg, color: C.ivory, padding: '12px 18px', borderRadius: 12, fontSize: 13, fontFamily: FONT, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', gap: 9, maxWidth: 'calc(100vw - 32px)', cursor: 'pointer' }}
      onClick={onDismiss}>
      <Icon size={15} color={cfg.iconColor} style={{ flexShrink: 0 }} />
      <span style={{ wordBreak: 'break-word' }}>{message}</span>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const width     = useWindowWidth();
  const isMobile  = width < 640;
  const isTablet  = width >= 640 && width < 1100;
  const isDesktop = width >= 1100;

  const [activePage,  setActivePage]  = useState<NavKey>('overview');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [toast,       setToast]       = useState<ToastState | null>(null);
  const [adminEmail,  setAdminEmail]  = useState('');
  const [loading,     setLoading]     = useState(true);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = '/login'; return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists() || !snap.data()?.isAdmin) { window.location.href = '/'; return; }
      setAdminEmail(user.email ?? '');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => { await signOut(auth); window.location.href = '/login'; };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':      return <OverviewView isMobile={isMobile} isTablet={isTablet} />;
      case 'users':         return <UsersView showToast={showToast} isMobile={isMobile} />;
      case 'fraud':         return <FraudView showToast={showToast} isMobile={isMobile} isTablet={isTablet} />;
      case 'transactions':  return <TransactionsView />;
      case 'escrow':        return <EscrowView showToast={showToast} isMobile={isMobile} />;
      case 'reports':       return <ReportsView showToast={showToast} isMobile={isMobile} />;
      case 'analytics':     return <AnalyticsView isMobile={isMobile} isTablet={isTablet} />;
      case 'disputes':      return <DisputesView showToast={showToast} isMobile={isMobile} />;
      case 'revenue':       return <RevenueView isMobile={isMobile} isTablet={isTablet} />;
      case 'notifications': return <NotificationsView />;
      case 'settings':      return <AdminSettingsView adminEmail={adminEmail} isMobile={isMobile} isTablet={isTablet} />;
      default:              return <OverviewView isMobile={isMobile} isTablet={isTablet} />;
    }
  };

  const meta = NAV_ITEMS.find(n => n.key === activePage);

  // Mobile bottom nav items (first 5 + show active if not in first 5)
  const BOTTOM_NAV = NAV_ITEMS.slice(0, 5);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.gray, fontSize: 14 }}>
        Verifying admin access…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', fontFamily: FONT }}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.rodeo}60; border-radius: 99px; }
        button { -webkit-appearance: none; touch-action: manipulation; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Sidebar: fixed on desktop, drawer on tablet & mobile */}
      {isDesktop ? (
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
          <Sidebar activePage={activePage} onNav={setActivePage} isMobile={false} open={true} onClose={() => {}} />
        </div>
      ) : (
        <Sidebar activePage={activePage} onNav={setActivePage} isMobile={true} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      {/* Main content area */}
      <div style={{ marginLeft: isDesktop ? 240 : 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        <Topbar
          page={activePage} isMobile={isMobile} isTablet={isTablet}
          onMenuClick={() => setDrawerOpen(true)}
          adminEmail={adminEmail}
          fraudCount={DEMO_FRAUD_ALERTS.filter(f => f.status === 'high').length}
          onNotifClick={() => setNotifOpen(true)}
          unread={DEMO_ACTIVITY.filter(a => a.isNew).length}
          onLogout={handleLogout}
        />

        <main style={{
          flex: 1,
          padding: isMobile ? '16px 12px 80px' : isTablet ? '20px 18px 40px' : '24px 28px 48px',
          overflowX: 'hidden',
          minWidth: 0,
        }}>
          <motion.div
            key={activePage + '-hdr'}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            style={{ marginBottom: isMobile ? 16 : 20 }}
          >
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: C.coffee, fontFamily: FONT, margin: '0 0 3px', letterSpacing: '-0.025em' }}>
              {meta?.label}
            </h1>
            {!isMobile && (
              <p style={{ fontSize: 12, color: C.gray, fontFamily: FONT, margin: 0 }}>
                {{
                  overview:      'Platform-wide performance at a glance.',
                  users:         'Manage talent and visionary accounts.',
                  fraud:         'AI-powered risk monitoring and suspicious activity.',
                  transactions:  'Full audit trail of all platform transactions.',
                  escrow:        'Milestone releases, disputes, and commissions.',
                  reports:       'Downloadable PDF summaries and audit documents.',
                  analytics:     'Deep-dive data visualisations across all metrics.',
                  disputes:      'Active and resolved dispute cases.',
                  revenue:       'Commission tracking, payouts, and revenue breakdown.',
                  notifications: 'All system alerts, fraud flags, and platform events.',
                  settings:      'Platform configuration and admin profile.',
                }[activePage]}
              </p>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {renderPage()}
          </AnimatePresence>
        </main>

        {/* Mobile bottom navigation bar */}
        {isMobile && (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
            background: 'rgba(247,243,238,0.97)',
            backdropFilter: 'blur(12px)',
            borderTop: `1px solid ${C.border}`,
            display: 'flex', justifyContent: 'space-around',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
            {BOTTOM_NAV.map(({ key, label, icon: Icon }) => {
              const isActive = activePage === key;
              return (
                <button key={key} onClick={() => setActivePage(key)} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 3, padding: '10px 4px 8px', background: 'none', border: 'none',
                  cursor: 'pointer', color: isActive ? C.green : C.gray,
                  position: 'relative',
                }}>
                  {isActive && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, background: C.green }} />}
                  <Icon size={18} />
                  <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, fontFamily: FONT, letterSpacing: '0.02em' }}>
                    {label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
            {/* "More" button opens drawer for remaining nav items */}
            <button onClick={() => setDrawerOpen(true)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: C.gray }}>
              <Menu size={18} />
              <span style={{ fontSize: 9, fontFamily: FONT, letterSpacing: '0.02em' }}>More</span>
            </button>
          </nav>
        )}
      </div>

      <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} isMobile={isMobile} />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}