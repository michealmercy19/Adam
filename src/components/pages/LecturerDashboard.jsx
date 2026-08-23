import React, { useContext } from 'react';
import { Pill, Card, Button, Grid } from '../common/UI.jsx';
import { AppContext } from '../../context/AppContext.jsx';

export default function LecturerDashboard() {
  const { courseOfferings, lecturerAssignments, setCurrentPage } = useContext(AppContext);
  const assignedIds = lecturerAssignments['lecturer-001'] || [];
  const assignedCourses = courseOfferings.filter((course) => assignedIds.includes(course.id));

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Lecturer Dashboard</h1>
          <p>Classes and live attendance</p>
        </div>
        <Pill text="Lecturer" />
      </div>

      <Grid cols={4}>
        <Card>
          <div className="muted">Today's classes</div>
          <div className="metric">{assignedCourses.length}</div>
        </Card>
        <Card>
          <div className="muted">Average attendance</div>
          <div className="metric">{assignedCourses.length ? '82%' : '—'}</div>
        </Card>
      </Grid>

      <Card className="section">
        <h3>Quick actions</h3>
        <div className="actions">
          <Button type="primary" onClick={() => setCurrentPage('l-host')}>Host / Schedule</Button>
          <Button type="ghost" onClick={() => setCurrentPage('l-attendance')}>Live Attendance</Button>
          <Button type="ghost" onClick={() => setCurrentPage('l-reports')}>Reports</Button>
        </div>
      </Card>

      <Card className="section">
        <h3>Assigned courses</h3>
        {assignedCourses.length ? assignedCourses.map((course) => <div className="course-entry" key={course.id}><div><b>{course.code} · {course.title}</b><span className="muted">{course.units} units · shared teaching access</span></div><Button type="ghost" onClick={() => setCurrentPage('l-host')}>Host</Button></div>) : <p className="muted">Choose courses in My Classes to start hosting.</p>}
      </Card>
    </>
  );
}
