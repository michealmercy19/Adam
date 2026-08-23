import React, { useState } from 'react';
import { Pill, Card, Button } from '../common/UI.jsx';

export default function AdminRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([
    ['Adebayo Daniel', 'Student', 'FUNAAB/IT/24/001', '86%'],
    ['Dr. Adewale James', 'Lecturer', 'STAFF/ICT/014', '—'],
  ]);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const allRecords = [
      ['Adebayo Daniel', 'Student', 'FUNAAB/IT/24/001', '86%'],
      ['Okafor Mercy', 'Student', 'FUNAAB/IT/24/014', '84%'],
      ['Dr. Adewale James', 'Lecturer', 'STAFF/ICT/014', '—'],
    ];
    const filtered = allRecords.filter(
      (r) => !query || r.join(' ').toLowerCase().includes(query)
    );
    setResults(filtered);
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Search Records</h1>
          <p>Find any lecturer or student</p>
        </div>
        <Pill text="Admin only" />
      </div>

      <Card>
        <div className="field">
          <label>Name / Matric / Staff ID</label>
          <input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="primary" onClick={handleSearch}>
          Search & Extract
        </Button>
      </Card>

      <Card className="section">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>ID</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
                <tr key={idx}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
