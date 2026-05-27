// ─── Color Palette ────────────────────────────────────────────────────────────
export const C = {
  ivory: '#F7F3EE', coffee: '#4B362F', gray: '#999999',
  green: '#66806A', gold: '#D4AF37', copper: '#7B4B3A',
  rodeo: '#C7A19A', greenLight: '#EEF3EF', greenMid: '#D2E0D4',
  copperLight: '#F5EBE8', goldLight: '#FBF5E0',
  sidebarText: '#EDE8E3', sidebarMuted: '#B8AFA9',
  red: '#C0392B', redLight: '#FDEAEA',
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  fullName: string; email: string; role: 'freelancer' | 'client';
  primaryRole?: string; yearsExp?: string; country?: string;
  availability?: string; hourlyRate?: string; languages?: string;
  companyName?: string; teamSize?: string; industry?: string;
  skills?: string[]; memberSince: string; rating: number;
  completedProjects: number; bio: string; uid?: string;
}

export interface Milestone {
  title: string; amount: string; status: string; dueDate: string; project: string;
}

export interface Project {
  id: string; title: string; budget: string; timeline: string;
  skills: string[]; matchScore: number; description: string;
  clientName: string; clientRating: number; posted: string; applicants: number;
}

export interface Proposal {
  id: string; projectName: string; budget: string; timeline: string;
  date: string; status: string; client: string;
}

export interface Contract {
  id: string; project: string; client: string; value: string;
  startDate: string; endDate: string; status: string; progress: number;
  milestones: number; completedMilestones: number;
}

export interface Transaction {
  id: string; description: string; amount: string; date: string; type: string; status: string;
}

export interface Notification {
  id: number; title: string; message: string; timestamp: string; type: string; read: boolean;
}

// Wallet-specific types
export interface IndianTransaction {
  id: string; desc: string; amt: string; rawAmt: number;
  date: string; type: 'credit' | 'debit'; status: 'success' | 'pending'; via: string;
}

export interface MilestonePayment {
  id: string; proj: string; client: string; amt: string; rawAmt: number;
  status: 'released' | 'pending' | 'escrow'; dueDate: string; ms: string;
}

