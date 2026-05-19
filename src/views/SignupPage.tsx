import React, { useState, useRef } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ArrowRight, Upload, Check, Loader } from 'lucide-react';

type Role = 'talent' | 'visionary';

const TALENT_ROLES = ['Brand Strategist','Product Designer','Frontend Engineer','Motion Designer','AI Developer','UX Researcher'];
const COLLAB_TYPES = ['Long-Term Projects','Contract Work','Startup Collaboration','Enterprise Partnerships'];
const AVAILABILITY = ['Full-Time','Part-Time','Contract Only','Open to Opportunities'];
const PROJECT_SIZES = ['Small (< $5k)','Medium ($5k–$25k)','Large ($25k–$100k)','Enterprise ($100k+)'];
const INDUSTRIES = ['Design & Branding','Technology','Film & Media','Architecture','Fashion','Finance'];
const TEAM_SIZES = ['Solo','2–10','11–50','50–200','200+'];
const HIRING_FREQ = ['Occasionally','Monthly','Weekly','Ongoing'];
const TALENT_CATS = ['Designers','Engineers','Strategists','Motion Artists','AI Specialists','Researchers'];
const BUDGETS = ['< $5k','$5k–$25k','$25k–$100k','$100k+'];
const WORKFLOWS = ['Milestone-Based','Agile Collaboration','Long-Term Retainers','Enterprise Scaling'];
const CONTRACT_DURATIONS = ['Under 1 month','1–3 months','3–6 months','6+ months'];

const PARSE_STATES = [
  'Scanning resume...',
  'Extracting skills...',
  'Mapping experience...',
  'Building professional profile...',
  'Generating expertise summary...',
];

