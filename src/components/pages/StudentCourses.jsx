import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Badge, Pill, Card, Button } from '../common/UI.jsx';
import { isCourseLevelMatch } from '../../utils/courseRules.js';

const studentId = 'FUNAAB/IT/24/001';
const session = '2026/2027';
const semester = 'First';

export default function StudentCourses() {
  const { userProfile, courseOfferings, studentCourseSelections, setStudentCourseSelections, courseFormSubmissions, setCourseFormSubmissions, setNotifications, hocCourseSelections } = useContext(AppContext);
  const department = userProfile?.department || 'Information Technology';
  const level = userProfile?.level || '100 Level';
  const isFirstLevel = /^100\s*Level$/i.test(level.trim());
  const [message, setMessage] = useState('');
  const [hasCarryover, setHasCarryover] = useState(false);
  const [carryoverCourseId, setCarryoverCourseId] = useState('');
  const [carryoverSearch, setCarryoverSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState({ isSaving: false, lastSavedAt: null });
  const activeStudentId = userProfile?.id || studentId;
  const selectedIds = studentCourseSelections[activeStudentId] || [];
  const acceptedCarryoverIds = useMemo(
    () => new Set(courseFormSubmissions.filter((submission) => submission.studentId === activeStudentId && submission.type === 'carryover' && submission.status === 'accepted').flatMap((submission) => (submission.matchedCourseIds || []).map((courseId) => String(courseId)))),
    [activeStudentId, courseFormSubmissions],
  );
  const courses = useMemo(
    () => courseOfferings.filter((course) => {
      const hocKey = `${department}::${level}`;
      const finalizedByDepartment = hocCourseSelections[hocKey]?.finalizedAt && hocCourseSelections[hocKey].courseIds.includes(course.id);
      const isOwnCourse = finalizedByDepartment && course.level === level && isCourseLevelMatch(course, level);
      const isApprovedExternalCarryover = !isFirstLevel && course.carryover && acceptedCarryoverIds.has(String(course.id));
      return (isOwnCourse || isApprovedExternalCarryover) && course.session === session && course.semester === semester && course.verified && `${course.code} ${course.title} ${course.department} ${course.level}`.toLowerCase().includes(courseSearch.toLowerCase());
    }),
    [acceptedCarryoverIds, courseOfferings, courseSearch, department, hocCourseSelections, isFirstLevel, level],
  );

  const saveSelections = (nextIds) => {
    setStudentCourseSelections((current) => ({ ...current, [activeStudentId]: nextIds }));
    setMessage('Your course declaration is being saved automatically and shared with your department HOC.');
  };

  useEffect(() => {
    if (!activeStudentId) return;

    setAutoSaveStatus((current) => ({ ...current, isSaving: true }));

    const timer = window.setTimeout(() => {
      setAutoSaveStatus({ isSaving: false, lastSavedAt: new Date() });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [selectedIds, activeStudentId]);

  const toggleCourse = (courseId) => {
    const nextIds = selectedIds.includes(courseId)
      ? selectedIds.filter((id) => id !== courseId)
      : [...selectedIds, courseId];
    saveSelections(nextIds);
  };

  const requestCarryover = (event) => {
    event.preventDefault();
    const carryoverCourse = courseOfferings.find((course) => String(course.id) === carryoverCourseId && course.carryover && course.verified);
    if (!carryoverCourse) {
      setMessage('Select a published carryover course so ADAM can route it to the correct HOC.');
      return;
    }

    setCourseFormSubmissions((current) => [{
      id: Date.now() + 1,
      type: 'carryover',
      studentId: activeStudentId,
      studentName: userProfile?.name || 'Student',
      fileName: `${carryoverCourse.code} carryover request`,
      uploadedAt: new Date().toISOString(),
      matchedCourseIds: [carryoverCourse.id],
      studentDepartment: department,
      documentText: `${carryoverCourse.code} · ${carryoverCourse.title}\nStudent department: ${department}\nOffering department: ${carryoverCourse.department}\nOriginal course level: ${carryoverCourse.level}`,
      status: 'pending',
    }, ...current.filter((submission) => !(submission.type === 'carryover' && submission.studentId === activeStudentId && submission.matchedCourseIds.includes(carryoverCourse.id) && submission.status === 'pending'))]);
    setNotifications((current) => [{
      id: `carryover-request-${Date.now()}`,
      audienceRole: 'hoc',
      audienceDepartment: carryoverCourse.department,
      title: 'New carryover request',
      message: `${userProfile?.name || 'A student'} requested ${carryoverCourse.code} for review.`,
      type: 'info',
      createdAt: new Date().toISOString(),
    }, ...current]);
    setMessage(`Carryover request sent to ${carryoverCourse.department} HOC for review.`);
    setCarryoverCourseId('');
  };

  const selectCarryoverCourse = (course) => {
    setCarryoverCourseId(String(course.id));
    setCarryoverSearch(`${course.code} · ${course.title}`);
  };

  const selectedCourses = courses.filter((course) => selectedIds.includes(course.id));
  const isExternalCarryover = (course) => !isFirstLevel && course.carryover && (course.department !== department || course.level !== level);
  const carryovers = selectedCourses.filter(isExternalCarryover);
  const carryoverCourses = courseOfferings.filter((course) => course.carryover && course.verified && `${course.code} ${course.title} ${course.department} ${course.level}`.toLowerCase().includes(carryoverSearch.toLowerCase()));
  const latestSubmission = courseFormSubmissions.find((submission) => submission.studentId === activeStudentId);

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>My Course Declaration</h1>
          <p>Select the courses published for your department and level</p>
        </div>
        <Pill text={`${selectedCourses.length} selected`} />
      </div>

      <div className="notice verification-banner">
        <div>
          <strong>Auto-save enabled</strong>
          <p>
            {autoSaveStatus.isSaving
              ? 'Saving your declaration…'
              : autoSaveStatus.lastSavedAt
                ? `Saved automatically at ${autoSaveStatus.lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                : 'Changes are saved automatically as you select courses.'}
          </p>
        </div>
        <Badge text={autoSaveStatus.isSaving ? 'Saving...' : 'Saved'} type={autoSaveStatus.isSaving ? 'pending' : 'good'} />
      </div>

      <div className={`two section ${isFirstLevel ? 'first-level-course-layout' : ''}`}>
        {!isFirstLevel && <Card>
          <h3>Do you have a carryover?</h3>
          <label className="checkrow carryover-toggle"><input type="checkbox" checked={hasCarryover} onChange={(event) => setHasCarryover(event.target.checked)} /><span><b>Yes, I have a carryover course</b><small>Choose from courses already published by an HOC. ADAM sends the request to the owning department automatically.</small></span></label>
          {hasCarryover && <form className="hoc-form" onSubmit={requestCarryover}>
            <div className="field"><label htmlFor="carryover-search">Search carryover courses</label><input id="carryover-search" value={carryoverSearch} onChange={(event) => { setCarryoverSearch(event.target.value); setCarryoverCourseId(''); }} placeholder="Type a course code or title" /></div>
            <div className="carryover-preview" aria-live="polite">
              <span className="muted">{carryoverSearch ? 'Matching courses' : 'Start typing to preview courses'}</span>
              {carryoverSearch && carryoverCourses.map((course) => (
                <button className={`carryover-preview-row ${String(course.id) === carryoverCourseId ? 'selected' : ''}`} type="button" key={course.id} onClick={() => selectCarryoverCourse(course)}>
                  <strong>{course.code} · {course.title}</strong>
                  <small>Owned by {course.department} · {course.level}</small>
                </button>
              ))}
              {carryoverSearch && !carryoverCourses.length && <small className="muted">No carryover course matches that search.</small>}
            </div>
            {carryoverCourseId && <p className="route-note">Selected course: <b>{carryoverCourses.find((course) => String(course.id) === carryoverCourseId)?.code || 'Course'}</b></p>}
            <p className="route-note">All verified carryover courses published by any HOC are available. The request goes to the HOC for the course-owning department.</p>
            <Button type="primary" disabled={!carryoverCourseId}>Request carryover approval</Button>
          </form>}
        </Card>}

        <Card>
          <h3>Declare your courses</h3>
            <p className="muted">Showing verified {level} courses for {department}. Current course codes must start with {level.charAt(0)}.</p>
          <div className="field"><label htmlFor="course-search">Search your eligible course catalogue</label><input id="course-search" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Search by code, title, department, or level" /></div>
          <div className="declaration-list">
            {courses.map((course) => (
              <label className={`declaration-row ${selectedIds.includes(course.id) ? 'selected' : ''}`} key={course.id}>
                <input type="checkbox" checked={selectedIds.includes(course.id)} onChange={() => toggleCourse(course.id)} />
                <span><b>{course.code} · {course.title}</b><small>{course.units} units · {course.department} · {course.level} · Current course</small></span>
              </label>
            ))}
          </div>
          <div className="notice verification-banner" style={{ marginTop: '12px' }}>
            <div>
              <strong>Declaration save</strong>
              <p>{autoSaveStatus.isSaving ? 'Your course choices are syncing to the department HOC.' : 'Your declaration is stored automatically and updates live.'}</p>
            </div>
            <Badge text={autoSaveStatus.isSaving ? 'Syncing' : 'Auto-saved'} type={autoSaveStatus.isSaving ? 'pending' : 'good'} />
          </div>
          {message && <p className="form-message muted">{message}</p>}
        </Card>

        <Card>
          <h3>Declaration summary</h3>
          <p className="muted">Your HOC publishes the catalogue. You only select the courses you are taking.</p>
          <div className="declaration-summary">
            <div><span>Declared</span><b>{selectedCourses.length}</b></div>
            {!isFirstLevel && <div><span>Carryover</span><b>{carryovers.length}</b></div>}
            <div><span>HOC review</span><Badge text={latestSubmission?.status === 'accepted' ? 'Accepted' : latestSubmission?.status === 'rejected' ? 'Rejected' : 'Pending'} type={latestSubmission?.status === 'accepted' ? 'good' : latestSubmission?.status === 'rejected' ? 'danger' : 'pending'} /></div>
          </div>
          {latestSubmission && <p className="submission-status"><b>{latestSubmission.fileName}</b><br />Uploaded {new Date(latestSubmission.uploadedAt).toLocaleString()} · {latestSubmission.status === 'pending' ? 'Waiting for HOC review.' : `Form ${latestSubmission.status} by ${latestSubmission.reviewedBy || 'HOC'}.`}</p>}
          <p className="muted">Your declaration is evidence for HOC review.</p>
        </Card>
      </div>
    </>
  );
}
