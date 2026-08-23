import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Badge, Button, Card } from './UI.jsx';

const roles = [
  { id: 'student', name: 'Student', detail: 'Declare courses, manage carryovers, and mark attendance.' },
  { id: 'lecturer', name: 'Lecturer', detail: 'Choose your courses and share teaching access.' },
  { id: 'hoc', name: 'Head of Class', detail: 'Publish department courses and review declarations.' },
  { id: 'admin', name: 'Department Admin', detail: 'Manage records and department controls.' },
];

export default function RoleGate() {
  const { setCurrentRole, setCurrentPage, setRoleSelected } = useContext(AppContext);
  const [selectedRole, setSelectedRole] = useState('student');

  const enterApp = () => {
    setCurrentRole(selectedRole);
    setCurrentPage({ student: 's-home', lecturer: 'l-dashboard', hoc: 'h-courses', admin: 'a-dashboard' }[selectedRole]);
    setRoleSelected(true);
  };

  return (
    <main className="role-gate">
      <div className="role-gate-inner">
        <div className="role-gate-brand"><span>A</span>DAM</div>
        <p className="eyebrow">Your academic workspace</p>
        <h1>Which role describes you best?</h1>
        <p className="role-gate-subtitle">Pick a role to connect course selection, teaching assignments, and attendance in one place.</p>
        <div className="role-choice-grid">
          {roles.map((role) => (
            <button className={`role-choice ${selectedRole === role.id ? 'selected' : ''}`} key={role.id} onClick={() => setSelectedRole(role.id)}>
              <span className="role-choice-mark">{selectedRole === role.id ? '✓' : ''}</span>
              <strong>{role.name}</strong>
              <small>{role.detail}</small>
              {role.id === 'hoc' && <Badge text="Restricted" type="pending" />}
            </button>
          ))}
        </div>
        <Button type="primary" onClick={enterApp}>Enter workspace</Button>
      </div>
    </main>
  );
}
