import React from 'react';
import { Badge, Card } from '../common/UI.jsx';

export default function StudentProfile() {
  return (
    <>
      <div className="top">
        <div className="title">
          <h1>My Profile</h1>
          <p>Student account</p>
        </div>
      </div>

      <Card>
        <h3>Adebayo Daniel</h3>
        <p className="muted">FUNAAB/IT/24/001 · Information Technology</p>
        <div className="statline">
          <span>Biometric status</span>
          <Badge text="Verified" type="good" />
        </div>
        <div className="statline">
          <span>Face profile</span>
          <Badge text="Active" type="good" />
        </div>
      </Card>
    </>
  );
}
