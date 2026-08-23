import React, { useContext, useState } from 'react';
import { Pill, Card, Button } from '../common/UI.jsx';
import { AppContext } from '../../context/AppContext.jsx';

export default function LecturerAttendance() {
  const { courseOfferings, lecturerAssignments, activeClass } = useContext(AppContext);
  const assignedIds = lecturerAssignments['lecturer-001'] || [];
  const activeCourse = courseOfferings.find((course) => course.id === (activeClass?.courseId || assignedIds[0]));
  const activeCourseLabel = activeCourse ? `${activeCourse.code} — ${activeCourse.title}` : activeClass?.courseCode || 'No course selected';
  const [onTimeCount, setOnTimeCount] = useState(10);
  const [lateCount, setLateCount] = useState(5);

  const handleSimulateOnTime = () => {
    setOnTimeCount(onTimeCount + 1);
  };

  const handleSimulateLate = () => {
    setLateCount(lateCount + 1);
  };

  const handleEndSession = () => {
    alert('Attendance ended. Report is ready.');
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Live Attendance</h1>
          <p id="liveCourse">{activeCourseLabel}</p>
        </div>
        <Pill text={`${onTimeCount} On Time · ${lateCount} Late`} />
      </div>

      <div className="notice">
        The lecturer controls the On-Time and Late windows. The total session cannot exceed 35 minutes. Co-lecturers assigned to this course see the same session.
      </div>

      <div className="two section">
        <Card>
          <h3>Live verification</h3>
          <div className="scanbox">
            <div className="face"></div>
            <div className="scanline"></div>
          </div>
          <div className="actions">
            <Button type="primary" onClick={handleSimulateOnTime}>
              Simulate On Time
            </Button>
            <Button type="ghost" onClick={handleSimulateLate}>
              Simulate Late
            </Button>
          </div>
        </Card>

        <Card>
          <h3>Session status</h3>
          <div className="metric">15:00</div>
          <div className="muted">Time remaining</div>
          <div className="progress">
            <div style={{ width: '100%' }}></div>
          </div>
          <div className="statline">
            <span>On Time</span>
            <b>{onTimeCount}</b>
          </div>
          <div className="statline">
            <span>Late</span>
            <b>{lateCount}</b>
          </div>
          <div className="statline">
            <span>Absent</span>
            <b>8</b>
          </div>
          <Button type="danger" onClick={handleEndSession} disabled={!activeCourse && !activeClass?.courseCode}>
            End Session
          </Button>
        </Card>
      </div>
    </>
  );
}
