import React, { useState } from 'react';
import { Card, Badge, Button } from '../common/UI.jsx';

export default function AdminComplaints() {
  const [complaint, setComplaint] = useState('');

  const handleSubmit = () => {
    alert('Complaint submitted');
    setComplaint('');
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Complaints & Support</h1>
          <p>Review and submit issues</p>
        </div>
      </div>

      <Card>
        <div className="listitem">
          <b>FACIAL-024</b>
          <Badge text="Open" type="pending" />
        </div>
        <div className="listitem">
          <b>ATT-031</b>
          <Badge text="Open" type="pending" />
        </div>
        <div className="field">
          <label>New complaint</label>
          <input
            placeholder="Describe the issue"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          />
        </div>
        <Button type="primary" onClick={handleSubmit}>
          Submit Complaint
        </Button>
      </Card>
    </>
  );
}
