/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, ArrowUpRight, Terminal, Cpu, Clock, Check, Layers,
  ExternalLink, Code, Search, Filter, Phone, Mail, Award, CheckCircle2,
  AlertTriangle, ArrowRight, FileText, Upload, BookOpen, AlertCircle, Sparkles,
  Lock, Layout, Network, Target, Users
} from 'lucide-react';
import { 
  Track, StudentProject, StudentApplication, INITIAL_PROJECTS, TRACKS, REQ_CERTIFICATE 
} from '@/data/mockData';
import HellwareLogo from '@/components/HellwareLogo';
import CaseStudyDetail from '@/components/CaseStudyDetail';
import BookingModal from '@/components/BookingModal';

// ----------------------------------------------------
// Toast trigger interface
// ----------------------------------------------------
interface PublicPageProps {
  onNavigate: (view: string) => void;
  onSubmitApplication: (app: Partial<StudentApplication>) => void;
  onShowToast: (msg: string, type: 'success' | 'warn' | 'error') => void;
  currentPublicView: string; // 'LANDING' | 'ABOUT' | 'HOW_IT_WORKS' | 'SHOWCASE' | 'APPLY' | 'VERIFY' | 'TERMS' | 'PRIVACY'
  simState: any;
  setSimState: React.Dispatch<React.SetStateAction<any>>;
}

