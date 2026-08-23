import React from 'react';
import { Pill, Card, Grid, Badge } from '../common/UI.jsx';

export default function AdminDashboard() {
  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Admin Dashboard</h1>
          <p>Department-wide overview</p>
        </div>
        <Pill text="Admin only" />
      </div>

      <Grid cols={4}>
        <Card>
          <div className="muted">Students</div>
          <div className="metric">1,284</div>
        </Card>
        <Card>
          <div className="muted">Lecturers</div>
          <div className="metric">48</div>
        </Card>
        <Card>
          <div className="muted">Courses</div>
          <div className="metric">96</div>
        </Card>
        <Card>
          <div className="muted">Attendance today</div>
          <div className="metric">84%</div>
        </Card>
      </Grid>
    </>
  );
}