const calcAge = (dob: string) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export default function SignupPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [parseStep, setParseStep] = useState(-1);
  const [parsing, setParsing] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    dob: '', country: '', timezone: '',
    primaryRole: '', yearsExp: '', industry: '', portfolioUrl: '',
    linkedinUrl: '', collabType: '',
    availability: '', projectSize: '', hourlyRate: '', languages: '', remote: '',
    companyName: '', teamSize: '', websiteUrl: '', hiringFreq: '',
    talentCats: [] as string[], budget: '', contractDuration: '', workflow: '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: string, v: string) =>
    setForm(f => ({ ...f, [k]: (f as any)[k].includes(v) ? (f as any)[k].filter((x: string) => x !== v) : [...(f as any)[k], v] }));

  const age = calcAge(form.dob);
  const totalSteps = 5;

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: form.email,
        role: role === 'talent' ? 'freelancer' : 'client',
        isAdmin: false,
        fullName: form.fullName,
        dob: form.dob,
        age,
        country: form.country,
        timezone: form.timezone,
        ...(role === 'talent' ? {
          primaryRole: form.primaryRole,
          yearsExp: form.yearsExp,
          industry: form.industry,
          portfolioUrl: form.portfolioUrl,
          linkedinUrl: form.linkedinUrl,
          collabType: form.collabType,
          availability: form.availability,
          projectSize: form.projectSize,
          hourlyRate: form.hourlyRate,
        } : {
          companyName: form.companyName,
          teamSize: form.teamSize,
          websiteUrl: form.websiteUrl,
          hiringFreq: form.hiringFreq,
          talentCats: form.talentCats,
          budget: form.budget,
          workflow: form.workflow,
        }),
        createdAt: serverTimestamp(),
      });
      navigate(role === 'talent' ? '/freelancer/dashboard' : '/client/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const simulateParse = () => {
    setParsing(true);
    setParseStep(0);
    PARSE_STATES.forEach((_, i) => {
      setTimeout(() => {
        setParseStep(i);
        if (i === PARSE_STATES.length - 1) setParsing(false);
      }, i * 900);
    });
  };

  // ── UI primitives ──
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );

  const TextInput = ({ value, onChange, placeholder, type = 'text' }: any) => (
    <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: '#f8f7f5', border: '0.5px solid #e0ddd8', borderRadius: 8, padding: '12px 14px', fontSize: 14, color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }} />
  );

  const Chips = ({ options, value, onSelect, multi = false }: any) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o: string) => {
        const active = multi ? value.includes(o) : value === o;
        return (
          <button key={o} type="button" onClick={() => multi ? toggleArr(multi, o) : onSelect(o)}
            style={{ padding: '8px 16px', borderRadius: 100, border: `0.5px solid ${active ? '#1a1a1a' : '#e0ddd8'}`, background: active ? '#1a1a1a' : 'transparent', color: active ? '#fff' : '#666', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {o}
          </button>
        );
      })}
    </div>
  );

  const ProgressBar = () => (
    <div style={{ display: 'flex', gap: 6, marginBottom: '3rem' }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i < step ? '#1a1a1a' : i === step ? '#999' : '#e0ddd8', transition: 'background 0.4s' }} />
      ))}
    </div>
  );

  const Btn = ({ onClick, children, secondary = false }: any) => (
    <button type="button" onClick={onClick}
      style={{ padding: secondary ? '10px 20px' : '14px', width: secondary ? 'auto' : '100%', background: secondary ? 'transparent' : '#1a1a1a', color: secondary ? '#999' : '#fff', border: `0.5px solid ${secondary ? '#e0ddd8' : '#1a1a1a'}`, borderRadius: 8, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', marginTop: secondary ? 12 : 24, fontWeight: 500 }}>
      {children}
    </button>
  );

  const wrap = { maxWidth: 520, margin: '0 auto', padding: '3rem 1rem' };
  const muted = { color: '#888', fontSize: 12, fontFamily: 'inherit' };

  // ── Role selection ──
  if (!role) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 760, width: '100%' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '3rem', textAlign: 'center' }}>MGNOVA</p>
          <h1 style={{ fontSize: 28, fontWeight: 500, color: '#1a1a1a', textAlign: 'center', marginBottom: '0.5rem' }}>How will you use MGNOVA?</h1>
          <p style={{ fontSize: 14, color: '#888', textAlign: 'center', marginBottom: '3rem' }}>Choose the path that defines your role on the platform.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '0.5px solid #e0ddd8', borderRadius: 16, overflow: 'hidden' }}>
            {([
              { id: 'talent', label: 'Talent', tag: 'Independent Professional', desc: 'Build your reputation, showcase your expertise, and collaborate on premium milestone-driven projects.', dot: '#7F77DD' },
              { id: 'visionary', label: 'Visionary', tag: 'Business / Studio', desc: 'Hire elite professionals, manage high-value projects, and scale execution with confidence.', dot: '#1D9E75' },
            ] as const).map((r, i) => (
              <div key={r.id} onClick={() => { setRole(r.id); setStep(1); }}
                style={{ padding: '3rem 2.5rem', cursor: 'pointer', background: '#fff', borderRight: i === 0 ? '0.5px solid #e0ddd8' : 'none', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', gap: '2rem' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8f7f5')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.dot }} />
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.75rem' }}>{r.tag}</p>
                  <h2 style={{ fontSize: 26, fontWeight: 500, color: '#1a1a1a', marginBottom: '1rem', lineHeight: 1.2 }}>Join as<br />{r.label}</h2>
                  <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>{r.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1a1a', fontWeight: 500 }}>
                  {r.id === 'talent' ? 'Begin your profile' : 'Create workspace'}
                  <div style={{ width: 28, height: 28, border: '0.5px solid #e0ddd8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', marginTop: '2rem' }}>Already have an account? <a href="/login" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500 }}>Sign in</a></p>
        </div>
      </div>
    );
  }

  // ── Talent steps ──
  if (role === 'talent') {
    return (
      <div style={{ minHeight: '100vh', background: '#faf9f7', padding: '2rem 1rem' }}>
        <div style={wrap}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '3rem' }}>MGNOVA · Talent</p>
          <ProgressBar />
          {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: '1rem' }}>{error}</p>}

          {step === 1 && <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 1 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Your identity</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem', lineHeight: 1.6 }}>The foundation of your professional profile on MGNOVA.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Full name"><TextInput value={form.fullName} onChange={(v: string) => set('fullName', v)} placeholder="Alexandra Moore" /></Field>
              <Field label="Date of birth"><TextInput type="date" value={form.dob} onChange={(v: string) => set('dob', v)} placeholder="" /></Field>
            </div>
            {age && <p style={{ fontSize: 12, color: '#888', marginTop: -8, marginBottom: '1.25rem' }}>Age calculated automatically: <strong>{age} years</strong></p>}
            <Field label="Email address"><TextInput value={form.email} onChange={(v: string) => set('email', v)} placeholder="alex@studio.io" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Password"><TextInput type="password" value={form.password} onChange={(v: string) => set('password', v)} placeholder="Min. 8 characters" /></Field>
              <Field label="Confirm password"><TextInput type="password" value={form.confirmPassword} onChange={(v: string) => set('confirmPassword', v)} placeholder="Repeat password" /></Field>
              <Field label="Country"><TextInput value={form.country} onChange={(v: string) => set('country', v)} placeholder="India" /></Field>
              <Field label="Timezone"><TextInput value={form.timezone} onChange={(v: string) => set('timezone', v)} placeholder="IST (UTC+5:30)" /></Field>
            </div>
            <Btn onClick={() => setStep(2)}>Continue</Btn>
            <Btn secondary onClick={() => setRole(null)}>← Back</Btn>
          </>}

          {step === 2 && <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 2 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Your expertise</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem', lineHeight: 1.6 }}>Tell us about your professional domain and how you work best.</p>
            <Field label="Primary role"><Chips options={TALENT_ROLES} value={form.primaryRole} onSelect={(v: string) => set('primaryRole', v)} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1.25rem' }}>
              <Field label="Years of experience"><TextInput value={form.yearsExp} onChange={(v: string) => set('yearsExp', v)} placeholder="6" /></Field>
              <Field label="Industry focus">
                <select value={form.industry} onChange={(e: any) => set('industry', e.target.value)}
                  style={{ width: '100%', background: '#f8f7f5', border: '0.5px solid #e0ddd8', borderRadius: 8, padding: '12px 14px', fontSize: 14, color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}>
                  <option value="">Select...</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Portfolio URL"><TextInput value={form.portfolioUrl} onChange={(v: string) => set('portfolioUrl', v)} placeholder="yourportfolio.com" /></Field>
              <Field label="LinkedIn URL"><TextInput value={form.linkedinUrl} onChange={(v: string) => set('linkedinUrl', v)} placeholder="linkedin.com/in/alex" /></Field>
            </div>
            <Field label="Preferred collaboration" ><div style={{ marginTop: 4 }}><Chips options={COLLAB_TYPES} value={form.collabType} onSelect={(v: string) => set('collabType', v)} /></div></Field>
            <Btn onClick={() => setStep(3)}>Continue</Btn>
            <Btn secondary onClick={() => setStep(1)}>← Back</Btn>
          </>}

          {step === 3 && <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 3 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Resume & AI parsing</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem', lineHeight: 1.6 }}>Upload your resume. Our AI will extract skills, experience, and build your editorial profile.</p>
            <div onClick={simulateParse}
              style={{ border: '0.5px dashed #c0bdb8', borderRadius: 12, padding: '3rem 2rem', textAlign: 'center', background: '#f8f7f5', cursor: 'pointer', marginBottom: '1.5rem' }}>
              <Upload size={28} color="#aaa" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Drop your resume here</p>
              <p style={{ fontSize: 12, color: '#aaa' }}>PDF or DOCX · Max 10MB · Click to simulate</p>
            </div>
            {parseStep >= 0 && (
              <div style={{ border: '0.5px solid #e0ddd8', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
                {PARSE_STATES.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < PARSE_STATES.length - 1 ? '0.5px solid #f0ede9' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', border: `0.5px solid ${i <= parseStep ? '#1a1a1a' : '#e0ddd8'}`, background: i < parseStep ? '#1a1a1a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {i < parseStep ? <Check size={12} color="#fff" /> : i === parseStep && parsing ? <Loader size={12} color="#888" /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e0ddd8', display: 'inline-block' }} />}
                    </div>
                    <span style={{ fontSize: 13, color: i <= parseStep ? '#1a1a1a' : '#aaa' }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            <Btn onClick={() => setStep(4)}>Continue</Btn>
            <Btn secondary onClick={() => setStep(2)}>← Back</Btn>
          </>}

          {step === 4 && <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 4 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Professional insights</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem', lineHeight: 1.6 }}>Help clients understand how you like to engage.</p>
            <Field label="Availability"><Chips options={AVAILABILITY} value={form.availability} onSelect={(v: string) => set('availability', v)} /></Field>
            <div style={{ marginTop: '1.25rem' }}>
              <Field label="Preferred project size"><Chips options={PROJECT_SIZES} value={form.projectSize} onSelect={(v: string) => set('projectSize', v)} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1.25rem' }}>
              <Field label="Hourly rate (optional)"><TextInput value={form.hourlyRate} onChange={(v: string) => set('hourlyRate', v)} placeholder="$120 / hr" /></Field>
              <Field label="Languages spoken"><TextInput value={form.languages} onChange={(v: string) => set('languages', v)} placeholder="English, Tamil" /></Field>
            </div>
            <Btn onClick={() => setStep(5)}>Continue</Btn>
            <Btn secondary onClick={() => setStep(3)}>← Back</Btn>
          </>}

          {step === 5 && <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 5 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Your professional identity</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: '2rem', lineHeight: 1.6 }}>Review your curated profile before entering the platform.</p>
            <div style={{ border: '0.5px solid #e0ddd8', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8f7f5', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500, color: '#534AB7', flexShrink: 0 }}>
                  {form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AM'}
                </div>
                <div>
                  <p style={{ fontSize: 17, fontWeight: 500, color: '#1a1a1a' }}>{form.fullName || 'Your Name'}</p>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{form.primaryRole || 'Professional'} · {form.yearsExp ? `${form.yearsExp} years experience` : ''}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: '#EEEDFE', color: '#534AB7', border: '0.5px solid #AFA9EC' }}>Reputation starter</span>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: '#f0ede9', color: '#888', border: '0.5px solid #e0ddd8' }}>{form.availability || 'Available'}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '1.5rem 2rem' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>Profile summary</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.5rem' }}>
                  {[form.primaryRole, form.collabType, form.availability, form.country].filter(Boolean).map((t, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, background: '#f8f7f5', border: '0.5px solid #e0ddd8', color: '#888' }}>{t}</span>
                  ))}
                </div>
                <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Profile strength</p>
                <div style={{ height: 3, background: '#f0ede9', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, [form.fullName, form.email, form.primaryRole, form.collabType, form.availability, form.country].filter(Boolean).length * 16)}%`, background: '#1a1a1a', borderRadius: 2, transition: 'width 0.6s' }} />
                </div>
              </div>
            </div>
            <Btn onClick={handleSubmit}>Enter MGNOVA</Btn>
            <Btn secondary onClick={() => setStep(4)}>← Back</Btn>
          </>}
        </div>
      </div>
    );
  }

  // ── Visionary steps ──
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', padding: '2rem 1rem' }}>
      <div style={wrap}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '3rem' }}>MGNOVA · Visionary</p>
        <ProgressBar />
        {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: '1rem' }}>{error}</p>}

        {step === 1 && <>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 1 of 5</p>
          <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Your identity</h2>
          <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem', lineHeight: 1.6 }}>You're joining as a Visionary — a business or creative studio seeking elite talent.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Full name"><TextInput value={form.fullName} onChange={(v: string) => set('fullName', v)} placeholder="Jordan Ellis" /></Field>
            <Field label="Date of birth"><TextInput type="date" value={form.dob} onChange={(v: string) => set('dob', v)} placeholder="" /></Field>
          </div>
          {age && <p style={{ fontSize: 12, color: '#888', marginTop: -8, marginBottom: '1.25rem' }}>Age: <strong>{age} years</strong></p>}
          <Field label="Email address"><TextInput value={form.email} onChange={(v: string) => set('email', v)} placeholder="jordan@aureliangroup.com" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Password"><TextInput type="password" value={form.password} onChange={(v: string) => set('password', v)} placeholder="Min. 8 characters" /></Field>
            <Field label="Confirm password"><TextInput type="password" value={form.confirmPassword} onChange={(v: string) => set('confirmPassword', v)} placeholder="Repeat" /></Field>
            <Field label="Country"><TextInput value={form.country} onChange={(v: string) => set('country', v)} placeholder="United Kingdom" /></Field>
            <Field label="Timezone"><TextInput value={form.timezone} onChange={(v: string) => set('timezone', v)} placeholder="GMT (UTC+0)" /></Field>
          </div>
          <Btn onClick={() => setStep(2)}>Continue</Btn>
          <Btn secondary onClick={() => setRole(null)}>← Back</Btn>
        </>}

        {step === 2 && <>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 2 of 5</p>
          <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Your organization</h2>
          <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem', lineHeight: 1.6 }}>Tell us about your company or studio.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Company / studio name"><TextInput value={form.companyName} onChange={(v: string) => set('companyName', v)} placeholder="Aurelian Group" /></Field>
            <Field label="Industry">
              <select value={form.industry} onChange={(e: any) => set('industry', e.target.value)}
                style={{ width: '100%', background: '#f8f7f5', border: '0.5px solid #e0ddd8', borderRadius: 8, padding: '12px 14px', fontSize: 14, color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}>
                <option value="">Select...</option>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Team size"><Chips options={TEAM_SIZES} value={form.teamSize} onSelect={(v: string) => set('teamSize', v)} /></Field>
            <Field label="Hiring frequency"><Chips options={HIRING_FREQ} value={form.hiringFreq} onSelect={(v: string) => set('hiringFreq', v)} /></Field>
            <Field label="Website URL"><TextInput value={form.websiteUrl} onChange={(v: string) => set('websiteUrl', v)} placeholder="aureliangroup.com" /></Field>
            <Field label="LinkedIn URL"><TextInput value={form.linkedinUrl} onChange={(v: string) => set('linkedinUrl', v)} placeholder="linkedin.com/company/..." /></Field>
          </div>
          <Btn onClick={() => setStep(3)}>Continue</Btn>
          <Btn secondary onClick={() => setStep(1)}>← Back</Btn>
        </>}

        {step === 3 && <>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 3 of 5</p>
          <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Business verification</h2>
          <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem', lineHeight: 1.6 }}>Optional — upload documents to fast-track your verified badge.</p>
          {['Company deck', 'Brand guidelines', 'Business registration'].map(doc => (
            <div key={doc} onClick={simulateParse} style={{ border: '0.5px dashed #c0bdb8', borderRadius: 10, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, cursor: 'pointer', background: '#f8f7f5' }}>
              <Upload size={18} color="#aaa" />
              <p style={{ fontSize: 13, color: '#888' }}>{doc}</p>
            </div>
          ))}
          {parseStep >= 0 && (
            <div style={{ border: '0.5px solid #e0ddd8', borderRadius: 10, padding: '1.25rem', marginTop: '1rem' }}>
              {['Verifying organization...', 'Analyzing company information...', 'Building workspace identity...'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '0.5px solid #f0ede9' : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `0.5px solid ${i < parseStep ? '#1a1a1a' : '#e0ddd8'}`, background: i < parseStep ? '#1a1a1a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {i < parseStep && <Check size={10} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 13, color: i < parseStep ? '#1a1a1a' : '#aaa' }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          <Btn onClick={() => setStep(4)}>Continue</Btn>
          <Btn secondary onClick={() => setStep(2)}>← Back</Btn>
        </>}

        {step === 4 && <>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 4 of 5</p>
          <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Collaboration preferences</h2>
          <p style={{ fontSize: 13, color: '#888', marginBottom: '2.5rem', lineHeight: 1.6 }}>Help us match you with the right talent and project structures.</p>
          <Field label="Preferred talent categories"><Chips options={TALENT_CATS} value={form.talentCats} multi="talentCats" onSelect={() => {}} /></Field>
          <div style={{ marginTop: '1.25rem' }}>
            <Field label="Typical project budget"><Chips options={BUDGETS} value={form.budget} onSelect={(v: string) => set('budget', v)} /></Field>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <Field label="Preferred contract duration"><Chips options={CONTRACT_DURATIONS} value={form.contractDuration} onSelect={(v: string) => set('contractDuration', v)} /></Field>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <Field label="Workflow preference"><Chips options={WORKFLOWS} value={form.workflow} onSelect={(v: string) => set('workflow', v)} /></Field>
          </div>
          <Btn onClick={() => setStep(5)}>Continue</Btn>
          <Btn secondary onClick={() => setStep(3)}>← Back</Btn>
        </>}

        {step === 5 && <>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem' }}>Step 5 of 5</p>
          <h2 style={{ fontSize: 24, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.4rem' }}>Your workspace</h2>
          <p style={{ fontSize: 13, color: '#888', marginBottom: '2rem', lineHeight: 1.6 }}>Review your workspace profile before entering the platform.</p>
          <div style={{ border: '0.5px solid #e0ddd8', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8f7f5', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500, color: '#0F6E56', flexShrink: 0 }}>
                {form.companyName?.[0]?.toUpperCase() || 'V'}
              </div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 500, color: '#1a1a1a' }}>{form.companyName || 'Your Company'}</p>
                <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{form.industry} · {form.teamSize} team</p>
                <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: '#E1F5EE', color: '#0F6E56', border: '0.5px solid #5DCAA5', display: 'inline-block', marginTop: 8 }}>Visionary workspace</span>
              </div>
            </div>
            <div style={{ padding: '1.5rem 2rem' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>Preferences</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[form.workflow, form.budget, form.contractDuration, ...form.talentCats.slice(0, 3)].filter(Boolean).map((t, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, background: '#f8f7f5', border: '0.5px solid #e0ddd8', color: '#888' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          <Btn onClick={handleSubmit}>Enter platform</Btn>
          <Btn secondary onClick={() => setStep(4)}>← Back</Btn>
        </>}
      </div>
    </div>
  );
}