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
  ArrowUpRight, ArrowDownRight, Sparkles, BookOpen
} from 'lucide-react';

// ─── Logo Component ───────────────────────────────────────────────────────────
const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
    <span style={{
      fontSize: collapsed ? 18 : 22, fontWeight: 800, color: '#F7F3EE',
      letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif",
    }}>MG</span>
    <span style={{
      fontSize: collapsed ? 18 : 22, fontWeight: 800, color: '#D4AF37',
      letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif",
    }}>NOVA</span>
  </div>
);

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  ivory: '#F7F3EE',
  coffee: '#4B362F',
  gray: '#999999',
  green: '#66806A',
  gold: '#D4AF37',
  copper: '#7B4B3A',
  rodeo: '#C7A19A',
  greenLight: '#EEF3EF',
  greenMid: '#D2E0D4',
  copperLight: '#F5EBE8',
  goldLight: '#FBF5E0',
  // Sidebar text - brighter
  sidebarText: '#EDE8E3',
  sidebarMuted: '#B8AFA9',
};

// ─── User Context (from signup) ───────────────────────────────────────────────
// In production this comes from Firebase/auth. We use realistic signup-derived values.
interface UserProfile {
  fullName: string;
  email: string;
  role: 'freelancer' | 'client';
  primaryRole?: string;
  yearsExp?: string;
  country?: string;
  availability?: string;
  hourlyRate?: string;
  languages?: string;
  companyName?: string;
  teamSize?: string;
  industry?: string;
  skills?: string[];
  memberSince: string;
  rating: number;
  completedProjects: number;
  bio: string;
}

