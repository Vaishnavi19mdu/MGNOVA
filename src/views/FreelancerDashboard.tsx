'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Send, Star, CheckCircle,
  Bell, Search, ChevronRight, Menu, X, User,
  LogOut, Check, ArrowRight, Zap,
  DollarSign, Award, Activity, ChevronDown,
  ChevronLeft, Plus, Edit3, Eye, Upload,
  Globe, Mail, MapPin, BarChart2,
  Clock, Briefcase, Filter, Download,
  Sparkles, Key, Shield,
} from 'lucide-react';

// ── Firebase ──────────────────────────────────────────────────────────────────
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc,
  query, where, orderBy, serverTimestamp,
  arrayUnion, arrayRemove, onSnapshot,
} from 'firebase/firestore';

// ── Local modules ─────────────────────────────────────────────────────────────
import {
  C, s,
  UserProfile, Milestone, Project, Proposal, Contract, Transaction, Notification,
  getInitials, navItems, pageHeaders,
  SEED_MILESTONES, SEED_PROJECTS, SEED_PROPOSALS, SEED_CONTRACTS,
  SEED_TRANSACTIONS, SEED_NOTIFICATIONS, SEED_REPUTATION, SEED_ANALYTICS,
} from './freelancer/types-and-data';

import {
  Logo, Avatar, Badge, Divider, ProgressBar, StarRating,
  useWindowSize, Modal,
  AnalyticsCard, MilestoneCard, LoadingScreen,
} from './freelancer/shared-components';

import {
  DeleteAccountModal, NewProposalModal, GenerateProposalModal,
  ViewContractModal, SubmitWorkModal, ChangePasswordModal,
} from './freelancer/modals';

import { WalletPage } from './freelancer/wallet';

// ─── ProjectCard ──────────────────────────────────────────────────────────────
function ProjectCard({ p, index, onGenerateProposal }: { p: Project; index: number; onGenerateProposal: (p: Project) => void }) {
  const [hovered, setHovered] = useState(false);
  const circ = 2 * Math.PI * 26;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }} whileHover={{ y: -3 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
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
            <motion.circle cx="30" cy="30" r="26" fill="none" stroke={C.green} strokeWidth="4" strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - p.matchScore / 100) }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }} strokeLinecap="round" />
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

