import React, { useState, useRef } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ArrowRight, Upload, Check, Loader, X, CheckCircle2 } from 'lucide-react';

// ── Palette ──
const C = {
  bg: '#F7F3EE',
  text: '#4B362F',
  softGray: '#999999',
  green: '#66806A',
  gold: '#D4AF37',
  copper: '#7B4B3A',
  dust: '#C7A19A',
  border: '#E4DDD6',
  inputBg: '#F0EBE4',
  white: '#FFFFFF',
};

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

// ── OCR / Parse steps ──
const TALENT_PARSE_STATES = [
  'Uploading document…',
  'Running OCR scan…',
  'Extracting text content…',
  'Parsing professional data…',
  'Building profile summary…',
];

const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg','image/png','image/gif','image/webp',
];
const ACCEPTED_EXT = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp';

// ── Age helpers ──
// Returns age in years, or null if dob is empty/invalid
const calcAge = (dob: string): number | null => {
  if (!dob) return null;
  const ms = Date.now() - new Date(dob).getTime();
  if (ms < 0) return null;
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
};

// Returns the latest allowed DOB as a yyyy-mm-dd string for a given minimum age
const maxDobForAge = (minAge: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d.toISOString().split('T')[0];
};

// Returns an error string if age is invalid for the given role, else ''
const ageError = (dob: string, role: Role | null): string => {
  const age = calcAge(dob);
  if (!dob) return '';
  if (age === null) return 'Invalid date of birth.';
  if (role === 'talent' && age < 16) return 'Talent members must be at least 16 years old.';
  if (role === 'visionary' && age < 18) return 'Visionary accounts require you to be at least 18 years old.';
  return '';
};

// ── File utilities ──
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(',')[1]);
    r.onerror = () => rej(new Error('Read failed'));
    r.readAsDataURL(file);
  });

const isImageFile = (f: File) => f.type.startsWith('image/');
const isPdfFile  = (f: File) => f.type === 'application/pdf';
const isDocxFile = (f: File) =>
  f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
  f.name.endsWith('.docx') || f.name.endsWith('.doc');

const getFileIcon = (f: File) =>
  isPdfFile(f) ? '📄' : isDocxFile(f) ? '📝' : '🖼️';

const getFileTypeLabel = (f: File) => {
  if (isPdfFile(f)) return 'PDF';
  if (f.type === 'application/msword') return 'DOC';
  if (f.type.includes('wordprocessingml')) return 'DOCX';
  if (f.type.startsWith('image/')) return f.type.split('/')[1].toUpperCase();
  return 'File';
};

// ── Tesseract OCR loader ──
// Loads Tesseract.js from CDN and runs OCR on an image File.
// Returns the raw recognized text.
const runTesseractOCR = async (file: File): Promise<string> => {
  // Dynamically load Tesseract if not already present
  if (!(window as any).Tesseract) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Tesseract.js'));
      document.head.appendChild(script);
    });
  }

  const Tesseract = (window as any).Tesseract;
  const imageUrl = URL.createObjectURL(file);
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
      logger: () => {}, // suppress progress logs
    });
    return text;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

// ── Claude API resume parser ──
// Sends extracted text (or raw file for PDFs/DOCX) to Claude to return structured JSON.
const parseResumeWithClaude = async (
  rawText: string | null,
  file: File | null,
): Promise<any> => {
  const prompt = `You are an expert resume parser. Analyze the resume and extract structured information.
Return ONLY a valid JSON object with exactly these fields (use null for missing fields, arrays for list fields):
{"fullName":"","email":"","phone":"","location":"","title":"","yearsExp":"","skills":[],"education":"","languages":[],"summary":""}
Return only the JSON — no markdown fences, no preamble, no explanation.`;

  let content: any[];

  if (rawText) {
    // OCR already extracted text — just send the text
    content = [{ type: 'text', text: `${prompt}\n\nResume text:\n${rawText}` }];
  } else if (file && isPdfFile(file)) {
    const base64 = await fileToBase64(file);
    content = [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
      { type: 'text', text: prompt },
    ];
  } else if (file && isDocxFile(file)) {
    const base64 = await fileToBase64(file);
    content = [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          data: base64,
        },
      },
      { type: 'text', text: prompt },
    ];
  } else {
    throw new Error('No content to parse');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content }],
    }),
  });

  const data = await res.json();
  const text = (data.content ?? []).map((c: any) => c.text || '').join('');
  return JSON.parse(text.replace(/```json|```/g, '').trim());
};

