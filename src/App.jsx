import React, { useContext } from 'react';
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
import RoleGate from './components/common/RoleGate.jsx';

const pageMap = {
  's-home': StudentHome,
  's-attendance': StudentAttendance,
  's-courses': StudentCourses,
  's-history': StudentHistory,
  's-profile': StudentProfile,
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

export default function App() {
  const { currentPage, roleSelected } = useContext(AppContext);
  const PageComponent = pageMap[currentPage] || StudentHome;

  if (!roleSelected) {
    return <RoleGate />;
  }

  return (
    <div className="app">
      <InstallPWA />
      <Sidebar />
      <main className="main">
        <PageComponent />
      </main>
    </div>
  );
}
