/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Shield, FileText, CheckSquare, Clock, Send, Code, ExternalLink, Lock,
  ChevronRight, BookOpen, User, Copy, Bell, Key, Settings, Trash2, Link,
  CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, LogOut, LayoutGrid, Download, Info
} from 'lucide-react';
import { GitHubIcon } from '@/components/SocialIcons';
function Github({ className }: { className?: string }) { return <GitHubIcon className={className} />; }
import { 
  StudentProject, Submission, Resource, TRACKS, INITIAL_PROJECTS, INITIAL_RESOURCES, REQ_BADGES, REQ_CERTIFICATE 
} from '@/data/mockData';
import { printProjectDefinition, printCertificate, printOfferLetter, printWeeklyReport, printLOR } from '@/utils/printHelper';
import HellwareLogo from '@/components/HellwareLogo';
import { uploadBackendPaymentProof } from '@/lib/backend';
import type { TimelineStep } from '@/app/page';
import { DEFAULT_TIMELINE } from '@/app/page';

interface StudentDashboardProps {
  userEmail: string;
  onLogout: () => void;
  onNavigateToPublic: (view: string) => void;
  // Shared state references
  assignedProject: StudentProject;
  submissions: Submission[];
  onCommitSubmission: (sub: Partial<Submission>) => void;
  onToggleMilestone: (mid: string) => void;
  onShowToast: (msg: string, type: 'success' | 'warn' | 'error') => void;
  studentStage: string;
  onUpdateStage: (stage: string) => void;
  timeline: TimelineStep[];
}

