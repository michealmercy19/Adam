import React from 'react';
import { Card, Badge } from '../common/UI.jsx';

export default function AdminSettings() {
  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Settings</h1>
          <p>Admin-only system controls</p>
        </div>
      </div>

      <Card>
        <div className="statline">
          <span>Maximum attendance session</span>
          <b>35 min</b>
        </div>
        <div className="statline">
          <span>Default On Time</span>
          <b>10 min</b>
        </div>
        <div className="statline">
          <span>Default Late</span>
          <b>5 min</b>
        </div>
        <div className="statline">
          <span>Facial recognition</span>
          <Badge text="Enabled" type="good" />
        </div>
        <div className="statline">
          <span>Final biometrics</span>
          <Badge text="Required" type="good" />
        </div>
        <div className="statline">
          <span>Network fallback</span>
          <Badge text="Enabled" type="good" />
        </div>
      </Card>
    </>
  );
}
