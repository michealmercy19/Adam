import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';

export default function Sidebar() {
  const { currentRole, setCurrentRole, setCurrentPage } = useContext(AppContext);

  const navs = {
    student: [
      ['s-home', 'Dashboard'],
      ['s-attendance', 'Mark Attendance'],
      ['s-courses', 'My Courses'],
      ['s-history', 'History'],
      ['s-profile', 'Profile'],
    ],
    lecturer: [
      ['l-dashboard', 'Dashboard'],
      ['l-host', 'Host Class'],
      ['l-attendance', 'Live Attendance'],
      ['l-classes', 'My Classes'],
      ['l-reports', 'Reports'],
    ],
    hoc: [
      ['h-courses', 'Course Offerings'],
    ],
    admin: [
      ['a-dashboard', 'Dashboard'],
      ['a-users', 'Users'],
      ['a-records', 'Search Records'],
      ['a-reports', 'Reports'],
      ['a-settings', 'Settings'],
      ['a-complaints', 'Complaints'],
    ],
  };

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setCurrentRole(role);
    setCurrentPage(navs[role][0][0]);
  };

  return (
    <aside className="sidebar">
      <div className="logo">ADAM</div>
      <div className="rolebox">
        <small>Prototype role</small>
        <select value={currentRole} onChange={handleRoleChange}>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="hoc">Head of Class (HOC)</option>
          <option value="admin">Department Admin</option>
        </select>
      </div>
      <nav className="nav">
        {navs[currentRole].map((nav, index) => (
          <button
            key={nav[0]}
            className={index === 0 ? 'active' : ''}
            onClick={() => handleNavClick(nav[0])}
          >
            {nav[1]}
          </button>
        ))}
      </nav>
    </aside>
  );
}