export default function PublicPages({ 
  onNavigate, onSubmitApplication, onShowToast, currentPublicView, simState, setSimState
}: PublicPageProps) {

  // ==================================================
  // CASE STUDY INTERFACE & BOOKINGS STATES
  // ==================================================
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Clear case study selection if the main view changes
  React.useEffect(() => {
    setSelectedCaseStudyId(null);
  }, [currentPublicView]);

  // ==================================================
  // PROJECTS SHOWCASE FILTER LOGIC
  // ==================================================
  const [showcaseFilter, setShowcaseFilter] = useState<string>('ALL');
  
  const filteredProjects = useMemo(() => {
    if (showcaseFilter === 'ALL') return INITIAL_PROJECTS;
    return INITIAL_PROJECTS.filter(p => p.domain.toLowerCase().includes(showcaseFilter.toLowerCase()) || showcaseFilter.toLowerCase().includes(p.domain.toLowerCase()));
  }, [showcaseFilter]);

  // ==================================================
  // CERTIFICATE VERIFICATION STATE
  // ==================================================
  const [certInputId, setCertInputId] = useState('');
  const [verifiedCert, setVerifiedCert] = useState<any | null>(null);
  const [hasSearchedCert, setHasSearchedCert] = useState(false);

  const handleVerifyCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInputId.trim()) {
      onShowToast('Please type a certificate tracking ID link.', 'warn');
      return;
    }
    setHasSearchedCert(true);
    if (certInputId.toUpperCase().includes('14819') || certInputId.toUpperCase().includes('ALEX')) {
      setVerifiedCert(REQ_CERTIFICATE);
      onShowToast('Secure signature handshake verified.', 'success');
    } else {
      setVerifiedCert(null);
      onShowToast('System was unable to locate dynamic signature ledger.', 'error');
    }
  };

  // ==================================================
  // MULTI-STEP CAREERS AND APPLICATION FORM STATE
  // ==================================================
  const [applyStep, setApplyStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogList, setScanLogList] = useState<string[]>([]);
  const [appForm, setAppForm] = useState({
    fullName: 'Alex Mercer',
    email: 'omchoksi99@gmail.com',
    phone: '+91 98765 43210',
    college: 'International Institute of Information Technology',
    gradYear: '2027',
    domainInterest: 'Cybersecurity',
    skillsInput: '',
    skills: ['React', 'TypeScript', 'Node.js'],
    githubProfile: 'https://github.com/alex-mercer',
    linkedinProfile: 'https://linkedin.com/in/alex-mercer',
    resumeFileName: '',
    consentSpecs: false,
    consentPrivacy: false,
    contributionRead: false
  });

  const [dragActive, setDragActive] = useState(false);
  const [selectedDetailProject, setSelectedDetailProject] = useState<StudentProject | null>(null);

  const handleApplyNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyStep === 1) {
      if (!appForm.fullName || !appForm.email || !appForm.phone || !appForm.college || !appForm.gradYear) {
        onShowToast('Please provide your academic contact parameters.', 'warn');
        return;
      }
      setApplyStep(2);
    } else if (applyStep === 2) {
      if (!appForm.githubProfile || !appForm.linkedinProfile) {
        onShowToast('Please enter your GitHub & LinkedIn workspace links.', 'warn');
        return;
      }
      setApplyStep(3);
    }
  };

  const handleApplyPrev = () => {
    setApplyStep(prev => Math.max(1, prev - 1));
  };

  const handleDomainSelect = (domainName: string) => {
    setAppForm(prev => ({ ...prev, domainInterest: domainName }));
    onShowToast(`Track set to: ${domainName}`, 'success');
  };

  const addSkill = () => {
    if (!appForm.skillsInput.trim()) return;
    const exists = appForm.skills.includes(appForm.skillsInput.trim());
    if (!exists) {
      setAppForm(prev => ({
        ...prev,
        skills: [...prev.skills, prev.skillsInput.trim()],
        skillsInput: ''
      }));
    }
  };

  const removeSkill = (sk: string) => {
    setAppForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== sk)
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        onShowToast('Only PDF engineering briefs are compiled.', 'error');
        return;
      }
      setAppForm(prev => ({ ...prev, resumeFileName: file.name }));
      onShowToast(`Cached resume: ${file.name}`, 'success');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAppForm(prev => ({ ...prev, resumeFileName: file.name }));
      onShowToast(`Attached CV: ${file.name}`, 'success');
    }
  };

  const handleFinalSubmit = () => {
    if (!appForm.consentSpecs || !appForm.consentPrivacy || !appForm.contributionRead) {
      onShowToast('You must acknowledge all terms & the contribution disclosure.', 'warn');
      return;
    }
    if (!appForm.resumeFileName) {
      onShowToast('Please upload your resume PDF first.', 'warn');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanLogList([
      '⚡ [INITIAL STATE] CONNECTING TO HELLWARE EVALUATION STACK PROTOCOLS...',
      '🔗 RESOLVING CLUSTER INGRESS PORTS FOR AUTONOMOUS CV PARSING...'
    ]);

    const logs = [
      '🔍 INGESTING CANDIDATE PORTFOLIO BRIEF FOR LOGICAL STRUCTURAL ANALYSIS...',
      '📑 FILE SYSTEM READ: MATCHED DETECTED PDF ENVELOPE HEADER SYMBOLS.',
      '🤖 RUNNING SEMANTIC TOKENIZATIONS TO IDENTIFY ACADEMIC DISCIPLINE BACKGROUNDS...',
      `🎓 INSTITUTION PROFILE ACCUMULATED: [${appForm.college}]`,
      '📦 WEAVING DYNAMIC LOGIC EMBEDDINGS IN CAPABILITIES GRID INDEX...',
      `📟 SKILLS EXTRACTED: ${appForm.skills.join(', ') || 'React, TypeScript, Node.js'}`,
      '🔌 VERIFYING PUBLIC CODE-GRAPH REPOSITORIES FOR PROOF-OF-WORK VERACITY...',
      `🛰️ ATTACHING RECON SCAN MONITOR COMPLIANCE PIPELINES ON DISK: ${appForm.githubProfile}`,
      '🛡️ SANITY RECON COMPLETE: ENVELOPE SECURE BOUNDS MEETING STANDARDS AUDIT OVERSEEN.',
      '🌐 REGISTERING LEDGER IDENT COHORT BUNDLE PARAMETERS ACTIVE...',
      '🔐 CACHING CUSTOM DIAGNOSTIC WATERMARK METADATA TO PUBLIC RELATIONAL MATRIX DATABASE...'
    ];

    let currentLogIdx = 0;
    // Math.random() simulated delay from 3 to 10 seconds!
    const randomDuration = Math.floor(Math.random() * 7000) + 3000; 
    const stepInterval = randomDuration / 100;

    const timer = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          
          onSubmitApplication({
            fullName: appForm.fullName,
            email: appForm.email,
            phone: appForm.phone,
            college: appForm.college,
            gradYear: appForm.gradYear,
            domainInterest: appForm.domainInterest,
            skills: appForm.skills,
            githubProfile: appForm.githubProfile,
            linkedinProfile: appForm.linkedinProfile,
            resumeFileName: appForm.resumeFileName,
            status: 'PENDING',
            appliedDate: new Date().toISOString().split('T')[0]
          });

          setSimState((prevSim: any) => ({
            ...prevSim,
            step: 'APPLIED',
            fullName: appForm.fullName,
            email: appForm.email,
            college: appForm.college,
            phone: appForm.phone,
            gradYear: appForm.gradYear,
            role: appForm.domainInterest,
            skills: appForm.skills
          }));

          setIsScanning(false);
          setApplyStep(3); // success applied state
          onShowToast('CV analytical metrics scanned and parsed successfully! Welcome to the cohort wait-stream.', 'success');
          return 100;
        }

        const nextProg = prev + 1;
        if (nextProg % 9 === 0 && currentLogIdx < logs.length) {
          setScanLogList(l => [...l, `> ${logs[currentLogIdx]}`]);
          currentLogIdx += 1;
        }

        return nextProg;
      });
    }, stepInterval);
  };

  // Leaderboard statistics filtering is removed as of core feature trim.


  // Icon translation util
  const getIcon = (name: string) => {
    switch (name) {
      case 'Layout': return <Layout className="w-5 h-5 text-cyber-blue" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-amber-500" />;
      case 'Shield': return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'Layers': return <Layers className="w-5 h-5 text-purple-500" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-red-500" />;
      case 'Network': return <Network className="w-5 h-5 text-cyan-500" />;
      default: return <Code className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative z-10 w-full min-h-screen text-white select-none">
      
      {selectedCaseStudyId ? (
        <CaseStudyDetail 
          projectId={selectedCaseStudyId}
          onClose={() => {
            setSelectedCaseStudyId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBookCall={() => setIsBookingOpen(true)}
        />
      ) : (
        <>
          {/* -------------------------------------------------------------------------------- */}
          {/* LANDING PAGE public layout */}
          {/* -------------------------------------------------------------------------------- */}
          {currentPublicView === 'LANDING' && (
        <div id="landing-anchor" className="space-y-32 pb-24">
          
          {/* Bold Hero Section */}
          <section className="relative pt-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 space-y-8 text-left">
              <span className="text-red-500 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                // HIGH REPUTATION COHORT REGISTRATION ACTIVE
              </span>
              
              <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95]">
                BUILD REAL.<br/>SHIP REAL.<br/>
                <span className="text-transparent text-glow-red" style={{ WebkitTextStroke: '1px white' }}>GET RECOGNIZED.</span>
              </h1>
              
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light max-w-lg">
                Hellware is a strict, project-first, experiential engineering platform for students. Connect real code repositories, deploy live sandboxes, undergo hard peer reviews, and construct a verified decentralized public developer card.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <button 
                  onClick={() => onNavigate('APPLY')}
                  className="px-8 py-3 bg-white text-black text-[10px] uppercase font-bold tracking-widest hover:bg-gray-200 transition-all cursor-pointer shadow-lg shadow-white/5"
                >
                  Apply to cohort
                </button>
                <button 
                  onClick={() => onNavigate('SHOWCASE')}
                  className="px-8 py-3 border border-white/20 hover:border-white/50 text-[10px] uppercase tracking-widest bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  Analyze projects
                </button>
              </div>
            </div>

            {/* Geometric interactive wireframe construct */}
            <div className="w-full md:w-1/2 flex justify-center relative select-none pointer-events-none">
              <div className="w-[300px] h-[300px] md:w-[440px] md:h-[440px] border border-white/5 rounded-full flex items-center justify-center relative">
                <div className="w-[240px] h-[240px] md:w-[340px] md:h-[340px] border border-white/10 rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite]">
                  <div className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] bg-gradient-to-tr from-neutral-900 to-black rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.03)] relative">
                    <div className="w-16 h-16 border-l-2 border-t-2 border-red-500 rotate-45" />
                  </div>
                </div>
                {/* Floating metrics tracker */}
                <div className="absolute top-8 right-0 bg-neutral-900/90 backdrop-blur border border-white/10 p-4 text-left rounded">
                  <div className="text-[8px] text-gray-500 uppercase tracking-widest font-mono">Ledger Node Status</div>
                  <div className="text-sm font-mono text-white font-bold">STABLE // RUN_OK</div>
                  <div className="text-[10px] font-mono text-cyan-400">142.8 TH/s Hashrate</div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="bg-neutral-900/30 border-y border-white/5 py-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <span className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">1,200+</span>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Active High-Performers</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl md:text-4xl font-mono font-bold text-red-500">300+</span>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Verified Deployments</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl md:text-4xl font-mono font-bold text-white">6 Tracks</span>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Intense Tech Tracks</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl md:text-4xl font-mono font-bold text-green-400">₹0 Fee</span>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Mandatory Free Syllabus</p>
              </div>
            </div>
          </section>

          {/* HELLWARE Enterprise capabilities & custom Case Studies Showcase */}
          <section className="max-w-7xl mx-auto px-6 md:px-12 text-left space-y-16" id="case-studies-section">
            <div className="space-y-3">
              <span className="text-red-500 text-xs font-mono tracking-widest uppercase">// ENTERPRISE CAPABILITIES & PRODUCTS</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">HELLWARE CAPABILITIES & CASE STUDIES</h2>
              <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed max-w-2xl">
                We design and deploy high-performance, security-hardened computational infrastructure. From state-replicating AI model matrices to zero-knowledge audit ledgers, explore some of our real-world custom implementations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'CASE-01',
                  tag: 'AI & NEURAL INFRASTRUCTURE',
                  title: 'DeepCognition Multi-Agent LLM Grid',
                  metrics: '99.4% Latency Reduction',
                  desc: 'A robust routing proxy pipeline synchronizing telemetry prompts metrics across distributed clusters. Successfully parsed over 4.2 million context-tokens without rate-limit proxy triggers.',
                  tech: ['Python', 'FastAPI', 'Redis Cache', 'gRPC API']
                },
                {
                  id: 'CASE-02',
                  tag: 'COMPLIANCE & SECURE FIREWALLS',
                  title: 'AIGIS Sentinel Network Payload Shield',
                  metrics: 'Sub-Millisecond Zero-Day Blocks',
                  desc: 'Deployed real-time isolated regex classifier clusters tracking and sanitizing payload parameters on active high-speed staging environments to quarantine potential server PII leaks.',
                  tech: ['Go', 'Docker Sandbox', 'Regex OCR', 'Kubernetes']
                },
                {
                  id: 'CASE-03',
                  tag: 'CRYPTOGRAPHIC LEDGER NODE',
                  title: 'High-Frequency settlement Clearance Ledger',
                  metrics: '128,000 Atomic Swaps/sec',
                  desc: 'Engineered a cryptographically verified internal database using rotating compliance HMAC security keyrings to ensure non-duplicable transactional settlements on staging buffers.',
                  tech: ['Rust', 'WebSocket ring', 'SHA-256 HMAC', 'LevelDB']
                }
              ].map((cs) => (
                <div 
                  key={cs.id} 
                  onClick={() => {
                    const idMap: Record<string, string> = {
                      'CASE-01': 'proj-4',
                      'CASE-02': 'proj-1',
                      'CASE-03': 'proj-2'
                    };
                    setSelectedCaseStudyId(idMap[cs.id] || 'proj-1');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-neutral-900/40 hover:bg-neutral-900/60 p-8 rounded-xl border border-white/5 hover:border-red-500/30 transition-all flex flex-col justify-between h-[360px] group cursor-pointer hover:shadow-lg hover:shadow-red-500/5 duration-300 select-none text-left"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase">{cs.tag}</span>
                      <span className="text-gray-500">{cs.id}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-white tracking-tight text-glow-red group-hover:text-red-400 duration-300">{cs.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-light">{cs.desc}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 mt-auto border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-mono text-emerald-400 font-bold">{cs.metrics}</div>
                      <div className="text-[10px] font-mono text-red-400 font-bold group-hover:text-red-300 flex items-center gap-1">
                        <span>VIEW DETAILS</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[9px] text-gray-400">
                      {cs.tech.map((tc, keyidx) => (
                        <span key={keyidx} className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{tc}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section Divider - Strategic Boundary */}
          <div className="relative max-w-7xl mx-auto px-6 md:px-12 pointer-events-none select-none my-12" id="strategic-divider">
            <div className="w-full h-px bg-white/5 flex items-center justify-between">
              <span className="text-[7px] font-mono text-neutral-600 tracking-[0.25em]">// SEC_PARTITION: PROCESS_ROADMAP //</span>
              <div className="flex gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500/40" />
                <span className="w-1 h-1 rounded-full bg-red-500/20" />
              </div>
            </div>
          </div>

          {/* How It Works List Layout (5 Staged Steps) */}
          <section id="process" className="max-w-7xl mx-auto px-6 md:px-12 text-left space-y-16">
            <div className="space-y-2">
              <span className="text-red-500 text-xs font-mono tracking-widest uppercase">// OPERATION RUNTIME</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">THE 5-STEP CORE JOURNAL</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { step: '01', title: 'APPLY COHORT', desc: 'Sift past screening vectors by completing skills tag maps and loading code portfolios.' },
                { step: '02', title: 'GET DESIGNATION', desc: 'Secure custom assigned systems builds from our core registry matching interests.' },
                { step: '03', title: 'BUILD SYSTEM', desc: 'Implement features iteratively, passing local verification checks, testing logic.' },
                { step: '04', title: 'DISPATCH FEEDBACK', desc: 'Submit repository hooks, screencasts, and images for mentor audit reviews.' },
                { step: '05', title: 'SECURE CREDENTIAL', desc: 'Earn verified proof-of-work certificates and locked-down public portfolio cards.' }
              ].map((ph, idx) => (
                <div key={idx} className="bg-neutral-900/40 border border-white/5 hover:border-white/10 rounded-lg p-6 space-y-6 flex flex-col justify-between transition-all group hover:-translate-y-1">
                  <div className="flex justify-between items-center text-xs font-mono text-red-500 font-bold">
                    <span>STEP {ph.step}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">⚡</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">{ph.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">{ph.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section Divider - Matrix Boundary */}
          <div className="relative max-w-7xl mx-auto px-6 md:px-12 pointer-events-none select-none my-12" id="matrix-divider">
            <div className="w-full h-px bg-white/5 flex items-center justify-between">
              <span className="text-[7px] font-mono text-neutral-600 tracking-[0.25em]">// SEC_PARTITION: DISCIPLINES_MATRIX //</span>
              <div className="flex gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500/40" />
                <span className="w-1 h-1 rounded-full bg-red-500/20" />
              </div>
            </div>
          </div>

          {/* Tracks / Domains Registry */}
          <section className="max-w-7xl mx-auto px-6 md:px-12 text-left space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-red-500 text-xs font-mono tracking-widest uppercase">// CORE SKILL MATRIX</span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">ACTIVE DISCIPLINE TRACKS</h2>
              </div>
              <button 
                onClick={() => onNavigate('APPLY')} 
                className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <span>[ CHOOSE A SPECIALIZATION ]</span>
                <ArrowRight className="w-4 h-4 text-red-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TRACKS.map((t) => (
                <div key={t.id} className="bg-neutral-950/60 border border-white/5 rounded-lg p-8 hover:bg-neutral-900/40 hover:border-white/10 transition-all flex flex-col justify-between h-56 group text-left">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/[0.02]">
                      {getIcon(t.iconName)}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">LEVEL_CRITICAL</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold tracking-tight text-white">{t.name}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>



          {/* Section Divider - Resources Boundary */}
          <div className="relative max-w-7xl mx-auto px-6 md:px-12 pointer-events-none select-none my-12" id="resources-divider">
            <div className="w-full h-px bg-white/5 flex items-center justify-between">
              <span className="text-[7px] font-mono text-neutral-600 tracking-[0.25em]">// SEC_PARTITION: RESOURCES_REGISTRY //</span>
              <div className="flex gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500/40" />
                <span className="w-1 h-1 rounded-full bg-red-500/20" />
              </div>
            </div>
          </div>

          {/* Resources Teaser Section */}
          <section className="bg-gradient-to-t from-neutral-950 to-transparent py-16">
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-left">
                <span className="text-red-500 text-xs font-mono tracking-widest uppercase">// SECURE INTEL LIBRARIES</span>
                <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">HIGH FREQUENCY PREP STACK</h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  We maintain updated libraries including curated algorithms directories (DSA Trackers), resume layout builders designed for fast parsing, deployment checklists, and cloud configurations. Unlocked unconditionally.
                </p>
                <button onClick={() => onNavigate('LOGIN')} className="px-6 py-3 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-500 transition-all font-mono text-xs uppercase tracking-widest cursor-pointer">
                  CLAIM SYSTEM RESOURCES FREE
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'DSA Ledger Sheet', desc: '120 strict algorithms configurations' },
                  { title: 'Resume Blueprints', desc: 'Compilable parse-optimized resumes' },
                  { title: 'Git & Kern Handbooks', desc: 'Atomic actions branch rebase steps' },
                  { title: 'Deployment Checklists', desc: 'Secure proxy setups & keys mapping' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-neutral-900/60 p-6 rounded border border-white/5 space-y-2 text-left">
                    <span className="text-[9px] font-mono text-gray-500 block uppercase">ARCHIVE_0{idx+1}</span>
                    <h5 className="font-bold text-xs text-white">{item.title}</h5>
                    <p className="text-[10px] text-gray-400 font-light leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* COHORT HOW IT WORKS PAGE (Comprehensive detailing) */}
      {/* -------------------------------------------------------------------------------- */}
      {currentPublicView === 'HOW_IT_WORKS' && (
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-24 space-y-16 text-left">
          <div className="space-y-4 border-b border-white/10 pb-8">
            <span className="text-red-500 font-mono text-xs uppercase tracking-widest block">// SYS_FLOW DEPLOYMENT DIRECTIVES</span>
            <h1 className="text-4xl md:text-6xl font-black text-white">THE ENTIRE UNDERGRAD SYSTEM ROADMAP</h1>
            <p className="text-gray-400 text-base max-w-2xl font-light">
              We model real startup engineering tasks. Zero dummy quizzes, zero template certificate layouts without verified code. Review the protocol cycle:
            </p>
          </div>

          <div className="space-y-12">
            {[
              { id: 'Phase 01', icon: <Terminal className="text-red-500" />, name: 'RIGID COHORT APPLICATION VECTOR', desc: 'Your skills matrix profiles details are checked against automated baseline thresholds. Only serious students demonstrating active repositories or basic shell capabilities proceed to project allocation.' },
              { id: 'Phase 02', icon: <Cpu className="text-amber-500" />, name: 'PROJECT AND TRACK DESIGNATION', desc: 'Once Accepted, students receive direct sandboxed blueprints. Systems run from real full-stack deployments to AI proxies, DevOps networks, and APIs. Fully structured.' },
              { id: 'Phase 03', icon: <Code className="text-cyber-blue" />, name: 'ITERATIVE COMPILING & VERIFICATION', desc: 'Access your assigned student deck. Track requirements, complete milestone lists, configure local caches, verify performance metrics, and build code directly.' },
              { id: 'Phase 04', icon: <Users className="text-purple-500" />, name: 'PEER & ARCHITECT PORTFOLIO AUDIT', desc: 'Submit repository hashes, screencasts, and images. Senior mentors review variables leaks, compliance, speed optimizations, and error boundaries, returning feedback tags.' },
              { id: 'Phase 05', icon: <Award className="text-green-400" />, name: 'PROOF-OF-WORK VERIFICATION SIGNATURE', desc: 'Earn public cryptographic credentials, locked-down developer profile paths (like hellware-sandbox/u/username), and unalterable system stats. Ready to showcase.' }
            ].map((st, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 p-8 bg-neutral-900/20 border border-white/5 rounded-xl hover:border-red-500/20 transition-all">
                <div className="p-4 bg-white/[0.02] rounded-lg h-fit">
                  {st.icon}
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-red-500 tracking-widest">{st.id}</span>
                  <h3 className="text-lg font-bold text-white tracking-wide uppercase">{st.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Certificate Generation Contribution Disclosure */}
          <div className="p-8 bg-neutral-900/50 border border-amber-500/10 rounded-xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-mono uppercase tracking-widest rounded-bl border-l border-b border-amber-500/15">
              Disclosure Matrix
            </div>
            <div className="flex gap-2 items-center text-amber-500 font-mono text-xs uppercase font-bold">
              <AlertTriangle className="w-5 h-5" />
              NON-MANDATORY SYSTEM CONTRIBUTION INFORMATION
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Hellware curriculum access, support clusters, milestone boards, and core resources are and will remain **completely free of charge**. A minor, entirely voluntary operational deployment contribution of **₹149–299** covers background PDF rendering engine capacities and server security rule verifications. This step is 100% bypassable during credentials dispatch.
            </p>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* COHORT ABOUT MISSION STATEMENT PAGE */}
      {/* -------------------------------------------------------------------------------- */}
      {currentPublicView === 'ABOUT' && (
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-24 space-y-24 text-left">
          
          <div className="space-y-4">
            <span className="text-red-500 font-mono text-xs uppercase tracking-widest block">// MANIFESTO_LEDGER_01</span>
            <h1 className="text-4xl md:text-7xl font-black text-white leading-tight">ENGINEERING THE GENERATION OF PRACTITIONERS.</h1>
            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              Certificate mills generated millions of passive PDF owners with zero ability to run mock servers, debug memory allocations, or construct custom endpoints. Hellware was initiated to destroy certificate inflation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/5 pt-12">
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-widest font-mono text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" /> Our Critical Mission
              </h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                To build high-concurrency, self-directed learning modules that force developers to deploy, verify, scale, and secure projects before requesting credential validations. We value runtime feedback, code telemetry indexes, and unalterable verification.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-widest font-mono text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> The Strategic Vision
              </h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                To establish an open-source proof-of-work baseline for global tech hiring companies. Hiring teams should inspect student work sandboxes directly rather than reviewing shallow LinkedIn badges.
              </p>
            </div>
          </div>

          {/* Value Stack */}
          <div className="space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-widest font-mono text-red-500">// FOUNDING METRIC VALUES</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Zero Larping Policy', d: 'We inspect code, compile processes, and monitor performance. We do not value empty certificates or non-functional theoretical PDFs.' },
                { title: 'Verified Work Registry', d: 'Every certificate we sign links directly to actual repository commits and active live subdomains containing the software.' },
                { title: 'Voluntary Contributions', d: 'No premium paywalls. Our database tools and training directories are open to active, dedicated engineers.' }
              ].map((vl, idx) => (
                <div key={idx} className="p-6 bg-neutral-900/30 border border-white/5 rounded-lg space-y-2">
                  <h5 className="font-bold text-white text-sm">{vl.title}</h5>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">{vl.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* FILTERABLE PROJECTS SHOWCASE GRID */}
      {/* -------------------------------------------------------------------------------- */}
      {currentPublicView === 'SHOWCASE' && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-12 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-6">
            <div className="space-y-2">
              <span className="text-red-500 font-mono text-xs uppercase tracking-widest block">// ARCHIVE: PUBLIC SHIELDS REGISTER</span>
              <h1 className="text-3xl md:text-6xl font-black text-white">ENGINEERED PROJECTS REGISTER</h1>
              <p className="text-gray-400 text-xs font-light">Inspect active sandbox repositories deployed by current student teams.</p>
            </div>

            {/* Filter Pill List */}
            <div className="flex flex-wrap gap-2">
              {['ALL', 'Full-Stack', 'AI', 'Cybersecurity', 'Devops', 'API'].map((f) => (
                <button
                  key={f}
                  onClick={() => setShowcaseFilter(f)}
                  className={`px-4 py-1.5 rounded font-mono text-[9px] uppercase tracking-widest transition-all cursor-pointer border ${
                    showcaseFilter === f
                      ? 'bg-red-500/10 border-red-500 text-red-400 font-bold'
                      : 'bg-neutral-900/60 border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProjects.map((p) => (
              <div 
                key={p.id} 
                onClick={() => setSelectedDetailProject(p)}
                className="bg-neutral-950/60 border border-white/5 hover:border-red-500/30 hover:bg-neutral-950/90 rounded-xl p-6 flex flex-col justify-between h-72 transition-all relative group text-left cursor-pointer"
                id={`project-card-${p.id}`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono text-red-500 uppercase font-bold">
                    <span>{p.domain}</span>
                    <span className="text-xs bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded text-neutral-400 capitalize">{p.difficulty}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{p.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">{p.description}</p>
                </div>

                <div className="space-y-4 border-t border-white/5 pt-4">
                  <div className="flex flex-wrap gap-1">
                    {p.techStack.map((tk, index) => (
                      <span key={index} className="text-[9px] font-mono bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded text-neutral-400">{tk}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                    <span className="flex items-center gap-1.5 uppercase text-[9px] text-gray-500">
                      <Terminal className="w-3 h-3 text-red-500" /> View Specification →
                    </span>
                    <div className="flex items-center gap-3">
                      {p.githubUrl && (
                        <a 
                          href={p.githubUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-white text-gray-500 transition-colors" 
                          title="View Source"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.liveUrl && (
                        <a 
                          href={p.liveUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-white text-gray-500 transition-colors" 
                          title="Live Sandbox"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* -------------------------------------------------------------------------------- */}
      {/* COHORT ADMISSIONS AND APPLICATION FORM */}
      {/* -------------------------------------------------------------------------------- */}
      {currentPublicView === 'APPLY' && (
        <div id="apply-page-root" className="max-w-6xl mx-auto px-6 py-24 space-y-12 text-left">
          
          {/* Header Step indicators - Sleek Minimal styling */}
          <div className="space-y-4 border-b border-white/5 pb-8" id="application-flow-header">
            <span className="text-red-500 font-mono text-xs uppercase tracking-widest block">// COHORT_INGRESS_GATE</span>
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">COHORT ENROLLMENT PROTOCOL</h1>
              
              {/* Dynamic Step indicators */}
              <div className="flex items-center gap-3">
                {[
                  { s: 1, label: 'Choose Role' },
                  { s: 2, label: 'Dossier & CV' },
                  { s: 3, label: 'Completed' }
                ].map((item) => (
                  <div key={item.s} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] border transition-all ${
                      applyStep === item.s 
                        ? 'bg-red-500 text-black border-red-500 font-bold' 
                        : applyStep > item.s 
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                        : 'border-white/10 text-gray-500'
                    }`}>
                      {applyStep > item.s ? '✓' : item.s}
                    </div>
                    <span className={`text-[9px] font-mono uppercase ${applyStep === item.s ? 'text-white font-bold' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                    {item.s < 3 && <div className="w-3 h-px bg-white/5" />}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-gray-400 text-xs font-light max-w-2xl">
              Fill out the engineering parameters below. Our system values actual repository proof-of-work commits. Review our available specialization roles and upload an parsed technical CV.
            </p>
          </div>

          <div className="relative min-h-[450px]">
            <AnimatePresence mode="wait">
              
              {/* Dynamic Step 1: Specific engineering roles select board */}
              {applyStep === 1 && (
                <motion.div 
                  key="apply-step-1" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                  id="role-selection-view"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] uppercase tracking-wider font-bold">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                      // CHOOSE YOUR ASSIGNED ROLE
                    </div>
                    <p className="text-gray-400 text-xs font-light font-sans">Select from our active engineering positions. Each specialization features strict repository milestone checklists.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Full-Stack Core Intern",
                        track: "Full-Stack Development",
                        slots: "4 Open Slots",
                        difficulty: "Intermediate to Advance",
                        prereqs: "React, Node.js, SQLite/Postgres concepts",
                        description: "Architect and implement high-concurrency client-server systems with real-time replication states."
                      },
                      {
                        title: "AI Sandbox Architect",
                        track: "AI / ML Engineering",
                        slots: "3 Open Slots",
                        difficulty: "Advance",
                        prereqs: "Python, FastAPI, prompt engineering, HuggingFace",
                        description: "Integrate model chains, neural search database embeddings, and stateful prompt middleware proxies."
                      },
                      {
                        title: "Cryptosec Security Sentinel",
                        track: "Cybersecurity",
                        slots: "2 Open Slots",
                        difficulty: "Expert",
                        prereqs: "Linux networking, encryption cascades, OWASP benchmarks",
                        description: "Build robust Zero-Knowledge authentication rules and audit core security compliance sandboxes."
                      },
                      {
                        title: "Edge DevOps Orchestrator",
                        track: "DevOps & Cloud",
                        slots: "1 Open Slot",
                        difficulty: "Expert",
                        prereqs: "Docker, container engines, Linux clusters, CI/CD logic",
                        description: "Container orchestration, multi-stage deployment workflows, and isolated kernel script simulations."
                      },
                      {
                        title: "Stateful Automations Developer",
                        track: "Automation & Bots",
                        slots: "5 Open Slots",
                        difficulty: "Beginner to Intermediate",
                        prereqs: "JavaScript/TypeScript, asynchronous routines, scraping APIs",
                        description: "Design stateful event listeners, scraping schedules, and automated workflow state machines."
                      },
                      {
                        title: "High-Frequency API Architect",
                        track: "API Design & Integration",
                        slots: "3 Open Slots",
                        difficulty: "Intermediate",
                        prereqs: "gRPC structures, caching indexes, throttling rules",
                        description: "Develop high-frequency telemetry API gateways, adaptive rate-limit modules, and RPC wrappers."
                      }
                    ].map((role) => {
                      const isSelected = appForm.domainInterest === role.track;
                      return (
                        <div 
                          key={role.title}
                          id={`role-card-${role.title.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => {
                            setAppForm(prev => ({ ...prev, domainInterest: role.track }));
                            onShowToast(`Selected Role: ${role.title}`, "success");
                            setApplyStep(2);
                          }}
                          className={`relative border rounded-xl p-6 flex flex-col justify-between h-72 transition-all cursor-pointer text-left select-none group ${
                            isSelected 
                              ? 'bg-red-500/[0.04] border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.07)]' 
                              : 'bg-neutral-950/40 border-white/5 hover:bg-neutral-950/85 hover:border-red-500/30'
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest block font-bold">{role.slots}</span>
                              <span className="text-[8px] font-mono bg-white/[0.03] border border-white/10 px-1.5 py-0.5 rounded text-neutral-400 capitalize">{role.difficulty}</span>
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-[15px] text-white tracking-tight group-hover:text-red-400 transition-colors uppercase">{role.title}</h3>
                              <span className="text-[9.5px] font-mono text-neutral-500 uppercase tracking-wider block mt-1">{role.track}</span>
                            </div>

                            <p className="text-xs text-neutral-400 leading-relaxed font-light line-clamp-3">{role.description}</p>
                          </div>

                          <div className="border-t border-white/5 pt-3 mt-4">
                            <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">PREREQUISITES</span>
                            <span className="text-[10px] text-gray-500 font-light truncate block mt-0.5">{role.prereqs}</span>
                          </div>

                          {/* Quick Select Flag */}
                          <div className="absolute bottom-4 right-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-mono text-red-500 tracking-wider">CHOOSE →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Unified Biography and PDF CV Attachment (Beautifully Clean) */}
              {applyStep === 2 && (
                <motion.div 
                  key="apply-step-2" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                  id="dossier-input-view"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <div className="text-red-500 font-mono text-[10px] uppercase font-semibold">
                        // CORE REGISTER DOSSIER & CV BRIEF
                      </div>
                      <p className="text-neutral-400 text-xs font-light">
                        Applying for Role: <span className="text-red-400 font-mono font-bold uppercase">{appForm.domainInterest}</span>
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setApplyStep(1)} 
                      className="text-[9px] font-mono text-red-500 hover:underline hover:text-red-400 uppercase cursor-pointer"
                      id="change-role-trigger"
                    >
                      [ Change Role ]
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Academic & Social Bio Form Fields */}
                    <div className="lg:col-span-7 space-y-6 md:border-r md:border-white/5 md:pr-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Candidate Full Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="John Doe"
                            value={appForm.fullName} 
                            onChange={(e) => setAppForm(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full bg-neutral-950 border border-white/5 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-700 font-sans focus:border-red-550 border-input transition-colors focus:outline-none"
                            id="candidate-fullname"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Email Address (Verification channel)</label>
                          <input 
                            required
                            type="email" 
                            placeholder="john@example.com"
                            value={appForm.email} 
                            onChange={(e) => setAppForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-neutral-950 border border-white/5 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-700 font-sans focus:border-red-500 transition-colors focus:outline-none"
                            id="candidate-email"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block">Contact Mobile (WhatsApp alerts)</label>
                          <input 
                            required
                            type="text" 
                            placeholder="+91 99999 99999"
                            value={appForm.phone} 
                            onChange={(e) => setAppForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-neutral-950 border border-white/5 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-700 font-sans focus:border-red-500 transition-colors focus:outline-none"
                            id="candidate-phone"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block">College / Institute Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Engineering University"
                            value={appForm.college} 
                            onChange={(e) => setAppForm(prev => ({ ...prev, college: e.target.value }))}
                            className="w-full bg-neutral-950 border border-white/5 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-700 font-sans focus:border-red-505 transition-colors focus:outline-none"
                            id="candidate-college"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Graduation Batch Year</label>
                          <select 
                            value={appForm.gradYear} 
                            onChange={(e) => setAppForm(prev => ({ ...prev, gradYear: e.target.value }))}
                            className="w-full bg-neutral-950 border border-white/5 rounded px-4 py-2.5 text-xs text-white font-sans focus:border-red-500 transition-colors focus:outline-none"
                            id="candidate-gradyear"
                          >
                            <option value="2025">Class of 2025</option>
                            <option value="2026">Class of 2026</option>
                            <option value="2027">Class of 2027</option>
                            <option value="2028">Class of 2028</option>
                            <option value="2029">Since / Later Batch</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Public GitHub Profile Mirror</label>
                            <input 
                              required
                              type="url" 
                              placeholder="https://github.com/username"
                              value={appForm.githubProfile} 
                              onChange={(e) => setAppForm(prev => ({ ...prev, githubProfile: e.target.value }))}
                              className="w-full bg-neutral-950 border border-white/5 rounded px-4 py-2.5 text-xs text-white font-mono focus:border-red-500 transition-colors focus:outline-none"
                              id="candidate-github"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase text-neutral-400 block">LinkedIn Profile URL</label>
                            <input 
                              required
                              type="url" 
                              placeholder="https://linkedin.com/in/username"
                              value={appForm.linkedinProfile} 
                              onChange={(e) => setAppForm(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                              className="w-full bg-neutral-950 border border-white/5 rounded px-4 py-2.5 text-xs text-white font-mono focus:border-red-500 transition-colors focus:outline-none"
                              id="candidate-linkedin"
                            />
                          </div>
                        </div>

                        {/* Skills Tag block */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-neutral-400 block">Repository Tech Skills Tags</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="e.g. Node.js, Rust, Docker"
                              value={appForm.skillsInput} 
                              onChange={(e) => setAppForm(prev => ({ ...prev, skillsInput: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                              className="flex-1 bg-neutral-950 border border-white/5 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-750 focus:border-red-500 focus:outline-none"
                              id="skills-adder-input"
                            />
                            <button 
                              type="button" 
                              onClick={addSkill} 
                              className="px-4 py-2.5 border border-white/10 hover:border-white/30 hover:bg-white/[0.02] text-xs font-mono uppercase text-white cursor-pointer transition-colors"
                              id="skills-append-btn"
                            >
                              Append
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {appForm.skills.map((s) => (
                              <span key={s} className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded flex items-center gap-1.5" id={`skill-tag-${s.toLowerCase()}`}>
                                {s}
                                <button type="button" onClick={() => removeSkill(s)} className="text-[9px] font-bold text-red-500 hover:text-white cursor-pointer hover:underline">×</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: PDF Resume Drag and Drop & Consent Terms */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                      
                      {/* Drag & Drop File Upload */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Technical CV / Resume (PDF Only)</label>
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`w-full min-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all relative ${
                            dragActive 
                              ? 'border-red-500 bg-red-500/5' 
                              : appForm.resumeFileName 
                              ? 'border-emerald-500/60 bg-emerald-500/[0.02]' 
                              : 'border-white/5 bg-neutral-950/40 hover:border-white/10'
                          }`}
                          id="resume-dropzone"
                        >
                          {appForm.resumeFileName ? (
                            <div className="space-y-3 text-center">
                              <FileText className="w-10 h-10 text-emerald-400 mx-auto" />
                              <div>
                                <div className="text-[11px] font-mono text-white font-bold max-w-[200px] truncate mx-auto">{appForm.resumeFileName.toUpperCase()}</div>
                                <span className="text-[8px] text-gray-500 font-mono tracking-widest uppercase block mt-0.5">PDF SECURE Handshake verified ✓</span>
                              </div>
                              <button 
                                onClick={() => setAppForm(prev => ({ ...prev, resumeFileName: '' }))}
                                className="text-[9px] font-mono text-red-500 hover:underline uppercase block mx-auto cursor-pointer"
                                id="clear-cv-trigger"
                              >
                                Replace CV brief
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3 text-center">
                              <Upload className="w-10 h-10 text-neutral-600 mx-auto" />
                              <div>
                                <p className="text-xs text-neutral-300 font-light">
                                  Drag & drop PDF here, or{" "}
                                  <label className="text-red-500 hover:underline cursor-pointer font-normal">
                                    browse file
                                    <input 
                                      type="file" 
                                      accept=".pdf"
                                      onChange={handleFileChange}
                                      className="hidden" 
                                      id="file-cv-apply"
                                    />
                                  </label>
                                </p>
                                <span className="text-[8px] text-neutral-500 font-mono block mt-1">MAX LIMIT: 12MB CONTEXT RESUMES</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Explicit Consent Guidelines */}
                      <div className="space-y-3 font-sans text-[11px] bg-neutral-950/50 border border-white/5 p-5 rounded-xl">
                        <span className="text-[8.5px] font-mono text-neutral-500 uppercase tracking-widest block font-bold mb-1">// SECURITY COMPLIANCE AGREEMENT</span>
                        
                        <label className="flex gap-3 items-start cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={appForm.consentSpecs}
                            onChange={(e) => setAppForm(prev => ({ ...prev, consentSpecs: e.target.checked }))}
                            className="mt-0.5 accent-red-500 text-red-550 border-white/10 rounded cursor-pointer shrink-0" 
                            id="consent-spec-cb"
                          />
                          <span className="text-neutral-450 leading-relaxed font-light">
                            I will submit original code repositories built during my cohort window. I understand plagiarism prompts instant system blacklist.
                          </span>
                        </label>

                        <label className="flex gap-3 items-start cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={appForm.consentPrivacy}
                            onChange={(e) => setAppForm(prev => ({ ...prev, consentPrivacy: e.target.checked }))}
                            className="mt-0.5 accent-red-500 text-red-550 border-white/10 rounded cursor-pointer shrink-0" 
                            id="consent-privacy-cb"
                          />
                          <span className="text-neutral-450 leading-relaxed font-light">
                            I agree that the **stipend is strictly performance-based up to ₹6,000** (meaning it can be ₹0, ₹100, ₹500 or any amount based on evaluation, or even ₹0 if work is low-quality or does not meet expectations).
                          </span>
                        </label>

                        <label className="flex gap-3 items-start cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={appForm.contributionRead}
                            onChange={(e) => setAppForm(prev => ({ ...prev, contributionRead: e.target.checked }))}
                            className="mt-0.5 accent-red-500 text-red-550 border-white/10 rounded cursor-pointer shrink-0" 
                            id="consent-read-cb"
                          />
                          <span className="text-neutral-450 leading-relaxed font-light">
                            I understand that digital operating contribution fees of ₹149 to ₹299 (depending on internship track) are requested for certification processing. Uploading a **genuine payment screenshot is mandatory**; a manual audit will verify it before my certificate is successfully emailed to me and eventually updated onto the website.
                          </span>
                        </label>
                      </div>

                      {/* Back & Dispatch triggers */}
                      <div className="pt-4 flex justify-between gap-4 border-t border-white/5">
                        <button 
                          type="button" 
                          onClick={() => setApplyStep(1)} 
                          className="px-4 py-2 font-mono text-[10px] text-neutral-450 hover:text-white uppercase tracking-wider cursor-pointer"
                          id="back-to-step-1"
                        >
                          ← Choose Role
                        </button>
                        
                        <button 
                          type="button" 
                          onClick={() => {
                            if (!appForm.fullName || !appForm.email || !appForm.phone || !appForm.college || !appForm.gradYear) {
                              onShowToast('Please provide your bio coordinates.', 'warn');
                              return;
                            }
                            if (!appForm.githubProfile || !appForm.linkedinProfile) {
                              onShowToast('Github and LinkedIn links are mandatory.', 'warn');
                              return;
                            }
                            if (!appForm.resumeFileName) {
                              onShowToast('Please attach your PDF Resume.', 'warn');
                              return;
                            }
                            handleFinalSubmit();
                          }}
                          className="px-6 py-3 bg-red-650 hover:bg-red-500 text-white font-mono text-[10px] uppercase tracking-widest font-extrabold transition-all cursor-pointer shadow-xl shadow-red-500/10 hover:shadow-red-500/20"
                          id="submit-proposal-btn"
                        >
                          Dispatch Application ⚡
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success Dispatch Screen */}
              {applyStep === 3 && (
                <motion.div 
                  key="apply-step-3" 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="space-y-6 text-center py-12"
                  id="success-applied-view"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-white uppercase tracking-wider">COHORT TRANSACTION SECURED</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                      Your application has been logged on the verification queue. Our automatic system will inspect your public repository commits volume within 12 hours. A verified portal code will arrive on <span className="text-white font-mono font-bold">{appForm.email}</span>.
                    </p>
                  </div>

                  <div className="pt-6 flex justify-center gap-4">
                    <button 
                      onClick={() => onNavigate('LANDING')}
                      className="px-6 py-2 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 text-xs font-mono uppercase cursor-pointer"
                      id="suc-ret-landing"
                    >
                      [ RETURN TO PORT ]
                    </button>
                    <button 
                      onClick={() => onNavigate('STUDENT_DASHBOARD')}
                      className="px-4 py-2 bg-white text-black font-bold text-[10px] font-mono uppercase hover:bg-gray-100 cursor-pointer"
                      id="suc-to-dash"
                    >
                      Go to Simulated student portal
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* VERIFY CERTIFICATE DOCK */}
      {/* -------------------------------------------------------------------------------- */}
      {currentPublicView === 'VERIFY' && (
        <div className="max-w-4xl mx-auto px-6 py-24 space-y-12 text-left">
          <div className="space-y-4 border-b border-white/10 pb-8">
            <span className="text-red-500 font-mono text-xs uppercase tracking-widest block">// SECURE_PROOF_LOCK</span>
            <h1 className="text-3xl md:text-5xl font-black text-white">DECENTRALIZED CREDENTIAL DECODE</h1>
            <p className="text-gray-400 text-xs font-light max-w-lg">Verify the structural validity and authenticity hash parameters of signed developer profiles issued by Hellware.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Verification prompt (Cols 1-5) */}
            <form onSubmit={handleVerifyCert} className="lg:col-span-5 bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-6 self-start">
              <span className="font-mono text-[9px] uppercase tracking-widest text-gray-500 block">HANDSHAKE SCANNER</span>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">SHA-256 Certificate Hash or Tracking ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. CERT-HW-14819 or ALEX"
                  value={certInputId} 
                  onChange={(e) => setCertInputId(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-4 py-3 text-xs focus:border-red-500 focus:outline-none font-mono text-white" 
                />
                <span className="text-[9px] text-gray-500 font-mono block">Tip: Type any string containing 'ALEX' or '14819' to test verification success.</span>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors cursor-pointer text-center"
              >
                Scan Credentials →
              </button>
            </form>

            {/* Results feedback frame (Cols 6-12) */}
            <div className="lg:col-span-7">
              {hasSearchedCert ? (
                verifiedCert ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 bg-neutral-900/10 border border-white/5 p-4 rounded-[4px] justify-between">
                      <span className="text-[10px] font-mono uppercase text-gray-500">CREDENTIAL DECRYPTION LOCKS MATCHED</span>
                      <HellwareLogo size="xs" />
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 bg-neutral-900 border border-emerald-500/30 rounded-xl space-y-6 relative overflow-hidden"
                    >
                    {/* Corner badge */}
                    <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 border-l border-b border-emerald-500/20 px-3 py-1 text-[8px] font-mono uppercase tracking-widest font-black">
                      STATUS: GENUINE // SECURED
                    </div>

                    <div className="flex items-start gap-4">
                      <ShieldCheck className="w-12 h-12 text-emerald-400 shrink-0" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-gray-500">ID CODE: {verifiedCert.id}</span>
                        <h4 className="font-bold text-lg text-white uppercase">{verifiedCert.studentName}</h4>
                        <div className="text-xs text-emerald-400 font-bold tracking-widest font-mono uppercase">VERIFIED ACTIVE FELLOW</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-y border-white/5 py-4 font-mono text-xs text-gray-400">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider block text-gray-600">Assigned Track</span>
                        <span className="text-white font-sans uppercase font-bold text-[11px]">{verifiedCert.domain}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-wider block text-gray-600">Project Succeeded</span>
                        <span className="text-white font-sans uppercase font-bold text-[11px] truncate block">{verifiedCert.projectName}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-wider block text-gray-600">Issue Date</span>
                        <span className="text-white">{verifiedCert.completionDate} UTC</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-wider block text-gray-600">Operational Integrity</span>
                        <span className="text-emerald-400">PASSED METRIC SCAN</span>
                      </div>
                    </div>

                    {/* QR code and HMAC specs */}
                    <div className="flex items-center gap-4 bg-black/40 p-4 border border-white/5 rounded-lg">
                      <div className="w-14 h-14 bg-white p-1 rounded shrink-0 flex items-center justify-center">
                        {/* Simple pixelated QR placeholder */}
                        <div className="grid grid-cols-5 gap-0.5 w-full h-full bg-black p-0.5">
                          {Array.from({ length: 25 }).map((_, r) => (
                            <div key={r} className={`w-2 h-2 ${r % 3 === 0 || r % 7 === 1 ? 'bg-white' : 'bg-black'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[8px] font-mono text-gray-500 block uppercase">SHA256 SIGNATURE KEY</span>
                        <span className="text-[9px] font-mono text-gray-400 truncate block select-all">{verifiedCert.hash}</span>
                      </div>
                    </div>

                  </motion.div>
                </div>
              ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="p-12 bg-neutral-900/30 border border-red-500/10 rounded-xl text-center space-y-4"
                  >
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase">UNKNOWN TRACKING SIGNATURE</h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed pt-1">The tracking ID requested does not match our current public logs registry records. Inspect typos carefully.</p>
                    </div>
                  </motion.div>
                )
              ) : (
                <div className="p-12 bg-neutral-900/10 border border-white/5 rounded-xl border-dashed text-center space-y-2 text-gray-500 font-mono text-xs">
                  <span>AWAITING INPUT PARAMETER TO BEGIN HANDSHAKE</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}



      {/* -------------------------------------------------------------------------------- */}
      {/* LEGAL POLICY SECTION PAGES */}
      {/* -------------------------------------------------------------------------------- */}
      {['TERMS', 'PRIVACY', 'REFUND', 'CERT_POLICY'].includes(currentPublicView) && (
        <div className="max-w-4xl mx-auto px-6 py-24 space-y-12 text-left font-sans">
          
          <div className="space-y-4 border-b border-white/10 pb-8">
            <span className="text-red-500 font-mono text-xs uppercase tracking-widest block">// REGULATORY_LEGAL_SEALS</span>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase">
              {currentPublicView === 'TERMS' && 'Terms and Conditions'}
              {currentPublicView === 'PRIVACY' && 'Privacy Policy'}
              {currentPublicView === 'REFUND' && 'Refund Policy'}
              {currentPublicView === 'CERT_POLICY' && 'Certificate Validation Rules'}
            </h1>
            <p className="text-gray-500 text-xs font-mono">REVISION LOGS: May 2026 // SECURE ARCHIVE RECORD</p>
          </div>

          <div className="space-y-8 text-xs md:text-sm text-gray-400 leading-relaxed font-light">
            {currentPublicView === 'TERMS' && (
              <>
                <section className="space-y-2">
                  <h3 className="font-bold text-white text-sm uppercase font-mono">1. Academic & Code Verification Guidelines</h3>
                  <p>All candidates accessing sandbox environments must possess verified GitHub credentials. We monitor incoming source code files dynamically. Candidates submission containing plagiarized, AI-slop copy-paste, or unauthored repository content is instantly flagged and evicted without warning.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="font-bold text-white text-sm uppercase font-mono">2. Mandatory Integrity Protocols</h3>
                  <p>Accessing preparation materials, DSA sheets, and review checklists remains free. Users are strictly forbidden from distributing restricted template logs files outside the core platform nodes boundaries.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="font-bold text-white text-sm uppercase font-mono">3. Server & Ingress Access Constraints</h3>
                  <p>The platform executes on isolation cages mapping to standard port 3000 proxies. Any attempts to brute-force sandbox subdomains, spoof peer feedback hashes, or inject malicious payloads will lead to immediate node blacklists.</p>
                </section>
              </>
            )}

            {currentPublicView === 'PRIVACY' && (
              <>
                <section className="space-y-2">
                  <h3 className="font-bold text-white text-sm uppercase font-mono">1. Collected Payload Parameters</h3>
                  <p>We log your college affiliation indices, GitHub commit patterns, attached resume PDFs, and submission milestones checkbox history. This information is preserved exclusively to generate shareable developer public cards.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="font-bold text-white text-sm uppercase font-mono">2. Analytical Portability Access</h3>
                  <p>Hiring teams receive access to verified student portfolios. We never dispatch phone records or individual verification details to external advertising units.</p>
                </section>
              </>
            )}

            {currentPublicView === 'REFUND' && (
              <>
                <div className="p-6 bg-red-950/20 border border-red-500/10 rounded-lg text-xs leading-relaxed text-gray-300">
                  <h4 className="font-bold text-red-400 uppercase font-mono mb-2">Notice: Voluntary Operations Processing Charges</h4>
                  Operational contributions (₹149–299) allocated to generating cryptography validation keys and compiling high-definition PDF certificates are entirely voluntary and bypassable. Once a payment sequence is validated, funds are dispatched to background compilation cloud clusters immediately, rendering the transaction final and non-refundable.
                </div>
              </>
            )}

            {currentPublicView === 'CERT_POLICY' && (
              <>
                <section className="space-y-2">
                  <h3 className="font-bold text-white text-sm uppercase font-mono">1. Certificate Issue Auditing Heuristics</h3>
                  <p>Certificates are issued strictly upon successful peer and mentor portfolio audits. No certificate is allocated without at least three verified milestones checkpoints ticked green and a live operational proxy URL matching the build.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="font-bold text-white text-sm uppercase font-mono">2. Revocation Matrix</h3>
                  <p>If a student evicts or deletes sandbox configurations within 30 days of cohort completion or is observed committing code plagiarism, Hellware reserves the right to append a [REVOKED] byte token on the public SHA-256 certificate search ledgers.</p>
                </section>
              </>
            )}
          </div>
          
          <button 
            onClick={() => onNavigate('LANDING')} 
            className="px-6 py-2 border border-white/10 hover:border-white/30 text-xs font-mono uppercase text-gray-400 hover:text-white cursor-pointer"
          >
            [ Return to main portal ]
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* IMMERSIVE DETAILED PROJECT / CASE STUDY DISCLOSURE OVERLAY */}
      {/* -------------------------------------------------------------------------------- */}
      {selectedDetailProject && (
        <div id="immersive-project-overlay" className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto flex justify-center py-12 px-4 animate-fadeIn">
          <div className="max-w-5xl w-full bg-neutral-950 border border-white/10 rounded-2xl p-6 md:p-8 space-y-8 relative my-auto shadow-2xl shadow-red-500/5 text-left h-fit">
            
            {/* Upper control cluster */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest block font-bold">// IMMERSIVE_PROJECT_SPECIFICATION</span>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{selectedDetailProject.title}</h2>
                <div className="flex flex-wrap gap-2 items-center text-[10px] font-mono text-neutral-450">
                  <span className="uppercase text-red-400 font-bold">{selectedDetailProject.domain}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded capitalize">{selectedDetailProject.difficulty} TRACK</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDetailProject(null)}
                className="px-4 py-2 border border-red-500 text-red-400 hover:bg-red-500/10 text-xs font-mono uppercase tracking-widest cursor-pointer transition-all self-start md:self-center"
                id="close-overlay-btn"
              >
                [ ← BACK TO PORTAL ]
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Architectural Map & Details */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Architectural Map */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block tracking-widest font-bold">// SECURE_INFRASTRUCTURE_DATAFLOW</span>
                  <div className="bg-black/80 border border-white/5 rounded-xl p-5 font-mono text-[10px] leading-relaxed text-neutral-400 space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-red-400 font-bold">[ CLIENT BROWSER / INTENT ]</span>
                      <span className="text-neutral-600">// TRACEABLE HANDSHAKE</span>
                    </div>
                    {/* Simulated topology box matching the selected project theme */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-550">1. INPUT VECTOR:</span>
                        <span className="text-white">External HTTP / Encrypted Web Interface</span>
                      </div>
                      <div className="text-neutral-600 pl-4">└── [ AES-255 Envelope encryption ]</div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-550">2. CORE KERNEL:</span>
                        <span className="text-white">Active Sandboxed Validation Hub ({selectedDetailProject.techStack[0]})</span>
                      </div>
                      <div className="text-neutral-600 pl-4">└── [ Token check rate-limiter logic ]</div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-550">3. PERSISTENCE:</span>
                        <span className="text-white uppercase">{selectedDetailProject.techStack[selectedDetailProject.techStack.length - 1]} Memory Buffer</span>
                      </div>
                      <div className="text-neutral-600 pl-4">└── [ Replicated telemetry validation ledger ]</div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex gap-4 text-neutral-500 text-[9px]">
                      <span>STATUS: ONLINE</span>
                      <span>SECURE BOUNDS VERIFIED ✓</span>
                    </div>
                  </div>
                </div>

                {/* Scope Description */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block tracking-widest font-bold">// CORE_OBJECTIVES_REGISTRY</span>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">{selectedDetailProject.description}</p>
                </div>

                {/* Tech specifications */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block tracking-widest font-bold">// COMPILED_TECH_STACK</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetailProject.techStack.map((tech) => (
                      <span key={tech} className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[9px] uppercase px-2.5 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action telemetry */}
                <div className="pt-4 border-t border-white/5 flex justify-between gap-4">
                  {selectedDetailProject.githubUrl ? (
                    <a 
                      href={selectedDetailProject.githubUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 text-center py-2.5 bg-neutral-900 border border-white/10 hover:border-white/30 text-white font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Inspect Source Code
                    </a>
                  ) : (
                    <div className="flex-1 text-center py-2.5 border border-white/5 text-neutral-650 font-mono text-[9px] uppercase tracking-widest">
                      [ IP STACK PRIVATE ]
                    </div>
                  )}

                  {selectedDetailProject.liveUrl ? (
                    <a 
                      href={selectedDetailProject.liveUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 text-center py-2.5 bg-red-650 hover:bg-red-550 text-white font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer font-bold"
                    >
                      Access Sandbox Live
                    </a>
                  ) : (
                    <div className="flex-1 text-center py-2.5 border border-white/5 text-neutral-650 font-mono text-[9px] uppercase tracking-widest">
                      [ COMPILATION STAGE ONLY ]
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Interaction Verification Milestones */}
              <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-white/5 lg:pl-8">
                
                {/* Milestone Checklist */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-red-500 block tracking-widest font-bold">// VERIFIED_CHECKPOINT_TRACKER</span>
                    <p className="text-[11px] text-neutral-400">Every task checkpoint must compile cleanly on the cloud pipeline tests to satisfy review checks.</p>
                  </div>

                  <div className="space-y-3">
                    {selectedDetailProject.milestones.map((m) => (
                      <div 
                        key={m.id} 
                        className={`p-3.5 rounded-lg border flex gap-3 items-start select-none transition-all ${
                          m.completed 
                            ? 'bg-emerald-500/[0.02] border-[#10b981]/25 text-neutral-300' 
                            : 'bg-neutral-950/40 border-white/5 text-neutral-400'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center font-bold text-[9px] ${
                          m.completed 
                            ? 'bg-emerald-500 text-black' 
                            : 'bg-neutral-900 border border-white/10 text-neutral-600'
                        }`}>
                          {m.completed ? '✓' : '•'}
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-sans font-light leading-snug block text-neutral-300">{m.text}</span>
                          <span className={`text-[8px] font-mono block ${m.completed ? 'text-emerald-500' : 'text-neutral-600'}`}>
                            {m.completed ? 'COMPILED_STAGE_OK ✓' : 'STANDBY_TESTS'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compiling sandbox simulation launcher block */}
                <div className="bg-neutral-900/30 border border-white/5 p-5 rounded-xl space-y-3">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">// PIPELINE_COMPILATION_UNIT</span>
                  <div className="space-y-2">
                    <p className="text-[11px] font-light text-neutral-450 leading-relaxed">
                      Initialize our real-time audit stack simulation on this project codebase directory.
                    </p>
                    <button 
                      onClick={() => {
                        onShowToast('Initializing Docker isolation containers...', 'success');
                        setTimeout(() => {
                          onShowToast('Scanning HMAC cryptosig signatures...', 'success');
                        }, 1005);
                        setTimeout(() => {
                          onShowToast('COMPRESSION & PARSING COMPLETE: All milestones verified successfully! ✓', 'success');
                        }, 2200);
                      }}
                      className="w-full text-center py-2.5 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-500 font-mono text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                      id="simulate-audit-trigger"
                    >
                      Run Pipeline Simulation Checks ⚡
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ISOMORPHIC DIAGNOSTIC OVERLAY DETECTOR */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur flex items-center justify-center p-6 z-50 font-mono select-none">
          <div className="max-w-xl w-full bg-neutral-950 border border-red-500/30 rounded-lg p-8 space-y-6 text-left relative shadow-2xl">
            
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500" />

            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex justify-between items-center text-[10px] text-red-500 font-black tracking-widest uppercase animate-pulse">
                <span>// CRITICAL CV SCANNING ENVELOPE INBOUND //</span>
                <span>SANDBOX COMPILER LIVE</span>
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">AI Dossier Analysis Sandbox</h3>
            </div>

            {/* Progress animation with diagnostics */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs uppercase font-extrabold text-slate-350">
                <span>Processing payload: {appForm.resumeFileName}</span>
                <span className="text-red-500">{scanProgress}% COMPLETE</span>
              </div>
              <div className="w-full bg-neutral-900 border border-white/5 h-2.5 rounded overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all duration-75"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* Live running diagnostic logging terminal */}
            <div className="h-44 bg-black/95 border border-white/5 rounded p-4 text-[10px] text-gray-400 font-mono uppercase space-y-1.5 overflow-y-auto leading-normal select-text selection:bg-red-500/20 scrollbar-none" id="scanning-terminal-output">
              {scanLogList.map((log, idx) => (
                <div key={idx} className={idx === scanLogList.length - 1 ? 'text-white font-bold tracking-tight animate-pulse' : ''}>
                  {log}
                </div>
              ))}
              <div className="text-red-500 font-black mt-2 animate-pulse">// STRICT EXPERIENTIAL COMPILING CHANNELS CONNECTED...</div>
            </div>

          </div>
        </div>
      )}

        </>
      )}

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

    </div>
  );
}
