import React, { useContext, useEffect, useState } from 'react';
import { Badge, Card, Button } from '../common/UI.jsx';
import FingerprintEnrollment from '../common/FingerprintEnrollment.jsx';
import { AppContext } from '../../context/AppContext.jsx';
import { getBiometricStatusBadge, getEnrollmentStatus } from '../../utils/biometricUtils.js';

export default function StudentProfile() {
  const { currentRole, setCurrentRole, userProfile, setUserProfile, setRoleSelected, theme, setTheme, setCurrentPage, hocRequests, academicWorkspaces } = useContext(AppContext);
  const initials = (userProfile?.name || 'Student').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const enrollmentStatus = getEnrollmentStatus(userProfile);
  const biometricStatusText = getBiometricStatusBadge(userProfile);
  const activeStudentId = userProfile?.id || '';
  const [now, setNow] = useState(Date.now());
  const existingHocRequest = hocRequests.find((request) => request.studentId === activeStudentId && ['pending', 'approved'].includes(request.status));
  const assignedHocWorkspace = Object.values(academicWorkspaces).find((workspace) => workspace.hocAccountId === activeStudentId);
  const showApprovedNotice = existingHocRequest?.status === 'approved' && existingHocRequest.approvedAt && now - new Date(existingHocRequest.approvedAt).getTime() < 3 * 60 * 1000;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!assignedHocWorkspace || currentRole === 'hoc') return;
    setUserProfile((current) => ({ ...current, role: 'hoc', requestedRole: undefined }));
    setCurrentRole('hoc');
    setCurrentPage('h-courses');
  }, [assignedHocWorkspace, currentRole, setCurrentPage, setCurrentRole, setUserProfile]);

  const updatePicture = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => setUserProfile((current) => ({ ...current, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const removePicture = () => setUserProfile((current) => {
    const next = { ...current };
    delete next.avatar;
    return next;
  });

  const logOut = () => {
    setUserProfile(null);
    setRoleSelected(false);
    setCurrentPage('s-home');
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>My Profile</h1>
          <p>{userProfile?.role || 'User'} account</p>
        </div>
      </div>

      <Card className="profile-card">
        <div className="profile-heading">
          {userProfile?.avatar ? <img className="profile-avatar" src={userProfile.avatar} alt={`${userProfile.name} profile`} /> : <div className="profile-avatar profile-initials">{initials}</div>}
          <div>
            <h3>{userProfile?.name || 'Student'}</h3>
            <p className="profile-role">{userProfile?.role || 'User'} account · verified</p>
            <p className="muted">Keep your account details and appearance up to date.</p>
          </div>
        </div>
        <div className="profile-picture-actions">
          <label className="picture-button">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={updatePicture} />
            {userProfile?.avatar ? 'Replace picture' : 'Upload picture'}
          </label>
          {userProfile?.avatar && <Button type="ghost" onClick={removePicture}>Remove</Button>}
        </div>
        <p className="picture-hint">JPG, PNG, or WEBP · Maximum 2 MB</p>
        <p className="muted">{userProfile?.id || 'Matric number pending'} · {userProfile?.department || 'Department pending'} · {userProfile?.level || 'Level pending'}</p>
        {userProfile?.role === 'student' && (
          <div className="profile-appearance">
            <div><strong>Attendance history</strong><span className="muted">Review your recent check-ins and attendance status.</span></div>
            <Button type="primary" onClick={() => setCurrentPage && setCurrentPage('s-history')}>Open history</Button>
          </div>
        )}
        <div className="profile-appearance">
          <div><strong>Appearance</strong><span className="muted">Choose how ADAM looks on this device.</span></div>
          <div className="theme-choice">
            <button type="button" className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><span aria-hidden="true">☼</span><span>Light</span></button>
            <button type="button" className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><span aria-hidden="true">☾</span><span>Dark</span></button>
          </div>
        </div>
        <div className="statline">
          <span>Biometric status</span>
          <Badge text={biometricStatusText} type={enrollmentStatus.enrolled ? 'good' : 'default'} />
        </div>
        <div className="statline">
          <span>Face profile</span>
          <Badge text="Active" type="good" />
        </div>
        {userProfile?.role === 'student' && existingHocRequest?.status === 'pending' && <div className="profile-appearance"><div><strong>HOC request pending</strong><span className="muted">Your HOC request is waiting for administrative approval.</span></div><Badge text="Pending" type="pending" /></div>}
        {userProfile?.role === 'student' && showApprovedNotice && <div className="profile-appearance"><div><strong>HOC request approved</strong><span className="muted">Your HOC workspace is being opened on this account.</span></div><Badge text="Approved" type="good" /></div>}
        <div className="profile-logout-row">
          <div><strong>Sign out</strong><span className="muted">End this session on the current device.</span></div>
          <Button type="ghost" onClick={logOut}>Log out</Button>
        </div>
      </Card>

      <FingerprintEnrollment />
    </>
  );
}
