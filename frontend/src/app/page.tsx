"use client";

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import TechGrid from '@/components/TechGrid';
import CustomCursor from '@/components/CustomCursor';
import CyberLoading from '@/components/CyberLoading';
import Footer from '@/components/Footer';
import PublicPages from '@/sections/PublicPages';
import AuthPages from '@/sections/AuthPages';
import StudentDashboard from '@/sections/StudentDashboard';
import AdminDashboard from '@/sections/AdminDashboard';
import PublicProfile from '@/sections/PublicProfile';
import SimulatorConsole from '@/components/SimulatorConsole';
import { 
  INITIAL_PROJECTS, INITIAL_APPLICATIONS, INITIAL_SUBMISSIONS, 
  INITIAL_RESOURCES, INITIAL_AUDIT_LOGS, StudentApplication, 
  StudentProject, Submission, Resource, AuditLog 
} from '@/data/mockData';
import { getBackendMetrics, getBackendApplications, updateBackendApplication } from '@/lib/backend';

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [simState, setSimState] = useState({
    day: 0,
    step: 'UNREGISTERED',
    fullName: 'Alex Mercer',
    email: 'omchoksi99@gmail.com',
    college: 'IIIT Hyderabad',
    phone: '+91 98765 43210',
    gradYear: '2027',
    role: 'Cybersecurity',
    skills: ['React', 'TypeScript', 'Docker', 'Go'],
    referralsCount: 0,
    refMoney: 0
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [userEmail, setUserEmail] = useState('omchoksi99@gmail.com');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<StudentApplication[]>(INITIAL_APPLICATIONS);
  const [projects, setProjects] = useState<StudentProject[]>(INITIAL_PROJECTS);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [assignedProject, setAssignedProject] = useState<StudentProject>({
    ...INITIAL_PROJECTS[0],
    milestones: INITIAL_PROJECTS[0].milestones.map(m => ({ ...m }))
  });
  const [currentView, setCurrentView] = useState<string>('LANDING');
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'warn' | 'error' }[]>([]);

  const [backendApps, setBackendApps] = useState<Array<{
    id: string; fullName: string; email: string; phone: string | null;
    college: string | null; gradYear: string | null; skills: string[];
    status: string; createdAt: string;
  }>>([]);
  const [backendMetrics, setBackendMetrics] = useState<{
    totalStudents: number; totalApplied: number; totalApproved: number;
    pendingPayments: number; successfulPaymentCount: number; successfulPaymentAmount: number;
  } | null>(null);

  const fetchBackendData = useCallback(async (token: string) => {
    try {
      const [metrics, apps] = await Promise.all([
        getBackendMetrics(token),
        getBackendApplications(token)
      ]);
      setBackendMetrics(metrics);
      setBackendApps(apps);
    } catch {
      // backend data not available
    }
  }, []);

  useEffect(() => {
    if (authToken && userRole === 'admin') {
      fetchBackendData(authToken);
    }
  }, [authToken, userRole, fetchBackendData]);

  const showToast = (msg: string, type: 'success' | 'warn' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleAddAuditLog = (action: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: action.toUpperCase(),
      operator: userRole === 'admin' ? 'THORNE_SU' : 'SYS_PORT_DEVEL',
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAddNewApplication = (newApp: Partial<StudentApplication>) => {
    const fullApp: StudentApplication = {
      id: `app-${Date.now()}`,
      fullName: newApp.fullName || 'Alex Mercer',
      email: newApp.email || 'omchoksi99@gmail.com',
      phone: newApp.phone || '',
      college: newApp.college || 'IIIT',
      gradYear: newApp.gradYear || '2027',
      domainInterest: newApp.domainInterest || 'Cybersecurity',
      skills: newApp.skills || [],
      githubProfile: newApp.githubProfile || '',
      linkedinProfile: newApp.linkedinProfile || '',
      resumeFileName: newApp.resumeFileName || 'cv.pdf',
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setApplications(prev => [fullApp, ...prev]);
    handleAddAuditLog(`INCOMING APPLICATION SUBMIT: ${fullApp.fullName.toUpperCase()} - TRACK: ${fullApp.domainInterest.toUpperCase()}`, 'INFO');
  };

  const handleAcceptApplication = (aid: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === aid) return { ...app, status: 'ACCEPTED' };
      return app;
    }));
    if (authToken) {
      updateBackendApplication(authToken, aid, 'APPROVED').then(() => {
        setBackendApps(prev => prev.map(a => a.id === aid ? { ...a, status: 'APPROVED' } : a));
      }).catch(() => {});
    }
  };

  const handleRejectApplication = (aid: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === aid) return { ...app, status: 'REJECTED' };
      return app;
    }));
    if (authToken) {
      updateBackendApplication(authToken, aid, 'REJECTED').then(() => {
        setBackendApps(prev => prev.map(a => a.id === aid ? { ...a, status: 'REJECTED' } : a));
      }).catch(() => {});
    }
  };

  const handleBackendUpdateApp = (id: string, status: string) => {
    setBackendApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (authToken) {
      updateBackendApplication(authToken, id, status).catch(() => {});
    }
  };

  const handleCreateNewProject = (proj: StudentProject) => {
    setProjects(prev => [proj, ...prev]);
  };

  const handleDeleteProject = (pid: string) => {
    setProjects(prev => prev.filter(p => p.id !== pid));
  };

  const handleStudentSubmitProject = (subData: Partial<Submission>) => {
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      studentId: 'student_user',
      studentName: 'Alex Mercer',
      studentEmail: userEmail,
      projectId: subData.projectId || assignedProject.id,
      projectName: subData.projectName || assignedProject.title,
      domain: subData.domain || assignedProject.domain,
      githubUrl: subData.githubUrl || '',
      liveUrl: subData.liveUrl || '',
      screencast: subData.screencast || '',
      screenshots: subData.screenshots || [],
      notes: subData.notes || '',
      status: 'PENDING',
      submittedDate: new Date().toISOString().split('T')[0]
    };
    setSubmissions(prev => [newSubmission, ...prev]);
    handleAddAuditLog(`STUDENT SUBMISSION TRANSMITTED: ALEX MERCER - TITLE: ${subData.projectName || assignedProject.title}`, 'INFO');
  };

  const handleReviewSubmission = (sid: string, status: 'APPROVED' | 'CHANGES_REQUESTED', feedback: string) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === sid) {
        return {
          ...sub,
          status,
          feedback,
          feedbackAuthor: 'Lead Architect Thorne',
          feedbackDate: new Date().toISOString().split('T')[0]
        };
      }
      return sub;
    }));
  };

  const handleCreateResource = (res: Resource) => {
    setResources(prev => [res, ...prev]);
  };

  const handleDeleteResource = (rid: string) => {
    setResources(prev => prev.filter(r => r.id !== rid));
  };

  const handleToggleStudentMilestone = (mid: string) => {
    setAssignedProject(prev => {
      const updatedMilestones = prev.milestones.map(m => {
        if (m.id === mid) return { ...m, completed: !m.completed };
        return m;
      });
      return { ...prev, milestones: updatedMilestones };
    });
  };

  const handleLoginSuccess = (role: 'student' | 'admin', token?: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (token) setAuthToken(token);
    setUserEmail(role === 'admin' ? 'sysop@hellware.in' : 'omchoksi99@gmail.com');
    setCurrentView(role === 'admin' ? 'ADMIN_DASHBOARD' : 'STUDENT_DASHBOARD');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setAuthToken(null);
    setBackendApps([]);
    setBackendMetrics(null);
    setCurrentView('LANDING');
    showToast('Secure terminal logout performed active status.', 'warn');
  };

  const showNavbarAndFooter = !['STUDENT_DASHBOARD', 'ADMIN_DASHBOARD'].includes(currentView);

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-red-500/30 selection:text-white relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[-15%] w-[65%] h-[35%] rounded-full bg-red-950/10 blur-[130px] opacity-75 mr-2" />
        <div className="absolute top-[25%] right-[-15%] w-[60%] h-[40%] rounded-full bg-neutral-900/10 blur-[140px] opacity-60 ml-2" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[65%] h-[40%] rounded-full bg-red-900/10 blur-[130px] opacity-75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.015)_1px,transparent_0)]" style={{ backgroundSize: '40px 40px' }} />
      </div>

      {loading ? (
        <CyberLoading onComplete={() => setLoading(false)} />
      ) : (
        <>
          <CustomCursor />
          <TechGrid />

          <div className="fixed bottom-6 right-6 space-y-3 z-50 max-w-sm w-full block">
            {toasts.map((t) => (
              <div 
                key={t.id} 
                className={`p-4 rounded-lg border text-xs font-mono flex items-center justify-between shadow-2xl transition-all ${
                  t.type === 'error' 
                    ? 'bg-red-950/80 border-red-500/50 text-red-200' 
                    : t.type === 'warn' 
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-200' 
                    : 'bg-neutral-900/95 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <span>{t.msg}</span>
                <button 
                  onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                  className="ml-3 hover:text-white cursor-pointer font-black text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {showNavbarAndFooter && (
            <Navbar 
              currentView={currentView}
              onNavigate={setCurrentView}
              isLoggedIn={isLoggedIn}
              userRole={userRole}
              onLogout={handleLogout}
            />
          )}

          <div className={`${showNavbarAndFooter ? 'pt-16' : ''} min-h-[80vh] relative z-20`}>
            {['LANDING', 'ABOUT', 'HOW_IT_WORKS', 'SHOWCASE', 'APPLY', 'VERIFY', 'TERMS', 'PRIVACY', 'REFUND', 'CERT_POLICY'].includes(currentView) && (
              <PublicPages 
                currentPublicView={currentView}
                onNavigate={setCurrentView}
                onSubmitApplication={handleAddNewApplication}
                onShowToast={showToast}
                simState={simState}
                setSimState={setSimState}
              />
            )}

            {['LOGIN', 'REGISTER', 'FORGOT_PASSWORD', 'RESET_PASSWORD', 'EMAIL_VERIFIED_PAGE'].includes(currentView) && (
              <AuthPages 
                currentView={currentView}
                onNavigate={setCurrentView}
                onLoginSuccess={handleLoginSuccess}
                onShowToast={showToast}
                simState={simState}
              />
            )}

            {currentView === 'STUDENT_DASHBOARD' && (
              <StudentDashboard 
                userEmail={userEmail}
                onLogout={handleLogout}
                onNavigateToPublic={setCurrentView}
                assignedProject={assignedProject}
                submissions={submissions}
                onCommitSubmission={handleStudentSubmitProject}
                onToggleMilestone={handleToggleStudentMilestone}
                onShowToast={showToast}
              />
            )}

            {currentView === 'ADMIN_DASHBOARD' && (
              <AdminDashboard 
                onLogout={handleLogout}
                applications={applications}
                onAcceptApplication={handleAcceptApplication}
                onRejectApplication={handleRejectApplication}
                projects={projects}
                onCreateProject={handleCreateNewProject}
                onDeleteProject={handleDeleteProject}
                submissions={submissions}
                onReviewSubmission={handleReviewSubmission}
                resources={resources}
                onCreateResource={handleCreateResource}
                onDeleteResource={handleDeleteResource}
                auditLogs={auditLogs}
                onWriteAuditLog={handleAddAuditLog}
                onShowToast={showToast}
                authToken={authToken || undefined}
                backendApplications={backendApps}
                backendMetrics={backendMetrics}
                onBackendUpdateApp={handleBackendUpdateApp}
              />
            )}

            {currentView === 'PUBLIC_PROFILE' && (
              <PublicProfile 
                onNavigateHome={() => setCurrentView('LANDING')} 
              />
            )}
          </div>

          {showNavbarAndFooter && (
            <Footer onNavigate={setCurrentView} />
          )}
        </>
      )}

      <SimulatorConsole 
        simState={simState}
        setSimState={setSimState}
        onLoginSuccess={(role: 'student' | 'admin', _token?: string) => {
          setIsLoggedIn(true);
          setUserRole(role);
          setUserEmail(simState.email);
          setCurrentView(role === 'admin' ? 'ADMIN_DASHBOARD' : 'STUDENT_DASHBOARD');
        }}
        onShowToast={showToast}
        onNavigate={setCurrentView}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
