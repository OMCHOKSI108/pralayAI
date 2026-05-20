/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Track {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface StudentProject {
  id: string;
  title: string;
  domain: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advance' | 'Expert';
  description: string;
  techStack: string[];
  milestones: { id: string; text: string; completed: boolean }[];
  githubUrl?: string;
  liveUrl?: string;
  screencastUrl?: string;
  screenshots?: string[];
  notes?: string;
  deployed?: boolean;
}

export interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  gradYear: string;
  domainInterest: string;
  skills: string[];
  githubProfile: string;
  linkedinProfile: string;
  resumeFileName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  appliedDate: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  projectId: string;
  projectName: string;
  domain: string;
  githubUrl: string;
  liveUrl: string;
  screencast?: string;
  screenshots: string[];
  notes: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'CHANGES_REQUESTED';
  submittedDate: string;
  feedback?: string;
  feedbackAuthor?: string;
  feedbackDate?: string;
}

export interface Resource {
  id: string;
  title: string;
  category: 'DSA Sheet' | 'Resume Templates' | 'Git and GitHub Handbook' | 'Deployment Guide' | 'Interview Preparation' | 'AI Prompts Book' | 'System Design Basics';
  description: string;
  url: string;
  badge?: string;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  fullName: string;
  avatar: string;
  domain: string;
  score: number;
  batch: string;
  featured: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  operator: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconType: string;
  unlocked: boolean;
}

export interface Certificate {
  id: string;
  studentName: string;
  projectName: string;
  domain: string;
  completionDate: string;
  hash: string;
}

// Initial Data Seeds
export const TRACKS: Track[] = [
  { id: 'fullstack', name: 'Full-Stack Development', description: 'Architecting high-concurrency client-server systems with real-time replication.', iconName: 'Layout' },
  { id: 'aiml', name: 'AI / ML Engineering', description: 'Integrating large language model chains, neural search embeddings, and prompt proxies.', iconName: 'Cpu' },
  { id: 'cyber', name: 'Cybersecurity', description: 'Building E2E Zero-Knowledge proof authentication cascades & compliance sandboxes.', iconName: 'Shield' },
  { id: 'devops', name: 'Devops & Cloud', description: 'Container orchestration, multi-stage deployment caches, and micro-kernel systems.', iconName: 'Layers' },
  { id: 'automation', name: 'Automation & Bots', description: 'Designing stateful event listeners, web scrapers, and headless orchestration loops.', iconName: 'Terminal' },
  { id: 'api', name: 'API Design & Integration', description: 'High-frequency telemetry routers, rate limit throttling matrices, and RPC adapters.', iconName: 'Network' }
];

