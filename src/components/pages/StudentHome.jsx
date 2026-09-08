            import React, { useContext, useEffect, useState } from 'react';
import { Badge, Pill, Card, Button, Grid } from '../common/UI';
import { AppContext } from '../../context/AppContext.jsx';
import { getCurrentAndCarryoverCourses } from '../../utils/attendanceLogic.js';

const studentId = 'FUNAAB/IT/24/001';

export default function StudentHome() {
  const { userProfile, activeClass, attendanceRecords, courseOfferings, studentCourseSelections, setCurrentPage } = useContext(AppContext);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedCourseIds = studentCourseSelections[userProfile?.id || studentId] || [];
  const department = userProfile?.department || 'Department pending';
  const registeredCourses = courseOfferings.filter((course) => selectedCourseIds.includes(course.id) && (course.eligibleDepartments || course.linkedDepartments || []).includes(department));
  const { current } = getCurrentAndCarryoverCourses(registeredCourses, selectedCourseIds);
  const myAttendance = attendanceRecords.filter((record) => record.studentId === (userProfile?.id || studentId));
  const activeSessionAttendance = activeClass
    ? myAttendance.some((record) => record.sessionId === activeClass.sessionId)
    : false;
  const attendedClasses = myAttendance.filter((record) => ['Present', 'Late', 'Completed'].includes(record.status)).length;
  const attendancePercentage = myAttendance.length ? Math.round((attendedClasses / myAttendance.length) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = userProfile?.name?.trim().split(/\s+/)[0] || 'Student';
  const remainingMinutes = activeClass?.endsAt
    ? Math.max(0, Math.ceil((new Date(activeClass.endsAt).getTime() - now) / 60000))
    : null;
  const attendanceCountdown = remainingMinutes === null
    ? 'Time set by host'
    : activeClass?.completedAt
      ? 'Attendance completed'
    : remainingMinutes > 0
      ? `${remainingMinutes} min left to close attendance`
      : 'Attendance closing now';
  const overviewCards = [
    { key: 'attendance', label: 'Attendance', value: `${attendancePercentage}%`, meter: attendancePercentage, tone: 'blue' },
    { key: 'courses', label: 'Current courses', value: current.length, meter: Math.min(100, current.length * 20), tone: 'purple' },
    { key: 'classes', label: 'Classes', value: myAttendance.length, meter: Math.min(100, myAttendance.length * 10), tone: 'green' }
  ];

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>{greeting}, {firstName} <span className="greeting-wave" aria-hidden="true">👋</span></h1>
          <p>Your attendance at a glance</p>
        </div>
        <Pill text="Student" />
      </div>

      <Grid cols={3}>
        {overviewCards.map((card, index) => (
          <Card key={card.key} className={`stat-card stat-card-${card.tone}`} style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="stat-head">
              <span className="muted">{card.label}</span>
              <span className="stat-indicator" aria-hidden="true" />
            </div>
            <div className="metric">{card.value}</div>
            <div className="stat-meter" aria-hidden="true"><span style={{ width: `${card.meter}%` }} /></div>
            <div className="stat-foot">
              <span>{card.key === 'attendance' ? 'This semester' : card.key === 'courses' ? 'Active' : 'Logged'}</span>
            </div>
          </Card>
        ))}
      </Grid>

      <Card className="section">
        <h3>Next class</h3>
        {activeClass ? (
          <div className="course">
            <div>
              <b>{activeClass.courseCode} · {activeClass.courseTitle}</b>
              <div className="muted">
                {activeClass.time || 'Time set by host'} · {activeClass.venue || 'Venue set by host'}
                {remainingMinutes !== null && (
                  <span className="attendance-countdown"> · {attendanceCountdown}</span>
                )}
              </div>
            </div>
            <Button type={activeClass.completedAt || activeSessionAttendance ? 'ghost' : 'primary'} disabled={Boolean(activeClass.completedAt || activeSessionAttendance)} onClick={() => setCurrentPage('s-attendance')}>{activeClass.completedAt ? 'Session ended' : activeSessionAttendance ? 'Attendance marked' : 'Clock In'}</Button>
          </div>
        ) : (
          <p className="muted">No class is currently open. Your lecturer or HOC will publish it here.</p>
        )}
      </Card>

      <Card className="section">
        <div className="list-heading">
          <div>
            <h3>Current courses</h3>
            <p className="muted">Verified by your department HOC · First Semester 2026/2027</p>
          </div>
          <Badge text={`${current.length} courses`} />
        </div>
        <div className="student-course-list">
          {current.map((course) => (
            <div className="course-entry" key={course.id}>
              <div><b>{course.code} · {course.title}</b><span className="muted">{course.units} units</span></div>
              <Badge text="Current" type="good" />
            </div>
          ))}
        </div>
      </Card>

    </>
  );
}
