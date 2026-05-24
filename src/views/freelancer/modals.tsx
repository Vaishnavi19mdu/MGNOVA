'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertCircle, Check, RefreshCw, CheckCircle, Send,
  ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap,
  Eye, Upload, Lock, Key, Shield,
} from 'lucide-react';
import {
  auth, db,
} from '../../firebase';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  doc, addDoc, collection, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { C, s, UserProfile, Contract, Project } from './types-and-data';
import { Modal } from './shared-components';

// ─── Delete Account Modal ─────────────────────────────────────────────────────
export function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirm !== 'DELETE') { setError('Type DELETE to confirm.'); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      await updateDoc(doc(db, 'users', user.uid), { deleted: true, deletedAt: serverTimestamp() });
      await user.delete();
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
      <input
        value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE"
        style={{ ...s.input, marginBottom: 16, borderColor: confirm && confirm !== 'DELETE' ? C.red : `${C.rodeo}50` }}
      />
      {error && (
        <div style={{ background: C.redLight, border: `1px solid ${C.red}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} color={C.red} />
          <p style={{ fontSize: 12, color: C.red, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ ...s.btn, ...s.btnSecondary }}>Cancel</button>
        <button
          onClick={handleDelete} disabled={loading || confirm !== 'DELETE'}
          style={{ ...s.btn, background: C.red, color: '#fff', opacity: loading || confirm !== 'DELETE' ? 0.5 : 1 }}
        >
          {loading
            ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Deleting…</>
            : <><X size={13} /> Delete My Account</>}
        </button>
      </div>
    </Modal>
  );
}

// ─── New Proposal Modal ───────────────────────────────────────────────────────
export function NewProposalModal({
  open, onClose, userProfile,
}: { open: boolean; onClose: () => void; userProfile: UserProfile | null }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ projectTitle: '', clientName: '', budget: '', timeline: '', coverLetter: '', rate: '', startDate: '', skillsUsed: [] as string[] });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const skillOptions = userProfile?.skills || [];
  const totalSteps = 3;
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      await addDoc(collection(db, 'proposals'), { ...form, userId: user.uid, status: 'applied', createdAt: serverTimestamp() });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit proposal.');
    } finally { setSubmitting(false); }
  };

  const handleClose = () => {
    setStep(1);
    setForm({ projectTitle: '', clientName: '', budget: '', timeline: '', coverLetter: '', rate: '', startDate: '', skillsUsed: [] });
    setSubmitted(false); setError(''); onClose();
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
          <p style={{ fontSize: 13, color: C.gray, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>
            Your proposal for "{form.projectTitle}" has been sent to {form.clientName}.
          </p>
          <button onClick={handleClose} style={{ ...s.btn, ...s.btnPrimary }}>Back to Proposals</button>
        </motion.div>
      ) : (
        <>
          {/* Step indicator */}
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
                      <button key={sk}
                        onClick={() => setForm(p => ({ ...p, skillsUsed: selected ? p.skillsUsed.filter(s => s !== sk) : [...p.skillsUsed, sk] }))}
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
export function GenerateProposalModal({
  open, onClose, project, userProfile,
}: { open: boolean; onClose: () => void; project: Project | null; userProfile: UserProfile | null }) {
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
    setSubmitting(true); setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      await addDoc(collection(db, 'proposals'), {
        projectName: project.title, clientName: project.clientName,
        budget: project.budget, timeline: project.timeline,
        coverLetter: generated, skillsUsed: project.skills,
        userId: user.uid, status: 'applied', createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit.');
    } finally { setSubmitting(false); }
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
                {generating
                  ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                  : <><Sparkles size={14} /> Generate with AI</>}
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
export function ViewContractModal({
  open, onClose, contract,
}: { open: boolean; onClose: () => void; contract: Contract | null }) {
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
        <span style={s.tag(cfg.color)}>{cfg.label}</span>
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
        <div style={{ height: 4, background: `${C.rodeo}25`, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${contract.progress}%`, background: cfg.color, borderRadius: 99 }} />
        </div>
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
export function SubmitWorkModal({
  open, onClose, contract,
}: { open: boolean; onClose: () => void; contract: Contract | null }) {
  const [form, setForm] = useState({ milestone: '', deliverableLink: '', notes: '', requestPayment: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const user = auth.currentUser;
      if (!user || !contract) throw new Error('Not authenticated');
      await addDoc(collection(db, 'workSubmissions'), {
        contractId: contract.id, userId: user.uid,
        milestone: form.milestone, deliverableLink: form.deliverableLink,
        notes: form.notes, requestPayment: form.requestPayment,
        submittedAt: serverTimestamp(), status: 'submitted',
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit work.');
    } finally { setSubmitting(false); }
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
export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      setError(e.code === 'auth/wrong-password' ? 'Current password is incorrect.' : e.message ?? 'Failed to update password.');
    } finally { setLoading(false); }
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