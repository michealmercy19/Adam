import React, { useContext } from 'react';
import { Badge, Pill, Card, Button, Grid } from '../common/UI';
import { AppContext } from '../../context/AppContext.jsx';

export default function StudentHome() {
  const { courseOfferings, setCurrentPage } = useContext(AppContext);
  const currentCourses = courseOfferings.filter((course) => course.linkedDepartments?.includes('Information Technology') && course.session === '2026/2027' && course.semester === 'First');
  const carryoverCourses = currentCourses.filter((course) => course.carryover);

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Good afternoon 👋</h1>
          <p>Your attendance at a glance</p>
        </div>
        <Pill text="Student" />
      </div>

      <Grid cols={4}>
        <Card>
          <div className="muted">Attendance</div>
          <div className="metric">86%</div>
        </Card>
        <Card>
          <div className="muted">Classes</div>
          <div className="metric">24</div>
        </Card>
      </Grid>

      <Card className="section">
        <h3>Next class</h3>
        <div className="course">
          <div>
            <b>ICT 201 — Data Structures</b>
            <div className="muted">10:00 AM · ICT 2</div>
          </div>
          <Button type="primary" onClick={() => setCurrentPage('s-attendance')}>Mark Attendance</Button>
        </div>
      </Card>
      <Card className="section">
        <div className="list-heading">
          <div>
            <h3>My semester courses</h3>
            <p className="muted">Verified by your department HOC · First semester 2026/2027</p>
          </div>
          <Badge text={`${currentCourses.length} courses`} />
        </div>
        <div className="student-course-list">
          {currentCourses.map((course) => (
            <div className="course-entry" key={course.id}>
              <div><b>{course.code} · {course.title}</b><span className="muted">{course.units} units</span></div>
              {course.carryover && <Badge text="Carryover" type="pending" />}
            </div>
          ))}
        </div>
        {carryoverCourses.length > 0 && <p className="carryover-note">{carryoverCourses.length} carryover course{carryoverCourses.length === 1 ? '' : 's'} included for your attention.</p>}
      </Card>
    </>
  );
}
