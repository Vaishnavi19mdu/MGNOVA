'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Clock, Briefcase, CheckCircle, Send, Star,
  LayoutDashboard, FolderOpen, FileText, Wallet, Trophy,
  Settings, Bell, Search, ChevronRight, Menu, X, User,
  LogOut, AlertCircle, Check, ArrowRight, Zap, Filter,
  Calendar, DollarSign, Award, Activity, ChevronDown,
  ChevronLeft, Plus, Edit3, Eye, Download, Upload,
  Globe, Phone, Mail, MapPin, Link, BarChart2,
  TrendingDown, Target, Layers, Shield, CreditCard,
  RefreshCw, ExternalLink, Hash,
  MessageSquare, Paperclip, MoreHorizontal, Copy,
  ArrowUpRight, ArrowDownRight, Sparkles, BookOpen, Key, Lock
} from 'lucide-react';

// ── Firebase imports ──────────────────────────────────────────────────────────
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from 'firebase/firestore';

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
    <span style={{ fontSize: collapsed ? 18 : 22, fontWeight: 800, color: '#F7F3EE', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>MG</span>
    <span style={{ fontSize: collapsed ? 18 : 22, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>NOVA</span>
  </div>
);

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  ivory: '#F7F3EE', coffee: '#4B362F', gray: '#999999',
  green: '#66806A', gold: '#D4AF37', copper: '#7B4B3A',
  rodeo: '#C7A19A', greenLight: '#EEF3EF', greenMid: '#D2E0D4',
  copperLight: '#F5EBE8', goldLight: '#FBF5E0',
  sidebarText: '#EDE8E3', sidebarMuted: '#B8AFA9',
  red: '#C0392B', redLight: '#FDEAEA',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  fullName: string; email: string; role: 'freelancer' | 'client';
  primaryRole?: string; yearsExp?: string; country?: string;
  availability?: string; hourlyRate?: string; languages?: string;
  companyName?: string; teamSize?: string; industry?: string;
  skills?: string[]; memberSince: string; rating: number;
  completedProjects: number; bio: string; uid?: string;
}

interface Milestone {
  title: string; amount: string; status: string; dueDate: string; project: string;
}

interface Project {
  id: string; title: string; budget: string; timeline: string;
  skills: string[]; matchScore: number; description: string;
  clientName: string; clientRating: number; posted: string; applicants: number;
}

interface Proposal {
  id: string; projectName: string; budget: string; timeline: string;
  date: string; status: string; client: string;
}

interface Contract {
  id: string; project: string; client: string; value: string;
  startDate: string; endDate: string; status: string; progress: number;
  milestones: number; completedMilestones: number;
}

interface Transaction {
  id: string; description: string; amount: string; date: string; type: string; status: string;
}

interface Notification {
  id: number; title: string; message: string; timestamp: string; type: string; read: boolean;
}

// ─── Fallback / Seed data (used when Firestore is empty) ─────────────────────
const SEED_MILESTONES: Milestone[] = [
  { title: 'E-Commerce API Integration', amount: '$1,200', status: 'completed', dueDate: 'May 10, 2025', project: 'Shopify Store' },
  { title: 'Dashboard UI Redesign', amount: '$850', status: 'in-progress', dueDate: 'May 28, 2025', project: 'CRM Platform' },
  { title: 'Mobile App Phase 2', amount: '$2,400', status: 'pending', dueDate: 'Jun 15, 2025', project: 'FitTrack' },
  { title: 'Auth System Overhaul', amount: '$600', status: 'pending', dueDate: 'Jun 30, 2025', project: 'HealthPortal' },
];

const SEED_PROJECTS: Project[] = [
  { id: 'p1', title: 'Next.js SaaS Platform with AI Features', budget: '$3,000–$5,000', timeline: '6–8 weeks', skills: ['Next.js', 'TypeScript', 'OpenAI', 'Prisma'], matchScore: 96, description: 'Build a complete SaaS boilerplate with subscription billing, AI-powered analytics dashboard, and multi-tenant architecture.', clientName: 'TechLaunch Inc.', clientRating: 4.8, posted: '2h ago', applicants: 4 },
  { id: 'p2', title: 'React Native Fitness Tracking App', budget: '$2,500–$4,000', timeline: '8 weeks', skills: ['React Native', 'Node.js', 'PostgreSQL'], matchScore: 88, description: 'Cross-platform fitness app with workout tracking, social features, and real-time sync across devices.', clientName: 'FitVerse Co.', clientRating: 4.6, posted: '5h ago', applicants: 7 },
  { id: 'p3', title: 'E-Commerce Storefront Redesign', budget: '$1,500–$2,500', timeline: '3–4 weeks', skills: ['React', 'Tailwind', 'Shopify'], matchScore: 81, description: 'Modern storefront redesign for a DTC brand with a focus on conversion optimization and performance.', clientName: 'Luxe Brand Co.', clientRating: 5.0, posted: '1d ago', applicants: 12 },
  { id: 'p4', title: 'Backend API for Logistics Platform', budget: '$2,000–$3,500', timeline: '5–6 weeks', skills: ['Node.js', 'PostgreSQL', 'Docker', 'Redis'], matchScore: 79, description: 'Design and implement a scalable REST API for a logistics tracking platform with real-time status updates.', clientName: 'FreightOps', clientRating: 4.4, posted: '2d ago', applicants: 9 },
  { id: 'p5', title: 'AI Chatbot Integration for CRM', budget: '$1,800–$2,800', timeline: '4 weeks', skills: ['Python', 'OpenAI', 'React', 'FastAPI'], matchScore: 74, description: 'Integrate a GPT-4 powered chatbot into an existing CRM system for automated customer support workflows.', clientName: 'CRMPro', clientRating: 4.7, posted: '3d ago', applicants: 15 },
  { id: 'p6', title: 'Web3 NFT Marketplace MVP', budget: '$4,000–$6,500', timeline: '10 weeks', skills: ['Solidity', 'React', 'Ethers.js', 'IPFS'], matchScore: 68, description: 'Build a full-featured NFT marketplace with minting, trading, and royalty management on Ethereum.', clientName: 'BlockArt Studio', clientRating: 4.2, posted: '4d ago', applicants: 21 },
];

const SEED_PROPOSALS: Proposal[] = [
  { id: '#PRO-001', projectName: 'AI-Powered CRM Dashboard', budget: '$4,200', timeline: '6 weeks', date: 'May 14', status: 'accepted', client: 'SalesForge' },
  { id: '#PRO-002', projectName: 'NFT Marketplace Frontend', budget: '$3,800', timeline: '5 weeks', date: 'May 12', status: 'shortlisted', client: 'BlockArt' },
  { id: '#PRO-003', projectName: 'Healthcare Portal Redesign', budget: '$2,900', timeline: '4 weeks', date: 'May 8', status: 'applied', client: 'MedCore' },
  { id: '#PRO-004', projectName: 'Logistics Tracking App', budget: '$1,800', timeline: '3 weeks', date: 'May 5', status: 'rejected', client: 'FreightOps' },
  { id: '#PRO-005', projectName: 'E-Learning Platform', budget: '$5,500', timeline: '10 weeks', date: 'May 1', status: 'applied', client: 'EduTech' },
];

const SEED_CONTRACTS: Contract[] = [
  { id: 'CTR-001', project: 'AI-Powered CRM Dashboard', client: 'SalesForge Inc.', value: '$4,200', startDate: 'May 15, 2025', endDate: 'Jun 26, 2025', status: 'active', progress: 25, milestones: 3, completedMilestones: 1 },
  { id: 'CTR-002', project: 'E-Commerce API Integration', client: 'Shopify Store', value: '$1,200', startDate: 'Apr 10, 2025', endDate: 'May 10, 2025', status: 'completed', progress: 100, milestones: 2, completedMilestones: 2 },
  { id: 'CTR-003', project: 'Mobile Fitness App', client: 'FitVerse Co.', value: '$3,800', startDate: 'Jun 1, 2025', endDate: 'Jul 27, 2025', status: 'upcoming', progress: 0, milestones: 4, completedMilestones: 0 },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-001', description: 'Milestone: E-Commerce API', amount: '+$1,200', date: 'May 10', type: 'credit', status: 'completed' },
  { id: 'TXN-002', description: 'Withdrawal to Bank', amount: '-$2,000', date: 'May 8', type: 'debit', status: 'completed' },
  { id: 'TXN-003', description: 'Milestone: Dashboard Design', amount: '+$425', date: 'May 5', type: 'credit', status: 'pending' },
  { id: 'TXN-004', description: 'Platform Fee (5%)', amount: '-$60', date: 'May 5', type: 'debit', status: 'completed' },
  { id: 'TXN-005', description: 'Milestone: Auth Overhaul', amount: '+$600', date: 'Apr 28', type: 'credit', status: 'completed' },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'Proposal Accepted!', message: 'AI-Powered CRM Dashboard — client accepted your proposal.', timestamp: '2h ago', type: 'success', read: false },
  { id: 2, title: 'New Project Match', message: 'A 96% match project was just posted matching your skills.', timestamp: '5h ago', type: 'info', read: false },
  { id: 3, title: 'Milestone Payment', message: '$1,200 released for E-Commerce API milestone.', timestamp: '1d ago', type: 'success', read: true },
  { id: 4, title: 'Client Message', message: 'CRM Dashboard client sent you a message.', timestamp: '2d ago', type: 'info', read: true },
];

const SEED_REPUTATION = {
  overall: 4.9,
  breakdown: [
    { label: 'Communication', value: 4.9 }, { label: 'Quality', value: 5.0 },
    { label: 'Timeliness', value: 4.8 }, { label: 'Expertise', value: 4.9 },
  ],
  reviews: [
    { client: 'SalesForge Inc.', rating: 5, comment: 'Marcus delivered exceptional work. The dashboard exceeded all our expectations. Would absolutely hire again.', date: 'May 2025', project: 'CRM Dashboard' },
    { client: 'Shopify Store', rating: 5, comment: 'Brilliant developer. On time, within budget, and the API integration was flawless. Highly recommended.', date: 'Apr 2025', project: 'E-Commerce API' },
    { client: 'FitVerse Co.', rating: 4, comment: 'Great communication throughout the project. Very professional and technically sound.', date: 'Mar 2025', project: 'Fitness App' },
  ],
};

const SEED_ANALYTICS = [
  { label: 'Total Earnings', value: '$24,850', trend: '+18%', positive: true, icon: DollarSign },
  { label: 'Active Projects', value: '3', trend: '+2', positive: true, icon: Briefcase },
  { label: 'Proposals Sent', value: '12', trend: '+5', positive: true, icon: Send },
  { label: 'Success Rate', value: '76%', trend: '+4%', positive: true, icon: TrendingUp },
  { label: 'Avg Response', value: '2.4h', trend: '-0.6h', positive: true, icon: Clock },
  { label: 'Reputation', value: '4.9★', trend: '+0.1', positive: true, icon: Award },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// ─── Shared Styles ────────────────────────────────────────────────────────────
const s = {
  card: { background: '#fff', border: `1px solid ${C.rodeo}50`, borderRadius: 12, padding: '20px 22px' } as React.CSSProperties,
  cardHover: { background: '#fff', border: `1px solid ${C.green}60`, borderRadius: 12, padding: '20px 22px', boxShadow: `0 8px 32px ${C.green}12` } as React.CSSProperties,
  tag: (color = C.green): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6,
    fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
    background: color === C.green ? C.greenLight : color === C.gold ? C.goldLight : color === C.copper ? C.copperLight : `${color}15`,
    color, fontFamily: "'DM Sans', sans-serif",
  }),
  btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.18s ease', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
  btnPrimary: { background: C.green, color: C.ivory } as React.CSSProperties,
  btnSecondary: { background: 'transparent', color: C.copper, border: `1px solid ${C.copper}60` } as React.CSSProperties,
  btnDanger: { background: 'transparent', color: C.red, border: `1px solid ${C.red}60` } as React.CSSProperties,
  label: { fontSize: 11, color: C.gray, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`,
    background: '#fff', fontSize: 13, color: C.coffee, outline: 'none',
    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' as const,
  },
};

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
  { icon: FolderOpen, label: 'Discover', key: 'discover' },
  { icon: FileText, label: 'Proposals', key: 'proposals' },
  { icon: CheckCircle, label: 'Contracts', key: 'contracts' },
  { icon: Wallet, label: 'Wallet', key: 'wallet' },
  { icon: Trophy, label: 'Reputation', key: 'reputation' },
  { icon: Settings, label: 'Settings', key: 'settings' },
];

// ─── Tiny Components ──────────────────────────────────────────────────────────
function Avatar({ initials, size = 36, bg = C.greenLight, color = C.green }: { initials: string; size?: number; bg?: string; color?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ children, color = C.green }: { children: React.ReactNode; color?: string }) {
  return <span style={s.tag(color)}>{children}</span>;
}

function Divider() {
  return <div style={{ height: 1, background: `${C.rodeo}30`, margin: '4px 0' }} />;
}

function ProgressBar({ value, color = C.green }: { value: number; color?: string }) {
  return (
    <div style={{ height: 4, background: `${C.rodeo}25`, borderRadius: 99, overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        style={{ height: '100%', background: color, borderRadius: 99 }} />
    </div>
  );
}

function StarRating({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={size} fill={i <= Math.round(value) ? C.gold : 'none'} color={i <= Math.round(value) ? C.gold : C.rodeo} />)}
    </span>
  );
}

function useWindowSize() {
  const [size, setSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1200, height: typeof window !== 'undefined' ? window.innerHeight : 800 });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 520 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(75,54,47,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }}
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(75,54,47,0.18)' }}>
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

// ─── Delete Account Confirm Modal ─────────────────────────────────────────────
function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirm !== 'DELETE') { setError('Type DELETE to confirm.'); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      // Delete Firestore user data
      await updateDoc(doc(db, 'users', user.uid), { deleted: true, deletedAt: serverTimestamp() });
      // Delete the Firebase Auth account
      await user.delete();
      // Auth state change will redirect automatically
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete account. You may need to re-login first.');
      setLoading(false);
    }
  };

  useEffect(() => { if (open) { setConfirm(''); setError(''); } }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Delete Account" width={420}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.redLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <AlertCircle size={24} color={C.red} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>This is permanent</h3>
        <p style={{ fontSize: 13, color: C.gray, margin: 0, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
          All your data — proposals, contracts, wallet history, and profile — will be permanently deleted. This cannot be undone.
        </p>
      </div>
      <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>Type DELETE to confirm</label>
      <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE"
        style={{ ...s.input, marginBottom: 16, borderColor: confirm && confirm !== 'DELETE' ? C.red : `${C.rodeo}50` }} />
      {error && (
        <div style={{ background: C.redLight, border: `1px solid ${C.red}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} color={C.red} />
          <p style={{ fontSize: 12, color: C.red, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ ...s.btn, ...s.btnSecondary }}>Cancel</button>
        <button onClick={handleDelete} disabled={loading || confirm !== 'DELETE'}
          style={{ ...s.btn, background: C.red, color: '#fff', opacity: loading || confirm !== 'DELETE' ? 0.5 : 1 }}>
          {loading ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Deleting…</> : <><X size={13} /> Delete My Account</>}
        </button>
      </div>
    </Modal>
  );
}

