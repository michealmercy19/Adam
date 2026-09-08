import React, { useContext, useState } from 'react';
import { Pill, Card, Button } from '../common/UI.jsx';
import { AppContext } from '../../context/AppContext.jsx';

export default function LecturerHost() {
  const { userProfile, courseOfferings, lecturerAssignments, setCurrentPage, setActiveClass } = useContext(AppContext);
  const assignedIds = lecturerAssignments['lecturer-001'] || [];
  const assignedCourses = courseOfferings.filter((item) => assignedIds.includes(item.id) && item.linkedDepartments?.includes(userProfile?.department));
  const [level, setLevel] = useState('All levels');
  const department = userProfile?.department || '';
  const [courseId, setCourseId] = useState(assignedIds[0] || '');
  const [manualCode, setManualCode] = useState('');
  const [room, setRoom] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleRoom, setScheduleRoom] = useState('');

  const filteredCourses = assignedCourses.filter((item) => (
    (level === 'All levels' || (item.level || '200 Level') === level) &&
    item.department === department
  ));
  const manualCourse = courseOfferings.find((item) => item.code.toLowerCase() === manualCode.trim().toLowerCase());
  const selectedCourse = manualCourse || assignedCourses.find((item) => item.id === Number(courseId));

  const openClass = (mode, date = '', time = '', venue = room) => {
    const totalMinutes = Number(durationMinutes) || 15;
    const endsAt = new Date(Date.now() + totalMinutes * 60000).toISOString();

    setActiveClass({
      courseId: selectedCourse?.id || null,
      courseCode: selectedCourse?.code || manualCode.trim().toUpperCase(),
      courseTitle: selectedCourse?.title || 'Manual course',
      mode: mode === 'walk-in' ? 'physical' : mode === 'scheduled' ? 'physical' : 'virtual',
      venue,
      date,
      time,
      startedAt: new Date().toISOString(),
      endsAt,
      durationMinutes: totalMinutes,
      sessionId: `session-${Date.now()}`,
      requiresBiometric: true,
      hostType: 'lecturer',
      hostName: 'Dr. Adewale James',
    });
    setCurrentPage('l-attendance');
  };

  const handleStartWalkIn = () => {
    if (Number(durationMinutes) <= 0 || Number(durationMinutes) > 180) {
      alert('Attendance duration must be between 1 and 180 minutes.');
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
        <Pill text="Live timer" />
      </div>

      <div className="two">
        <Card>
          <h3>Host attendance session</h3>
          <p className="muted">The lecturer or HOC starts the session and students clock in against that class only.</p>
          <div className="formgrid">
            <div className="field"><label>Level</label><select value={level} onChange={(e) => setLevel(e.target.value)}><option>All levels</option><option>100 Level</option><option>200 Level</option><option>300 Level</option><option>400 Level</option></select></div>
            <div className="field"><label>Department</label><input value={department} readOnly /></div>
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
          <div className="field">
            <label>Attendance duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="180"
              placeholder="15"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
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
