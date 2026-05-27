/**
 * seedFirestore.ts
 * Run once to seed MGNOVA with 5 talent + 5 client profiles,
 * plus projects, proposals, contracts, milestones, and payments.
 *
 * Usage (from project root):
 *   npx ts-node --esm src/scripts/seedFirestore.ts
 *   — OR —
 *   import { seedAll } from './seedFirestore'; seedAll();
 *
 * ⚠️  Requires FIREBASE_SERVICE_ACCOUNT env var (path to service-account JSON)
 *     when running from Node.  In the browser, just call seedAll() directly
 *     from a one-off admin page — it uses your existing firebase import.
 */

import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase'; // adjust path as needed

// ─────────────────────────────────────────────────────────────────────────────
// Talent profiles  (role: 'freelancer')
// ─────────────────────────────────────────────────────────────────────────────
const TALENT_SEEDS = [
  {
    uid: 'seed_talent_001',
    role: 'freelancer',
    fullName: 'Alice Mercer',
    email: 'alice.mercer@mgnova.io',
    dob: '1991-03-14',
    age: 34,
    country: 'United Kingdom',
    timezone: 'GMT (UTC+0)',
    primaryRole: 'Product Designer',
    yearsExp: '7',
    industry: 'Design & Branding',
    portfolioUrl: 'alicemercer.design',
    linkedinUrl: 'linkedin.com/in/alicemercer',
    collabType: 'Long-Term Projects',
    availability: 'Part-Time',
    projectSize: 'Medium ($5k–$25k)',
    hourlyRate: '$120 / hr',
    languages: 'English, French',
    skills: ['UI Design', 'Figma', 'Framer', 'Prototyping', 'Design Systems'],
    education: 'BA Interaction Design — Royal College of Art',
    summary: "Award-winning UI designer specialising in SaaS products and fintech. I've shipped interfaces for 50k+ user platforms and love systems-thinking as much as pixel-perfect craft.",
    reputationScore: 4.9,
    completedProjects: 43,
    successRate: 98,
    responseTime: '< 1h',
    isAdmin: false,
  },
  {
    uid: 'seed_talent_002',
    role: 'freelancer',
    fullName: 'Marcus Webb',
    email: 'marcus.webb@mgnova.io',
    dob: '1993-07-22',
    age: 32,
    country: 'Germany',
    timezone: 'CET (UTC+1)',
    primaryRole: 'Frontend Engineer',
    yearsExp: '6',
    industry: 'Technology',
    portfolioUrl: 'marcuswebb.dev',
    linkedinUrl: 'linkedin.com/in/marcuswebb',
    collabType: 'Contract Work',
    availability: 'Full-Time',
    projectSize: 'Large ($25k–$100k)',
    hourlyRate: '$110 / hr',
    languages: 'English, German',
    skills: ['React', 'Node.js', 'Firebase', 'TypeScript', 'GraphQL'],
    education: 'MSc Computer Science — TU Berlin',
    summary: 'Full-stack engineer with a strong focus on React ecosystems and Firebase. I build fast, scalable products from MVP to production. Open-source contributor with 2k+ GitHub stars.',
    reputationScore: 4.8,
    completedProjects: 37,
    successRate: 96,
    responseTime: '< 2h',
    isAdmin: false,
  },
  {
    uid: 'seed_talent_003',
    role: 'freelancer',
    fullName: 'Priya Nair',
    email: 'priya.nair@mgnova.io',
    dob: '1989-11-05',
    age: 36,
    country: 'India',
    timezone: 'IST (UTC+5:30)',
    primaryRole: 'UX Researcher',
    yearsExp: '8',
    industry: 'Technology',
    portfolioUrl: 'priyanair.co',
    linkedinUrl: 'linkedin.com/in/priyanair',
    collabType: 'Startup Collaboration',
    availability: 'Contract Only',
    projectSize: 'Medium ($5k–$25k)',
    hourlyRate: '$95 / hr',
    languages: 'English, Hindi, Tamil',
    skills: ['Product Strategy', 'UX Research', 'Figma', 'User Testing', 'Roadmapping'],
    education: 'MBA Product Management — IIM Bangalore',
    summary: 'I bridge business goals with user needs. Former product lead at Swiggy and Razorpay. I run end-to-end discovery sprints that reduce rework by 40% on average.',
    reputationScore: 4.7,
    completedProjects: 29,
    successRate: 97,
    responseTime: '< 3h',
    isAdmin: false,
  },
  {
    uid: 'seed_talent_004',
    role: 'freelancer',
    fullName: 'James Okafor',
    email: 'james.okafor@mgnova.io',
    dob: '1995-02-18',
    age: 31,
    country: 'Nigeria',
    timezone: 'WAT (UTC+1)',
    primaryRole: 'AI Developer',
    yearsExp: '5',
    industry: 'Technology',
    portfolioUrl: 'jamesokafor.io',
    linkedinUrl: 'linkedin.com/in/jamesokafor',
    collabType: 'Contract Work',
    availability: 'Open to Opportunities',
    projectSize: 'Small (< $5k)',
    hourlyRate: '$85 / hr',
    languages: 'English, Yoruba',
    skills: ['Flutter', 'iOS', 'Android', 'Dart', 'Swift'],
    education: 'BSc Software Engineering — University of Lagos',
    summary: "Cross-platform mobile specialist. I've built apps from 0 to 100k downloads on the Play Store and App Store. Passionate about performance and offline-first architecture.",
    reputationScore: 4.6,
    completedProjects: 22,
    successRate: 94,
    responseTime: '< 4h',
    isAdmin: false,
  },
  {
    uid: 'seed_talent_005',
    role: 'freelancer',
    fullName: 'Sofia Alvarez',
    email: 'sofia.alvarez@mgnova.io',
    dob: '1992-09-30',
    age: 33,
    country: 'Spain',
    timezone: 'CET (UTC+1)',
    primaryRole: 'Motion Designer',
    yearsExp: '6',
    industry: 'Design & Branding',
    portfolioUrl: 'sofiaalvarez.studio',
    linkedinUrl: 'linkedin.com/in/sofiaalvarez',
    collabType: 'Long-Term Projects',
    availability: 'Part-Time',
    projectSize: 'Medium ($5k–$25k)',
    hourlyRate: '$100 / hr',
    languages: 'English, Spanish, Portuguese',
    skills: ['Brand Identity', 'Motion Design', 'After Effects', 'Illustrator', '3D'],
    education: 'BA Graphic Design — Elisava Barcelona',
    summary: "I craft brand identities and motion systems that stick. Clients include startups, fashion labels, and global agencies. Work featured in Awwwards and Behance's Branding series.",
    reputationScore: 4.8,
    completedProjects: 51,
    successRate: 99,
    responseTime: '< 2h',
    isAdmin: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Client / Visionary profiles  (role: 'client')
// ─────────────────────────────────────────────────────────────────────────────
const CLIENT_SEEDS = [
  {
    uid: 'seed_client_001',
    role: 'client',
    fullName: 'Jordan Ellis',
    email: 'jordan@aureliangroup.com',
    dob: '1985-06-12',
    age: 40,
    country: 'United Kingdom',
    timezone: 'GMT (UTC+0)',
    companyName: 'Aurelian Group',
    industry: 'Finance',
    teamSize: '11–50',
    websiteUrl: 'aureliangroup.com',
    linkedinUrl: 'linkedin.com/company/aureliangroup',
    hiringFreq: 'Monthly',
    talentCats: ['Designers', 'Engineers'],
    budget: '$25k–$100k',
    contractDuration: '3–6 months',
    workflow: 'Milestone-Based',
    isAdmin: false,
  },
  {
    uid: 'seed_client_002',
    role: 'client',
    fullName: 'Nadia Kovacs',
    email: 'nadia@velvetlabs.io',
    dob: '1990-04-03',
    age: 35,
    country: 'Hungary',
    timezone: 'CET (UTC+1)',
    companyName: 'Velvet Labs',
    industry: 'Technology',
    teamSize: '2–10',
    websiteUrl: 'velvetlabs.io',
    linkedinUrl: 'linkedin.com/company/velvetlabs',
    hiringFreq: 'Weekly',
    talentCats: ['Engineers', 'AI Specialists'],
    budget: '$5k–$25k',
    contractDuration: '1–3 months',
    workflow: 'Agile Collaboration',
    isAdmin: false,
  },
  {
    uid: 'seed_client_003',
    role: 'client',
    fullName: 'Rajan Mehta',
    email: 'rajan@prismaworks.in',
    dob: '1980-12-20',
    age: 45,
    country: 'India',
    timezone: 'IST (UTC+5:30)',
    companyName: 'Prisma Works',
    industry: 'Architecture',
    teamSize: '50–200',
    websiteUrl: 'prismaworks.in',
    linkedinUrl: 'linkedin.com/company/prismaworks',
    hiringFreq: 'Occasionally',
    talentCats: ['Designers', 'Motion Artists'],
    budget: '$25k–$100k',
    contractDuration: '6+ months',
    workflow: 'Long-Term Retainers',
    isAdmin: false,
  },
  {
    uid: 'seed_client_004',
    role: 'client',
    fullName: 'Camille Fontaine',
    email: 'camille@maison-fontaine.fr',
    dob: '1987-08-15',
    age: 38,
    country: 'France',
    timezone: 'CET (UTC+1)',
    companyName: 'Maison Fontaine',
    industry: 'Fashion',
    teamSize: '11–50',
    websiteUrl: 'maison-fontaine.fr',
    linkedinUrl: 'linkedin.com/company/maisonfontaine',
    hiringFreq: 'Monthly',
    talentCats: ['Designers', 'Motion Artists', 'Strategists'],
    budget: '$5k–$25k',
    contractDuration: '1–3 months',
    workflow: 'Milestone-Based',
    isAdmin: false,
  },
  {
    uid: 'seed_client_005',
    role: 'client',
    fullName: 'Derek Osei',
    email: 'derek@apexventures.co',
    dob: '1978-01-28',
    age: 48,
    country: 'Ghana',
    timezone: 'GMT (UTC+0)',
    companyName: 'Apex Ventures',
    industry: 'Finance',
    teamSize: '200+',
    websiteUrl: 'apexventures.co',
    linkedinUrl: 'linkedin.com/company/apexventures',
    hiringFreq: 'Ongoing',
    talentCats: ['Engineers', 'Strategists', 'Researchers'],
    budget: '$100k+',
    contractDuration: '6+ months',
    workflow: 'Enterprise Scaling',
    isAdmin: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed projects + contracts + milestones for client_001
// ─────────────────────────────────────────────────────────────────────────────
const SEED_PROJECTS = [
  {
    id: 'seed_proj_001',
    clientId: 'seed_client_001',
    title: 'Brand Refresh — Aurelian Website',
    budget: 18000,
    status: 'active',
    createdAt: '2026-04-10',
  },
  {
    id: 'seed_proj_002',
    clientId: 'seed_client_001',
    title: 'Mobile App MVP',
    budget: 28000,
    status: 'active',
    createdAt: '2026-04-22',
  },
  {
    id: 'seed_proj_003',
    clientId: 'seed_client_002',
    title: 'AI Integration — Velvet Dashboard',
    budget: 12000,
    status: 'active',
    createdAt: '2026-05-01',
  },
];

const SEED_CONTRACTS = [
  {
    id: 'seed_cont_001',
    clientId: 'seed_client_001',
    talentId: 'seed_talent_001', // Alice Mercer
    projectId: 'seed_proj_001',
    status: 'in_progress',
    milestones: [
      { milestoneId: 'ms_001', title: 'Discovery & Wireframes', amount: 3500, status: 'paid' },
      { milestoneId: 'ms_002', title: 'Visual Design – Phase 1', amount: 5000, status: 'pending' },
      { milestoneId: 'ms_003', title: 'Visual Design – Phase 2', amount: 5000, status: 'pending' },
      { milestoneId: 'ms_004', title: 'Dev Handoff & QA', amount: 4500, status: 'pending' },
    ],
  },
  {
    id: 'seed_cont_002',
    clientId: 'seed_client_001',
    talentId: 'seed_talent_002', // Marcus Webb
    projectId: 'seed_proj_002',
    status: 'in_progress',
    milestones: [
      { milestoneId: 'ms_005', title: 'Backend API & Auth', amount: 8000, status: 'paid' },
      { milestoneId: 'ms_006', title: 'Frontend — Core Screens', amount: 10000, status: 'pending' },
      { milestoneId: 'ms_007', title: 'Testing & App Store Submit', amount: 10000, status: 'pending' },
    ],
  },
  {
    id: 'seed_cont_003',
    clientId: 'seed_client_002',
    talentId: 'seed_talent_004', // James Okafor
    projectId: 'seed_proj_003',
    status: 'in_progress',
    milestones: [
      { milestoneId: 'ms_008', title: 'API Integration Sprint', amount: 4000, status: 'pending' },
      { milestoneId: 'ms_009', title: 'Dashboard Components', amount: 5000, status: 'pending' },
      { milestoneId: 'ms_010', title: 'Launch & Monitoring', amount: 3000, status: 'pending' },
    ],
  },
];

const SEED_PAYMENTS = [
  { clientId: 'seed_client_001', projectId: 'seed_proj_001', amount: 3500, status: 'released', method: 'Wallet Escrow', description: 'Discovery & Wireframes — Alice Mercer' },
  { clientId: 'seed_client_001', projectId: 'seed_proj_002', amount: 8000, status: 'released', method: 'Wallet Escrow', description: 'Backend API & Auth — Marcus Webb' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main seed function — call this once from an admin page
// ─────────────────────────────────────────────────────────────────────────────
export async function seedAll() {
  console.log('🌱 Starting MGNOVA Firestore seed…');

  // ── Users (talent) ─────────────────────────────────────────────────────────
  console.log('Writing talent profiles…');
  for (const talent of TALENT_SEEDS) {
    const { uid, ...data } = talent;
    await setDoc(doc(db, 'users', uid), { ...data, createdAt: serverTimestamp() });
    console.log(`  ✓ ${talent.fullName} (talent)`);
  }

  // ── Users (clients) ────────────────────────────────────────────────────────
  console.log('Writing client profiles…');
  for (const client of CLIENT_SEEDS) {
    const { uid, ...data } = client;
    await setDoc(doc(db, 'users', uid), { ...data, createdAt: serverTimestamp() });
    console.log(`  ✓ ${client.fullName} — ${client.companyName} (client)`);
  }

  // ── Projects ───────────────────────────────────────────────────────────────
  console.log('Writing projects…');
  for (const proj of SEED_PROJECTS) {
    const { id, ...data } = proj;
    await setDoc(doc(db, 'projects', id), { ...data, createdAtTs: serverTimestamp() });
    console.log(`  ✓ ${proj.title}`);
  }

  // ── Contracts + milestones ─────────────────────────────────────────────────
  console.log('Writing contracts & milestones…');
  for (const contract of SEED_CONTRACTS) {
    const { id, ...data } = contract;
    await setDoc(doc(db, 'contracts', id), { ...data, createdAtTs: serverTimestamp() });
    console.log(`  ✓ Contract ${id} (${contract.milestones.length} milestones)`);
  }

  // ── Payments ───────────────────────────────────────────────────────────────
  console.log('Writing payments…');
  for (const payment of SEED_PAYMENTS) {
    await addDoc(collection(db, 'payments'), { ...payment, createdAtTs: serverTimestamp() });
    console.log(`  ✓ $${payment.amount} — ${payment.description}`);
  }

  // ── Proposals ─────────────────────────────────────────────────────────────
  console.log('Writing proposals…');
  const proposals = [
    { clientId: 'seed_client_001', projectId: 'seed_proj_001', talentId: 'seed_talent_001', talentName: 'Alice Mercer',  matchScore: 95, proposedBudget: 16200, status: 'accepted' },
    { clientId: 'seed_client_001', projectId: 'seed_proj_001', talentId: 'seed_talent_005', talentName: 'Sofia Alvarez', matchScore: 78, proposedBudget: 14000, status: 'received' },
    { clientId: 'seed_client_001', projectId: 'seed_proj_002', talentId: 'seed_talent_002', talentName: 'Marcus Webb',   matchScore: 89, proposedBudget: 26000, status: 'accepted' },
    { clientId: 'seed_client_001', projectId: 'seed_proj_002', talentId: 'seed_talent_004', talentName: 'James Okafor',  matchScore: 74, proposedBudget: 22000, status: 'received' },
    { clientId: 'seed_client_002', projectId: 'seed_proj_003', talentId: 'seed_talent_002', talentName: 'Marcus Webb',   matchScore: 88, proposedBudget: 11500, status: 'received' },
    { clientId: 'seed_client_002', projectId: 'seed_proj_003', talentId: 'seed_talent_004', talentName: 'James Okafor',  matchScore: 82, proposedBudget: 11000, status: 'accepted' },
  ];
  for (const p of proposals) {
    await addDoc(collection(db, 'proposals'), { ...p, createdAtTs: serverTimestamp() });
    console.log(`  ✓ ${p.talentName} → ${p.projectId}`);
  }

  console.log('\n✅ Seed complete! Reload your dashboard.');
}

// ── Quick one-liner for browser console: ──────────────────────────────────────
// import { seedAll } from './seedFirestore'; seedAll();