export default function StudentDashboard({
  userEmail, onLogout, onNavigateToPublic,
  assignedProject, submissions, onCommitSubmission, onToggleMilestone, onShowToast,
  studentStage, onUpdateStage, timeline
}: StudentDashboardProps) {

  // Active dashboard tab state
  const [activeTab, setActiveTab] = useState<'HOME' | 'OFFER_LETTER' | 'PROJECT' | 'WEEKLY_REPORTS' | 'SUBMIT' | 'HISTORY' | 'RESOURCES' | 'BADGES' | 'REFERRAL' | 'CONTRIBUTION' | 'SETTINGS' | 'APPLY_MORE'>('HOME');

  const timelineSteps = timeline.length > 0 ? timeline : DEFAULT_TIMELINE;

  function isTabUnlocked(tabId: string): boolean {
    const alwaysVisible = ['HOME', 'SETTINGS', 'REFERRAL', 'APPLY_MORE'];
    if (alwaysVisible.includes(tabId)) return true;

    const tabStepMap: Record<string, string> = {
      'OFFER_LETTER': 'congrats',
      'PROJECT': 'task_details',
      'WEEKLY_REPORTS': 'weekly_report',
      'SUBMIT': 'final_submission',
      'HISTORY': 'final_submission',
      'RESOURCES': 'task_details',
      'BADGES': 'payment_verified',
      'CONTRIBUTION': 'submission_approved',
    };

    const requiredStep = tabStepMap[tabId];
    if (!requiredStep) return true;

    const step = timelineSteps.find(s => s.id === requiredStep);
    return step?.status === 'REFLECTED';
  }

  const certificationVisible = isTabUnlocked('CONTRIBUTION');
  const badgesVisible = isTabUnlocked('BADGES');

  useEffect(() => {
    if (activeTab === 'CONTRIBUTION' && !certificationVisible) setActiveTab('HOME');
    if (activeTab === 'BADGES' && !badgesVisible) setActiveTab('HOME');
  }, [studentStage, timeline]);

  // Active internships list for the student
  const [activeInternships, setActiveInternships] = useState<StudentProject[]>([
    { ...assignedProject }
  ]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>(assignedProject.id);

  // Computed state for active selection
  const currentInternship = useMemo(() => {
    return activeInternships.find(p => p.id === selectedInternshipId) || activeInternships[0] || assignedProject;
  }, [activeInternships, selectedInternshipId, assignedProject]);

  // Wrapper for toggling milestone checkmarks locally
  const handleToggleLocalMilestone = (mid: string) => {
    if (currentInternship.id === assignedProject.id) {
      onToggleMilestone(mid);
    }
    setActiveInternships(prev => prev.map(p => {
      if (p.id === currentInternship.id) {
        return {
          ...p,
          milestones: p.milestones.map(m => m.id === mid ? { ...m, completed: !m.completed } : m)
        };
      }
      return p;
    }));
  };

  // Interactive submission handles
  const [subForm, setSubForm] = useState({
    githubUrl: 'https://github.com/alex-mercer/hellware-threat-pipeline',
    liveUrl: 'https://threat-pipeline.hellware-sandbox.app',
    videoUrl: 'https://loom.com/v/threat-engine-walkthrough',
    notes: 'Memory ring allocation is completed. Threat metrics graphs update synchronously.',
    filesUploaded: [] as string[]
  });

  const [dragActive, setDragActive] = useState(false);

  // Referral states
  const [copiedLink, setCopiedLink] = useState(false);
  const referralCode = "HW-ALEX-998";
  const [referredPeers, setReferredPeers] = useState([
    { id: '1', name: "Siddharth Verma", email: "sid.v@gmail.com", date: "May 12, 2026", status: "PAID", rebate: 20 },
    { id: '2', name: "Priya Roy", email: "priya.roy@iiit.ac.in", date: "May 14, 2026", status: "PAID", rebate: 20 },
    { id: '3', name: "Rohan Patel", email: "rohan.patel@gmail.com", date: "May 17, 2026", status: "PENDING", rebate: 0 },
    { id: '4', name: "Karan Johar", email: "karan.j@vit.edu", date: "May 19, 2026", status: "PAID", rebate: 20 },
  ]);

  // Settings states
  const [settingsTab, setSettingsTab] = useState<'PROFILE' | 'SECURITY' | 'NOTIFICATION'>('PROFILE');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [skillsList, setSkillsList] = useState(['React', 'TypeScript', 'Node.js', 'Cyber Security']);
  const [skillInput, setSkillInput] = useState('');

  // Notifications states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', icon: '🔔', msg: 'Submissions successfully queued for review checkout.', time: '2 mins ago', read: false },
    { id: '2', icon: '⚡', msg: 'System Architect peer Thorne assigned feedback criteria on your ledger.', time: '2 hours ago', read: true },
    { id: '3', icon: '🏆', msg: 'Earned public Badge: [Zero-Day Hunter]!', time: '1 day ago', read: false }
  ]);

  const [didContribute, setDidContribute] = useState(false);
  const [paymentScreenshotUploaded, setPaymentScreenshotUploaded] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'VALIDATING' | 'APPROVED'>('PENDING');
  const [isCertificateAddedInWebsite, setIsCertificateAddedInWebsite] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [localMockApproved, setLocalMockApproved] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [cryptoTxHash, setCryptoTxHash] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CRYPTO' | null>(null);

  // Offer letter choice states
  const [offerDuration, setOfferDuration] = useState<number>(3);

  // Apply more state parameters
  const [selectedApplyProject, setSelectedApplyProject] = useState<StudentProject | null>(null);
  const [termsAccepted1, setTermsAccepted1] = useState(false);
  const [termsAccepted2, setTermsAccepted2] = useState(false);
  const [termsAccepted3, setTermsAccepted3] = useState(false);
  const [applyScreenshot, setApplyScreenshot] = useState<string>('');
  
  // Weekly reports states
  const [weeklyReports, setWeeklyReports] = useState<any[]>([
    {
      weekNum: 1,
      hoursLogged: 16,
      locCount: 345,
      achievements: "Constructed the local Docker isolates sandbox running Express middlewares. Configured and validated the cryptographic signature rotating keys for secure token distribution.",
      blockers: "Resolving proxy WebSocket connect timeouts inside headless testing containers.",
      status: "APPROVED"
    },
    {
      weekNum: 2,
      hoursLogged: 18,
      locCount: 412,
      achievements: "Mapped robust SHA-256 certificate hashing verification routines and added standard watermark assets for official faculty audit reviews.",
      blockers: "Formatting diagonal SVGs cleanly across print layouts engines.",
      status: "APPROVED"
    }
  ]);

  const handlePaymentScreenshotUpload = async (file: File) => {
    if (!paymentMethod) {
      onShowToast('Select a payment method (UPI or Crypto) and fill the details first.', 'warn');
      return;
    }
    if (paymentMethod === 'UPI' && !utrNumber.trim()) {
      onShowToast('Enter the UTR number from your UPI payment.', 'warn');
      return;
    }
    if (paymentMethod === 'CRYPTO' && !cryptoTxHash.trim()) {
      onShowToast('Enter the transaction hash from your crypto payment.', 'warn');
      return;
    }

    const studentId = window.localStorage.getItem('hellwareStudentId');
    if (!studentId) {
      onShowToast('Apply first so the backend can create your student record before payment upload.', 'warn');
      return;
    }

    setPaymentScreenshotUploaded(file.name);
    setPaymentStatus('VALIDATING');
    setDidContribute(true);

    const txRef = paymentMethod === 'UPI' ? utrNumber.trim() : cryptoTxHash.trim();

    try {
      const cleanEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) || 'student';
      const result = await uploadBackendPaymentProof({
        studentId,
        amountPaid: 149,
        transactionHash: `HW-${cleanEmail}-${Date.now()}`,
        screenshot: file
      });
      window.localStorage.setItem('hellwarePaymentId', result.paymentId);
      onUpdateStage('PAYMENT_SUBMITTED');
      onShowToast(`Receipt uploaded to backend audit queue: ${file.name}`, 'success');
    } catch (error) {
      setPaymentStatus('PENDING');
      onShowToast(error instanceof Error ? error.message : 'Payment proof upload failed.', 'error');
    }
  };

  const [newReportForm, setNewReportForm] = useState({
    weekNum: 3,
    hoursLogged: 15,
    locCount: 220,
    achievements: "",
    blockers: ""
  });

  // Dynamic progress calculator
  const progressPercent = useMemo(() => {
    if (!currentInternship.milestones || currentInternship.milestones.length === 0) return 0;
    const completed = currentInternship.milestones.filter(m => m.completed).length;
    return Math.round((completed / currentInternship.milestones.length) * 100);
  }, [currentInternship]);

  // Handle manual submit execution
  const handleSubmissionDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.githubUrl || !subForm.liveUrl) {
      onShowToast('GitHub Repository and Live Sandbox URLs are required.', 'warn');
      return;
    }

    onCommitSubmission({
      projectId: currentInternship.id,
      projectName: currentInternship.title,
      domain: currentInternship.domain,
      githubUrl: subForm.githubUrl,
      liveUrl: subForm.liveUrl,
      screenshots: subForm.filesUploaded.length > 0 ? subForm.filesUploaded : ['/assets/uploaded_mock_preview.png'],
      notes: subForm.notes,
      screencast: subForm.videoUrl
    });

    onShowToast('Submission successfully transmitted to evaluation queue!', 'success');
    setActiveTab('HISTORY');
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`https://hellware.in/join?ref=${referralCode}`);
    setCopiedLink(true);
    onShowToast('Referral link logged on system clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onShowToast('All notifications marked as read', 'success');
  };

  // Drag handles for file uploading
  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSubForm(prev => ({
        ...prev,
        filesUploaded: [...prev.filesUploaded, file.name]
      }));
      onShowToast(`Attached screenshot matrix: ${file.name}`, 'success');
    }
  };

  return (
    <div className="flex bg-black min-h-screen text-white text-left font-sans select-none selection:bg-red-500/20">      {/* 1. SECURE SIDEBAR LAYOUT */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-200 border-r border-white/5 bg-neutral-950 flex flex-col justify-between shrink-0 h-screen sticky top-0`}>
        <div className={`${sidebarCollapsed ? 'p-3' : 'p-6'} space-y-8`}>
          
          {/* Logo brand container */}
          <div className="flex items-center justify-between gap-2">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <HellwareLogo size="sm" iconOnly />
                <div>
                  <span className="font-bold font-display tracking-tight text-white uppercase text-xs block leading-none">HELLWARE</span>
                  <span className="text-[7.5px] font-mono text-gray-500 uppercase tracking-widest block pt-0.5">STUDENT DOCK</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <HellwareLogo size="sm" iconOnly />
              </div>
            )}
            
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-white/5 rounded border border-white/10 text-gray-500 hover:text-white transition-all cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight className={`w-3 h-3 transform transition-transform duration-200 ${sidebarCollapsed ? "" : "rotate-180"}`} />
            </button>
          </div>

          {/* Quick Stats metrics */}
          {!sidebarCollapsed && (
            <div className="bg-neutral-900/40 p-4 border border-white/5 rounded space-y-3">
              <div>
                <span className="text-[8px] font-mono text-gray-400 uppercase block font-semibold mb-1">// CORE TERMINAL TRACK</span>
                {activeInternships.length > 1 ? (
                  <select
                    value={selectedInternshipId}
                    onChange={(e) => {
                      setSelectedInternshipId(e.target.value);
                      onShowToast(`Switched active workspace to ${activeInternships.find(p => p.id === e.target.value)?.domain} Track`, 'success');
                    }}
                    className="w-full bg-black text-white px-2 py-1.5 rounded border border-white/10 text-[10px] font-mono uppercase focus:outline-none focus:border-[#E94560]/50 cursor-pointer"
                  >
                    {activeInternships.map((p) => (
                      <option key={p.id} value={p.id}>{p.domain}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs font-bold text-white uppercase truncate block leading-snug">{currentInternship.domain}</span>
                )}
              </div>
              <div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between items-center mt-1 text-[8px] font-mono text-gray-500">
                  <span>{activeInternships.length} ACTIVE</span>
                  <span>{progressPercent}% DONE</span>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Switchable Navigation */}
          <nav className="space-y-1.5 pt-2">
            {[
              { id: 'HOME', label: 'DASHBOARD HOME', icon: <LayoutGrid className="w-4 h-4" /> },
              { id: 'APPLY_MORE', label: '+ APPLY INTERNSHIPS', icon: <Award className="w-4 h-4 text-rose-500" /> },
              ...(isTabUnlocked('OFFER_LETTER') ? [{ id: 'OFFER_LETTER' as const, label: 'INTERNSHIP OFFER', icon: <FileText className="w-4 h-4" /> }] : []),
              ...(isTabUnlocked('PROJECT') ? [{ id: 'PROJECT' as const, label: 'ASSIGNED PROJECT', icon: <Code className="w-4 h-4" /> }] : []),
              ...(isTabUnlocked('WEEKLY_REPORTS') ? [{ id: 'WEEKLY_REPORTS' as const, label: 'WEEKLY REPORTS', icon: <CheckSquare className="w-4 h-4" /> }] : []),
              ...(isTabUnlocked('SUBMIT') ? [{ id: 'SUBMIT' as const, label: 'SUBMIT WORK', icon: <Send className="w-4 h-4" /> }] : []),
              ...(isTabUnlocked('HISTORY') ? [{ id: 'HISTORY' as const, label: 'PAST SUBMISSIONS', icon: <FileText className="w-4 h-4" /> }] : []),
              ...(isTabUnlocked('RESOURCES') ? [{ id: 'RESOURCES' as const, label: 'SYLLABUS RESOURCES', icon: <BookOpen className="w-4 h-4" /> }] : []),
              ...(isTabUnlocked('BADGES') ? [{ id: 'BADGES' as const, label: isCertificateAddedInWebsite ? 'BADGES & CERTIFICATE' : 'COHORT BADGES', icon: <Award className="w-4 h-4" /> }] : []),
              { id: 'REFERRAL', label: 'REFERRALS HUB', icon: <Link className="w-4 h-4" /> },
              ...(isTabUnlocked('CONTRIBUTION') ? [{ id: 'CONTRIBUTION' as const, label: 'CERTIFICATE PAYMENT', icon: <Info className="w-4 h-4" /> }] : []),
              { id: 'SETTINGS', label: 'PORTAL SETTINGS', icon: <Settings className="w-4 h-4" /> },
            ].filter(Boolean).map((lnk) => {
              const isActive = activeTab === lnk.id;
              return (
                <button
                  key={lnk.id}
                  onClick={() => {
                    setActiveTab(lnk.id as any);
                    setShowNotifications(false);
                  }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2' : 'gap-3 px-4 py-2'} text-xs font-mono font-bold tracking-wide uppercase rounded cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-[#E94560]/10 border-l-2 border-[#E94560] text-[#E94560]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                  title={lnk.label}
                >
                  {lnk.icon}
                  {!sidebarCollapsed && <span className="truncate">{lnk.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card info inside sidebar bottom */}
        <div className="p-3 border-t border-white/5 space-y-4 bg-neutral-900/20">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-full bg-[#E94560]/10 border border-[#E94560]/20 flex items-center justify-center font-bold text-[#E94560] text-xs shrink-0">
              AM
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-white truncate block">Alex Mercer</span>
                <span className="text-[9px] font-mono text-gray-400 truncate block">{userEmail}</span>
              </div>
            )}
          </div>

          <button 
            onClick={onLogout}
            className={`w-full py-1.5 bg-white/5 hover:bg-[#E94560]/10 hover:text-[#E94560] text-[10px] font-mono text-gray-400 font-bold uppercase rounded border border-white/5 hover:border-[#E94560]/20 transition-all flex items-center justify-center ${sidebarCollapsed ? 'px-0' : 'gap-2'} cursor-pointer`}
            title="Close session"
          >
            <LogOut className="w-3.5 h-3.5" /> 
            {!sidebarCollapsed && <span>Close session</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN WINDOW CONTENT PORT */}
      <main className="flex-1 min-h-screen flex flex-col justify-between overflow-x-hidden relative">
        
        {/* Dynamic header status block */}
        <header className="border-b border-white/5 bg-neutral-950 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-xs font-mono tracking-widest uppercase">// STABLE_CONNECTION_OK</span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          </div>

          {/* Quick interactions */}
          <div className="flex items-center gap-4 relative">
            
            {/* Notifications Trigger */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-neutral-900 border border-white/10 hover:border-white/20 rounded cursor-pointer relative transition-all"
            >
              <Bell className="w-4 h-4 text-gray-300" />
              {notifications.some(x => !x.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {/* Notification drop-down panel mockup */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-neutral-950 border border-white/10 rounded-lg p-4 shadow-xl z-50 text-left space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-mono text-[9px] font-bold text-red-500 uppercase">SYSTEM NOTIFICATIONS</span>
                  <button onClick={handleMarkAllRead} className="text-[8px] font-mono text-gray-500 hover:text-white uppercase">[ CLEAR ]</button>
                </div>
                <div className="divide-y divide-white/5 space-y-3 pt-2 max-h-60 overflow-y-auto">
                  {notifications.map((not) => (
                    <div key={not.id} className={`pt-2 text-xs flex gap-2 items-start ${not.read ? 'opacity-50' : 'opacity-100'}`}>
                      <span className="text-sm">{not.icon}</span>
                      <div>
                        <p className="text-gray-300 text-[11px] leading-snug">{not.msg}</p>
                        <span className="text-[8px] text-gray-600 font-mono block mt-0.5">{not.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public showcase fast swap button */}
            <button 
              onClick={() => onNavigateToPublic('SHOWCASE')}
              className="text-[10px] font-mono border border-white/10 px-3 py-1.5 hover:border-white/30 hover:text-red-400 transition-colors uppercase cursor-pointer"
            >
              [ View Projects Registry ]
            </button>
          </div>
        </header>

        {/* Real workspace content swap */}
        <div className="px-8 py-10 flex-1 max-w-5xl w-full mx-auto space-y-8">
          
          {/* ============================================== */}
          {/* A. DASHBOARD HOME VIEW                         */}
          {/* ============================================== */}
          {activeTab === 'HOME' && (
            <div className="space-y-8">
              
              {/* Dynamic personalized welcome message banner */}
              <div className="p-8 bg-gradient-to-r from-neutral-950 via-neutral-900 to-black rounded-xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-2 right-2 border border-white/5 px-2 py-0.5 font-mono text-[8px] bg-black/40 text-gray-500 rounded uppercase">
                  Batch: MAY 2026 CYCLE
                </div>
                <div className="space-y-2">
                  <span className="text-red-500 font-mono text-[10px] uppercase tracking-widest block">// STUDENT PORT MODULE CONNECTED</span>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">WELCOME BACK, ALEXANDER MERCER</h2>
                  <p className="text-xs text-gray-400 max-w-lg font-light leading-relaxed">
                    You are currently working on your <span className="text-white font-mono font-bold">{currentInternship.title}</span> internship. You can also apply for and manage other parallel internships using the <strong>+ Apply Internships</strong> tab!
                  </p>
                </div>
              </div>

              {/* Multi-Internship Fast Switcher Bar (only shown if they have multiple internships) */}
              {activeInternships.length > 1 && (
                <div className="p-4 bg-rose-500/[0.04] border border-rose-500/20 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
                  <div>
                    <span className="text-[9px] font-mono text-rose-400 uppercase font-bold block">// PARALLEL WORKSPACES OUTPOSTS</span>
                    <span className="text-xs text-gray-300">You have <strong>{activeInternships.length} active internships</strong> loaded. Switch between active workspaces using this dropdown:</span>
                  </div>
                  <div className="w-full sm:w-64">
                    <select
                      value={selectedInternshipId}
                      onChange={(e) => {
                        setSelectedInternshipId(e.target.value);
                        onShowToast(`Switched workspace focus to ${activeInternships.find(p => p.id === e.target.value)?.domain}`, 'success');
                      }}
                      className="w-full bg-neutral-950 text-white border border-white/10 px-3 py-2 rounded text-xs font-mono uppercase focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      {activeInternships.map((p) => (
                        <option key={p.id} value={p.id}>{p.domain} Track</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Progress Tracker Card & Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Project details summary card */}
                <div className="md:col-span-2 bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">CURRENT BLUEPRINT STATUS</span>
                    <h4 className="font-bold text-lg text-white capitalize">{currentInternship.title}</h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed truncate">{currentInternship.description}</p>
                    
                    <div className="flex flex-wrap gap-1 pt-2">
                      {currentInternship.techStack.map((tech) => (
                        <span key={tech} className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <button onClick={() => setActiveTab('PROJECT')} className="text-xs text-red-500 font-mono hover:underline cursor-pointer">
                      CHECK DETAILED MILESTONES →
                    </button>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Track: {currentInternship.domain}</span>
                  </div>
                </div>

                {/* 2. Rapid timeline indicators */}
                <div className="bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-4 text-left">
                  <span className="text-[10px] uppercase font-mono text-gray-500 block">SUBMISSION TIMER DEADLINE</span>
                  
                  <div className="space-y-1">
                    <div className="text-3xl font-bold font-mono text-white animate-pulse">04d : 11h : 02m</div>
                    <span className="text-[9px] font-mono text-gray-600 block">LOCK DOWN TRIGGER IN 4 DAYS</span>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <span className="text-[9px] uppercase font-mono text-gray-400 block font-bold">MILITARY ALERTS</span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-gray-500">
                        <span>Milestones ticked</span>
                        <span className="text-white font-bold">{currentInternship.milestones.filter(m => m.completed).length} / {currentInternship.milestones.length}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-500">
                        <span>System approvals</span>
                        <span className="text-amber-500">AWAITING COMMITS</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Home recent submissions trace log */}
              <div className="bg-neutral-950 p-6 rounded-xl border border-white/5 space-y-4">
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block">OPERATIONAL LOG TRANSACTIONS</span>
                <div className="space-y-3">
                  {submissions.length > 0 ? (
                    submissions.map((sub, sidx) => (
                      <div key={sidx} className="flex justify-between items-center text-xs p-3 bg-neutral-900/30 rounded border border-white/5">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="font-bold text-white uppercase text-[11px]">{sub.projectName}</span>
                            <span className="block text-[8px] text-gray-500 font-mono">MD5_SIG : {sub.id}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                            sub.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                            sub.status === 'CHANGES_REQUESTED' ? 'bg-red-500/10 text-red-400' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>{sub.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs font-mono text-gray-600 uppercase">NO ACTIVE SUBMISSIONS LOGGED INSIDE REGISTRY WINDOW.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ============================================== */}
          {/* MULTI-INTERNSHIP APPLY & ENROLLMENT STATION     */}
          {/* ============================================== */}
          {activeTab === 'APPLY_MORE' && (() => {
            // Find available projects that are NOT already applied
            const appliedIds = activeInternships.map(p => p.id);
            const availableProjects = INITIAL_PROJECTS.filter(p => !appliedIds.includes(p.id));

            const getTrackFee = (domain: string) => {
              const dom = domain.toLowerCase();
              if (dom.includes("cybersecur")) return 199;
              if (dom.includes("ai") || dom.includes("ml")) return 249;
              if (dom.includes("devops")) return 189;
              if (dom.includes("api")) return 139;
              return 149;
            };

            const handleCompleteEnrollment = () => {
              if (!selectedApplyProject) return;
              if (!termsAccepted1 || !termsAccepted2 || !termsAccepted3) {
                onShowToast("Please check and accept all mandatory performance-stipend and formal terms to apply.", "warn");
                return;
              }
              if (!applyScreenshot) {
                onShowToast("Mandatory payment confirmation screenshot is required to complete enrollment.", "warn");
                return;
              }

              // Deep copy applied project
              const clonedProject: StudentProject = {
                ...selectedApplyProject,
                milestones: selectedApplyProject.milestones.map(m => ({ ...m, completed: false }))
              };

              setActiveInternships(prev => [...prev, clonedProject]);
              setSelectedInternshipId(clonedProject.id);

              onShowToast(`Enrolled successfully in ${clonedProject.title}! Welcome to the ${clonedProject.domain} Track.`, 'success');
              
              // Clear state & navigate
              setSelectedApplyProject(null);
              setTermsAccepted1(false);
              setTermsAccepted2(false);
              setTermsAccepted3(false);
              setApplyScreenshot('');
              setActiveTab('HOME');
            };

            return (
              <div className="space-y-8 text-left">
                <div className="space-y-2 border-b border-white/10 pb-6">
                  <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// PARALLEL_SPECIALIZATION_INGRESS</span>
                  <h1 className="text-3xl font-black text-white">APPLY FOR ADDI-SPECIALIZATIONS</h1>
                  <p className="text-xs text-gray-400">Expand your cohort portfolio by enrolling in parallel engineering tracks. Work concurrently on multiple projects to double your industry credentials.</p>
                </div>

                {availableProjects.length === 0 ? (
                  <div className="p-12 text-center bg-neutral-900/30 rounded-xl border border-white/5 space-y-4">
                    <span className="text-4xl">👑</span>
                    <h3 className="text-white font-bold text-lg">ALL SPECIALIZATIONS LOADED</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">You have already registered for all available specialized internship pathways in this cohort cycle.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableProjects.map((p) => {
                      const fee = getTrackFee(p.domain);
                      return (
                        <div key={p.id} className="bg-neutral-900/40 p-6 rounded-xl border border-white/5 flex flex-col justify-between space-y-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-mono bg-[#E94560]/10 text-[#E94560] px-2 py-0.5 rounded font-bold uppercase">{p.domain}</span>
                              <span className="text-[10px] text-gray-500 font-mono">Cost: ₹{fee}</span>
                            </div>
                            <h3 className="font-bold text-base text-white">{p.title}</h3>
                            <p className="text-xs text-gray-400 leading-relaxed max-h-16 overflow-hidden text-ellipsis">{p.description}</p>
                            
                            <div className="flex flex-wrap gap-1 pt-1">
                              {p.techStack.map(tech => (
                                <span key={tech} className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">{tech}</span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedApplyProject(p);
                              setTermsAccepted1(false);
                              setTermsAccepted2(false);
                              setTermsAccepted3(false);
                              setApplyScreenshot('');
                            }}
                            className="w-full py-2 bg-white hover:bg-gray-100 text-black text-xs font-mono font-bold uppercase tracking-widest text-center cursor-pointer rounded-[4px]"
                          >
                            OPEN PLACEMENT APPLICATION →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TERMS & VERIFICATION CONFIRMATION MODAL */}
                {selectedApplyProject && (() => {
                  const fee = getTrackFee(selectedApplyProject.domain);
                  return (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                      <div className="bg-neutral-950 border border-white/10 p-6 md:p-8 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6">
                        
                        <div className="flex justify-between items-start border-b border-white/10 pb-4">
                          <div>
                            <span className="text-red-500 font-mono text-[9px] uppercase font-bold tracking-widest block">// SECURE COHORT ENROLLMENT FLOW</span>
                            <h2 className="text-xl font-bold text-white uppercase">{selectedApplyProject.title}</h2>
                          </div>
                          <button 
                            onClick={() => setSelectedApplyProject(null)}
                            className="text-gray-500 hover:text-white font-mono text-xs uppercase"
                          >
                            [ CANCEL ]
                          </button>
                        </div>

                        <div className="space-y-4 text-xs leading-relaxed text-gray-300">
                          <div className="p-3 bg-rose-500/5 text-rose-300 border border-rose-500/10 rounded font-mono text-[10px] leading-relaxed">
                            ⚠️ <strong>FORMAL PLACEMENT COHORT BOND:</strong> Please read and accept the mandatory terms of performance-based stipends before initialising server allocations.
                          </div>

                          {/* Mandatory Checklist Items */}
                          <div className="space-y-3.5">
                            <label className="flex gap-3 items-start cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={termsAccepted1}
                                onChange={(e) => setTermsAccepted1(e.target.checked)}
                                className="mt-1 accent-[#E94560]"
                              />
                              <span>
                                <strong>Stipends are Performance-Based:</strong> I understand that stipends are strictly performance-based, meaning they are up to ₹6,000 index limit depending purely on quality audits. The actual monthly payout may be ₹0, ₹100, or ₹500 depending on submission reviews, and Hellware reserves the formal right to offer ₹0 stipend if my contributions do not meet quality standards.
                              </span>
                            </label>

                            <label className="flex gap-3 items-start cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={termsAccepted2}
                                onChange={(e) => setTermsAccepted2(e.target.checked)}
                                className="mt-1 accent-[#E94560]"
                              />
                              <span>
                                <strong>No Flat Stipend Guarantees:</strong> I acknowledge that Hellware does not specify flat-rate or guaranteed stipends in offer letters or placement conditions. All references are formal and performance-assessed.
                              </span>
                            </label>

                            <label className="flex gap-3 items-start cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={termsAccepted3}
                                onChange={(e) => setTermsAccepted3(e.target.checked)}
                                className="mt-1 accent-[#E94560]"
                              />
                              <span>
                                <strong>Formal Documents &amp; Payment Screenshot:</strong> I agree that both Offer Letters and Internship Completion Letters are formal credentials, and <strong>submitting a valid payment screenshot of the track operating fee (₹{fee}) is strictly mandatory</strong> for verification and release of my formal completion letter.
                              </span>
                            </label>
                          </div>

                          {/* Simulated Payment Area */}
                          <div className="p-4 bg-black border border-white/5 rounded-lg space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-gray-500">PROGRAM ENTRY contribution fee</span>
                              <span className="text-white font-bold">₹{fee} INR</span>
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-gray-400 block uppercase">Simulate Verification Screenshot (MANDATORY)</label>
                              {applyScreenshot ? (
                                <div className="flex justify-between items-center p-2.5 bg-rose-500/5 rounded border border-rose-500/20 text-[10px] font-mono">
                                  <span className="text-rose-400 truncate">✓ {applyScreenshot}</span>
                                  <button onClick={() => setApplyScreenshot('')} className="text-gray-500 hover:text-white uppercase">[ CLEAR ]</button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setApplyScreenshot(`payment-confirm-${selectedApplyProject.id}-${Date.now()}.png`)}
                                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-white font-mono text-[10px] border border-white/10 rounded uppercase"
                                >
                                  📸 SIMULATE PAYMENT SCREENSHOT CAPTURE
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button 
                            type="button"
                            onClick={() => setSelectedApplyProject(null)}
                            className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 text-gray-400 font-mono text-xs uppercase text-center rounded"
                          >
                            GO BACK
                          </button>
                          <button 
                            type="button"
                            disabled={!termsAccepted1 || !termsAccepted2 || !termsAccepted3 || !applyScreenshot}
                            onClick={handleCompleteEnrollment}
                            className={`flex-1 py-3 font-mono text-xs uppercase text-center rounded font-bold ${
                              termsAccepted1 && termsAccepted2 && termsAccepted3 && applyScreenshot
                                ? 'bg-[#E94560] hover:bg-[#d63a54] text-white' 
                                : 'bg-neutral-800 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            ENROLL NOW
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })()}

          {/* ============================================== */}
          {/* OFFER LETTER INTERACTIVE PANEL                 */}
          {/* ============================================== */}
          {activeTab === 'OFFER_LETTER' && (() => {
            const getStipendAndContribution = (months: number, domain: string) => {
              const dom = domain || "";
              const isPremium = dom.includes("AI") || dom.includes("Cybersecurity");
              const isLighter = dom.includes("Automation") || dom.includes("API");
              
              if (months === 1) {
                return { 
                  stipend: "Performance-Based Track (₹0 base, academic evaluation only; can yield ₹100 or ₹500 for exceptional submissions)", 
                  fee: "INR 149 (Verification & Server Operations)" 
                };
              }

              let baseStipend = 4000;
              let baseFee = 149;

              if (months === 2) { baseStipend = 4000; baseFee = 149; }
              else if (months === 3) { baseStipend = 4500; baseFee = 199; }
              else if (months === 4) { baseStipend = 5000; baseFee = 249; }
              else if (months === 6) { baseStipend = 6000; baseFee = 299; }

              if (isPremium) {
                baseStipend += 1500;
                baseFee += 50;
              } else if (isLighter) {
                baseStipend -= 1000;
                baseFee -= 50;
              }

              return {
                stipend: `Performance-Based (Up to ₹${baseStipend.toLocaleString('en-IN')}/month, review-dependent; actual payout can be ₹0, ₹100, or ₹500 based on quality and standards)`,
                fee: `INR ${baseFee} (Operating Verification fee)`
              };
            };
            const { stipend, fee } = getStipendAndContribution(offerDuration, currentInternship.domain);

            return (
              <div className="space-y-8 text-left">
                <div className="space-y-2 border-b border-white/10 pb-6">
                  <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// CONTRACT_STATION</span>
                  <h1 className="text-3xl font-black text-white">INTERNSHIP APPOINTMENT DISPATCHER</h1>
                  <p className="text-xs text-gray-400">Review your remote placement conditions, customize duration parameters, and download faculty-grade watermarked documents.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form Settings (Cols 1-5) */}
                  <div className="lg:col-span-5 bg-neutral-900/40 p-6 border border-white/5 rounded-xl space-y-6 self-start">
                    <span className="font-mono text-[9px] text-gray-500 uppercase block font-bold">// ADJUST PROGRAM DURATIONS</span>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-400 uppercase">Select Internship Duration</label>
                        <select 
                          value={offerDuration}
                          onChange={(e) => {
                            setOfferDuration(Number(e.target.value));
                            onShowToast(`Contract schedule shifted to ${e.target.value} Months. Preview updated!`, 'success');
                          }}
                          className="w-full bg-black border border-white/10 px-4 py-2.5 text-xs text-white rounded focus:outline-none focus:border-red-500 font-mono"
                        >
                          <option value={1}>1 Month Track Duration</option>
                          <option value={2}>2 Months Track Duration</option>
                          <option value={3}>3 Months Track Duration</option>
                          <option value={4}>4 Months Track Duration</option>
                          <option value={6}>6 Months Track Duration</option>
                        </select>
                      </div>

                      <div className="p-4 bg-black/40 border border-white/5 rounded-lg text-xs space-y-2.5">
                        <div>
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">Evaluation Scheme</span>
                          <span className="text-white font-bold text-xs uppercase tracking-wider">Project Quality Review</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] text-gray-400 leading-relaxed font-light">
                        <strong className="text-white block mb-1">FACULTY CREDENTIALS TESTED</strong>
                        Our appointment letters satisfy UGC guidelines, including explicit total hours criteria (150-300 hours) necessary for university curriculum credit endorsements.
                      </div>

                      <button 
                        onClick={() => {
                          printOfferLetter("Alex Mercer", currentInternship.domain, offerDuration, stipend);
                          onShowToast('Formal appointment letter compiled with diagnostic watermark.', 'success');
                        }}
                        className="w-full py-3 bg-white hover:bg-gray-100 text-black font-semibold text-xs font-mono uppercase tracking-widest text-center cursor-pointer flex items-center justify-center gap-2 rounded-[4px]"
                      >
                        <Download className="w-4 h-4 text-black" /> DOWNLOAD FORMAL PDF
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Visual Letter Preview (Cols 6-12) */}
                  <div className="lg:col-span-7 bg-white text-black p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden select-text" style={{ minHeight: '580px' }}>
                    {/* Watermark label */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] pointer-events-none select-none opacity-[0.06] text-center font-mono font-black" style={{ fontSize: '50px', whiteSpace: 'nowrap' }}>
                      HELLWARE OFFICIAL<br />CONTRACT DEPT
                    </div>

                    <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
                      <div className="flex items-center gap-2">
                        <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
                          <span className="w-1.5 h-1.5 bg-[#E94560] rounded-full"></span><span className="w-1.5 h-1.5"></span><span className="w-1.5 h-1.5 bg-[#E94560] rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-[#E94560] rounded-full"></span><span className="w-1.5 h-1.5 bg-black rounded-full"></span><span className="w-1.5 h-1.5 bg-[#E94560] rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-[#E94560] rounded-full"></span><span className="w-1.5 h-1.5"></span><span className="w-1.5 h-1.5 bg-[#E94560] rounded-full"></span>
                        </div>
                        <span className="font-black tracking-wider text-black text-sm">HELLWARE</span>
                      </div>
                      <div className="font-mono text-[9px] text-gray-500 text-right uppercase leading-tight">
                        SERIAL: HW-OFFER-{offerDuration}M<br />STATUS: DEPLOYED_APPROVED
                      </div>
                    </div>

                    <div className="space-y-6 text-xs text-justify">
                      <h4 className="font-black text-center text-sm uppercase tracking-wide border-b border-black/10 pb-2">INTERNSHIP APPOINTMENT DISPATCH</h4>
                      
                      <div className="font-mono text-[10px] text-gray-600">DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>

                      <p className="font-bold">Dear Alex Mercer,</p>
                      
                      <p>
                        Following the successful evaluation of your credentials and academic tracks, we are pleased to extend this formal offer of a Remote Internship position at <strong>Hellware</strong>. This appointment constitutes a rigorous, project-focused placement designed to substantiate university credit and faculty approvals.
                      </p>

                      <p>
                        During this tenure, you will operate under simulated corporate DevOps workflows, committing real-world code assets to public VCS repositories and initializing active live isolation environments checks. Below is the designated operational schedule of your program parameters:
                      </p>

                      <div className="font-mono text-[10px] bg-gray-50 border border-gray-200 p-4 rounded space-y-1.5 text-gray-700">
                        <div className="flex justify-between"><span>CANDIDATE COHORT MEMBER:</span> <strong className="text-black">Alex Mercer</strong></div>
                        <div className="flex justify-between"><span>SPECIALIZATION DOMAIN:</span> <strong className="text-black">{currentInternship.domain}</strong></div>
                        <div className="flex justify-between"><span>PROGRAM DURATIONAL SCHEDULE:</span> <strong className="text-black">{offerDuration} Month(s) Active Track</strong></div>
                        <div className="flex justify-between"><span>WORK MODEL:</span> <strong className="text-black">Remote Agile Workflows</strong></div>
                      </div>

                      <p>
                        Your milestones must compile cleanly on the cloud evaluation engines. This letter is sufficient evidence of placement to present before your academic faculty or head of placement for administrative internship approval.
                      </p>

                      <div className="flex justify-between items-end pt-8">
                        <div>
                          <div className="h-0.5 w-32 bg-black mb-1"></div>
                          <span className="font-mono text-[8px] text-gray-500 uppercase">Thorne Vance, Director</span>
                        </div>
                        <svg width="40" height="40" viewBox="0 0 45 45" fill="none">
                          <circle cx="22.5" cy="22.5" r="21.5" stroke="#E94560" stroke-width="2" stroke-dasharray="4 2"/>
                          <circle cx="22.5" cy="22.5" r="16.5" stroke="#111111" stroke-width="1"/>
                          <path d="M18 15V30M27 15V30M18 22.5H27" stroke="#E94560" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================== */}
          {/* WEEKLY PROGRESS REPORTS INTERFACE              */}
          {/* ============================================== */}
          {activeTab === 'WEEKLY_REPORTS' && (
            <div className="space-y-8 text-left">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// PROGRESS_LEDGER</span>
                <h1 className="text-3xl font-black text-white">WEEKLY CREDIT REVIEW REPORTS</h1>
                <p className="text-xs text-gray-400">Log weekly lines-of-code authored, total effort hours, achievements and blockers, and compile official watermarked report PDFs for college department evaluations.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Log New Progress Report Form (Cols 1-5) */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newReportForm.achievements) {
                      onShowToast('Please document weekly achievements.', 'warn');
                      return;
                    }
                    const compiled = {
                      weekNum: Number(newReportForm.weekNum),
                      hoursLogged: Number(newReportForm.hoursLogged),
                      locCount: Number(newReportForm.locCount),
                      achievements: newReportForm.achievements,
                      blockers: newReportForm.blockers || "None / CORS Handshakes resolving fine.",
                      status: "APPROVED"
                    };
                    setWeeklyReports([compiled, ...weeklyReports]);
                    onShowToast(`Report for Week ${newReportForm.weekNum} saved successfully in portal registry!`, 'success');
                    setNewReportForm({
                      weekNum: Number(newReportForm.weekNum) + 1,
                      hoursLogged: 15,
                      locCount: 200,
                      achievements: "",
                      blockers: ""
                    });
                  }}
                  className="lg:col-span-5 bg-neutral-900/40 p-6 border border-white/5 rounded-xl space-y-4 self-start"
                >
                  <span className="font-mono text-[9px] text-gray-500 uppercase block font-bold">// RECORD ITERATION STATS</span>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400">WEEK</label>
                      <select 
                        value={newReportForm.weekNum}
                        onChange={(e) => setNewReportForm(prev => ({ ...prev, weekNum: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/5 rounded px-2.5 py-2 text-xs text-white uppercase font-mono font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16].map(w => (
                          <option key={w} value={w}>Week {w}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400">HOURS LOGGED</label>
                      <input 
                        type="number" 
                        required 
                        min={1} 
                        max={80}
                        value={newReportForm.hoursLogged}
                        onChange={(e) => setNewReportForm(prev => ({ ...prev, hoursLogged: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/5 rounded px-2.5 py-2 text-xs text-white text-center font-mono" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400">LOC CODESETS</label>
                      <input 
                        type="number" 
                        required 
                        min={0}
                        value={newReportForm.locCount}
                        onChange={(e) => setNewReportForm(prev => ({ ...prev, locCount: Number(e.target.value) }))}
                        className="w-full bg-black border border-white/5 rounded px-2.5 py-2 text-xs text-white text-center font-mono" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase">Accomplishments Achievements</label>
                    <textarea 
                      required
                      placeholder="Initialized route verifiers, patched OAuth token handshake, authored system unit testing checks."
                      value={newReportForm.achievements}
                      onChange={(e) => setNewReportForm(prev => ({ ...prev, achievements: e.target.value }))}
                      className="w-full h-20 bg-black border border-white/5 rounded p-3 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-red-500" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase">Blockers Identified (Optional)</label>
                    <textarea 
                      placeholder="Resolving CORS websocket timeout inside container isolates tests."
                      value={newReportForm.blockers}
                      onChange={(e) => setNewReportForm(prev => ({ ...prev, blockers: e.target.value }))}
                      className="w-full h-16 bg-black border border-white/5 rounded p-3 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none" 
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#E94560] hover:bg-[#d63a54] text-white font-bold text-xs font-mono uppercase tracking-widest text-center cursor-pointer rounded-[4px]"
                  >
                    DEPLOY WEEKLY PROGRESS RECORD
                  </button>
                </form>

                {/* Right Column: Historical List of report card logs (Cols 6-12) */}
                <div className="lg:col-span-7 space-y-4">
                  <span className="font-mono text-[9px] text-gray-500 uppercase block font-bold">// TRANSMITTED PROGRESS ARCHIVES</span>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {weeklyReports.map((report, idx) => {
                      const msText = currentInternship.milestones
                        ?.map(m => `• [${m.completed ? 'x' : ' '}] ${m.text}`)
                        ?.join('\n') || '';

                      return (
                        <div key={idx} className="bg-neutral-900/60 border border-white/5 p-6 rounded-xl space-y-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-sm text-white uppercase tracking-tight">Week {report.weekNum} Iteration Review</h4>
                              <span className="text-[8px] font-mono text-gray-500 uppercase">SUBMITTED ON CURRENT CYCLE // REGISTERED OK</span>
                            </div>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-mono font-bold">✓ APPROVED</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-black/40 border border-white/5 rounded text-center">
                              <span className="text-[8px] text-gray-500 block uppercase font-mono">Hours LOGGED</span>
                              <span className="text-white font-bold text-sm font-mono">{report.hoursLogged} hours</span>
                            </div>
                            <div className="p-3 bg-black/40 border border-white/5 rounded text-center">
                              <span className="text-[8px] text-gray-500 block uppercase font-mono">Lines of Code (LOC)</span>
                              <span className="text-[#E94560] font-bold text-sm font-mono">{report.locCount} lines</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-[8px] font-mono text-gray-500 uppercase block">Accomplishments:</span>
                              <p className="text-gray-300 leading-relaxed bg-black/30 p-3 border border-white/5 rounded mt-1 italic font-light">"{report.achievements}"</p>
                            </div>
                            {report.blockers && (
                              <div>
                                <span className="text-[8px] font-mono text-gray-500 uppercase block">Blockers:</span>
                                <p className="text-gray-400 leading-relaxed bg-black/30 p-3 border border-white/5 rounded mt-1 italic font-light">"{report.blockers}"</p>
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => {
                              printWeeklyReport(
                                report.weekNum,
                                report.hoursLogged,
                                report.locCount,
                                report.achievements,
                                report.blockers,
                                msText,
                                "Alex Mercer",
                                userEmail,
                                currentInternship.domain
                              );
                              onShowToast('Weekly tracking report generated with secured watermark.', 'success');
                            }}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[9px] font-mono uppercase tracking-widest text-center cursor-pointer border border-white/5 rounded flex items-center justify-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5" /> DOWNLOAD WATERMARKED PROGRESS CODE PDF
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* B. ASSIGNED PROJECT DETAILED VIEW              */}
          {/* ============================================== */}
          {activeTab === 'PROJECT' && (
            <div className="space-y-8">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// DESIGNATED ARTIFACT SPECS</span>
                <h1 className="text-3xl font-black text-white uppercase">{currentInternship.title}</h1>
                <p className="text-xs text-gray-400 font-light max-w-lg leading-relaxed">Check metrics, toggle completion of modular milestones, and deploy code securely inside port-safe repositories.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Specs column (Left 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-widest font-mono text-white">// 1. SYNOPSIS</h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{currentInternship.description}</p>
                  </div>

                  {/* Milestones interactive list */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h3 className="font-bold text-sm uppercase tracking-widest font-mono text-white">// 2. DESTRUCTIVE STAGED MILESTONES</h3>
                    <p className="text-[11px] text-gray-400">Checkbox toggles represent sandbox local state progress mapping only. Click to tick completed segments:</p>
                    
                    <div className="space-y-2 pt-2">
                      {currentInternship.milestones.map((mi) => (
                        <div 
                          key={mi.id}
                          onClick={() => {
                            handleToggleLocalMilestone(mi.id);
                            onShowToast(`Milestone checkpoint toggled.`, 'success');
                          }}
                          className={`flex gap-3 items-center p-3.5 rounded border transition-all cursor-pointer select-none ${
                            mi.completed 
                              ? 'bg-red-500/5 border-red-500/20 text-white' 
                              : 'bg-black border-white/5 text-gray-400 hover:border-white/10'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            mi.completed ? 'bg-red-500 border-red-500 text-black' : 'border-white/20'
                          }`}>
                            {mi.completed && <CheckSquare className="w-3.5 h-3.5 text-black font-black" />}
                          </div>
                          <span className="text-xs font-mono">{mi.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tech stacks and sidebar directions */}
                <div className="bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-6 self-start">
                  <span className="font-mono text-[9px] text-gray-500 uppercase block">COMPILER CONSTRAINTS</span>
                  
                  <div className="space-y-2">
                    <span className="text-[8px] font-mono text-gray-600 block uppercase">REQUIRED ENGINES</span>
                    <div className="flex flex-wrap gap-1">
                      {currentInternship.techStack.map((tech) => (
                        <span key={tech} className="text-[10px] font-mono bg-black border border-white/5 px-2.5 py-0.5 rounded text-white font-bold">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <span className="text-[8px] font-mono text-gray-600 block uppercase">SANDBOX REQUISITIONS</span>
                    <ul className="space-y-1.5 text-[10px] text-gray-400 leading-relaxed font-light">
                      <li>• Strict ESLint validations compiled</li>
                      <li>• Docker configurations mapped safely</li>
                      <li>• Code coverage verified above 85%</li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => {
                      printProjectDefinition(currentInternship, "Alexander Mercer");
                      onShowToast('Project specification PDF generated with secured watermark.', 'success');
                    }}
                    className="w-full py-2.5 bg-white hover:bg-gray-200 text-black text-[10px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer flex items-center justify-center gap-2 border border-white/10 rounded-[6px]"
                  >
                    <Download className="w-3.5 h-3.5" /> DOWNLOAD SPEC PDF (WATERMARKED)
                  </button>

                  <button 
                    onClick={() => setActiveTab('SUBMIT')}
                    className="w-full py-2.5 bg-[#E94560] hover:bg-[#d63a54] text-white text-[10px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer rounded-[6px]"
                  >
                    DEPLOY SUBMIT FORM →
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* C. SUBMIT WORK INTERFACE                       */}
          {/* ============================================== */}
          {activeTab === 'SUBMIT' && (
            <div className="space-y-8">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// DISPATCH ARTIFACTS INGRESS</span>
                <h1 className="text-3xl font-black text-white">SUBMIT BUILD SCHEMAS</h1>
                <p className="text-xs text-gray-400">Lock repositories links, live deployments, and visual walkthrough briefs below to initialize reviewer checks cascades.</p>
              </div>

              <form onSubmit={handleSubmissionDispatch} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Public GitHub Code Repository URL</label>
                    <input 
                      type="url" 
                      required
                      value={subForm.githubUrl} 
                      onChange={(e) => setSubForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-red-500" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">Active Live Deployment Proxy URL</label>
                    <input 
                      type="url" 
                      required
                      value={subForm.liveUrl} 
                      onChange={(e) => setSubForm(prev => ({ ...prev, liveUrl: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-red-500" 
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-mono uppercase text-gray-500">Walkthrough video link (Loom / YouTube)</label>
                    <input 
                      type="url" 
                      value={subForm.videoUrl} 
                      onChange={(e) => setSubForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-red-500" 
                    />
                  </div>
                </div>

                {/* Drag and Drop Screenshot upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-gray-500">Drag & Drop Image Screenshots</label>
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`w-full min-h-[140px] border border-dashed rounded-lg flex flex-col items-center justify-center p-6 ${
                      dragActive ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-black'
                    }`}
                  >
                    <Copy className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-xs text-gray-400">Drag & Drop visual interface snapshots or <label className="text-red-500 hover:underline cursor-pointer"><input type="file" className="hidden" />browse file tree</label></span>
                    <span className="text-[8px] text-gray-600 font-mono mt-1 block uppercase">Supports PNG, JPEG up to 6MB</span>
                  </div>

                  {subForm.filesUploaded.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {subForm.filesUploaded.map((usrF) => (
                        <span key={usrF} className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[9px] px-2.5 py-1 rounded">
                          {usrF.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gray-500">Audit Documentation and Special Instructions Notes</label>
                  <textarea 
                    value={subForm.notes} 
                    onChange={(e) => setSubForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded p-4 text-xs font-mono text-white focus:outline-none focus:border-red-500 h-32" 
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-mono text-xs uppercase tracking-widest font-black transition-colors cursor-pointer"
                  >
                    [ Transmit to Evaluation Queue ]
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ============================================== */}
          {/* D. SUBMISSIONS HISTORY                         */}
          {/* ============================================== */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-8 text-left">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// ARTIFACT DISPATCH RECOGNITION REGISTRY</span>
                <h1 className="text-3xl font-black text-white">SUBMISSIONS REGISTRY</h1>
                <p className="text-xs text-gray-400">Track and view dynamic feedback logs on dispatched core builds.</p>
              </div>

              <div className="space-y-4">
                {submissions.map((sub, idx) => (
                  <div key={sub.id} className="p-6 bg-neutral-900/40 border border-white/5 rounded-xl space-y-4">
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[9px] font-mono text-gray-500 block">SUBMISSION BLOCK #{idx+1}</span>
                        <h4 className="font-bold text-white uppercase">{sub.projectName}</h4>
                      </div>
                      <span className={`text-[10px] font-mono px-3 py-1 rounded uppercase tracking-wide font-black ${
                        sub.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        sub.status === 'CHANGES_REQUESTED' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>{sub.status}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10px] text-gray-400">
                      <div>
                        <span className="text-gray-600 block uppercase">DISPATCHED DATE</span>
                        <span className="text-white">{sub.submittedDate} UTC</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block uppercase">DEPLOYED SANDBOX</span>
                        <a href={sub.liveUrl} target="_blank" rel="noreferrer" className="text-red-500 hover:underline truncate block">{sub.liveUrl}</a>
                      </div>
                    </div>

                    {/* Feedback logging notes */}
                    {sub.feedback && (
                      <div className="p-4 bg-black/60 border border-amber-500/10 rounded-lg text-xs leading-relaxed space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-mono text-amber-500 uppercase">
                          <span>Feedback signed by: {sub.feedbackAuthor}</span>
                          <span>{sub.feedbackDate} UTC</span>
                        </div>
                        <p className="text-gray-300 font-light font-sans">{sub.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* E. RECOGNIZED SYLLABUS RESOURCES               */}
          {/* ============================================== */}
          {activeTab === 'RESOURCES' && (
            <div className="space-y-8">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// OPEN_REQUISITIONS_STORAGE</span>
                <h1 className="text-3xl font-black text-white">RESOURCES REGISTER</h1>
                <p className="text-xs text-gray-400">Unlock fully optimized algorithms sheets, LaTeX engineering builders, and proxy guidelines.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INITIAL_RESOURCES.map((res) => (
                  <div key={res.id} className="p-6 bg-neutral-900/30 border border-white/5 rounded-xl space-y-4 flex flex-col justify-between text-left h-52">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded uppercase">{res.category}</span>
                        {res.badge && <span className="text-[8px] bg-red-600/10 text-red-500 font-mono border border-red-500/10 px-2 rounded">{res.badge}</span>}
                      </div>
                      <h4 className="font-bold text-sm text-white tracking-tight">{res.title}</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed truncate">{res.description}</p>
                    </div>

                    <button 
                      onClick={() => onShowToast(`Dynamic stream initiated for artifact: ${res.title}`, 'success')}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-gray-300 hover:text-white uppercase font-bold text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Initialize dynamic stream
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* F. BADGES & CERTIFICATES                       */}
          {/* ============================================== */}
          {activeTab === 'BADGES' && (
            <div className="space-y-8">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// PROOF_OF_WORK_COMPILATION</span>
                <h1 className="text-3xl font-black text-white">BADGES & INTEL CREDENTIALS</h1>
                <p className="text-xs text-gray-400">Verify your cryptographic stamps and download PDF certifications.</p>
              </div>

              {/* Badges display grid */}
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] uppercase font-bold text-gray-500 tracking-wider">EARNED COMMONS BADGES</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {REQ_BADGES.map((bdg) => (
                    <div key={bdg.id} className={`p-4 rounded-xl border flex flex-col justify-between h-36 ${
                      bdg.unlocked 
                        ? 'bg-red-500/5 border-red-500/20 text-white' 
                        : 'bg-neutral-900/10 border-white/5 text-gray-600'
                    }`}>
                      <div className="flex justify-between items-start">
                        <Award className={`w-8 h-8 ${bdg.unlocked ? 'text-red-500' : 'text-gray-700'}`} />
                        <span className="text-[8px] font-mono tracking-widest">{bdg.unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs uppercase tracking-tight text-white">{bdg.name}</h5>
                        <p className="text-[10px] text-gray-400 font-light leading-snug truncate mt-1">{bdg.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4-Step Status Tracker Section */}
              <div className="space-y-4 pt-6 border-t border-white/5 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="font-mono text-[10px] uppercase font-bold text-gray-500 tracking-wider">CERTIFICATE GENERATION PRE-REQUISITES STATUS</h3>
                  <span className="text-[9px] font-mono bg-[#E94560]/10 text-[#E94560] px-2 py-0.5 rounded font-bold uppercase">SECURED BY HELLWARE HASH VECTORS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Step 1: Milestones */}
                  <div className={`p-4 rounded-[4px] border ${progressPercent === 100 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-neutral-900/40 border-white/5'} space-y-3 flex flex-col justify-between`}>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-gray-500 font-bold">STEP 01 // CRITERIA</span>
                        <span className={`w-2 h-2 rounded-full ${progressPercent === 100 ? 'bg-emerald-400' : 'bg-yellow-500'}`} />
                      </div>
                      <h4 className="font-bold text-white text-xs uppercase font-mono">COMPLETE MILESTONES</h4>
                      <p className="text-[10px] text-gray-400 font-light">All core milestones checked in workspace.</p>
                    </div>
                    {progressPercent === 100 ? (
                      <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">[ ✓ MET - 100% DONE ]</span>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-yellow-500 uppercase font-bold block">[ ⚠️ {progressPercent}% COMPLETED ]</span>
                        <button 
                          onClick={() => {
                            assignedProject.milestones.forEach(m => {
                              if (!m.completed) onToggleMilestone(m.id);
                            });
                            onShowToast('Simulating: All milestones marked completed.', 'success');
                          }}
                          className="w-full py-1 text-center bg-white/5 hover:bg-white/10 text-white font-mono text-[8px] rounded uppercase cursor-pointer"
                        >
                          Auto Complete Toggles
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Submitted */}
                  <div className={`p-4 rounded-[4px] border ${submissions.length > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-neutral-900/40 border-white/5'} space-y-3 flex flex-col justify-between`}>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-gray-500 font-bold">STEP 02 // CRITERIA</span>
                        <span className={`w-2 h-2 rounded-full ${submissions.length > 0 ? 'bg-emerald-400' : 'bg-yellow-500'}`} />
                      </div>
                      <h4 className="font-bold text-white text-xs uppercase font-mono">SUBMIT CODEBASE</h4>
                      <p className="text-[10px] text-gray-400 font-light">Repository links and walkthrough deployed.</p>
                    </div>
                    {submissions.length > 0 ? (
                      <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">[ ✓ MET - ARTIFACT PUSHED ]</span>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-yellow-500 uppercase font-bold block">[ ⚠️ NOT SUBMITTED ]</span>
                        <button 
                          onClick={() => setActiveTab('SUBMIT')}
                          className="w-full py-1 text-center bg-white/5 hover:bg-white/10 text-white font-mono text-[8px] rounded uppercase cursor-pointer"
                        >
                          Open Submit Panel →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Approved */}
                  <div className={`p-4 rounded-[4px] border ${(submissions.some(s => s.status === 'APPROVED') || localMockApproved) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-neutral-900/40 border-white/5'} space-y-3 flex flex-col justify-between`}>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-gray-500 font-bold">STEP 03 // CRITERIA</span>
                        <span className={`w-2 h-2 rounded-full ${(submissions.some(s => s.status === 'APPROVED') || localMockApproved) ? 'bg-emerald-400' : 'bg-yellow-500'}`} />
                      </div>
                      <h4 className="font-bold text-white text-xs uppercase font-mono">MENTOR EVAL SIGN-OFF</h4>
                      <p className="text-[10px] text-gray-400 font-light">Review advisor explicitly sets status to Approved.</p>
                    </div>
                    {(submissions.some(s => s.status === 'APPROVED') || localMockApproved) ? (
                      <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">[ ✓ MET - QUALITY PASS ]</span>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-yellow-500 uppercase font-bold block">[ ⚠️ AWAITING AUDIT ]</span>
                        <button 
                          onClick={() => {
                            setLocalMockApproved(true);
                            onShowToast('Simulating: System reviewer approved active build submissions!', 'success');
                          }}
                          className="w-full py-1 text-center bg-white/10 hover:bg-white/20 text-[#E94560] font-mono text-[8px] rounded font-bold uppercase cursor-pointer"
                        >
                          Simulate QA Review Pass
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Step 4: Screenshot Receipt verification */}
                  <div className={`p-4 rounded-[4px] border ${paymentScreenshotUploaded ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-neutral-900/40 border-white/5'} space-y-3 flex flex-col justify-between`}>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-gray-500 font-bold">STEP 04 // REQUIRED</span>
                        <span className={`w-2 h-2 rounded-full ${paymentScreenshotUploaded ? 'bg-emerald-400' : 'bg-yellow-500'}`} />
                      </div>
                      <h4 className="font-bold text-white text-xs uppercase font-mono">PAYMENT SCREENSHOT</h4>
                      <p className="text-[10px] text-gray-400 font-light">Upload transaction receipt image supporting server operations.</p>
                    </div>
                    {paymentScreenshotUploaded ? (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold block">[ ✓ ATTACHED SCREENSHOT ]</span>
                        <span className="text-[8.5px] font-mono text-gray-500 uppercase block font-light">Status: {paymentStatus === 'APPROVED' ? 'APPROVED' : 'IN VALIDATION'}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-yellow-500 uppercase font-bold block">[ ⚠️ REQUISITION EMPTY ]</span>
                        <button 
                          onClick={() => setActiveTab('CONTRIBUTION')}
                          className="w-full py-1 text-center bg-[#E94560] hover:bg-[#d63a54] text-white font-mono text-[8px] rounded uppercase cursor-pointer font-bold"
                        >
                          Upload Receipt Screen →
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Real high-fidelity Certificate display */}
              <div className="space-y-4 pt-8 border-t border-white/5 text-left">
                <h3 className="font-mono text-[10px] uppercase font-bold text-gray-500 tracking-wider">SECURED SHIELD ARTIFACT (CERTIFICATE)</h3>
                
                <div className="max-w-3xl mx-auto p-1 bg-neutral-900 rounded-xl relative overflow-hidden border border-white/5">
                  <div className="bg-neutral-950 p-8 text-center space-y-6 relative overflow-hidden">
                    
                    {/* Locked state if not yet issued */}
                    {studentStage !== 'CERTIFICATE_ISSUED' && (
                      <div className="absolute inset-0 bg-black/92 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                        {studentStage === 'APPLIED' || studentStage === 'ONBOARDED' || studentStage === 'INTERNSHIP' || studentStage === 'COMPLETED' ? (
                          <>
                            <Lock className="w-10 h-10 text-red-500 animate-pulse" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-white tracking-widest uppercase text-sm font-mono">// STAGE_LOCKED</h4>
                              <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Complete your internship milestones and submit your work first. The certificate will become available after admin review.
                              </p>
                              <span className="text-[9px] font-mono text-amber-500 block uppercase">Stage: {studentStage}</span>
                            </div>
                          </>
                        ) : studentStage === 'CERTIFICATION_READY' ? (
                          <>
                            <Lock className="w-10 h-10 text-amber-500 animate-pulse" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-amber-500 tracking-widest uppercase text-sm font-mono">// PAYMENT_REQUIRED</h4>
                              <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Your internship is complete! Submit your payment via UPI or Crypto under the <strong>"CERTIFICATE PAYMENT"</strong> tab to unlock your certificate.
                              </p>
                              <button 
                                onClick={() => setActiveTab('CONTRIBUTION')}
                                className="mt-4 px-4 py-1.5 bg-red-500 hover:bg-red-400 text-white font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                              >
                                Go to Payment Station →
                              </button>
                            </div>
                          </>
                        ) : studentStage === 'PAYMENT_SUBMITTED' ? (
                          <>
                            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-amber-500 tracking-widest uppercase text-sm font-mono">// VALIDATING_PHASE_ACTIVE</h4>
                              <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Our accounts audit team is currently checking your uploaded payment proof to verify its authenticity.
                              </p>
                              <div className="text-[10px] text-gray-500 font-mono mt-3 uppercase p-2 border border-white/5 bg-black rounded">
                                Status: ⏳ MANUAL_AUDITING_RECEIPT
                              </div>
                              <p className="text-[10px] text-[#E94560] font-light max-w-xs mt-2 italic leading-tight mx-auto">
                                Once verified as genuine, we will reach out and dispatch your certificate to your email.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-emerald-400 tracking-widest uppercase text-sm font-mono">// VERIFIED_AND_MAILED</h4>
                              <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Payment approved! Your certificate is being prepared. The admin will update your account to issue the certificate shortly (~1 day).
                              </p>
                              <p className="text-[10px] text-amber-400 font-mono mt-3 uppercase">
                                ⏳ CERTIFICATE ISSUANCE PENDING
                              </p>
                              <p className="text-[10px] text-gray-400 max-w-xs mt-1 font-light mx-auto">
                                Once the admin sets your stage to CERTIFICATE_ISSUED, you can download your certificate below.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Abstract watermarks */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/[0.012] border border-white/5 rounded-full select-none pointer-events-none" />

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-[#E94560] tracking-widest uppercase font-bold">// SECURE CREDENTIAL ARTIFACT REGISTER</span>
                      <h2 className="text-2xl font-black text-white tracking-widest leading-none">HELLWARE COHORT CERTIFICATION</h2>
                      <p className="text-[9px] font-mono text-gray-500">DECENTRALIZED PROOF-OF-WORK VERIFIED HASH</p>
                    </div>

                    <div className="space-y-2 py-6 max-w-lg mx-auto">
                      <p className="text-xs text-gray-400 leading-relaxed font-light">
                        This is to cryptographically sign and acknowledge that
                      </p>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white border-b border-white/10 pb-2 inline-block px-12 font-mono">
                        Alex Mercer
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed font-light">
                        has successfully implemented, resolved, and verified the architectural requirements for the dynamic production systems sandbox entitled:
                      </p>
                      <h4 className="text-sm font-mono font-bold text-[#E94560] uppercase">
                        [{REQ_CERTIFICATE.projectName}]
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono">
                        specialized track focused within <span className="font-bold text-white">{REQ_CERTIFICATE.domain}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 font-mono text-[9px] text-gray-500">
                      <div>
                        <span>HASH ID</span>
                        <span className="text-white block tracking-tighter text-[8px] truncate">{REQ_CERTIFICATE.hash}</span>
                      </div>
                      <div>
                        <span>DETERMINISTIC STATUS</span>
                        <span className="text-emerald-400 block font-bold">GENUINE // ACTIVE</span>
                      </div>
                      <div>
                        <span>UTC DISPATCH</span>
                        <span className="text-white block">{REQ_CERTIFICATE.completionDate}</span>
                      </div>
                    </div>

                    {studentStage === 'CERTIFICATE_ISSUED' ? (
                      <div className="space-y-3">
                        <button 
                          onClick={() => {
                            printCertificate(REQ_CERTIFICATE, "Alex Mercer");
                            onShowToast('Certificate PDF generated successfully.', 'success');
                          }}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Download className="w-4 h-4 text-black" /> Download Internship Certificate
                        </button>
                        <button 
                          onClick={() => {
                            printLOR("Alex Mercer", REQ_CERTIFICATE.domain, REQ_CERTIFICATE.projectName);
                            onShowToast('Letter of Recommendation PDF generated successfully.', 'success');
                          }}
                          className="w-full py-2.5 bg-white hover:bg-gray-200 text-black font-semibold text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download Letter of Recommendation (LOR)
                        </button>
                      </div>
                    ) : (
                      <div className="w-full py-2.5 bg-neutral-900 border border-white/5 text-gray-500 text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 cursor-not-allowed">
                        <Lock className="w-4 h-4" /> Certificate Locked — Wait for Admin to Issue
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* G. REFERRALS HUB                               */}
          {/* ============================================== */}
          {activeTab === 'REFERRAL' && (() => {
            const getFeeValue = () => {
              const dom = assignedProject?.domain || "";
              const isPremium = dom.includes("AI") || dom.includes("Cybersecurity");
              const isLighter = dom.includes("Automation") || dom.includes("API");
              
              if (offerDuration === 1) return 149;

              let baseFee = 149;
              if (offerDuration === 2) baseFee = 149;
              else if (offerDuration === 3) baseFee = 199;
              else if (offerDuration === 4) baseFee = 249;
              else if (offerDuration === 6) baseFee = 299;

              if (isPremium) baseFee += 50;
              else if (isLighter) baseFee -= 50;

              return baseFee;
            };

            const userFee = getFeeValue();
            const paidCount = referredPeers.filter(p => p.status === 'PAID').length;
            const rebatePerUser = 20;
            const totalRebateEarned = Math.min(userFee, paidCount * rebatePerUser);

            const simulateNewReferral = () => {
              const names = ["Aarav Shah", "Aditi Gupta", "Rahul Sharma", "Sneha Rao", "Divya Patel", "Manish Sen"];
              const randomName = names[Math.floor(Math.random() * names.length)];
              const randomId = String(Date.now());
              const newRef = {
                id: randomId,
                name: randomName,
                email: `${randomName.toLowerCase().replace(" ", ".")}@example.edu`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'PAID',
                rebate: 20
              };
              setReferredPeers([...referredPeers, newRef]);
              onShowToast(`Simulation: ${randomName} signed up and paid fee. Earned ₹20 rebate back!`, 'success');
            };

            return (
              <div className="space-y-8">
                <div className="space-y-2 border-b border-white/10 pb-6 text-left">
                  <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// REFL_INDEX_SYNC</span>
                  <h1 className="text-3xl font-black text-white">REFERRALS & REBATE STATION</h1>
                  <p className="text-xs text-gray-400 font-light">
                    Share your custom link with peers. <strong>For each referral who pays fees, get ₹20 back</strong> up to the value of your active certification processing fee (₹{userFee}).
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                  
                  {/* Left: Referral Code Link & Cashback Counters */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-6">
                      <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">YOUR UNIQUE TRANSACTION LINK</span>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          readOnly
                          value={`https://hellware.in/join?ref=${referralCode}`}
                          className="flex-1 bg-black border border-white/10 px-4 py-2 text-xs font-mono text-gray-400 outline-none focus:outline-none" 
                        />
                        <button 
                          onClick={copyReferral}
                          className="px-4 py-2 bg-white text-black font-mono text-xs uppercase font-bold hover:bg-gray-200 cursor-pointer text-center"
                        >
                          {copiedLink ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center font-mono">
                        <div className="space-y-1 bg-black/20 p-2 rounded">
                          <span className="text-[8px] text-gray-500 uppercase block">Enlisted</span>
                          <span className="text-lg font-bold text-white block">{referredPeers.length} Peers</span>
                        </div>
                        <div className="space-y-1 bg-black/20 p-2 rounded">
                          <span className="text-[8px] text-gray-500 uppercase block">Paid Refers</span>
                          <span className="text-lg font-bold text-emerald-400 block">{paidCount} Paid</span>
                        </div>
                        <div className="space-y-1 bg-[#E94560]/10 p-2 rounded border border-[#E94560]/20">
                          <span className="text-[8px] text-[#E94560] uppercase block">Rebated Back</span>
                          <span className="text-lg font-bold text-white block">₹{totalRebateEarned} / ₹{userFee}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={simulateNewReferral}
                          className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-[#E94560] border border-[#E94560]/20 rounded font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          + Simulate Peer Signup & Paid Fee
                        </button>
                      </div>
                    </div>

                    <div className="bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">REWARD MILESTONES SECURED</span>
                      
                      <div className="space-y-4">
                        {[
                          { refs: '1 Paid Peer', label: 'Systems Evaluation prompts package', unlocked: paidCount >= 1 },
                          { refs: '3 Paid Peers', label: 'LaTeX resume builder compiling', unlocked: paidCount >= 3 },
                          { refs: '5 Paid Peers', label: 'Gold premium certification hash bypass', unlocked: paidCount >= 5 }
                        ].map((tr, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono text-gray-500 block uppercase">{tr.refs}</span>
                              <span className="text-gray-300 font-bold block">{tr.label}</span>
                            </div>
                            <span className={`text-[9px] font-mono uppercase font-bold ${tr.unlocked ? 'text-emerald-400' : 'text-gray-600'}`}>
                              {tr.unlocked ? '[ ACTIVE UNLOCKED ]' : '[ LOCKED ]'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Referral Ledger List */}
                  <div className="lg:col-span-6 bg-neutral-900/40 p-6 rounded-xl border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">// REF_LEDGER_REGISTRY</span>

                    <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1">
                      {referredPeers.map((peer) => (
                        <div key={peer.id} className="py-3 flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold block">{peer.name}</span>
                              <span className="text-[8px] font-mono text-gray-500 font-light">({peer.email})</span>
                            </div>
                            <span className="text-[9px] text-gray-500 block">Enlisted: {peer.date}</span>
                          </div>
                          <div className="text-right space-y-1">
                            <span className={`text-[9px] font-mono uppercase font-bold block ${
                              peer.status === 'PAID' ? 'text-emerald-400' : 'text-amber-500'
                            }`}>
                              {peer.status === 'PAID' ? '✓ Paid Fee' : '⏳ Pending'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono block">
                              {peer.status === 'PAID' ? '+₹20 Cashback' : '₹0 Claimable'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-black/40 border border-white/5 rounded text-[10px] text-gray-400 leading-normal">
                      <strong>Rebate processing rule:</strong> Your earned referral credit of ₹20 per student pays fee is directly calculated and can be settled upon completion manually.
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* ============================================== */}
          {/* H. CERTIFICATE ISSUANCE & PAYMENT HUB          */}
          {/* ============================================== */}
          {activeTab === 'CONTRIBUTION' && (
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// REQUISITION_CHRONICLE_LEDGER</span>
                <h1 className="text-3xl font-black text-white">CERTIFICATE PAYMENT & DISPATCH STATION</h1>
                <p className="text-xs text-gray-400">Complete your certified track with secure token processing, manual receipt checking, and email dispatch.</p>
              </div>

              {/* Step Status Tracker */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1: Submission */}
                <div className="bg-neutral-900/60 p-4 border border-white/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-gray-500 uppercase">Stage 01</span>
                    <span className={`text-[9px] font-mono uppercase font-bold ${submissions.length > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {submissions.length > 0 ? '✓ COMPLETED' : '⚠️ PENDING'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white">INTERNSHIP SUBMISSION</h4>
                  <p className="text-[10px] text-gray-400 font-light">Your source code schemas and video link must be locked inside the submission queue.</p>
                </div>

                {/* Step 2: Payment Receipt Screenshot */}
                <div className="bg-neutral-900/60 p-4 border border-white/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-gray-500 uppercase">Stage 02</span>
                    <span className={`text-[9px] font-mono uppercase font-bold ${paymentScreenshotUploaded ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {paymentScreenshotUploaded ? '✓ REASSIGNED' : '⚠️ AWAITING'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white font-semibold">PAYMENT RECEIPT ATTACHMENT</h4>
                  <p className="text-[10px] text-gray-400 font-light">Make voluntary contribution of ₹149 and upload screenshot receipt for manual review.</p>
                </div>

                {/* Step 3: Audit Phase status */}
                <div className="bg-neutral-900/60 p-4 border border-white/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-gray-500 uppercase">Stage 03</span>
                    <span className={`text-[9px] font-mono uppercase font-bold ${
                      paymentStatus === 'APPROVED' ? 'text-emerald-400' : paymentStatus === 'VALIDATING' ? 'text-amber-500 animate-pulse' : 'text-gray-500'
                    }`}>
                      {paymentStatus === 'APPROVED' ? '✓ APPROVED' : paymentStatus === 'VALIDATING' ? '⏳ VALIDATING' : 'AWAITING'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white">MANUAL ACCOUNTS AUDIT</h4>
                  <p className="text-[10px] text-gray-400 font-light">Our accounts audit team manually verifies screenshots against ledger to detect fraud.</p>
                </div>
              </div>

              {/* Main content split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left side: Instructions & Screenshot Uploader */}
                <div className="lg:col-span-7 bg-neutral-900/20 border border-white/5 p-6 rounded-xl space-y-6">
                  
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-sm uppercase">1. SECURE CERTIFICATION PAYMENT</h3>
                    <p className="text-xs text-gray-400 leading-normal">
                      To download authentic cryptographic signed credentials, clear the background rendering server workload dynamically. 
                      You can pay via our Razorpay Sandbox below, or scan a manual UPI routing QR sequence.
                    </p>
                  </div>

                  {/* Payment Method Selection + Details */}
                  <div className="bg-black/50 p-4 border border-white/5 rounded-lg space-y-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setPaymentMethod('UPI'); setCryptoTxHash(''); }}
                        className={`flex-1 py-2 text-[11px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer border ${
                          paymentMethod === 'UPI'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-neutral-900 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        UPI PAYMENT
                      </button>
                      <button
                        onClick={() => { setPaymentMethod('CRYPTO'); setUtrNumber(''); }}
                        className={`flex-1 py-2 text-[11px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer border ${
                          paymentMethod === 'CRYPTO'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-neutral-900 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        CRYPTO PAYMENT
                      </button>
                    </div>

                    {paymentMethod === 'UPI' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-neutral-900/60 border border-white/5 rounded">
                          <div className="w-20 h-20 bg-white p-1 rounded flex items-center justify-center shrink-0">
                            <div className="grid grid-cols-6 gap-0.5 w-full h-full bg-black">
                              {Array.from({ length: 36 }).map((_, i) => (
                                <span key={i} className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-gray-500 block uppercase">Scan with any UPI app</span>
                            <span className="text-white font-bold text-sm font-mono">hellware@ybl</span>
                            <span className="text-[9px] font-mono text-gray-500 block uppercase">₹149 — REF: HW_VERIFY_UPI</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono text-gray-500 uppercase block">Enter UTR Number After Payment</label>
                          <input
                            type="text"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. UTR123456789"
                            className="w-full bg-black border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'CRYPTO' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-neutral-900/60 border border-white/5 rounded space-y-2">
                          <span className="text-[9px] font-mono text-gray-500 block uppercase">Send USDT (BEP20/ERC20) to:</span>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-[10px] font-mono text-white bg-black/60 px-2 py-1.5 rounded border border-white/5 truncate">
                              0x742d35Cc6634C0532925a3b844Bc4a9f8bD9a5c7
                            </code>
                            <button
                              onClick={() => { navigator.clipboard.writeText('0x742d35Cc6634C0532925a3b844Bc4a9f8bD9a5c7'); onShowToast('Address copied!', 'success'); }}
                              className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-[9px] font-mono border border-white/5 rounded cursor-pointer text-gray-300"
                            >
                              COPY
                            </button>
                          </div>
                          <span className="text-[9px] font-mono text-gray-600 block">Amount: ~$2 USDT (₹149 equivalent)</span>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono text-gray-500 uppercase block">Enter Transaction Hash</label>
                          <input
                            type="text"
                            value={cryptoTxHash}
                            onChange={(e) => setCryptoTxHash(e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-black border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SCREENSHOT UPLOADER */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold text-sm uppercase">2. UPLOAD PAYMENT SCREENSHOT RECEIPT</h3>
                      <span className="text-[8.5px] font-mono text-orange-500 font-bold uppercase tracking-wider">// DETECTS REAL/FAKE TRANS</span>
                    </div>

                    {paymentScreenshotUploaded ? (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="text-left font-mono">
                              <span className="text-xs text-white block truncate uppercase font-bold">Screenshot Uploaded: {paymentScreenshotUploaded}</span>
                              <span className="text-[9px] text-gray-400 block">Awaiting manual accounting office auditing validation checks.</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setPaymentScreenshotUploaded(null);
                              setPaymentStatus('PENDING');
                              onShowToast('Removed transaction receipt screenshot.', 'warn');
                            }}
                            className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white font-mono text-[9px] uppercase cursor-pointer"
                          >
                            Change file
                          </button>
                        </div>
                        <div className="mt-2 text-[9px] font-mono text-gray-500 bg-black/40 p-2 rounded border border-white/5">
                          Method: {paymentMethod} | Ref: {paymentMethod === 'UPI' ? `UTR: ${utrNumber}` : `TxHash: ${cryptoTxHash.slice(0, 20)}...`} | Amount: ₹149
                        </div>
                      </div>
                    ) : (
                      <div className="border border-spaced border-white/10 bg-black/40 hover:bg-neutral-900/20 p-6 rounded-lg text-center space-y-3 transition-colors relative cursor-pointer">
                        <input 
                          type="file" 
                          id="screenshot-receipt"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              void handlePaymentScreenshotUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <Download className="w-8 h-8 text-neutral-500 mx-auto" />
                        <div className="space-y-1">
                          <span className="text-xs text-gray-400 block">Drag & Drop transaction receipt screenshot or <span className="text-red-500 hover:underline">browse files</span>.</span>
                          <span className="text-[8.5px] font-mono text-gray-600 block uppercase">Requires JPEG, PNG representing full payment details with Reference ID</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-red-400/5 border border-red-500/10 rounded text-[10px] text-gray-400 font-light flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white uppercase block mb-0.5">MANUAL RE-OUTREACH INSTRUCTIONS</strong>
                      Our operations team will manually audit each uploaded receipt. We check transactional references directly against UPI registers. Attempts to upload fake receipt templates or duplicate keys are immediately rejected.
                    </div>
                  </div>

                </div>

                {/* Right side: Live Verification console (Validating Phase) */}
                <div className="lg:col-span-5 bg-neutral-950 p-6 border border-white/5 rounded-xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-4 text-left">
                    <span className="text-[9px] font-mono text-gray-500 block uppercase font-bold">// AUDIT_OPERATIONAL_CONSOLE_LOGS</span>
                    <h3 className="font-bold text-white text-sm uppercase">VERIFICATION STAGE FEEDBACK</h3>

                    {paymentStatus === 'PENDING' && (
                      <div className="p-5 bg-neutral-900/40 border border-white/5 rounded-lg text-center space-y-4 py-8">
                        <Lock className="w-8 h-8 text-gray-600 mx-auto" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-xs font-mono">// INITIAL_AWAITING_INPUT</h4>
                          <p className="text-[10px] text-gray-400 leading-normal max-w-xs mx-auto">
                            Submit your project build and upload payment screenshots above to initiate manual operations queue.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentStatus === 'VALIDATING' && (
                      <div className="p-4 bg-[#E94560]/5 border border-[#E94560]/10 rounded-lg space-y-4">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="w-5 h-5 text-[#E94560] animate-spin" />
                          <div className="font-mono">
                            <span className="text-xs text-[#E94560] block font-bold">// VALIDATING PHASE</span>
                            <span className="text-[9px] text-gray-400 block">MANUAL VERIFICATION IN PROGRESS</span>
                          </div>
                        </div>

                        {/* Real-looking audit logs */}
                        <div className="bg-black/60 p-3 rounded font-mono text-[8.5px] leading-relaxed space-y-1 text-gray-400 border border-white/5 max-h-48 overflow-y-auto">
                          <p className="text-amber-500 font-bold">[!] COMPILING VERIFICATION LEDGER...</p>
                          <p>[INFO] Detected file receipt: "{paymentScreenshotUploaded || 'mock_file.png'}"</p>
                          <p>[INFO] Transaction timestamp mapping...</p>
                          <p>[INFO] Matching metadata coordinates with Razorpay gateway logs...</p>
                          <p className="text-blue-400">[WAIT] Awaiting central accounts office manual sign-off.</p>
                          <p className="text-gray-500">[WARN] Manual check status: UNVERIFIED_PENDING.</p>
                        </div>

                        <div className="text-[10px] text-gray-400 leading-relaxed font-light bg-black/30 p-2.5 rounded border border-white/5">
                          <strong className="text-amber-500 font-bold block mb-1">🔍 VALIDATING STAGE EXPLAINER:</strong>
                          We manually review each image snapshot to ensure it's a real transaction. <strong> We will manually reach out to you and send your verified completion certificate to your registered email</strong>. After a few days, your cert is updated & added inside the website.
                        </div>
                      </div>
                    )}

                    {paymentStatus === 'APPROVED' && (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <div className="font-mono">
                            <span className="text-xs text-emerald-400 block font-bold">// AUDIT PASSED (GENUINE DETECTED)</span>
                            <span className="text-[9px] text-gray-400 block">TRANSACTION CONFIRMED & REGISTERED</span>
                          </div>
                        </div>

                        <div className="bg-black/60 p-3 rounded font-mono text-[8.5px] leading-relaxed space-y-1 text-gray-500 border border-white/5">
                          <p className="text-emerald-400 font-bold">[✓] RECEIPT AUTHENTICATION SUCCESSFUL</p>
                          <p>[INFO] Invoice ref matched transaction index.</p>
                          <p>[INFO] Sent certificate package to your email.</p>
                          <p className={`font-bold ${isCertificateAddedInWebsite ? 'text-emerald-400' : 'text-amber-500'}`}>
                            {isCertificateAddedInWebsite ? '[✓] DIGITAL DATABASE ENTRY CREATED' : '[WAIT] WEB ARCHIVAL SYNCHRONIZATION QUEUED'}
                          </p>
                        </div>

                        <div className="text-[10px] text-gray-400 leading-relaxed font-light bg-black/30 p-2.5 rounded border border-white/5">
                          <strong className="text-white font-bold block mb-0.5">📧 CHECK YOUR EMAIL DISPATCH</strong>
                          Your certificate has been checked manually, approved, and dispatched to your registered email. 
                          {isCertificateAddedInWebsite ? (
                            <span className="text-emerald-400 block font-bold mt-1">✓ Your certificate has now been compiled on the website! You can view or download it on the "BADGES & CERTIFICATE" tab.</span>
                          ) : (
                            <span className="text-amber-400 block font-bold mt-1">⏳ Web Archival active. We are updating the website database soon to make your certificate integrated on the website.</span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* ADMIN SIMULATOR TOOLBOX */}
                  <div className="border-t border-white/10 pt-4 mt-6 space-y-2 text-left">
                    <span className="text-[8.5px] font-mono text-gray-500 block uppercase font-bold">// OPERATIONS_MANUAL_SIMULATOR (ADMIN OVERRIDE)</span>
                    <p className="text-[9px] text-gray-400 font-light">Use this admin console to mock the backend check flow for real or fake screenshots, outreaching, sending emails, and updating the database:</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-center pt-1.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setPaymentScreenshotUploaded('receipt_reference_92023.png');
                          setPaymentStatus('VALIDATING');
                          setDidContribute(true);
                          onUpdateStage('PAYMENT_SUBMITTED');
                          onShowToast('Action simulated: Screenshot attached. Validating phase started.', 'success');
                        }}
                        className="py-1 px-1 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/5 font-mono text-[8px] rounded uppercase cursor-pointer truncate"
                      >
                        1. Mock Receipt Upload
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          if (!paymentScreenshotUploaded) {
                            onShowToast('Simulating: Please upload/mock a receipt snapshot first.', 'warn');
                            return;
                          }
                          setPaymentStatus('APPROVED');
                          onUpdateStage('PAYMENT_VERIFIED');
                          onShowToast('Manual Check: Approved! Custom outreach mail sent to candidate containing Certificate.', 'success');
                        }}
                        className="py-1 px-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold font-mono text-[8px] rounded uppercase cursor-pointer truncate"
                      >
                        2. Verify Real & Send Email
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          if (paymentStatus !== 'APPROVED') {
                            onShowToast('Simulating: Approve transaction before updating the website database.', 'warn');
                            return;
                          }
                          setIsCertificateAddedInWebsite(true);
                          onUpdateStage('CERTIFICATE_ISSUED');
                          onShowToast('Database Updated: Certificate successfully added to website! Unlocking BADGES tab.', 'success');
                        }}
                        className="py-1 px-1 bg-blue-500 hover:bg-blue-400 text-white font-mono text-[8px] rounded uppercase cursor-pointer truncate"
                      >
                        3. Issue Certificate
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          setPaymentScreenshotUploaded(null);
                          setPaymentStatus('PENDING');
                          setIsCertificateAddedInWebsite(false);
                          setDidContribute(false);
                          setUtrNumber('');
                          setCryptoTxHash('');
                          setPaymentMethod(null);
                          onUpdateStage('INTERNSHIP');
                          onShowToast('Simulator state reset.', 'warn');
                        }}
                        className="py-1 px-1 bg-neutral-950 border border-red-500/20 text-red-400 font-mono text-[8px] rounded uppercase cursor-pointer truncate"
                      >
                        Reset System State
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* I. SETTINGS                                   */}
          {/* ============================================== */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-8 text-left">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-red-500 font-mono text-xs uppercase block tracking-wider">// SYSTEM_PREFS</span>
                <h1 className="text-3xl font-black text-white">PORTAL PREFERENCES</h1>
                <p className="text-xs text-gray-400">Update biodata specs keys, password ciphers, and notifications.</p>
              </div>

              {/* Sub tabs nested */}
              <div className="flex gap-4 border-b border-white/5 pb-2">
                {['PROFILE', 'SECURITY', 'NOTIFICATION'].map((stb) => (
                  <button
                    key={stb}
                    onClick={() => setSettingsTab(stb as any)}
                    className={`pb-1 text-xs font-mono transition-colors cursor-pointer uppercase ${
                      settingsTab === stb ? 'text-red-500 border-b-2 border-red-500 font-bold' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {stb}
                  </button>
                ))}
              </div>

              <div className="bg-neutral-900/10 border border-white/5 rounded-xl p-8">
                {settingsTab === 'PROFILE' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-gray-500">Edit Name</label>
                        <input className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white" defaultValue="Alex Mercer" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-gray-500">College Reference</label>
                        <input className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white" defaultValue="IIIT" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500">Interactive Biography Statement</label>
                      <textarea className="w-full h-24 bg-black border border-white/5 rounded p-4 text-xs font-mono text-white" defaultValue="Undergraduate specialized in cyber security, zero-knowledge engines, and automated routing tunnels." />
                    </div>

                    <button 
                      onClick={() => onShowToast('Profile configuration records rewritten active.', 'success')}
                      className="px-6 py-2 bg-white text-black font-semibold text-xs font-mono uppercase cursor-pointer"
                    >
                      Save Configuration Profile
                    </button>
                  </div>
                )}

                {settingsTab === 'SECURITY' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500">Existing Password Passphrase</label>
                      <input type="password" placeholder="••••••••••••" className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500">Replace Cipher Password</label>
                      <input type="password" placeholder="••••••••••••" className="w-full bg-black border border-white/5 rounded px-4 py-2 text-xs font-mono text-white" />
                    </div>

                    <button 
                      onClick={() => onShowToast('Decryption keys altered successfully.', 'success')}
                      className="px-6 py-2 bg-white text-black font-semibold text-xs font-mono uppercase cursor-pointer"
                    >
                      Alter Security Passphrase
                    </button>
                  </div>
                )}

                {settingsTab === 'NOTIFICATION' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <span className="text-white block font-semibold">Email Progress Sync alarms</span>
                        <span className="text-gray-500 block text-[10px]">Send email whenever evaluation checks cascade reports changes.</span>
                      </div>
                      <input type="checkbox" defaultChecked className="accent-red-500 w-4 h-4 cursor-pointer" />
                    </div>

                    <div className="pt-8 border-t border-white/5">
                      <h4 className="text-xs uppercase text-red-500 font-mono font-bold mb-2">CRITICAL NODE ACTIONS</h4>
                      <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">Destroying your student registry deletes active credentials, custom dashboard configurations, and invalidates certificates ledger lists irrevocably.</p>
                      
                      <button 
                        onClick={() => setDeleteModalOpen(true)}
                        className="px-4 py-2 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white transition-all text-xs font-mono uppercase font-bold cursor-pointer"
                      >
                        Irrevocably Evict Student Registry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Global Footer component */}
        <footer className="p-6 border-t border-white/5 text-center text-[10px] font-mono text-gray-600 uppercase">
          SECURE ENCRYPTED SESSION SHA-256 MATRIX INSTEAD. GUEST CONNECT CODE: 9X82AA
        </footer>

      </main>

      {/* 3. DANGER DELETION MODAL OVERLAY */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 text-left">
          <div className="w-full max-w-md bg-neutral-900 border border-red-500/20 rounded-xl p-8 space-y-6">
            <div className="flex gap-3 items-center text-red-500 font-mono text-xs uppercase font-bold">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              CONFIRM CRITICAL DESTRUCTION OF COHORT NODE
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Are you absolutely confident you intend to evict this student registry profile? All compiled milestones records, verification hooks, and credentials certificate PDFs will be destroyed from active database clusters forever.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button 
                onClick={() => {
                  setDeleteModalOpen(false);
                  onLogout();
                  onShowToast('Student profile destroyed.', 'error');
                }}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono uppercase tracking-widest text-center cursor-pointer"
              >
                Destroy Profile irrevocable
              </button>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="py-2.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-xs font-mono uppercase tracking-widest text-center cursor-pointer"
              >
                Retain node configuration
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