// ── UI Primitives ──

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.softGray, marginBottom: 8 }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', background: C.inputBg, border: `0.5px solid ${C.border}`,
  borderRadius: 8, padding: '12px 14px', fontSize: 14, color: C.text,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};

const TextInput = ({
  value, onChange, placeholder, type = 'text', max,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; max?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    max={max}
    style={inputStyle}
  />
);

const SelectInput = ({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: string[];
}) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle }}>
    <option value="">Select…</option>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

const Chips = ({
  options, value, onSelect, multi = false,
}: {
  options: string[]; value: string | string[]; onSelect: (v: string) => void; multi?: boolean;
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {options.map(o => {
      const active = multi ? (value as string[]).includes(o) : value === o;
      return (
        <button key={o} type="button" onClick={() => onSelect(o)} style={{
          padding: '8px 16px', borderRadius: 100,
          border: `0.5px solid ${active ? C.copper : C.border}`,
          background: active ? C.copper : 'transparent',
          color: active ? C.white : C.softGray,
          fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
        }}>
          {o}
        </button>
      );
    })}
  </div>
);

const Btn = ({
  onClick, children, secondary = false, disabled = false,
}: {
  onClick: () => void; children: React.ReactNode; secondary?: boolean; disabled?: boolean;
}) => (
  <button type="button" onClick={onClick} disabled={disabled} style={{
    padding: secondary ? '10px 20px' : '14px',
    width: secondary ? 'auto' : '100%',
    background: secondary ? 'transparent' : disabled ? C.border : C.text,
    color: secondary ? C.softGray : disabled ? C.softGray : C.white,
    border: `0.5px solid ${secondary ? C.border : disabled ? C.border : C.text}`,
    borderRadius: 8, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const,
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    marginTop: secondary ? 12 : 24, fontWeight: 500,
  }}>
    {children}
  </button>
);

const ProgressBar = ({ step, totalSteps }: { step: number; totalSteps: number }) => (
  <div style={{ display: 'flex', gap: 6, marginBottom: '3rem' }}>
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div key={i} style={{
        flex: 1, height: 2, borderRadius: 2,
        background: i < step ? C.copper : i === step ? C.dust : C.border,
        transition: 'background 0.4s',
      }} />
    ))}
  </div>
);

const ExtractedRow = ({
  label, value, used, onToggle,
}: {
  label: string; value: string | string[] | null; used: boolean; onToggle: () => void;
}) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: `0.5px solid ${C.inputBg}`, opacity: used ? 1 : 0.4, transition: 'opacity 0.2s' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.dust, marginBottom: 3 }}>{label}</p>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5, wordBreak: 'break-word' }}>{display}</p>
      </div>
      <button type="button" onClick={onToggle} style={{
        flexShrink: 0, marginTop: 2, padding: '5px 12px', borderRadius: 100,
        border: `0.5px solid ${used ? C.green : C.border}`,
        background: used ? C.green : 'transparent',
        color: used ? C.white : C.softGray,
        fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer',
        fontFamily: 'inherit', fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
      }}>
        {used ? <><CheckCircle2 size={10} /> Use</> : <><X size={10} /> Skip</>}
      </button>
    </div>
  );
};