// Simulated real user from signup form
const currentUser: UserProfile = {
  fullName: 'Marcus Grant',
  email: 'marcus@mgnova.com',
  role: 'freelancer',
  primaryRole: 'Frontend Engineer',
  yearsExp: '6',
  country: 'New York, USA',
  availability: 'Full-Time',
  hourlyRate: '$120 / hr',
  languages: 'English, French',
  skills: ['Next.js', 'TypeScript', 'React Native', 'Node.js', 'PostgreSQL', 'GraphQL', 'Docker', 'AWS'],
  memberSince: 'January 2023',
  rating: 4.9,
  completedProjects: 47,
  bio: 'Full-stack engineer specializing in scalable SaaS products and AI-powered applications. Building with precision and purpose.',
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// ─── Inline Styles ────────────────────────────────────────────────────────────
const s = {
  card: {
    background: '#fff',
    border: `1px solid ${C.rodeo}50`,
    borderRadius: 12,
    padding: '20px 22px',
  } as React.CSSProperties,
  cardHover: {
    background: '#fff',
    border: `1px solid ${C.green}60`,
    borderRadius: 12,
    padding: '20px 22px',
    boxShadow: `0 8px 32px ${C.green}12`,
  } as React.CSSProperties,
  tag: (color = C.green): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    background: color === C.green ? C.greenLight : color === C.gold ? C.goldLight : color === C.copper ? C.copperLight : `${color}15`,
    color: color,
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
  btnPrimary: {
    background: C.green,
    color: C.ivory,
  } as React.CSSProperties,
  btnSecondary: {
    background: 'transparent',
    color: C.copper,
    border: `1px solid ${C.copper}60`,
  } as React.CSSProperties,
  label: {
    fontSize: 11,
    color: C.gray,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const analyticsData = [
  { label: 'Total Earnings', value: '$24,850', trend: '+18%', positive: true, icon: DollarSign },
  { label: 'Active Projects', value: '3', trend: '+2', positive: true, icon: Briefcase },
  { label: 'Proposals Sent', value: '12', trend: '+5', positive: true, icon: Send },
  { label: 'Success Rate', value: '76%', trend: '+4%', positive: true, icon: TrendingUp },
  { label: 'Avg Response', value: '2.4h', trend: '-0.6h', positive: true, icon: Clock },
  { label: 'Reputation', value: `${currentUser.rating}★`, trend: '+0.1', positive: true, icon: Award },
];

const milestones = [
  { title: 'E-Commerce API Integration', amount: '$1,200', status: 'completed', dueDate: 'May 10, 2025', project: 'Shopify Store' },
  { title: 'Dashboard UI Redesign', amount: '$850', status: 'in-progress', dueDate: 'May 28, 2025', project: 'CRM Platform' },
  { title: 'Mobile App Phase 2', amount: '$2,400', status: 'pending', dueDate: 'Jun 15, 2025', project: 'FitTrack' },
  { title: 'Auth System Overhaul', amount: '$600', status: 'pending', dueDate: 'Jun 30, 2025', project: 'HealthPortal' },
];

const recommendedProjects = [
  { id: 'p1', title: 'Next.js SaaS Platform with AI Features', budget: '$3,000–$5,000', timeline: '6–8 weeks', skills: ['Next.js', 'TypeScript', 'OpenAI', 'Prisma'], matchScore: 96, description: 'Build a complete SaaS boilerplate with subscription billing, AI-powered analytics dashboard, and multi-tenant architecture.', clientName: 'TechLaunch Inc.', clientRating: 4.8, posted: '2h ago', applicants: 4 },
  { id: 'p2', title: 'React Native Fitness Tracking App', budget: '$2,500–$4,000', timeline: '8 weeks', skills: ['React Native', 'Node.js', 'PostgreSQL'], matchScore: 88, description: 'Cross-platform fitness app with workout tracking, social features, and real-time sync across devices.', clientName: 'FitVerse Co.', clientRating: 4.6, posted: '5h ago', applicants: 7 },
  { id: 'p3', title: 'E-Commerce Storefront Redesign', budget: '$1,500–$2,500', timeline: '3–4 weeks', skills: ['React', 'Tailwind', 'Shopify'], matchScore: 81, description: 'Modern storefront redesign for a DTC brand with a focus on conversion optimization and performance.', clientName: 'Luxe Brand Co.', clientRating: 5.0, posted: '1d ago', applicants: 12 },
  { id: 'p4', title: 'Backend API for Logistics Platform', budget: '$2,000–$3,500', timeline: '5–6 weeks', skills: ['Node.js', 'PostgreSQL', 'Docker', 'Redis'], matchScore: 79, description: 'Design and implement a scalable REST API for a logistics tracking platform with real-time status updates.', clientName: 'FreightOps', clientRating: 4.4, posted: '2d ago', applicants: 9 },
  { id: 'p5', title: 'AI Chatbot Integration for CRM', budget: '$1,800–$2,800', timeline: '4 weeks', skills: ['Python', 'OpenAI', 'React', 'FastAPI'], matchScore: 74, description: 'Integrate a GPT-4 powered chatbot into an existing CRM system for automated customer support workflows.', clientName: 'CRMPro', clientRating: 4.7, posted: '3d ago', applicants: 15 },
  { id: 'p6', title: 'Web3 NFT Marketplace MVP', budget: '$4,000–$6,500', timeline: '10 weeks', skills: ['Solidity', 'React', 'Ethers.js', 'IPFS'], matchScore: 68, description: 'Build a full-featured NFT marketplace with minting, trading, and royalty management on Ethereum.', clientName: 'BlockArt Studio', clientRating: 4.2, posted: '4d ago', applicants: 21 },
];

const proposals = [
  { id: '#PRO-001', projectName: 'AI-Powered CRM Dashboard', budget: '$4,200', timeline: '6 weeks', date: 'May 14', status: 'accepted', client: 'SalesForge' },
  { id: '#PRO-002', projectName: 'NFT Marketplace Frontend', budget: '$3,800', timeline: '5 weeks', date: 'May 12', status: 'shortlisted', client: 'BlockArt' },
  { id: '#PRO-003', projectName: 'Healthcare Portal Redesign', budget: '$2,900', timeline: '4 weeks', date: 'May 8', status: 'applied', client: 'MedCore' },
  { id: '#PRO-004', projectName: 'Logistics Tracking App', budget: '$1,800', timeline: '3 weeks', date: 'May 5', status: 'rejected', client: 'FreightOps' },
  { id: '#PRO-005', projectName: 'E-Learning Platform', budget: '$5,500', timeline: '10 weeks', date: 'May 1', status: 'applied', client: 'EduTech' },
];

const notifications = [
  { id: 1, title: 'Proposal Accepted!', message: 'AI-Powered CRM Dashboard — client accepted your proposal.', timestamp: '2h ago', type: 'success', read: false },
  { id: 2, title: 'New Project Match', message: 'A 96% match project was just posted matching your skills.', timestamp: '5h ago', type: 'info', read: false },
  { id: 3, title: 'Milestone Payment', message: '$1,200 released for E-Commerce API milestone.', timestamp: '1d ago', type: 'success', read: true },
  { id: 4, title: 'Client Message', message: 'CRM Dashboard client sent you a message.', timestamp: '2d ago', type: 'info', read: true },
];

const contracts = [
  { id: 'CTR-001', project: 'AI-Powered CRM Dashboard', client: 'SalesForge Inc.', value: '$4,200', startDate: 'May 15, 2025', endDate: 'Jun 26, 2025', status: 'active', progress: 25, milestones: 3, completedMilestones: 1 },
  { id: 'CTR-002', project: 'E-Commerce API Integration', client: 'Shopify Store', value: '$1,200', startDate: 'Apr 10, 2025', endDate: 'May 10, 2025', status: 'completed', progress: 100, milestones: 2, completedMilestones: 2 },
  { id: 'CTR-003', project: 'Mobile Fitness App', client: 'FitVerse Co.', value: '$3,800', startDate: 'Jun 1, 2025', endDate: 'Jul 27, 2025', status: 'upcoming', progress: 0, milestones: 4, completedMilestones: 0 },
];

const transactions = [
  { id: 'TXN-001', description: 'Milestone: E-Commerce API', amount: '+$1,200', date: 'May 10', type: 'credit', status: 'completed' },
  { id: 'TXN-002', description: 'Withdrawal to Bank', amount: '-$2,000', date: 'May 8', type: 'debit', status: 'completed' },
  { id: 'TXN-003', description: 'Milestone: Dashboard Design', amount: '+$425', date: 'May 5', type: 'credit', status: 'pending' },
  { id: 'TXN-004', description: 'Platform Fee (5%)', amount: '-$60', date: 'May 5', type: 'debit', status: 'completed' },
  { id: 'TXN-005', description: 'Milestone: Auth Overhaul', amount: '+$600', date: 'Apr 28', type: 'credit', status: 'completed' },
];

const reputationData = {
  overall: currentUser.rating,
  breakdown: [
    { label: 'Communication', value: 4.9 },
    { label: 'Quality', value: 5.0 },
    { label: 'Timeliness', value: 4.8 },
    { label: 'Expertise', value: 4.9 },
  ],
  reviews: [
    { client: 'SalesForge Inc.', rating: 5, comment: 'Marcus delivered exceptional work. The dashboard exceeded all our expectations. Would absolutely hire again.', date: 'May 2025', project: 'CRM Dashboard' },
    { client: 'Shopify Store', rating: 5, comment: 'Brilliant developer. On time, within budget, and the API integration was flawless. Highly recommended.', date: 'Apr 2025', project: 'E-Commerce API' },
    { client: 'FitVerse Co.', rating: 4, comment: 'Great communication throughout the project. Very professional and technically sound.', date: 'Mar 2025', project: 'Fitness App' },
  ],
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
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.33, fontWeight: 700,
      fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
    }}>
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
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        style={{ height: '100%', background: color, borderRadius: 99 }}
      />
    </div>
  );
}

