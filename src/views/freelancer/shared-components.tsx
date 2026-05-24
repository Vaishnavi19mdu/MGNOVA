'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Activity, CheckCircle, Clock } from 'lucide-react';
import { C, s, Milestone } from './types-and-data';

// ─── Logo ─────────────────────────────────────────────────────────────────────
export const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
    <span style={{ fontSize: collapsed ? 18 : 22, fontWeight: 800, color: '#F7F3EE', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>MG</span>
    <span style={{ fontSize: collapsed ? 18 : 22, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>NOVA</span>
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({
  initials, size = 36, bg = C.greenLight, color = C.green,
}: { initials: string; size?: number; bg?: string; color?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = C.green }: { children: React.ReactNode; color?: string }) {
  return <span style={s.tag(color)}>{children}</span>;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider() {
  return <div style={{ height: 1, background: `${C.rodeo}30`, margin: '4px 0' }} />;
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = C.green }: { value: number; color?: string }) {
  return (
    <div style={{ height: 4, background: `${C.rodeo}25`, borderRadius: 99, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        style={{ height: '100%', background: color, borderRadius: 99 }}
      />
    </div>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────
export function StarRating({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i} size={size}
          fill={i <= Math.round(value) ? C.gold : 'none'}
          color={i <= Math.round(value) ? C.gold : C.rodeo}
        />
      ))}
    </span>
  );
}

// ─── useWindowSize ────────────────────────────────────────────────────────────
export function useWindowSize() {
  const [size, setSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
export function Modal({
  open, onClose, title, children, width = 520,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(75,54,47,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }}
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(75,54,47,0.18)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${C.rodeo}30` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px 22px' }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── AnalyticsCard ────────────────────────────────────────────────────────────
export function AnalyticsCard({ data, index }: { data: { label: string; value: string; trend: string; positive: boolean; icon: any }; index: number }) {
  const Icon = data.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }} whileHover={{ y: -2 }}
      style={{ ...s.card, cursor: 'default', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${C.green}08` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={C.green} />
        </div>
        <span style={{ ...s.tag(data.positive ? C.green : C.copper), fontSize: 10 }}>{data.trend}</span>
      </div>
      <p style={{ ...s.label, marginBottom: 3 }}>{data.label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: C.coffee, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{data.value}</p>
    </motion.div>
  );
}

// ─── MilestoneCard ────────────────────────────────────────────────────────────
export function MilestoneCard({ m, index }: { m: Milestone; index: number }) {
  const cfg = ({
    completed:   { color: C.green,  label: 'Completed',   Icon: CheckCircle },
    'in-progress': { color: C.gold, label: 'In Progress',  Icon: Activity    },
    pending:     { color: C.gray,   label: 'Pending',      Icon: Clock       },
  } as Record<string, { color: string; label: string; Icon: any }>)[m.status] || { color: C.gray, label: 'Pending', Icon: Clock };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.07 }} whileHover={{ y: -2 }}
      style={s.card}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
          <p style={{ ...s.label, margin: '3px 0 0' }}>{m.project}</p>
        </div>
        <Badge color={cfg.color}><cfg.Icon size={10} /> {cfg.label}</Badge>
      </div>
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: C.green, fontFamily: "'DM Sans', sans-serif" }}>{m.amount}</span>
        <span style={s.label}>Due {m.dueDate}</span>
      </div>
    </motion.div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Logo />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }}
          />
        ))}
      </div>
    </div>
  );
}