// ── Age validation banner ──
const AgeBanner = ({ dob, role }: { dob: string; role: Role | null }) => {
  const err = ageError(dob, role);
  const age = calcAge(dob);
  if (!dob) return null;
  if (err) {
    return (
      <p style={{ fontSize: 12, color: C.copper, marginTop: -8, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
        <X size={12} /> {err}
      </p>
    );
  }
  if (age !== null) {
    return (
      <p style={{ fontSize: 12, color: C.softGray, marginTop: -8, marginBottom: '1.25rem' }}>
        Age: <strong style={{ color: C.text }}>{age} years</strong>
        {role === 'talent' && age < 18 && (
          <span style={{ marginLeft: 6, fontSize: 11, color: C.green }}>✓ Eligible (16+ for talent)</span>
        )}
      </p>
    );
  }
  return null;
};

// ── Main Component ──
export default function SignupPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [parseStep, setParseStep] = useState(-1);
  const [parsing, setParsing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string>('');
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [fileTypeError, setFileTypeError] = useState('');
  const [ocrStatus, setOcrStatus] = useState(''); // live OCR progress label
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [usedFields, setUsedFields] = useState<Record<string, boolean>>({
    fullName: true, email: true, location: true, yearsExp: true,
    languages: true, title: true, skills: true, education: true, summary: true,
  });
  const toggleUsed = (field: string) => setUsedFields(f => ({ ...f, [field]: !f[field] }));

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    dob: '', country: '', timezone: '',
    primaryRole: '', yearsExp: '', industry: '', portfolioUrl: '',
    linkedinUrl: '', collabType: '', availability: '', projectSize: '',
    hourlyRate: '', languages: '', remote: '',
    companyName: '', teamSize: '', websiteUrl: '', hiringFreq: '',
    talentCats: [] as string[], budget: '', contractDuration: '', workflow: '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: string, v: string) =>
    setForm(f => ({
      ...f,
      [k]: (f as any)[k].includes(v)
        ? (f as any)[k].filter((x: string) => x !== v)
        : [...(f as any)[k], v],
    }));

  const totalSteps = 5;

  // Check if the DOB step can proceed
  const dobOk = (dob: string) => ageError(dob, role) === '' && calcAge(dob) !== null;

  const applyExtractedData = () => {
    if (!parsedResume) return;
    const updates: any = {};
    if (usedFields.fullName && parsedResume.fullName) updates.fullName = parsedResume.fullName;
    if (usedFields.yearsExp && parsedResume.yearsExp) updates.yearsExp = parsedResume.yearsExp;
    if (usedFields.languages && parsedResume.languages?.length) updates.languages = parsedResume.languages.join(', ');
    if (usedFields.location && parsedResume.location) updates.country = parsedResume.location;
    setForm(f => ({ ...f, ...updates }));
  };

  // ── Main resume handler ──
  const handleResumeParse = async (file: File) => {
    setFileTypeError('');
    const valid =
      ACCEPTED_MIME.includes(file.type) ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx');
    if (!valid) {
      setFileTypeError('Please upload a PDF, Word document (.doc/.docx), or image file.');
      return;
    }

    setParsing(true);
    setParseStep(0);
    setResumeFile(file);
    setParsedResume(null);
    setOcrStatus('');
    setUsedFields({ fullName: true, email: true, location: true, yearsExp: true, languages: true, title: true, skills: true, education: true, summary: true });
    if (isImageFile(file)) setResumePreview(URL.createObjectURL(file));
    else setResumePreview('');

    try {
      setParseStep(1); // Uploading

      let rawText: string | null = null;

      if (isImageFile(file)) {
        // ── Real Tesseract.js OCR for image files ──
        setParseStep(2); // Running OCR
        setOcrStatus('Loading OCR engine…');
        rawText = await runTesseractOCR(file);
        setOcrStatus('OCR complete');
        setParseStep(3); // Extracting text
      } else {
        // PDFs and DOCX go straight to Claude's native document parsing (no OCR needed)
        setParseStep(2);
        setParseStep(3);
      }

      setParseStep(3); // Parsing professional data
      const parsed = await parseResumeWithClaude(rawText, isImageFile(file) ? null : file);
      setParsedResume(parsed);

      // Auto-fill obvious fields
      if (parsed.fullName) set('fullName', parsed.fullName);
      if (parsed.yearsExp) set('yearsExp', parsed.yearsExp);
      if (parsed.languages?.length) set('languages', parsed.languages.join(', '));
      if (parsed.location) set('country', parsed.location);

      setParseStep(4); // Building profile summary
      setTimeout(() => {
        setParsing(false);
        setOcrStatus('');
      }, 600);
    } catch (err) {
      console.error('Resume parse error:', err);
      setParsing(false);
      setParseStep(-1);
      setOcrStatus('');
      setFileTypeError('Failed to parse resume. Please try again or skip this step.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleResumeParse(f);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleResumeParse(f);
  };

  // For visionary "business verification" doc upload (simulate only — no real data to extract)
  const simulateParse = () => {
    setParsing(true);
    setParseStep(0);
    [0, 1, 2].forEach(i =>
      setTimeout(() => {
        setParseStep(i + 1);
        if (i === 2) setParsing(false);
      }, (i + 1) * 900),
    );
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    const dobErr = ageError(form.dob, role);
    if (dobErr) return setError(dobErr);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: form.email,
        role: role === 'talent' ? 'freelancer' : 'client',
        isAdmin: false,
        fullName: form.fullName,
        dob: form.dob,
        age: calcAge(form.dob),
        country: form.country,
        timezone: form.timezone,
        ...(role === 'talent'
          ? {
              primaryRole: form.primaryRole,
              yearsExp: form.yearsExp,
              industry: form.industry,
              portfolioUrl: form.portfolioUrl,
              linkedinUrl: form.linkedinUrl,
              collabType: form.collabType,
              availability: form.availability,
              projectSize: form.projectSize,
              hourlyRate: form.hourlyRate,
              languages: form.languages,
              resumeData: parsedResume || null,
            }
          : {
              companyName: form.companyName,
              teamSize: form.teamSize,
              websiteUrl: form.websiteUrl,
              hiringFreq: form.hiringFreq,
              talentCats: form.talentCats,
              budget: form.budget,
              contractDuration: form.contractDuration,
              workflow: form.workflow,
            }),
        createdAt: serverTimestamp(),
      });
      navigate(role === 'talent' ? '/freelancer/dashboard' : '/client/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const wrap: React.CSSProperties = { maxWidth: 520, margin: '0 auto', padding: '3rem 1rem' };

  // ── Role selection ──
  if (!role) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 760, width: '100%' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.softGray, marginBottom: '3rem', textAlign: 'center' }}>MGNOVA</p>
          <h1 style={{ fontSize: 28, fontWeight: 500, color: C.text, textAlign: 'center', marginBottom: '0.5rem' }}>How will you use MGNOVA?</h1>
          <p style={{ fontSize: 14, color: C.softGray, textAlign: 'center', marginBottom: '3rem' }}>Choose the path that defines your role on the platform.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `0.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            {([
              { id: 'talent' as Role, label: 'Talent', tag: 'Independent Professional', desc: 'Build your reputation, showcase your expertise, and collaborate on premium milestone-driven projects.', dot: C.green, cta: 'Begin your profile', note: 'Must be 16+' },
              { id: 'visionary' as Role, label: 'Visionary', tag: 'Business / Studio', desc: 'Hire elite professionals, manage high-value projects, and scale execution with confidence.', dot: C.gold, cta: 'Create workspace', note: 'Must be 18+' },
            ]).map((r, i) => (
              <div
                key={r.id}
                onClick={() => { setRole(r.id); setStep(1); }}
                style={{ padding: '3rem 2.5rem', cursor: 'pointer', background: C.white, borderRight: i === 0 ? `0.5px solid ${C.border}` : 'none', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', gap: '2rem' }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                onMouseLeave={e => (e.currentTarget.style.background = C.white)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.dot }} />
                  <span style={{ fontSize: 10, color: C.softGray, letterSpacing: '0.08em' }}>{r.note}</span>
                </div>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.75rem' }}>{r.tag}</p>
                  <h2 style={{ fontSize: 26, fontWeight: 500, color: C.text, marginBottom: '1rem', lineHeight: 1.2 }}>Join as<br />{r.label}</h2>
                  <p style={{ fontSize: 13, color: C.softGray, lineHeight: 1.7 }}>{r.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.text, fontWeight: 500 }}>
                  {r.cta}
                  <div style={{ width: 28, height: 28, border: `0.5px solid ${C.border}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={13} color={C.text} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: C.softGray, marginTop: '2rem' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: C.text, textDecoration: 'none', fontWeight: 500 }}>Sign in</a>
          </p>
        </div>
      </div>
    );
  }

  // ── Shared Identity step (Step 1) ──
  const renderIdentityStep = (isTalent: boolean) => (
    <>
      <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 1 of 5</p>
      <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Your identity</h2>
      <p style={{ fontSize: 13, color: C.softGray, marginBottom: '2.5rem', lineHeight: 1.6 }}>
        {isTalent
          ? 'The foundation of your professional profile on MGNOVA.'
          : "You're joining as a Visionary — a business or creative studio seeking elite talent."}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Full name">
          <TextInput value={form.fullName} onChange={v => set('fullName', v)} placeholder={isTalent ? 'Alexandra Moore' : 'Jordan Ellis'} />
        </Field>
        <Field label={`Date of birth ${isTalent ? '(16+ required)' : '(18+ required)'}`}>
          <TextInput type="date" value={form.dob} onChange={v => set('dob', v)} max={maxDobForAge(isTalent ? 16 : 18)} />
        </Field>
      </div>
      <AgeBanner dob={form.dob} role={role} />
      <Field label="Email address">
        <TextInput value={form.email} onChange={v => set('email', v)} placeholder={isTalent ? 'alex@studio.io' : 'jordan@aureliangroup.com'} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Password">
          <TextInput type="password" value={form.password} onChange={v => set('password', v)} placeholder="Min. 8 characters" />
        </Field>
        <Field label="Confirm password">
          <TextInput type="password" value={form.confirmPassword} onChange={v => set('confirmPassword', v)} placeholder="Repeat password" />
        </Field>
        <Field label="Country">
          <TextInput value={form.country} onChange={v => set('country', v)} placeholder={isTalent ? 'India' : 'United Kingdom'} />
        </Field>
        <Field label="Timezone">
          <TextInput value={form.timezone} onChange={v => set('timezone', v)} placeholder={isTalent ? 'IST (UTC+5:30)' : 'GMT (UTC+0)'} />
        </Field>
      </div>
      <Btn onClick={() => setStep(2)} disabled={!dobOk(form.dob)}>Continue</Btn>
      {!dobOk(form.dob) && form.dob && (
        <p style={{ fontSize: 11, color: C.copper, textAlign: 'center', marginTop: 8 }}>
          {ageError(form.dob, role) || 'Please enter a valid date of birth to continue.'}
        </p>
      )}
      <Btn secondary onClick={() => setRole(null)}>← Back</Btn>
    </>
  );

  // ── Parse progress display ──
  const renderParseProgress = (states: string[]) => (
    parseStep >= 0 ? (
      <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', background: C.white }}>
        {states.map((s, i) => {
          // For OCR step (index 2), show live status
          const label = (i === 1 && ocrStatus) ? ocrStatus : s;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < states.length - 1 ? `0.5px solid ${C.inputBg}` : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `0.5px solid ${i <= parseStep ? C.green : C.border}`, background: i < parseStep ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i < parseStep
                  ? <Check size={12} color={C.white} />
                  : i === parseStep && parsing
                    ? <Loader size={12} color={C.softGray} style={{ animation: 'spin 1s linear infinite' }} />
                    : <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.border, display: 'inline-block' }} />}
              </div>
              <span style={{ fontSize: 13, color: i <= parseStep ? C.text : C.softGray }}>{label}</span>
            </div>
          );
        })}
      </div>
    ) : null
  );

  // ── Talent flow ──
  if (role === 'talent') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, padding: '2rem 1rem' }}>
        <div style={wrap}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.softGray, marginBottom: '3rem' }}>MGNOVA · Talent</p>
          <ProgressBar step={step} totalSteps={totalSteps} />
          {error && <p style={{ color: C.copper, fontSize: 13, marginBottom: '1rem' }}>{error}</p>}

          {step === 1 && renderIdentityStep(true)}

          {step === 2 && (
            <>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 2 of 5</p>
              <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Your expertise</h2>
              <p style={{ fontSize: 13, color: C.softGray, marginBottom: '2.5rem', lineHeight: 1.6 }}>Tell us about your professional domain and how you work best.</p>
              <Field label="Primary role"><Chips options={TALENT_ROLES} value={form.primaryRole} onSelect={v => set('primaryRole', v)} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1.25rem' }}>
                <Field label="Years of experience"><TextInput value={form.yearsExp} onChange={v => set('yearsExp', v)} placeholder="6" /></Field>
                <Field label="Industry focus"><SelectInput value={form.industry} onChange={v => set('industry', v)} options={INDUSTRIES} /></Field>
                <Field label="Portfolio URL"><TextInput value={form.portfolioUrl} onChange={v => set('portfolioUrl', v)} placeholder="yourportfolio.com" /></Field>
                <Field label="LinkedIn URL"><TextInput value={form.linkedinUrl} onChange={v => set('linkedinUrl', v)} placeholder="linkedin.com/in/alex" /></Field>
              </div>
              <Field label="Preferred collaboration">
                <div style={{ marginTop: 4 }}><Chips options={COLLAB_TYPES} value={form.collabType} onSelect={v => set('collabType', v)} /></div>
              </Field>
              <Btn onClick={() => setStep(3)}>Continue</Btn>
              <Btn secondary onClick={() => setStep(1)}>← Back</Btn>
            </>
          )}

          {step === 3 && (
            <>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 3 of 5</p>
              <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Resume & AI parsing</h2>
              <p style={{ fontSize: 13, color: C.softGray, marginBottom: '0.75rem', lineHeight: 1.6 }}>
                Upload your resume. Images are processed with real OCR, PDFs/DOCX via AI document parsing. You decide what data to keep.
              </p>

              {/* Format badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'PDF', bg: '#fdf0ee', color: C.copper, border: C.dust, note: 'AI parsed' },
                  { label: 'DOCX', bg: '#eef3ee', color: C.green, border: '#a8c4aa', note: 'AI parsed' },
                  { label: 'DOC', bg: '#eef3ee', color: C.green, border: '#a8c4aa', note: 'AI parsed' },
                  { label: 'JPG / PNG', bg: C.inputBg, color: C.softGray, border: C.border, note: 'OCR' },
                ].map(fmt => (
                  <div key={fmt.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: fmt.bg, color: fmt.color, border: `0.5px solid ${fmt.border}`, letterSpacing: '0.08em', fontWeight: 500 }}>{fmt.label}</span>
                    <span style={{ fontSize: 10, color: C.softGray }}>{fmt.note}</span>
                  </div>
                ))}
              </div>

              <input ref={fileInputRef} type="file" accept={ACCEPTED_EXT} style={{ display: 'none' }} onChange={handleFileChange} />

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{ border: `0.5px dashed ${fileTypeError ? C.copper : C.dust}`, borderRadius: 12, padding: '3rem 2rem', textAlign: 'center', background: fileTypeError ? '#fdf0ee' : C.inputBg, cursor: 'pointer', marginBottom: '1.5rem', transition: 'background 0.2s' }}
              >
                {resumeFile && !fileTypeError ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: C.white, border: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {getFileIcon(resumeFile)}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>{resumeFile.name}</p>
                      <p style={{ fontSize: 12, color: C.softGray }}>{getFileTypeLabel(resumeFile)} · {(resumeFile.size / 1024).toFixed(0)} KB · Click to replace</p>
                    </div>
                    {resumePreview && (
                      <img src={resumePreview} alt="Resume preview" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, marginTop: 4, objectFit: 'cover', border: `0.5px solid ${C.border}` }} />
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <Upload size={28} color={fileTypeError ? C.copper : C.dust} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: fileTypeError ? C.copper : C.text, marginBottom: 4 }}>
                        {fileTypeError || 'Drop your resume here'}
                      </p>
                      <p style={{ fontSize: 12, color: C.softGray }}>PDF, DOCX, DOC, JPG or PNG · Max 10MB · Click to browse</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Parse progress */}
              {renderParseProgress(TALENT_PARSE_STATES)}

              {/* Extracted data panel */}
              {parsedResume && !parsing && (
                <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ background: C.inputBg, padding: '1rem 1.5rem', borderBottom: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.dust, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: C.white, flexShrink: 0 }}>
                        {(parsedResume.fullName || '?').split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{parsedResume.fullName || '—'}</p>
                        <p style={{ fontSize: 11, color: C.softGray }}>{parsedResume.title || 'Extracted from resume'}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: '#eef3ee', color: C.green, border: `0.5px solid #a8c4aa`, letterSpacing: '0.08em' }}>
                      {isImageFile(resumeFile!) ? 'OCR extracted' : 'AI extracted'}
                    </span>
                  </div>
                  <div style={{ padding: '0.75rem 1.5rem', background: C.bg, borderBottom: `0.5px solid ${C.border}` }}>
                    <p style={{ fontSize: 12, color: C.softGray, lineHeight: 1.5 }}>Toggle each field to choose what gets imported into your profile.</p>
                  </div>
                  <div style={{ padding: '0.5rem 1.5rem 1rem', background: C.white }}>
                    <ExtractedRow label="Full name" value={parsedResume.fullName} used={usedFields.fullName} onToggle={() => toggleUsed('fullName')} />
                    <ExtractedRow label="Email" value={parsedResume.email} used={usedFields.email} onToggle={() => toggleUsed('email')} />
                    <ExtractedRow label="Location" value={parsedResume.location} used={usedFields.location} onToggle={() => toggleUsed('location')} />
                    <ExtractedRow label="Job title" value={parsedResume.title} used={usedFields.title} onToggle={() => toggleUsed('title')} />
                    <ExtractedRow label="Years of experience" value={parsedResume.yearsExp} used={usedFields.yearsExp} onToggle={() => toggleUsed('yearsExp')} />
                    <ExtractedRow label="Languages" value={parsedResume.languages} used={usedFields.languages} onToggle={() => toggleUsed('languages')} />
                    <ExtractedRow label="Education" value={parsedResume.education} used={usedFields.education} onToggle={() => toggleUsed('education')} />
                    <ExtractedRow label="Skills" value={parsedResume.skills} used={usedFields.skills} onToggle={() => toggleUsed('skills')} />
                    <ExtractedRow label="Summary" value={parsedResume.summary} used={usedFields.summary} onToggle={() => toggleUsed('summary')} />
                  </div>
                  <div style={{ padding: '0 1.5rem 1.25rem', background: C.white }}>
                    <button type="button" onClick={applyExtractedData} style={{ width: '100%', padding: '11px', background: C.green, color: C.white, border: 'none', borderRadius: 8, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                      Apply selected fields to profile
                    </button>
                  </div>
                </div>
              )}

              <Btn onClick={() => setStep(4)}>Continue</Btn>
              <Btn secondary onClick={() => setStep(2)}>← Back</Btn>
            </>
          )}

          {step === 4 && (
            <>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 4 of 5</p>
              <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Professional insights</h2>
              <p style={{ fontSize: 13, color: C.softGray, marginBottom: '2.5rem', lineHeight: 1.6 }}>Help clients understand how you like to engage.</p>
              <Field label="Availability"><Chips options={AVAILABILITY} value={form.availability} onSelect={v => set('availability', v)} /></Field>
              <div style={{ marginTop: '1.25rem' }}>
                <Field label="Preferred project size"><Chips options={PROJECT_SIZES} value={form.projectSize} onSelect={v => set('projectSize', v)} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1.25rem' }}>
                <Field label="Hourly rate (optional)"><TextInput value={form.hourlyRate} onChange={v => set('hourlyRate', v)} placeholder="$120 / hr" /></Field>
                <Field label="Languages spoken"><TextInput value={form.languages} onChange={v => set('languages', v)} placeholder="English, Tamil" /></Field>
              </div>
              <Btn onClick={() => setStep(5)}>Continue</Btn>
              <Btn secondary onClick={() => setStep(3)}>← Back</Btn>
            </>
          )}

          {step === 5 && (
            <>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 5 of 5</p>
              <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Your professional identity</h2>
              <p style={{ fontSize: 13, color: C.softGray, marginBottom: '2rem', lineHeight: 1.6 }}>Review your curated profile before entering the platform.</p>
              <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ background: C.inputBg, padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.dust, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500, color: C.white, flexShrink: 0 }}>
                    {form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AM'}
                  </div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 500, color: C.text }}>{form.fullName || 'Your Name'}</p>
                    <p style={{ fontSize: 12, color: C.softGray, marginTop: 2 }}>{form.primaryRole || 'Professional'} · {form.yearsExp ? `${form.yearsExp} years experience` : ''}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: '#fdf6e3', color: C.gold, border: `0.5px solid ${C.gold}` }}>Reputation starter</span>
                      <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: C.bg, color: C.softGray, border: `0.5px solid ${C.border}` }}>{form.availability || 'Available'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1.5rem 2rem', background: C.white }}>
                  <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.softGray, marginBottom: 10 }}>Profile summary</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.5rem' }}>
                    {[form.primaryRole, form.collabType, form.availability, form.country].filter(Boolean).map((t, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, background: C.inputBg, border: `0.5px solid ${C.border}`, color: C.softGray }}>{t}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.softGray, marginBottom: 8 }}>Profile strength</p>
                  <div style={{ height: 3, background: C.inputBg, borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, [form.fullName, form.email, form.primaryRole, form.collabType, form.availability, form.country].filter(Boolean).length * 16)}%`, background: C.green, borderRadius: 2, transition: 'width 0.6s' }} />
                  </div>
                </div>
              </div>
              <Btn onClick={handleSubmit}>Enter MGNOVA</Btn>
              <Btn secondary onClick={() => setStep(4)}>← Back</Btn>
            </>
          )}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Visionary flow ──
  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '2rem 1rem' }}>
      <div style={wrap}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.softGray, marginBottom: '3rem' }}>MGNOVA · Visionary</p>
        <ProgressBar step={step} totalSteps={totalSteps} />
        {error && <p style={{ color: C.copper, fontSize: 13, marginBottom: '1rem' }}>{error}</p>}

        {step === 1 && renderIdentityStep(false)}

        {step === 2 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 2 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Your organization</h2>
            <p style={{ fontSize: 13, color: C.softGray, marginBottom: '2.5rem', lineHeight: 1.6 }}>Tell us about your company or studio.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Company / studio name"><TextInput value={form.companyName} onChange={v => set('companyName', v)} placeholder="Aurelian Group" /></Field>
              <Field label="Industry"><SelectInput value={form.industry} onChange={v => set('industry', v)} options={INDUSTRIES} /></Field>
            </div>
            <Field label="Team size"><Chips options={TEAM_SIZES} value={form.teamSize} onSelect={v => set('teamSize', v)} /></Field>
            <div style={{ marginTop: '1.25rem' }}>
              <Field label="Hiring frequency"><Chips options={HIRING_FREQ} value={form.hiringFreq} onSelect={v => set('hiringFreq', v)} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '0.5rem' }}>
              <Field label="Website URL"><TextInput value={form.websiteUrl} onChange={v => set('websiteUrl', v)} placeholder="aureliangroup.com" /></Field>
              <Field label="LinkedIn URL"><TextInput value={form.linkedinUrl} onChange={v => set('linkedinUrl', v)} placeholder="linkedin.com/company/..." /></Field>
            </div>
            <Btn onClick={() => setStep(3)}>Continue</Btn>
            <Btn secondary onClick={() => setStep(1)}>← Back</Btn>
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 3 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Business verification</h2>
            <p style={{ fontSize: 13, color: C.softGray, marginBottom: '2.5rem', lineHeight: 1.6 }}>Optional — upload documents to fast-track your verified badge.</p>
            {['Company deck', 'Brand guidelines', 'Business registration'].map(docName => (
              <div key={docName} onClick={simulateParse} style={{ border: `0.5px dashed ${C.dust}`, borderRadius: 10, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, cursor: 'pointer', background: C.inputBg }}>
                <Upload size={18} color={C.dust} />
                <p style={{ fontSize: 13, color: C.softGray }}>{docName}</p>
              </div>
            ))}
            {parseStep >= 0 && (
              <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '1.25rem', marginTop: '1rem', background: C.white }}>
                {['Verifying organization…', 'Analyzing company information…', 'Building workspace identity…'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? `0.5px solid ${C.inputBg}` : 'none' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `0.5px solid ${i < parseStep ? C.green : C.border}`, background: i < parseStep ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {i < parseStep && <Check size={10} color={C.white} />}
                    </div>
                    <span style={{ fontSize: 13, color: i < parseStep ? C.text : C.softGray }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            <Btn onClick={() => setStep(4)}>Continue</Btn>
            <Btn secondary onClick={() => setStep(2)}>← Back</Btn>
          </>
        )}

        {step === 4 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 4 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Collaboration preferences</h2>
            <p style={{ fontSize: 13, color: C.softGray, marginBottom: '2.5rem', lineHeight: 1.6 }}>Help us match you with the right talent and project structures.</p>
            <Field label="Preferred talent categories">
              <Chips options={TALENT_CATS} value={form.talentCats} multi onSelect={v => toggleArr('talentCats', v)} />
            </Field>
            <div style={{ marginTop: '1.25rem' }}>
              <Field label="Typical project budget"><Chips options={BUDGETS} value={form.budget} onSelect={v => set('budget', v)} /></Field>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <Field label="Preferred contract duration"><Chips options={CONTRACT_DURATIONS} value={form.contractDuration} onSelect={v => set('contractDuration', v)} /></Field>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <Field label="Workflow preference"><Chips options={WORKFLOWS} value={form.workflow} onSelect={v => set('workflow', v)} /></Field>
            </div>
            <Btn onClick={() => setStep(5)}>Continue</Btn>
            <Btn secondary onClick={() => setStep(3)}>← Back</Btn>
          </>
        )}

        {step === 5 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.softGray, marginBottom: '0.4rem' }}>Step 5 of 5</p>
            <h2 style={{ fontSize: 24, fontWeight: 500, color: C.text, marginBottom: '0.4rem' }}>Your workspace</h2>
            <p style={{ fontSize: 13, color: C.softGray, marginBottom: '2rem', lineHeight: 1.6 }}>Review your workspace profile before entering the platform.</p>
            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ background: C.inputBg, padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500, color: C.white, flexShrink: 0 }}>
                  {form.companyName?.[0]?.toUpperCase() || 'V'}
                </div>
                <div>
                  <p style={{ fontSize: 17, fontWeight: 500, color: C.text }}>{form.companyName || 'Your Company'}</p>
                  <p style={{ fontSize: 12, color: C.softGray, marginTop: 2 }}>{form.industry} · {form.teamSize} team</p>
                  <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: '#eef3ee', color: C.green, border: `0.5px solid #a8c4aa`, display: 'inline-block', marginTop: 8 }}>Visionary workspace</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem 2rem', background: C.white }}>
                <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.softGray, marginBottom: 10 }}>Preferences</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[form.workflow, form.budget, form.contractDuration, ...form.talentCats.slice(0, 3)].filter(Boolean).map((t, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, background: C.inputBg, border: `0.5px solid ${C.border}`, color: C.softGray }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <Btn onClick={handleSubmit}>Enter platform</Btn>
            <Btn secondary onClick={() => setStep(4)}>← Back</Btn>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}