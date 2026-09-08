import React, { createContext, useEffect, useRef, useState } from 'react';
import { getApiState, putApiState } from '../utils/apiClient.js';

export const AppContext = createContext();

const COURSE_STORAGE_KEY = 'adam-course-offerings';
const STUDENT_COURSE_STORAGE_KEY = 'adam-student-course-selections';
const LECTURER_ASSIGNMENT_STORAGE_KEY = 'adam-lecturer-assignments';
const ROLE_SELECTED_STORAGE_KEY = 'adam-role-selected';
const ACTIVE_CLASS_STORAGE_KEY = 'adam-active-class';
const COMPLETED_SESSION_RETENTION_MS = 5 * 60 * 1000;
const COURSE_FORM_STORAGE_KEY = 'adam-course-form-submissions';
const NOTIFICATIONS_STORAGE_KEY = 'adam-notifications';
const THEME_STORAGE_KEY = 'adam-theme';
const ATTENDANCE_RECORDS_STORAGE_KEY = 'adam-attendance-records';
const USER_PROFILE_STORAGE_KEY = 'adam-user-profile';
const BIOMETRIC_ENROLLMENTS_STORAGE_KEY = 'adam-biometric-enrollments';
const HOC_COURSE_SELECTIONS_STORAGE_KEY = 'adam-hoc-course-selections';
const COURSE_PERMISSION_REQUESTS_STORAGE_KEY = 'adam-course-permission-requests';
const ACADEMIC_WORKSPACES_STORAGE_KEY = 'adam-academic-workspaces';
const STUDENT_REGISTRY_STORAGE_KEY = 'adam-student-registry';
const HOC_REQUESTS_STORAGE_KEY = 'adam-hoc-requests';
const AUDIT_EVENTS_STORAGE_KEY = 'adam-audit-events';
const DEMO_DATA_RESET_KEY = 'adam-demo-data-reset-v6';
const SHARED_STATE_KEYS = ['courseOfferings', 'studentCourseSelections', 'lecturerAssignments', 'activeClass', 'courseFormSubmissions', 'notifications', 'attendanceRecords', 'biometricEnrollments', 'hocCourseSelections', 'coursePermissionRequests', 'onboardedAccounts', 'academicWorkspaces', 'studentRegistry', 'hocRequests', 'auditEvents'];

if (window.localStorage.getItem(DEMO_DATA_RESET_KEY) !== 'true') {
  window.localStorage.removeItem(STUDENT_COURSE_STORAGE_KEY);
  window.localStorage.removeItem(COURSE_STORAGE_KEY);
  window.localStorage.removeItem(ATTENDANCE_RECORDS_STORAGE_KEY);
  window.localStorage.removeItem(COURSE_FORM_STORAGE_KEY);
  window.localStorage.removeItem(ACTIVE_CLASS_STORAGE_KEY);
  window.localStorage.removeItem(LECTURER_ASSIGNMENT_STORAGE_KEY);
  window.localStorage.removeItem(HOC_COURSE_SELECTIONS_STORAGE_KEY);
  window.localStorage.removeItem(COURSE_PERMISSION_REQUESTS_STORAGE_KEY);
  window.localStorage.setItem(DEMO_DATA_RESET_KEY, 'true');
}

const defaultCourseOfferings = [];

const defaultAttendanceRecords = [];

const loadCourseOfferings = () => {
  try {
    const savedCourses = window.localStorage.getItem(COURSE_STORAGE_KEY);
    return savedCourses
      ? JSON.parse(savedCourses).map((course) => ({
        ...course,
        linkedDepartments: course.linkedDepartments || [course.department],
        eligibleDepartments: course.eligibleDepartments || course.linkedDepartments || [course.department],
      }))
      : defaultCourseOfferings;
  } catch {
    return defaultCourseOfferings;
  }
};

const loadStudentCourseSelections = () => {
  try {
    const savedSelections = window.localStorage.getItem(STUDENT_COURSE_STORAGE_KEY);
    return savedSelections ? JSON.parse(savedSelections) : {};
  } catch {
    return {};
  }
};

const loadLecturerAssignments = () => {
  try {
    const savedAssignments = window.localStorage.getItem(LECTURER_ASSIGNMENT_STORAGE_KEY);
    return savedAssignments ? JSON.parse(savedAssignments) : {};
  } catch {
    return {};
  }
};

