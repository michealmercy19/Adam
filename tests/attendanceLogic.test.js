import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCurrentAndCarryoverCourses,
  buildAttendanceRecord,
  calculateAttendanceSummary,
} from '../src/utils/attendanceLogic.js';

test('separates carryover courses from current courses', () => {
  const courses = [
    { id: 1, code: 'ICT 301', carryover: false },
    { id: 2, code: 'ICT 205', carryover: true },
    { id: 3, code: 'ICT 303', carryover: false },
  ];

  const { current, carryover } = getCurrentAndCarryoverCourses(courses, [1, 2, 3]);

  assert.deepEqual(current.map((course) => course.code), ['ICT 301', 'ICT 303']);
  assert.deepEqual(carryover.map((course) => course.code), ['ICT 205']);
});

test('builds a recorded attendance entry with session metadata', () => {
  const record = buildAttendanceRecord({
    studentId: 'FUNAAB/IT/24/001',
    studentName: 'Adebayo Daniel',
    courseId: 1,
    courseCode: 'ICT 301',
    lecturerId: 'lecturer-001',
    sessionId: 'session-001',
    status: 'Present',
    classMode: 'physical',
    verificationMethod: 'clock-in + proximity',
    verificationResult: 'verified',
    clockInTime: '09:14',
  });

  assert.equal(record.status, 'Present');
  assert.equal(record.classMode, 'physical');
  assert.equal(record.verificationMethod, 'clock-in + proximity');
  assert.equal(record.sessionId, 'session-001');
});

test('calculates attendance percentage and totals for a semester', () => {
  const summary = calculateAttendanceSummary({
    totalClassesHeld: 120,
    classesAttended: 104,
    classesMissed: 16,
  });

  assert.equal(summary.overallAttendance, 86.7);
  assert.equal(summary.classesMissed, 16);
});