// ─── New Proposal Modal ───────────────────────────────────────────────────────
function NewProposalModal({ open, onClose, userProfile }: { open: boolean; onClose: () => void; userProfile: UserProfile | null }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ projectTitle: '', clientName: '', budget: '', timeline: '', coverLetter: '', rate: '', startDate: '', skillsUsed: [] as string[] });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const skillOptions = userProfile?.skills || [];
  const totalSteps = 3;
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      await addDoc(collection(db, 'proposals'), {
        ...form,
        userId: user.uid,
        status: 'applied',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setForm({ projectTitle: '', clientName: '', budget: '', timeline: '', coverLetter: '', rate: '', startDate: '', skillsUsed: [] });
    setSubmitted(false);
    setError('');
    onClose();
  };

  const inputStyle = { ...s.input, marginBottom: 12 };
  const labelStyle = { ...s.label, display: 'block' as const, marginBottom: 5 };

  return (
    <Modal open={open} onClose={handleClose} title="Create New Proposal" width={560}>
      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={28} color={C.green} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.coffee, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>Proposal Submitted!</h3>
          <p style={{ fontSize: 13, color: C.gray, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>Your proposal for "{form.projectTitle}" has been sent to {form.clientName}.</p>
          <button onClick={handleClose} style={{ ...s.btn, ...s.btnPrimary }}>Back to Proposals</button>
        </motion.div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: n < totalSteps ? 1 : undefined }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: step >= n ? C.green : `${C.rodeo}25`, color: step >= n ? '#fff' : C.gray, transition: 'all 0.2s', flexShrink: 0 }}>
                  {step > n ? <Check size={13} /> : n}
                </div>
                {n < totalSteps && <div style={{ height: 2, flex: 1, borderRadius: 99, background: step > n ? C.green : `${C.rodeo}25`, transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <label style={labelStyle}>Project Title *</label>
                <input style={inputStyle} placeholder="e.g. Next.js SaaS Dashboard" value={form.projectTitle} onChange={e => set('projectTitle', e.target.value)} />
                <label style={labelStyle}>Client / Company Name *</label>
                <input style={inputStyle} placeholder="e.g. TechLaunch Inc." value={form.clientName} onChange={e => set('clientName', e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>Your Rate</label><input style={s.input} placeholder="e.g. $120/hr" value={form.rate} onChange={e => set('rate', e.target.value)} /></div>
                  <div><label style={labelStyle}>Proposed Start Date</label><input type="date" style={s.input} value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div><label style={labelStyle}>Budget Range *</label><input style={s.input} placeholder="e.g. $3,000–$5,000" value={form.budget} onChange={e => set('budget', e.target.value)} /></div>
                  <div><label style={labelStyle}>Timeline *</label><input style={s.input} placeholder="e.g. 6–8 weeks" value={form.timeline} onChange={e => set('timeline', e.target.value)} /></div>
                </div>
                <label style={labelStyle}>Skills You'll Use</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {skillOptions.map(sk => {
                    const selected = form.skillsUsed.includes(sk);
                    return (
                      <button key={sk} onClick={() => setForm(p => ({ ...p, skillsUsed: selected ? p.skillsUsed.filter(s => s !== sk) : [...p.skillsUsed, sk] }))}
                        style={{ ...s.btn, padding: '5px 12px', fontSize: 11, ...(selected ? s.btnPrimary : { background: '#fff', color: C.coffee, border: `1px solid ${C.rodeo}50` }) }}>
                        {sk}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <label style={labelStyle}>Cover Letter *</label>
                <textarea value={form.coverLetter} onChange={e => set('coverLetter', e.target.value)}
                  placeholder="Introduce yourself, highlight relevant experience, and explain why you're the right fit..."
                  style={{ ...s.input, height: 180, resize: 'vertical', lineHeight: 1.6 }} />
                <div style={{ background: C.goldLight, border: `1px solid ${C.gold}40`, borderRadius: 8, padding: '10px 14px', marginTop: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Sparkles size={14} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: C.coffee, margin: 0, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                    <strong>AI tip:</strong> Mention the client's industry, reference similar past work, and be specific about your approach.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p style={{ fontSize: 12, color: C.red, margin: '12px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.rodeo}25` }}>
            <button onClick={() => step > 1 ? setStep(step - 1) : handleClose()} style={{ ...s.btn, ...s.btnSecondary }}>
              {step === 1 ? 'Cancel' : <><ChevronLeft size={14} /> Back</>}
            </button>
            {step < totalSteps ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.projectTitle}
                style={{ ...s.btn, ...s.btnPrimary, opacity: step === 1 && !form.projectTitle ? 0.5 : 1 }}>
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !form.coverLetter}
                style={{ ...s.btn, ...s.btnPrimary, opacity: submitting || !form.coverLetter ? 0.6 : 1 }}>
                {submitting ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <><Send size={13} /> Submit Proposal</>}
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Generate Proposal Modal ──────────────────────────────────────────────────
function GenerateProposalModal({ open, onClose, project, userProfile }: { open: boolean; onClose: () => void; project: Project | null; userProfile: UserProfile | null }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!project || !userProfile) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1400));
    setGenerated(
      `Dear ${project.clientName} Team,\n\nI'm excited to apply for the "${project.title}" project. With ${userProfile.yearsExp || '5+'} years of experience in ${project.skills.slice(0, 2).join(' and ')}, I've built similar systems for multiple clients and am confident I can deliver exactly what you need.\n\nMy approach would be to start with a thorough discovery phase to align on requirements, then move into a structured development cycle with weekly demos. I've previously delivered ${project.skills[0] ?? 'similar'} projects on-time and within budget.\n\nI'm available to start immediately and can commit full-time to this project. My proposed timeline aligns with your ${project.timeline} expectation.\n\nI'd love to jump on a quick call to discuss the details further.\n\nBest regards,\n${userProfile.fullName}`
    );
    setGenerating(false);
  };

  useEffect(() => {
    if (open && project) { setGenerated(''); setSubmitted(false); setCustomNote(''); setError(''); }
  }, [open, project]);

  const handleSubmit = async () => {
    if (!project) return;
    setSubmitting(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      await addDoc(collection(db, 'proposals'), {
        projectName: project.title,
        clientName: project.clientName,
        budget: project.budget,
        timeline: project.timeline,
        coverLetter: generated,
        skillsUsed: project.skills,
        userId: user.uid,
        status: 'applied',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!project) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Proposal — ${project.title}`} width={600}>
      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={28} color={C.green} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.coffee, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>Proposal Sent!</h3>
          <p style={{ fontSize: 13, color: C.gray, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>Your proposal was submitted to {project.clientName}.</p>
          <button onClick={onClose} style={{ ...s.btn, ...s.btnPrimary }}>Back to Discover</button>
        </motion.div>
      ) : (
        <>
          <div style={{ background: C.ivory, border: `1px solid ${C.rodeo}30`, borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div><p style={s.label}>Budget</p><p style={{ fontSize: 13, fontWeight: 700, color: C.green, margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{project.budget}</p></div>
              <div><p style={s.label}>Timeline</p><p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{project.timeline}</p></div>
              <div><p style={s.label}>AI Match</p><p style={{ fontSize: 13, fontWeight: 700, color: C.copper, margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{project.matchScore}%</p></div>
              <div><p style={s.label}>Client</p><p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{project.clientName}</p></div>
            </div>
          </div>

          {!generated ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={24} color={C.gold} />
              </div>
              <p style={{ fontSize: 14, color: C.coffee, margin: '0 0 6px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>AI-Powered Proposal</p>
              <p style={{ fontSize: 13, color: C.gray, margin: '0 0 24px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                Generate a tailored cover letter using your profile, skills, and this project's requirements.
              </p>
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...s.label, display: 'block', marginBottom: 6, textAlign: 'left' }}>Add a personal note (optional)</label>
                <textarea value={customNote} onChange={e => setCustomNote(e.target.value)}
                  placeholder="Any specific context to include..." style={{ ...s.input, height: 80, resize: 'none' }} />
              </div>
              <button onClick={handleGenerate} disabled={generating}
                style={{ ...s.btn, ...s.btnPrimary, fontSize: 14, padding: '11px 28px' }}>
                {generating ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</> : <><Sparkles size={14} /> Generate with AI</>}
              </button>
            </div>
          ) : (
            <>
              <label style={{ ...s.label, display: 'block', marginBottom: 8 }}>Generated Cover Letter — edit before sending</label>
              <textarea value={generated} onChange={e => setGenerated(e.target.value)}
                style={{ ...s.input, height: 260, resize: 'vertical', lineHeight: 1.65, fontSize: 12 }} />
              {error && <p style={{ fontSize: 12, color: C.red, margin: '8px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button onClick={handleGenerate} style={{ ...s.btn, ...s.btnSecondary }}><RefreshCw size={13} /> Regenerate</button>
                <button onClick={handleSubmit} disabled={submitting} style={{ ...s.btn, ...s.btnPrimary }}>
                  {submitting ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : <><Send size={13} /> Send Proposal</>}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}

// ─── View Contract Modal ──────────────────────────────────────────────────────
function ViewContractModal({ open, onClose, contract }: { open: boolean; onClose: () => void; contract: Contract | null }) {
  if (!contract) return null;
  const statusCfg: Record<string, { color: string; label: string }> = {
    active: { color: C.green, label: 'Active' },
    completed: { color: C.copper, label: 'Completed' },
    upcoming: { color: C.gold, label: 'Upcoming' },
  };
  const cfg = statusCfg[contract.status] || { color: C.gray, label: contract.status };
  return (
    <Modal open={open} onClose={onClose} title="Contract Details" width={520}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{contract.project}</h3>
          <p style={{ ...s.label, margin: 0 }}>{contract.id}</p>
        </div>
        <Badge color={cfg.color}>{cfg.label}</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Client', value: contract.client },
          { label: 'Contract Value', value: contract.value },
          { label: 'Start Date', value: contract.startDate },
          { label: 'End Date', value: contract.endDate },
          { label: 'Milestones', value: `${contract.completedMilestones} / ${contract.milestones} completed` },
          { label: 'Progress', value: `${contract.progress}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: C.ivory, borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ ...s.label, margin: '0 0 3px' }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={s.label}>Completion</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{contract.progress}%</span>
        </div>
        <ProgressBar value={contract.progress} color={cfg.color} />
      </div>
      {contract.status === 'active' && (
        <div style={{ padding: '14px', background: C.greenLight, borderRadius: 10, border: `1px solid ${C.greenMid}` }}>
          <p style={{ fontSize: 12, color: C.coffee, margin: '0 0 4px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Contract in progress</p>
          <p style={{ fontSize: 11, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Next milestone due {contract.endDate}. Submit your deliverables before the deadline.</p>
        </div>
      )}
    </Modal>
  );
}

// ─── Submit Work Modal ────────────────────────────────────────────────────────
function SubmitWorkModal({ open, onClose, contract }: { open: boolean; onClose: () => void; contract: Contract | null }) {
  const [form, setForm] = useState({ milestone: '', deliverableLink: '', notes: '', requestPayment: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user || !contract) throw new Error('Not authenticated');
      await addDoc(collection(db, 'workSubmissions'), {
        contractId: contract.id,
        userId: user.uid,
        milestone: form.milestone,
        deliverableLink: form.deliverableLink,
        notes: form.notes,
        requestPayment: form.requestPayment,
        submittedAt: serverTimestamp(),
        status: 'submitted',
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit work.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) { setForm({ milestone: '', deliverableLink: '', notes: '', requestPayment: false }); setSubmitted(false); setError(''); }
  }, [open]);

  if (!contract) return null;

  return (
    <Modal open={open} onClose={onClose} title="Submit Work" width={500}>
      {submitted ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={28} color={C.green} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.coffee, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>Work Submitted!</h3>
          <p style={{ fontSize: 13, color: C.gray, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>
            {contract.client} has been notified.{form.requestPayment ? ' A payment release request has also been sent.' : ''}
          </p>
          <button onClick={onClose} style={{ ...s.btn, ...s.btnPrimary }}>Back to Contracts</button>
        </motion.div>
      ) : (
        <>
          <div style={{ background: C.ivory, borderRadius: 8, padding: '12px 14px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{contract.project}</p>
              <p style={{ ...s.label, margin: 0 }}>{contract.client}</p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.green, fontFamily: "'DM Sans', sans-serif" }}>{contract.value}</span>
          </div>
          <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Milestone *</label>
          <select value={form.milestone} onChange={e => set('milestone', e.target.value)}
            style={{ ...s.input, marginBottom: 14, cursor: 'pointer' }}>
            <option value="">Select milestone...</option>
            <option value="m1">Milestone 1 — Initial Setup & Architecture</option>
            <option value="m2">Milestone 2 — Core Features Development</option>
            <option value="m3">Milestone 3 — Testing & Final Delivery</option>
          </select>
          <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Deliverable Link *</label>
          <input value={form.deliverableLink} onChange={e => set('deliverableLink', e.target.value)}
            placeholder="GitHub repo, Figma, Vercel preview..."
            style={{ ...s.input, marginBottom: 14 }} />
          <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Notes to Client</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Describe what you've completed, any known issues, next steps..."
            style={{ ...s.input, height: 100, resize: 'none', marginBottom: 16 }} />
          <div onClick={() => set('requestPayment', !form.requestPayment)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: form.requestPayment ? C.greenLight : C.ivory, borderRadius: 8, border: `1px solid ${form.requestPayment ? C.green : C.rodeo}40`, cursor: 'pointer', marginBottom: 20 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${form.requestPayment ? C.green : C.rodeo}`, background: form.requestPayment ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
              {form.requestPayment && <Check size={12} color="#fff" />}
            </div>
            <p style={{ fontSize: 13, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Also request milestone payment release</p>
          </div>
          {error && <p style={{ fontSize: 12, color: C.red, margin: '0 0 12px', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ ...s.btn, ...s.btnSecondary }}>Cancel</button>
            <button onClick={handleSubmit} disabled={submitting || !form.milestone || !form.deliverableLink}
              style={{ ...s.btn, ...s.btnPrimary, opacity: submitting || !form.milestone || !form.deliverableLink ? 0.6 : 1 }}>
              {submitting ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <><Upload size={13} /> Submit Work</>}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const strength = (pw: string) => {
    let sc = 0;
    if (pw.length >= 8) sc++;
    if (/[A-Z]/.test(pw)) sc++;
    if (/[0-9]/.test(pw)) sc++;
    if (/[^A-Za-z0-9]/.test(pw)) sc++;
    return sc;
  };
  const str = strength(form.newPass);
  const strColor = ['#ccc', C.red, C.gold, C.gold, C.green][str];
  const strLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][str];

  const handleChange = async () => {
    setError('');
    if (form.newPass !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.newPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Not authenticated');
      const credential = EmailAuthProvider.credential(user.email, form.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, form.newPass);
      setSuccess(true);
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password' ? 'Current password is incorrect.' : e.message ?? 'Failed to update password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) { setForm({ current: '', newPass: '', confirm: '' }); setError(''); setSuccess(false); }
  }, [open]);

  const EyeBtn = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray, padding: '0 4px', display: 'flex', alignItems: 'center' }}>
      <Eye size={15} />
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} title="Change Password" width={420}>
      {success ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={24} color={C.green} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>Password Updated</h3>
          <p style={{ fontSize: 13, color: C.gray, margin: '0 0 20px', fontFamily: "'DM Sans', sans-serif" }}>Your password has been changed successfully.</p>
          <button onClick={onClose} style={{ ...s.btn, ...s.btnPrimary }}>Done</button>
        </motion.div>
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Current Password</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.rodeo}50`, borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
              <input type={showCurrent ? 'text' : 'password'} value={form.current} onChange={e => set('current', e.target.value)}
                placeholder="Enter current password" style={{ ...s.input, border: 'none', borderRadius: 0, marginBottom: 0, flex: 1 }} />
              <EyeBtn show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>New Password</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.rodeo}50`, borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
              <input type={showNew ? 'text' : 'password'} value={form.newPass} onChange={e => set('newPass', e.target.value)}
                placeholder="At least 8 characters" style={{ ...s.input, border: 'none', borderRadius: 0, marginBottom: 0, flex: 1 }} />
              <EyeBtn show={showNew} onToggle={() => setShowNew(!showNew)} />
            </div>
            {form.newPass && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 99, background: `${C.rodeo}25`, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(str / 4) * 100}%`, background: strColor, borderRadius: 99, transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: 11, color: strColor, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", minWidth: 36 }}>{strLabel}</span>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Confirm New Password</label>
            <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)}
              placeholder="Repeat new password"
              style={{ ...s.input, borderColor: form.confirm && form.confirm !== form.newPass ? C.red : `${C.rodeo}50` }} />
            {form.confirm && form.confirm !== form.newPass && (
              <p style={{ fontSize: 11, color: C.red, margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif" }}>Passwords do not match</p>
            )}
          </div>
          {error && (
            <div style={{ background: C.redLight, border: `1px solid ${C.red}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} color={C.red} />
              <p style={{ fontSize: 12, color: C.red, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ ...s.btn, ...s.btnSecondary }}>Cancel</button>
            <button onClick={handleChange} disabled={loading || !form.current || !form.newPass || form.newPass !== form.confirm}
              style={{ ...s.btn, ...s.btnPrimary, opacity: loading || !form.current || !form.newPass || form.newPass !== form.confirm ? 0.6 : 1 }}>
              {loading ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Key size={13} /> Update Password</>}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Analytics Card ───────────────────────────────────────────────────────────
function AnalyticsCard({ data, index }: { data: typeof SEED_ANALYTICS[0]; index: number }) {
  const Icon = data.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }} whileHover={{ y: -2 }}
      style={{ ...s.card, cursor: 'default', position: 'relative', overflow: 'hidden' }}>
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

// ─── Milestone Card ───────────────────────────────────────────────────────────
function MilestoneCard({ m, index }: { m: Milestone; index: number }) {
  const cfg = {
    completed: { color: C.green, label: 'Completed', Icon: CheckCircle },
    'in-progress': { color: C.gold, label: 'In Progress', Icon: Activity },
    pending: { color: C.gray, label: 'Pending', Icon: Clock },
  }[m.status] || { color: C.gray, label: 'Pending', Icon: Clock };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + index * 0.07 }} whileHover={{ y: -2 }} style={s.card}>
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

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ p, index, onGenerateProposal }: { p: Project; index: number; onGenerateProposal: (p: Project) => void }) {
  const [hovered, setHovered] = useState(false);
  const circ = 2 * Math.PI * 26;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.07 }} whileHover={{ y: -3 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      style={{ ...(hovered ? s.cardHover : s.card), display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: 0, lineHeight: 1.4, fontFamily: "'DM Sans', sans-serif" }}>{p.title}</h3>
          {p.matchScore >= 90 && <span style={{ ...s.tag(C.gold), whiteSpace: 'nowrap', fontSize: 10 }}><Sparkles size={9} /> Top Match</span>}
        </div>
        <p style={{ fontSize: 12, color: C.gray, margin: 0, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{p.description}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '10px 0', borderTop: `1px solid ${C.rodeo}25`, borderBottom: `1px solid ${C.rodeo}25` }}>
        <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
          <svg width="48" height="48" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="30" cy="30" r="26" fill="none" stroke={`${C.rodeo}30`} strokeWidth="4" />
            <motion.circle cx="30" cy="30" r="26" fill="none" stroke={C.green} strokeWidth="4" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - p.matchScore / 100) }} transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }} strokeLinecap="round" />
          </svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{p.matchScore}%</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ ...s.label, marginBottom: 2 }}>AI Match</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.green, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{p.budget}</p>
          <p style={s.label}>{p.timeline}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ ...s.label, marginBottom: 2 }}>Applicants</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{p.applicants}</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
        {p.skills.map(sk => <span key={sk} style={{ ...s.tag(C.copper), fontSize: 10 }}>{sk}</span>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar initials={p.clientName.slice(0, 2).toUpperCase()} size={24} bg={C.copperLight} color={C.copper} />
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{p.clientName}</p>
            <StarRating value={p.clientRating} size={9} />
          </div>
        </div>
        <span style={s.label}>{p.posted}</span>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={() => onGenerateProposal(p)}
        style={{ ...s.btn, ...s.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
        <Zap size={12} /> Generate Proposal <ArrowRight size={12} />
      </motion.button>
    </motion.div>
  );
}

// ─── Proposals Page ───────────────────────────────────────────────────────────
function ProposalsPage({ isMobile, onNew, proposals }: { isMobile: boolean; onNew: () => void; proposals: Proposal[] }) {
  const statusCfg: Record<string, { color: string; label: string; Icon: any }> = {
    accepted: { color: C.green, label: 'Accepted', Icon: Check },
    shortlisted: { color: C.gold, label: 'Shortlisted', Icon: Star },
    applied: { color: C.copper, label: 'Applied', Icon: Clock },
    rejected: { color: C.rodeo, label: 'Rejected', Icon: X },
  };
  return (
    <motion.div key="proposals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Sent', value: String(proposals.length), icon: Send },
          { label: 'Accepted', value: String(proposals.filter(p => p.status === 'accepted').length), icon: CheckCircle, color: C.green },
          { label: 'Shortlisted', value: String(proposals.filter(p => p.status === 'shortlisted').length), icon: Star, color: C.gold },
          { label: 'Success Rate', value: proposals.length ? `${Math.round(proposals.filter(p => p.status === 'accepted').length / proposals.length * 100)}%` : '0%', icon: TrendingUp, color: C.copper },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color={(stat as any).color || C.green} />
                </div>
                <div>
                  <p style={{ ...s.label, margin: 0 }}>{stat.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.rodeo}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Proposal History</h2>
            <p style={{ ...s.label, margin: '2px 0 0' }}>{proposals.length} proposals sent</p>
          </div>
          <button onClick={onNew} style={{ ...s.btn, ...s.btnPrimary }}><Plus size={13} /> New Proposal</button>
        </div>
        {isMobile ? (
          <div>
            {proposals.map((p, i) => {
              const cfg = statusCfg[p.status] || { color: C.gray, label: p.status, Icon: Clock };
              const Icon = cfg.Icon;
              return (
                <div key={p.id} style={{ padding: '14px 20px', borderBottom: i < proposals.length - 1 ? `1px solid ${C.rodeo}20` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{p.projectName}</p>
                    <span style={{ ...s.tag(cfg.color), gap: 5 }}><Icon size={10} /> {cfg.label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: C.gray, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{p.client} · {p.date}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.green, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{p.budget} · {p.timeline}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.ivory }}>
                  {['ID', 'Project', 'Client', 'Budget', 'Timeline', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 18px', textAlign: 'left', ...s.label, borderBottom: `1px solid ${C.rodeo}30` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.map((p, i) => {
                  const cfg = statusCfg[p.status] || { color: C.gray, label: p.status, Icon: Clock };
                  const Icon = cfg.Icon;
                  return (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                      style={{ borderBottom: `1px solid ${C.rodeo}20`, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 18px', fontSize: 11, color: C.gray, fontFamily: 'monospace' }}>{p.id}</td>
                      <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 600, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{p.projectName}</td>
                      <td style={{ padding: '12px 18px', fontSize: 12, color: C.copper, fontFamily: "'DM Sans', sans-serif" }}>{p.client}</td>
                      <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 700, color: C.green, fontFamily: "'DM Sans', sans-serif" }}>{p.budget}</td>
                      <td style={{ padding: '12px 18px', fontSize: 12, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{p.timeline}</td>
                      <td style={{ padding: '12px 18px', fontSize: 11, color: C.gray, fontFamily: "'DM Sans', sans-serif" }}>{p.date}</td>
                      <td style={{ padding: '12px 18px' }}><span style={{ ...s.tag(cfg.color), gap: 5 }}><Icon size={10} /> {cfg.label}</span></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Contracts Page ───────────────────────────────────────────────────────────
function ContractsPage({ onView, onSubmit, contracts }: { onView: (c: Contract) => void; onSubmit: (c: Contract) => void; contracts: Contract[] }) {
  const statusCfg: Record<string, { color: string; label: string }> = {
    active: { color: C.green, label: 'Active' },
    completed: { color: C.copper, label: 'Completed' },
    upcoming: { color: C.gold, label: 'Upcoming' },
  };
  return (
    <motion.div key="contracts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        {contracts.map((c, i) => {
          const cfg = statusCfg[c.status] || { color: C.gray, label: c.status };
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{c.project}</h3>
                    <Badge color={cfg.color}>{cfg.label}</Badge>
                  </div>
                  <p style={{ ...s.label, margin: 0 }}>{c.client} · {c.id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: C.green, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{c.value}</p>
                  <p style={{ ...s.label, margin: 0 }}>{c.milestones} milestones</p>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={s.label}>Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{c.progress}% · {c.completedMilestones}/{c.milestones} milestones</span>
                </div>
                <ProgressBar value={c.progress} color={cfg.color} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div><p style={{ ...s.label, margin: '0 0 1px' }}>Start</p><p style={{ fontSize: 12, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{c.startDate}</p></div>
                  <div><p style={{ ...s.label, margin: '0 0 1px' }}>End</p><p style={{ fontSize: 12, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{c.endDate}</p></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onView(c)} style={{ ...s.btn, ...s.btnSecondary, padding: '7px 14px' }}><Eye size={13} /> View</button>
                  {c.status === 'active' && (
                    <button onClick={() => onSubmit(c)} style={{ ...s.btn, ...s.btnPrimary, padding: '7px 14px' }}><Upload size={13} /> Submit Work</button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Wallet Page ──────────────────────────────────────────────────────────────
function WalletPage({ transactions }: { transactions: Transaction[] }) {
  const totalCredit = transactions.filter(t => t.type === 'credit' && t.status === 'completed').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.]/g, '')), 0);
  const totalDebit = transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.]/g, '')), 0);
  const pending = transactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.]/g, '')), 0);
  const balance = totalCredit - totalDebit;

  return (
    <motion.div key="wallet" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: C.coffee, borderRadius: 16, padding: '28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `${C.green}20` }} />
        <div style={{ position: 'absolute', bottom: -30, right: 60, width: 100, height: 100, borderRadius: '50%', background: `${C.gold}15` }} />
        <p style={{ ...s.label, color: `${C.ivory}80`, marginBottom: 8 }}>Available Balance</p>
        <p style={{ fontSize: 40, fontWeight: 800, color: C.ivory, margin: '0 0 20px', fontFamily: "'DM Sans', sans-serif" }}>${balance.toLocaleString()}<span style={{ fontSize: 20, fontWeight: 400, opacity: 0.6 }}>.00</span></p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ ...s.btn, background: C.green, color: C.ivory }}><Download size={13} /> Withdraw</button>
          <button style={{ ...s.btn, background: `${C.ivory}20`, color: C.ivory, border: `1px solid ${C.ivory}30` }}><RefreshCw size={13} /> Transfer</button>
        </div>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Earned', value: `+$${totalCredit.toLocaleString()}`, color: C.green, icon: ArrowUpRight },
          { label: 'Pending', value: `$${pending.toLocaleString()}`, color: C.gold, icon: Clock },
          { label: 'Withdrawn', value: `-$${totalDebit.toLocaleString()}`, color: C.copper, icon: ArrowDownRight },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.06 }} style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <p style={{ ...s.label, margin: 0 }}>{stat.label}</p>
                <Icon size={14} color={stat.color} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: stat.color, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</p>
            </motion.div>
          );
        })}
      </div>
      <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.rodeo}30` }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Transaction History</h3>
        </div>
        {transactions.map((tx, i) => (
          <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < transactions.length - 1 ? `1px solid ${C.rodeo}20` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: tx.type === 'credit' ? C.greenLight : C.copperLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {tx.type === 'credit' ? <ArrowUpRight size={15} color={C.green} /> : <ArrowDownRight size={15} color={C.copper} />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{tx.description}</p>
                <p style={{ ...s.label, margin: '2px 0 0' }}>{tx.id} · {tx.date}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif", color: tx.type === 'credit' ? C.green : C.copper }}>{tx.amount}</p>
              <Badge color={tx.status === 'completed' ? C.green : C.gold}>{tx.status}</Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Reputation Page ──────────────────────────────────────────────────────────
function ReputationPage({ isMobile, userProfile }: { isMobile: boolean; userProfile: UserProfile | null }) {
  const rep = SEED_REPUTATION;
  const overall = userProfile?.rating ?? rep.overall;
  const completed = userProfile?.completedProjects ?? 47;
  return (
    <motion.div key="reputation" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 18, marginBottom: 22 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...s.card, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.greenLight, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: C.green, fontFamily: "'DM Sans', sans-serif" }}>{overall}</span>
          </div>
          <StarRating value={overall} size={16} />
          <p style={{ ...s.label, margin: '8px 0 0' }}>Overall Rating</p>
          <Divider />
          <p style={{ fontSize: 13, color: C.gray, fontFamily: "'DM Sans', sans-serif", margin: '10px 0 0' }}>Based on {completed} projects</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={s.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>Score Breakdown</h3>
          {rep.breakdown.map(item => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFamily: "'DM Sans', sans-serif" }}>{item.value} / 5.0</span>
              </div>
              <ProgressBar value={(item.value / 5) * 100} color={C.green} />
            </div>
          ))}
        </motion.div>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.coffee, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>Client Reviews</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {rep.reviews.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }} style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initials={r.client.slice(0, 2)} size={36} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{r.client}</p>
                  <p style={{ ...s.label, margin: '1px 0 0' }}>{r.project}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}><StarRating value={r.rating} size={12} /><p style={{ ...s.label, margin: '3px 0 0' }}>{r.date}</p></div>
            </div>
            <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0, fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>"{r.comment}"</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage({ isMobile, onChangePassword, onDeleteAccount, userProfile, onProfileUpdated }: {
  isMobile: boolean; onChangePassword: () => void; onDeleteAccount: () => void;
  userProfile: UserProfile | null; onProfileUpdated: (p: Partial<UserProfile>) => void;
}) {
  const [notifs, setNotifs] = useState({ email: true, sms: false, proposals: true, milestones: true });
  const [skills, setSkills] = useState<string[]>(userProfile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    fullName: userProfile?.fullName || '',
    email: userProfile?.email || '',
    title: userProfile?.primaryRole || '',
    location: userProfile?.country || '',
    hourlyRate: userProfile?.hourlyRate || '',
    languages: userProfile?.languages || '',
    bio: userProfile?.bio || '',
  });

  // Sync if userProfile loads after mount
  useEffect(() => {
    if (userProfile) {
      setForm({
        fullName: userProfile.fullName,
        email: userProfile.email,
        title: userProfile.primaryRole || '',
        location: userProfile.country || '',
        hourlyRate: userProfile.hourlyRate || '',
        languages: userProfile.languages || '',
        bio: userProfile.bio,
      });
      setSkills(userProfile.skills || []);
    }
  }, [userProfile?.uid]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const updates = {
  fullName: form.fullName || '',
  primaryRole: form.title || '',
  country: form.location || '',
  hourlyRate: form.hourlyRate || '',
  languages: form.languages || '',
  bio: form.bio || '',
  updatedAt: serverTimestamp(),
};
      await updateDoc(doc(db, 'users', user.uid), updates);
      onProfileUpdated({ ...updates, skills });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setSaveError(e.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    const sk = newSkill.trim();
    if (sk && !skills.includes(sk)) {
      const newSkills = [...skills, sk];
      setSkills(newSkills);
      try {
        const user = auth.currentUser;
        if (user) await updateDoc(doc(db, 'users', user.uid), { skills: arrayUnion(sk) });
      } catch (e) { console.error(e); }
    }
    setNewSkill('');
    setAddingSkill(false);
  };

  const handleRemoveSkill = async (sk: string) => {
    setSkills(prev => prev.filter(s => s !== sk));
    try {
      const user = auth.currentUser;
      if (user) await updateDoc(doc(db, 'users', user.uid), { skills: arrayRemove(sk) });
    } catch (e) { console.error(e); }
  };

  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>
        {/* Profile Info */}
        <div style={{ ...s.card, gridColumn: isMobile ? '1' : '1 / -1' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>Profile Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Full Name', key: 'fullName', icon: User, type: 'text' },
              { label: 'Email', key: 'email', icon: Mail, type: 'email' },
              { label: 'Primary Role', key: 'title', icon: Briefcase, type: 'text' },
              { label: 'Location', key: 'location', icon: MapPin, type: 'text' },
              { label: 'Hourly Rate', key: 'hourlyRate', icon: DollarSign, type: 'text' },
              { label: 'Languages', key: 'languages', icon: Globe, type: 'text' },
            ].map(({ label, key, icon: Icon, type }) => (
              <div key={key}>
                <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`, background: '#fff' }}>
                  <Icon size={14} color={C.gray} style={{ flexShrink: 0 }} />
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    disabled={key === 'email'}
                    style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif", border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: 0, opacity: key === 'email' ? 0.6 : 1 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              style={{ ...s.input, height: 90, resize: 'vertical' }} />
          </div>
          {saveError && <p style={{ fontSize: 12, color: C.red, margin: '8px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{saveError}</p>}
          <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={handleSave} disabled={saving} style={{ ...s.btn, ...s.btnPrimary, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Edit3 size={13} /> Save Changes</>}
            </button>
            <AnimatePresence>
              {saved && (
                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 12, color: C.green, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={13} /> Saved!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Skills */}
        <div style={s.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>Skills & Expertise</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {skills.map(sk => (
              <div key={sk} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: C.copperLight, border: `1px solid ${C.copper}25` }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.copper, fontFamily: "'DM Sans', sans-serif" }}>{sk}</span>
                <button onClick={() => handleRemoveSkill(sk)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.copper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: 0.6 }}>
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
          {addingSkill ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input autoFocus value={newSkill} onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); if (e.key === 'Escape') { setAddingSkill(false); setNewSkill(''); } }}
                placeholder="e.g. Tailwind CSS" style={{ ...s.input, flex: 1 }} />
              <button onClick={handleAddSkill} style={{ ...s.btn, ...s.btnPrimary, padding: '8px 14px' }}>Add</button>
              <button onClick={() => { setAddingSkill(false); setNewSkill(''); }} style={{ ...s.btn, ...s.btnSecondary, padding: '8px 14px' }}><X size={13} /></button>
            </div>
          ) : (
            <button onClick={() => setAddingSkill(true)} style={{ ...s.btn, ...s.btnSecondary, padding: '7px 14px', fontSize: 12 }}>
              <Plus size={12} /> Add Skill
            </button>
          )}
        </div>

        {/* Notifications */}
        <div style={s.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>Notifications</h3>
          {[{ key: 'email', label: 'Email Notifications' }, { key: 'sms', label: 'SMS Alerts' }, { key: 'proposals', label: 'Proposal Updates' }, { key: 'milestones', label: 'Milestone Payments' }].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.rodeo}20` }}>
              <span style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
              <div onClick={() => setNotifs(p => ({ ...p, [key]: !(p as any)[key] }))}
                style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', transition: 'background 0.2s', background: (notifs as any)[key] ? C.green : `${C.rodeo}60`, position: 'relative' }}>
                <motion.div animate={{ left: (notifs as any)[key] ? 20 : 2 }} transition={{ duration: 0.2 }}
                  style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Security */}
        <div style={{ ...s.card, gridColumn: isMobile ? '1' : '1 / -1' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>Security</h3>
          <p style={{ fontSize: 12, color: C.gray, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>Manage your password and two-factor authentication settings.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <button onClick={onChangePassword} style={{ ...s.btn, ...s.btnPrimary }}><Key size={13} /> Change Password</button>
            <button style={{ ...s.btn, ...s.btnSecondary }}><Shield size={13} /> Enable 2FA</button>
          </div>
          <Divider />
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: C.red, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>Danger Zone</h4>
            <p style={{ fontSize: 12, color: C.gray, margin: '0 0 12px', fontFamily: "'DM Sans', sans-serif" }}>Permanently delete your account and all associated data.</p>
            <button onClick={onDeleteAccount} style={{ ...s.btn, ...s.btnDanger, fontSize: 12, padding: '7px 14px' }}>
              <X size={12} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────
function DashboardPage({ isMobile, isTablet, userProfile, milestones, onEditProfile }: {
  isMobile: boolean; isTablet: boolean; userProfile: UserProfile | null;
  milestones: Milestone[]; onEditProfile: () => void;
}) {
  const cols = isMobile ? '1fr 1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)';
  const analytics = SEED_ANALYTICS.map(a => {
    if (a.label === 'Reputation' && userProfile) return { ...a, value: `${userProfile.rating}★` };
    if (a.label === 'Active Projects') return { ...a, value: String(milestones.filter(m => m.status === 'in-progress').length || 3) };
    return a;
  });

  return (
    <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, marginBottom: 24 }}>
        {analytics.map((d, i) => <AnalyticsCard key={d.label} data={d} index={i} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '2fr 1fr', gap: 18 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Active Milestones</h2>
            <button style={{ fontSize: 12, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>View all →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {milestones.map((m, i) => <MilestoneCard key={m.title} m={m} index={i} />)}
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.coffee, margin: '0 0 12px', fontFamily: "'DM Sans', sans-serif" }}>Profile Snapshot</h2>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Avatar initials={userProfile ? getInitials(userProfile.fullName) : 'MG'} size={48} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{userProfile?.fullName || 'Loading…'}</p>
                <p style={{ ...s.label, margin: '2px 0 0' }}>{userProfile?.primaryRole || ''}</p>
              </div>
            </div>
            <Divider />
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {[
                { label: 'Rating', value: `${userProfile?.rating ?? '—'} ★` },
                { label: 'Projects Done', value: String(userProfile?.completedProjects ?? '—') },
                { label: 'Member Since', value: userProfile?.memberSince ?? '—' },
                { label: 'Rate', value: userProfile?.hourlyRate || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={s.label}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{value}</span>
                </div>
              ))}
            </div>
            <Divider />
            <div style={{ marginTop: 12 }}>
              <p style={{ ...s.label, marginBottom: 8 }}>Profile Completion</p>
              <ProgressBar value={82} />
              <p style={{ fontSize: 11, color: C.gray, margin: '5px 0 0', fontFamily: "'DM Sans', sans-serif" }}>82% — Add portfolio to complete</p>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onEditProfile}
              style={{ ...s.btn, ...s.btnSecondary, width: '100%', justifyContent: 'center', marginTop: 14 }}>
              <Edit3 size={13} /> Edit Profile
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Discover Page ────────────────────────────────────────────────────────────
function DiscoverPage({ isMobile, isTablet, onGenerateProposal }: { isMobile: boolean; isTablet: boolean; onGenerateProposal: (p: Project) => void }) {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Next.js', 'React Native', 'Node.js', 'AI / ML'];
  const filtered = filter === 'All' ? SEED_PROJECTS : SEED_PROJECTS.filter(p => p.skills.some(sk => sk.toLowerCase().includes(filter.toLowerCase())));
  const cols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)';
  return (
    <motion.div key="discover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...s.btn, padding: '6px 14px', ...(filter === f ? s.btnPrimary : { background: '#fff', color: C.coffee, border: `1px solid ${C.rodeo}50` }), fontSize: 12 }}>
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.gray, fontFamily: "'DM Sans', sans-serif" }}>
          <Sparkles size={14} color={C.gold} /> AI-matched
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        <AnimatePresence mode="wait">
          {filtered.map((p, i) => <ProjectCard key={p.id} p={p} index={i} onGenerateProposal={onGenerateProposal} />)}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Page Headers ─────────────────────────────────────────────────────────────
const pageHeaders: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: "Here's what's happening with your portfolio today." },
  discover: { title: 'Discover Projects', subtitle: 'AI-matched opportunities based on your skills and history.' },
  proposals: { title: 'My Proposals', subtitle: 'Track the status of all your submitted proposals.' },
  contracts: { title: 'Contracts', subtitle: 'Active agreements and project milestones.' },
  wallet: { title: 'Wallet', subtitle: 'Manage your earnings, payments and withdrawals.' },
  reputation: { title: 'Reputation', subtitle: 'Your client reviews and performance ratings.' },
  settings: { title: 'Settings', subtitle: 'Manage your profile, preferences and security.' },
};

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Logo />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function MGNovaDashboard() {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  // ── Firebase auth state ──
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ── Firestore data ──
  const [proposals, setProposals] = useState<Proposal[]>(SEED_PROPOSALS);
  const [contracts, setContracts] = useState<Contract[]>(SEED_CONTRACTS);
  const [milestones, setMilestones] = useState<Milestone[]>(SEED_MILESTONES);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  // ── UI state ──
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  // ── Modal states ──
  const [newProposalOpen, setNewProposalOpen] = useState(false);
  const [generateProposalOpen, setGenerateProposalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewContractOpen, setViewContractOpen] = useState(false);
  const [submitWorkOpen, setSubmitWorkOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // ── Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            setUserProfile({ uid: user.uid, ...snap.data() } as UserProfile);
          } else {
            // Seed default profile for new users
            const defaultProfile: UserProfile = {
              fullName: user.displayName || 'New User',
              email: user.email || '',
              role: 'freelancer',
              primaryRole: 'Freelancer',
              yearsExp: '1',
              country: '',
              availability: 'Full-Time',
              hourlyRate: '',
              languages: 'English',
              skills: [],
              memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              rating: 0,
              completedProjects: 0,
              bio: '',
            };
            await setDoc(doc(db, 'users', user.uid), defaultProfile);
            setUserProfile({ uid: user.uid, ...defaultProfile });
          }
        } catch (e) { console.error('Failed to load profile', e); }

        // Load proposals
        try {
          const q = query(collection(db, 'proposals'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal)));
          }
        } catch (e) { /* use seed data */ }

        // Load contracts
        try {
          const q = query(collection(db, 'contracts'), where('userId', '==', user.uid));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setContracts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contract)));
          }
        } catch (e) { /* use seed data */ }

        // Load transactions
        try {
          const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
          }
        } catch (e) { /* use seed data */ }

        // Real-time notifications
        try {
          const q = query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const unsub = onSnapshot(q, snap => {
            if (!snap.empty) setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
          });
          return () => unsub();
        } catch (e) { /* use seed data */ }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isDesktop) { setSidebarOpen(true); setMobileNavOpen(false); }
    else setSidebarOpen(false);
  }, [isDesktop]);

  // ── Logout handler ──
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      setMobileNavOpen(false);
      // Redirect to login: router.push('/login') or window.location.href = '/login'
      window.location.href = '/login';
    } catch (e) { console.error('Logout failed', e); }
  };

  if (authLoading) return <LoadingScreen />;

  // If no user, redirect (in a real app you'd use Next.js middleware)
  // if (!firebaseUser) { window.location.href = '/login'; return null; }

  const unread = notifications.filter(n => !n.read).length;
  const ph = pageHeaders[activePage];

  const handleNavClick = (key: string) => {
    setActivePage(key);
    if (!isDesktop) setMobileNavOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  };

  const handleGenerateProposal = (p: Project) => { setSelectedProject(p); setGenerateProposalOpen(true); };
  const handleViewContract = (c: Contract) => { setSelectedContract(c); setViewContractOpen(true); };
  const handleSubmitWork = (c: Contract) => { setSelectedContract(c); setSubmitWorkOpen(true); };

  const handleProfileUpdated = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...updates } : prev);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage isMobile={isMobile} isTablet={isTablet} userProfile={userProfile} milestones={milestones} onEditProfile={() => setActivePage('settings')} />;
      case 'discover': return <DiscoverPage isMobile={isMobile} isTablet={isTablet} onGenerateProposal={handleGenerateProposal} />;
      case 'proposals': return <ProposalsPage isMobile={isMobile} onNew={() => setNewProposalOpen(true)} proposals={proposals} />;
      case 'contracts': return <ContractsPage onView={handleViewContract} onSubmit={handleSubmitWork} contracts={contracts} />;
      case 'wallet': return <WalletPage transactions={transactions} />;
      case 'reputation': return <ReputationPage isMobile={isMobile} userProfile={userProfile} />;
      case 'settings': return <SettingsPage isMobile={isMobile} onChangePassword={() => setChangePasswordOpen(true)} onDeleteAccount={() => setDeleteAccountOpen(true)} userProfile={userProfile} onProfileUpdated={handleProfileUpdated} />;
      default: return <DashboardPage isMobile={isMobile} isTablet={isTablet} userProfile={userProfile} milestones={milestones} onEditProfile={() => setActivePage('settings')} />;
    }
  };

  const SidebarNav = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {!collapsed && <p style={{ ...s.label, color: `${C.ivory}50`, padding: '8px 12px 4px', fontSize: 9 }}>Navigation</p>}
      {navItems.map(({ icon: Icon, label, key }) => {
        const isActive = activePage === key;
        return (
          <button key={key} onClick={() => handleNavClick(key)} title={collapsed ? label : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '10px 0' : '10px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', marginBottom: 2, background: isActive ? C.green : 'transparent', transition: 'all 0.15s', color: isActive ? C.ivory : C.sidebarText, position: 'relative' }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", color: isActive ? C.ivory : C.sidebarText }}>{label}</span>}
          </button>
        );
      })}
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, color: C.coffee, fontFamily: "'Cormorant Garamond', 'Georgia', serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.rodeo}60; border-radius: 99px; }
        button { -webkit-appearance: none; touch-action: manipulation; }
        input, textarea, select { -webkit-appearance: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Modals ── */}
      <NewProposalModal open={newProposalOpen} onClose={() => setNewProposalOpen(false)} userProfile={userProfile} />
      <GenerateProposalModal open={generateProposalOpen} onClose={() => setGenerateProposalOpen(false)} project={selectedProject} userProfile={userProfile} />
      <ViewContractModal open={viewContractOpen} onClose={() => setViewContractOpen(false)} contract={selectedContract} />
      <SubmitWorkModal open={submitWorkOpen} onClose={() => setSubmitWorkOpen(false)} contract={selectedContract} />
      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
      <DeleteAccountModal open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />

      {/* ── Desktop Sidebar ── */}
      {isDesktop && (
        <div style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: sidebarOpen ? 240 : 64, background: C.coffee, zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 14px 14px', borderBottom: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 60 }}>
            {sidebarOpen && <Logo />}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: sidebarOpen ? 0 : 'auto', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
              {sidebarOpen ? <ChevronLeft size={15} color={C.ivory} /> : <Menu size={15} color={C.ivory} />}
            </button>
          </div>
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            <SidebarNav collapsed={!sidebarOpen} />
          </nav>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ margin: '0 10px 10px', padding: '12px 14px', background: `${C.gold}15`, border: `1px solid ${C.gold}30`, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Sparkles size={12} color={C.gold} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, fontFamily: "'DM Sans', sans-serif" }}>Go Premium</span>
              </div>
              <p style={{ fontSize: 11, color: C.sidebarMuted, margin: '0 0 8px', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>Unlock AI proposals & priority matching</p>
              <button style={{ width: '100%', padding: '6px 0', background: C.gold, color: C.coffee, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Upgrade Now
              </button>
            </motion.div>
          )}
          <div style={{ padding: '10px 8px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: '8px', borderRadius: 9 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.greenLight, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                {userProfile ? getInitials(userProfile.fullName) : 'MG'}
              </div>
              {sidebarOpen && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.sidebarText, margin: 0, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userProfile?.fullName || 'Loading…'}</p>
                  <p style={{ fontSize: 10, color: C.sidebarMuted, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{userProfile?.primaryRole || ''}</p>
                </div>
              )}
              {sidebarOpen && (
                <button onClick={handleLogout} title="Logout"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.rodeo, display: 'flex', alignItems: 'center', flexShrink: 0, padding: 4, borderRadius: 6 }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.ivory)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.rodeo)}>
                  <LogOut size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Drawer ── */}
      {!isDesktop && (
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNavOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60 }} />
              <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, background: C.coffee, zIndex: 70, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Logo />
                  <button onClick={() => setMobileNavOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} color={C.ivory} />
                  </button>
                </div>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.greenLight, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    {userProfile ? getInitials(userProfile.fullName) : 'MG'}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.sidebarText, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{userProfile?.fullName || 'Loading…'}</p>
                    <p style={{ fontSize: 11, color: C.sidebarMuted, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{userProfile?.email || ''}</p>
                  </div>
                </div>
                <nav style={{ flex: 1, padding: '12px 10px' }}>
                  <SidebarNav collapsed={false} />
                </nav>
                <div style={{ padding: '12px', margin: '0 8px 8px', background: `${C.gold}15`, border: `1px solid ${C.gold}30`, borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Sparkles size={12} color={C.gold} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, fontFamily: "'DM Sans', sans-serif" }}>Go Premium</span>
                  </div>
                  <button style={{ width: '100%', padding: '7px 0', background: C.gold, color: C.coffee, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>
                    Upgrade Now
                  </button>
                </div>
                <div style={{ padding: '10px 18px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: C.rodeo, fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: '8px 0', width: '100%' }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.ivory)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.rodeo)}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* ── Main Content ── */}
      <div style={{ marginLeft: isDesktop ? (sidebarOpen ? 240 : 64) : 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* ── Header ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(247,243,238,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.rodeo}40`, padding: isMobile ? '10px 16px' : '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {!isDesktop && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMobileNavOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                <Menu size={22} color={C.coffee} />
              </button>
              <Logo />
            </div>
          )}
          {!isMobile && (
            <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.gray }} />
              <input type="text" placeholder="Search projects, proposals…"
                style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8, background: '#fff', border: `1px solid ${C.rodeo}40`, borderRadius: 8, fontSize: 13, color: C.coffee, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
                onFocus={e => (e.target.style.borderColor = C.green)}
                onBlur={e => (e.target.style.borderColor = `${C.rodeo}40`)} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                style={{ position: 'relative', padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex' }}>
                <Bell size={20} color={C.coffee} />
                {unread > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, background: C.copper, color: '#fff', fontSize: 9, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
                    {unread}
                  </motion.span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: isMobile ? 'calc(100vw - 32px)' : 310, background: '#fff', border: `1px solid ${C.rodeo}40`, borderRadius: 12, boxShadow: `0 16px 48px ${C.coffee}15`, zIndex: 60, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.rodeo}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>Notifications</span>
                      {unread > 0 && <span style={s.tag(C.green)}>{unread} new</span>}
                    </div>
                    {notifications.map((n, idx) => (
                      <div key={n.id ?? idx} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${C.rodeo}20`, background: n.read ? 'transparent' : `${C.greenLight}80`, cursor: 'pointer' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: n.type === 'success' ? C.green : C.copper }} />
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: C.coffee, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{n.title}</p>
                          <p style={{ fontSize: 11, color: C.gray, margin: '0 0 3px', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{n.message}</p>
                          <span style={{ ...s.label, fontSize: 10 }}>{n.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
                <Avatar initials={userProfile ? getInitials(userProfile.fullName) : 'MG'} size={30} />
                {!isMobile && <span style={{ fontSize: 13, fontWeight: 600, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{userProfile?.fullName.split(' ')[0] || 'Menu'}</span>}
                <ChevronDown size={13} color={C.gray} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 230, background: '#fff', border: `1px solid ${C.rodeo}40`, borderRadius: 12, boxShadow: `0 16px 48px ${C.coffee}15`, zIndex: 60, overflow: 'hidden' }}>
                    <div style={{ padding: '14px', background: C.ivory, borderBottom: `1px solid ${C.rodeo}20` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Avatar initials={userProfile ? getInitials(userProfile.fullName) : 'MG'} size={40} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '0 0 1px', fontFamily: "'DM Sans', sans-serif" }}>{userProfile?.fullName || 'Loading…'}</p>
                          <p style={{ fontSize: 11, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{userProfile?.email || ''}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {userProfile?.rating ? <span style={s.tag(C.green)}><Star size={9} /> {userProfile.rating}</span> : null}
                        {userProfile?.primaryRole ? <span style={s.tag(C.copper)}>{userProfile.primaryRole}</span> : null}
                      </div>
                    </div>
                    <div style={{ padding: 6 }}>
                      {[
                        { icon: User, label: 'View Profile', action: () => { setActivePage('settings'); setProfileOpen(false); } },
                        { icon: Settings, label: 'Settings', action: () => { setActivePage('settings'); setProfileOpen(false); } },
                        { icon: Wallet, label: 'Wallet', action: () => { setActivePage('wallet'); setProfileOpen(false); } },
                        { icon: Key, label: 'Change Password', action: () => { setChangePasswordOpen(true); setProfileOpen(false); } },
                      ].map(({ icon: I, label, action }) => (
                        <button key={label} onClick={action}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: 'none', border: 'none', borderRadius: 7, cursor: 'pointer', color: C.coffee, fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s', textAlign: 'left' }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <I size={14} color={C.gray} /> {label}
                        </button>
                      ))}
                      <Divider />
                      <button onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: 'none', border: 'none', borderRadius: 7, cursor: 'pointer', color: C.red, fontSize: 13, fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background = C.redLight)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: isMobile ? '20px 16px' : isTablet ? '24px 22px' : '26px 28px', overflowX: 'hidden' }}>
          <motion.div key={activePage + '-header'} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: C.coffee, margin: '0 0 4px', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '-0.01em' }}>
              {activePage === 'dashboard'
                ? <>Welcome back, <span style={{ color: C.green }}>{userProfile?.fullName.split(' ')[0] ?? 'there'}</span> 👋</>
                : ph.title}
            </h1>
            <p style={{ fontSize: 13, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{ph.subtitle}</p>
          </motion.div>
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </main>

        {/* ── Mobile Bottom Nav ── */}
        {isMobile && (
          <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(247,243,238,0.97)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: `1px solid ${C.rodeo}40`, display: 'flex', justifyContent: 'space-around', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {navItems.slice(0, 5).map(({ icon: Icon, label, key }) => {
              const isActive = activePage === key;
              return (
                <button key={key} onClick={() => setActivePage(key)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 6px', background: 'none', border: 'none', cursor: 'pointer', flex: 1, color: isActive ? C.green : C.gray }}>
                  <Icon size={20} />
                  <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>{label}</span>
                </button>
              );
            })}
          </nav>
        )}
        {isMobile && <div style={{ height: 72 }} />}
      </div>
    </div>
  );
}

// ─── GlobalHeader (updated for logged-in state with Firebase) ─────────────────
interface GlobalHeaderProps {
  isLoggedIn?: boolean;
  user?: { name: string; email: string; role?: string; } | null;
  onLogout?: () => void;
}

export const GlobalHeader = ({ isLoggedIn = false, user = null, onLogout }: GlobalHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      if (onLogout) { onLogout(); return; }
      await signOut(auth);
      window.location.href = '/login';
    } catch (e) { console.error(e); }
  };

  const navLinks = [
    { name: 'FIND TALENT', path: '/client/discover' },
    { name: 'BROWSE WORK', path: '/freelancer/discover' },
    { name: 'HOW IT WORKS', path: '/#how-it-works' },
    { name: 'ENTERPRISE', path: '/enterprise' },
  ];

  const initials = user?.name ? getInitials(user.name) : 'MG';

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all 0.5s', padding: isScrolled ? '14px 0' : '28px 0', background: isScrolled ? 'rgba(247,243,238,0.96)' : 'transparent', backdropFilter: isScrolled ? 'blur(12px)' : 'none', borderBottom: isScrolled ? `1px solid ${C.rodeo}20` : 'none' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: isScrolled ? C.coffee : C.ivory, letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.4s' }}>MG</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.gold, letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>NOVA</span>
          </div>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {navLinks.map(link => (
            <a key={link.name} href={link.path}
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: isScrolled ? `${C.coffee}90` : `${C.ivory}80`, textDecoration: 'none', transition: 'color 0.2s', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = isScrolled ? C.coffee : C.ivory)}
              onMouseLeave={e => (e.currentTarget.style.color = isScrolled ? `${C.coffee}90` : `${C.ivory}80`)}>
              {link.name}
            </a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isLoggedIn && user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setProfileOpen(!profileOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: isScrolled ? '#fff' : 'rgba(255,255,255,0.12)', border: `1px solid ${isScrolled ? C.rodeo + '50' : 'rgba(255,255,255,0.25)'}`, borderRadius: 8, cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.greenLight, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: isScrolled ? C.coffee : C.ivory, fontFamily: "'DM Sans', sans-serif" }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={13} color={isScrolled ? C.gray : `${C.ivory}80`} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 220, background: '#fff', border: `1px solid ${C.rodeo}40`, borderRadius: 12, boxShadow: `0 16px 48px ${C.coffee}15`, zIndex: 60, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', background: C.ivory, borderBottom: `1px solid ${C.rodeo}20` }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '0 0 1px', fontFamily: "'DM Sans', sans-serif" }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{user.email}</p>
                    </div>
                    <div style={{ padding: 6 }}>
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
                        { icon: User, label: 'Profile', href: '/profile' },
                        { icon: Settings, label: 'Settings', href: '/settings' },
                      ].map(({ icon: I, label, href }) => (
                        <a key={label} href={href}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: 'none', borderRadius: 7, cursor: 'pointer', color: C.coffee, fontSize: 13, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.ivory)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <I size={14} color={C.gray} /> {label}
                        </a>
                      ))}
                      <Divider />
                      <button onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: 'none', border: 'none', borderRadius: 7, cursor: 'pointer', color: C.red, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
                        onMouseEnter={e => (e.currentTarget.style.background = C.redLight)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <a href="/login"
                style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: isScrolled ? `${C.coffee}80` : `${C.ivory}70`, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                LOG IN
              </a>
              <a href="/register"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 22px', background: C.green, color: C.ivory, borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                JOIN MGNOVA
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};