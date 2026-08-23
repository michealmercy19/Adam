import React, { useContext, useState } from 'react';
import { Pill, Card, Button } from '../common/UI.jsx';
import { AppContext } from '../../context/AppContext.jsx';

export default function LecturerHost() {
  const { courseOfferings, lecturerAssignments, setCurrentPage, setActiveClass } = useContext(AppContext);
  const assignedIds = lecturerAssignments['lecturer-001'] || [];
  const assignedCourses = courseOfferings.filter((item) => assignedIds.includes(item.id));
  const [level, setLevel] = useState('All levels');
  const [department, setDepartment] = useState('All departments');
  const [courseId, setCourseId] = useState(assignedIds[0] || '');
  const [manualCode, setManualCode] = useState('');
  const [room, setRoom] = useState('');
  const [onTime, setOnTime] = useState('10');
  const [late, setLate] = useState('5');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleRoom, setScheduleRoom] = useState('');

  const filteredCourses = assignedCourses.filter((item) => (
    (level === 'All levels' || (item.level || '200 Level') === level) &&
    (department === 'All departments' || item.department === department)
  ));
  const manualCourse = courseOfferings.find((item) => item.code.toLowerCase() === manualCode.trim().toLowerCase());
  const selectedCourse = manualCourse || assignedCourses.find((item) => item.id === Number(courseId));

  const openClass = (mode, date = '', time = '', venue = room) => {
    setActiveClass({ courseId: selectedCourse?.id || null, courseCode: selectedCourse?.code || manualCode.trim().toUpperCase(), courseTitle: selectedCourse?.title || 'Manual course', mode, venue, date, time, startedAt: new Date().toISOString() });
    setCurrentPage('l-attendance');
  };

  const handleStartWalkIn = () => {
    const total = parseInt(onTime) + parseInt(late);
    if (total > 35) {
      alert('Maximum total attendance time is 35 minutes.');
      return;
    }
    if (!selectedCourse && !manualCode.trim()) return;
    if (!room.trim()) return;
    openClass('walk-in');
  };

  const handleSchedule = () => {
    if ((!selectedCourse && !manualCode.trim()) || !scheduleDate || !scheduleTime || !scheduleRoom.trim()) return;
    openClass('scheduled', scheduleDate, scheduleTime, scheduleRoom);
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Host / Schedule</h1>
          <p>Simple class setup</p>
        </div>
        <Pill text="Max 35 min" />
      </div>

      <div className="two">
        <Card>
          <h3>Walk-in class</h3>
          <div className="formgrid">
            <div className="field"><label>Level</label><select value={level} onChange={(e) => setLevel(e.target.value)}><option>All levels</option><option>100 Level</option><option>200 Level</option><option>300 Level</option><option>400 Level</option></select></div>
            <div className="field"><label>Department</label><select value={department} onChange={(e) => setDepartment(e.target.value)}><option>All departments</option><option>Information Technology</option><option>Computer Science</option></select></div>
          </div>
          <div className="field">
            <label>Course</label>
            <select value={courseId} onChange={(e) => { setCourseId(Number(e.target.value)); setManualCode(''); }}>
              <option value="">Select an assigned course</option>
              {filteredCourses.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.title}</option>)}
            </select>
          </div>
          <div className="field"><label>Or enter course code</label><input value={manualCode} onChange={(e) => { setManualCode(e.target.value); setCourseId(''); }} placeholder="e.g. ICT 201" /><small className="muted">Use this for a linked or newly approved course.</small></div>
          <div className="field">
            <label>Venue</label>
            <input
              placeholder="ICT 2"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
          <div className="formgrid">
            <div className="field">
              <label>On Time</label>
              <select value={onTime} onChange={(e) => setOnTime(e.target.value)}>
                <option>5</option>
                <option>10</option>
                <option>15</option>
                <option>20</option>
              </select>
            </div>
            <div className="field">
              <label>Late</label>
              <select value={late} onChange={(e) => setLate(e.target.value)}>
                <option>5</option>
                <option>10</option>
                <option>15</option>
                <option>20</option>
              </select>
            </div>
          </div>
          <div className="notice">
            Choose the two windows. ADAM calculates the total and blocks anything above 35 minutes.
          </div>
          <Button type="primary" onClick={handleStartWalkIn} disabled={(!selectedCourse && !manualCode.trim()) || !room.trim()}>
            Start Walk-in
          </Button>
        </Card>

        <Card>
          <h3>Upcoming class</h3>
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Time</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Venue</label>
              <input placeholder="ICT 4" value={scheduleRoom} onChange={(e) => setScheduleRoom(e.target.value)} />
          </div>
          <Button type="primary" onClick={handleSchedule} disabled={(!selectedCourse && !manualCode.trim()) || !scheduleDate || !scheduleTime || !scheduleRoom.trim()}>
            Schedule Class
          </Button>
        </Card>
      </div>
    </>
  );
}