function StarRating({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= Math.round(value) ? C.gold : 'none'} color={i <= Math.round(value) ? C.gold : C.rodeo} />
      ))}
    </span>
  );
}

// ─── useWindowSize hook ───────────────────────────────────────────────────────
function useWindowSize() {
  const [size, setSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1200, height: typeof window !== 'undefined' ? window.innerHeight : 800 });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

// ─── Analytics Card ───────────────────────────────────────────────────────────
function AnalyticsCard({ data, index }: { data: typeof analyticsData[0]; index: number }) {
  const Icon = data.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
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

// ─── Milestone Card ───────────────────────────────────────────────────────────
function MilestoneCard({ m, index }: { m: typeof milestones[0]; index: number }) {
  const cfg = {
    completed: { color: C.green, label: 'Completed', Icon: CheckCircle },
    'in-progress': { color: C.gold, label: 'In Progress', Icon: Activity },
    pending: { color: C.gray, label: 'Pending', Icon: Clock },
  }[m.status] || { color: C.gray, label: 'Pending', Icon: Clock };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.07 }}
      whileHover={{ y: -2 }}
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

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ p, index }: { p: typeof recommendedProjects[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const circ = 2 * Math.PI * 26;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ ...(hovered ? s.cardHover : s.card), display: 'flex', flexDirection: 'column', height: '100%' }}
    >
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
        {p.skills.map((sk) => <span key={sk} style={{ ...s.tag(C.copper), fontSize: 10 }}>{sk}</span>)}
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
      <motion.button whileTap={{ scale: 0.97 }} style={{ ...s.btn, ...s.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
        <Zap size={12} /> Generate Proposal <ArrowRight size={12} />
      </motion.button>
    </motion.div>
  );
}

