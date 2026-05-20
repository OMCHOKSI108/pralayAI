import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, ShieldCheck, Mail, Calendar, Key, RefreshCw, Star, 
  Users, Check, ArrowRight, X, ChevronRight, Sparkles, Heart 
} from 'lucide-react';

interface SimulatorConsoleProps {
  simState: any;
  setSimState: React.Dispatch<React.SetStateAction<any>>;
  onLoginSuccess: (role: 'student' | 'admin') => void;
  onShowToast: (msg: string, type: 'success' | 'warn' | 'error') => void;
  onNavigate: (view: string) => void;
  isLoggedIn: boolean;
}

export default function SimulatorConsole({
  simState, setSimState, onLoginSuccess, onShowToast, onNavigate, isLoggedIn
}: SimulatorConsoleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'INBOX' | 'REFERRALS'>('CONTROLS');
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  // Auto notification indicator on state change
  const [hasNewMail, setHasNewMail] = useState(false);
  const [prevStep, setPrevStep] = useState(simState.step);

  useEffect(() => {
    if (simState.step !== prevStep) {
      setHasNewMail(true);
      setPrevStep(simState.step);
    }
  }, [simState.step, prevStep]);

  // Simulated email database based on current state
  const emails = [
    {
      id: 'em-1',
      sender: 'Heny from Hellware',
      email: 'heny.hr@hellware.tech',
      subject: '[CONGRATULATIONS] Onboarding as Specialist @ HELLWARE',
      date: 'Simulation Day 1',
      unlockedAtStep: ['ONBOARDED_DAY1', 'TASK_ACTIVE_DAY2', 'TASK_SUBMITTED', 'GRADED_DAY3', 'CERTIFICATE_PAID', 'VERIFIED_DAY4'],
      body: `Hi ${simState.fullName || 'Alex Mercer'},

Heny here, Talent Acquisition & Onboarding Lead at Hellware.

I am incredibly excited to congratulate you on your selection for the experiential student cohort internship engineering programme! Your application, github repos analysis, and CV brief are successfully parsed on our audit stack and align perfectly with our core AI & Advanced Solutions deliverables.

🎉 WELCOME ONBOARD! YOU ARE NOW FULLY VERIFIED.

To begin active development sandbox runs, please authenticate at our Employee Portal choosing SIGN IN, using your assigned credentials below:

-   👨‍💻 Employee ID: HW-MERCER-2026
-   🔑 Access Key: HELLPASS99

[ 👉 ACTION REQUIRED ]
Once logged in, click "Open Terminal Dashboard" to view your provisioned sandboxed tasks and instruction manuals.

We values concrete, repository proof-of-work. Double-down, submit original code, and get recognized.

Warm regards,
Heny 
Hellware Global Onboarding Node`
    },
    {
      id: 'em-2',
      sender: 'Thorne Vance (Lead Architect)',
      email: 'thorne.su@hellware.tech',
      subject: '[ACTION REQUIRED] Workspace Cloud Node Provisons and Task Assignments ready',
      date: 'Simulation Day 2',
      unlockedAtStep: ['TASK_ACTIVE_DAY2', 'TASK_SUBMITTED', 'GRADED_DAY3', 'CERTIFICATE_PAID', 'VERIFIED_DAY4'],
      body: `Alex,

Your developer workspace has been provisioned and allocated inside the Hellware cluster node.

Specialization Assigned: Cybersecurity & Cloud Pipeline Engineering.
Allocated Repository Target: https://github.com/alexmercer/hellware-threat-pipeline

Your first deliverables have been loaded onto your Employee Dashboard. Ensure you tick off relevant milestone checklists as you commit original blocks and draft your regular Weekly progress reports.

If any socket decoder blockers arise, consult your internal Resources library or tag logs output immediately.

Build real. Code telemetry begins now.

Thorne Vance
Lead Architect System Admin, Hellware`
    },
    {
      id: 'em-3',
      sender: 'Thorne Vance (Lead Architect)',
      email: 'thorne.su@hellware.tech',
      subject: '[RESULT] Technical Evaluation and Evaluation Score Cleared 🏆',
      date: 'Simulation Day 3',
      unlockedAtStep: ['GRADED_DAY3', 'CERTIFICATE_PAID', 'VERIFIED_DAY4'],
      body: `Alex,

Our automated repository compilation testing and peer quality evaluations are finished on your submitted threat pipeline repository.

[ EVALUATION REPORT ]
-   Target Title: ${simState.role || 'Real-Time Cyber Threat Pipeline'}
-   Compliance Score Metrics: 89% (Outstanding implementation ratio!)
-   Review Verdict: Stellar Zero-Day routing mitigation layout, robust key decoders. Code has been integrated into main staging deployment successfully.

You have cleared your milestones and completed the cohort! 

[ 👉 PROCEED FOR VERIFIABLE CREDENTIALS ]
Go to your setting profile profile setting on your Employee Dashboard. A voluntary digital service operation fee of ₹149 - ₹299 (depending on your track) is requested for printing your custom-watermarked non-duplicable Completion Certificate & LOR.

NOTE: All performance-based stipend releases are strictly benchmarked against this validation.

Congratulations on writing pristine code!

Thorne Vance
Lead Architect System Admin, Hellware`
    },
    {
      id: 'em-4',
      sender: 'Audit Core (Hellware Ledger)',
      email: 'security@hellware.tech',
      subject: '[DELIVERED] Verifiable Credentials Certified with Cryptographic Watermark Release',
      date: 'Simulation Day 4',
      unlockedAtStep: ['VERIFIED_DAY4'],
      body: `Hello Alex Mercer,

Our financial audit queue has confirmed and verified your UPI transaction contribution screenshot successfully. 

Your verified Completion Certificate and LOR are officially released and integrated into the unalterable public ledger!

-   Certificate Tracking ID: CERT-HW-14819
-   Public Verification Page: Try searching "CERT-HW-14819" on the Verify Ledger landing page.
-   Document Security Spec: Custom watermarked diagnostic vector background, with embedded signed QR verification patterns to prevent forgery or replicate copies.

Your public developer card path represents a cryptographic badge in this cohort stream. 

Thank you for contributing to the open engineering network.

Hellware Registry Audit Core`
    }
  ];

  // Filters emails currently unlocked in simulated timeline
  const unlockedEmails = emails.filter(em => em.unlockedAtStep.includes(simState.step));

  // Sim progression state triggers
  const advanceSimulatedTime = () => {
    let nextStep = simState.step;
    let nextDay = simState.day + 1;
    let titleMsg = '';

    if (simState.step === 'UNREGISTERED') {
      onShowToast('Please fill out the Careers Application first to register on the simulation list.', 'warn');
      return;
    }

    if (simState.step === 'SCANNING_CV') {
      onShowToast('CV review is actively running in simulated background. Please wait for dispatch completion.', 'warn');
      return;
    }

    if (simState.step === 'APPLIED') {
      nextStep = 'ONBOARDED_DAY1';
      titleMsg = 'Simulation advanced to Day 1: Onboarding Congratulation Email Arrived!';
    } else if (simState.step === 'ONBOARDED_DAY1') {
      nextStep = 'TASK_ACTIVE_DAY2';
      titleMsg = 'Simulation advanced to Day 2: First Technical Task assigned!';
    } else if (simState.step === 'TASK_ACTIVE_DAY2') {
      onShowToast('Simulated day increased. Please log into Employee Dashboard, play layout code checkboxes, and click SUBMIT TASK inside employee console.', 'warn');
    } else if (simState.step === 'TASK_SUBMITTED') {
      nextStep = 'GRADED_DAY3';
      titleMsg = 'Simulation advanced to Day 3: Task evaluation finished. 89% Rating received!';
    } else if (simState.step === 'GRADED_DAY3') {
      onShowToast('Simulated day increased. Log in, go to Claims certificate, choose voluntary fee and simulated transaction upload screenshot.', 'warn');
    } else if (simState.step === 'CERTIFICATE_PAID') {
      nextStep = 'VERIFIED_DAY4';
      titleMsg = 'Simulation advanced to Day 4: Core verified transactions. Certified Watermark available!';
    } else if (simState.step === 'VERIFIED_DAY4') {
      titleMsg = 'Day increased. You have fully successfully completed the Hellware simulator run!';
    }

    setSimState((prev: any) => ({
      ...prev,
      day: nextDay,
      step: nextStep
    }));
    onShowToast(titleMsg || `Day increased to Day ${nextDay}.`, 'success');
  };

  const instantAutoCredentials = () => {
    setSimState((prev: any) => ({
      ...prev,
      day: 1,
      step: 'ONBOARDED_DAY1',
      fullName: prev.fullName || 'Alex Mercer',
      email: prev.email || 'omchoksi99@gmail.com'
    }));
    onShowToast('Instant Handshake: Employee identity generated. HW-MERCER-2026 / HELLPASS99 is active.', 'success');
  };

  const simulatePeerReferral = () => {
    // If certificate is not yet paid or user hasn't gotten there, show warning
    const currentPaidSum = simState.step === 'VERIFIED_DAY4' || simState.step === 'CERTIFICATE_PAID' ? 249 : 149; // cost of current certificate
    
    if (simState.refMoney >= currentPaidSum) {
      onShowToast(`Referral cap reached (₹${simState.refMoney}/${currentPaidSum} INR limit). To prevent transaction drain, our payment audit disables further rewards once it covers your paid sum.`, 'error');
      return;
    }

    const peers = [
      { name: "Siddharth Verma", email: "sid.v@gmail.com" },
      { name: "Priya Roy", email: "priya.roy@iiit.ac.in" },
      { name: "Karan Gupta", email: "karan.g@vit.edu" },
      { name: "Sanya Chopra", email: "sanya.c@iitd.ac.in" },
      { name: "Aman Deshmukh", email: "aman.d@bits.edu" },
    ];

    const chosen = peers[Math.floor(Math.random() * peers.length)];

    setSimState((prev: any) => {
      const updatedCount = prev.referralsCount + 1;
      const updatedMoney = prev.refMoney + 20;
      return {
        ...prev,
        referralsCount: updatedCount,
        refMoney: updatedMoney
      };
    });

    onShowToast(`Referral simulator: ${chosen.name} completed operating fee clearance! +₹20 added to your cohort ledger.`, 'success');
  };

  const resetSimulator = () => {
    if (window.confirm("Restore simulator state parameters back to initial default Visitor?")) {
      setSimState({
        day: 0,
        role: null,
        step: 'UNREGISTERED',
        fullName: 'Alex Mercer',
        email: 'omchoksi99@gmail.com',
        college: 'IIIT',
        phone: '+91 98765 43210',
        gradYear: '2027',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        cvName: 'cv.pdf',
        skills: ['React', 'TypeScript', 'Node.js'],
        assignedProject: null,
        ratingScore: 89,
        certificatePaid: false,
        screenshotUploaded: '',
        referralsCount: 2,
        refMoney: 40
      });
      localStorage.removeItem('hellware_sim_state');
      setIsOpen(false);
      onNavigate('LANDING');
      onShowToast('Simulator state flushed cleanly. Simulation reset to Day 0.', 'warn');
    }
  };

  return (
    <>
      {/* Floating System Simulator Console Launcher Badge */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => {
            setIsOpen(true);
            setHasNewMail(false);
          }}
          className="relative px-5 py-3.5 bg-neutral-950/95 hover:bg-neutral-900 text-white font-mono text-[10px] uppercase font-black border border-red-500/40 rounded-full flex items-center gap-2.5 cursor-pointer shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-glow group"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasNewMail ? 'bg-amber-400' : 'bg-red-500'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${hasNewMail ? 'bg-amber-500' : 'bg-red-500'}`}></span>
          </span>
          🔮 SIMULATOR CONTROL CORE
          {hasNewMail && (
            <span className="ml-1 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              NEW EMAIL
            </span>
          )}
        </button>
      </div>

      {/* Simulator Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-neutral-950 border border-white/10 rounded-xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden text-left"
            >
              
              {/* Header section with telemetry params */}
              <div className="bg-neutral-900/60 border-b border-white/5 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-sm font-mono text-[9px] uppercase tracking-wider font-bold">// HELLWARE_AIGIS_VM</span>
                    <span className="text-[10px] text-gray-500 font-mono">Cohort simulation sandbox</span>
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight font-sans">EXPERIENTIAL TIMELINE CONTROL</h2>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 px-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded font-mono text-xs uppercase cursor-pointer"
                >
                  [ CLOSE CONSOLE ]
                </button>
              </div>

              {/* Multi-screen view split */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* Side Tab Controls */}
                <div className="w-48 bg-neutral-950 border-r border-white/5 flex flex-col justify-between py-6">
                  <div className="space-y-1 px-3">
                    {[
                      { id: 'CONTROLS', label: 'TIME DESK', icon: <Calendar className="w-4 h-4" /> },
                      { id: 'INBOX', label: `SIMULATED MAILBOX (${unlockedEmails.length})`, icon: <Mail className="w-4 h-4" /> },
                      { id: 'REFERRALS', label: 'REFERRAL EMULATOR', icon: <Users className="w-4 h-4" /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setSelectedEmail(null);
                        }}
                        className={`w-full py-2.5 px-4 text-left font-mono text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer flex items-center gap-2.5 ${
                          activeTab === tab.id 
                            ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/10' 
                            : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Reset action in bounds */}
                  <div className="px-4">
                    <button
                      onClick={resetSimulator}
                      className="w-full py-2 border border-red-505/20 hover:border-red-500/50 hover:bg-red-500/5 text-xs text-red-400 uppercase font-mono font-bold tracking-wider rounded cursor-pointer"
                    >
                      RESET SIM VM
                    </button>
                  </div>
                </div>

                {/* Main panel displays */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#0C0C10]">
                  
                  {/* Tab 1: Telemetry and Controls */}
                  {activeTab === 'CONTROLS' && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#E94560] block tracking-wide font-bold">// COHORT_TIMEWARP_INTERLOCK</span>
                        <h3 className="text-base font-bold text-white uppercase font-sans">SIMULATION STATUS CONTROL PANEL</h3>
                        <p className="text-xs text-gray-400 leading-relaxed font-light">
                          Our experiential platform simulates a complete professional timeline asynchronously. Use this dashboard to speed up simulated days. Incoming verification mails, credentials key allocations, and evaluations marks update accordingly.
                        </p>
                      </div>

                      {/* Display Status board with details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-neutral-900/40 p-4 border border-white/5 rounded-lg">
                          <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">CURRENT SIMULATED DAY</span>
                          <span className="text-2xl font-mono font-black text-[#E94560]">DAY {simState.day}</span>
                        </div>
                        <div className="bg-neutral-900/40 p-4 border border-white/5 rounded-lg capitalize">
                          <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">ROLE SEIZED</span>
                          <span className="text-xs font-bold text-white truncate block mt-1">{simState.role || 'Not Registered'}</span>
                        </div>
                        <div className="bg-neutral-900/40 p-4 border border-white/5 rounded-lg col-span-2 md:col-span-1">
                          <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">COHORT SIM STAGE</span>
                          <span className="text-[10px] font-mono font-bold text-white uppercase block mt-1 truncate bg-white/5 px-2 py-0.5 rounded border border-white/5">{simState.step}</span>
                        </div>
                      </div>

                      {/* Simulation Controls triggers */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">Available Time Lever Operations</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Warp +1 day */}
                          <button
                            onClick={advanceSimulatedTime}
                            className="bg-neutral-900 hover:bg-neutral-850 p-5 rounded-lg border border-white/10 text-left cursor-pointer group transition-all"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-mono text-[10px] font-black text-amber-400 uppercase">FAST-FORWARD TIME (+1 DAY)</span>
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="text-xs text-gray-400 leading-normal font-light">Advance the simulation thread by exactly 24 hours to trigger new notifications, mail deliverables, and dashboard updates.</p>
                          </button>

                          {/* Quick Bypass to Day 1 onboarding credentials */}
                          <button
                            onClick={instantAutoCredentials}
                            className="bg-neutral-900 hover:bg-neutral-850 p-5 rounded-lg border border-white/10 text-left cursor-pointer group transition-all"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-mono text-[10px] font-black text-emerald-400 uppercase">Instant credentials bypass</span>
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="text-xs text-gray-400 leading-normal font-light">Skip application screening queue instantly and obtain the verified employee dashboard credentials directly without delays.</p>
                          </button>

                        </div>

                        {/* System Status Visual timeline guide */}
                        <div className="p-4 bg-neutral-900/20 border border-white/5 rounded-lg space-y-3">
                          <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">// HOW THE LIFECYCLE PROGRESSES:</span>
                          <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 font-mono">
                            <span className={simState.step === 'UNREGISTERED' ? 'text-red-400 font-bold' : ''}>[Day 0: Apply]</span>
                            <span className="text-gray-600">→</span>
                            <span className={simState.step === 'ONBOARDED_DAY1' ? 'text-red-400 font-bold' : ''}>[Day 1: Get Employee ID & Pass]</span>
                            <span className="text-gray-600">→</span>
                            <span className={simState.step === 'TASK_ACTIVE_DAY2' ? 'text-red-400 font-bold' : ''}>[Day 2: Task Assignment]</span>
                            <span className="text-gray-600">→</span>
                            <span className={simState.step === 'TASK_SUBMITTED' ? 'text-red-400 font-bold' : ''}>[Submit Task]</span>
                            <span className="text-gray-600">→</span>
                            <span className={simState.step === 'GRADED_DAY3' ? 'text-[#E94560] font-bold animate-pulse' : ''}>[Day 3: Marks 89%]</span>
                            <span className="text-gray-600">→</span>
                            <span className={simState.step === 'VERIFIED_DAY4' ? 'text-green-400 font-bold' : ''}>[Day 4: Verifiable Certificate & LOR]</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Tab 2: Mail Inbox Client simulator */}
                  {activeTab === 'INBOX' && (
                    <div className="space-y-6 h-full flex flex-col justify-between">
                      {selectedEmail ? (
                        <div className="space-y-6" id="simulator-email-view">
                          {/* Email back button header */}
                          <div className="flex items-center gap-4 border-b border-white/15 pb-4">
                            <button
                              onClick={() => setSelectedEmail(null)}
                              className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded font-mono text-[10px] uppercase cursor-pointer"
                            >
                              ← Back to Inbox
                            </button>
                            <div className="text-xs text-gray-500 font-mono">From: <strong className="text-neutral-200">{selectedEmail.sender}</strong> ({selectedEmail.email})</div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-bold text-white uppercase">{selectedEmail.subject}</h3>
                              <span className="text-[10px] text-gray-500 font-mono block mt-1">{selectedEmail.date} (Timeline verified)</span>
                            </div>

                            <div className="p-6 bg-neutral-900/30 border border-white/5 rounded-lg whitespace-pre-line text-xs leading-relaxed text-gray-300 font-mono text-left max-h-[40vh] overflow-y-auto selection:bg-[#E94560]/30 select-text">
                              {selectedEmail.body}
                            </div>

                            {/* Simulated Quick Action button within email */}
                            {selectedEmail.id === 'em-1' && (
                              <div className="p-4 bg-emerald-500/5 rounded border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="space-y-0.5 text-left">
                                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">ONBOARDING IDENT PROTOCOL DETECTED</span>
                                  <p className="text-[11px] text-gray-400">Use Username HW-MERCER-2026 and password HELLPASS99 at Employee Login.</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    onNavigate('LOGIN');
                                    onShowToast('Navigated to employee sign-in node portal.', 'success');
                                  }}
                                  className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-black font-bold font-mono text-[10px] uppercase tracking-wider rounded cursor-pointer shrink-0"
                                >
                                  GO TO EMPLOYEE LOGIN
                                </button>
                              </div>
                            )}

                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-[#E94560] font-bold block uppercase">// MAIL_STACK</span>
                            <h3 className="text-lg font-bold text-white uppercase">SIMULATED INBOX CLIENT</h3>
                            <p className="text-xs text-gray-400 font-light">Read messages received as time advances stage-by-stage inside your dynamic Hellware simulation cycle.</p>
                          </div>

                          {unlockedEmails.length === 0 ? (
                            <div className="text-center py-20 bg-neutral-950/40 border border-dashed border-white/5 rounded-xl space-y-4">
                              <span className="text-4xl text-neutral-700 block text-center">✉️</span>
                              <div>
                                <h4 className="text-white font-bold text-sm">NO CONTEXT MESSAGES TRANSMITTED</h4>
                                <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">Please complete the Ingress Career application and warping controls to prompt structural HR responses inside mailbox!</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3.5" id="simulator-email-list">
                              {unlockedEmails.map((em) => (
                                <div
                                  key={em.id}
                                  onClick={() => setSelectedEmail(em)}
                                  className="p-5 bg-neutral-900/40 hover:bg-neutral-900/80 border border-white/5 hover:border-[#E94560]/30 rounded-lg flex justify-between items-center cursor-pointer group transition-all"
                                >
                                  <div className="space-y-1.5 text-left max-w-lg">
                                    <div className="flex items-center gap-3">
                                      <span className="w-1.5 h-1.5 bg-[#E94560] rounded-full" />
                                      <strong className="text-xs font-mono text-slate-300 font-bold">{em.sender}</strong>
                                      <span className="text-[9px] font-mono text-gray-500">{em.email}</span>
                                    </div>
                                    <p className="text-xs font-bold text-white tracking-tight leading-normal group-hover:text-[#E94560] transition-colors">{em.subject}</p>
                                    <p className="text-[11px] text-gray-500 font-light truncate max-w-md">{em.body}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-gray-500">
                                    <span className="bg-white/5 px-2 py-0.5 rounded text-white">{em.date}</span>
                                    <span className="text-glow group-hover:translate-x-1 transition-transform">READ →</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Referred ledger simulation */}
                  {activeTab === 'REFERRALS' && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#E94560] font-bold block uppercase">// CASH_FLOWS</span>
                        <h3 className="text-base font-bold text-white uppercase font-sans">REFERRALS REBATES EMULATOR</h3>
                        <p className="text-xs text-gray-400 leading-relaxed font-light font-sans">
                          Hellware operates a dynamic experiential community referral incentive. Share your personal tracking link. If referred colleagues clear their credential operating contributions (₹149-₹299), you immediately gain <strong className="text-[#E94560]">₹20 INR</strong> added to your profile card!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-neutral-900/40 p-5 rounded-lg border border-white/5 space-y-2">
                          <span className="text-[9px] font-mono text-[#E94560] uppercase block tracking-wider font-bold">Simulate Referred Registration</span>
                          <p className="text-xs text-gray-450 leading-normal font-sans">Simulate one of your invited university fellows completing their profile and voluntary contribution operating steps successfully.</p>
                          
                          <button
                            onClick={simulatePeerReferral}
                            className="mt-3 w-full py-2.5 bg-white hover:bg-neutral-100 text-black font-bold font-mono text-[10px] uppercase rounded-[4px] cursor-pointer tracking-wider block text-center"
                          >
                            ➕ SIMULATE PAID REFERRAL (+₹20 REBATE)
                          </button>
                        </div>

                        <div className="bg-neutral-900/40 p-5 rounded-lg border border-white/5 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono text-gray-500 uppercase block font-bold">TOTAL REFERRED PEERS TRACKED</span>
                            <span className="text-2xl font-mono text-white font-black">{simState.referralsCount} Students</span>
                          </div>

                          <div className="space-y-1 border-t border-white/5 pt-3">
                            <span className="text-[8px] font-mono text-gray-500 uppercase block font-bold">YOUR CURRENT COMMISSIONS VALUE</span>
                            <span className="text-2xl font-mono text-emerald-400 font-black">₹{simState.refMoney} INR</span>
                            <span className="text-[8px] text-gray-500 font-mono uppercase block mt-0.5">Note: Rewards locked and capped at certificate cost!</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-500/[0.03] border border-amber-500/20 text-xs rounded text-amber-200 leading-relaxed font-sans font-light">
                        🧠 <strong>ANTI-SYBIL HARVEST GUARD:</strong> To safeguard systems resource pools, our ledger limits referral payouts from matching or higher than your paid certificate amount. Once payouts equal your paid operating costs, commission accumulation safely halts.
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
