/**
 * ClientOverview.tsx
 * All page-level views for the Client Dashboard:
 *   DashboardView, ProjectsView, ProposalsView, ContractsView,
 *   MatchesView, MilestonesView, PaymentsView, AnalyticsView, SettingsView
 *
 * Matches the MGNOVA design language from FreelancerDashboard.tsx.
 * Each view is a standalone exported component — ClientDashboard.tsx
 * picks the right one based on `activePage`.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Briefcase,
  DollarSign,
  FileText,
  Sparkles,
  Star,
  Activity,
  CheckCircle,
  Clock,
  Trash2,
  Edit3,
  Mail,
  Globe,
  RefreshCw,
  Check,
  AlertCircle,
  X,
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

// ─── Shared micro-styles ──────────────────────────────────────────────────────
const s = {
  card: {
    background: '#fff',
    border: `1px solid ${C.rodeo}50`,
    borderRadius: 12,
    padding: '20px 22px',
  } as React.CSSProperties,

  tag: (color:string = C.green): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    background: color === C.green  ? C.greenLight
               : color === C.gold  ? C.goldLight
               : color === C.copper ? C.copperLight
               : `${color}15`,
    color,
    fontFamily: "'DM Sans', sans-serif",
  }),

  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 18px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.18s ease',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,

  btnPrimary: { background: C.green, color: C.ivory } as React.CSSProperties,

  btnOutline: (color: string = C.copper): React.CSSProperties => ({
    background: 'transparent',
    color,
    border: `1px solid ${color}60`,
  }),

  btnDanger: {
    background: 'transparent',
    color: C.red,
    border: `1px solid ${C.red}60`,
  } as React.CSSProperties,

  label: {
    fontSize: 11,
    color: C.gray,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${C.rodeo}50`,
    background: '#fff',
    fontSize: 13,
    color: C.coffee,
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box' as const,
  },

  th: {
    padding: '10px 16px',
    textAlign: 'left' as const,
    fontSize: 11,
    color: C.gray,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    borderBottom: `1px solid ${C.rodeo}30`,
    background: C.ivory,
    whiteSpace: 'nowrap' as const,
  },

  td: {
    padding: '12px 16px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: C.coffee,
    borderBottom: `1px solid ${C.rodeo}20`,
  },
};

// ─── Tiny reusable pieces ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:      C.green,
    completed:   C.copper,
    draft:       C.gray,
    shortlisted: C.gold,
    accepted:    C.green,
    received:    C.gray,
    pending:     C.warning,
    paid:        C.green,
    released:    C.green,
    in_progress: C.gold,
  };
  const color = map[status] ?? C.gray;
  return (
    <span style={s.tag(color)}>
      {status.replace('_', ' ')}
    </span>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          {subtitle}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function MetricCard({ label, value, sub, accentColor }: { label: string; value: string | number; sub?: React.ReactNode; accentColor?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...s.card, borderTop: accentColor ? `2px solid ${accentColor}` : undefined }}
    >
      <p style={{ ...s.label, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </p>
      {sub && <div>{sub}</div>}
    </motion.div>
  );
}

function TrendTag({ positive, children }: { positive?: boolean; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      color: positive ? C.green : C.copper,
    }}>
      {positive ? <TrendingUp size={12} /> : null}
      {children}
    </span>
  );
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.rodeo}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, color = C.green }: { value: number; color?: string }) {
  return (
    <div style={{ height: 6, background: `${C.rodeo}25`, borderRadius: 99, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        style={{ height: '100%', background: color, borderRadius: 99 }}
      />
    </div>
  );
}

// ─── Talent Avatar Ring ───────────────────────────────────────────────────────
function MatchRing({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${C.rodeo}30`} strokeWidth="4" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={C.gold} strokeWidth="4"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <span style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 800,
        color: C.coffee,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {score}%
      </span>
    </div>
  );
}

function TalentAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: C.greenLight, color: C.green,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800,
      fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
    }}>
      {name.charAt(0)}
    </div>
  );
}

// ─── 1. Dashboard View ────────────────────────────────────────────────────────
export function DashboardView({
  overview,
  projects,
  proposals,
  talents,
  clientName,
}: {
  overview: DashboardOverview;
  projects: Project[];
  proposals: Proposal[];
  talents: RecommendedTalent[];
  clientName: string;
}) {
  return (
    <motion.div key="dashboard-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        <MetricCard
          label="Active Projects"
          value={overview.activeProjects}
          accentColor={C.green}
          sub={<TrendTag positive>+1 this month</TrendTag>}
        />
        <MetricCard
          label="Total Spent"
          value={`$${overview.totalSpent.toLocaleString()}`}
        />
        <MetricCard
          label="Pending Payments"
          value={`$${overview.pendingPayments.toLocaleString()}`}
          accentColor={C.gold}
          sub={<TrendTag>Action Required</TrendTag>}
        />
        <MetricCard
          label="Proposals Received"
          value={proposals.length}
        />
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {/* Projects table */}
        <SectionCard title="Active Projects" action={<a href="#" style={{ fontSize: 12, color: C.green, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>View All →</a>}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Project', 'Budget', 'Status', 'Date', ''].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
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

        {/* AI Talent */}
        <SectionCard title="AI Curated Talent" action={<a href="#" style={{ fontSize: 12, color: C.green, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>View Network →</a>}>
          <div style={{ padding: '8px 0' }}>
            {talents.map((t, i) => (
              <motion.div
                key={t.talentId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 20px',
                  borderBottom: i < talents.length - 1 ? `1px solid ${C.rodeo}20` : 'none',
                }}
              >
                <TalentAvatar name={t.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>
                    {t.name}
                    <span style={{ fontWeight: 400, color: C.gray, fontSize: 11, marginLeft: 6 }}>
                      ★ {t.reputationScore}
                    </span>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {t.skills.map(sk => (
                      <span key={sk} style={{ ...s.tag(C.copper), fontSize: 10 }}>{sk}</span>
                    ))}
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
  projects,
  proposals,
  onCreateProject,
  onDeleteProject,
  onShortlist,
  onHire,
  onReviewProposal,
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
      {/* Projects table */}
      <SectionCard
        title={`Projects (${projects.length})`}
        action={
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={onCreateProject}>
            + Create Project
          </button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ID', 'Title', 'Status', 'Budget', 'Created', ''].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <motion.tr
                  key={p.projectId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ cursor: 'default', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...s.td, color: C.gray, fontFamily: 'monospace', fontSize: 11 }}>{p.projectId}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{p.title}</td>
                  <td style={s.td}><StatusBadge status={p.status} /></td>
                  <td style={s.td}>${p.budget.toLocaleString()}</td>
                  <td style={{ ...s.td, color: C.gray, fontSize: 11 }}>{p.createdAt}</td>
                  <td style={s.td}>
                    <button
                      onClick={() => onDeleteProject(p.projectId)}
                      style={{ ...s.btn, ...s.btnDanger, padding: '5px 12px', fontSize: 11 }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Proposals sub-table */}
      <div style={{ marginTop: 32 }}>
        <SectionCard title="Proposals Received">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Talent', 'Project', 'AI Match', 'Budget', 'Status', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.map((p, i) => {
                  const project = projects.find(pr => pr.projectId === p.projectId);
                  return (
                    <motion.tr
                      key={p.proposalId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...s.td, fontWeight: 600 }}>{p.talentName}</td>
                      <td style={s.td}>{project?.title ?? p.projectId}</td>
                      <td style={s.td}>
                        <span style={{ color: C.gold, fontWeight: 700 }}>
                          <Star size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{p.matchScore}%
                        </span>
                      </td>
                      <td style={s.td}>${p.proposedBudget}</td>
                      <td style={s.td}><StatusBadge status={p.status} /></td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => onReviewProposal(p.proposalId)} style={{ ...s.btn, ...s.btnOutline(), padding: '5px 10px', fontSize: 11 }}>
                            Review
                          </button>
                          {p.status === 'received' && (
                            <button onClick={() => onShortlist(p.proposalId)} style={{ ...s.btn, ...s.btnPrimary, padding: '5px 10px', fontSize: 11 }}>
                              Shortlist
                            </button>
                          )}
                          {p.status === 'shortlisted' && (
                            <button onClick={() => onHire(p.proposalId)} style={{ ...s.btn, ...s.btnPrimary, padding: '5px 10px', fontSize: 11 }}>
                              Hire
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}

// ─── 3. Proposals View ────────────────────────────────────────────────────────
export function ProposalsView({
  proposals,
  projects,
  onShortlist,
  onHire,
  onReview,
}: {
  proposals: Proposal[];
  projects: Project[];
  onShortlist: (id: string) => void;
  onHire: (id: string) => void;
  onReview: (id: string) => void;
}) {
  return (
    <motion.div key="proposals-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>


      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <MetricCard label="Total Received" value={proposals.length} />
        <MetricCard label="Shortlisted" value={proposals.filter(p => p.status === 'shortlisted').length} accentColor={C.gold} />
        <MetricCard label="Hired" value={proposals.filter(p => p.status === 'accepted').length} accentColor={C.green} />
        <MetricCard
          label="Avg AI Match"
          value={proposals.length ? `${Math.round(proposals.reduce((a, b) => a + b.matchScore, 0) / proposals.length)}%` : '—'}
          accentColor={C.gold}
        />
      </div>

      <SectionCard title="All Proposals">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Talent', 'Project', 'AI Score', 'Budget', 'Status', 'Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proposals.map((p, i) => {
                const project = projects.find(pr => pr.projectId === p.projectId);
                return (
                  <motion.tr
                    key={p.proposalId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
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
                    <td style={s.td}>
                      <span style={{ color: C.gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill={C.gold} color={C.gold} /> {p.matchScore}%
                      </span>
                    </td>
                    <td style={s.td}>${p.proposedBudget}</td>
                    <td style={s.td}><StatusBadge status={p.status} /></td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => onReview(p.proposalId)} style={{ ...s.btn, ...s.btnOutline(), padding: '5px 10px', fontSize: 11 }}>
                          Review
                        </button>
                        {p.status === 'received' && (
                          <button onClick={() => onShortlist(p.proposalId)} style={{ ...s.btn, ...s.btnPrimary, padding: '5px 10px', fontSize: 11 }}>
                            Shortlist
                          </button>
                        )}
                        {p.status === 'shortlisted' && (
                          <button onClick={() => onHire(p.proposalId)} style={{ ...s.btn, ...s.btnPrimary, padding: '5px 10px', fontSize: 11 }}>
                            Hire
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </motion.div>
  );
}

// ─── 4. Contracts View ────────────────────────────────────────────────────────
export function ContractsView({
  contracts,
  projects,
  onApproveMilestone,
}: {
  contracts: Contract[];
  projects: Project[];
  onApproveMilestone: (contractId: string, milestoneId: string) => void;
}) {
  return (
    <motion.div key="contracts-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gap: 20 }}>
        {contracts.map((c, ci) => {
          const project = projects.find(pr => pr.projectId === c.projectId);
          return (
            <motion.div
              key={c.contractId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.08 }}
              style={{ ...s.card, borderLeft: `4px solid ${C.gold}` }}
            >
              {/* Contract header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.rodeo}30`, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>
                    {project?.title ?? c.projectId}
                  </h3>
                  <p style={{ ...s.label, margin: 0 }}>
                    Contract {c.contractId} · Talent {c.talentId}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {/* Milestones */}
              <p style={{ ...s.label, marginBottom: 12 }}>Milestones</p>
              <div style={{ ...s.card, padding: 0, overflow: 'hidden', background: C.ivory }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Milestone', 'Amount', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ ...s.th, background: `${C.rodeo}15` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.milestones.map((m, mi) => (
                      <tr key={m.milestoneId} style={{ transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ ...s.td, fontWeight: 600 }}>{m.title}</td>
                        <td style={s.td}>${m.amount}</td>
                        <td style={s.td}><StatusBadge status={m.status} /></td>
                        <td style={s.td}>
                          {m.status === 'pending' ? (
                            <button
                              onClick={() => onApproveMilestone(c.contractId, m.milestoneId)}
                              style={{ ...s.btn, background: C.success, color: '#fff', padding: '5px 12px', fontSize: 11 }}
                            >
                              <CheckCircle size={12} /> Approve & Pay
                            </button>
                          ) : (
                            <button style={{ ...s.btn, ...s.btnOutline(C.gray), padding: '5px 12px', fontSize: 11 }} disabled>
                              Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── 5. Matches View ──────────────────────────────────────────────────────────
export function MatchesView({
  talents,
  onViewProfile,
  onInvite,
}: {
  talents: RecommendedTalent[];
  onViewProfile: (id: string) => void;
  onInvite: (id: string) => void;
}) {
  return (
    <motion.div key="matches-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {talents.map((t, i) => (
          <motion.div
            key={t.talentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, boxShadow: `0 12px 32px ${C.green}15` }}
            style={{ ...s.card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 22px', position: 'relative' }}
          >
            {/* Match ring behind avatar */}
            <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 14 }}>
              <MatchRing score={t.matchScore} size={80} />
              <div style={{
                position: 'absolute',
                inset: 6,
                borderRadius: '50%',
                background: C.greenLight,
                color: C.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {t.name.charAt(0)}
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>
              {t.name}
            </h3>
            <p style={{ color: C.gold, fontSize: 12, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>
              ★ {t.reputationScore} Elite Contributor
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
              {t.skills.map(sk => <span key={sk} style={s.tag(C.copper)}>{sk}</span>)}
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                onClick={() => onViewProfile(t.talentId)}
                style={{ ...s.btn, ...s.btnOutline(), flex: 1, justifyContent: 'center' }}
              >
                Profile
              </button>
              <button
                onClick={() => onInvite(t.talentId)}
                style={{ ...s.btn, ...s.btnPrimary, flex: 1, justifyContent: 'center' }}
              >
                <Sparkles size={12} /> Invite
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── 6. Milestones View ───────────────────────────────────────────────────────
export function MilestonesView({
  contracts,
  projects,
  onApproveMilestone,
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
          <p style={{ padding: 24, textAlign: 'center', color: C.gray, fontFamily: "'DM Sans', sans-serif" }}>
            No milestones found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Project', 'Milestone', 'Amount', 'Status', 'Action'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.map((m, i) => (
                  <motion.tr
                    key={m.milestoneId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
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
                        <button
                          onClick={() => onApproveMilestone(m.contractId, m.milestoneId)}
                          style={{ ...s.btn, background: C.success, color: '#fff', padding: '5px 12px', fontSize: 11 }}
                        >
                          <Check size={12} /> Approve
                        </button>
                      ) : (
                        <button style={{ ...s.btn, ...s.btnOutline(C.gray), padding: '5px 12px', fontSize: 11 }} disabled>
                          Paid
                        </button>
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
export function PaymentsView({
  payments,
  overview,
}: {
  payments: Payment[];
  overview: DashboardOverview;
}) {
  return (
    <motion.div key="payments-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
        <MetricCard
          label="Funds in Escrow"
          value={`$${overview.pendingPayments.toLocaleString()}`}
          accentColor={C.gold}
          sub={<TrendTag>Reserved for Active Milestones</TrendTag>}
        />
        <MetricCard
          label="Total Paid"
          value={`$${overview.totalSpent.toLocaleString()}`}
          accentColor={C.green}
          sub={<TrendTag positive>Across All Projects</TrendTag>}
        />
      </div>

      {/* Transactions */}
      <SectionCard title="Recent Transactions">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Transaction ID', 'Amount', 'Status', 'Method'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((pay, i) => (
                <motion.tr
                  key={pay.paymentId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
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
      </SectionCard>
    </motion.div>
  );
}

// ─── 8. Analytics View ────────────────────────────────────────────────────────
export function AnalyticsView({
  overview,
  proposals,
}: {
  overview: DashboardOverview;
  proposals: Proposal[];
}) {
  const avgMatch = proposals.length
    ? Math.round(proposals.reduce((a, b) => a + b.matchScore, 0) / proposals.length)
    : 0;

  const total = overview.totalSpent + overview.pendingPayments;

  return (
    <motion.div key="analytics-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>


      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 28 }}>
        <MetricCard label="Total Projects" value={overview.totalProjects} />
        <MetricCard label="Active Projects" value={overview.activeProjects} accentColor={C.green} />
        <MetricCard label="Avg AI Match" value={`${avgMatch}%`} accentColor={C.gold} />
        <MetricCard label="Proposals Received" value={proposals.length} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {/* Status distribution */}
        <div style={s.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 20px', fontFamily: "'DM Sans', sans-serif" }}>
            Project Status
          </h3>
          {[
            { label: 'Completed', value: overview.completedProjects, color: C.green },
            { label: 'Active',    value: overview.activeProjects,    color: C.copper },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.color, fontFamily: "'DM Sans', sans-serif" }}>
                  {row.value} / {overview.totalProjects}
                </span>
              </div>
              <ProgressBar
                value={overview.totalProjects ? (row.value / overview.totalProjects) * 100 : 0}
                color={row.color}
              />
            </div>
          ))}
        </div>

        {/* Financial */}
        <div style={{ ...s.card, textAlign: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 20px', fontFamily: "'DM Sans', sans-serif" }}>
            Financial Overview
          </h3>
          <p style={{ fontSize: 36, fontWeight: 800, color: C.coffee, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>
            ${total.toLocaleString()}
          </p>
          <p style={{ fontSize: 12, color: C.gray, marginBottom: 28, fontFamily: "'DM Sans', sans-serif" }}>
            Total Budget Commitment
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 36 }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: C.green, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>
                ${overview.totalSpent.toLocaleString()}
              </p>
              <p style={{ ...s.label, margin: 0 }}>Paid</p>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: C.gold, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>
                ${overview.pendingPayments.toLocaleString()}
              </p>
              <p style={{ ...s.label, margin: 0 }}>Escrow</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── 9. Settings View ─────────────────────────────────────────────────────────
export function SettingsView({
  profile,
  onSave,
}: {
  profile: ClientProfile;
  onSave: (updates: Partial<ClientProfile>) => void;
}) {
  const [form, setForm] = useState<ClientProfile>({ ...profile });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof ClientProfile, v: string | number) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div key="settings-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>


      <div style={{ maxWidth: 600 }}>
        <div style={s.card}>
          <form onSubmit={handleSave}>
            {/* Company Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>Company Name</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`, background: '#fff' }}>
                <Briefcase size={14} color={C.gray} />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif", border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>Contact Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`, background: '#fff' }}>
                <Mail size={14} color={C.gray} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif", border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
                  required
                />
              </div>
            </div>

            {/* Industry */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>Industry</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`, background: '#fff' }}>
                <Globe size={14} color={C.gray} />
                <input
                  type="text"
                  value={form.industry}
                  onChange={e => set('industry', e.target.value)}
                  style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif", border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 20 }}>
              <button type="submit" style={{ ...s.btn, ...s.btnPrimary }}>
                <Edit3 size={13} /> Save Changes
              </button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 12, color: C.green, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}
                >
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