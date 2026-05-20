/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Award, Cpu, ShieldAlert, Check, X, Search, Filter, Plus, Edit, Trash2, 
  Send, ListPlus, Radio, Terminal, BookOpen, UserCheck, Trash, Sparkles, AlertCircle, FileText, ChevronRight, Mail,
  CreditCard, Eye, ExternalLink, DollarSign, Activity
} from 'lucide-react';
import { 
  StudentApplication, StudentProject, Submission, Resource, AuditLog, Track, TRACKS 
} from '@/data/mockData';
import type { TimelineStep } from '@/app/page';
import { DEFAULT_TIMELINE } from '@/app/page';

interface BackendApp {
  id: string; fullName: string; email: string; phone: string | null;
  college: string | null; gradYear: string | null; skills: string[];
  status: string; createdAt: string;
}

interface BackendMetrics {
  totalStudents: number; totalApplied: number; totalApproved: number;
  pendingPayments: number; successfulPaymentCount: number; successfulPaymentAmount: number;
}

interface BackendPayment {
  id: string; studentId: string; amountPaid: number;
  transactionHash: string; screenshotUrl: string;
  status: string; rejectionReason: string | null;
  createdAt: string; approvedAt: string | null;
  student: { fullName: string; email: string };
}

interface AdminDashboardProps {
  onLogout: () => void;
  applications: StudentApplication[];
  onAcceptApplication: (aid: string) => void;
  onRejectApplication: (aid: string) => void;
  projects: StudentProject[];
  onCreateProject: (proj: StudentProject) => void;
  onDeleteProject: (pid: string) => void;
  submissions: Submission[];
  onReviewSubmission: (sid: string, status: 'APPROVED' | 'CHANGES_REQUESTED', feedback: string) => void;
  resources: Resource[];
  onCreateResource: (res: Resource) => void;
  onDeleteResource: (rid: string) => void;
  auditLogs: AuditLog[];
  onWriteAuditLog: (action: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => void;
  onShowToast: (msg: string, type: 'success' | 'warn' | 'error') => void;
  authToken?: string;
  backendApplications?: BackendApp[];
  backendMetrics?: BackendMetrics | null;
  onBackendUpdateApp?: (id: string, status: string) => void;
  backendPayments?: BackendPayment[];
  onBackendVerifyPayment?: (id: string, status: string, reason?: string) => void;
  studentStages?: Record<string, string>;
  onUpdateStudentStage?: (email: string, stage: string) => void;
  timelines?: Record<string, TimelineStep[]>;
  onAdvanceTimeline?: (email: string, stepId: string, autoDelay?: number) => Promise<{ success: boolean; error?: string }>;
  getStudentTimeline?: (email: string) => TimelineStep[];
}

export default function AdminDashboard({
  onLogout,
  applications, onAcceptApplication, onRejectApplication,
  projects, onCreateProject, onDeleteProject,
  submissions, onReviewSubmission,
  resources, onCreateResource, onDeleteResource,
  auditLogs, onWriteAuditLog, onShowToast,
  authToken, backendApplications, backendMetrics, onBackendUpdateApp,
  backendPayments, onBackendVerifyPayment,
  studentStages, onUpdateStudentStage,
  timelines, onAdvanceTimeline, getStudentTimeline
}: AdminDashboardProps) {

  // Selected sub view paths
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'APPLICATIONS' | 'STUDENTS' | 'PROJECTS' | 'SUBMISSIONS' | 'RESOURCES' | 'BROADCAST' | 'AUDIT_LOGS' | 'PAYMENTS' | 'CERTIFICATES' | 'TIMELINE'>('TIMELINE');

  // Application filter states
  const [appSearch, setAppSearch] = useState('');
  const [appTrackFilter, setAppTrackFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);

  // Student detail view
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetailTab, setStudentDetailTab] = useState<'PROFILE' | 'TASKS' | 'SUBMISSIONS' | 'PROGRESS'>('PROFILE');
  const [studentSearch, setStudentSearch] = useState('');