// ─── ProposalsPage ────────────────────────────────────────────────────────────
function ProposalsPage({ isMobile, onNew, proposals }: { isMobile: boolean; onNew: () => void; proposals: Proposal[] }) {
  const statusCfg: Record<string, { color: string; label: string; Icon: any }> = {
    accepted:    { color: C.green,  label: 'Accepted',    Icon: Check },
    shortlisted: { color: C.gold,   label: 'Shortlisted', Icon: Star  },
    applied:     { color: C.copper, label: 'Applied',     Icon: Clock },
    rejected:    { color: C.rodeo,  label: 'Rejected',    Icon: X     },
  };
  return (
    <motion.div key="proposals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Sent',    value: String(proposals.length),                                                                    icon: Send,        color: C.green  },
          { label: 'Accepted',      value: String(proposals.filter(p => p.status === 'accepted').length),                               icon: CheckCircle, color: C.green  },
          { label: 'Shortlisted',   value: String(proposals.filter(p => p.status === 'shortlisted').length),                            icon: Star,        color: C.gold   },
          { label: 'Success Rate',  value: proposals.length ? `${Math.round(proposals.filter(p => p.status === 'accepted').length / proposals.length * 100)}%` : '0%', icon: TrendingUp, color: C.copper },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color={stat.color} />
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

// ─── ContractsPage ────────────────────────────────────────────────────────────
function ContractsPage({ onView, onSubmit, contracts }: { onView: (c: Contract) => void; onSubmit: (c: Contract) => void; contracts: Contract[] }) {
  const statusCfg: Record<string, { color: string; label: string }> = {
    active:    { color: C.green,  label: 'Active'    },
    completed: { color: C.copper, label: 'Completed' },
    upcoming:  { color: C.gold,   label: 'Upcoming'  },
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

// ─── ReputationPage ───────────────────────────────────────────────────────────
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
              <div style={{ textAlign: 'right' }}>
                <StarRating value={r.rating} size={12} />
                <p style={{ ...s.label, margin: '3px 0 0' }}>{r.date}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0, fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>"{r.comment}"</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (userProfile) {
      setForm({ fullName: userProfile.fullName, email: userProfile.email, title: userProfile.primaryRole || '', location: userProfile.country || '', hourlyRate: userProfile.hourlyRate || '', languages: userProfile.languages || '', bio: userProfile.bio });
      setSkills(userProfile.skills || []);
    }
  }, [userProfile?.uid]);

  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const updates = { fullName: form.fullName || '', primaryRole: form.title || '', country: form.location || '', hourlyRate: form.hourlyRate || '', languages: form.languages || '', bio: form.bio || '', updatedAt: serverTimestamp() };
      await updateDoc(doc(db, 'users', user.uid), updates);
      onProfileUpdated({ ...updates, skills });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e: any) { setSaveError(e.message ?? 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleAddSkill = async () => {
    const sk = newSkill.trim();
    if (sk && !skills.includes(sk)) {
      setSkills([...skills, sk]);
      try { const user = auth.currentUser; if (user) await updateDoc(doc(db, 'users', user.uid), { skills: arrayUnion(sk) }); } catch (e) {}
    }
    setNewSkill(''); setAddingSkill(false);
  };

  const handleRemoveSkill = async (sk: string) => {
    setSkills(prev => prev.filter(s => s !== sk));
    try { const user = auth.currentUser; if (user) await updateDoc(doc(db, 'users', user.uid), { skills: arrayRemove(sk) }); } catch (e) {}
  };

  const fields = [
    { label: 'Full Name', key: 'fullName', icon: User, type: 'text' },
    { label: 'Email', key: 'email', icon: Mail, type: 'email' },
    { label: 'Primary Role', key: 'title', icon: Briefcase, type: 'text' },
    { label: 'Location', key: 'location', icon: MapPin, type: 'text' },
    { label: 'Hourly Rate', key: 'hourlyRate', icon: DollarSign, type: 'text' },
    { label: 'Languages', key: 'languages', icon: Globe, type: 'text' },
  ] as const;

  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>

        {/* Profile Info */}
        <div style={{ ...s.card, gridColumn: isMobile ? '1' : '1 / -1' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>Profile Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {fields.map(({ label, key, icon: Icon, type }) => (
              <div key={key}>
                <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.rodeo}50`, background: '#fff' }}>
                  <Icon size={14} color={C.gray} style={{ flexShrink: 0 }} />
                  <input
                    type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    disabled={key === 'email'}
                    style={{ fontSize: 13, color: C.coffee, fontFamily: "'DM Sans', sans-serif", border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: 0, opacity: key === 'email' ? 0.6 : 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} style={{ ...s.input, height: 90, resize: 'vertical' }} />
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
                <button onClick={() => handleRemoveSkill(sk)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.copper, display: 'flex', alignItems: 'center', padding: 0, opacity: 0.6 }}>
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

// need RefreshCw for SettingsPage
import { RefreshCw } from 'lucide-react';

// ─── DashboardPage ────────────────────────────────────────────────────────────
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
                { label: 'Rating',        value: `${userProfile?.rating ?? '—'} ★` },
                { label: 'Projects Done', value: String(userProfile?.completedProjects ?? '—') },
                { label: 'Member Since',  value: userProfile?.memberSince ?? '—' },
                { label: 'Rate',          value: userProfile?.hourlyRate || '—' },
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

// ─── DiscoverPage ─────────────────────────────────────────────────────────────
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

// ─── Main Dashboard Export ────────────────────────────────────────────────────
export default function FreelancerDashboard() {
  const { width } = useWindowSize();
  const isMobile  = width < 640;
  const isTablet  = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [userProfile, setUserProfile]   = useState<UserProfile | null>(null);

  const [proposals,     setProposals]     = useState<Proposal[]>(SEED_PROPOSALS);
  const [contracts,     setContracts]     = useState<Contract[]>(SEED_CONTRACTS);
  const [milestones,    setMilestones]    = useState<Milestone[]>(SEED_MILESTONES);
  const [transactions,  setTransactions]  = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  const [sidebarOpen,    setSidebarOpen]    = useState(isDesktop);
  const [mobileNavOpen,  setMobileNavOpen]  = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [activePage,     setActivePage]     = useState('dashboard');

  const [newProposalOpen,       setNewProposalOpen]       = useState(false);
  const [generateProposalOpen,  setGenerateProposalOpen]  = useState(false);
  const [selectedProject,       setSelectedProject]       = useState<Project | null>(null);
  const [viewContractOpen,      setViewContractOpen]      = useState(false);
  const [submitWorkOpen,        setSubmitWorkOpen]        = useState(false);
  const [selectedContract,      setSelectedContract]      = useState<Contract | null>(null);
  const [changePasswordOpen,    setChangePasswordOpen]    = useState(false);
  const [deleteAccountOpen,     setDeleteAccountOpen]     = useState(false);

  // ── Auth listener ──────────────────────────────────────────────────────────
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
            const defaultProfile: UserProfile = {
              fullName: user.displayName || 'New User', email: user.email || '',
              role: 'freelancer', primaryRole: 'Freelancer', yearsExp: '1',
              country: '', availability: 'Full-Time', hourlyRate: '', languages: 'English',
              skills: [], memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              rating: 0, completedProjects: 0, bio: '',
            };
            await setDoc(doc(db, 'users', user.uid), defaultProfile);
            setUserProfile({ uid: user.uid, ...defaultProfile });
          }
        } catch (e) { console.error('Failed to load profile', e); }

        // Load proposals
        try {
          const q = query(collection(db, 'proposals'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const snap = await getDocs(q);
          if (!snap.empty) setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal)));
        } catch (e) {}

        // Load contracts
        try {
          const q = query(collection(db, 'contracts'), where('userId', '==', user.uid));
          const snap = await getDocs(q);
          if (!snap.empty) setContracts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contract)));
        } catch (e) {}

        // Load transactions
        try {
          const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const snap = await getDocs(q);
          if (!snap.empty) setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        } catch (e) {}

        // Real-time notifications
        try {
          const q = query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const unsubNotif = onSnapshot(q, snap => {
            if (!snap.empty) setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
          });
          return () => unsubNotif();
        } catch (e) {}
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

  const handleLogout = async () => {
    try { await signOut(auth); window.location.href = '/login'; }
    catch (e) { console.error('Logout failed', e); }
  };

  if (authLoading) return <LoadingScreen />;

  const unread = notifications.filter(n => !n.read).length;
  const ph = pageHeaders[activePage];

  const handleNavClick = (key: string) => {
    setActivePage(key);
    if (!isDesktop) setMobileNavOpen(false);
    setProfileOpen(false); setNotifOpen(false);
  };

  const handleGenerateProposal = (p: Project) => { setSelectedProject(p); setGenerateProposalOpen(true); };
  const handleViewContract      = (c: Contract) => { setSelectedContract(c); setViewContractOpen(true);  };
  const handleSubmitWork        = (c: Contract) => { setSelectedContract(c); setSubmitWorkOpen(true);    };
  const handleProfileUpdated    = (updates: Partial<UserProfile>) => setUserProfile(prev => prev ? { ...prev, ...updates } : prev);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':  return <DashboardPage isMobile={isMobile} isTablet={isTablet} userProfile={userProfile} milestones={milestones} onEditProfile={() => setActivePage('settings')} />;
      case 'discover':   return <DiscoverPage isMobile={isMobile} isTablet={isTablet} onGenerateProposal={handleGenerateProposal} />;
      case 'proposals':  return <ProposalsPage isMobile={isMobile} onNew={() => setNewProposalOpen(true)} proposals={proposals} />;
      case 'contracts':  return <ContractsPage onView={handleViewContract} onSubmit={handleSubmitWork} contracts={contracts} />;
      case 'wallet':     return <WalletPage isMobile={isMobile} />;
      case 'reputation': return <ReputationPage isMobile={isMobile} userProfile={userProfile} />;
      case 'settings':   return <SettingsPage isMobile={isMobile} onChangePassword={() => setChangePasswordOpen(true)} onDeleteAccount={() => setDeleteAccountOpen(true)} userProfile={userProfile} onProfileUpdated={handleProfileUpdated} />;
      default:           return <DashboardPage isMobile={isMobile} isTablet={isTablet} userProfile={userProfile} milestones={milestones} onEditProfile={() => setActivePage('settings')} />;
    }
  };

  const SidebarNav = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {!collapsed && <p style={{ ...s.label, color: `${C.ivory}50`, padding: '8px 12px 4px', fontSize: 9 }}>Navigation</p>}
      {navItems.map(({ icon: Icon, label, key }) => {
        const isActive = activePage === key;
        return (
          <button key={key} onClick={() => handleNavClick(key)} title={collapsed ? label : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '10px 0' : '10px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', marginBottom: 2, background: isActive ? C.green : 'transparent', transition: 'all 0.15s', color: isActive ? C.ivory : '#EDE8E3' }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>{label}</span>}
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

      {/* Modals */}
      <NewProposalModal      open={newProposalOpen}      onClose={() => setNewProposalOpen(false)}      userProfile={userProfile} />
      <GenerateProposalModal open={generateProposalOpen} onClose={() => setGenerateProposalOpen(false)} project={selectedProject} userProfile={userProfile} />
      <ViewContractModal     open={viewContractOpen}     onClose={() => setViewContractOpen(false)}     contract={selectedContract} />
      <SubmitWorkModal       open={submitWorkOpen}       onClose={() => setSubmitWorkOpen(false)}       contract={selectedContract} />
      <ChangePasswordModal   open={changePasswordOpen}   onClose={() => setChangePasswordOpen(false)} />
      <DeleteAccountModal    open={deleteAccountOpen}    onClose={() => setDeleteAccountOpen(false)} />

      {/* Desktop Sidebar */}
      {isDesktop && (
        <div style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: sidebarOpen ? 240 : 64, background: C.coffee, zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 14px 14px', borderBottom: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 60 }}>
            {sidebarOpen && <Logo />}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: sidebarOpen ? 0 : 'auto', flexShrink: 0 }}>
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
              <p style={{ fontSize: 11, color: '#B8AFA9', margin: '0 0 8px', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>Unlock AI proposals & priority matching</p>
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
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#EDE8E3', margin: 0, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userProfile?.fullName || 'Loading…'}</p>
                    <p style={{ fontSize: 10, color: '#B8AFA9', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{userProfile?.primaryRole || ''}</p>
                  </div>
                  <button onClick={handleLogout} title="Logout"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.rodeo, display: 'flex', alignItems: 'center', flexShrink: 0, padding: 4, borderRadius: 6 }}>
                    <LogOut size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
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
                <nav style={{ flex: 1, padding: '12px 10px' }}>
                  <SidebarNav collapsed={false} />
                </nav>
                <div style={{ padding: '10px 18px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: C.rodeo, fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: '8px 0', width: '100%' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Main Content */}
      <div style={{ marginLeft: isDesktop ? (sidebarOpen ? 240 : 64) : 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(247,243,238,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.rodeo}40`, padding: isMobile ? '10px 16px' : '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {!isDesktop && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMobileNavOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
                <Menu size={22} color={C.coffee} />
              </button>
              <Logo />
            </div>
          )}
          {!isMobile && (
            <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.gray }} />
              <input type="text" placeholder="Search projects, proposals…"
                style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8, background: '#fff', border: `1px solid ${C.rodeo}40`, borderRadius: 8, fontSize: 13, color: C.coffee, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
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

            {/* Profile Dropdown */}
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
                    </div>
                    <div style={{ padding: 6 }}>
                      {[
                        { icon: User,     label: 'View Profile',      action: () => { setActivePage('settings'); setProfileOpen(false); } },
                        { icon: Key,      label: 'Change Password',    action: () => { setChangePasswordOpen(true); setProfileOpen(false); } },
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

        {/* Mobile Bottom Nav */}
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