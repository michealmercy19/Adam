import React, { useContext } from 'react';
import { Card, Button, Grid } from '../common/UI.jsx';
import { AppContext } from '../../context/AppContext.jsx';

export default function LecturerReports() {
  const { courseOfferings, lecturerAssignments, studentCourseSelections } = useContext(AppContext);
  const assignedIds = lecturerAssignments['lecturer-001'] || [];
  const assignedCourses = courseOfferings.filter((course) => assignedIds.includes(course.id));
  const enrolledCount = (courseId) => Object.values(studentCourseSelections).filter((courseIds) => courseIds.includes(courseId)).length;
  const handleDownload = () => {
    const csv =
      `Course,Department,Enrolled\n${assignedCourses.map((course) => `${course.code},${course.department},${enrolledCount(course.id)}`).join('\n')}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'ADAM_Attendance_Report.csv';
    a.click();
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Attendance Reports</h1>
          <p>Export completed records for your assigned courses</p>
        </div>
      </div>

      <Card>
        <div className="actions">
          <Button type="primary" onClick={handleDownload}>
            Download Spreadsheet
          </Button>
          <Button type="ghost" onClick={() => window.print()}>
            Export / Save PDF
          </Button>
        </div>
      </Card>

      <Grid cols={4}>
        <Card className="section">
          <div className="muted">Enrolled</div>
          <div className="metric">{assignedCourses.reduce((total, course) => total + enrolledCount(course.id), 0)}</div>
          <div className="muted">Enrolled students</div>
        </Card>
        <Card>
          <div className="muted">On Time</div>
          <div className="metric">58</div>
        </Card>
        <Card>
          <div className="muted">Late</div>
          <div className="metric">6</div>
        </Card>
        <Card>
          <div className="muted">Absent</div>
          <div className="metric">8</div>
        </Card>
      </Grid>
    </>
  );
}
