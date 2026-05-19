
export const freelancers = [
  {
    id: 'f1',
    name: 'Julian Vance',
    role: 'Principal Strategy Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 4.9,
    projects: 124,
    earnings: '$240k+',
    badge: 'Elite Contributor',
    skills: ['Strategy', 'Fintech', 'Operations'],
    bio: 'Ex-McKinsey strategist focused on scaling Series B startups through architectural efficiency.'
  },
  {
    id: 'f2',
    name: 'Elena Rossi',
    role: 'Senior Identity Designer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 5.0,
    projects: 86,
    earnings: '$180k+',
    badge: 'Verified Expert',
    skills: ['Brand Identity', 'UX/UI', 'Editorial'],
    bio: 'Boutique design services for premium lifestyle brands across Europe and North America.'
  },
  {
    id: 'f3',
    name: 'Marcus Thorne',
    role: 'Full-Stack Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 4.8,
    projects: 210,
    earnings: '$320k+',
    badge: 'Top Rated',
    skills: ['React', 'Node.js', 'AWS Architect'],
    bio: 'Building hyper-scalable web ecosystems with a focus on security and performance.'
  }
];

export const projects = [
  {
    id: 'p1',
    title: 'Brand Metamorphosis for Luxury Real Estate',
    client: 'The Aurelian Group',
    budget: '$15,000',
    status: 'In Progress',
    deadline: 'June 12, 2026',
    milestones: [
      { id: 'm1', label: 'Discovery & Moodboards', status: 'Completed', amount: '$3,000' },
      { id: 'm2', label: 'Primary Brand Identity', status: 'In Progress', amount: '$7,000' },
      { id: 'm3', label: 'Collateral & Guidelines', status: 'Pending', amount: '$5,000' }
    ]
  },
  {
    id: 'p2',
    title: 'Custom Fintech Dashboard for VC Fund',
    client: 'Nexo Capital',
    budget: '$24,500',
    status: 'Application Phase',
    deadline: 'July 05, 2026',
    activeProposals: 12,
    avgBid: '$22,000'
  }
];

export const transactions = [
  { id: 't1', type: 'Credit', amount: '$4,500.00', date: 'May 15, 2026', status: 'Settled', project: 'Nexo Capital Rebrand' },
  { id: 't2', type: 'Debit', amount: '$250.00', date: 'May 12, 2026', status: 'Settled', project: 'Platform Service Fee' },
  { id: 't3', type: 'Pending', amount: '$7,000.00', date: 'May 10, 2026', status: 'Escrow', project: 'Aurelian Identity' }
];

export const notifications = [
  { id: 'n1', title: 'Payment Secured', message: 'The Aurelian Group has funded Milestone 2: Brand Identity.', time: '2h ago', type: 'finance' },
  { id: 'n2', title: 'New Proposal', message: 'You received a new proposal for Aurelian Identity.', time: '4h ago', type: 'alert' },
  { id: 'n3', title: 'AI Match Found', message: 'We found 3 freelancers matching your new project specs.', time: '1d ago', type: 'system' }
];
