import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Button } from './UI.jsx';
import { buildAcademicLevelOptions, funaabDepartments, normalizeDepartmentName } from '../../utils/funaabAcademicUnits.js';

const roles = [
  { id: 'student', name: 'Student', detail: 'View courses and attendance', icon: '👨‍🎓' },
  { id: 'lecturer', name: 'Lecturer', detail: 'Host sessions and verify', icon: '👩‍🏫' },
  { id: 'hoc', name: 'Head of Class', detail: 'Manage records', icon: '👔' },
  { id: 'admin', name: 'Department Admin', detail: 'Monitor performance', icon: '⚙️' },
];

const defaultProfiles = {
  student: { label: 'Matric number', placeholder: '202*****', hint: 'Your 8-digit matric number' },
  lecturer: { label: 'Staff ID', placeholder: 'STAFF/ICT/***', hint: 'Your university staff ID' },
  hoc: { label: 'HOC ID', placeholder: 'HOC/ICT/***', hint: 'Your HOC account ID' },
  admin: { label: 'Admin ID', placeholder: 'ADMIN/ICT/***', hint: 'Your admin ID' },
};

export default function RoleGate() {
  const { setCurrentRole, setCurrentPage, setRoleSelected, setUserProfile, setHocRequests, setNotifications, onboardedAccounts, studentRegistry, academicWorkspaces } = useContext(AppContext);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0); // 0: info, 1: checking, 2: success, 3: failed
  const [identity, setIdentity] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [programme, setProgramme] = useState('');
  const [departmentQuery, setDepartmentQuery] = useState('');
  const [showDepartmentResults, setShowDepartmentResults] = useState(false);
  const [level, setLevel] = useState('100 Level');

  const profileMeta = useMemo(() => defaultProfiles[selectedRole] || {}, [selectedRole]);
  const matchingDepartments = funaabDepartments.filter((item) => `${item.college} ${item.code} ${item.name}`.toLowerCase().includes(departmentQuery.toLowerCase()));
  const academicLevelOptions = useMemo(() => buildAcademicLevelOptions(department), [department]);

  useEffect(() => {
    if (!academicLevelOptions.includes(level)) {
      setLevel(academicLevelOptions[0] || '100 Level');
    }
  }, [academicLevelOptions, level]);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setShowVerification(true);
    setVerificationStep(0);
    setIdentity('');
    setName('');
    setDepartment('');
    setProgramme('');
    setDepartmentQuery('');
    setShowDepartmentResults(false);
    setLevel('100 Level');
  };

  const handleVerifyIdentity = async () => {
    const normalizedIdentity = identity.trim();
    const normalizedName = name.trim();
    const normalizedProgramme = programme.trim();
    const studentPattern = /^(?:\d{8,}|FUNAAB\/[A-Z]+\/[0-9]{2}\/[0-9]{3,})$/i;
    const staffPattern = /^(?:STAFF\/[A-Z0-9\-/]+|[A-Z]{2,}\/\d{3,})$/i;
    const hocPattern = /^(?:HOC\/[A-Z0-9\-/]+|[A-Z]{2,}\/\d{3,})$/i;
    const adminPattern = /^(?:ADMIN\/[A-Z0-9\-/]+|[A-Z]{2,}\/\d{3,})$/i;
    const rolePatterns = {
      student: studentPattern,
      lecturer: staffPattern,
      hoc: hocPattern,
      admin: adminPattern,
    };

    if (!normalizedIdentity || !normalizedName || normalizedName.length < 2 || (selectedRole === 'student' && !normalizedProgramme)) {
      setVerificationStep(3);
      return;
    }

    if (!rolePatterns[selectedRole]?.test(normalizedIdentity)) {
      setVerificationStep(3);
      return;
    }

    const canonicalDepartment = normalizeDepartmentName(department);
    const validDepartment = Boolean(department.trim()) && matchingDepartments.some((item) => normalizeDepartmentName(item.name) === canonicalDepartment);

    if (!validDepartment) {
      setVerificationStep(3);
      return;
    }

    if (selectedRole === 'student' && studentRegistry.length) {
      const registryRecord = studentRegistry.find((record) => record.matricNumber.toLowerCase() === normalizedIdentity.toLowerCase());
      const matchesRegistry = registryRecord
        && registryRecord.fullName.toLowerCase() === normalizedName.toLowerCase()
        && registryRecord.institution.toLowerCase() === 'federal university of agriculture, abeokuta'
        && normalizeDepartmentName(registryRecord.department) === canonicalDepartment
        && normalizeDepartmentName(registryRecord.programme) === normalizeDepartmentName(normalizedProgramme)
        && registryRecord.level.toLowerCase() === level.toLowerCase()
        && registryRecord.session === '2026/2027'
        && registryRecord.status === 'active';
      if (!matchesRegistry) {
        setVerificationStep(3);
        return;
      }
    }

    setVerificationStep(1);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setVerificationStep(2);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const assignedHocWorkspace = selectedRole === 'student'
      ? Object.values(academicWorkspaces).find((workspace) => workspace.hocAccountId === normalizedIdentity && workspace.level === level && workspace.session === '2026/2027' && normalizeDepartmentName(workspace.department) === canonicalDepartment && normalizeDepartmentName(workspace.programme || department) === normalizeDepartmentName(normalizedProgramme || department))
      : null;
    const isPendingHocAccount = selectedRole === 'hoc' && !assignedHocWorkspace;
    const resolvedRole = assignedHocWorkspace ? 'hoc' : isPendingHocAccount ? 'student' : selectedRole;
    const profile = {
      role: resolvedRole,
      id: normalizedIdentity,
      name: normalizedName,
      department,
      programme: normalizedProgramme || department,
      level,
      verifiedAt: new Date().toISOString(),
      requestedRole: isPendingHocAccount ? 'hoc' : undefined,
    };

    if (isPendingHocAccount) {
      const hocRequest = {
        id: `hoc-request-${Date.now()}`,
        studentId: normalizedIdentity,
        studentName: normalizedName,
        department,
        programme: normalizedProgramme || department,
        level,
        session: '2026/2027',
        message: 'HOC role requested during account creation.',
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };
      setHocRequests((current) => [hocRequest, ...current.filter((request) => !(request.studentId === normalizedIdentity && request.status === 'pending'))]);
      setNotifications((current) => [{ id: `hoc-request-notification-${Date.now()}`, audienceRole: 'admin', audienceDepartment: department, audienceProgramme: normalizedProgramme || department, title: 'New HOC request', message: `${normalizedName} requested HOC for ${normalizedProgramme || department} · ${level} · 2026/2027.`, type: 'info', createdAt: new Date().toISOString() }, ...current]);
    }

    setUserProfile(profile);
    setCurrentRole(resolvedRole);
    setCurrentPage({ student: 's-home', lecturer: 'l-dashboard', hoc: 'h-courses', admin: 'a-dashboard' }[resolvedRole]);
    setRoleSelected(true);
    const accountKey = `${resolvedRole}:${normalizedIdentity.toLowerCase()}`;
    let localOnboardedAccounts = {};
    try { localOnboardedAccounts = JSON.parse(window.localStorage.getItem('adam-onboarded-accounts') || '{}'); } catch { localOnboardedAccounts = {}; }
    if (!onboardedAccounts[accountKey] && !localOnboardedAccounts[accountKey]) {
      window.localStorage.setItem('adam-onboarding-pending', 'true');
      window.localStorage.setItem('adam-onboarding-account', accountKey);
    }
  };

  const handleRetryVerification = () => {
    setVerificationStep(0);
  };

  const handleCloseModal = () => {
    setShowVerification(false);
    setSelectedRole(null);
    setVerificationStep(0);
  };

  const selectedRoleData = roles.find((r) => r.id === selectedRole);

  return (
    <main className="role-gate">
      <div className="role-gate-gradient" />
      <div className="role-gate-inner">
        <div className="role-gate-header">
          <div className="role-gate-brand"><span>A</span>DAM</div>
          <p className="eyebrow">🔐 Secure access</p>
          <h1>Welcome to ADAM</h1>
          <p className="role-gate-subtitle">Select your role and verify your identity to access your workspace</p>
        </div>

        <div className="role-selection-grid">
          {roles.map((role) => (
            <button
              className="role-card"
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
            >
              <div className="role-card-icon">{role.icon}</div>
              <div className="role-card-content">
                <strong>{role.name}</strong>
                <small>{role.detail}</small>
              </div>
              <div className="role-card-arrow">→</div>
            </button>
          ))}
        </div>
      </div>

      {showVerification && selectedRoleData && (
        <div className={`verification-modal-overlay ${showVerification ? 'visible' : ''}`} onClick={handleCloseModal}>
          <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>

            {verificationStep === 0 && (
              <div className="verification-step-content">
                <div className="verification-icon">{selectedRoleData.icon}</div>
                <h2>Verify your identity</h2>
                <p className="verification-subtitle">As a {selectedRoleData.name.toLowerCase()}</p>

                <div className="verification-form">
                  <div className="field">
                    <label>Full name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      autoFocus
                    />
                  </div>

                  <div className="field">
                    <label>{profileMeta.label}</label>
                    <input
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      placeholder={profileMeta.placeholder}
                    />
                    <small className="field-hint">{profileMeta.hint}</small>
                  </div>

                  {(selectedRole === 'student' || selectedRole === 'hoc') && (
                    <div className="field">
                      <label>Current level</label>
                      <select value={level} onChange={(e) => setLevel(e.target.value)}>
                        {academicLevelOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedRole === 'student' && (
                    <div className="field">
                      <label htmlFor="programme">Programme</label>
                      <input id="programme" value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="e.g. ICT or Information Technology" />
                      <small className="field-hint">Use the programme on your official student record.</small>
                    </div>
                  )}

                  <div className="field department-picker">
                    <label htmlFor="department-search">Search your department</label>
                    <input
                      id="department-search"
                      value={departmentQuery}
                      onFocus={() => setShowDepartmentResults(true)}
                      onChange={(e) => {
                        setDepartmentQuery(e.target.value);
                        setDepartment('');
                        setShowDepartmentResults(true);
                      }}
                      placeholder="Physics, Information and Communication..."
                    />
                    {showDepartmentResults && (
                      <div className="department-results" role="listbox">
                        {matchingDepartments.slice(0, 5).map((item) => (
                          <button
                            type="button"
                            className={`department-option ${department === item.name ? 'selected' : ''}`}
                            key={`${item.code}-${item.name}`}
                            onClick={() => {
                              setDepartment(item.name);
                              setDepartmentQuery(item.name);
                              setShowDepartmentResults(false);
                            }}
                          >
                            <strong>{item.name}</strong>
                            <small>{item.code} · {item.college}</small>
                          </button>
                        ))}
                        {!matchingDepartments.length && (
                          <small className="field-hint">No department found. Check the spelling.</small>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="verification-actions">
                  <Button
                    type="primary"
                    onClick={handleVerifyIdentity}
                    disabled={!name.trim() || !identity.trim()}
                  >
                    Verify Identity
                  </Button>
                  <Button type="ghost" onClick={handleCloseModal}>Cancel</Button>
                </div>
              </div>
            )}

            {verificationStep === 1 && (
              <div className="verification-step-content verification-checking">
                <div className="verification-checker">
                  <div className="checker-spinner" />
                  <h2>Verifying identity...</h2>
                  <p>Checking {selectedRoleData.name.toLowerCase()} records</p>
                  <div className="checker-steps">
                    <div className="checker-step active">
                      <span className="step-icon">✓</span>
                      <span>Name verified</span>
                    </div>
                    <div className="checker-step">
                      <span className="step-icon">⏳</span>
                      <span>ID validation</span>
                    </div>
                    <div className="checker-step">
                      <span className="step-icon">⏳</span>
                      <span>Department check</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {verificationStep === 2 && (
              <div className="verification-step-content verification-success">
                <div className="success-animation">
                  <div className="success-checkmark">✓</div>
                </div>
                <h2>Identity verified!</h2>
                <p>Welcome, {name.split(' ')[0]}!</p>
                <p className="verification-detail">Redirecting to your workspace...</p>
              </div>
            )}

            {verificationStep === 3 && (
              <div className="verification-step-content verification-failed">
                <div className="failed-icon">⚠</div>
                <h2>Verification failed</h2>
                <p className="verification-subtitle">We couldn't verify your identity</p>
                <p className="verification-detail">
                  Please check your {profileMeta.label.toLowerCase()} and try again, or contact your department office.
                </p>
                <div className="verification-actions">
                  <Button type="primary" onClick={handleRetryVerification}>
                    Try Again
                  </Button>
                  <Button type="ghost" onClick={handleCloseModal}>Back to roles</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
