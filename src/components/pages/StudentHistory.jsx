import React from 'react';
import { Badge, Pill, Card } from '../common/UI.jsx';

export default function StudentHistory() {
  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Attendance History</h1>
          <p>Your recent classes</p>
        </div>
      </div>

      <Card>
        <div className="course">
          <div>
            <b>ICT 201</b>
            <div className="muted">18 Aug · 10:04 AM</div>
          </div>
          <Badge text="On Time" type="good" />
        </div>
        <div className="course">
          <div>
            <b>ICT 203</b>
            <div className="muted">17 Aug · 12:09 PM</div>
          </div>
          <Badge text="Late" type="pending" />
        </div>
      </Card>
    </>
  );
}
