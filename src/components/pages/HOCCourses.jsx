import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Badge, Pill, Card, Button } from '../common/UI.jsx';

const hocDepartment = 'Information Technology';
const currentSession = '2026/2027';
const currentSemester = 'First';

export default function HOCCourses() {
  const { currentRole, courseOfferings, setCourseOfferings, studentCourseSelections, courseFormSubmissions, setCourseFormSubmissions } = useContext(AppContext);
  const [form, setForm] = useState({ code: '', title: '', units: '3', level: '200 Level', carryover: false });
  const [message, setMessage] = useState('');

  if (currentRole !== 'hoc') {
    return (
      <Card>
        <h3>HOC access required</h3>
        <p className="muted">This workspace is restricted to verified Heads of Class.</p>
      </Card>
    );
  }

  const departmentCourses = courseOfferings.filter((course) => course.linkedDepartments?.includes(hocDepartment));
  const linkableCourses = courseOfferings.filter((course) => !course.linkedDepartments?.includes(hocDepartment));
  const verifiedCount = departmentCourses.filter((course) => course.verified).length;
  const carryoverCount = departmentCourses.filter((course) => course.carryover).length;
  const declaredCount = (courseId) => Object.values(studentCourseSelections).filter((courseIds) => courseIds.includes(courseId)).length;
  const pendingForms = courseFormSubmissions.filter((submission) => submission.status === 'pending');

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const addCourse = (event) => {
    event.preventDefault();
    if (!form.code.trim() || !form.title.trim()) {
      setMessage('Course code and title are required.');
      return;
    }

    const duplicate = departmentCourses.some(
      (course) => course.code.toLowerCase() === form.code.trim().toLowerCase(),
    );
    if (duplicate) {
      setMessage('That course code is already listed for this semester.');
      return;
    }

    setCourseOfferings((courses) => [
      ...courses,
      {
        id: Date.now(),
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        units: Number(form.units),
        semester: currentSemester,
        session: currentSession,
        department: hocDepartment,
        level: form.level,
        linkedDepartments: [hocDepartment],
        carryover: form.carryover,
        verified: true,
        verifiedBy: `HOC · ${hocDepartment}`,
      },
    ]);
    setForm({ code: '', title: '', units: '3', level: '200 Level', carryover: false });
    setMessage('Course published and verified for student registration.');
  };

  const linkCourse = (courseId) => {
    setCourseOfferings((courses) => courses.map((course) => course.id === courseId
      ? { ...course, linkedDepartments: [...(course.linkedDepartments || []), hocDepartment], verifiedBy: `${course.verifiedBy} + ${hocDepartment} link` }
      : course));
    setMessage('Course linked to your department. Students and lecturers can see it now.');
  };

  const reviewForm = (submissionId, status) => {
    setCourseFormSubmissions((current) => current.map((submission) => submission.id === submissionId
      ? { ...submission, status, reviewedBy: `HOC · ${hocDepartment}`, reviewedAt: new Date().toISOString() }
      : submission));
    setMessage(`Course form ${status}. The student will see the decision immediately.`);
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Course Offerings</h1>
          <p>Publish the verified course list for your department</p>
        </div>
        <Pill text="HOC · IT" />
      </div>

      <div className="notice verification-banner">
        <div>
          <strong>Verified HOC workspace</strong>
          <p>Every published course is stamped with your department, session, and semester.</p>
        </div>
        <Badge text="Access verified" type="good" />
      </div>

      <div className="grid section course-metrics">
        <Card><div className="muted">Session</div><div className="metric">{currentSession}</div><div className="muted">{currentSemester} semester</div></Card>
        <Card><div className="muted">Published courses</div><div className="metric">{departmentCourses.length}</div><div className="muted">{verifiedCount} verified</div></Card>
        <Card><div className="muted">Carryover options</div><div className="metric">{carryoverCount}</div><div className="muted">Visible to eligible students</div></Card>
      </div>

      <div className="two section hoc-layout">
        <Card>
          <h3>Add a course</h3>
          <p className="muted">This entry will be available to Information Technology students.</p>
          <form className="hoc-form" onSubmit={addCourse}>
            <div className="formgrid">
              <div className="field"><label htmlFor="course-code">Course code</label><input id="course-code" name="code" value={form.code} onChange={updateForm} placeholder="e.g. ICT 320" /></div>
              <div className="field"><label htmlFor="course-units">Units</label><select id="course-units" name="units" value={form.units} onChange={updateForm}><option value="1">1 unit</option><option value="2">2 units</option><option value="3">3 units</option><option value="4">4 units</option></select></div>
            </div>
            <div className="field"><label htmlFor="course-level">Level</label><select id="course-level" name="level" value={form.level} onChange={updateForm}><option>100 Level</option><option>200 Level</option><option>300 Level</option><option>400 Level</option></select></div>
            <div className="field"><label htmlFor="course-title">Course title</label><input id="course-title" name="title" value={form.title} onChange={updateForm} placeholder="e.g. Web Application Security" /></div>
            <label className="checkrow"><input type="checkbox" name="carryover" checked={form.carryover} onChange={updateForm} /><span><b>Carryover course</b><small>Show this course to students who need to retake it.</small></span></label>
            <Button type="primary">Publish course</Button>
            {message && <p className="form-message muted">{message}</p>}
          </form>
        </Card>

        <Card>
          <div className="list-heading"><div><h3>Student-facing list</h3><p className="muted">{currentSemester} semester · {currentSession}</p></div><Badge text="Live" type="good" /></div>
          <div className="course-list">
            {departmentCourses.map((course) => (
              <div className="course-entry" key={course.id}>
                <div><b>{course.code} · {course.title}</b><span className="muted">{course.units} units · {declaredCount(course.id)} student{declaredCount(course.id) === 1 ? '' : 's'} declared · {course.verifiedBy}</span></div>
                <div className="course-tags">{course.carryover && <Badge text="Carryover" type="pending" />}<Badge text="Verified" type="good" /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {linkableCourses.length > 0 && <Card className="section"><h3>Courses from other departments</h3><p className="muted">Link a cross-department course so your students and lecturers can access it.</p>{linkableCourses.map((course) => <div className="course-entry" key={course.id}><div><b>{course.code} · {course.title}</b><span className="muted">Owned by {course.department} · {course.units} units</span></div><Button type="ghost" onClick={() => linkCourse(course.id)}>Link to IT</Button></div>)}</Card>}
      <Card className="section"><div className="list-heading"><div><h3>Course form review</h3><p className="muted">Review uploaded course forms before accepting a student declaration.</p></div><Badge text={`${pendingForms.length} pending`} type={pendingForms.length ? 'pending' : 'good'} /></div>{pendingForms.length ? pendingForms.map((submission) => <div className="review-row" key={submission.id}><div><b>{submission.studentName}</b><span className="muted">{submission.fileName} · {submission.matchedCourseIds.length} matched course{submission.matchedCourseIds.length === 1 ? '' : 's'} · {new Date(submission.uploadedAt).toLocaleString()}</span>{submission.documentText && <details className="document-preview"><summary>Review extracted document</summary><pre>{submission.documentText}</pre></details>}</div><div className="actions"><Button type="primary" onClick={() => reviewForm(submission.id, 'accepted')}>Accept</Button><Button type="danger" onClick={() => reviewForm(submission.id, 'rejected')}>Reject</Button></div></div>) : <p className="muted">No uploaded forms are waiting for review.</p>}</Card>
    </>
  );
}