const loadActiveClass = () => {
  try {
    const savedClass = window.localStorage.getItem(ACTIVE_CLASS_STORAGE_KEY);
    const parsedClass = savedClass ? JSON.parse(savedClass) : null;
    if (parsedClass?.completedAt && Date.now() - new Date(parsedClass.completedAt).getTime() >= COMPLETED_SESSION_RETENTION_MS) {
      window.localStorage.removeItem(ACTIVE_CLASS_STORAGE_KEY);
      return null;
    }
    return parsedClass;
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

const loadNotifications = () => {
  try {
    const savedNotifications = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  } catch {
    return [];
  }
};

const loadAttendanceRecords = () => {
  try {
    const savedRecords = window.localStorage.getItem(ATTENDANCE_RECORDS_STORAGE_KEY);
    return savedRecords ? JSON.parse(savedRecords) : defaultAttendanceRecords;
  } catch {
    return defaultAttendanceRecords;
  }
};

const loadUserProfile = () => {
  try {
    const savedProfile = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    return savedProfile ? JSON.parse(savedProfile) : null;
  } catch {
    return null;
  }
};

const loadBiometricEnrollments = () => {
  try {
    const savedEnrollments = window.localStorage.getItem(BIOMETRIC_ENROLLMENTS_STORAGE_KEY);
    return savedEnrollments ? JSON.parse(savedEnrollments) : {};
  } catch {
    return {};
  }
};

const loadJson = (key, fallback) => {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
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
  const [notifications, setNotifications] = useState(loadNotifications);
  const [theme, setTheme] = useState(() => window.localStorage.getItem(THEME_STORAGE_KEY) || 'light');
  const notificationCountRef = useRef(notifications.length);
  const [attendanceRecords, setAttendanceRecords] = useState(loadAttendanceRecords);
  const [userProfile, setUserProfile] = useState(loadUserProfile);
  const [biometricEnrollments, setBiometricEnrollments] = useState(loadBiometricEnrollments);
  const [hocCourseSelections, setHocCourseSelections] = useState(() => loadJson(HOC_COURSE_SELECTIONS_STORAGE_KEY, {}));
  const [coursePermissionRequests, setCoursePermissionRequests] = useState(() => loadJson(COURSE_PERMISSION_REQUESTS_STORAGE_KEY, []));
  const [onboardedAccounts, setOnboardedAccounts] = useState({});
  const [academicWorkspaces, setAcademicWorkspaces] = useState(() => loadJson(ACADEMIC_WORKSPACES_STORAGE_KEY, {}));
  const [studentRegistry, setStudentRegistry] = useState(() => loadJson(STUDENT_REGISTRY_STORAGE_KEY, []));
  const [hocRequests, setHocRequests] = useState(() => loadJson(HOC_REQUESTS_STORAGE_KEY, []));
  const [auditEvents, setAuditEvents] = useState(() => loadJson(AUDIT_EVENTS_STORAGE_KEY, []));
  const [attendanceData, setAttendanceData] = useState({
    faceScanned: false,
    biometricsVerified: false,
    onTime: 0,
    late: 0,
  });
  const sharedStateHydrated = useRef(false);
  const sharedStateRequest = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getApiState()
      .then((remoteState) => {
        if (cancelled || !remoteState._initialized) return;
        const setters = {
          courseOfferings: setCourseOfferings,
          studentCourseSelections: setStudentCourseSelections,
          lecturerAssignments: setLecturerAssignments,
          activeClass: setActiveClass,
          courseFormSubmissions: setCourseFormSubmissions,
          notifications: setNotifications,
          attendanceRecords: setAttendanceRecords,
          biometricEnrollments: setBiometricEnrollments,
          hocCourseSelections: setHocCourseSelections,
          coursePermissionRequests: setCoursePermissionRequests,
          onboardedAccounts: setOnboardedAccounts,
          academicWorkspaces: setAcademicWorkspaces,
          studentRegistry: setStudentRegistry,
          hocRequests: setHocRequests,
          auditEvents: setAuditEvents,
        };
        SHARED_STATE_KEYS.forEach((key) => {
          if (remoteState[key] !== undefined) setters[key](remoteState[key]);
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) sharedStateHydrated.current = true;
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!sharedStateHydrated.current) return undefined;
    const sharedState = {
      courseOfferings,
      studentCourseSelections,
      lecturerAssignments,
      activeClass,
      courseFormSubmissions,
      notifications,
      attendanceRecords,
      biometricEnrollments,
      hocCourseSelections,
      coursePermissionRequests,
        onboardedAccounts,
        academicWorkspaces,
        studentRegistry,
        hocRequests,
        auditEvents,
    };
    window.clearTimeout(sharedStateRequest.current);
    sharedStateRequest.current = window.setTimeout(() => {
      putApiState(sharedState).catch(() => {});
    }, 250);
    return () => window.clearTimeout(sharedStateRequest.current);
  }, [courseOfferings, studentCourseSelections, lecturerAssignments, activeClass, courseFormSubmissions, notifications, attendanceRecords, biometricEnrollments, hocCourseSelections, coursePermissionRequests, onboardedAccounts, academicWorkspaces, studentRegistry, hocRequests, auditEvents]);

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
    if (activeClass) {
      window.localStorage.setItem(ACTIVE_CLASS_STORAGE_KEY, JSON.stringify(activeClass));
      return;
    }
    window.localStorage.removeItem(ACTIVE_CLASS_STORAGE_KEY);
  }, [activeClass]);

  useEffect(() => {
    if (!activeClass) return undefined;

    const completeSession = () => {
      setActiveClass((current) => {
        if (!current || current.completedAt || !current.endsAt || new Date(current.endsAt).getTime() > Date.now()) return current;
        return { ...current, status: 'completed', completedAt: new Date().toISOString() };
      });
    };

    completeSession();
    const timer = window.setInterval(completeSession, 1000);
    return () => window.clearInterval(timer);
  }, [activeClass]);

  useEffect(() => {
    if (!activeClass?.completedAt) return undefined;

    const remainingRetention = COMPLETED_SESSION_RETENTION_MS - (Date.now() - new Date(activeClass.completedAt).getTime());
    if (remainingRetention <= 0) {
      setActiveClass(null);
      return undefined;
    }

    const timer = window.setTimeout(() => setActiveClass(null), remainingRetention);
    return () => window.clearTimeout(timer);
  }, [activeClass?.completedAt]);

  useEffect(() => {
    window.localStorage.setItem(COURSE_FORM_STORAGE_KEY, JSON.stringify(courseFormSubmissions));
  }, [courseFormSubmissions]);

  useEffect(() => {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    if (notifications.length > notificationCountRef.current) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.frequency.value = 740;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch {
        return;
      }
    }
    notificationCountRef.current = notifications.length;
  }, [notifications]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(ATTENDANCE_RECORDS_STORAGE_KEY, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    if (userProfile) {
      window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
      return;
    }
    window.localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  }, [userProfile]);

  useEffect(() => {
    window.localStorage.setItem(BIOMETRIC_ENROLLMENTS_STORAGE_KEY, JSON.stringify(biometricEnrollments));
  }, [biometricEnrollments]);

  useEffect(() => {
    window.localStorage.setItem(HOC_COURSE_SELECTIONS_STORAGE_KEY, JSON.stringify(hocCourseSelections));
    window.localStorage.setItem(COURSE_PERMISSION_REQUESTS_STORAGE_KEY, JSON.stringify(coursePermissionRequests));
  }, [hocCourseSelections, coursePermissionRequests]);

  useEffect(() => {
    window.localStorage.setItem(ACADEMIC_WORKSPACES_STORAGE_KEY, JSON.stringify(academicWorkspaces));
    window.localStorage.setItem(STUDENT_REGISTRY_STORAGE_KEY, JSON.stringify(studentRegistry));
    window.localStorage.setItem(HOC_REQUESTS_STORAGE_KEY, JSON.stringify(hocRequests));
    window.localStorage.setItem(AUDIT_EVENTS_STORAGE_KEY, JSON.stringify(auditEvents));
  }, [academicWorkspaces, studentRegistry, hocRequests, auditEvents]);

  useEffect(() => {
    if (!userProfile) {
      window.localStorage.removeItem(STUDENT_COURSE_STORAGE_KEY);
      window.localStorage.removeItem(ATTENDANCE_RECORDS_STORAGE_KEY);
      window.localStorage.removeItem(ACTIVE_CLASS_STORAGE_KEY);
      window.localStorage.removeItem(COURSE_FORM_STORAGE_KEY);
      window.localStorage.removeItem(LECTURER_ASSIGNMENT_STORAGE_KEY);
    }
  }, [userProfile]);

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
      if (event.key === NOTIFICATIONS_STORAGE_KEY && event.newValue) {
        try {
          setNotifications(JSON.parse(event.newValue));
        } catch {
          return;
        }
        return;
      }
      if (event.key === ATTENDANCE_RECORDS_STORAGE_KEY && event.newValue) {
        try {
          setAttendanceRecords(JSON.parse(event.newValue));
        } catch {
          return;
        }
        return;
      }
      if (event.key === HOC_COURSE_SELECTIONS_STORAGE_KEY && event.newValue) {
        try { setHocCourseSelections(JSON.parse(event.newValue)); } catch { return; }
        return;
      }
      if (event.key === COURSE_PERMISSION_REQUESTS_STORAGE_KEY && event.newValue) {
        try { setCoursePermissionRequests(JSON.parse(event.newValue)); } catch { return; }
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
        notifications,
        setNotifications,
        theme,
        setTheme,
        attendanceRecords,
        setAttendanceRecords,
        userProfile,
        setUserProfile,
        biometricEnrollments,
        setBiometricEnrollments,
        hocCourseSelections,
        setHocCourseSelections,
        coursePermissionRequests,
        setCoursePermissionRequests,
        onboardedAccounts,
        setOnboardedAccounts,
        academicWorkspaces,
        setAcademicWorkspaces,
        studentRegistry,
        setStudentRegistry,
        hocRequests,
        setHocRequests,
        auditEvents,
        setAuditEvents,
        attendanceData,
        setAttendanceData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
