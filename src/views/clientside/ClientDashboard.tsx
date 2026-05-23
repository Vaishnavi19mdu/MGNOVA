/**
 * ClientDashboard.tsx
 * Main layout container for the MGNOVA Client Dashboard.
 *
 * Fixes applied:
 *  1. Double header removed — PageHeader is rendered HERE only (via PAGE_META),
 *     so ClientOverview views must NOT render their own <PageHeader>.
 *  2. Profile dropdown: Payments now correctly navigates to 'payments' page.
 *  3. Firebase: reads from users/{uid} (companyName, email, industry fields)
 *     and listens to proposals / projects / contracts / payments collections
 *     filtered by clientId == user.uid.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Wallet,
  Settings,
  LogOut,
} from 'lucide-react';

// ── Firebase ──────────────────────────────────────────────────────────────────
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';

// ── Sidebar ───────────────────────────────────────────────────────────────────
import { ClientSidebar, ClientMobileDrawer, CLIENT_NAV_ITEMS } from './ClientSidebar';

// ── Page views ────────────────────────────────────────────────────────────────
import {
  DashboardView,
  ProjectsView,
  ProposalsView,
  ContractsView,
  MatchesView,
  MilestonesView,
  PaymentsView,
  AnalyticsView,
  SettingsView,
  type Project,
  type Proposal,
  type Contract,
  type Payment,
  type RecommendedTalent,
  type ClientProfile,
  type DashboardOverview,
} from './ClientOverview';

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
  copperLight: '#F5EBE8',
  goldLight:   '#FBF5E0',
  sidebarText: '#EDE8E3',
  red:         '#C0392B',
  redLight:    '#FDEAEA',
} as const;

// ─── Tiny shared styles ───────────────────────────────────────────────────────
const s = {
  tag: (color: string = C.green): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
    borderRadius: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
    background: color === C.green ? C.greenLight : color === C.gold ? C.goldLight : color === C.copper ? C.copperLight : `${color}15`,
    color, fontFamily: "'DM Sans', sans-serif",
  }),
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.18s ease',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  label: {
    fontSize: 11, color: C.gray, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
  },
};

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ─── Notification type ────────────────────────────────────────────────────────
interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 300,
        background: C.coffee, color: C.ivory,
        padding: '12px 20px', borderRadius: 10,
        fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', gap: 10, maxWidth: 340,
      }}
    >
      <span style={{ color: C.gold, fontSize: 16 }}>✓</span>
      {message}
    </motion.div>
  );
}

// ─── Create Project Modal ─────────────────────────────────────────────────────
function CreateProjectModal({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, budget: number) => void;
}) {
  const [title, setTitle]   = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget) return;
    onCreate(title, parseInt(budget, 10));
    setTitle(''); setBudget(''); onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${C.rodeo}50`, background: '#fff',
    fontSize: 13, color: C.coffee, outline: 'none',
    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', marginBottom: 16,
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(75,54,47,0.45)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16,
              width: '100%', maxWidth: 460,
              boxShadow: '0 32px 80px rgba(75,54,47,0.18)', overflow: 'hidden',
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 22px', borderBottom: `1px solid ${C.rodeo}30`,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                Post New Project
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 22px' }}>
              <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>Project Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Mobile App MVP" style={inputStyle} required />
              <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>Budget (USD)</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                placeholder="5000" style={inputStyle} required />
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={onClose}
                  style={{ ...s.btn, flex: 1, justifyContent: 'center', background: 'transparent', color: C.copper, border: `1px solid ${C.copper}60` }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ ...s.btn, flex: 1, justifyContent: 'center', background: C.green, color: C.ivory }}>
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Header Avatar / Profile Dropdown ────────────────────────────────────────
// FIX: onAction now accepts 'settings' | 'payments' | 'logout'
function HeaderAvatar({ initials, name, profile, onAction }: {
  initials: string;
  name: string;
  profile: ClientProfile;
  onAction: (action: 'settings' | 'payments' | 'logout') => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8,
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: C.greenLight, color: C.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, fontFamily: "'DM Sans', sans-serif",
        }}>
          {initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>
          {name.split(' ')[0]}
        </span>
        <ChevronDown size={13} color={C.gray} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click-away overlay */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 59 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                width: 220, background: '#fff',
                border: `1px solid ${C.rodeo}40`, borderRadius: 12,
                boxShadow: `0 16px 48px ${C.coffee}15`, zIndex: 60, overflow: 'hidden',
              }}
            >
              {/* Profile summary */}
              <div style={{ padding: '14px', background: C.ivory, borderBottom: `1px solid ${C.rodeo}20` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>
                  {profile.name}
                </p>
                <p style={{ fontSize: 11, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  {profile.email}
                </p>
              </div>

              {/* Items — FIX: Payments now routes to 'payments' */}
              <div style={{ padding: 6 }}>
                {([
                  { icon: Settings, label: 'Settings', action: 'settings' as const },
                  { icon: Wallet,   label: 'Payments', action: 'payments' as const },
                ] as const).map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={() => { onAction(action); setOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '9px 10px', background: 'none', border: 'none', borderRadius: 7,
                      cursor: 'pointer', color: C.coffee, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = C.ivory)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <Icon size={14} color={C.gray} /> {label}
                  </button>
                ))}

                <div style={{ height: 1, background: `${C.rodeo}30`, margin: '4px 0' }} />

                <button
                  onClick={() => { onAction('logout'); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 10px', background: 'none', border: 'none', borderRadius: 7,
                    cursor: 'pointer', color: C.red, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = C.redLight)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page metadata ────────────────────────────────────────────────────────────
const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Dashboard',                  subtitle: "Here's what's happening with your projects today."       },
  projects:   { title: 'Project Workspace',           subtitle: 'Manage your ongoing workflows and milestone approvals.'  },
  proposals:  { title: 'Proposals Inbox',             subtitle: 'Review AI-ranked proposals for your projects.'          },
  contracts:  { title: 'Active Contracts',            subtitle: 'Track progress and approve milestone deliverables.'     },
  matches:    { title: 'AI Talent Matches',           subtitle: "Curated elite talent based on your organisation's needs." },
  milestones: { title: 'Milestones / Approvals',      subtitle: 'Centralised view of all deliverables pending review.'   },
  payments:   { title: 'Payments / Escrow',           subtitle: 'Secure milestone funding and transaction history.'      },
  analytics:  { title: 'Dashboard Analytics',         subtitle: 'Insights into your projects and AI talent curation.'    },
  settings:   { title: 'Company Profile & Settings',  subtitle: 'Configure your organisation details and preferences.'   },
};

// ─── Default / fallback values ────────────────────────────────────────────────
const DEFAULT_PROFILE: ClientProfile = {
  name: '',
  email: '',
  industry: '',
  teamSize: 0,
  hiringFrequency: '',
};

const DEFAULT_OVERVIEW: DashboardOverview = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalSpent: 0,
  pendingPayments: 0,
};

// Static mock talents (no Firestore collection for these yet)
const MOCK_TALENTS: RecommendedTalent[] = [
  { talentId: 'talent_002', name: 'Alice',  skills: ['UI Design', 'Figma', 'Framer'],   matchScore: 95, reputationScore: 4.8 },
  { talentId: 'talent_004', name: 'Marcus', skills: ['React', 'Node.js', 'Firebase'],   matchScore: 89, reputationScore: 4.9 },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const width     = useWindowWidth();
  const isMobile  = width < 640;
  const isDesktop = width >= 1024;

  // ── Data state ─────────────────────────────────────────────────────────────
  const [profile,       setProfile]   = useState<ClientProfile>(DEFAULT_PROFILE);
  const [overview,      setOverview]  = useState<DashboardOverview>(DEFAULT_OVERVIEW);
  const [projects,      setProjects]  = useState<Project[]>([]);
  const [proposals,     setProposals] = useState<Proposal[]>([]);
  const [contracts,     setContracts] = useState<Contract[]>([]);
  const [payments,      setPayments]  = useState<Payment[]>([]);
  const [talents]                     = useState<RecommendedTalent[]>(MOCK_TALENTS);
  const [loading,       setLoading]   = useState(true);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activePage,       setActivePage]       = useState('dashboard');
  const [sidebarExpanded,  setSidebarExpanded]  = useState(isDesktop);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifOpen,        setNotifOpen]        = useState(false);
  const [notifications,    setNotifications]    = useState<Notification[]>([]);
  const [createProjOpen,   setCreateProjOpen]   = useState(false);
  const [toast,            setToast]            = useState('');

  useEffect(() => {
    if (isDesktop) { setSidebarExpanded(true); setMobileDrawerOpen(false); }
    else setSidebarExpanded(false);
  }, [isDesktop]);

  // ── Firebase listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // 1. User profile from users/{uid}
      // Firestore fields: companyName, email, industry, hiringFreq, role, etc.
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        const d = userSnap.data();
        setProfile({
          name:             d.companyName  ?? d.fullName ?? '',
          email:            d.email        ?? user.email ?? '',
          industry:         d.industry     ?? '',
          teamSize:         d.teamSize     ?? 0,
          hiringFrequency:  d.hiringFreq   ?? '',
        });
      }

      // 2. Projects — filtered by clientId
      const projUnsub = onSnapshot(
        query(collection(db, 'projects'), where('clientId', '==', user.uid)),
        snap => {
          const data = snap.docs.map(d => ({ projectId: d.id, ...d.data() } as Project));
          setProjects(data);
          setOverview(prev => ({
            ...prev,
            totalProjects:     data.length,
            activeProjects:    data.filter(p => p.status === 'active').length,
            completedProjects: data.filter(p => p.status === 'completed').length,
          }));
        }
      );

      // 3. Proposals — filtered by clientId
      const propUnsub = onSnapshot(
        query(collection(db, 'proposals'), where('clientId', '==', user.uid)),
        snap => {
          setProposals(snap.docs.map(d => ({ proposalId: d.id, ...d.data() } as Proposal)));
          // Add notification for new unread proposals
          const newCount = snap.docs.filter(d => d.data().status === 'received').length;
          if (newCount > 0) {
            setNotifications([{
              id: 'notif_proposals',
              message: `${newCount} new proposal${newCount > 1 ? 's' : ''} received`,
              type: 'info',
              read: false,
            }]);
          }
        }
      );

      // 4. Contracts — filtered by clientId
      const contUnsub = onSnapshot(
        query(collection(db, 'contracts'), where('clientId', '==', user.uid)),
        snap => setContracts(snap.docs.map(d => ({ contractId: d.id, ...d.data() } as Contract)))
      );

      // 5. Payments — filtered by clientId
      const payUnsub = onSnapshot(
        query(collection(db, 'payments'), where('clientId', '==', user.uid)),
        snap => {
          const data = snap.docs.map(d => ({ paymentId: d.id, ...d.data() } as Payment));
          setPayments(data);
          setOverview(prev => ({
            ...prev,
            totalSpent:      data.filter(p => p.status === 'released').reduce((s, p) => s + p.amount, 0),
            pendingPayments: data.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
          }));
        }
      );

      setLoading(false);

      // Cleanup all Firestore listeners on auth change
      return () => { projUnsub(); propUnsub(); contUnsub(); payUnsub(); };
    });

    return () => unsubAuth();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => setToast(msg);

  const userInitials = profile.name
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CL';

  const unread = notifications.filter(n => !n.read).length;

  const handleNavClick = (key: string) => {
    setActivePage(key);
    setMobileDrawerOpen(false);
    setNotifOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  // ── Project actions ────────────────────────────────────────────────────────
  const handleCreateProject = (title: string, budget: number) => {
    // Optimistic local add; in production also write to Firestore here
    const id = 'proj_' + Math.floor(Math.random() * 10000);
    setProjects(prev => [{ projectId: id, title, budget, status: 'draft', createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
    setOverview(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
    showToast('Project created!');
  };

  const handleDeleteProject = (projectId: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const project = projects.find(p => p.projectId === projectId);
    if (!project) return;
    setProjects(prev => prev.filter(p => p.projectId !== projectId));
    setProposals(prev => prev.filter(p => p.projectId !== projectId));
    setContracts(prev => prev.filter(c => c.projectId !== projectId));
    setPayments(prev => prev.filter(p => p.projectId !== projectId));
    setOverview(prev => ({
      ...prev,
      totalProjects:     Math.max(0, prev.totalProjects - 1),
      activeProjects:    project.status === 'active'    ? Math.max(0, prev.activeProjects - 1) : prev.activeProjects,
      completedProjects: project.status === 'completed' ? Math.max(0, prev.completedProjects - 1) : prev.completedProjects,
    }));
    showToast('Project deleted.');
  };

  // ── Proposal actions ───────────────────────────────────────────────────────
  const handleShortlist = (proposalId: string) => {
    setProposals(prev => prev.map(p => p.proposalId === proposalId ? { ...p, status: 'shortlisted' } : p));
    showToast('Proposal shortlisted!');
  };

  const handleHire = (proposalId: string) => {
    const prop = proposals.find(p => p.proposalId === proposalId);
    if (!prop) return;
    setProposals(prev => prev.map(p => p.proposalId === proposalId ? { ...p, status: 'accepted' } : p));
    const deposit = Math.floor(prop.proposedBudget / 2);
    const contractId = 'cont_' + Math.floor(Math.random() * 10000);
    setContracts(prev => [{
      contractId, talentId: prop.talentId, projectId: prop.projectId, status: 'in_progress',
      milestones: [{ milestoneId: 'mile_1', title: 'Initial Deposit / Phase 1', amount: deposit, status: 'pending' }],
    }, ...prev]);
    setOverview(prev => ({ ...prev, pendingPayments: prev.pendingPayments + deposit }));
    setProjects(prev => prev.map(p =>
      p.projectId === prop.projectId && p.status === 'draft' ? { ...p, status: 'active' } : p
    ));
    showToast('Talent hired! Contract created.');
  };

  const handleReviewProposal = (proposalId: string) => console.log('Review proposal:', proposalId);

  // ── Milestone actions ──────────────────────────────────────────────────────
  const handleApproveMilestone = (contractId: string, milestoneId: string) => {
    const contract = contracts.find(c => c.contractId === contractId);
    if (!contract) return;
    const milestone = contract.milestones.find(m => m.milestoneId === milestoneId);
    if (!milestone || milestone.status !== 'pending') return;
    setContracts(prev => prev.map(c =>
      c.contractId === contractId
        ? { ...c, milestones: c.milestones.map(m => m.milestoneId === milestoneId ? { ...m, status: 'paid' } : m) }
        : c
    ));
    setOverview(prev => ({
      ...prev,
      pendingPayments: Math.max(0, prev.pendingPayments - milestone.amount),
      totalSpent: prev.totalSpent + milestone.amount,
    }));
    setPayments(prev => [{
      paymentId: 'pay_' + Math.floor(Math.random() * 100000),
      projectId: contract.projectId,
      amount: milestone.amount,
      status: 'released',
      method: 'Wallet Escrow',
    }, ...prev]);
    showToast('Milestone approved and paid.');
  };

  // ── Settings ───────────────────────────────────────────────────────────────
  const handleSaveSettings = (updates: Partial<ClientProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    showToast('Profile settings updated.');
  };

  // ── Talent actions ─────────────────────────────────────────────────────────
  const handleViewProfile  = (talentId: string) => console.log('View profile:', talentId);
  const handleInviteTalent = (_talentId: string) => showToast('Invitation sent to talent!');

  // ── Render active page ─────────────────────────────────────────────────────
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView overview={overview} projects={projects} proposals={proposals} talents={talents} clientName={profile.name} />;
      case 'projects':
        return <ProjectsView projects={projects} proposals={proposals} onCreateProject={() => setCreateProjOpen(true)} onDeleteProject={handleDeleteProject} onShortlist={handleShortlist} onHire={handleHire} onReviewProposal={handleReviewProposal} />;
      case 'proposals':
        return <ProposalsView proposals={proposals} projects={projects} onShortlist={handleShortlist} onHire={handleHire} onReview={handleReviewProposal} />;
      case 'contracts':
        return <ContractsView contracts={contracts} projects={projects} onApproveMilestone={handleApproveMilestone} />;
      case 'matches':
        return <MatchesView talents={talents} onViewProfile={handleViewProfile} onInvite={handleInviteTalent} />;
      case 'milestones':
        return <MilestonesView contracts={contracts} projects={projects} onApproveMilestone={handleApproveMilestone} />;
      case 'payments':
        return <PaymentsView payments={payments} overview={overview} />;
      case 'analytics':
        return <AnalyticsView overview={overview} proposals={proposals} />;
      case 'settings':
        return <SettingsView profile={profile} onSave={handleSaveSettings} />;
      default:
        return <DashboardView overview={overview} projects={projects} proposals={proposals} talents={talents} clientName={profile.name} />;
    }
  };

  const ph = PAGE_META[activePage] ?? PAGE_META.dashboard;
  const marginLeft = isDesktop ? (sidebarExpanded ? 240 : 64) : 0;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: C.ivory,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif", color: C.gray, fontSize: 14,
      }}>
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.ivory, color: C.coffee,
      fontFamily: "'Cormorant Garamond', Georgia, serif", display: 'flex',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.rodeo}60; border-radius: 99px; }
        button { -webkit-appearance: none; touch-action: manipulation; }
        input, textarea, select { -webkit-appearance: none; }
      `}</style>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <CreateProjectModal open={createProjOpen} onClose={() => setCreateProjOpen(false)} onCreate={handleCreateProject} />

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      {isDesktop && (
        <ClientSidebar
          expanded={sidebarExpanded}
          activePage={activePage}
          userName={profile.name}
          userRole={profile.industry}
          userInitials={userInitials}
          onNavClick={handleNavClick}
          onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
          onLogout={handleLogout}
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      {!isDesktop && (
        <ClientMobileDrawer
          open={mobileDrawerOpen}
          activePage={activePage}
          userName={profile.name}
          userEmail={profile.email}
          userInitials={userInitials}
          onNavClick={handleNavClick}
          onClose={() => setMobileDrawerOpen(false)}
          onLogout={handleLogout}
        />
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div style={{
        marginLeft, flex: 1, display: 'flex', flexDirection: 'column',
        minHeight: '100vh', transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* ── Top header ──────────────────────────────────────────────────── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(247,243,238,0.95)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.rodeo}40`,
          padding: isMobile ? '10px 16px' : '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          {/* Mobile menu + logo */}
          {!isDesktop && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMobileDrawerOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8 }}>
                <Menu size={22} color={C.coffee} />
              </button>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.coffee, letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>MG</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.gold,   letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>NOVA</span>
              </div>
            </div>
          )}

          {/* Search */}
          {!isMobile && (
            <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.gray }} />
              <input type="text" placeholder="Search projects, proposals…" style={{
                width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                background: '#fff', border: `1px solid ${C.rodeo}40`, borderRadius: 8,
                fontSize: 13, color: C.coffee, outline: 'none', fontFamily: "'DM Sans', sans-serif",
              }}
                onFocus={e  => (e.target.style.borderColor = C.green)}
                onBlur={e   => (e.target.style.borderColor = `${C.rodeo}40`)}
              />
            </div>
          )}

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ position: 'relative', padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex' }}
              >
                <Bell size={20} color={C.coffee} />
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 16, height: 16, background: C.copper, color: '#fff',
                      fontSize: 9, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {unread}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 8,
                        width: isMobile ? 'calc(100vw - 32px)' : 300, background: '#fff',
                        border: `1px solid ${C.rodeo}40`, borderRadius: 12,
                        boxShadow: `0 16px 48px ${C.coffee}15`, zIndex: 60, overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.rodeo}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>Notifications</span>
                        {unread > 0 && <span style={s.tag(C.green)}>{unread} new</span>}
                      </div>
                      {notifications.length === 0 ? (
                        <p style={{ padding: '16px', fontSize: 12, color: C.gray, fontFamily: "'DM Sans', sans-serif", margin: 0, textAlign: 'center' }}>
                          No notifications
                        </p>
                      ) : notifications.map((n, idx) => (
                        <div
                          key={n.id}
                          style={{
                            display: 'flex', gap: 12, padding: '12px 16px',
                            borderBottom: idx < notifications.length - 1 ? `1px solid ${C.rodeo}20` : 'none',
                            background: n.read ? 'transparent' : `${C.greenLight}80`, cursor: 'pointer',
                          }}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: n.type === 'success' ? C.green : C.copper }} />
                          <p style={{ fontSize: 12, color: C.coffee, margin: 0, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <HeaderAvatar
              initials={userInitials}
              name={profile.name || 'Client'}
              profile={profile}
              onAction={action => {
                if (action === 'settings') handleNavClick('settings');
                if (action === 'payments') handleNavClick('payments');
                if (action === 'logout')   handleLogout();
              }}
            />
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: isMobile ? '20px 16px' : '26px 28px', overflowX: 'hidden' }}>
          {/* Page heading — rendered ONCE here; views must NOT render their own PageHeader */}
          <motion.div
            key={activePage + '-hdr'}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ marginBottom: 24 }}
          >
            <h1 style={{
              fontSize: isMobile ? 22 : 28, fontWeight: 700, color: C.coffee,
              margin: '0 0 4px', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '-0.01em',
            }}>
              {activePage === 'dashboard'
                ? <>Welcome back, <span style={{ color: C.green }}>{profile.name}</span> 👋</>
                : ph.title}
            </h1>
            <p style={{ fontSize: 13, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {ph.subtitle}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {renderPage()}
          </AnimatePresence>
        </main>

        {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
        {isMobile && (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
            background: 'rgba(247,243,238,0.97)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderTop: `1px solid ${C.rodeo}40`,
            display: 'flex', justifyContent: 'space-around',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
            {CLIENT_NAV_ITEMS.slice(0, 5).map(({ icon: Icon, label, key }) => {
              const isActive = activePage === key;
              return (
                <button key={key} onClick={() => handleNavClick(key)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '10px 6px', background: 'none', border: 'none', cursor: 'pointer',
                  flex: 1, color: isActive ? C.green : C.gray,
                }}>
                  <Icon size={20} />
                  <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
        {isMobile && <div style={{ height: 72 }} />}
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
      </AnimatePresence>
    </div>
  );
}