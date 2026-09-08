import React, { useContext, useEffect, useRef, useState } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import InstallPWA from './components/common/PWAInstall.jsx';
import { AppContext } from './context/AppContext.jsx';
import StudentHome from './components/pages/StudentHome.jsx';
import StudentAttendance from './components/pages/StudentAttendance.jsx';
import StudentHistory from './components/pages/StudentHistory.jsx';
import StudentProfile from './components/pages/StudentProfile.jsx';
import StudentCourses from './components/pages/StudentCourses.jsx';
import LecturerDashboard from './components/pages/LecturerDashboard.jsx';
import LecturerHost from './components/pages/LecturerHost.jsx';
import LecturerAttendance from './components/pages/LecturerAttendance.jsx';
import LecturerClasses from './components/pages/LecturerClasses.jsx';
import LecturerReports from './components/pages/LecturerReports.jsx';
import AdminDashboard from './components/pages/AdminDashboard.jsx';
import AdminUsers from './components/pages/AdminUsers.jsx';
import AdminRecords from './components/pages/AdminRecords.jsx';
import AdminReports from './components/pages/AdminReports.jsx';
import AdminSettings from './components/pages/AdminSettings.jsx';
import AdminComplaints from './components/pages/AdminComplaints.jsx';
import HOCCourses from './components/pages/HOCCourses.jsx';
import Notifications from './components/pages/Notifications.jsx';
import RoleGate from './components/common/RoleGate.jsx';
import SplashScreen from './components/common/SplashScreen.jsx';

const pageMap = {
  's-home': StudentHome,
  's-attendance': StudentAttendance,
  's-courses': StudentCourses,
  's-history': StudentHistory,
  's-profile': StudentProfile,
  notifications: Notifications,
  'l-dashboard': LecturerDashboard,
  'l-host': LecturerHost,
  'l-attendance': LecturerAttendance,
  'l-classes': LecturerClasses,
  'l-reports': LecturerReports,
  'h-courses': HOCCourses,
  'a-dashboard': AdminDashboard,
  'a-users': AdminUsers,
  'a-records': AdminRecords,
  'a-reports': AdminReports,
  'a-settings': AdminSettings,
  'a-complaints': AdminComplaints,
};

function NotificationPopIn({ notification, onOpen }) {
  if (!notification) return null;

  return (
    <button className="notification-pop-in" type="button" onClick={onOpen}>
      <span className="notification-pop-icon" aria-hidden="true">🔔</span>
      <span><strong>{notification.title}</strong><small>{notification.message}</small></span>
    </button>
  );
}

function WelcomeGuide({ onClose, setCurrentPage, currentRole, userProfile, onboardedAccounts, setOnboardedAccounts }) {
  const [step, setStep] = useState(0);
  const dashboardPage = { student: 's-home', lecturer: 'l-dashboard', hoc: 'h-courses', admin: 'a-dashboard' }[currentRole];
  const attendancePage = currentRole === 'lecturer' ? 'l-attendance' : currentRole === 'admin' ? 'a-records' : 's-attendance';
  const tourSteps = [
    { icon: '⌂', title: 'Your dashboard', detail: 'See attendance, courses, live classes, and what needs your attention.', page: dashboardPage },
    { icon: '✓', title: 'Attendance', detail: 'Open a session, verify your identity, or review attendance records.', page: attendancePage },
    { icon: '◯', title: 'Your profile', detail: 'Change your picture, appearance, and log out whenever you need.', page: 's-profile' },
  ];
  const activeStep = tourSteps[step];

  const finishGuide = () => {
    const accountKey = `${userProfile?.role || currentRole}:${String(userProfile?.id || '').toLowerCase()}`;
    setOnboardedAccounts((current) => ({ ...current, [accountKey]: true }));
    let localOnboardedAccounts = {};
    try { localOnboardedAccounts = JSON.parse(window.localStorage.getItem('adam-onboarded-accounts') || '{}'); } catch { localOnboardedAccounts = {}; }
    localOnboardedAccounts[accountKey] = true;
    window.localStorage.setItem('adam-onboarded-accounts', JSON.stringify(localOnboardedAccounts));
    window.localStorage.removeItem('adam-onboarding-pending');
    window.localStorage.removeItem('adam-onboarding-account');
    onClose();
  };

  const moveToStep = (nextStep) => {
    setStep(nextStep);
    setCurrentPage(tourSteps[nextStep].page);
  };

  const startTour = () => moveToStep(0);

  return (
    <div className="welcome-guide-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-guide-title">
      <div className="welcome-guide">
        <div className="welcome-guide-mark" aria-hidden="true">A</div>
        <div className="welcome-guide-kicker"><p className="eyebrow">A quick tour</p><span>Step {step + 1} of {tourSteps.length}</span></div>
        <h2 id="welcome-guide-title">Welcome to ADAM</h2>
        <p className="welcome-guide-subtitle">Follow the arrows to learn the three places you will use most.</p>
        <div className="welcome-guide-steps">
          {tourSteps.map((tourStep, index) => (
            <button type="button" className={`welcome-guide-step ${index === step ? 'active' : ''}`} key={tourStep.title} onClick={() => moveToStep(index)}>
              <span>{tourStep.icon}</span>
              <p><strong>{tourStep.title}</strong><small>{tourStep.detail}</small></p>
              <b aria-hidden="true">{index === step ? '→' : '›'}</b>
            </button>
          ))}
        </div>
        <div className="welcome-guide-actions">
          <button type="button" className="welcome-guide-skip" onClick={finishGuide}>Skip</button>
          {step > 0 && <button type="button" className="ghost" onClick={() => moveToStep(step - 1)}>Back</button>}
          {step < tourSteps.length - 1 ? <button type="button" className="primary" onClick={() => moveToStep(step + 1)}>Next <span aria-hidden="true">→</span></button> : <button type="button" className="primary" onClick={finishGuide}>Get started</button>}
        </div>
        {step === 0 && <button type="button" className="welcome-guide-restart" onClick={startTour}>↻ Start from dashboard</button>}
      </div>
    </div>
  );
}

