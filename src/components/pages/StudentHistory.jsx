import React, { useContext } from 'react';
import { Badge, Pill, Card } from '../common/UI.jsx';
import { AppContext } from '../../context/AppContext.jsx';

const fallbackStudentId = '202*****';

export default function StudentHistory() {
  const { userProfile, attendanceRecords } = useContext(AppContext);
  const records = attendanceRecords.filter((record) => record.studentId === (userProfile?.id || fallbackStudentId));

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Attendance History</h1>
          <p>Your recent classes</p>
        </div>
      </div>

      <Card>
        {records.length ? records.map((record) => (
          <div className="course" key={record.id}>
            <div>
              <b>{record.courseCode}</b>
              <div className="muted">{record.classDate} · {record.clockInTime || 'No clock-in time'}</div>
            </div>
            <Badge text={record.status} type={record.status === 'Present' || record.status === 'Completed' ? 'good' : 'pending'} />
          </div>
        )) : <p className="muted">No attendance history yet. Your verified clock-ins will appear here.</p>}
      </Card>
    </>
  );
}
