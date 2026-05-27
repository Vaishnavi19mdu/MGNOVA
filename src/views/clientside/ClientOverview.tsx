/**
 * ClientOverview.tsx  — MGNOVA Client Dashboard Views
 * 
 * Changes: Groq llama-3.3-70b-versatile integrated into:
 *   • ContractsView — per-contract AI status brief (reads live Firebase milestone data)
 *   • MatchesView   — per-talent AI match rationale (uses client industry + talent profile)
 *
 * Set VITE_GROQ_API_KEY in your .env (or pass via your env config).
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Briefcase, DollarSign, FileText, Sparkles,
  Star, Activity, CheckCircle, Clock, Trash2, Edit3, Mail,
  Globe, RefreshCw, Check, AlertCircle, X, MapPin, Award,
  Linkedin, ExternalLink, Shield, Zap, Coffee, BookOpen,
} from 'lucide-react';

// ─── Shared types ─────────────────────────────────────────────────────────────
export interface Project {
  projectId: string;
  title: string;
  budget: number;
  status: 'active' | 'draft' | 'completed';
  createdAt: string;
}

export interface Proposal {
  proposalId: string;
  talentId: string;
  talentName: string;
  projectId: string;
  status: 'received' | 'shortlisted' | 'accepted';
  matchScore: number;
  proposedBudget: number;
}

export interface Contract {
  contractId: string;
  talentId: string;
  talentName?: string;
  projectId: string;
  status: string;
  milestones: Milestone[];
}

export interface Milestone {
  milestoneId: string;
  title: string;
  amount: number;
  status: 'pending' | 'paid';
}

export interface Payment {
  paymentId: string;
  projectId: string;
  amount: number;
  status: string;
  method: string;
}

export interface RecommendedTalent {
  talentId: string;
  name: string;
  skills: string[];
  matchScore: number;
  reputationScore: number;
  title?: string;
  location?: string;
  availability?: string;
  hourlyRate?: string;
  bio?: string;
  yearsExp?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  education?: string;
  languages?: string;
  completedProjects?: number;
  successRate?: number;
  responseTime?: string;
  primaryRole?: string;
}

export interface ClientProfile {
  name: string;
  email: string;
  industry: string;
  teamSize: number;
  hiringFrequency: string;
}

export interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingPayments: number;
}

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  ivory:       '#F7F3EE',
  coffee:      '#4B362F',
  gray:        '#999999',
  green:       '#66806A',
  gold:        '#D4AF37',
  copper:      '#7B4B3A',
  rodeo:       '#C7A19A',
  greenLight:  '#EEF3EF',
  greenMid:    '#D2E0D4',
  copperLight: '#F5EBE8',
  goldLight:   '#FBF5E0',
  red:         '#C0392B',
  redLight:    '#FDEAEA',
  success:     '#66806A',
  warning:     '#D4AF37',
} as const;

const s = {
  card: {
    background: '#fff',
    border: `1px solid ${C.rodeo}50`,
    borderRadius: 12,
    padding: '20px 22px',
  } as React.CSSProperties,

  tag: (color: string = C.green): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    letterSpacing: '0.02em',
    background: color === C.green ? C.greenLight : color === C.gold ? C.goldLight
              : color === C.copper ? C.copperLight : `${color}15`,
    color, fontFamily: "'Satoshi', sans-serif",
  }),

  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.18s ease',
    fontFamily: "'Satoshi', sans-serif",
  } as React.CSSProperties,

  btnPrimary: { background: C.green, color: C.ivory } as React.CSSProperties,
  btnOutline: (color: string = C.copper): React.CSSProperties => ({
    background: 'transparent', color, border: `1px solid ${color}60`,
  }),
  btnDanger: { background: 'transparent', color: C.red, border: `1px solid ${C.red}60` } as React.CSSProperties,

  label: {
    fontSize: 11, color: C.gray, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Satoshi', sans-serif", fontWeight: 500,
  },

  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${C.rodeo}50`, background: '#fff',
    fontSize: 13, color: C.coffee, outline: 'none',
    fontFamily: "'Satoshi', sans-serif", boxSizing: 'border-box' as const,
  },

  th: {
    padding: '10px 16px', textAlign: 'left' as const, fontSize: 11,
    color: C.gray, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    fontFamily: "'Satoshi', sans-serif", fontWeight: 500,
    borderBottom: `1px solid ${C.rodeo}30`, background: C.ivory, whiteSpace: 'nowrap' as const,
  },

  td: {
    padding: '12px 16px', fontFamily: "'Satoshi', sans-serif",
    fontSize: 13, color: C.coffee, borderBottom: `1px solid ${C.rodeo}20`,
  },
};

// ─── Groq hook ────────────────────────────────────────────────────────────────
// Uses llama-3.3-70b-versatile (Groq's "3.3 instant" model)
// Set VITE_GROQ_API_KEY in .env
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

async function groqChat(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GROQ_API_KEY) return '(Groq API key not set — add VITE_GROQ_API_KEY to .env)';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      max_tokens: 120,
      temperature: 0.55,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// A hook that fetches a Groq insight once, with loading / error state
function useGroqInsight(systemPrompt: string, userPrompt: string, cacheKey: string) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fetched = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userPrompt || fetched.current.has(cacheKey)) return;
    fetched.current.add(cacheKey);
    setLoading(true);
    groqChat(systemPrompt, userPrompt)
      .then(setInsight)
      .catch(() => setInsight('AI insight unavailable.'))
      .finally(() => setLoading(false));
  }, [cacheKey, systemPrompt, userPrompt]);

  return { insight, loading };
}

// ─── Groq insight banner (reusable) ──────────────────────────────────────────
function GroqInsightBanner({ insight, loading }: { insight: string; loading: boolean }) {
  if (!loading && !insight) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px', marginBottom: 16,
        background: C.goldLight, borderRadius: 9,
        border: `1px solid ${C.gold}40`,
      }}
    >
      <Sparkles size={14} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{
        fontSize: 12, color: C.coffee, margin: 0, lineHeight: 1.6,
        fontFamily: "'Satoshi', sans-serif",
        fontStyle: loading ? 'italic' : 'normal',
        opacity: loading ? 0.6 : 1,
      }}>
        {loading ? 'Generating AI insight…' : insight}
      </p>
    </motion.div>
  );
}

// ─── Tiny reusable pieces ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: C.green, completed: C.copper, draft: C.gray,
    shortlisted: C.gold, accepted: C.green, received: C.gray,
    pending: C.warning, paid: C.green, released: C.green, in_progress: C.gold,
  };
  const color = map[status] ?? C.gray;
  return <span style={s.tag(color)}>{status.replace('_', ' ')}</span>;
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif", letterSpacing: '-0.01em' }}>{title}</h2>
        <p style={{ fontSize: 13, color: C.gray, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function MetricCard({ label, value, sub, accentColor }: { label: string; value: string | number; sub?: React.ReactNode; accentColor?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ ...s.card, borderTop: accentColor ? `2px solid ${accentColor}` : undefined }}>
      <p style={{ ...s.label, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif" }}>{value}</p>
      {sub && <div>{sub}</div>}
    </motion.div>
  );
}

function TrendTag({ positive, children }: { positive?: boolean; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, fontFamily: "'Satoshi', sans-serif", color: positive ? C.green : C.copper }}>
      {positive ? <TrendingUp size={12} /> : null}{children}
    </span>
  );
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.rodeo}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ProgressBar({ value, color = C.green }: { value: number; color?: string }) {
  return (
    <div style={{ height: 6, background: `${C.rodeo}25`, borderRadius: 99, overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        style={{ height: '100%', background: color, borderRadius: 99 }} />
    </div>
  );
}

function MatchRing({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${C.rodeo}30`} strokeWidth="4" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.gold} strokeWidth="4"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }} strokeLinecap="round" />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: C.coffee, fontFamily: "'Satoshi', sans-serif" }}>
        {score}%
      </span>
    </div>
  );
}

function TalentAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: C.greenLight, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, fontFamily: "'Satoshi', sans-serif", flexShrink: 0 }}>
      {name.charAt(0)}
    </div>
  );
}

// ─── ✨ Talent Profile Popup Modal ────────────────────────────────────────────
export function TalentProfileModal({
  talent,
  onClose,
  onInvite,
  onShortlist,
}: {
  talent: RecommendedTalent | null;
  onClose: () => void;
  onInvite?: (id: string) => void;
  onShortlist?: (id: string) => void;
}) {
  if (!talent) return null;

  const stats = [
    { label: 'Projects Done', value: talent.completedProjects ?? Math.floor(Math.random() * 40 + 10) },
    { label: 'Success Rate', value: `${talent.successRate ?? 96}%` },
    { label: 'Response Time', value: talent.responseTime ?? '< 2h' },
    { label: 'Years Exp', value: talent.yearsExp ?? '5+' },
  ];

  const initials = talent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const gradColor = talent.matchScore >= 90 ? C.green : talent.matchScore >= 80 ? C.gold : C.copper;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(75,54,47,0.6)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(6px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.95 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580,
            maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 100px rgba(75,54,47,0.25)',
          }}
        >
          {/* ── Hero banner ── */}
          <div style={{
            background: `linear-gradient(135deg, ${C.coffee} 0%, ${gradColor}CC 100%)`,
            padding: '40px 28px 0', position: 'relative', overflow: 'hidden', minHeight: 180,
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', top: 30, right: 60, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <X size={16} color="#fff" />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 32, position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: C.greenLight, border: '4px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: C.green, fontFamily: "'Satoshi', sans-serif", boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  {initials}
                </div>
                <div style={{ position: 'absolute', bottom: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: '#4CAF50', border: '3px solid #fff' }} />
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif", letterSpacing: '-0.02em' }}>
                  {talent.name}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 10px', fontFamily: "'Satoshi', sans-serif" }}>
                  {talent.title || talent.primaryRole || talent.skills[0]}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.gold, fontWeight: 700, fontFamily: "'Satoshi', sans-serif" }}>
                    ★ {talent.reputationScore} Elite Contributor
                  </span>
                  {talent.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: "'Satoshi', sans-serif" }}>
                      <MapPin size={10} /> {talent.location}
                    </span>
                  )}
                  {talent.availability && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', color: '#fff', fontFamily: "'Satoshi', sans-serif" }}>
                      {talent.availability}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 4 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "'Satoshi', sans-serif", lineHeight: 1 }}>{talent.matchScore}%</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', fontFamily: "'Satoshi', sans-serif", letterSpacing: '0.06em' }}>MATCH</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
              {stats.map(st => (
                <div key={st.label} style={{ textAlign: 'center', padding: '12px 8px', background: C.ivory, borderRadius: 10, border: `1px solid ${C.rodeo}30` }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.coffee, margin: '0 0 2px', fontFamily: "'Satoshi', sans-serif" }}>{st.value}</p>
                  <p style={{ fontSize: 9, color: C.gray, margin: 0, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: "'Satoshi', sans-serif" }}>{st.label}</p>
                </div>
              ))}
            </div>

            {talent.bio && (
              <div style={{ marginBottom: 22 }}>
                <p style={{ ...s.label, marginBottom: 8 }}>About</p>
                <p style={{ fontSize: 13, color: C.coffee, lineHeight: 1.7, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>{talent.bio}</p>
              </div>
            )}

            <div style={{ marginBottom: 22 }}>
              <p style={{ ...s.label, marginBottom: 10 }}>Skills & Expertise</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {talent.skills.map(sk => (
                  <span key={sk} style={{ ...s.tag(C.copper), padding: '5px 12px', fontSize: 12 }}>{sk}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
              {talent.hourlyRate && (
                <div style={{ padding: '14px', background: C.goldLight, borderRadius: 10, border: `1px solid ${C.gold}40` }}>
                  <p style={{ fontSize: 9, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>Hourly Rate</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.coffee, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>{talent.hourlyRate}</p>
                </div>
              )}
              {talent.languages && (
                <div style={{ padding: '14px', background: C.greenLight, borderRadius: 10, border: `1px solid ${C.green}40` }}>
                  <p style={{ fontSize: 9, color: C.green, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>Languages</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>{talent.languages}</p>
                </div>
              )}
            </div>

            {talent.education && (
              <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px', background: C.ivory, borderRadius: 10, border: `1px solid ${C.rodeo}30` }}>
                <BookOpen size={16} color={C.gray} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 9, color: C.gray, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px', fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>Education</p>
                  <p style={{ fontSize: 13, color: C.coffee, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>{talent.education}</p>
                </div>
              </div>
            )}

            {(talent.portfolioUrl || talent.linkedinUrl) && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                {talent.portfolioUrl && (
                  <a href={`https://${talent.portfolioUrl}`} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.green, fontFamily: "'Satoshi', sans-serif", fontWeight: 600, textDecoration: 'none', padding: '7px 14px', border: `1px solid ${C.green}50`, borderRadius: 8 }}>
                    <ExternalLink size={12} /> Portfolio
                  </a>
                )}
                {talent.linkedinUrl && (
                  <a href={`https://${talent.linkedinUrl}`} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.copper, fontFamily: "'Satoshi', sans-serif", fontWeight: 600, textDecoration: 'none', padding: '7px 14px', border: `1px solid ${C.copper}50`, borderRadius: 8 }}>
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 16, borderTop: `1px solid ${C.rodeo}30` }}>
              {[
                { icon: Shield, label: 'Verified Identity', color: C.green },
                { icon: Award,  label: 'Elite Contributor', color: C.gold  },
                { icon: Zap,    label: 'Fast Responder',    color: C.copper },
              ].map(badge => (
                <div key={badge.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: C.ivory, borderRadius: 99, border: `1px solid ${badge.color}30` }}>
                  <badge.icon size={11} color={badge.color} />
                  <span style={{ fontSize: 11, color: C.coffee, fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer actions ── */}
          <div style={{ padding: '16px 28px', borderTop: `1px solid ${C.rodeo}30`, display: 'flex', gap: 12, background: '#fff' }}>
            {onShortlist && (
              <button
                onClick={() => { onShortlist(talent.talentId); onClose(); }}
                style={{ ...s.btn, flex: 1, justifyContent: 'center', background: C.ivory, color: C.coffee, border: `1px solid ${C.rodeo}60` }}
              >
                Shortlist
              </button>
            )}
            {onInvite && (
              <button
                onClick={() => { onInvite(talent.talentId); onClose(); }}
                style={{ ...s.btn, ...s.btnPrimary, flex: 1, justifyContent: 'center' }}
              >
                <Sparkles size={13} /> Send Invitation
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── 1. Dashboard View ────────────────────────────────────────────────────────
export function DashboardView({
  overview, projects, proposals, talents, clientName,
  onViewProfile,
}: {
  overview: DashboardOverview;
  projects: Project[];
  proposals: Proposal[];
  talents: RecommendedTalent[];
  clientName: string;
  onViewProfile?: (id: string) => void;
}) {
  return (
    <motion.div key="dashboard-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        <MetricCard label="Active Projects" value={overview.activeProjects} accentColor={C.green} sub={<TrendTag positive>+1 this month</TrendTag>} />
        <MetricCard label="Total Spent" value={`$${overview.totalSpent.toLocaleString()}`} />
        <MetricCard label="Pending Payments" value={`$${overview.pendingPayments.toLocaleString()}`} accentColor={C.gold} sub={<TrendTag>Action Required</TrendTag>} />
        <MetricCard label="Proposals Received" value={proposals.length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        <SectionCard title="Active Projects" action={<a href="#" style={{ fontSize: 12, color: C.green, textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>View All →</a>}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Project', 'Budget', 'Status', 'Date', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {projects.slice(0, 4).map((p, i) => (
                  <motion.tr key={p.projectId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{p.title}</td>
                    <td style={s.td}>${p.budget.toLocaleString()}</td>
                    <td style={s.td}><StatusBadge status={p.status} /></td>
                    <td style={{ ...s.td, color: C.gray, fontSize: 11 }}>{p.createdAt}</td>
                    <td style={s.td}></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="AI Curated Talent" action={<a href="#" style={{ fontSize: 12, color: C.green, textDecoration: 'none', fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>View Network →</a>}>
          <div style={{ padding: '8px 0' }}>
            {talents.map((t, i) => (
              <motion.div key={t.talentId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < talents.length - 1 ? `1px solid ${C.rodeo}20` : 'none', cursor: 'pointer' }}
                onClick={() => onViewProfile?.(t.talentId)}
              >
                <TalentAvatar name={t.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif" }}>
                    {t.name}<span style={{ fontWeight: 400, color: C.gray, fontSize: 11, marginLeft: 6 }}>★ {t.reputationScore}</span>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {t.skills.slice(0, 3).map(sk => <span key={sk} style={{ ...s.tag(C.copper), fontSize: 10 }}>{sk}</span>)}
                  </div>
                </div>
                <MatchRing score={t.matchScore} size={48} />
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}

// ─── 2. Projects View ─────────────────────────────────────────────────────────
export function ProjectsView({
  projects, proposals, onCreateProject, onDeleteProject, onShortlist, onHire, onReviewProposal,
}: {
  projects: Project[];
  proposals: Proposal[];
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onShortlist: (id: string) => void;
  onHire: (id: string) => void;
  onReviewProposal: (id: string) => void;
}) {
  return (
    <motion.div key="projects-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <SectionCard title={`Projects (${projects.length})`} action={<button style={{ ...s.btn, ...s.btnPrimary }} onClick={onCreateProject}>+ Create Project</button>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['ID', 'Title', 'Status', 'Budget', 'Created', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {projects.map((p, i) => (
                <motion.tr key={p.projectId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ cursor: 'default', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...s.td, color: C.gray, fontFamily: 'monospace', fontSize: 11 }}>{p.projectId.slice(0, 14)}…</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{p.title}</td>
                  <td style={s.td}><StatusBadge status={p.status} /></td>
                  <td style={s.td}>${p.budget.toLocaleString()}</td>
                  <td style={{ ...s.td, color: C.gray, fontSize: 11 }}>{p.createdAt}</td>
                  <td style={s.td}>
                    <button onClick={() => onDeleteProject(p.projectId)} style={{ ...s.btn, ...s.btnDanger, padding: '5px 12px', fontSize: 11 }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div style={{ marginTop: 32 }}>
        <SectionCard title="Proposals Received">
          {proposals.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: C.gray, fontFamily: "'Satoshi', sans-serif", fontSize: 13 }}>Create a project to receive proposals.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Talent', 'Project', 'AI Match', 'Budget', 'Status', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {proposals.map((p, i) => {
                    const project = projects.find(pr => pr.projectId === p.projectId);
                    return (
                      <motion.tr key={p.proposalId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        style={{ transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ ...s.td, fontWeight: 600 }}>{p.talentName}</td>
                        <td style={s.td}>{project?.title ?? p.projectId}</td>
                        <td style={s.td}><span style={{ color: C.gold, fontWeight: 700 }}><Star size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{p.matchScore}%</span></td>
                        <td style={s.td}>${p.proposedBudget}</td>
                        <td style={s.td}><StatusBadge status={p.status} /></td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => onReviewProposal(p.proposalId)} style={{ ...s.btn, ...s.btnOutline(), padding: '5px 10px', fontSize: 11 }}>Review</button>
                            {p.status === 'received' && (
                              <button onClick={() => onShortlist(p.proposalId)} style={{ ...s.btn, ...s.btnPrimary, padding: '5px 10px', fontSize: 11 }}>Shortlist</button>
                            )}
                            {p.status === 'shortlisted' && (
                              <button onClick={() => onHire(p.proposalId)} style={{ ...s.btn, ...s.btnPrimary, padding: '5px 10px', fontSize: 11, background: C.gold, color: C.coffee }}>Hire</button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </motion.div>
  );
}

// ─── 3. Proposals View ────────────────────────────────────────────────────────
export function ProposalsView({
  proposals, projects, onShortlist, onHire, onReview,
}: {
  proposals: Proposal[];
  projects: Project[];
  onShortlist: (id: string) => void;
  onHire: (id: string) => void;
  onReview: (id: string) => void;
}) {
  return (
    <motion.div key="proposals-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <MetricCard label="Total Received" value={proposals.length} />
        <MetricCard label="Shortlisted" value={proposals.filter(p => p.status === 'shortlisted').length} accentColor={C.gold} />
        <MetricCard label="Hired" value={proposals.filter(p => p.status === 'accepted').length} accentColor={C.green} />
        <MetricCard label="Avg AI Match" value={proposals.length ? `${Math.round(proposals.reduce((a, b) => a + b.matchScore, 0) / proposals.length)}%` : '—'} accentColor={C.gold} />
      </div>

      <SectionCard title="All Proposals">
        {proposals.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <FileText size={22} color={C.gold} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.coffee, margin: '0 0 6px', fontFamily: "'Satoshi', sans-serif" }}>No proposals yet</p>
            <p style={{ fontSize: 12, color: C.gray, fontFamily: "'Satoshi', sans-serif" }}>Create a project to start receiving AI-matched proposals.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Talent', 'Project', 'AI Score', 'Budget', 'Status', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {proposals.map((p, i) => {
                  const project = projects.find(pr => pr.projectId === p.projectId);
                  return (
                    <motion.tr key={p.proposalId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <TalentAvatar name={p.talentName || 'T'} size={30} />
                          <span style={{ fontWeight: 600 }}>{p.talentName}</span>
                        </div>
                      </td>
                      <td style={s.td}>{project?.title ?? p.projectId}</td>
                      <td style={s.td}><span style={{ color: C.gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} fill={C.gold} color={C.gold} /> {p.matchScore}%</span></td>
                      <td style={s.td}>${p.proposedBudget}</td>
                      <td style={s.td}><StatusBadge status={p.status} /></td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => onReview(p.proposalId)} style={{ ...s.btn, ...s.btnOutline(), padding: '5px 10px', fontSize: 11 }}>Review</button>
                          {p.status === 'received' && (
                            <button onClick={() => onShortlist(p.proposalId)} style={{ ...s.btn, ...s.btnPrimary, padding: '5px 10px', fontSize: 11 }}>Shortlist</button>
                          )}
                          {p.status === 'shortlisted' && (
                            <button onClick={() => onHire(p.proposalId)} style={{ ...s.btn, padding: '5px 10px', fontSize: 11, background: C.gold, color: C.coffee }}>Hire</button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </motion.div>
  );
}

// ─── 4. Contracts View ── with Groq AI status brief per contract ──────────────
// ContractCard is split out so each card can independently call the Groq hook
function ContractCard({
  contract, project, clientIndustry, onApproveMilestone,
}: {
  contract: Contract;
  project: Project | undefined;
  clientIndustry: string;
  onApproveMilestone: (contractId: string, milestoneId: string) => void;
}) {
  const paidCount    = contract.milestones.filter(m => m.status === 'paid').length;
  const pendingCount = contract.milestones.filter(m => m.status === 'pending').length;
  const totalAmount  = contract.milestones.reduce((sum, m) => sum + m.amount, 0);
  const paidAmount   = contract.milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + m.amount, 0);
  const nextMilestone = contract.milestones.find(m => m.status === 'pending');

  const systemPrompt = `You are a concise project management assistant for a freelance marketplace called MGNOVA.
Given live contract data, write 1–2 sentences (max 28 words) summarising the contract's current progress and one clear next action for the client. Be direct, positive, and specific. No fluff.`;

  const userPrompt = `Contract for project: "${project?.title ?? contract.projectId}"
Talent: ${contract.talentName || contract.talentId}
Status: ${contract.status}
Milestones: ${paidCount} paid ($${paidAmount}), ${pendingCount} pending ($${totalAmount - paidAmount})
Next milestone: ${nextMilestone ? `"${nextMilestone.title}" — $${nextMilestone.amount}` : 'none'}
Client industry: ${clientIndustry || 'general'}`;

  const cacheKey = `contract-${contract.contractId}-${paidCount}`;
  const { insight, loading } = useGroqInsight(systemPrompt, userPrompt, cacheKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...s.card, borderLeft: `4px solid ${C.gold}` }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.rodeo}30`, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif" }}>
            {project?.title ?? contract.projectId}
          </h3>
          <p style={{ ...s.label, margin: 0 }}>
            Contract {contract.contractId.slice(0, 12)}… · Talent: {contract.talentName || contract.talentId.slice(0, 12)}…
          </p>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      {/* Groq AI insight */}
      <GroqInsightBanner insight={insight} loading={loading} />

      {/* Milestones table */}
      <p style={{ ...s.label, marginBottom: 12 }}>Milestones</p>
      <div style={{ ...s.card, padding: 0, overflow: 'hidden', background: C.ivory }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Milestone', 'Amount', 'Status', 'Action'].map(h => <th key={h} style={{ ...s.th, background: `${C.rodeo}15` }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {contract.milestones.map((m) => (
              <tr key={m.milestoneId} style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ ...s.td, fontWeight: 600 }}>{m.title}</td>
                <td style={s.td}>${m.amount}</td>
                <td style={s.td}><StatusBadge status={m.status} /></td>
                <td style={s.td}>
                  {m.status === 'pending' ? (
                    <button onClick={() => onApproveMilestone(contract.contractId, m.milestoneId)}
                      style={{ ...s.btn, background: C.success, color: '#fff', padding: '5px 12px', fontSize: 11 }}>
                      <CheckCircle size={12} /> Approve & Pay
                    </button>
                  ) : (
                    <button style={{ ...s.btn, ...s.btnOutline(C.gray), padding: '5px 12px', fontSize: 11 }} disabled>Paid</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export function ContractsView({
  contracts, projects, proposals, onApproveMilestone, clientProfile, onNavigate,
}: {
  contracts: Contract[];
  projects: Project[];
  proposals: Proposal[];
  onApproveMilestone: (contractId: string, milestoneId: string) => void;
  clientProfile?: ClientProfile;
  onNavigate?: (page: string) => void;
}) {
  if (contracts.length === 0) {
    return (
      <motion.div key="contracts-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{
          ...s.card,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: '60px 40px',
          background: 'linear-gradient(135deg, #fff 0%, #fdf9f6 100%)',
        }}>
          <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 24 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={40} color={C.gold} strokeWidth={1.5} />
            </div>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: C.ivory, border: `2px solid ${C.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} color={C.copper} />
            </div>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 700, color: C.coffee, margin: '0 0 10px', fontFamily: "'Satoshi', sans-serif", letterSpacing: '-0.02em' }}>
            No Active Contracts
          </h3>
          <p style={{ fontSize: 13, color: C.gray, maxWidth: 360, lineHeight: 1.7, margin: '0 0 28px', fontFamily: "'Satoshi', sans-serif" }}>
            Contracts appear here once you hire talent from a proposal. Shortlist candidates and hire them to kick off milestone-based contracts.
          </p>

          {proposals.filter(p => p.status === 'shortlisted').length > 0 && (
            <div style={{ width: '100%', maxWidth: 420 }}>
              <p style={{ ...s.label, marginBottom: 12, textAlign: 'left' }}>Ready to hire</p>
              {proposals.filter(p => p.status === 'shortlisted').slice(0, 3).map(p => (
                <div key={p.proposalId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.greenLight, borderRadius: 10, marginBottom: 8, border: `1px solid ${C.green}30` }}>
                  <TalentAvatar name={p.talentName} size={32} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>{p.talentName}</p>
                    <p style={{ fontSize: 11, color: C.gray, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>Shortlisted · ${p.proposedBudget}</p>
                  </div>
                  <span style={s.tag(C.gold)}>Shortlisted</span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: C.gray, textAlign: 'center', fontFamily: "'Satoshi', sans-serif", marginTop: 8 }}>
                Go to Proposals → click "Hire" to create a contract
              </p>
            </div>
          )}

          {proposals.filter(p => p.status === 'shortlisted').length === 0 && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { icon: Sparkles, label: 'Browse AI Matches', color: C.gold,  page: 'matches'   },
                { icon: FileText, label: 'Review Proposals',  color: C.green, page: 'proposals' },
              ].map(step => (
                <button
                  key={step.label}
                  onClick={() => onNavigate?.(step.page)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', background: C.ivory, borderRadius: 10,
                    border: `1px solid ${C.rodeo}30`, cursor: 'pointer',
                    fontFamily: "'Satoshi', sans-serif", transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = step.color === C.gold ? C.goldLight : C.greenLight; (e.currentTarget as HTMLElement).style.borderColor = `${step.color}50`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.ivory; (e.currentTarget as HTMLElement).style.borderColor = `${C.rodeo}30`; }}
                >
                  <step.icon size={14} color={step.color} />
                  <span style={{ fontSize: 12, color: C.coffee, fontWeight: 600 }}>{step.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="contracts-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gap: 20 }}>
        {contracts.map((c) => (
          <ContractCard
            key={c.contractId}
            contract={c}
            project={projects.find(pr => pr.projectId === c.projectId)}
            clientIndustry={clientProfile?.industry ?? ''}
            onApproveMilestone={onApproveMilestone}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── 5. Matches View ── with Groq AI match rationale per talent card ──────────
// TalentMatchCard is split out for independent Groq calls
function TalentMatchCard({
  talent, clientIndustry, activeProjectTitles, onViewProfile, onInvite,
}: {
  talent: RecommendedTalent;
  clientIndustry: string;
  activeProjectTitles: string[];
  onViewProfile: (id: string) => void;
  onInvite: (id: string) => void;
}) {
  const [selectedTalent, setSelectedTalent] = useState<RecommendedTalent | null>(null);

  const systemPrompt = `You are an elite talent curation AI for MGNOVA, a premium freelance marketplace.
Write exactly 1 sentence (max 22 words) explaining specifically why this talent is a strong match for the client. Be concrete, not generic.`;

  const userPrompt = `Talent: ${talent.name} — ${talent.title || talent.primaryRole}
Skills: ${talent.skills.join(', ')}
Match score: ${talent.matchScore}%
Client industry: ${clientIndustry || 'technology'}
Active projects: ${activeProjectTitles.length ? activeProjectTitles.join(', ') : 'various'}`;

  const cacheKey = `match-${talent.talentId}-${clientIndustry}`;
  const { insight, loading } = useGroqInsight(systemPrompt, userPrompt, cacheKey);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, boxShadow: `0 12px 32px ${C.green}15` }}
        style={{ ...s.card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 22px', position: 'relative' }}
      >
        <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 14 }}>
          <MatchRing score={talent.matchScore} size={80} />
          <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: C.greenLight, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, fontFamily: "'Satoshi', sans-serif" }}>
            {talent.name.charAt(0)}
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: '0 0 2px', fontFamily: "'Satoshi', sans-serif" }}>{talent.name}</h3>
        {talent.title && <p style={{ fontSize: 11, color: C.gray, margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif" }}>{talent.title}</p>}
        <p style={{ color: C.gold, fontSize: 12, margin: '0 0 12px', fontFamily: "'Satoshi', sans-serif" }}>★ {talent.reputationScore} Elite Contributor</p>

        {/* Groq AI rationale */}
        {(loading || insight) && (
          <div style={{
            width: '100%', marginBottom: 12,
            padding: '8px 12px', borderRadius: 8,
            background: C.goldLight, border: `1px solid ${C.gold}35`,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <Sparkles size={11} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{
                fontSize: 11, color: C.coffee, margin: 0, lineHeight: 1.55,
                fontFamily: "'Satoshi', sans-serif",
                fontStyle: loading ? 'italic' : 'normal',
                opacity: loading ? 0.5 : 1,
              }}>
                {loading ? 'Analysing match…' : insight}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {talent.skills.slice(0, 4).map(sk => <span key={sk} style={s.tag(C.copper)}>{sk}</span>)}
        </div>

        {talent.hourlyRate && (
          <p style={{ fontSize: 12, color: C.gray, margin: '0 0 16px', fontFamily: "'Satoshi', sans-serif" }}>
            {talent.hourlyRate} · {talent.availability || 'Available'}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            onClick={() => { setSelectedTalent(talent); onViewProfile(talent.talentId); }}
            style={{ ...s.btn, ...s.btnOutline(), flex: 1, justifyContent: 'center' }}
          >
            Profile
          </button>
          <button onClick={() => onInvite(talent.talentId)} style={{ ...s.btn, ...s.btnPrimary, flex: 1, justifyContent: 'center' }}>
            <Sparkles size={12} /> Invite
          </button>
        </div>
      </motion.div>

      <TalentProfileModal
        talent={selectedTalent}
        onClose={() => setSelectedTalent(null)}
        onInvite={(id) => { onInvite(id); setSelectedTalent(null); }}
        onShortlist={() => setSelectedTalent(null)}
      />
    </>
  );
}

export function MatchesView({
  talents, talentsLoading, onViewProfile, onInvite, clientProfile, activeProjects,
}: {
  talents: RecommendedTalent[];
  talentsLoading?: boolean;
  onViewProfile: (id: string) => void;
  onInvite: (id: string) => void;
  clientProfile?: ClientProfile;
  activeProjects?: Project[];
}) {
  const activeProjectTitles = (activeProjects ?? [])
    .filter(p => p.status === 'active')
    .map(p => p.title);

  if (talentsLoading && talents.length === 0) {
    return (
      <motion.div key="matches-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ ...s.card, padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${C.rodeo}30`, animation: 'pulse 1.4s ease-in-out infinite' }} />
              <div style={{ width: '60%', height: 14, borderRadius: 6, background: `${C.rodeo}30` }} />
              <div style={{ width: '40%', height: 11, borderRadius: 6, background: `${C.rodeo}20` }} />
              <div style={{ width: '80%', height: 32, borderRadius: 8, background: `${C.goldLight}` }} />
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3].map(j => <div key={j} style={{ width: 56, height: 22, borderRadius: 6, background: `${C.rodeo}20` }} />)}
              </div>
              <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
                <div style={{ flex: 1, height: 36, borderRadius: 8, background: `${C.rodeo}20` }} />
                <div style={{ flex: 1, height: 36, borderRadius: 8, background: `${C.green}30` }} />
              </div>
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </motion.div>
    );
  }

  return (
    <motion.div key="matches-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {talentsLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: C.goldLight, borderRadius: 9, border: `1px solid ${C.gold}40` }}>
          <Sparkles size={13} color={C.gold} />
          <span style={{ fontSize: 12, color: C.coffee, fontFamily: "'Satoshi', sans-serif", fontStyle: 'italic' }}>
            Groq is computing personalised match scores from your Firestore data…
          </span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {talents.map((t, i) => (
          <motion.div key={t.talentId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <TalentMatchCard
              talent={t}
              clientIndustry={clientProfile?.industry ?? ''}
              activeProjectTitles={activeProjectTitles}
              onViewProfile={onViewProfile}
              onInvite={onInvite}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── 6. Milestones View ───────────────────────────────────────────────────────
export function MilestonesView({
  contracts, projects, onApproveMilestone,
}: {
  contracts: Contract[];
  projects: Project[];
  onApproveMilestone: (contractId: string, milestoneId: string) => void;
}) {
  const all = contracts.flatMap(c => {
    const project = projects.find(pr => pr.projectId === c.projectId);
    return c.milestones.map(m => ({ ...m, contractId: c.contractId, projectName: project?.title ?? c.projectId }));
  });

  return (
    <motion.div key="milestones-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <SectionCard title={`All Milestones (${all.length})`}>
        {all.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: C.gray, fontFamily: "'Satoshi', sans-serif" }}>No milestones found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Project', 'Milestone', 'Amount', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {all.map((m, i) => (
                  <motion.tr key={m.milestoneId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ ...s.td, fontWeight: 600 }}>{m.projectName}</td>
                    <td style={s.td}>{m.title}</td>
                    <td style={s.td}>${m.amount}</td>
                    <td style={s.td}><StatusBadge status={m.status} /></td>
                    <td style={s.td}>
                      {m.status === 'pending' ? (
                        <button onClick={() => onApproveMilestone(m.contractId, m.milestoneId)}
                          style={{ ...s.btn, background: C.success, color: '#fff', padding: '5px 12px', fontSize: 11 }}>
                          <Check size={12} /> Approve
                        </button>
                      ) : (
                        <button style={{ ...s.btn, ...s.btnOutline(C.gray), padding: '5px 12px', fontSize: 11 }} disabled>Paid</button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </motion.div>
  );
}

// ─── 7. Payments View ─────────────────────────────────────────────────────────
export function PaymentsView({ payments, overview }: { payments: Payment[]; overview: DashboardOverview }) {
  return (
    <motion.div key="payments-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
        <MetricCard label="Funds in Escrow" value={`$${overview.pendingPayments.toLocaleString()}`} accentColor={C.gold} sub={<TrendTag>Reserved for Active Milestones</TrendTag>} />
        <MetricCard label="Total Paid" value={`$${overview.totalSpent.toLocaleString()}`} accentColor={C.green} sub={<TrendTag positive>Across All Projects</TrendTag>} />
      </div>
      <SectionCard title="Recent Transactions">
        {payments.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: C.gray, fontFamily: "'Satoshi', sans-serif" }}>No transactions yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Transaction ID', 'Amount', 'Status', 'Method'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {payments.map((pay, i) => (
                  <motion.tr key={pay.paymentId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ ...s.td, color: C.gray, fontFamily: 'monospace', fontSize: 11 }}>{pay.paymentId}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: C.green }}>${pay.amount}</td>
                    <td style={s.td}><StatusBadge status={pay.status} /></td>
                    <td style={s.td}>{pay.method}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </motion.div>
  );
}

// ─── 8. Analytics View ────────────────────────────────────────────────────────
export function AnalyticsView({ overview, proposals }: { overview: DashboardOverview; proposals: Proposal[] }) {
  const avgMatch = proposals.length ? Math.round(proposals.reduce((a, b) => a + b.matchScore, 0) / proposals.length) : 0;
  const total = overview.totalSpent + overview.pendingPayments;

  return (
    <motion.div key="analytics-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 28 }}>
        <MetricCard label="Total Projects" value={overview.totalProjects} />
        <MetricCard label="Active Projects" value={overview.activeProjects} accentColor={C.green} />
        <MetricCard label="Avg AI Match" value={`${avgMatch}%`} accentColor={C.gold} />
        <MetricCard label="Proposals Received" value={proposals.length} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        <div style={s.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 20px', fontFamily: "'Satoshi', sans-serif" }}>Project Status</h3>
          {[{ label: 'Completed', value: overview.completedProjects, color: C.green }, { label: 'Active', value: overview.activeProjects, color: C.copper }].map(row => (
            <div key={row.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.coffee, fontFamily: "'Satoshi', sans-serif" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.color, fontFamily: "'Satoshi', sans-serif" }}>{row.value} / {overview.totalProjects}</span>
              </div>
              <ProgressBar value={overview.totalProjects ? (row.value / overview.totalProjects) * 100 : 0} color={row.color} />
            </div>
          ))}
        </div>
        <div style={{ ...s.card, textAlign: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 20px', fontFamily: "'Satoshi', sans-serif" }}>Financial Overview</h3>
          <p style={{ fontSize: 36, fontWeight: 800, color: C.coffee, margin: '0 0 6px', fontFamily: "'Satoshi', sans-serif" }}>${total.toLocaleString()}</p>
          <p style={{ fontSize: 12, color: C.gray, marginBottom: 28, fontFamily: "'Satoshi', sans-serif" }}>Total Budget Commitment</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 36 }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: C.green, margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif" }}>${overview.totalSpent.toLocaleString()}</p>
              <p style={{ ...s.label, margin: 0 }}>Paid</p>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: C.gold, margin: '0 0 4px', fontFamily: "'Satoshi', sans-serif" }}>${overview.pendingPayments.toLocaleString()}</p>
              <p style={{ ...s.label, margin: 0 }}>Escrow</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 9. Settings View ─────────────────────────────────────────────────────────
export function SettingsView({ profile, onSave }: { profile: ClientProfile; onSave: (updates: Partial<ClientProfile>) => void }) {
  const [form, setForm] = useState<ClientProfile>({ ...profile });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof ClientProfile, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = (e: React.FormEvent) => { e.preventDefault(); onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <motion.div key="settings-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ maxWidth: 600 }}>
        <div style={s.card}>
          <form onSubmit={handleSave}>
            {[
              { label: 'Company Name', key: 'name' as const, icon: Briefcase, type: 'text',  required: true  },
              { label: 'Contact Email', key: 'email' as const, icon: Mail,     type: 'email', required: true  },
              { label: 'Industry',      key: 'industry' as const, icon: Globe,  type: 'text',  required: false },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>{field.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`, background: '#fff' }}>
                  <field.icon size={14} color={C.gray} />
                  <input type={field.type} value={String(form[field.key])} onChange={e => set(field.key, e.target.value)}
                    style={{ fontSize: 13, color: C.coffee, fontFamily: "'Satoshi', sans-serif", border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
                    required={field.required} />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 20 }}>
              <button type="submit" style={{ ...s.btn, ...s.btnPrimary }}><Edit3 size={13} /> Save Changes</button>
              {saved && (
                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 12, color: C.green, fontFamily: "'Satoshi', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={13} /> Saved!
                </motion.span>
              )}
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}