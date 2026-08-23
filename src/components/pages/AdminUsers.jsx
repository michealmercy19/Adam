import React from 'react';
import { Card, Badge } from '../common/UI.jsx';

export default function AdminUsers() {
  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Users</h1>
          <p>Manage students and lecturers</p>
        </div>
      </div>

      <Card>
        <div className="course">
          <div>
            <b>Adebayo Daniel</b>
            <div className="muted">Student · FUNAAB/IT/24/001</div>
          </div>
          <Badge text="Active" type="good" />
        </div>
        <div className="course">
          <div>
            <b>Dr. Adewale James</b>
            <div className="muted">Lecturer · STAFF/ICT/014</div>
          </div>
          <Badge text="Active" type="good" />
        </div>
      </Card>
    </>
  );
}