export const INITIAL_PROJECTS: StudentProject[] = [
  {
    id: 'proj-1',
    title: 'Real-Time Cyber Threat Pipeline',
    domain: 'Cybersecurity',
    difficulty: 'Expert',
    description: 'Establish an end-to-end zero-day intake buffer and threat-graph resolution engine to ingest network payloads from simulated IoT edge devices.',
    techStack: ['Node.js', 'TypeScript', 'Docker', 'Redis', 'WebSockets'],
    milestones: [
      { id: 'm1', text: 'Set up socket listener routing ring buffers', completed: true },
      { id: 'm2', text: 'Construct ephemeral decryption handshake logic', completed: true },
      { id: 'm3', text: 'Verify threat-signature HMAC verification tags', completed: false },
      { id: 'm4', text: 'Render live reactive anomaly dashboard telemetry', completed: false }
    ],
    githubUrl: 'https://github.com/johnwick/cyber-threat-pipeline',
    liveUrl: 'https://threat-pipeline.hellware-sandbox.app',
    deployed: true
  },
  {
    id: 'proj-2',
    title: 'High-Frequency Clearance Ledger',
    domain: 'API Design & Integration',
    difficulty: 'Expert',
    description: 'Implement a cryptographically sealed private ledger verifying atomic transaction transfers with key rotation protocols.',
    techStack: ['Rust', 'WebSocket RPC', 'HMAC SHA-256', 'Pipelined Redis'],
    milestones: [
      { id: 'm1', text: 'Spin secure isolated state engines', completed: true },
      { id: 'm2', text: 'Establish automatic rotating cryptographic key chains', completed: true },
      { id: 'm3', text: 'Simulate high-frequency financial settlement cycles', completed: false }
    ],
    githubUrl: 'https://github.com/alice-crypto/clearance-ledger',
    liveUrl: 'https://apex-clearance.hellware-dev.net',
    deployed: true
  },
  {
    id: 'proj-3',
    title: 'Zero-Knowledge Genetic Portal',
    domain: 'Full-Stack Development',
    difficulty: 'Intermediate',
    description: 'A React and Node metadata browser protecting delicate patient genomes using client-side Field-Level Encryption algorithms.',
    techStack: ['React', 'Web Security API', 'AES-GCM-256', 'PostgreSQL'],
    milestones: [
      { id: 'm1', text: 'Construct key generation hooks inside browser memory', completed: true },
      { id: 'm2', text: 'Compile demographics blinds validation rules', completed: false },
      { id: 'm3', text: 'Implement automated analytical query quarantine firewalls', completed: false }
    ],
    githubUrl: 'https://github.com/clara-nano/genetic-zk-portal',
    liveUrl: 'https://sequence-guard.veridian.org',
    deployed: true
  },
  {
    id: 'proj-4',
    title: 'Isolated AI Prompt Proxy Guard',
    domain: 'AI / ML Engineering',
    difficulty: 'Intermediate',
    description: 'Establish a secure gateway intercepting prompts to remove corporate PII before communicating with public deep learning API clusters.',
    techStack: ['Python', 'FastAPI', 'Regex Classifiers', 'Vector Cache'],
    milestones: [
      { id: 'm1', text: 'Code inline sanitization parser mapping client secrets', completed: true },
      { id: 'm2', text: 'Implement IP leakage prevention heuristics checks', completed: true },
      { id: 'm3', text: 'Deploy verification audit analytics log structure', completed: true }
    ],
    githubUrl: 'https://github.com/sam-dev/prompt-compliance-gateway',
    liveUrl: 'https://ai-proxy.omniscience.net',
    deployed: true
  },
  {
    id: 'proj-5',
    title: 'Edge Micro-Kernel Cache Synchronizer',
    domain: 'DevOps & Cloud',
    difficulty: 'Expert',
    description: 'Engineering decentralized cache validation and syncing systems for Docker nodes placed on high-latency environments.',
    techStack: ['Go', 'gRPC Protocol', 'SQLite VFS', 'Linux Cgroups'],
    milestones: [
      { id: 'm1', text: 'Configure automated heartbeats check protocols', completed: false },
      { id: 'm2', text: 'Develop sqlite-based offline write ledger buffers', completed: false },
      { id: 'm3', text: 'Run benchmark evaluations across simulated lag clusters', completed: false }
    ]
  },
  {
    id: 'proj-6',
    title: 'Distributed Scraping Coordinator',
    domain: 'Automation & Bots',
    difficulty: 'Intermediate',
    description: 'A headless scraper orchestration hub rotating proxies, bypassing capchas, and syncing metadata to analytics blocks.',
    techStack: ['Node.js', 'Puppeteer', 'Tor Proxy Network', 'Clickhouse DB'],
    milestones: [
      { id: 'm1', text: 'Implement cluster coordination heartbeat listeners', completed: false },
      { id: 'm2', text: 'Setup Tor network circuit rotational controller', completed: false }
    ]
  }
];