  // Payment states
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);

  // Stage control states
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [sendingStepEmail, setSendingStepEmail] = useState<string | null>(null);

  // Project creator states
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [newProj, setNewProj] = useState({
    title: 'Distributed Blockchain Ingress Guard',
    domain: 'Cybersecurity',
    difficulty: 'Expert' as any,
    description: 'Construct a Rust-based peer handshake verifying decentralized transaction signatures blocks before distribution.',
    techStackInput: 'Rust, WASM, Docker',
    milestonesInput: 'Setup register isolates, Configure rotate HMAC flags, Deploy ledger verifier'
  });

  // Review states
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('Outstanding implementation patterns. Cryptography keys rotation compiles safely across isolated nodes context tests.');

  // Resource creator states
  const [resFormOpen, setResFormOpen] = useState(false);
  const [newRes, setNewRes] = useState({
    title: 'Advanced Vector Database Memory Tuner',
    category: 'System Design Basics' as any,
    description: 'A deep architectural review documenting cache layers tuning for high-dimensional vector embeddings searches.'
  });

  // Broadcast states
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcastSubject, setBroadcastSubject] = useState('HELLWARE SYSTEM MAINTENANCE ACTIVE');
  const [broadcastBody, setBroadcastBody] = useState('This is to alert all cohorts that database security maintenance rules updates will deploy within zero-downtime guidelines.');
  const [broadcastHistory, setBroadcastHistory] = useState([
    { id: '1', date: '2026-05-18', subject: 'May Cohort Commencement Blueprints Loaded', target: 'All Specializations' }
  ]);

  // Dynamic analytic status computations
  const statsOverview = useMemo(() => {
    return {
      totalApplicants: applications.length,
      pendingApps: applications.filter(a => a.status === 'PENDING').length,
      activeinterns: applications.filter(a => a.status === 'ACCEPTED').length,
      pendingReviews: submissions.filter(s => s.status === 'PENDING' || s.status === 'UNDER_REVIEW').length,
      completions: submissions.filter(s => s.status === 'APPROVED').length,
      contributionsEstimate: commissionsReceived(submissions.filter(s => s.status === 'APPROVED').length)
    };
  }, [applications, submissions]);

  function commissionsReceived(count: number) {
    return count * 299; // Mocking estimation model
  }

  // Application filter execution
  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const matchSearch = a.fullName.toLowerCase().includes(appSearch.toLowerCase()) || a.email.toLowerCase().includes(appSearch.toLowerCase());
      const matchTrack = appTrackFilter === 'ALL' || a.domainInterest.toLowerCase().includes(appTrackFilter.toLowerCase()) || appTrackFilter.toLowerCase().includes(a.domainInterest.toLowerCase());
      return matchSearch && matchTrack;
    });
  }, [applications, appSearch, appTrackFilter]);

  // Project Creation Dispatcher
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProj.title || !newProj.description) {
      onShowToast('Project title and descriptions can not be left blank', 'warn');
      return;
    }

    const tStack = newProj.techStackInput.split(',').map(s => s.trim());
    const mStones = newProj.milestonesInput.split(',').map((s, idx) => ({
      id: `m-custom-${Date.now()}-${idx}`,
      text: s.trim(),
      completed: false
    }));

    onCreateProject({
      id: `proj-${Date.now()}`,
      title: newProj.title,
      domain: newProj.domain,
      difficulty: newProj.difficulty,
      description: newProj.description,
      techStack: tStack,
      milestones: mStones
    });

    setProjectFormOpen(false);
    onWriteAuditLog(`CREATED PROJECT BLUEPRINT: ${newProj.title.toUpperCase()}`, 'INFO');
    onShowToast(`Dispatched project ${newProj.title} to global listings registry.`, 'success');
  };

  // Resources Creation Dispatcher
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.title || !newRes.description) {
      onShowToast('Resource titles can not be empty', 'warn');
      return;
    }

    onCreateResource({
      id: `res-${Date.now()}`,
      title: newRes.title,
      category: newRes.category,
      description: newRes.description,
      url: '#'
    });

    setResFormOpen(false);
    onWriteAuditLog(`UPLOADED INTEL RESOURCE: ${newRes.title.toUpperCase()}`, 'INFO');
    onShowToast(`Published resource asset: ${newRes.title}`, 'success');
  };

  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastBody) {
      onShowToast('Verify broadcast subject and body variables are set.', 'warn');
      return;
    }

    setBroadcastHistory(prev => [
      {
        id: `bc-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        subject: broadcastSubject,
        target: broadcastTarget === 'ALL' ? 'All Cohorts Enlisted' : `Cohort specializing in: ${broadcastTarget}`
      },
      ...prev
    ]);

    onWriteAuditLog(`BROADCASTED SYSTEM-WIDE EMAIL OUTBOX: ${broadcastSubject.toUpperCase()}`, 'CRITICAL');
    onShowToast(`Transmitted broadcast alerts safely to target queues.`, 'success');
    setBroadcastSubject('');
    setBroadcastBody('');
  };


  return (
    <div className="flex bg-neutral-950 min-h-screen text-white text-left font-sans select-none overflow-x-hidden selection:bg-red-500/20">
      
      {/* 1. ADMIN EXCLUSIVE SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-black flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
        <div className="p-6 space-y-8">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-black font-mono tracking-tighter text-sm">
              AD
            </div>
            <div>
              <span className="font-bold text-xs uppercase block tracking-wider text-white">ADMIN SECTOR</span>
              <span className="text-[8px] font-mono text-gray-500 block uppercase tracking-widest">// SECURED CONTROL ROOT</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'OVERVIEW', label: 'METRICS OVERVIEW', icon: <Cpu className="w-4 h-4" /> },
              { id: 'APPLICATIONS', label: 'APPLICANTS QUEUE', icon: <Users className="w-4 h-4" /> },
              { id: 'STUDENTS', label: 'STUDENT PROFILES', icon: <UserCheck className="w-4 h-4" /> },
              { id: 'PROJECTS', label: 'PROJECT BLUEPRINTS', icon: <ListPlus className="w-4 h-4" /> },
              { id: 'SUBMISSIONS', label: 'SUBMISSIONS REVIEW', icon: <FileText className="w-4 h-4" /> },
              { id: 'PAYMENTS', label: 'PAYMENT VERIFICATION', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'CERTIFICATES', label: 'CERTIFICATES', icon: <Award className="w-4 h-4" /> },
              { id: 'RESOURCES', label: 'INTEL ASSETS', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'BROADCAST', label: 'EMAIL BROADCAST', icon: <Mail className="w-4 h-4" /> },
              { id: 'TIMELINE', label: 'MAIL ORCHESTRATION', icon: <Send className="w-4 h-4 text-emerald-400" /> },
              { id: 'AUDIT_LOGS', label: 'CRITICAL AUDIT LOGS', icon: <Terminal className="w-4 h-4" /> },
            ].map((stb) => (
              <button
                key={stb.id}
                onClick={() => setActiveTab(stb.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-mono font-bold tracking-wide uppercase rounded cursor-pointer transition-colors ${
                  activeTab === stb.id 
                    ? 'bg-white/10 text-white font-black border-l-2 border-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                {stb.icon}
                <span>{stb.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Card info sidebar bottom */}
        <div className="p-4 border-t border-white/5 bg-neutral-900/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white uppercase">
              SU
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block">Thorne (Superuser)</span>
              <span className="text-[8px] font-mono text-gray-500 block">sysop@hellware.in</span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full py-1.5 bg-white/5 hover:bg-white/10 hover:text-white text-[10px] font-mono text-gray-400 font-bold uppercase rounded border border-white/5 transition-colors cursor-pointer"
          >
            Terminal logout
          </button>
        </div>
      </aside>

      {/* 2. CHOSEN ADMIN PANEL WINDOW */}
      <main className="flex-1 min-h-screen flex flex-col justify-between overflow-x-hidden relative">
        
        <header className="border-b border-white/5 bg-black px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-gray-400 font-bold">// INST: RUNNING_OK</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-none">SYS_ZONE CORE LEDGER</span>
        </header>

        <div className="px-8 py-10 flex-1 max-w-5xl w-full mx-auto space-y-8">
          
          {/* ======================================================= */}
          {/* A. OVERVIEW DOCK                                       */}
          {/* ======================================================= */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8">
              
              {/* Backend metrics (when connected) */}
              {backendMetrics ? (
                <div className="space-y-2">
                  <span className="text-[8px] font-mono text-emerald-500 uppercase block font-bold">// BACKEND LIVE METRICS</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'TOTAL STUDENTS (BACKEND)', value: backendMetrics.totalStudents, d: 'PostgreSQL live count' },
                      { label: 'APPLIED', value: backendMetrics.totalApplied, d: 'Status: APPLIED', color: 'text-amber-500' },
                      { label: 'APPROVED / VERIFIED', value: backendMetrics.totalApproved, d: 'Status: APPROVED/VERIFIED', color: 'text-emerald-400' },
                      { label: 'PAYMENT COLLECTED', value: `₹${backendMetrics.successfulPaymentAmount}`, d: `${backendMetrics.successfulPaymentCount} successful`, color: 'text-blue-400' }
                    ].map((stat, sIdx) => (
                      <div key={`be-${sIdx}`} className="bg-emerald-950/20 p-6 rounded-xl border border-emerald-500/10 space-y-2 text-left">
                        <span className="text-[8px] font-mono text-emerald-500/70 uppercase block font-bold leading-tight">{stat.label}</span>
                        <div className={`text-3xl font-black font-mono tracking-tight ${stat.color || 'text-white'}`}>{stat.value}</div>
                        <span className="text-[9px] font-mono text-gray-600 block">{stat.d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Stat metrics cards grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'TOTAL SUBMITTED APPLICATION', value: statsOverview.totalApplicants, d: 'All profiles logged' },
                  { label: 'PENDING ADMISSIONS CHECKS', value: statsOverview.pendingApps, d: 'Requires triage reviews', color: 'text-amber-500' },
                  { label: 'AWAITING REVIEWS', value: statsOverview.pendingReviews, d: 'Pending submittals evaluation', color: 'text-blue-400 font-extrabold' },
                  { label: 'TOTAL SYSTEM COMPLETIONS', value: statsOverview.completions, d: 'Certificates signed off' }
                ].map((stat, sIdx) => (
                  <div key={sIdx} className="bg-neutral-900/60 p-6 rounded-xl border border-white/5 space-y-2 text-left">
                    <span className="text-[8px] font-mono text-gray-500 uppercase block font-bold leading-tight">{stat.label}</span>
                    <div className={`text-3xl font-black font-mono tracking-tight ${stat.color || 'text-white'}`}>{stat.value}</div>
                    <span className="text-[9px] font-mono text-gray-600 block">{stat.d}</span>
                  </div>
                ))}
              </div>

              {/* Main review summaries and quick activities log feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Active review pending blocks (Cols 1-7) */}
                <div className="lg:col-span-7 bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-4 self-start">
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                    <span className="font-mono text-[9px] text-gray-500 uppercase block font-bold">// EVALUATION CHECKS QUEUE</span>
                    <button onClick={() => setActiveTab('SUBMISSIONS')} className="text-white hover:underline text-[9px] font-mono">[ ANALYZE ALL QUEUES ]</button>
                  </div>

                  <div className="divide-y divide-white/5 max-h-80 overflow-y-auto space-y-3 pt-2">
                    {submissions.filter(s => s.status === 'PENDING' || s.status === 'UNDER_REVIEW').map((sub) => (
                      <div key={sub.id} className="pt-2 text-xs flex justify-between items-center bg-black/30 p-3 rounded border border-white/5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block uppercase text-[11px] hover:text-red-400 cursor-pointer" onClick={() => { setSelectedSub(sub); setActiveTab('SUBMISSIONS'); }}>{sub.studentName}</span>
                          <span className="text-[8px] text-gray-500 block uppercase font-mono">{sub.domain} SPECIALIZATION</span>
                        </div>
                        <button 
                          onClick={() => { setSelectedSub(sub); setActiveTab('SUBMISSIONS'); }}
                          className="px-3 py-1.5 bg-white text-black text-[9px] font-sans hover:bg-gray-200 transition-colors cursor-pointer rounded uppercase"
                        >
                          Review details →
                        </button>
                      </div>
                    ))}
                    {submissions.filter(s => s.status === 'PENDING' || s.status === 'UNDER_REVIEW').length === 0 && (
                      <div className="text-center font-mono text-xs text-gray-600 py-6">SUBMISSIONS QUEUE ENTIRELY RESOLVED CHECKOUT OK.</div>
                    )}
                  </div>
                </div>

                {/* Live activities audits stream logs (Cols 8-12) */}
                <div className="lg:col-span-5 bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-4">
                  <span className="font-mono text-[9px] text-gray-500 uppercase block font-bold">// LOG STREAM TERMINAL</span>
                  
                  <div className="font-mono text-[10px] space-y-2 bg-black p-4 rounded border border-white/5 max-h-80 overflow-y-auto">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="text-left text-gray-400 leading-relaxed max-w-sm truncate">
                        <span className="text-gray-600">[{log.timestamp}]</span>{' '}
                        <span className={log.severity === 'CRITICAL' ? 'text-red-500 font-bold' : log.severity === 'WARNING' ? 'text-amber-500' : 'text-emerald-400'}>
                          {log.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* B. APPLICATIONS MANAGEMENT BLOCK                       */}
          {/* ======================================================= */}
          {activeTab === 'APPLICATIONS' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div className="space-y-2">
                  <span className="text-gray-500 font-mono text-xs uppercase block">// SYS_INGRESS_QUEUE</span>
                  <h1 className="text-3xl font-black text-white">COHORT ENROLLMENT DESKS</h1>
                  <p className="text-gray-400 text-xs">Authorize, accept, or reject student applicants in real-time.</p>
                </div>

                {/* Filter and search parameters */}
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="text" 
                    placeholder="Search candidate registry..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="bg-neutral-900 text-xs border border-white/5 px-3 py-1.5 focus:outline-none focus:border-red-500" 
                  />
                  <select 
                    value={appTrackFilter}
                    onChange={(e) => setAppTrackFilter(e.target.value)}
                    className="bg-neutral-900 text-xs border border-white/5 px-3 py-1.5"
                  >
                    <option value="ALL">All tracks</option>
                    <option value="Cyber">Cybersecurity</option>
                    <option value="AI">AI Engineering</option>
                    <option value="Full">Full-Stack</option>
                  </select>
                </div>
              </div>

              {/* Backend live applications (when connected) */}
              {backendApplications && backendApplications.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-[8px] font-mono text-emerald-500 uppercase block font-bold">// BACKEND LIVE APPLICATIONS</span>
                  <div className="bg-black border border-emerald-500/20 rounded-xl overflow-hidden">
                    <div className="bg-emerald-950/30 px-6 py-3 border-b border-emerald-500/10 text-[9px] font-mono text-emerald-500 uppercase tracking-wider grid grid-cols-12 gap-4">
                      <span className="col-span-3">CANDIDATE</span>
                      <span className="col-span-3">INSTITUTION</span>
                      <span className="col-span-2">SKILLS</span>
                      <span className="col-span-1">STATUS</span>
                      <span className="col-span-3 text-right">OPERATIONS</span>
                    </div>
                    <div className="divide-y divide-emerald-500/5">
                      {backendApplications.map((app) => (
                        <div key={app.id} className="px-6 py-3.5 flex flex-col md:grid md:grid-cols-12 gap-4 items-center text-xs tracking-tight hover:bg-emerald-950/10">
                          <div className="col-span-3 text-left">
                            <span className="font-bold text-white block uppercase">{app.fullName}</span>
                            <span className="text-[10px] text-gray-500 font-mono block">{app.email}</span>
                          </div>
                          <span className="col-span-3 text-gray-300 text-[10px] uppercase truncate block w-full">{app.college || '-'}</span>
                          <span className="col-span-2 font-mono text-[10px] text-gray-400 truncate">{app.skills?.join(', ') || '-'}</span>
                          <span className={`col-span-1 font-mono text-[9px] uppercase px-2 py-0.5 rounded ${
                            app.status === 'APPROVED' || app.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400' :
                            app.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                            app.status === 'APPLIED' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>{app.status}</span>
                          <div className="col-span-3 text-right flex justify-end gap-2 text-xs">
                            {app.status === 'APPLIED' ? (
                              <>
                                <button onClick={() => { onBackendUpdateApp?.(app.id, 'APPROVED'); onWriteAuditLog(`BACKEND APPROVED: ${app.fullName.toUpperCase()}`, 'INFO'); onShowToast(`Backend approved ${app.fullName}`, 'success'); }} className="p-1 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/10 rounded cursor-pointer" title="Approve"><Check className="w-4 h-4" /></button>
                                <button onClick={() => { onBackendUpdateApp?.(app.id, 'REJECTED'); onWriteAuditLog(`BACKEND REJECTED: ${app.fullName.toUpperCase()}`, 'WARNING'); onShowToast(`Backend rejected ${app.fullName}`, 'error'); }} className="p-1 text-red-400 hover:bg-red-500/10 border border-red-500/10 rounded cursor-pointer" title="Reject"><X className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <span className="text-[9px] font-mono text-gray-600 block uppercase">{app.status}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Candidates listings table (mock simulation) */}
              <div className="bg-black border border-white/5 rounded-xl overflow-hidden">
                <div className="bg-neutral-900 px-6 py-3 border-b border-white/5 text-[9px] font-mono text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-4">
                  <span className="col-span-3">CANDIDATE INFOLOGY</span>
                  <span className="col-span-3">ACADEMIC INSTITUTION</span>
                  <span className="col-span-3">DESIRED DISC DISCIPLINE</span>
                  <span className="col-span-1">STATUS</span>
                  <span className="col-span-2 text-right">OPERATIONS</span>
                </div>

                <div className="divide-y divide-white/5">
                  {filteredApps.map((candidate) => (
                    <div key={candidate.id} className="px-6 py-3.5 flex flex-col md:grid md:grid-cols-12 gap-4 items-center text-xs tracking-tight hover:bg-white/[0.01]">
                      
                      <div className="col-span-3 text-left">
                        <span className="font-bold text-white block uppercase">{candidate.fullName}</span>
                        <span className="text-[10px] text-gray-500 font-mono block">{candidate.email}</span>
                      </div>

                      <span className="col-span-3 text-gray-300 text-[10px] uppercase truncate block w-full">{candidate.college}</span>
                      <span className="col-span-3 font-mono text-[10px] text-gray-400 capitalize">{candidate.domainInterest}</span>
                      
                      <span className={`col-span-1 font-mono text-[9px] uppercase px-2 py-0.5 rounded ${
                        candidate.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' :
                        candidate.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>{candidate.status}</span>

                      {/* Acceptance operations actions */}
                      <div className="col-span-2 text-right flex justify-end gap-2 text-xs">
                        {candidate.status === 'PENDING' ? (
                          <>
                            <button 
                              onClick={() => {
                                onAcceptApplication(candidate.id);
                                onWriteAuditLog(`ACCEPTED CANDIDATE INGRESS: ${candidate.fullName.toUpperCase()}`, 'INFO');
                                onShowToast(`Authorized and enroled candidate: ${candidate.fullName}`, 'success');
                              }}
                              className="p-1 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/10 rounded cursor-pointer"
                              title="Accept Entry"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                onRejectApplication(candidate.id);
                                onWriteAuditLog(`DENIED APPLICATION ACCESS: ${candidate.fullName.toUpperCase()}`, 'WARNING');
                                onShowToast(`Denied admission registry for ${candidate.fullName}`, 'error');
                              }}
                              className="p-1 text-red-400 hover:bg-red-500/10 border border-red-500/10 rounded cursor-pointer"
                              title="Deny Entry"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[9px] font-mono text-gray-600 block uppercase">No Actions required</span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================= */}
          {/* H. STUDENT PROFILES & DETAIL VIEW                      */}
          {/* ======================================================= */}
          {activeTab === 'STUDENTS' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div className="space-y-2">
                  <span className="text-gray-500 font-mono text-xs uppercase block">// STUDENT_REGISTRY</span>
                  <h1 className="text-3xl font-black text-white">STUDENT PROFILES</h1>
                  <p className="text-gray-400 text-xs">View each student's assigned tasks, submissions, and progress.</p>
                </div>
                <input 
                  type="text" 
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="bg-neutral-900 text-xs border border-white/5 px-3 py-1.5 focus:outline-none focus:border-red-500 w-64" 
                />
              </div>

              {/* Merge mock + backend students */}
              {(() => {
                const mockStudents = applications.map(a => ({
                  id: a.id, fullName: a.fullName, email: a.email,
                  college: a.college, skills: a.skills, status: a.status === 'ACCEPTED' ? 'APPROVED' : a.status,
                  hasSubmitted: submissions.some(s => s.studentEmail === a.email),
                  submissions: submissions.filter(s => s.studentEmail === a.email),
                  submissionsCount: submissions.filter(s => s.studentEmail === a.email).length
                }));
                const backendList = (backendApplications || []).map(a => ({
                  id: a.id, fullName: a.fullName, email: a.email,
                  college: a.college || '', skills: a.skills, status: a.status,
                  hasSubmitted: submissions.some(s => s.studentEmail === a.email),
                  submissions: submissions.filter(s => s.studentEmail === a.email),
                  submissionsCount: submissions.filter(s => s.studentEmail === a.email).length
                }));
                const allStudents = [...backendList, ...mockStudents.filter(m => !backendList.some(b => b.email === m.email))];
                const filtered = allStudents.filter(s =>
                  s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                  s.email.toLowerCase().includes(studentSearch.toLowerCase())
                );
                const selected = allStudents.find(s => s.id === selectedStudentId);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Student list */}
                    <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-2">
                      {filtered.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedStudentId(s.id); setStudentDetailTab('PROFILE'); }}
                          className={`w-full text-left p-4 rounded-lg border text-xs transition-all cursor-pointer ${
                            selectedStudentId === s.id
                              ? 'bg-white/10 border-white text-white'
                              : 'bg-neutral-900/40 border-white/5 text-gray-400 hover:border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-white block uppercase text-[11px]">{s.fullName}</span>
                              <span className="text-[9px] text-gray-500 font-mono block">{s.email}</span>
                            </div>
                            <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                              s.status === 'APPROVED' || s.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400' :
                              s.status === 'APPLIED' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>{s.status}</span>
                          </div>
                          <div className="mt-2 flex gap-2 text-[8px] text-gray-600">
                            <span>{s.college || '-'}</span>
                            <span>•</span>
                            <span>{s.submissionsCount} submission{s.submissionsCount !== 1 ? 's' : ''}</span>
                          </div>
                        </button>
                      ))}
                      {filtered.length === 0 && (
                        <div className="text-center font-mono text-xs text-gray-600 py-8">No students found.</div>
                      )}
                    </div>

                    {/* Student detail panel */}
                    <div className="lg:col-span-8">
                      {selected ? (
                        <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-6 space-y-6">
                          {/* Detail sub-tabs */}
                          <div className="flex gap-2 border-b border-white/5 pb-4">
                            {(['PROFILE', 'TASKS', 'SUBMISSIONS', 'PROGRESS'] as const).map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setStudentDetailTab(tab)}
                                className={`text-[9px] font-mono uppercase tracking-wider px-3 py-1.5 rounded cursor-pointer transition-colors ${
                                  studentDetailTab === tab ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-white'
                                }`}
                              >
                                {tab === 'PROFILE' ? 'Profile' : tab === 'TASKS' ? 'Assigned Tasks' : tab === 'SUBMISSIONS' ? 'Submissions' : 'Progress'}
                              </button>
                            ))}
                          </div>

                          {/* PROFILE tab */}
                          {studentDetailTab === 'PROFILE' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="space-y-3">
                                  <div><span className="text-gray-500 font-mono text-[9px] uppercase block">Full Name</span><span className="text-white font-bold">{selected.fullName}</span></div>
                                  <div><span className="text-gray-500 font-mono text-[9px] uppercase block">Email</span><span className="text-white">{selected.email}</span></div>
                                  <div><span className="text-gray-500 font-mono text-[9px] uppercase block">College</span><span className="text-white">{selected.college || '-'}</span></div>
                                </div>
                                <div className="space-y-3">
                                  <div><span className="text-gray-500 font-mono text-[9px] uppercase block">Status</span><span className={`font-bold ${selected.status === 'APPROVED' || selected.status === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-500'}`}>{selected.status}</span></div>
                                  <div><span className="text-gray-500 font-mono text-[9px] uppercase block">Skills</span><span className="text-white">{(selected.skills?.join(', ') || '-')}</span></div>
                                  <div><span className="text-gray-500 font-mono text-[9px] uppercase block">Submissions</span><span className="text-white">{selected.submissionsCount}</span></div>
                                </div>
                              </div>

                              {/* Stage Control */}
                              <div className="border-t border-white/10 pt-4 space-y-3">
                                <span className="text-[9px] text-gray-500 font-mono uppercase block font-bold">// STAGE CONTROL</span>
                                <div className="flex items-center gap-3">
                                  <select
                                    value={studentStages?.[selected.email] || 'APPLIED'}
                                    onChange={(e) => onUpdateStudentStage?.(selected.email, e.target.value)}
                                    className="bg-neutral-900 text-xs border border-white/10 px-3 py-1.5 focus:outline-none focus:border-red-500 text-white font-mono"
                                  >
                                    {['APPLIED', 'ONBOARDED', 'INTERNSHIP', 'COMPLETED', 'CERTIFICATION_READY', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'CERTIFICATE_ISSUED'].map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                                    (studentStages?.[selected.email] || 'APPLIED') === 'CERTIFICATE_ISSUED' ? 'bg-emerald-500/10 text-emerald-400' :
                                    (studentStages?.[selected.email] || 'APPLIED') === 'CERTIFICATION_READY' ? 'bg-amber-500/10 text-amber-500' :
                                    (studentStages?.[selected.email] || 'APPLIED') === 'INTERNSHIP' ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-gray-500/10 text-gray-400'
                                  }`}>
                                    Current: {studentStages?.[selected.email] || 'APPLIED'}
                                  </span>
                                </div>
                              </div>

                              {/* Email Generator */}
                              <div className="border-t border-white/10 pt-4 space-y-3">
                                <span className="text-[9px] text-gray-500 font-mono uppercase block font-bold">// EMAIL GENERATOR (GROQ)</span>
                                <div className="flex gap-2">
                                  {(['welcome', 'completion', 'certificate_ready', 'payment_verified'] as const).map(type => (
                                    <button
                                      key={type}
                                      onClick={async () => {
                                        setEmailLoading(true);
                                        setGeneratedEmail('');
                                        try {
                                          const res = await fetch('/api/llm/generate-email', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              studentName: selected.fullName,
                                              studentEmail: selected.email,
                                              internshipDomain: 'Cyber Security',
                                              emailType: type,
                                            }),
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            setGeneratedEmail(data.data.emailContent);
                                          } else {
                                            onShowToast('Failed to generate email', 'error');
                                          }
                                        } catch {
                                          onShowToast('Failed to generate email', 'error');
                                        }
                                        setEmailLoading(false);
                                      }}
                                      disabled={emailLoading}
                                      className="py-1 px-3 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/5 font-mono text-[9px] rounded uppercase cursor-pointer disabled:opacity-50"
                                    >
                                      {emailLoading ? '...' : type.replace('_', ' ')}
                                    </button>
                                  ))}
                                </div>
                                {generatedEmail && (
                                  <div className="relative bg-black/60 border border-white/5 rounded-lg p-4 text-xs text-gray-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {generatedEmail}
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(generatedEmail); onShowToast('Email copied!', 'success'); }}
                                      className="absolute top-2 right-2 py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-[8px] font-mono uppercase rounded border border-white/5 cursor-pointer"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* TASKS tab */}
                          {studentDetailTab === 'TASKS' && (
                            <div className="space-y-4">
                              {projects.filter(p => selected.submissions.some(s => s.projectId === p.id)).length > 0 ? (
                                projects.filter(p => selected.submissions.some(s => s.projectId === p.id)).map((proj) => (
                                  <div key={proj.id} className="bg-black/40 border border-white/5 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-bold text-sm text-white">{proj.title}</h4>
                                        <span className="text-[10px] text-gray-500 font-mono">{proj.domain} • {proj.difficulty}</span>
                                      </div>
                                      <span className="text-[9px] text-gray-500 font-mono">{proj.milestones.filter(m => m.completed).length}/{proj.milestones.length} done</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {proj.milestones.map((m) => (
                                        <div key={m.id} className="flex items-center gap-2 text-[10px]">
                                          <div className={`w-3 h-3 rounded-full border ${m.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`} />
                                          <span className={m.completed ? 'text-gray-400 line-through' : 'text-gray-300'}>{m.text}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center font-mono text-xs text-gray-600 py-8">No tasks assigned yet.</div>
                              )}
                            </div>
                          )}

                          {/* SUBMISSIONS tab */}
                          {studentDetailTab === 'SUBMISSIONS' && (
                            <div className="space-y-3">
                              {selected.submissions.length > 0 ? selected.submissions.map((sub) => (
                                <div key={sub.id} className="bg-black/40 border border-white/5 rounded-lg p-4 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-bold text-xs text-white">{sub.projectName}</span>
                                      <span className="text-[9px] text-gray-500 font-mono block">{sub.submittedDate}</span>
                                    </div>
                                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                                      sub.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                      sub.status === 'CHANGES_REQUESTED' ? 'bg-amber-500/10 text-amber-500' :
                                      'bg-blue-500/10 text-blue-400'
                                    }`}>{sub.status}</span>
                                  </div>
                                  {sub.githubUrl && <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-[10px] text-red-500 hover:underline block">GitHub →</a>}
                                  {sub.liveUrl && <a href={sub.liveUrl} target="_blank" rel="noreferrer" className="text-[10px] text-red-500 hover:underline block">Live →</a>}
                                  {sub.feedback && <div className="text-[10px] text-gray-400 italic p-2 bg-black/30 rounded">"{sub.feedback}"</div>}
                                </div>
                              )) : (
                                <div className="text-center font-mono text-xs text-gray-600 py-8">No submissions yet.</div>
                              )}
                            </div>
                          )}

                          {/* PROGRESS tab */}
                          {studentDetailTab === 'PROGRESS' && (
                            <div className="space-y-4">
                              <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                                <span className="text-[9px] text-gray-500 font-mono uppercase block mb-2">Weekly Progress Overview</span>
                                <div className="flex items-center gap-4">
                                  <div className="flex-1 bg-neutral-800 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, selected.submissionsCount * 25)}%` }} />
                                  </div>
                                  <span className="text-xs font-mono text-emerald-400">{Math.min(100, selected.submissionsCount * 25)}%</span>
                                </div>
                                <div className="mt-3 text-[10px] text-gray-500 font-mono">
                                  {selected.submissionsCount} submission{selected.submissionsCount !== 1 ? 's' : ''} completed
                                  {selected.submissions.filter(s => s.status === 'APPROVED').length > 0 ? ` • ${selected.submissions.filter(s => s.status === 'APPROVED').length} approved` : ''}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-12 border border-white/5 border-dashed rounded text-center text-xs font-mono text-gray-500">
                          <span>SELECT A STUDENT FROM THE REGISTRY</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ======================================================= */}
          {/* C. PROJECT BLUEPRINTS DATABASE MANAGEMENT BLOCK        */}
          {/* ======================================================= */}
          {activeTab === 'PROJECTS' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div className="space-y-2">
                  <span className="text-gray-500 font-mono text-xs uppercase block">// CORE_PROJECT_BLUEPRINTS</span>
                  <h1 className="text-3xl font-black text-white">SYSTEMS ASSIGNMENTS BLUEPRINTS</h1>
                  <p className="text-gray-400 text-xs">Author, list, update or evict standardized engineering project descriptions.</p>
                </div>

                <button 
                  onClick={() => setProjectFormOpen(true)}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs font-mono uppercase tracking-widest hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create project blueprint
                </button>
              </div>

              {/* Projects display catalog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-6 bg-neutral-900 border border-white/5 rounded-xl space-y-4 flex flex-col justify-between text-left h-64">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase">
                        <span>{proj.domain}</span>
                        <span className="text-[10px] bg-white/5 px-2.5 rounded font-black text-white">{proj.difficulty}</span>
                      </div>
                      <h4 className="font-bold text-base text-white hover:text-red-400 transition-colors">{proj.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-light truncate">{proj.description}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack.map((tk) => (
                          <span key={tk} className="text-[9px] font-mono bg-black px-2 py-0.5 rounded text-gray-400 border border-white/5">{tk}</span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-gray-600 uppercase block">{proj.milestones.length} active checkpoints</span>
                        <button 
                          onClick={() => {
                            onDeleteProject(proj.id);
                            onWriteAuditLog(`EVICTED PROJECT BLUEPRINT ID: ${proj.id}`, 'WARNING');
                            onShowToast('Blueprint dismantled safely.', 'error');
                          }}
                          className="p-1 text-red-500 hover:bg-red-500/10 border border-red-500/10 rounded cursor-pointer"
                          title="Shed Blueprint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ======================================================= */}
          {/* D. SUBMISSIONS QUEUE EVALUATION PANEL                 */}
          {/* ======================================================= */}
          {activeTab === 'SUBMISSIONS' && (
            <div className="space-y-8 text-left">
              
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-gray-500 font-mono text-xs uppercase block">// AUDITING_PORTAL_INTERACT</span>
                <h1 className="text-3xl font-black text-white">SUBMISSIONS ASSESSMENT HANGAR</h1>
                <p className="text-xs text-gray-400">Scan candidate submitted files, live deployment routes, and sign off certificate dispatches.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Available submissions checklist queue */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">AWAITING REVIEW QUEUES</span>
                  
                  <div className="space-y-2 divide-y divide-white/5">
                    {submissions.map((subItem) => (
                      <div 
                        key={subItem.id}
                        onClick={() => setSelectedSub(subItem)}
                        className={`p-4 rounded border transition-all cursor-pointer ${
                          selectedSub?.id === subItem.id 
                            ? 'bg-white/10 border-white text-white font-black' 
                            : 'bg-neutral-900/40 border-white/5 text-gray-400 hover:border-white/10'
                        }`}
                      >
                        <h5 className="font-bold text-xs uppercase">{subItem.studentName}</h5>
                        <span className="text-[8px] font-mono block truncate uppercase mt-1 text-gray-500">{subItem.projectName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submissions feedback assessment parameters */}
                <div className="lg:col-span-7">
                  {selectedSub ? (
                    <div className="bg-neutral-950 p-6 rounded-xl border border-white/5 space-y-6">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-gray-500 block uppercase">ID_CERT : {selectedSub.id}</span>
                        <h4 className="font-bold text-lg text-white uppercase">{selectedSub.studentName}</h4>
                        <span className="text-[9px] text-amber-500 font-mono tracking-widest font-bold uppercase">{selectedSub.status}</span>
                      </div>

                      {/* Links display */}
                      <div className="grid grid-cols-2 gap-4 font-mono text-[10px] bg-black/40 p-4 border border-white/5 rounded">
                        <div>
                          <span className="text-gray-600 block">GITHUB CODESETS LINK</span>
                          <a href={selectedSub.githubUrl} target="_blank" rel="noreferrer" className="text-red-500 hover:underline truncate block">GitHub repository →</a>
                        </div>
                        <div>
                          <span className="text-gray-600 block">LIVE DEPLOY PROXY</span>
                          <a href={selectedSub.liveUrl} target="_blank" rel="noreferrer" className="text-red-500 hover:underline truncate block">Active sandbox sub →</a>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <span className="text-[9px] text-gray-500 font-mono uppercase block">CANDIDATE DOCUMENTATION REMARK CARDS:</span>
                        <div className="p-4 bg-black/30 border border-white/5 rounded text-gray-400 italic">"{selectedSub.notes}"</div>
                      </div>

                      {/* Review assessment dynamic actions */}
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <span className="font-mono text-[9px] text-gray-500 uppercase block font-bold">DISPATCH ASSESSOR FEEDBACK MATRIX</span>
                        
                        <textarea 
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          className="w-full h-24 bg-black border border-white/10 p-4 font-mono text-xs text-white rounded focus:outline-none focus:border-red-500" 
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => {
                              onReviewSubmission(selectedSub.id, 'APPROVED', reviewFeedback);
                              onWriteAuditLog(`SIGNED OFF CERTIFICATE DISPATCH FOR: ${selectedSub.studentName.toUpperCase()}`, 'INFO');
                              onShowToast(`Dispatched certificate approval registry to: ${selectedSub.studentName}`, 'success');
                              setSelectedSub(null);
                            }}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-[10px] font-mono tracking-widest uppercase transition-colors cursor-pointer text-center"
                          >
                            ✓ Sign & Dispatch Certificate
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              onReviewSubmission(selectedSub.id, 'CHANGES_REQUESTED', reviewFeedback);
                              onWriteAuditLog(`REQUESTED CODE REFACTOR EXPORT FROM: ${selectedSub.studentName.toUpperCase()}`, 'WARNING');
                              onShowToast(`Reproposed code changes audit back to candidate.`, 'warn');
                              setSelectedSub(null);
                            }}
                            className="py-2.5-1 border border-red-500/20 hover:border-red-500 hover:bg-red-500/5 text-red-400 py-2.5 font-bold text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer text-center"
                          >
                            × Request Architectural Changes
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="p-12 border border-white/5 border-dashed rounded text-center text-xs font-mono text-gray-500">
                      <span>SELECT A CANDIDATE SUBMISSION FROM QUEUE INDEX</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* I. PAYMENT VERIFICATION                                 */}
          {/* ======================================================= */}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div className="space-y-2">
                  <span className="text-gray-500 font-mono text-xs uppercase block">// PAYMENT_AUDIT</span>
                  <h1 className="text-3xl font-black text-white">PAYMENT VERIFICATION</h1>
                  <p className="text-gray-400 text-xs">Verify or reject payment proofs uploaded by students.</p>
                </div>
                <select 
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="bg-neutral-900 text-xs border border-white/5 px-3 py-1.5 focus:outline-none focus:border-red-500"
                >
                  <option value="ALL">All payments</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEW">Review</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {/* Backend payments */}
              {backendPayments && backendPayments.length > 0 ? (
                <div className="bg-black border border-white/5 rounded-xl overflow-hidden">
                  <div className="bg-neutral-900 px-6 py-3 border-b border-white/5 text-[9px] font-mono text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-4">
                    <span className="col-span-2">STUDENT</span>
                    <span className="col-span-1">AMOUNT</span>
                    <span className="col-span-2">TX HASH</span>
                    <span className="col-span-1">PROOF</span>
                    <span className="col-span-1">STATUS</span>
                    <span className="col-span-2">REASON</span>
                    <span className="col-span-3 text-right">ACTIONS</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {backendPayments
                      .filter(p => paymentFilter === 'ALL' || p.status === paymentFilter)
                      .map((payment) => (
                        <div key={payment.id} className="px-6 py-3.5 flex flex-col md:grid md:grid-cols-12 gap-4 items-center text-xs tracking-tight hover:bg-white/[0.01]">
                          <div className="col-span-2 text-left">
                            <span className="font-bold text-white block uppercase text-[11px]">{payment.student.fullName}</span>
                            <span className="text-[9px] text-gray-500 font-mono block">{payment.student.email}</span>
                          </div>
                          <span className="col-span-1 font-mono font-bold">₹{payment.amountPaid}</span>
                          <span className="col-span-2 font-mono text-[10px] text-gray-400 truncate">{payment.transactionHash}</span>
                          <span className="col-span-1">
                            <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="text-red-500 hover:underline text-[10px] font-mono flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View
                            </a>
                          </span>
                          <span className={`col-span-1 font-mono text-[9px] uppercase px-2 py-0.5 rounded ${
                            payment.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                            payment.status === 'FAILED' ? 'bg-red-500/10 text-red-500' :
                            payment.status === 'REVIEW' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>{payment.status}</span>
                          <span className="col-span-2 text-[9px] text-gray-500 truncate">{payment.rejectionReason || '-'}</span>
                          <div className="col-span-3 text-right flex justify-end gap-2">
                            {(payment.status === 'PENDING' || payment.status === 'REVIEW') ? (
                              <>
                                <button
                                  onClick={() => {
                                    onBackendVerifyPayment?.(payment.id, 'SUCCESS');
                                    onWriteAuditLog(`PAYMENT APPROVED: ${payment.student.fullName.toUpperCase()} - ₹${payment.amountPaid}`, 'INFO');
                                    onShowToast(`Payment approved for ${payment.student.fullName}`, 'success');
                                  }}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-mono uppercase rounded cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectModalId(payment.id)}
                                  className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-red-200 text-[9px] font-mono uppercase rounded cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[9px] font-mono text-gray-600 uppercase">{payment.status}</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 border border-white/5 border-dashed rounded text-center text-xs font-mono text-gray-500">
                  <span>No payment records found. Payments appear when students upload proof via the student dashboard.</span>
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* J. CERTIFICATES MANAGEMENT                              */}
          {/* ======================================================= */}
          {activeTab === 'CERTIFICATES' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div className="space-y-2">
                  <span className="text-gray-500 font-mono text-xs uppercase block">// CERTIFICATE_AUTHORITY</span>
                  <h1 className="text-3xl font-black text-white">CERTIFICATES</h1>
                  <p className="text-gray-400 text-xs">View and manage issued internship certificates.</p>
                </div>
              </div>

              {/* Approved submissions = eligible for certificates */}
              <div className="bg-black border border-white/5 rounded-xl overflow-hidden">
                <div className="bg-neutral-900 px-6 py-3 border-b border-white/5 text-[9px] font-mono text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-4">
                  <span className="col-span-3">STUDENT</span>
                  <span className="col-span-3">PROJECT</span>
                  <span className="col-span-2">STATUS</span>
                  <span className="col-span-2">DATE</span>
                  <span className="col-span-2 text-right">CERTIFICATE</span>
                </div>
                <div className="divide-y divide-white/5">
                  {submissions.filter(s => s.status === 'APPROVED').length > 0 ? (
                    submissions.filter(s => s.status === 'APPROVED').map((sub) => (
                      <div key={sub.id} className="px-6 py-3.5 flex flex-col md:grid md:grid-cols-12 gap-4 items-center text-xs tracking-tight hover:bg-white/[0.01]">
                        <div className="col-span-3 text-left">
                          <span className="font-bold text-white block uppercase text-[11px]">{sub.studentName}</span>
                          <span className="text-[9px] text-gray-500 font-mono block">{sub.studentEmail}</span>
                        </div>
                        <span className="col-span-3 text-gray-300 text-[10px]">{sub.projectName}</span>
                        <span className="col-span-2 font-mono text-[9px] uppercase text-emerald-400">APPROVED</span>
                        <span className="col-span-2 text-[10px] text-gray-500">{sub.submittedDate}</span>
                        <div className="col-span-2 text-right">
                          <span className="text-[9px] font-mono text-emerald-400 flex items-center justify-end gap-1">
                            <Award className="w-3 h-3" /> Ready
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-xs font-mono text-gray-500">
                      No approved submissions yet. Certificates are generated when submissions are approved.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* E. RESOURCES MANAGER                                   */}
          {/* ======================================================= */}
          {activeTab === 'RESOURCES' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div className="space-y-2">
                  <span className="text-gray-500 font-mono text-xs uppercase block">// SYS_RESOURCES_ADMIN</span>
                  <h1 className="text-3xl font-black text-white">UPHOLD SYSTEMS ASSETS LIBRARIES</h1>
                  <p className="text-gray-400 text-xs">Publish, update, or clear technical algorithms files sheets.</p>
                </div>

                <button 
                  onClick={() => setResFormOpen(true)}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs font-mono uppercase tracking-widest hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add intel asset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resOpt) => (
                  <div key={resOpt.id} className="p-6 bg-neutral-900 border border-white/5 rounded-xl space-y-4 flex flex-col justify-between text-left h-48">
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono text-red-400 uppercase bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded w-fit block">{resOpt.category}</span>
                      <h4 className="font-bold text-sm text-white">{resOpt.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-light truncate">{resOpt.description}</p>
                    </div>

                    <button 
                      onClick={() => {
                        onDeleteResource(resOpt.id);
                        onWriteAuditLog(`REMOVED SYLLABUS ASSET ID: ${resOpt.id}`, 'WARNING');
                        onShowToast('Resource discarded from directory.', 'error');
                      }}
                      className="text-[10px] font-mono text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" /> Evict resource asset file
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ======================================================= */}
          {/* F. EMAIL BROADCAST COMPOSER                            */}
          {/* ======================================================= */}
          {activeTab === 'BROADCAST' && (
            <div className="space-y-8 text-left">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-gray-400 font-mono text-xs uppercase block">// AD_MAILING_SYS</span>
                <h1 className="text-3xl font-black text-white">COHORT EMAIL BROADCAST</h1>
                <p className="text-xs text-gray-400">Compose and transmit targeted emails down to specific cohort specializations.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Broadcast Composer (Cols 1-7) */}
                <form onSubmit={handleDispatchBroadcast} className="lg:col-span-7 bg-neutral-900/40 p-6 border border-white/5 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500">Cohort Target Selection Filter</label>
                    <select 
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      className="w-full bg-black border border-white/10 px-4 py-2 text-xs font-mono text-white rounded"
                    >
                      <option value="ALL">All Enrolled Candidates</option>
                      <option value="Cybersec">Cybersecurity track only</option>
                      <option value="Devops">DevOps & Cloud only</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500">Mailing Subject Headline</label>
                    <input 
                      type="text" 
                      required
                      value={broadcastSubject} 
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      placeholder="HELLWARE MAINTENANCE SECURE ALERTS"
                      className="w-full bg-black border border-white/10 px-4 py-2 text-xs font-mono text-white rounded focus:outline-none focus:border-red-500" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500">Mail Body content</label>
                    <textarea 
                      required
                      value={broadcastBody} 
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      className="w-full h-32 bg-black border border-white/10 p-4 font-mono text-xs text-white rounded focus:outline-none focus:border-red-500" 
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-white text-black font-semibold text-xs font-mono uppercase tracking-widest hover:bg-gray-100 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Initialize outbox broadcast stream
                  </button>
                </form>

                {/* Broadcast logs history (Cols 8-12) */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="font-mono text-[9px] text-gray-500 uppercase block font-bold">TRANSMISSION HIST HISTORIES</span>
                  
                  <div className="space-y-3">
                    {broadcastHistory.map((bc) => (
                      <div key={bc.id} className="p-4 bg-neutral-900 border border-white/5 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>{bc.date} UTC</span>
                          <span className="text-red-400 font-bold">{bc.target}</span>
                        </div>
                        <h5 className="font-bold text-white uppercase tracking-tight">{bc.subject}</h5>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* K. MAIL ORCHESTRATION TIMELINE                          */}
          {/* ======================================================= */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                <div className="space-y-2">
                  <span className="text-gray-500 font-mono text-xs uppercase block">// MAIL_ORCHESTRATION</span>
                  <h1 className="text-3xl font-black text-white">EMAIL TIMELINE ORCHESTRATOR</h1>
                  <p className="text-gray-400 text-xs">Follow the timeline for each student. Generate + send emails at each step. After the reflection delay, the student dashboard updates.</p>
                </div>
              </div>

              {(() => {
                const mockStudents = applications.map(a => ({
                  id: a.id, fullName: a.fullName, email: a.email,
                  college: a.college, skills: a.skills,
                }));
                const backendList = (backendApplications || []).map(a => ({
                  id: a.id, fullName: a.fullName, email: a.email,
                  college: a.college || '',
                }));
                const allStudents = [...backendList, ...mockStudents.filter(m => !backendList.some(b => b.email === m.email))];

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-2">
                      {allStudents.map((s) => {
                        const steps = getStudentTimeline?.(s.email) || DEFAULT_TIMELINE.map(x => ({ ...x }));
                        const sentCount = steps.filter(st => st.status === 'EMAIL_SENT' || st.status === 'REFLECTED').length;
                        const reflectedCount = steps.filter(st => st.status === 'REFLECTED').length;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStudentId(s.id)}
                            className={`w-full text-left p-4 rounded-lg border text-xs transition-all cursor-pointer ${
                              selectedStudentId === s.id
                                ? 'bg-white/10 border-white text-white'
                                : 'bg-neutral-900/40 border-white/5 text-gray-400 hover:border-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-white block uppercase text-[11px]">{s.fullName}</span>
                                <span className="text-[9px] text-gray-500 font-mono block">{s.email}</span>
                              </div>
                              <span className="text-[9px] font-mono text-gray-500">{sentCount}/8</span>
                            </div>
                            <div className="mt-2 flex gap-1">
                              {steps.map((st, i) => (
                                <span key={st.id} className={`w-2 h-2 rounded-full inline-block ${
                                  st.status === 'REFLECTED' ? 'bg-emerald-400' :
                                  st.status === 'EMAIL_SENT' ? 'bg-amber-500' :
                                  'bg-gray-700'
                                }`} title={`${st.label}: ${st.status}`} />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="lg:col-span-8">
                      {(() => {
                        const selected = allStudents.find(s => s.id === selectedStudentId);
                        if (!selected) return (
                          <div className="p-12 border border-white/5 border-dashed rounded text-center text-xs font-mono text-gray-500">
                            Select a student to view their email timeline
                          </div>
                        );

                        const steps = getStudentTimeline?.(selected.email) || DEFAULT_TIMELINE.map(x => ({ ...x }));

                        return (
                          <div className="space-y-4">
                            <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-4">
                              <div className="flex justify-between items-center mb-4">
                                <div>
                                  <span className="font-bold text-white text-sm uppercase">{selected.fullName}</span>
                                  <span className="text-[10px] text-gray-500 font-mono block">{selected.email}</span>
                                </div>
                                <span className="text-[9px] font-mono px-2 py-1 rounded bg-neutral-800 text-gray-400">
                                  Stage: {studentStages?.[selected.email] || 'APPLIED'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {steps.map((step, idx) => {
                                  const isActive = step.status === 'PENDING';
                                  const isReflected = step.status === 'REFLECTED';
                                  const prevDone = idx === 0 || steps[idx - 1].status === 'REFLECTED';

                                  return (
                                    <div key={step.id} className={`p-3 rounded-lg border text-left ${
                                      isReflected ? 'bg-emerald-500/5 border-emerald-500/20' :
                                      isActive && prevDone ? 'bg-amber-500/5 border-amber-500/20' :
                                      prevDone ? 'bg-neutral-900/40 border-white/5' :
                                      'bg-neutral-950 border-white/5 opacity-40'
                                    }`}>
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold shrink-0 ${
                                              isReflected ? 'bg-emerald-500 text-black' :
                                              'bg-gray-700 text-gray-400'
                                            }`}>
                                              {isReflected ? '✓' : step.step + 1}
                                            </span>
                                            <span className={`font-bold text-xs font-mono uppercase ${
                                              isReflected ? 'text-emerald-400' :
                                              isActive && prevDone ? 'text-amber-400' :
                                              'text-gray-500'
                                            }`}>{step.label}</span>
                                            <span className="text-[8px] font-mono text-gray-600">({step.delay})</span>
                                          </div>
                                          <p className="text-[10px] text-gray-500 mt-1 ml-7">{step.description}</p>
                                          {isReflected && step.sentAt && (
                                            <p className="text-[8px] font-mono text-emerald-600 mt-1 ml-7">Sent & Reflected: {new Date(step.sentAt).toLocaleString()}</p>
                                          )}
                                        </div>

                                        <div className="flex gap-1.5 shrink-0">
                                          {isActive && prevDone && (
                                            <button
                                              onClick={async () => {
                                                setSendingStepEmail(step.id);
                                                const delay = step.id === 'payment_verified' ? 60000 : undefined;
                                                const result = await onAdvanceTimeline?.(selected.email, step.id, delay);
                                                setSendingStepEmail(null);
                                                if (result?.success) {
                                                  const msg = step.id === 'payment_verified'
                                                    ? `Payment verified! Certificate will auto-issue in ~60s (simulating 1-day delay).`
                                                    : `Automated: ${step.label} — email sent + dashboard unlocked`;
                                                  onShowToast(msg, 'success');
                                                } else {
                                                  onShowToast(result?.error || 'Failed', 'error');
                                                }
                                              }}
                                              disabled={sendingStepEmail === step.id}
                                              className="py-1 px-3 bg-red-500 hover:bg-red-400 text-black font-bold font-mono text-[8px] rounded uppercase cursor-pointer disabled:opacity-50"
                                            >
                                              {sendingStepEmail === step.id ? 'Processing...' : '▶ Advance'}
                                            </button>
                                          )}
                                          {isReflected && (
                                            <span className="py-1 px-2 bg-emerald-500/10 text-emerald-400 font-mono text-[8px] rounded uppercase">✓ Done</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ======================================================= */}
          {/* G. AUDIT SECURITY EVENTS LOGS INDEX                    */}
          {/* ======================================================= */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="space-y-6 text-left">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// SHA256_UNALTERABLE_TRACE</span>
                <h1 className="text-3xl font-black text-white">HISTORIC OPERATION SYSTEM LOGS</h1>
                <p className="text-xs text-gray-400">Review permanent operational record logs documenting certificate stamps, evictions, and application triage sequences.</p>
              </div>

              <div className="bg-black/80 font-mono text-xs leading-relaxed p-6 rounded-xl border border-white/5 space-y-3 max-h-[500px] overflow-y-auto select-text">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center py-2.5 border-b border-white/5 hover:bg-white/[0.01] px-2">
                    <div className="space-y-0.5">
                      <span className="text-gray-600 font-bold">[{log.timestamp}]</span>{' '}
                      <span className={log.severity === 'CRITICAL' ? 'text-red-500 font-bold font-mono' : log.severity === 'WARNING' ? 'text-amber-500' : 'text-emerald-400'}>
                        {log.action}
                      </span>
                      <span className="block text-[10px] text-gray-600">Operator hash: {log.operator}</span>
                    </div>
                    <span className={`text-[10px] font-black tracking-widest px-2.5 rounded ${
                      log.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                      log.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>{log.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <footer className="p-6 border-t border-white/5 text-center text-[10px] font-mono text-gray-600 uppercase">
          SECURE SUPERUSER DOCK // THREAD PIPELINE SECURE // STABLE HANDSHAKE_ON
        </footer>

      </main>

      {/* 3. NESTED DRAWER MODALS */}

      {/* Payment reject reason modal */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 text-left">
          <div className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-xl p-8 space-y-4 shadow-xl">
            <div className="border-b border-white/5 pb-2">
              <span className="text-red-500 font-mono text-[9px] uppercase tracking-widest block font-bold">// REJECT_PAYMENT</span>
              <h3 className="font-bold text-lg text-white">Reject Payment Proof</h3>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full h-24 bg-black border border-white/10 p-4 font-mono text-xs text-white rounded focus:outline-none focus:border-red-500"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  if (onBackendVerifyPayment) {
                    onBackendVerifyPayment(rejectModalId, 'FAILED', rejectReason || 'Rejected by admin');
                    onWriteAuditLog(`PAYMENT REJECTED: ID ${rejectModalId}`, 'WARNING');
                    onShowToast('Payment rejected.', 'error');
                  }
                  setRejectModalId(null);
                  setRejectReason('');
                }}
                className="py-2.5 bg-red-600 text-white font-bold text-xs font-mono uppercase cursor-pointer text-center hover:bg-red-500"
              >
                ✓ Confirm Reject
              </button>
              <button
                type="button"
                onClick={() => { setRejectModalId(null); setRejectReason(''); }}
                className="py-2.5 border border-white/10 text-gray-400 hover:text-white uppercase font-mono text-xs cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A. Create project blueprint Modal */}
      {projectFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 text-left">
          <form onSubmit={handleCreateProject} className="w-full max-w-lg bg-neutral-950 border border-white/10 rounded-xl p-8 space-y-4 shadow-xl relative">
            <div className="border-b border-white/5 pb-2">
              <span className="text-red-500 font-mono text-[9px] uppercase tracking-widest block font-bold">// SYS_CREATOR_BLUEPRINT</span>
              <h3 className="font-bold text-lg text-white">MAP NEW SYSTEMS ASSIGNMENT</h3>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Assignment Title</label>
              <input 
                type="text" 
                required
                value={newProj.title} 
                onChange={(e) => setNewProj(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Track Sector</label>
                <select 
                  value={newProj.domain} 
                  onChange={(e) => setNewProj(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white"
                >
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="AI / ML Engineering">AI Engineering</option>
                  <option value="Full-Stack Development">Full-Stack Development</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Difficulty level</label>
                <select 
                  value={newProj.difficulty} 
                  onChange={(e) => setNewProj(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white"
                >
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                  <option value="Expert">Advance</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Detailed Synopsis</label>
              <textarea 
                required
                value={newProj.description} 
                onChange={(e) => setNewProj(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-20 bg-black border border-white/5 rounded p-4 text-xs font-mono text-white" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Required Tech Stack (comma separated)</label>
              <input 
                type="text" 
                required
                value={newProj.techStackInput} 
                onChange={(e) => setNewProj(prev => ({ ...prev, techStackInput: e.target.value }))}
                className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Checkpoints milestones (comma separated)</label>
              <input 
                type="text" 
                required
                value={newProj.milestonesInput} 
                onChange={(e) => setNewProj(prev => ({ ...prev, milestonesInput: e.target.value }))}
                className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <button 
                type="submit"
                className="py-2.5 bg-white text-black font-bold text-xs font-mono uppercase cursor-pointer text-center hover:bg-gray-100"
              >
                ✓ Compile & Deploy
              </button>
              <button 
                type="button" 
                onClick={() => setProjectFormOpen(false)}
                className="py-2.5 border border-white/10 text-gray-400 hover:text-white uppercase font-mono text-xs cursor-pointer text-center"
              >
                Cancel setup
              </button>
            </div>
          </form>
        </div>
      )}


      {/* B. Add Resource Asset Modal */}
      {resFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 text-left">
          <form onSubmit={handleCreateResource} className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-xl p-8 space-y-4 shadow-xl">
            <div className="border-b border-white/5 pb-2">
              <span className="text-red-500 font-mono text-[9px] uppercase tracking-widest block font-bold">// UPLOAD_INTEL_BLUEPRINT</span>
              <h3 className="font-bold text-lg text-white">ADD SYSTEM SYLLABUS INTELLIGENCE</h3>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Resource Title</label>
              <input 
                type="text" 
                required
                value={newRes.title} 
                onChange={(e) => setNewRes(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">Resource Classification Category</label>
              <select 
                value={newRes.category} 
                onChange={(e) => setNewRes(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white"
              >
                <option value="DSA Sheet">DSA Algorithms sheet</option>
                <option value="Resume Templates">LaTeX Resume Builders</option>
                <option value="Git and GitHub Handbook">VCS Git Books</option>
                <option value="Deployment Guide">Deployment & Proxies checklists</option>
                <option value="System Design Basics">Distributed System Basics</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Brief Synopsis</label>
              <textarea 
                required
                value={newRes.description} 
                onChange={(e) => setNewRes(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-24 bg-black border border-white/5 rounded p-4 text-xs font-mono text-white" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <button 
                type="submit"
                className="py-2.5 bg-white text-black font-bold text-xs font-mono uppercase cursor-pointer text-center hover:bg-gray-100"
              >
                ✓ Deploy file registry
              </button>
              <button 
                type="button" 
                onClick={() => setResFormOpen(false)}
                className="py-2.5 border border-white/10 text-gray-400 hover:text-white uppercase font-mono text-xs cursor-pointer text-center"
              >
                Cancel setup
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