// ─── Proposals Page ───────────────────────────────────────────────────────────
function ProposalsPage({ isMobile }: { isMobile: boolean }) {
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
          { label: 'Total Sent', value: '12', icon: Send },
          { label: 'Accepted', value: '1', icon: CheckCircle, color: C.green },
          { label: 'Shortlisted', value: '1', icon: Star, color: C.gold },
          { label: 'Success Rate', value: '76%', icon: TrendingUp, color: C.copper },
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
          <button style={{ ...s.btn, ...s.btnPrimary }}><Zap size={13} /> New Proposal</button>
        </div>
        {isMobile ? (
          // Mobile: card list view
          <div>
            {proposals.map((p, i) => {
              const cfg = statusCfg[p.status];
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
                  {['ID', 'Project', 'Client', 'Budget', 'Timeline', 'Date', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 18px', textAlign: 'left', ...s.label, borderBottom: `1px solid ${C.rodeo}30` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.map((p, i) => {
                  const cfg = statusCfg[p.status];
                  const Icon = cfg.Icon;
                  return (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                      style={{ borderBottom: `1px solid ${C.rodeo}20`, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.ivory)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
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
function ContractsPage() {
  const statusCfg: Record<string, { color: string; label: string }> = {
    active: { color: C.green, label: 'Active' },
    completed: { color: C.copper, label: 'Completed' },
    upcoming: { color: C.gold, label: 'Upcoming' },
  };
  return (
    <motion.div key="contracts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        {contracts.map((c, i) => {
          const cfg = statusCfg[c.status];
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
                  <button style={{ ...s.btn, ...s.btnSecondary, padding: '7px 14px' }}><Eye size={13} /> View</button>
                  {c.status === 'active' && <button style={{ ...s.btn, ...s.btnPrimary, padding: '7px 14px' }}><Upload size={13} /> Submit Work</button>}
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
function WalletPage() {
  return (
    <motion.div key="wallet" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: C.coffee, borderRadius: 16, padding: '28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `${C.green}20` }} />
        <div style={{ position: 'absolute', bottom: -30, right: 60, width: 100, height: 100, borderRadius: '50%', background: `${C.gold}15` }} />
        <p style={{ ...s.label, color: `${C.ivory}80`, marginBottom: 8 }}>Available Balance</p>
        <p style={{ fontSize: 40, fontWeight: 800, color: C.ivory, margin: '0 0 20px', fontFamily: "'DM Sans', sans-serif" }}>$6,350<span style={{ fontSize: 20, fontWeight: 400, opacity: 0.6 }}>.00</span></p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ ...s.btn, background: C.green, color: C.ivory }}><Download size={13} /> Withdraw</button>
          <button style={{ ...s.btn, background: `${C.ivory}20`, color: C.ivory, border: `1px solid ${C.ivory}30` }}><RefreshCw size={13} /> Transfer</button>
        </div>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[{ label: 'This Month', value: '+$1,625', color: C.green, icon: ArrowUpRight }, { label: 'Pending', value: '$425', color: C.gold, icon: Clock }, { label: 'Withdrawn', value: '$2,000', color: C.copper, icon: ArrowDownRight }].map((stat, i) => {
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
function ReputationPage({ isMobile }: { isMobile: boolean }) {
  return (
    <motion.div key="reputation" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 18, marginBottom: 22 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...s.card, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.greenLight, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: C.green, fontFamily: "'DM Sans', sans-serif" }}>{reputationData.overall}</span>
          </div>
          <StarRating value={reputationData.overall} size={16} />
          <p style={{ ...s.label, margin: '8px 0 0' }}>Overall Rating</p>
          <Divider />
          <p style={{ fontSize: 13, color: C.gray, fontFamily: "'DM Sans', sans-serif", margin: '10px 0 0' }}>Based on {currentUser.completedProjects} projects</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={s.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>Score Breakdown</h3>
          {reputationData.breakdown.map((item) => (
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
        {reputationData.reviews.map((r, i) => (
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
function SettingsPage({ isMobile }: { isMobile: boolean }) {
  const [notifs, setNotifs] = useState({ email: true, sms: false, proposals: true, milestones: true });
  // Editable fields from real signup data
  const [form, setForm] = useState({
    fullName: currentUser.fullName,
    email: currentUser.email,
    title: currentUser.primaryRole || '',
    location: currentUser.country || '',
    hourlyRate: currentUser.hourlyRate || '',
    languages: currentUser.languages || '',
    availability: currentUser.availability || '',
  });
  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>
        {/* Profile Info - full width */}
        <div style={{ ...s.card, gridColumn: isMobile ? '1' : '1 / -1' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>Profile Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Full Name', key: 'fullName', icon: User },
              { label: 'Email', key: 'email', icon: Mail },
              { label: 'Primary Role', key: 'title', icon: Briefcase },
              { label: 'Location', key: 'location', icon: MapPin },
              { label: 'Hourly Rate', key: 'hourlyRate', icon: DollarSign },
              { label: 'Languages', key: 'languages', icon: Globe },
            ].map(({ label, key, icon: Icon }) => (
              <div key={key}>
                <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`, background: C.ivory }}>
                  <Icon size={14} color={C.gray} />
                  <span style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{(form as any)[key]}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Bio</label>
            <div style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`, background: C.ivory, fontSize: 13, color: C.coffee, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {currentUser.bio}
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button style={{ ...s.btn, ...s.btnPrimary }}><Edit3 size={13} /> Save Changes</button>
          </div>
        </div>

        {/* Skills */}
        <div style={s.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>Skills & Expertise</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(currentUser.skills || []).map((sk) => <span key={sk} style={s.tag(C.copper)}>{sk}</span>)}
          </div>
          <button style={{ ...s.btn, ...s.btnSecondary, marginTop: 14, padding: '7px 14px', fontSize: 12 }}><Plus size={12} /> Add Skill</button>
        </div>

        {/* Notifications */}
        <div style={s.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>Notifications</h3>
          {[{ key: 'email', label: 'Email Notifications' }, { key: 'sms', label: 'SMS Alerts' }, { key: 'proposals', label: 'Proposal Updates' }, { key: 'milestones', label: 'Milestone Payments' }].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.rodeo}20` }}>
              <span style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
              <div onClick={() => setNotifs((p) => ({ ...p, [key]: !(p as any)[key] }))} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', transition: 'background 0.2s', background: (notifs as any)[key] ? C.green : `${C.rodeo}60`, position: 'relative' }}>
                <motion.div animate={{ left: (notifs as any)[key] ? 20 : 2 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Security */}
        <div style={{ ...s.card, gridColumn: isMobile ? '1' : '1 / -1' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>Security</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button style={{ ...s.btn, ...s.btnSecondary }}><Shield size={13} /> Change Password</button>
            <button style={{ ...s.btn, ...s.btnSecondary }}><Layers size={13} /> Enable 2FA</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────
function DashboardPage({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const cols = isMobile ? '1fr 1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)';
  return (
    <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, marginBottom: 24 }}>
        {analyticsData.map((d, i) => <AnalyticsCard key={d.label} data={d} index={i} />)}
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
              <Avatar initials={getInitials(currentUser.fullName)} size={48} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{currentUser.fullName}</p>
                <p style={{ ...s.label, margin: '2px 0 0' }}>{currentUser.primaryRole}</p>
              </div>
            </div>
            <Divider />
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {[
                { label: 'Rating', value: `${currentUser.rating} ★` },
                { label: 'Projects Done', value: `${currentUser.completedProjects}` },
                { label: 'Member Since', value: currentUser.memberSince },
                { label: 'Rate', value: currentUser.hourlyRate || '—' },
                { label: 'Location', value: currentUser.country || '—' },
                { label: 'Languages', value: currentUser.languages || '—' },
                { label: 'Availability', value: currentUser.availability || '—' },
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
            <motion.button whileTap={{ scale: 0.97 }} style={{ ...s.btn, ...s.btnSecondary, width: '100%', justifyContent: 'center', marginTop: 14 }}>
              <Edit3 size={13} /> Edit Profile
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Discover Page ────────────────────────────────────────────────────────────
function DiscoverPage({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Next.js', 'React Native', 'Node.js', 'AI / ML'];
  const filtered = filter === 'All' ? recommendedProjects : recommendedProjects.filter((p) => p.skills.some((sk) => sk.toLowerCase().includes(filter.toLowerCase())));
  const cols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)';
  return (
    <motion.div key="discover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...s.btn, padding: '6px 14px', ...(filter === f ? s.btnPrimary : { background: '#fff', color: C.coffee, border: `1px solid ${C.rodeo}50` }), fontSize: 12 }}>
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.gray, fontFamily: "'DM Sans', sans-serif" }}>
          <Sparkles size={14} color={C.gold} /> AI-matched
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        <AnimatePresence mode="wait">
          {filtered.map((p, i) => <ProjectCard key={p.id} p={p} index={i} />)}
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function MGNovaDashboard() {
  const { width } = useWindowSize();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  // Mobile: sidebar always closed by default, tablet/desktop: open by default
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  // Mobile: drawer overlay
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  // Update sidebar when screen resizes
  useEffect(() => {
    if (isDesktop) { setSidebarOpen(true); setMobileNavOpen(false); }
    else setSidebarOpen(false);
  }, [isDesktop]);

  const unread = notifications.filter((n) => !n.read).length;
  const ph = pageHeaders[activePage];

  const handleNavClick = (key: string) => {
    setActivePage(key);
    if (!isDesktop) setMobileNavOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage isMobile={isMobile} isTablet={isTablet} />;
      case 'discover': return <DiscoverPage isMobile={isMobile} isTablet={isTablet} />;
      case 'proposals': return <ProposalsPage isMobile={isMobile} />;
      case 'contracts': return <ContractsPage />;
      case 'wallet': return <WalletPage />;
      case 'reputation': return <ReputationPage isMobile={isMobile} />;
      case 'settings': return <SettingsPage isMobile={isMobile} />;
      default: return <DashboardPage isMobile={isMobile} isTablet={isTablet} />;
    }
  };

  // Sidebar nav content (shared between desktop sidebar and mobile drawer)
  const SidebarNav = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {!collapsed && (
        <p style={{ ...s.label, color: `${C.ivory}50`, padding: '8px 12px 4px', fontSize: 9 }}>Navigation</p>
      )}
      {navItems.map(({ icon: Icon, label, key }) => {
        const isActive = activePage === key;
        return (
          <button key={key} onClick={() => handleNavClick(key)} title={collapsed ? label : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '10px 14px',
              borderRadius: 9, border: 'none', cursor: 'pointer', marginBottom: 2,
              background: isActive ? C.green : 'transparent',
              transition: 'all 0.15s',
              color: isActive ? C.ivory : C.sidebarText,
              position: 'relative',
            }}
            onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
            onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", color: isActive ? C.ivory : C.sidebarText }}>
                {label}
              </span>
            )}
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
        input { -webkit-appearance: none; }
      `}</style>

      {/* ── Desktop Sidebar ── */}
      {isDesktop && (
        <div style={{
          position: 'fixed', left: 0, top: 0, height: '100vh',
          width: sidebarOpen ? 240 : 64,
          background: C.coffee, zIndex: 50,
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}>
          {/* Logo */}
          <div style={{ padding: '18px 14px 14px', borderBottom: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 60 }}>
            {sidebarOpen && <Logo />}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: sidebarOpen ? 0 : 'auto', flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              {sidebarOpen ? <ChevronLeft size={15} color={C.ivory} /> : <Menu size={15} color={C.ivory} />}
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            <SidebarNav collapsed={!sidebarOpen} />
          </nav>

          {/* Upgrade Banner */}
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

          {/* User Chip */}
          <div style={{ padding: '10px 8px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: '8px', borderRadius: 9, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.greenLight, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                {getInitials(currentUser.fullName)}
              </div>
              {sidebarOpen && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.sidebarText, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{currentUser.fullName}</p>
                  <p style={{ fontSize: 10, color: C.sidebarMuted, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{currentUser.primaryRole}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile/Tablet Drawer ── */}
      {!isDesktop && (
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60 }}
              />
              <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, background: C.coffee, zIndex: 70, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
              >
                {/* Drawer header */}
                <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Logo />
                  <button onClick={() => setMobileNavOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} color={C.ivory} />
                  </button>
                </div>
                {/* User */}
                <div style={{ padding: '14px 16px', borderBottom: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.greenLight, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    {getInitials(currentUser.fullName)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.sidebarText, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{currentUser.fullName}</p>
                    <p style={{ fontSize: 11, color: C.sidebarMuted, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{currentUser.primaryRole}</p>
                  </div>
                </div>
                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 10px' }}>
                  <SidebarNav collapsed={false} />
                </nav>
                {/* Upgrade */}
                <div style={{ padding: '12px', margin: '0 8px 8px' }}>
                  <div style={{ padding: '12px 14px', background: `${C.gold}15`, border: `1px solid ${C.gold}30`, borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Sparkles size={12} color={C.gold} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, fontFamily: "'DM Sans', sans-serif" }}>Go Premium</span>
                    </div>
                    <button style={{ width: '100%', padding: '7px 0', background: C.gold, color: C.coffee, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>
                      Upgrade Now
                    </button>
                  </div>
                </div>
                {/* Logout */}
                <div style={{ padding: '10px 18px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: C.rodeo, fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: '8px 0' }}>
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
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(247,243,238,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.rodeo}40`,
          padding: isMobile ? '10px 16px' : '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          {/* Mobile: hamburger + logo */}
          {!isDesktop && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMobileNavOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: C.coffee }}
              >
                <Menu size={22} color={C.coffee} />
              </button>
              <Logo />
            </div>
          )}

          {/* Search — hidden on mobile, shown on tablet+ */}
          {!isMobile && (
            <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.gray }} />
              <input type="text" placeholder="Search projects, proposals…"
                style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8, background: '#fff', border: `1px solid ${C.rodeo}40`, borderRadius: 8, fontSize: 13, color: C.coffee, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e) => (e.target.style.borderColor = `${C.rodeo}40`)}
              />
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
                      <span style={s.tag(C.green)}>{unread} new</span>
                    </div>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${C.rodeo}20`, background: n.read ? 'transparent' : `${C.greenLight}80`, cursor: 'pointer' }}>
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

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
                <Avatar initials={getInitials(currentUser.fullName)} size={30} />
                {!isMobile && <span style={{ fontSize: 13, fontWeight: 600, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{currentUser.fullName.split(' ')[0]}</span>}
                <ChevronDown size={13} color={C.gray} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 210, background: '#fff', border: `1px solid ${C.rodeo}40`, borderRadius: 12, boxShadow: `0 16px 48px ${C.coffee}15`, zIndex: 60, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.rodeo}20`, background: C.ivory }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '0 0 1px', fontFamily: "'DM Sans', sans-serif" }}>{currentUser.fullName}</p>
                      <p style={{ fontSize: 11, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{currentUser.email}</p>
                    </div>
                    <div style={{ padding: 6 }}>
                      {[{ icon: User, label: 'Profile' }, { icon: Settings, label: 'Settings' }].map(({ icon: I, label }) => (
                        <button key={label} onClick={() => { setActivePage(label.toLowerCase()); setProfileOpen(false); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: 'none', border: 'none', borderRadius: 7, cursor: 'pointer', color: C.coffee, fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.ivory)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        ><I size={14} color={C.gray} /> {label}</button>
                      ))}
                      <Divider />
                      <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: 'none', border: 'none', borderRadius: 7, cursor: 'pointer', color: C.copper, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
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
                ? <>Welcome back, <span style={{ color: C.green }}>{currentUser.fullName.split(' ')[0]}</span> 👋</>
                : ph.title}
            </h1>
            <p style={{ fontSize: 13, color: C.gray, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{ph.subtitle}</p>
          </motion.div>
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </main>

        {/* ── Mobile Bottom Nav ── */}
        {isMobile && (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
            background: 'rgba(247,243,238,0.97)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: `1px solid ${C.rodeo}40`,
            display: 'flex', justifyContent: 'space-around',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
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
        {/* Bottom padding for mobile nav */}
        {isMobile && <div style={{ height: 72 }} />}
      </div>
    </div>
  );
}