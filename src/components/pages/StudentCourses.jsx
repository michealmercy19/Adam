import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Badge, Pill, Card, Button } from '../common/UI.jsx';

const studentId = 'FUNAAB/IT/24/001';
const department = 'Information Technology';
const session = '2026/2027';
const semester = 'First';

export default function StudentCourses() {
  const { courseOfferings, studentCourseSelections, setStudentCourseSelections, courseFormSubmissions, setCourseFormSubmissions } = useContext(AppContext);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const selectedIds = studentCourseSelections[studentId] || [];
  const courses = useMemo(
    () => courseOfferings.filter((course) => course.linkedDepartments?.includes(department) && course.session === session && course.semester === semester),
    [courseOfferings],
  );

  const saveSelections = (nextIds) => {
    setStudentCourseSelections((current) => ({ ...current, [studentId]: nextIds }));
    setMessage('Your course declaration is saved and shared with your department HOC.');
  };

  const toggleCourse = (courseId) => {
    const nextIds = selectedIds.includes(courseId)
      ? selectedIds.filter((id) => id !== courseId)
      : [...selectedIds, courseId];
    saveSelections(nextIds);
  };

  const processCourseForm = (file) => {
    if (!file) return;
    const supportedFile = file.type === 'text/plain' || file.type === 'text/csv' || /\.(txt|csv)$/i.test(file.name);
    if (!supportedFile) {
      setMessage('Please upload a TXT or CSV course form.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const uploadedCodes = String(reader.result).toUpperCase().match(/[A-Z]{2,5}\s?\d{3}/g) || [];
      const documentText = String(reader.result).trim().slice(0, 1200);
      const matchedIds = courses
        .filter((course) => uploadedCodes.includes(course.code.toUpperCase()))
        .map((course) => course.id);
      saveSelections(matchedIds);
      setCourseFormSubmissions((current) => [{
        id: Date.now(),
        studentId,
        studentName: 'Adebayo Daniel',
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        matchedCourseIds: matchedIds,
        documentText,
        status: 'pending',
      }, ...current.filter((submission) => submission.studentId !== studentId)]);
      setMessage(matchedIds.length ? `${matchedIds.length} published course${matchedIds.length === 1 ? '' : 's'} matched from your upload.` : 'No published course codes matched this file.');
    };
    reader.readAsText(file);
  };

  const uploadCourseList = (event) => {
    processCourseForm(event.target.files[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processCourseForm(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const selectedCourses = courses.filter((course) => selectedIds.includes(course.id));
  const carryovers = selectedCourses.filter((course) => course.carryover);
  const latestSubmission = courseFormSubmissions.find((submission) => submission.studentId === studentId);

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>My Course Declaration</h1>
          <p>Select or upload the courses you are taking this semester</p>
        </div>
        <Pill text={`${selectedCourses.length} selected`} />
      </div>

      <div className="notice verification-banner">
        <div><strong>Connected to HOC publishing</strong><p>Only courses published for your department can be declared. Your HOC sees updates instantly.</p></div>
        <Badge text="Live sync" type="good" />
      </div>

      <div className="two section">
        <Card>
          <h3>Declare your courses</h3>
          <p className="muted">Tick every course you are offering. Carryover courses are highlighted for review.</p>
          <div className="declaration-list">
            {courses.map((course) => (
              <label className={`declaration-row ${selectedIds.includes(course.id) ? 'selected' : ''}`} key={course.id}>
                <input type="checkbox" checked={selectedIds.includes(course.id)} onChange={() => toggleCourse(course.id)} />
                <span><b>{course.code} · {course.title}</b><small>{course.units} units · {course.carryover ? 'Carryover option' : 'Current course'}</small></span>
                {course.carryover && <Badge text="Carryover" type="pending" />}
              </label>
            ))}
          </div>
          {message && <p className="form-message muted">{message}</p>}
        </Card>

        <Card>
          <h3>Upload course list</h3>
          <p className="muted">Upload a TXT, CSV, or result slip containing course codes. ADAM matches it against your HOC’s published list.</p>
          <label className={`upload-box ${isDragging ? 'dragging' : ''}`} onDragOver={handleDragOver} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
            <input type="file" accept=".txt,.csv" onChange={uploadCourseList} />
            <strong>{isDragging ? 'Drop course form here' : 'Choose or drop course document'}</strong>
            <span>TXT or CSV · Codes such as ICT 201 and ICT 214 are matched automatically</span>
          </label>
          <div className="declaration-summary">
            <div><span>Declared</span><b>{selectedCourses.length}</b></div>
            <div><span>Carryover</span><b>{carryovers.length}</b></div>
            <div><span>HOC review</span><Badge text={latestSubmission?.status === 'accepted' ? 'Accepted' : latestSubmission?.status === 'rejected' ? 'Rejected' : 'Pending'} type={latestSubmission?.status === 'accepted' ? 'good' : latestSubmission?.status === 'rejected' ? 'danger' : 'pending'} /></div>
          </div>
          {latestSubmission && <p className="submission-status"><b>{latestSubmission.fileName}</b><br />Uploaded {new Date(latestSubmission.uploadedAt).toLocaleString()} · {latestSubmission.status === 'pending' ? 'Waiting for HOC review.' : `Form ${latestSubmission.status} by ${latestSubmission.reviewedBy || 'HOC'}.`}</p>}
          <p className="muted">Your declaration is evidence for HOC review. Final carryover approval should be confirmed against official results.</p>
        </Card>
      </div>
    </>
  );
}
