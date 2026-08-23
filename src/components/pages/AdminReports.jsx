import React from 'react';
import { Card, Button, Grid } from '../common/UI.jsx';

export default function AdminReports() {
  const handleDownload = () => {
    const csv =
      'Name,Role,ID,Attendance\nAdebayo Daniel,Student,FUNAAB/IT/24/001,86%\nDr. Adewale James,Lecturer,STAFF/ICT/014,-';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'ADAM_Attendance_Report.csv';
    a.click();
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Reports</h1>
          <p>Department attendance analytics</p>
        </div>
      </div>

      <Card>
        <div className="statline">
          <span>Students below 50%</span>
          <b>73</b>
        </div>
        <div className="statline">
          <span>Courses with low attendance</span>
          <b>8</b>
        </div>
        <div className="statline">
          <span>Attendance today</span>
          <b>84%</b>
        </div>
        <Button type="primary" onClick={handleDownload}>
          Extract Report
        </Button>
      </Card>
    </>
  );
}
