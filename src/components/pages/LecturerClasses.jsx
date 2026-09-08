import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Badge, Pill, Card, Button } from '../common/UI.jsx';

const lecturerId = 'lecturer-001';
const lecturerName = 'Dr. Adewale James';
export default function LecturerClasses() {
  const { userProfile, courseOfferings, lecturerAssignments, setLecturerAssignments, setCurrentPage } = useContext(AppContext);
  const [message, setMessage] = useState('');
  const lecturerDepartment = userProfile?.department || '';
  const availableCourses = useMemo(
    () => courseOfferings.filter((course) => course.linkedDepartments?.includes(lecturerDepartment) && course.verified),
    [courseOfferings],
  );
  const assignedIds = lecturerAssignments[lecturerId] || [];

  const toggleAssignment = (courseId) => {
    const nextIds = assignedIds.includes(courseId)
      ? assignedIds.filter((id) => id !== courseId)
      : [...assignedIds, courseId];
    setLecturerAssignments((current) => ({ ...current, [lecturerId]: nextIds }));
    setMessage('Your teaching list is updated for every connected user.');
  };

  const lecturersOnCourse = (courseId) => Object.values(lecturerAssignments).filter((ids) => ids.includes(courseId)).length;

  const shareCourseList = async () => {
    const selectedCourses = availableCourses.filter((course) => assignedIds.includes(course.id));
    const shareText = `ADAM teaching workspace: ${selectedCourses.map((course) => course.code).join(', ') || 'No courses selected'}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setMessage('Teaching list copied. Send it to your co-lecturers so they can select the same courses.');
    } catch {
      setMessage('Select courses above to share the same teaching workspace with co-lecturers.');
    }
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>My Classes</h1>
          <p>Choose verified courses and share teaching access</p>
        </div>
        <Pill text={`${assignedIds.length} assigned`} />
      </div>

      <div className="notice verification-banner">
        <div><strong>Live teaching assignments</strong><p>More than one lecturer can select the same course. Everyone assigned can host sessions and view its attendance.</p></div>
        <Badge text="Shared workspace" type="good" />
      </div>

      <Card className="section">
        <div className="list-heading"><div><h3>Choose your teaching load</h3><p className="muted">Select every course you are taking this semester.</p></div><Badge text="Semester setup" /></div>
        <p className="muted">Courses published by your department or linked to it by another HOC.</p>
        <div className="declaration-list">
          {availableCourses.map((course) => (
            <label className={`declaration-row ${assignedIds.includes(course.id) ? 'selected' : ''}`} key={course.id}>
              <input type="checkbox" checked={assignedIds.includes(course.id)} onChange={() => toggleAssignment(course.id)} />
              <span><b>{course.code} · {course.title}</b><small>{course.units} units · {lecturersOnCourse(course.id)} lecturer{lecturersOnCourse(course.id) === 1 ? '' : 's'} assigned · {course.department}</small></span>
              {assignedIds.includes(course.id) && <Badge text="You teach this" type="good" />}
            </label>
          ))}
        </div>
        {message && <p className="form-message muted">{message}</p>}
      </Card>
      <Card className="section shared-access-card"><div className="list-heading"><div><h3>Shared teaching workspace</h3><p className="muted">{assignedIds.length ? `${assignedIds.length} course${assignedIds.length === 1 ? '' : 's'} selected for ${lecturerName}. Co-lecturers can select the same course and share attendance access.` : 'Select a course above to create a shared teaching workspace.'}</p></div><Badge text="Live sync" type="good" /></div><div className="actions"><Button type="primary" onClick={shareCourseList}>Share course list</Button><Button type="ghost" onClick={() => setCurrentPage('l-host')}>Open Host Setup</Button></div></Card>
    </>
  );
}
