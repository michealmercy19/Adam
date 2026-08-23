import React, { createContext, useEffect, useState } from 'react';

export const AppContext = createContext();

const COURSE_STORAGE_KEY = 'adam-course-offerings';
const STUDENT_COURSE_STORAGE_KEY = 'adam-student-course-selections';
const LECTURER_ASSIGNMENT_STORAGE_KEY = 'adam-lecturer-assignments';
const ROLE_SELECTED_STORAGE_KEY = 'adam-role-selected';
const ACTIVE_CLASS_STORAGE_KEY = 'adam-active-class';
const COURSE_FORM_STORAGE_KEY = 'adam-course-form-submissions';
const defaultCourseOfferings = [
  {
    id: 1,
    code: 'ICT 201',
    title: 'Data Structures',
    units: 3,
    semester: 'First',
    session: '2026/2027',
    department: 'Information Technology',
    level: '200 Level',
    linkedDepartments: ['Information Technology'],
    carryover: false,
    verified: true,
    verifiedBy: 'HOC · Information Technology',
  },
  {
    id: 2,
    code: 'ICT 214',
    title: 'Database Systems',
    units: 3,
    semester: 'First',
    session: '2026/2027',
    department: 'Information Technology',
    level: '200 Level',
    linkedDepartments: ['Information Technology'],
    carryover: true,
    verified: true,
    verifiedBy: 'HOC · Information Technology',
  },
  {
    id: 3,
    code: 'CSC 220',
    title: 'Web Application Engineering',
    units: 3,
    semester: 'First',
    session: '2026/2027',
    department: 'Computer Science',
    level: '200 Level',
    linkedDepartments: ['Computer Science', 'Information Technology'],
    carryover: false,
    verified: true,
    verifiedBy: 'HOC · Computer Science + IT link',
  },
];

const loadCourseOfferings = () => {
  try {
    const savedCourses = window.localStorage.getItem(COURSE_STORAGE_KEY);
    return savedCourses
      ? JSON.parse(savedCourses).map((course) => ({
        ...course,
        linkedDepartments: course.linkedDepartments || [course.department],
      }))
      : defaultCourseOfferings;
  } catch {
    return defaultCourseOfferings;
  }
};

const loadStudentCourseSelections = () => {
  try {
    const savedSelections = window.localStorage.getItem(STUDENT_COURSE_STORAGE_KEY);
    return savedSelections ? JSON.parse(savedSelections) : { 'FUNAAB/IT/24/001': [1, 2] };
  } catch {
    return { 'FUNAAB/IT/24/001': [1, 2] };
  }
};

const loadLecturerAssignments = () => {
  try {
    const savedAssignments = window.localStorage.getItem(LECTURER_ASSIGNMENT_STORAGE_KEY);
    return savedAssignments ? JSON.parse(savedAssignments) : { 'lecturer-001': [1] };
  } catch {
    return { 'lecturer-001': [1] };
  }
};

const loadActiveClass = () => {
  try {
    const savedClass = window.localStorage.getItem(ACTIVE_CLASS_STORAGE_KEY);
    return savedClass ? JSON.parse(savedClass) : null;
  } catch {
    return null;
  }
};

const loadCourseFormSubmissions = () => {
  try {
    const savedSubmissions = window.localStorage.getItem(COURSE_FORM_STORAGE_KEY);
    return savedSubmissions ? JSON.parse(savedSubmissions) : [];
  } catch {
    return [];
  }
};

export const AppProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState('student');
  const [currentPage, setCurrentPage] = useState('s-home');
  const [roleSelected, setRoleSelected] = useState(() => window.localStorage.getItem(ROLE_SELECTED_STORAGE_KEY) === 'true');
  const [courseOfferings, setCourseOfferings] = useState(loadCourseOfferings);
  const [studentCourseSelections, setStudentCourseSelections] = useState(loadStudentCourseSelections);
  const [lecturerAssignments, setLecturerAssignments] = useState(loadLecturerAssignments);
  const [activeClass, setActiveClass] = useState(loadActiveClass);
  const [courseFormSubmissions, setCourseFormSubmissions] = useState(loadCourseFormSubmissions);
  const [attendanceData, setAttendanceData] = useState({
    faceScanned: false,
    biometricsVerified: false,
    onTime: 0,
    late: 0,
  });

  useEffect(() => {
    window.localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courseOfferings));
  }, [courseOfferings]);

  useEffect(() => {
    window.localStorage.setItem(STUDENT_COURSE_STORAGE_KEY, JSON.stringify(studentCourseSelections));
  }, [studentCourseSelections]);

  useEffect(() => {
    window.localStorage.setItem(LECTURER_ASSIGNMENT_STORAGE_KEY, JSON.stringify(lecturerAssignments));
  }, [lecturerAssignments]);

  useEffect(() => {
    if (activeClass) window.localStorage.setItem(ACTIVE_CLASS_STORAGE_KEY, JSON.stringify(activeClass));
  }, [activeClass]);

  useEffect(() => {
    window.localStorage.setItem(COURSE_FORM_STORAGE_KEY, JSON.stringify(courseFormSubmissions));
  }, [courseFormSubmissions]);

  useEffect(() => {
    const syncCourses = (event) => {
      if (event.key === STUDENT_COURSE_STORAGE_KEY && event.newValue) {
        try {
          setStudentCourseSelections(JSON.parse(event.newValue));
        } catch {
          return;
        }
        return;
      }
      if (event.key === LECTURER_ASSIGNMENT_STORAGE_KEY && event.newValue) {
        try {
          setLecturerAssignments(JSON.parse(event.newValue));
        } catch {
          return;
        }
        return;
      }
      if (event.key === ACTIVE_CLASS_STORAGE_KEY && event.newValue) {
        try {
          setActiveClass(JSON.parse(event.newValue));
        } catch {
          return;
        }
        return;
      }
      if (event.key === COURSE_FORM_STORAGE_KEY && event.newValue) {
        try {
          setCourseFormSubmissions(JSON.parse(event.newValue));
        } catch {
          return;
        }
        return;
      }
      if (event.key !== COURSE_STORAGE_KEY || !event.newValue) return;
      try {
        setCourseOfferings(JSON.parse(event.newValue));
      } catch {
        return;
      }
    };

    window.addEventListener('storage', syncCourses);
    return () => window.removeEventListener('storage', syncCourses);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentPage,
        setCurrentPage,
        roleSelected,
        setRoleSelected: (selected) => {
          setRoleSelected(selected);
          window.localStorage.setItem(ROLE_SELECTED_STORAGE_KEY, String(selected));
        },
        courseOfferings,
        setCourseOfferings,
        studentCourseSelections,
        setStudentCourseSelections,
        lecturerAssignments,
        setLecturerAssignments,
        activeClass,
        setActiveClass,
        courseFormSubmissions,
        setCourseFormSubmissions,
        attendanceData,
        setAttendanceData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