export default function App() {
  const { currentPage, setCurrentPage, roleSelected, userProfile, theme, currentRole, notifications, onboardedAccounts, setOnboardedAccounts } = useContext(AppContext);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [popIn, setPopIn] = useState(null);
  const seenNotificationIds = useRef(new Set(notifications.map((notification) => notification.id)));
  const PageComponent = pageMap[currentPage] || StudentHome;

  useEffect(() => {
    const accountKey = `${userProfile?.role || currentRole}:${String(userProfile?.id || '').toLowerCase()}`;
    let localOnboardedAccounts = {};
    try { localOnboardedAccounts = JSON.parse(window.localStorage.getItem('adam-onboarded-accounts') || '{}'); } catch { localOnboardedAccounts = {}; }
    const legacyTourCompleted = window.localStorage.getItem('adam-onboarding-completed') === 'true';
    if (legacyTourCompleted) window.localStorage.removeItem('adam-onboarding-pending');
    if (roleSelected && userProfile && !legacyTourCompleted && window.localStorage.getItem('adam-onboarding-pending') === 'true' && !onboardedAccounts[accountKey] && !localOnboardedAccounts[accountKey]) {
      setShowWelcomeGuide(true);
    }
  }, [currentRole, onboardedAccounts, roleSelected, userProfile]);

  useEffect(() => {
    const recipient = notifications.find((notification) => {
      if (seenNotificationIds.current.has(notification.id)) return false;
      if (notification.audienceRole && notification.audienceRole !== 'all' && notification.audienceRole !== currentRole) return false;
      if (currentRole === 'student' && notification.audienceId && notification.audienceId !== (userProfile?.id || 'FUNAAB/IT/24/001')) return false;
      if (currentRole === 'hoc' && notification.audienceDepartment && notification.audienceDepartment !== userProfile?.department) return false;
      if (notification.audienceProgramme && userProfile?.programme && notification.audienceProgramme !== userProfile.programme) return false;
      return true;
    });

    notifications.forEach((notification) => seenNotificationIds.current.add(notification.id));
    if (!recipient) return undefined;

    setPopIn(recipient);
    const timer = window.setTimeout(() => setPopIn(null), 6000);
    return () => window.clearTimeout(timer);
  }, [currentRole, notifications, userProfile]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!roleSelected || !userProfile) {
    return <RoleGate />;
  }

  return (
    <div className={`app theme-${theme}`}>
      <InstallPWA />
      <Sidebar />
      <main className="main">
        <PageComponent />
      </main>
      <NotificationPopIn notification={popIn} onOpen={() => { setPopIn(null); setCurrentPage('notifications'); }} />
      {showWelcomeGuide && <WelcomeGuide onClose={() => setShowWelcomeGuide(false)} setCurrentPage={setCurrentPage} currentRole={currentRole} userProfile={userProfile} onboardedAccounts={onboardedAccounts} setOnboardedAccounts={setOnboardedAccounts} />}
    </div>
  );
}
