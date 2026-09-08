export function getCurrentAndCarryoverCourses(courses = [], selectedCourseIds = []) {
  const current = [];
  const carryover = [];

  courses.forEach((course) => {
    if (!selectedCourseIds.includes(course.id)) return;
    if (course.carryover) {
      carryover.push(course);
      return;
    }
    current.push(course);
  });

  return { current, carryover };
}

export function buildAttendanceRecord({
  studentId,
  studentName,
  courseId,
  courseCode,
  courseTitle,
  lecturerId,
  lecturerName,
  sessionId,
  date = new Date().toISOString().slice(0, 10),
  startTime = '09:00',
  clockInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  clockOutTime = null,
  status = 'Present',
  classMode = 'physical',
  verificationMethod = 'clock-in',
  verificationResult = 'verified',
  studentDepartment = '',
  attendanceResponsibleDepartment = studentDepartment,
}) {
  return {
    id: `att-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    studentId,
    studentName,
    courseId,
    courseCode,
    courseTitle,
    lecturerId,
    lecturerName,
    sessionId,
    classDate: date,
    startTime,
    clockInTime,
    clockOutTime,
    status,
    classMode,
    verificationMethod,
    verificationResult,
    studentDepartment,
    attendanceResponsibleDepartment,
    recordedAt: new Date().toISOString(),
  };
}

export function calculateAttendanceSummary({ totalClassesHeld, classesAttended, classesMissed }) {
  const held = Number(totalClassesHeld) || 0;
  const attended = Number(classesAttended) || 0;
  const missed = Number(classesMissed) || 0;

  return {
    totalClassesHeld: held,
    classesAttended: attended,
    classesMissed: missed,
    overallAttendance: held ? Number(((attended / held) * 100).toFixed(1)) : 0,
  };
}
