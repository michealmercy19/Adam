import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

export default function Sidebar() {
  const { currentRole, currentPage, setCurrentPage, setRoleSelected, userProfile, setUserProfile, notifications } = useContext(AppContext);

  const navs = {
    student: [
      ['s-home', 'Dashboard'],
      ['s-attendance', 'Mark Attendance'],
      ['s-courses', 'My Courses'],
      ['s-profile', 'Profile'],
    ],
    lecturer: [
      ['l-dashboard', 'Dashboard'],
      ['l-host', 'Host Class'],
      ['l-attendance', 'Live Attendance'],
      ['l-classes', 'My Classes'],
      ['l-reports', 'Reports'],
      ['s-profile', 'Profile'],
    ],
    hoc: [
      ['s-home', 'Dashboard'],
      ['s-attendance', 'Mark Attendance'],
      ['s-courses', 'My Courses'],
      ['s-profile', 'Profile'],
      ['h-courses', 'Course Offerings'],
    ],
    admin: [
      ['a-dashboard', 'Dashboard'],
      ['a-users', 'Users'],
      ['a-records', 'Search Records'],
      ['a-reports', 'Reports'],
      ['a-settings', 'Settings'],
      ['a-complaints', 'Complaints'],
      ['s-profile', 'Profile'],
    ],
  };

  const navIcons = {
    Dashboard: '⌂',
    'Mark Attendance': '✓',
    'My Courses': '▦',
    History: '◷',
    Profile: '◯',
    'Host Class': '+',
    'Live Attendance': '●',
    'My Classes': '▤',
    Reports: '▥',
    'Course Offerings': '▤',
    Users: '♙',
    'Search Records': '⌕',
    Settings: '⚙',
    Complaints: '!',
    Notifications: '●',
  };

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
  };

  const switchAccount = () => {
    setUserProfile(null);
    setRoleSelected(false);
    setCurrentPage('s-home');
  };

  const initials = (userProfile?.name || 'User').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const visibleNotifications = notifications.filter((notification) => (!notification.audienceRole || notification.audienceRole === 'all' || notification.audienceRole === currentRole) && (currentRole !== 'student' || !notification.audienceId || normalize(notification.audienceId) === normalize(userProfile?.id || 'FUNAAB/IT/24/001')) && (currentRole !== 'hoc' || !notification.audienceDepartment || normalize(notification.audienceDepartment) === normalize(userProfile?.department)) && (!notification.audienceProgramme || !userProfile?.programme || normalize(notification.audienceProgramme) === normalize(userProfile.programme)));
  const unreadCount = visibleNotifications.filter((notification) => !notification.seenAt).length;

  return (
    <aside className="sidebar">
      <div className="logo"><span>A</span>DAM</div>
      <div className="rolebox">
        <small>Signed in</small>
        <div className="rolebox-identity">
          {userProfile?.avatar ? <img className="account-avatar" src={userProfile.avatar} alt="" /> : <span className="account-avatar" aria-hidden="true">{initials}</span>}
          <div className="profile-identity-copy"><span className="account-name">{userProfile?.name || 'User'}</span><small>{userProfile?.role || currentRole} · verified</small></div>
          <div className="profile-actions">
            <button className={`notification-bell ${currentPage === 'notifications' ? 'active' : ''}`} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unseen` : ''}`} onClick={() => setCurrentPage('notifications')}>
              <span aria-hidden="true">🔔</span>
              {unreadCount > 0 && <b>{unreadCount > 9 ? '9+' : unreadCount}</b>}
            </button>
          </div>
        </div>
        <button className="switch-account" onClick={switchAccount}>Switch account</button>
      </div>
      <nav className="nav">
        {navs[currentRole].map((nav) => (
          <button
            key={nav[0]}
            className={currentPage === nav[0] ? 'active' : ''}
            onClick={() => handleNavClick(nav[0])}
          >
            {nav[1] === 'Profile' && userProfile?.avatar ? <img className="nav-avatar" src={userProfile.avatar} alt="" /> : <span className="nav-icon" aria-hidden="true">{navIcons[nav[1]]}</span>}
            <span className="nav-label">{nav[1]}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
