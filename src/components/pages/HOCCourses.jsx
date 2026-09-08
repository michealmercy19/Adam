import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Badge, Pill, Card, Button } from '../common/UI.jsx';
import { getCourseLevelNumber, getLevelNumber } from '../../utils/courseRules.js';

const currentSession = '2026/2027';
const currentSemester = 'First';

const getCourseOwner = (course) => `${course.department} · ${course.level}`;

export default function HOCCourses() {
  const { currentRole, userProfile, courseOfferings, setCourseOfferings, studentCourseSelections, courseFormSubmissions, setCourseFormSubmissions, setNotifications, setCurrentPage, setActiveClass, activeClass, hocCourseSelections, setHocCourseSelections, coursePermissionRequests, setCoursePermissionRequests } = useContext(AppContext);
  const [now, setNow] = useState(Date.now());
  const hocDepartment = userProfile?.department || '';
  const hocLevel = userProfile?.level || '100 Level';
  const [form, setForm] = useState({ code: '', title: '', units: '3', carryover: false });
  const [hostForm, setHostForm] = useState({ courseId: '', manualCode: '', room: '', durationMinutes: '15', scheduleDate: '', scheduleTime: '', scheduleRoom: '' });
  const [message, setMessage] = useState('');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const hocKey = `${hocDepartment}::${hocLevel}`;
  const savedSelection = hocCourseSelections[hocKey] || { courseIds: [], finalizedAt: null };
  const draftCourseIds = savedSelection.finalizedAt ? savedSelection.courseIds : (savedSelection.draftCourseIds || savedSelection.courseIds || []);
  const departmentCourses = courseOfferings.filter((course) => (course.ownerDepartment === hocDepartment || course.department === hocDepartment || course.offeringDepartments?.includes(hocDepartment)) && course.level === hocLevel);
  const availableCourses = courseOfferings.filter((course) => course.level === hocLevel && course.session === currentSession && course.semester === currentSemester);
  const linkableCourses = availableCourses.filter((course) => course.ownerDepartment && course.ownerDepartment !== hocDepartment && !course.offeringDepartments?.includes(hocDepartment));
  const selectedDraftCourses = availableCourses.filter((course) => draftCourseIds.includes(course.id));
  const permissionRequests = coursePermissionRequests.filter((request) => request.requestingDepartment === hocDepartment && request.level === hocLevel);
  const incomingPermissionRequests = coursePermissionRequests.filter((request) => request.ownerDepartment === hocDepartment && request.level === hocLevel && request.status === 'pending');
  const verifiedCount = departmentCourses.filter((course) => course.verified).length;
  const carryoverCount = departmentCourses.filter((course) => course.carryover).length;
  const declaredCount = (courseId) => Object.values(studentCourseSelections).filter((courseIds) => courseIds.includes(courseId)).length;
  const pendingForms = courseFormSubmissions.filter((submission) => {
    if (submission.status !== 'pending') return false;
    if (submission.type !== 'carryover') return true;
    const requestedCourse = courseOfferings.find((course) => submission.matchedCourseIds.includes(course.id));
    return requestedCourse?.department === hocDepartment && requestedCourse?.level === hocLevel;
  });
  const departmentReadiness = departmentCourses.length ? Math.round((verifiedCount / departmentCourses.length) * 100) : 0;
  const hocOverviewCards = [
    { key: 'attendance', label: 'Attendance', value: `${departmentReadiness}%`, tone: 'blue' },
    { key: 'courses', label: 'Current courses', value: departmentCourses.length, tone: 'purple' },
    { key: 'classes', label: 'Pending reviews', value: pendingForms.length, tone: 'green' },
  ];

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

    const codeLevel = getCourseLevelNumber(form.code.trim());
    const levelNumber = getLevelNumber(hocLevel).charAt(0);
    if (!form.carryover && codeLevel && levelNumber && codeLevel !== levelNumber) {
      setMessage(`This course code is ${codeLevel}00-level and cannot be added to the ${hocLevel} catalogue. Current courses must start with ${levelNumber}. Carryover courses are allowed.`);
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
        ownerDepartment: hocDepartment,
        level: hocLevel,
        linkedDepartments: [hocDepartment],
        offeringDepartments: [hocDepartment],
        eligibleDepartments: [hocDepartment],
        carryover: form.carryover,
        verified: true,
        verifiedBy: `HOC · ${hocDepartment}`,
      },
    ]);
    setForm({ code: '', title: '', units: '3', carryover: false });
    setMessage('Course published and verified for student registration.');
  };

  const uploadCourses = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setMessage('Upload a CSV or TXT file with: course code, title, units.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result).split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      const imported = rows.map((row) => {
        const columns = row.split(/[,\t]/).map((column) => column.trim());
        const [code, title, units = '3'] = columns;
        return { code: code?.toUpperCase(), title, units: Number(units) || 3 };
      }).filter((course) => course.code && course.title && !/^course\s*code$/i.test(course.code));

      if (!imported.length) {
        setMessage('No courses found. Use one course per line: ICT 101, Course title, 3');
        return;
      }

      setCourseOfferings((courses) => {
        const existingCodes = new Set(courses.map((course) => course.code));
        const levelNumber = getLevelNumber(hocLevel).charAt(0);
        const invalidCourse = imported.find((course) => !course.carryover && getCourseLevelNumber(course.code) && getCourseLevelNumber(course.code) !== levelNumber);
        if (invalidCourse) {
          setMessage(`${invalidCourse.code} is a ${getCourseLevelNumber(invalidCourse.code)}00-level course. Upload only ${hocLevel} courses; carryover courses may be from another level.`);
          return courses;
        }
        const newCourses = imported.filter((course) => !existingCodes.has(course.code) && (!getCourseLevelNumber(course.code) || getCourseLevelNumber(course.code) === levelNumber || course.carryover)).map((course, index) => ({
          id: Date.now() + index,
          code: course.code,
          title: course.title,
          units: course.units,
          semester: currentSemester,
          session: currentSession,
          university: 'Federal University of Agriculture, Abeokuta',
          department: hocDepartment,
          level: hocLevel,
          linkedDepartments: [hocDepartment],
          eligibleDepartments: [hocDepartment],
          carryover: false,
          verified: true,
          verifiedBy: `HOC · ${hocDepartment}`,
        }));
        return [...courses, ...newCourses];
      });
      setMessage(`${imported.length} course${imported.length === 1 ? '' : 's'} uploaded for ${hocDepartment} · ${hocLevel}. Matching students will see them automatically.`);
    };
    reader.readAsText(file);
  };

  const linkCourse = (courseId) => {
    const course = courseOfferings.find((item) => item.id === courseId);
    if (!course || savedSelection.finalizedAt) return;
    if (permissionRequests.some((request) => request.courseId === courseId && request.status === 'pending')) {
      setMessage('A permission request for this course is already pending.');
      return;
    }
    setCoursePermissionRequests((current) => [...current, {
      id: `permission-${Date.now()}`,
      courseId,
      courseCode: course.code,
      courseTitle: course.title,
      ownerDepartment: course.ownerDepartment,
      requestingDepartment: hocDepartment,
      requestingHOC: userProfile?.name || 'HOC',
      level: hocLevel,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    }]);
    setMessage(`${course.code} permission request sent to the ${course.ownerDepartment} HOC.`);
  };

  const toggleDraftCourse = (courseId) => {
    if (savedSelection.finalizedAt) return;
    setHocCourseSelections((current) => {
      const existing = current[hocKey] || { courseIds: [], draftCourseIds: [] };
      const currentIds = existing.draftCourseIds || existing.courseIds || [];
      const nextIds = currentIds.includes(courseId) ? currentIds.filter((id) => id !== courseId) : [...currentIds, courseId];
      return { ...current, [hocKey]: { ...existing, draftCourseIds: nextIds } };
    });
  };

  const finalizeSelection = () => {
    setHocCourseSelections((current) => ({
      ...current,
      [hocKey]: { courseIds: draftCourseIds, draftCourseIds, finalizedAt: new Date().toISOString(), submittedBy: userProfile?.name || 'HOC' },
    }));
    setShowSaveConfirmation(false);
    setMessage('Course selection permanently submitted. Contact an administrator for changes.');
  };

  const reviewPermission = (requestId, status) => {
    setCoursePermissionRequests((current) => current.map((request) => request.id === requestId
      ? { ...request, status, reviewedBy: userProfile?.name || 'HOC', reviewedAt: new Date().toISOString() }
      : request));
    setNotifications((current) => [{
      id: `permission-review-${requestId}-${Date.now()}`,
      audienceRole: 'hoc',
      audienceDepartment: coursePermissionRequests.find((request) => request.id === requestId)?.requestingDepartment,
      title: `Course permission ${status}`,
      message: `${coursePermissionRequests.find((request) => request.id === requestId)?.courseCode || 'Course'} request was ${status} by ${hocDepartment}.`,
      type: status === 'approved' ? 'success' : 'info',
      createdAt: new Date().toISOString(),
    }, ...current]);
    setMessage(`Permission request ${status}.`);
  };

  const reviewForm = (submissionId, status) => {
    const submission = courseFormSubmissions.find((item) => item.id === submissionId);
    const requestedCourse = courseOfferings.find((course) => submission?.matchedCourseIds.includes(course.id));
    setCourseFormSubmissions((current) => current.map((item) => item.id === submissionId
      ? { ...item, status, reviewedBy: `HOC · ${hocDepartment}`, reviewedAt: new Date().toISOString() }
      : item));
    if (submission) {
      setNotifications((current) => [{
        id: `carryover-review-${submissionId}-${Date.now()}`,
        audienceRole: 'student',
        audienceId: submission.studentId,
        title: `Carryover request ${status}`,
        message: `${requestedCourse?.code || 'Your course'} was ${status} by HOC · ${hocDepartment}.`,
        type: status === 'accepted' ? 'success' : 'info',
        createdAt: new Date().toISOString(),
      }, ...current]);
    }
    if (submission?.type === 'carryover' && status === 'accepted') {
      setCourseOfferings((courses) => courses.map((course) => submission.matchedCourseIds.includes(course.id)
        ? { ...course, verified: true, approvalStatus: 'approved', eligibleDepartments: [...new Set([...(course.eligibleDepartments || []), submission.studentDepartment || course.department])] }
        : course));
    }
    setMessage(`Course request ${status}. ${requestedCourse ? `${requestedCourse.code} is owned by ${getCourseOwner(requestedCourse)}.` : ''}`);
  };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedHostCourse = courseOfferings.find((course) => course.id === Number(hostForm.courseId)) || courseOfferings.find((course) => course.code.toLowerCase() === hostForm.manualCode.trim().toLowerCase());
  const remainingMinutes = activeClass?.endsAt
    ? Math.max(0, Math.ceil((new Date(activeClass.endsAt).getTime() - now) / 60000))
    : null;
  const activeCountdownText = activeClass?.completedAt
    ? `Completed · clears in ${Math.max(1, Math.ceil((5 * 60 * 1000 - (Date.now() - new Date(activeClass.completedAt).getTime())) / 60000))} min`
    : remainingMinutes === null ? 'No active session' : `${remainingMinutes} min remaining`;

  if (currentRole !== 'hoc') {
    return <Card><h3>HOC workspace required</h3><p className="muted">Sign in as a verified HOC to manage department courses.</p></Card>;
  }

  const openHOCSession = (mode, date = '', time = '', venue = hostForm.room) => {
    if (!selectedHostCourse && !hostForm.manualCode.trim()) {
      setMessage('Select a course or enter a valid course code before opening an attendance session.');
      return;
    }

    const totalMinutes = Number(hostForm.durationMinutes) || 15;
    const courseValue = selectedHostCourse || { code: hostForm.manualCode.trim().toUpperCase(), title: 'Manual course', id: null };
    const endsAt = new Date(Date.now() + totalMinutes * 60000).toISOString();

    setActiveClass({
      courseId: courseValue.id || null,
      courseCode: courseValue.code,
      courseTitle: courseValue.title || 'Manual course',
      mode: mode === 'walk-in' ? 'physical' : 'physical',
      venue,
      date,
      time,
      startedAt: new Date().toISOString(),
      endsAt,
      durationMinutes: totalMinutes,
      sessionId: `hoc-session-${Date.now()}`,
      requiresBiometric: true,
      hostType: 'hoc',
      hostName: `${userProfile?.name || 'HOC'} · ${hocDepartment}`,
    });
    setCurrentPage('s-attendance');
    setMessage(`Attendance session opened for ${courseValue.code}. Students can clock in now.`);
  };

  const handleHOCStartWalkIn = () => {
    if (Number(hostForm.durationMinutes) <= 0 || Number(hostForm.durationMinutes) > 180) {
      setMessage('Attendance duration must be between 1 and 180 minutes.');
      return;
    }
    if (!hostForm.room.trim()) {
      setMessage('Add a venue before starting the attendance session.');
      return;
    }
    openHOCSession('walk-in');
  };

  const handleHOCSchedule = () => {
    if (!hostForm.scheduleDate || !hostForm.scheduleTime || !hostForm.scheduleRoom.trim()) {
      setMessage('Choose the date, time, and venue to schedule the attendance session.');
      return;
    }
    openHOCSession('scheduled', hostForm.scheduleDate, hostForm.scheduleTime, hostForm.scheduleRoom);
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Course Offerings</h1>
          <p>Publish the verified course list for your department</p>
        </div>
        <Pill text={`HOC · ${hocDepartment}`} />
      </div>

      <div className="notice verification-banner">
        <div>
          <strong>Verified department workspace</strong>
          <p>Courses remain owned by their offering department. Linked departments can still register eligible students.</p>
        </div>
        <Badge text="Access verified" type="good" />
      </div>

      <div className="grid section hoc-overview-grid">
        {hocOverviewCards.map((card, index) => (
          <Card key={card.key} className={`stat-card stat-card-${card.tone}`} style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="stat-head">
              <span className="muted">{card.label}</span>
              <span className="stat-indicator" aria-hidden="true" />
            </div>
            <div className="metric">{card.value}</div>
            <div className="stat-foot">
              <span>{card.key === 'attendance' ? 'Department health' : card.key === 'courses' ? 'Published' : 'Needs attention'}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid section course-metrics">
        <Card><div className="muted">Academic session</div><div className="metric">{currentSession}</div><div className="muted">{currentSemester} Semester</div></Card>
        <Card><div className="muted">Published courses</div><div className="metric">{departmentCourses.length}</div><div className="muted">{verifiedCount} verified</div></Card>
        <Card><div className="muted">Carryover options</div><div className="metric">{carryoverCount}</div><div className="muted">Visible to eligible students</div></Card>
      </div>

      <Card className="section hoc-selection-card">
        <div className="list-heading">
          <div><h3>Course selection for {hocLevel}</h3><p className="muted">Select only courses for your exact level. Course owners remain responsible for approval.</p></div>
          <Badge text={savedSelection.finalizedAt ? 'Finalized' : `${draftCourseIds.length} selected`} type={savedSelection.finalizedAt ? 'good' : 'pending'} />
        </div>
        <div className="selection-grid">
          {availableCourses.map((course) => {
            const isOwned = (course.ownerDepartment || course.department) === hocDepartment;
            const request = permissionRequests.find((item) => item.courseId === course.id);
            const selected = draftCourseIds.includes(course.id);
            return <label className={`selection-course ${selected ? 'selected' : ''} ${savedSelection.finalizedAt ? 'locked' : ''}`} key={course.id}>
              <input type="checkbox" checked={selected} disabled={Boolean(savedSelection.finalizedAt) || (!isOwned && request?.status !== 'approved')} onChange={() => toggleDraftCourse(course.id)} />
              <span><b>{course.code} · {course.title}</b><small>{course.units} units · Owner: {course.ownerDepartment || course.department} · {course.level}</small></span>
              {!isOwned && <Badge text={request?.status || 'Permission required'} type={request?.status === 'approved' ? 'good' : request?.status === 'rejected' ? 'danger' : 'pending'} />}
            </label>;
          })}
          {!availableCourses.length && <p className="muted">No courses are available for {hocDepartment} · {hocLevel} yet.</p>}
        </div>
        <div className="actions selection-actions">
          {!savedSelection.finalizedAt && <Button type="primary" disabled={!draftCourseIds.length} onClick={() => setShowSaveConfirmation(true)}>Save course selection</Button>}
          {savedSelection.finalizedAt && <p className="muted">Finalized {new Date(savedSelection.finalizedAt).toLocaleString()} by {savedSelection.submittedBy || 'HOC'}.</p>}
        </div>
      </Card>

      <div className="two section hoc-layout">
        <Card>
          <h3>Add a course</h3>
          <div className="connected-scope"><span>Connected department</span><strong>{hocDepartment}</strong><small>{hocLevel} · This workspace is restricted to your verified level.</small></div>
          <p className="muted">Courses published here belong to this department and level. Other HOCs may link matching courses for their eligible programmes.</p>
          <label className="upload-box compact-upload">
            <input type="file" accept=".csv,.txt" onChange={uploadCourses} />
            <strong>Upload {hocLevel} courses</strong>
            <span>CSV or TXT: course code, title, units</span>
          </label>
          <form className="hoc-form" onSubmit={addCourse}>
            <div className="formgrid">
              <div className="field"><label htmlFor="course-code">Course code</label><input id="course-code" name="code" value={form.code} onChange={updateForm} placeholder="e.g. ICT 320" /></div>
              <div className="field"><label htmlFor="course-units">Units</label><select id="course-units" name="units" value={form.units} onChange={updateForm}><option value="1">1 unit</option><option value="2">2 units</option><option value="3">3 units</option><option value="4">4 units</option></select></div>
            </div>
            <div className="field"><label htmlFor="course-title">Course title</label><input id="course-title" name="title" value={form.title} onChange={updateForm} placeholder="e.g. Web Application Security" /></div>
            <label className="checkrow"><input type="checkbox" name="carryover" checked={form.carryover} onChange={updateForm} /><span><b>Carryover course</b><small>Show this course to students who need to retake it.</small></span></label>
            <Button type="primary">Publish course</Button>
          </form>
        </Card>

        <Card>
          <h3>Open attendance session</h3>
          <p className="muted">When it is time for class, start the session for your department and students can clock in immediately.</p>
          <div className="field">
            <label>Course</label>
            <select value={hostForm.courseId} onChange={(event) => { setHostForm((current) => ({ ...current, courseId: event.target.value, manualCode: '' })); }}>
              <option value="">Select a published course</option>
              {departmentCourses.map((course) => <option key={course.id} value={course.id}>{course.code} — {course.title}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Or enter course code</label>
            <input value={hostForm.manualCode} onChange={(event) => setHostForm((current) => ({ ...current, manualCode: event.target.value, courseId: '' }))} placeholder="e.g. ICT 201" />
          </div>
          <div className="field"><label>Venue</label><input value={hostForm.room} onChange={(event) => setHostForm((current) => ({ ...current, room: event.target.value }))} placeholder="ICT Hall 2" /></div>
          <div className="field">
            <label>Attendance duration (minutes)</label>
            <input type="number" min="1" max="180" value={hostForm.durationMinutes} onChange={(event) => setHostForm((current) => ({ ...current, durationMinutes: event.target.value }))} placeholder="15" />
          </div>
          <div className="actions">
            <Button type="primary" onClick={handleHOCStartWalkIn}>Start walk-in</Button>
          </div>
          <div className="field"><label>Date</label><input type="date" value={hostForm.scheduleDate} onChange={(event) => setHostForm((current) => ({ ...current, scheduleDate: event.target.value }))} /></div>
          <div className="field"><label>Time</label><input type="time" value={hostForm.scheduleTime} onChange={(event) => setHostForm((current) => ({ ...current, scheduleTime: event.target.value }))} /></div>
          <div className="field"><label>Scheduled venue</label><input value={hostForm.scheduleRoom} onChange={(event) => setHostForm((current) => ({ ...current, scheduleRoom: event.target.value }))} placeholder="ICT 4" /></div>
          <div className="actions">
            <Button type="ghost" onClick={handleHOCSchedule}>Schedule class</Button>
          </div>
        </Card>
      </div>

      {activeClass && (
        <Card className="section">
          <div className="list-heading">
            <div>
              <h3>Active attendance session</h3>
              <p className="muted">{activeClass.courseCode} · {activeClass.courseTitle}</p>
            </div>
            <Badge text={activeCountdownText} type={activeClass.completedAt ? 'pending' : 'good'} />
          </div>
          <div className="actions">
            <Button type="danger" disabled={Boolean(activeClass.completedAt)} onClick={() => setActiveClass((current) => ({ ...current, status: 'stopped', completedAt: new Date().toISOString() }))}>Stop attendance</Button>
          </div>
        </Card>
      )}

      <Card className="section">
        <div className="list-heading"><div><h3>Student-facing list</h3><p className="muted">{currentSemester} Semester · {currentSession}</p></div><Badge text="Live" type="good" /></div>
        <div className="course-list">
          {departmentCourses.map((course) => (
            <div className="course-entry" key={course.id}>
              <div><b>{course.code} · {course.title}</b><span className="muted">{course.units} units · {declaredCount(course.id)} student{declaredCount(course.id) === 1 ? '' : 's'} declared · {course.verifiedBy}</span></div>
              <div className="course-tags">{course.carryover && <Badge text="Carryover" type="pending" />}<Badge text="Verified" type="good" /></div>
            </div>
          ))}
        </div>
      </Card>

      {message && <div className="section notice verification-banner"><div><strong>Status</strong><p>{message}</p></div></div>}

      {linkableCourses.length > 0 && <Card className="section"><h3>Cross-department permissions</h3><p className="muted">Request approval from the owning department before offering a shared course.</p>{linkableCourses.map((course) => { const request = permissionRequests.find((item) => item.courseId === course.id); return <div className="course-entry" key={course.id}><div><b>{course.code} · {course.title}</b><span className="muted">Owned by {course.ownerDepartment || course.department} · {course.units} units · {course.level}</span></div><Button type="ghost" disabled={Boolean(request)} onClick={() => linkCourse(course.id)}>{request?.status || 'Request permission'}</Button></div>; })}</Card>}
      {incomingPermissionRequests.length > 0 && <Card className="section"><div className="list-heading"><div><h3>Incoming course permissions</h3><p className="muted">You own these courses. Approve another department's request before it can be finalized.</p></div><Badge text={`${incomingPermissionRequests.length} pending`} type="pending" /></div>{incomingPermissionRequests.map((request) => <div className="review-row" key={request.id}><div><b>{request.courseCode} · {request.courseTitle}</b><span className="muted">{request.requestingDepartment} HOC · {request.level} · Requested by {request.requestingHOC}</span></div><div className="actions"><Button type="primary" onClick={() => reviewPermission(request.id, 'approved')}>Approve</Button><Button type="danger" onClick={() => reviewPermission(request.id, 'rejected')}>Reject</Button></div></div>)}</Card>}
      <Card className="section"><div className="list-heading"><div><h3>Course request review</h3><p className="muted">Review student course forms and carryover requests before approval.</p></div><Badge text={`${pendingForms.length} pending`} type={pendingForms.length ? 'pending' : 'good'} /></div>{pendingForms.length ? pendingForms.map((submission) => <div className="review-row" key={submission.id}><div><b>{submission.studentName}</b><span className="muted">{submission.type === 'carryover' ? 'Carryover request' : 'Course form'} · {submission.matchedCourseIds.length} matched course{submission.matchedCourseIds.length === 1 ? '' : 's'} · {new Date(submission.uploadedAt).toLocaleString()}</span>{submission.documentText && <details className="document-preview"><summary>Review extracted document</summary><pre>{submission.documentText}</pre></details>}</div><div className="actions"><Button type="primary" onClick={() => reviewForm(submission.id, 'accepted')}>Approve</Button><Button type="danger" onClick={() => reviewForm(submission.id, 'rejected')}>Reject</Button></div></div>) : <p className="muted">No student requests are waiting for review.</p>}</Card>
      {showSaveConfirmation && <div className="confirmation-overlay" role="presentation"><div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="save-selection-title"><h3 id="save-selection-title">Are you sure you want to save these courses?</h3><p className="muted">Once you save, you will no longer be able to edit your course selection.</p><div className="actions"><Button type="ghost" onClick={() => setShowSaveConfirmation(false)}>Cancel</Button><Button type="primary" onClick={finalizeSelection}>Yes, Save Courses</Button></div></div></div>}
    </>
  );
}