export interface InvoiceRecord {
  id: string; proj: string; client: string; amt: string; date: string; gstin: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export const fmtINR = (n: number) => n.toLocaleString('en-IN');

export const genTxnId = () => `MGN-TRX-${Math.floor(Math.random() * 900000 + 100000)}`;

export const nowTs = () => {
  const d = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};

// ─── Shared Styles ────────────────────────────────────────────────────────────
export const s = {
  card: { background: '#fff', border: `1px solid ${C.rodeo}50`, borderRadius: 12, padding: '20px 22px' } as React.CSSProperties,
  cardHover: { background: '#fff', border: `1px solid ${C.green}60`, borderRadius: 12, padding: '20px 22px', boxShadow: `0 8px 32px ${C.green}12` } as React.CSSProperties,
  tag: (color = C.green): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6,
    fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
    background: color === C.green ? C.greenLight : color === C.gold ? C.goldLight : color === C.copper ? C.copperLight : `${color}15`,
    color, fontFamily: "'Satoshi', sans-serif",
  }),
  btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.18s ease', fontFamily: "'Satoshi', sans-serif" } as React.CSSProperties,
  btnPrimary: { background: C.green, color: C.ivory } as React.CSSProperties,
  btnSecondary: { background: 'transparent', color: C.copper, border: `1px solid ${C.copper}60` } as React.CSSProperties,
  btnDanger: { background: 'transparent', color: C.red, border: `1px solid ${C.red}60` } as React.CSSProperties,
  label: { fontSize: 11, color: C.gray, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontFamily: "'Satoshi', sans-serif", fontWeight: 500 },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`,
    background: '#fff', fontSize: 13, color: C.coffee, outline: 'none',
    fontFamily: "'Satoshi', sans-serif", boxSizing: 'border-box' as const,
  },
};

// ─── Nav Items ────────────────────────────────────────────────────────────────
import {
  LayoutDashboard, FolderOpen, FileText, CheckCircle,
  Wallet, Trophy, Settings,
} from 'lucide-react';

export const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
  { icon: FolderOpen,      label: 'Discover',  key: 'discover'  },
  { icon: FileText,        label: 'Proposals', key: 'proposals' },
  { icon: CheckCircle,     label: 'Contracts', key: 'contracts' },
  { icon: Wallet,          label: 'Wallet',    key: 'wallet'    },
  { icon: Trophy,          label: 'Reputation',key: 'reputation'},
  { icon: Settings,        label: 'Settings',  key: 'settings'  },
];

export const pageHeaders: Record<string, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Dashboard',          subtitle: "Here's what's happening with your portfolio today." },
  discover:   { title: 'Discover Projects',  subtitle: 'AI-matched opportunities based on your skills and history.' },
  proposals:  { title: 'My Proposals',       subtitle: 'Track the status of all your submitted proposals.' },
  contracts:  { title: 'Contracts',          subtitle: 'Active agreements and project milestones.' },
  wallet:     { title: 'Wallet',             subtitle: 'Manage your earnings, payments and withdrawals.' },
  reputation: { title: 'Reputation',         subtitle: 'Your client reviews and performance ratings.' },
  settings:   { title: 'Settings',           subtitle: 'Manage your profile, preferences and security.' },
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
import {
  DollarSign, Briefcase, Send, TrendingUp, Clock, Award,
} from 'lucide-react';

export const SEED_MILESTONES: Milestone[] = [
  { title: 'E-Commerce API Integration', amount: '₹1,00,000', status: 'completed',   dueDate: 'May 10, 2025', project: 'Shopify Store' },
  { title: 'Dashboard UI Redesign',      amount: '₹70,000',   status: 'in-progress', dueDate: 'May 28, 2025', project: 'CRM Platform' },
  { title: 'Mobile App Phase 2',         amount: '₹2,00,000', status: 'pending',     dueDate: 'Jun 15, 2025', project: 'FitTrack'    },
  { title: 'Auth System Overhaul',       amount: '₹50,000',   status: 'pending',     dueDate: 'Jun 30, 2025', project: 'HealthPortal'},
];

// NOTE: SEED_PROJECTS is now loaded from Firestore via the seed script.
// This fallback is used only if Firestore returns empty.
// All budgets are in INR (1 USD ≈ ₹84). Original USD amounts converted at this rate.
export const SEED_PROJECTS: Project[] = [
  { id: 'mgproj-001', title: 'Next.js SaaS Platform with AI Features',   budget: '₹2,50,000–₹4,20,000', timeline: '6–8 weeks', skills: ['Next.js','TypeScript','OpenAI','Prisma'],           matchScore: 96, description: 'Build a complete SaaS boilerplate with subscription billing, AI-powered analytics dashboard, and multi-tenant architecture.', clientName: 'TechLaunch Inc.',  clientRating: 4.8, posted: '2h ago',  applicants: 4  },
  { id: 'mgproj-002', title: 'React Native Fitness Tracking App',         budget: '₹2,10,000–₹3,35,000', timeline: '8 weeks',   skills: ['React Native','Node.js','PostgreSQL'],               matchScore: 88, description: 'Cross-platform fitness app with workout tracking, social features, and real-time sync across devices.',                    clientName: 'FitVerse Co.',     clientRating: 4.6, posted: '5h ago',  applicants: 7  },
  { id: 'mgproj-003', title: 'E-Commerce Storefront Redesign',            budget: '₹1,25,000–₹2,10,000', timeline: '3–4 weeks', skills: ['React','Tailwind','Shopify'],                        matchScore: 81, description: 'Modern storefront redesign for a DTC brand with a focus on conversion optimization and performance.',                     clientName: 'Luxe Brand Co.',   clientRating: 5.0, posted: '1d ago',  applicants: 12 },
  { id: 'mgproj-004', title: 'Backend API for Logistics Platform',        budget: '₹1,68,000–₹2,94,000', timeline: '5–6 weeks', skills: ['Node.js','PostgreSQL','Docker','Redis'],              matchScore: 79, description: 'Design and implement a scalable REST API for a logistics tracking platform with real-time status updates.',               clientName: 'FreightOps',       clientRating: 4.4, posted: '2d ago',  applicants: 9  },
  { id: 'mgproj-005', title: 'AI Chatbot Integration for CRM',            budget: '₹1,51,000–₹2,35,000', timeline: '4 weeks',   skills: ['Python','OpenAI','React','FastAPI'],                  matchScore: 74, description: 'Integrate a GPT-4 powered chatbot into an existing CRM system for automated customer support workflows.',                clientName: 'CRMPro',           clientRating: 4.7, posted: '3d ago',  applicants: 15 },
  { id: 'mgproj-006', title: 'Web3 NFT Marketplace MVP',                  budget: '₹3,35,000–₹5,45,000', timeline: '10 weeks',  skills: ['Solidity','React','Ethers.js','IPFS'],                matchScore: 68, description: 'Build a full-featured NFT marketplace with minting, trading, and royalty management on Ethereum.',                        clientName: 'BlockArt Studio',  clientRating: 4.2, posted: '4d ago',  applicants: 21 },
];

export const SEED_PROPOSALS: Proposal[] = [
  { id: '#MGP-001', projectName: 'AI-Powered CRM Dashboard',     budget: '₹3,52,000', timeline: '6 weeks',  date: 'May 14', status: 'accepted',    client: 'SalesForge' },
  { id: '#MGP-002', projectName: 'NFT Marketplace Frontend',     budget: '₹3,19,000', timeline: '5 weeks',  date: 'May 12', status: 'shortlisted', client: 'BlockArt'   },
  { id: '#MGP-003', projectName: 'Healthcare Portal Redesign',   budget: '₹2,43,000', timeline: '4 weeks',  date: 'May 8',  status: 'applied',     client: 'MedCore'    },
  { id: '#MGP-004', projectName: 'Logistics Tracking App',       budget: '₹1,51,000', timeline: '3 weeks',  date: 'May 5',  status: 'rejected',    client: 'FreightOps' },
  { id: '#MGP-005', projectName: 'E-Learning Platform',          budget: '₹4,62,000', timeline: '10 weeks', date: 'May 1',  status: 'applied',     client: 'EduTech'    },
];

export const SEED_CONTRACTS: Contract[] = [
  { id: 'MGCTR-001', project: 'AI-Powered CRM Dashboard',      client: 'SalesForge Inc.', value: '₹3,52,000', startDate: 'May 15, 2025', endDate: 'Jun 26, 2025', status: 'active',    progress: 25,  milestones: 3, completedMilestones: 1 },
  { id: 'MGCTR-002', project: 'E-Commerce API Integration',    client: 'Shopify Store',   value: '₹1,00,000', startDate: 'Apr 10, 2025', endDate: 'May 10, 2025', status: 'completed', progress: 100, milestones: 2, completedMilestones: 2 },
  { id: 'MGCTR-003', project: 'Mobile Fitness App',            client: 'FitVerse Co.',    value: '₹3,19,000', startDate: 'Jun 1, 2025',  endDate: 'Jul 27, 2025', status: 'upcoming',  progress: 0,   milestones: 4, completedMilestones: 0 },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'MGTXN-001', description: 'Milestone: E-Commerce API',    amount: '+₹1,00,000', date: 'May 10', type: 'credit', status: 'completed' },
  { id: 'MGTXN-002', description: 'Withdrawal to Bank',           amount: '-₹1,68,000', date: 'May 8',  type: 'debit',  status: 'completed' },
  { id: 'MGTXN-003', description: 'Milestone: Dashboard Design',  amount: '+₹35,700',   date: 'May 5',  type: 'credit', status: 'pending'   },
  { id: 'MGTXN-004', description: 'Platform Fee (5%)',            amount: '-₹5,040',    date: 'May 5',  type: 'debit',  status: 'completed' },
  { id: 'MGTXN-005', description: 'Milestone: Auth Overhaul',     amount: '+₹50,400',   date: 'Apr 28', type: 'credit', status: 'completed' },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'Proposal Accepted!',  message: 'AI-Powered CRM Dashboard — client accepted your proposal.', timestamp: '2h ago', type: 'success', read: false },
  { id: 2, title: 'New Project Match',   message: 'A 96% match project was just posted matching your skills.', timestamp: '5h ago', type: 'info',    read: false },
  { id: 3, title: 'Milestone Payment',   message: '₹1,00,000 released for E-Commerce API milestone.',          timestamp: '1d ago', type: 'success', read: true  },
  { id: 4, title: 'Client Message',      message: 'CRM Dashboard client sent you a message.',                 timestamp: '2d ago', type: 'info',    read: true  },
];

export const SEED_REPUTATION = {
  overall: 4.9,
  breakdown: [
    { label: 'Communication', value: 4.9 }, { label: 'Quality',     value: 5.0 },
    { label: 'Timeliness',    value: 4.8 }, { label: 'Expertise',   value: 4.9 },
  ],
  reviews: [
    { client: 'SalesForge Inc.', rating: 5, comment: 'Marcus delivered exceptional work. The dashboard exceeded all our expectations. Would absolutely hire again.',  date: 'May 2025', project: 'CRM Dashboard' },
    { client: 'Shopify Store',   rating: 5, comment: 'Brilliant developer. On time, within budget, and the API integration was flawless. Highly recommended.',        date: 'Apr 2025', project: 'E-Commerce API' },
    { client: 'FitVerse Co.',    rating: 4, comment: 'Great communication throughout the project. Very professional and technically sound.',                           date: 'Mar 2025', project: 'Fitness App'    },
  ],
};

export const SEED_ANALYTICS = [
  { label: 'Total Earnings',  value: '₹20,85,000', trend: '+18%',  positive: true, icon: DollarSign },
  { label: 'Active Projects', value: '3',           trend: '+2',    positive: true, icon: Briefcase  },
  { label: 'Proposals Sent',  value: '12',          trend: '+5',    positive: true, icon: Send       },
  { label: 'Success Rate',    value: '76%',          trend: '+4%',   positive: true, icon: TrendingUp },
  { label: 'Avg Response',    value: '2.4h',         trend: '-0.6h', positive: true, icon: Clock      },
  { label: 'Reputation',      value: '4.9★',        trend: '+0.1',  positive: true, icon: Award      },
];

// ─── Indian Wallet Seed Data ──────────────────────────────────────────────────
export const INDIAN_TRANSACTIONS: IndianTransaction[] = [
  { id: 'MGN-TRX-928184', desc: 'Milestone Release — CRM Dashboard',       amt: '+₹45,000', rawAmt: 45000,  date: '24 May 2025, 2:14 PM',  type: 'credit', status: 'success', via: 'UPI • rahul@okaxis'           },
  { id: 'MGN-TRX-817293', desc: 'Milestone Release — E-Commerce API',      amt: '+₹18,000', rawAmt: 18000,  date: '20 May 2025, 11:32 AM', type: 'credit', status: 'success', via: 'UPI • pay@ybl'                },
  { id: 'MGN-TRX-736182', desc: 'Withdrawal to HDFC ••4521',               amt: '-₹50,000', rawAmt: -50000, date: '18 May 2025, 4:05 PM',  type: 'debit',  status: 'success', via: 'NEFT'                         },
  { id: 'MGN-TRX-624091', desc: 'Milestone Release — Mobile App Phase 1',  amt: '+₹28,000', rawAmt: 28000,  date: '14 May 2025, 9:45 AM',  type: 'credit', status: 'success', via: 'UPI • dev@okicici'            },
  { id: 'MGN-TRX-513780', desc: 'Platform Fee (3%)',                        amt: '-₹1,350',  rawAmt: -1350,  date: '14 May 2025, 9:46 AM',  type: 'debit',  status: 'success', via: 'Auto-deduct'                  },
  { id: 'MGN-TRX-402569', desc: 'Milestone Release — UI Redesign',          amt: '+₹12,500', rawAmt: 12500,  date: '10 May 2025, 1:20 PM',  type: 'credit', status: 'success', via: 'UPI • user@paytm'             },
  { id: 'MGN-TRX-391458', desc: 'Pending — Auth System Overhaul',           amt: '+₹9,500',  rawAmt: 9500,   date: '8 May 2025',            type: 'credit', status: 'pending', via: 'Awaiting client approval'     },
  { id: 'MGN-TRX-280347', desc: 'Withdrawal to ICICI ••7832',               amt: '-₹30,000', rawAmt: -30000, date: '5 May 2025, 3:15 PM',   type: 'debit',  status: 'success', via: 'IMPS'                         },
  { id: 'MGN-TRX-169236', desc: 'Milestone Release — Backend API',          amt: '+₹22,000', rawAmt: 22000,  date: '28 Apr 2025, 10:10 AM', type: 'credit', status: 'success', via: 'UPI • work@okhdfc'            },
];

export const INDIAN_MILESTONES: MilestonePayment[] = [
  { id: 'MS-001', proj: 'AI-Powered CRM Dashboard',   client: 'SalesForge Inc.', amt: '₹45,000', rawAmt: 45000, status: 'released', dueDate: 'May 24, 2025', ms: 'Milestone 2 — Core Features'    },
  { id: 'MS-002', proj: 'Mobile Fitness App',          client: 'FitVerse Co.',    amt: '₹28,000', rawAmt: 28000, status: 'released', dueDate: 'May 14, 2025', ms: 'Milestone 1 — Architecture Setup'},
  { id: 'MS-003', proj: 'E-Commerce API Integration',  client: 'Shopify Store',   amt: '₹18,000', rawAmt: 18000, status: 'released', dueDate: 'May 20, 2025', ms: 'Milestone 3 — Final Delivery'   },
  { id: 'MS-004', proj: 'Auth System Overhaul',        client: 'HealthPortal',    amt: '₹9,500',  rawAmt: 9500,  status: 'pending',  dueDate: 'May 30, 2025', ms: 'Milestone 1 — Initial Setup'    },
  { id: 'MS-005', proj: 'Dashboard UI Redesign',       client: 'CRM Platform',    amt: '₹12,500', rawAmt: 12500, status: 'released', dueDate: 'May 10, 2025', ms: 'Milestone 2 — UI Components'    },
  { id: 'MS-006', proj: 'Mobile App Phase 2',          client: 'FitTrack',        amt: '₹35,000', rawAmt: 35000, status: 'escrow',   dueDate: 'Jun 15, 2025', ms: 'Milestone 1 — Planning'         },
];

export const INDIAN_INVOICES: InvoiceRecord[] = [
  { id: 'INV-928184', proj: 'AI-Powered CRM Dashboard',  client: 'SalesForge Inc.', amt: '₹45,000', date: 'May 24, 2025', gstin: '27AABCT3518Q1Z5' },
  { id: 'INV-817293', proj: 'E-Commerce API Integration', client: 'Shopify Store',   amt: '₹18,000', date: 'May 20, 2025', gstin: '27AABCT3518Q1Z5' },
  { id: 'INV-736182', proj: 'Mobile Fitness App',         client: 'FitVerse Co.',    amt: '₹28,000', date: 'May 14, 2025', gstin: '27AABCT3518Q1Z5' },
  { id: 'INV-402569', proj: 'Dashboard UI Redesign',      client: 'CRM Platform',    amt: '₹12,500', date: 'May 10, 2025', gstin: '27AABCT3518Q1Z5' },
];

export const BANKS = [
  { name: 'HDFC Bank',  acno: '••••4521', color: '#004C97', short: 'HD', ifsc: 'HDFC0001234' },
  { name: 'ICICI Bank', acno: '••••7832', color: '#F36F21', short: 'IC', ifsc: 'ICIC0005678' },
  { name: 'SBI',        acno: '••••2341', color: '#22409A', short: 'SB', ifsc: 'SBIN0009012' },
];