export const INITIAL_APPLICATIONS: StudentApplication[] = [
  {
    id: 'app-1',
    fullName: 'Rohan Sharma',
    email: 'rohan.sharma@iitd.ac.in',
    phone: '+91 98765 43210',
    college: 'Indian Institute of Technology, Delhi',
    gradYear: '2027',
    domainInterest: 'Cybersecurity',
    skills: ['C++', 'Rust', 'Docker', 'Linux networking'],
    githubProfile: 'https://github.com/rohan-iitd',
    linkedinProfile: 'https://linkedin.com/in/rohansharma',
    resumeFileName: 'rohan_sharma_cyber_cv.pdf',
    status: 'ACCEPTED',
    appliedDate: '2026-05-15'
  },
  {
    id: 'app-2',
    fullName: 'Ananya Iyer',
    email: 'ananya.iyer@bits.edu',
    phone: '+91 87654 32109',
    college: 'BITS Pilani',
    gradYear: '2026',
    domainInterest: 'AI / ML Engineering',
    skills: ['Python', 'PyTorch', 'FastAPI', 'SciKit Learn'],
    githubProfile: 'https://github.com/ananya-ai',
    linkedinProfile: 'https://linkedin.com/in/ananyaiyer',
    resumeFileName: 'ananya_resume_ml.pdf',
    status: 'ACCEPTED',
    appliedDate: '2026-05-16'
  },
  {
    id: 'app-3',
    fullName: 'Devansh Kapur',
    email: 'devansh.k@dtu.ac.in',
    phone: '+91 76543 21098',
    college: 'Delhi Technological University',
    gradYear: '2027',
    domainInterest: 'Full-Stack Development',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    githubProfile: 'https://github.com/devansh-kod',
    linkedinProfile: 'https://linkedin.com/in/devansh-kapur',
    resumeFileName: 'devansh_fs_resume.pdf',
    status: 'PENDING',
    appliedDate: '2026-05-19'
  },
  {
    id: 'app-4',
    fullName: 'Sneha Rao',
    email: 'sneha.rao@rvce.edu.in',
    phone: '+91 65432 10987',
    college: 'RV College of Engineering',
    gradYear: '2026',
    domainInterest: 'DevOps & Cloud',
    skills: ['Kubernetes', 'Ansible', 'AWS Cloud', 'Bash Shell'],
    githubProfile: 'https://github.com/sneha-ops',
    linkedinProfile: 'https://linkedin.com/in/snehar_ops',
    resumeFileName: 'sneha_cloud_devops.pdf',
    status: 'PENDING',
    appliedDate: '2026-05-19'
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    studentId: 'student_user',
    studentName: 'Alex Mercer (You)',
    studentEmail: 'omchoksi99@gmail.com',
    projectId: 'proj-1',
    projectName: 'Real-Time Cyber Threat Pipeline',
    domain: 'Cybersecurity',
    githubUrl: 'https://github.com/alexmercer/hellware-threat-pipeline',
    liveUrl: 'https://threat-pipeline.hellware-sandbox.app',
    screencast: 'https://screencast.com/v/threat-engine',
    screenshots: ['/assets/dashboard_screenshot1.png', '/assets/dashboard_screenshot2.png'],
    notes: 'Memory ring allocation is completed. Threat metrics graphs update synchronously with zero jitter under load testing.',
    status: 'UNDER_REVIEW',
    submittedDate: '2026-05-18'
  },
  {
    id: 'sub-2',
    studentId: 'student_rohan',
    studentName: 'Rohan Sharma',
    studentEmail: 'rohan.sharma@iitd.ac.in',
    projectId: 'proj-2',
    projectName: 'High-Frequency Clearance Ledger',
    domain: 'API Design & Integration',
    githubUrl: 'https://github.com/rohan-iitd/clearance-ledger',
    liveUrl: 'https://ledger.rohan.sh',
    screenshots: [],
    notes: 'Cryptographic block rotating signature algorithm working on localized CPU registers.',
    status: 'APPROVED',
    submittedDate: '2026-05-17',
    feedback: 'Incredibly clean implementation of secure register isolates in Rust context! Certificate fully dispatched and profile featured.',
    feedbackAuthor: 'Lead Architect Thorne',
    feedbackDate: '2026-05-18'
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    title: 'Hellware Advanced DSA Tracking Ledger',
    category: 'DSA Sheet',
    description: 'A strict curated matrix of 120 key algorithms problems modeling tree maps, binary search buffers, state machine designs, and high-concurrency sorting algorithms. Guaranteed preparation for systems-level coding interviews.',
    url: '#',
    badge: 'LEADERBOARD SPECIAL'
  },
  {
    id: 'res-2',
    title: 'Elite Startup Engineering Resume Template',
    category: 'Resume Templates',
    description: 'High-impact, LaTeX-compatible typographic resume structure focusing exclusively on tangible engineering achievements, code performance gains, and technical stack parameters.',
    url: '#'
  },
  {
    id: 'res-3',
    title: 'Git and VCS Kernel Handshake Primer',
    category: 'Git and GitHub Handbook',
    description: 'Master rebase flows, cryptographic commit signing protocols, atomic cherry-picks, semantic branch gating, and multi-signature security hooks.',
    url: '#'
  },
  {
    id: 'res-4',
    title: 'Zero-Downtime Sandbox Deployment Protocol',
    category: 'Deployment Guide',
    description: 'Setup reverse proxies with SSL termination, dockerize stateful databases, establish cluster networks, and configure health status polling indexes.',
    url: '#'
  },
  {
    id: 'res-5',
    title: 'Systems-Level Architecture Evaluation Deck',
    category: 'System Design Basics',
    description: 'Learn distributed message pipelines, ring allocation buffers, CAP theorem compromises, read replicas synchronization bottlenecks, and CDN caches.',
    url: '#'
  },
  {
    id: 'res-6',
    title: 'AI Multi-Agent Compliance Prompt Workbook',
    category: 'AI Prompts Book',
    description: 'Advanced prompts templates enforcing rigid types structures, API specifications conformance, compliance scrubbing checklists, and autonomous test suite drafting.',
    url: '#',
    badge: 'UNLOCKED AT 1 REFERRAL'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, username: 'rohan_sharma_99', fullName: 'Rohan Sharma', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', domain: 'Cybersecurity', score: 980, batch: 'May 2026', featured: true },
  { rank: 2, username: 'ananya_ml_architect', fullName: 'Ananya Iyer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', domain: 'AI / ML Engineering', score: 920, batch: 'May 2026', featured: true },
  { rank: 3, username: 'alex_mercer', fullName: 'Alex Mercer (You)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', domain: 'Cybersecurity', score: 850, batch: 'May 2026', featured: true },
  { rank: 4, username: 'clara_genesis', fullName: 'Clara Oswald', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', domain: 'Full-Stack Development', score: 790, batch: 'April 2026', featured: false },
  { rank: 5, username: 'sam_devops', fullName: 'Samuel Croft', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', domain: 'DevOps & Cloud', score: 710, batch: 'May 2026', featured: false }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-05-20 02:11:05', action: 'DEPLOYED RUNTIME ENGINE', operator: 'SYS_DAEMON', severity: 'INFO' },
  { id: 'log-2', timestamp: '2026-05-20 03:22:41', action: 'PROVISIONED SECURE METRICS GRID', operator: 'LEAD_ARCHITECT_THORNE', severity: 'INFO' },
  { id: 'log-3', timestamp: '2026-05-20 05:40:12', action: 'APPROVED ROBUST LEDGER COMPLY', operator: 'SYSTEM_AUDITOR', severity: 'INFO' },
  { id: 'log-4', timestamp: '2026-05-20 06:14:52', action: 'DETECTED 14 ATTEMPTS BRUTES QUARRY - INGRESS SAFE', operator: 'FIREWALL_DEMUX', severity: 'WARNING' }
];

export const REQ_BADGES: Badge[] = [
  { id: 'badge-1', name: 'Verified Compiler', description: 'Assigned upon launching your first sandbox instance sandbox environment successfully.', iconType: 'ShieldCheck', unlocked: true },
  { id: 'badge-2', name: 'Compliance Enforcer', description: 'Successfully verified a production build against rigid security audit matrix requirements.', iconType: 'Lock', unlocked: false },
  { id: 'badge-3', name: 'Zero-Day Hunter', description: 'Demonstrated exceptional triage handling during synthetic cluster simulation logs tests.', iconType: 'Terminal', unlocked: true },
  { id: 'badge-4', name: 'Sovereign Node Builder', description: 'Fully developed, documented, and published a functional, public-facing developer workspace.', iconType: 'Cpu', unlocked: false }
];

export const REQ_CERTIFICATE: Certificate = {
  id: 'CERT-HW-14819',
  studentName: 'Alex Mercer',
  projectName: 'Real-Time Cyber Threat Pipeline',
  domain: 'Cybersecurity',
  completionDate: 'May 20, 2026',
  hash: 'f0ae71bf2c6e9a4e408ec202604ffd219a3b9e4a3b839ec42cf9a1ef48f9fd32a'
};
