# ADAM Attendance System - Development Guide

ADAM update status: programme-scoped academic workspaces and succession-safe institutional data are now represented in the shared application state.

Architecture rules
- User accounts belong to people. HOD and HOC assignments are permissions on an academic workspace.
- Workspace scope is Department + Programme + Level + Academic Session.
- Student registry records are the verification source when an official registry has been imported.
- HOC and HOD changes clear assignments only; they do not delete courses, students, notifications, settings, or history.
- Audit events record registry imports, HOC approvals/rejections/removals, and HOD step-down events.

Implemented update list
- Programme-aware student profiles with a separate programme field.
- Shared `academicWorkspaces`, `studentRegistry`, `hocRequests`, and `auditEvents` state.
- CSV and XLSX student registry upload with preview counts for valid, duplicate, missing, invalid-level, invalid-session, and invalid-status records.
- Registry confirmation creates or preserves the matching academic workspace.
- Student verification checks matric number, name, institution, department, programme, level, session, and active status when registry data exists.
- Existing verified students can request HOC status without creating another account.
- Admin approval connects the existing student account to the existing programme/level/session workspace.
- HOC removal keeps the workspace and records intact.
- HOD step-down keeps the department workspace intact and removes current authority.
- Onboarding completion remains account-scoped across logout and supported shared-state devices.
- HOC signup flow: selecting the existing HOC role creates the person’s account with normal student access while the request is pending.
- Only that requesting account sees the `HOC request pending` profile status; unrelated student profiles do not show HOC controls.
- Admin approval assigns the existing account to the programme/level/session HOC workspace and automatically changes the account interface to HOC.
- The approval notice is temporary and leaves the profile after three minutes; the HOC assignment, workspace, records, and audit history remain.

Known production boundary
- The current demo uses the existing role gate and JSON shared-state API. Production deployment must replace client-controlled role selection with server-issued authenticated sessions and enforce every workspace mutation on the backend.

# Component Architecture

Pages (Student)
- **StudentHome** - Dashboard overview
- **StudentAttendance** - Multi-step attendance marking (face scan → details → biometrics)
- **StudentHistory** - Past attendance records
- **StudentProfile** - Student information

Pages (Lecturer)
- **LecturerDashboard** - Overview and quick actions
- **LecturerHost** - Schedule and start class sessions
- **LecturerAttendance** - Real-time attendance tracking
- **LecturerClasses** - Manage assigned courses
- **LecturerReports** - Generate and export reports

Pages (Admin)
- **AdminDashboard** - Department overview
- **AdminUsers** - User management
- **AdminRecords** - Search and extract records
- **AdminReports** - Department analytics
- **AdminSettings** - System configuration
- **AdminComplaints** - Support management

Layout Components
- **Sidebar** - Navigation and role selector

Common Components (UI.jsx)
- `Badge` - Status indicators (good, pending, danger)
- `Pill` - Accent badges
- `Card` - Content container
- `Button` - Action buttons (primary, ghost, danger)
- `Grid` - Layout grid (2, 3, or 4 columns)

# State Management

Using React Context API (`AppContext`):
- `currentRole` - Selected user role (student/lecturer/admin)
- `currentPage` - Active page ID
- `attendanceData` - Attendance-related state
- `setCurrentRole()` - Change role
- `setCurrentPage()` - Navigate to page

# Styling

Global CSS with CSS Variables for:
- Colors
- Spacing
- Typography
- Responsive breakpoints

Key Breakpoints
- Desktop: 850px+
- Tablet: 370px - 850px
- Mobile: < 370px

Adding New Features

1. Create a new page component
```jsx
import React from 'react';
import { Card, Button } from '../common/UI';

export default function NewPage() {
  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Page Title</h1>
          <p>Page description</p>
        </div>
      </div>
      <Card>
      </Card>
    </>
  );
}
```

2. Add to App.jsx pageMap
```jsx
import NewPage from './components/pages/NewPage';

const pageMap = {
  'new-page-id': NewPage,
};
```

3. Add to Sidebar navigation (Sidebar.jsx)
```jsx
const navs = {
  student: [
    ['new-page-id', 'New Page'],
  ],
};
```

# Performance Optimization

- Components are code-split by page
- CSS is scoped with class names
- No unnecessary re-renders with Context API
- Mobile-optimized layout

# Browser Support

- Chrome and Chromium-based browsers: current and previous major release
- Firefox: current and previous major release
- Safari: current and previous major release on macOS and iOS
- Edge: current and previous major release
- Android Chrome: supported through responsive layout and installable PWA shell
- iPhone/iPad Safari: supported through responsive layout and Add to Home Screen PWA behavior
- Minimum supported mobile viewport: 320px wide

API and mobile reliability
- Frontend API calls use `src/utils/apiClient.js` with an 8-second timeout, two retries, JSON response validation, and `VITE_API_URL` support.
- The server provides `GET /api/health`, no-store API responses, payload limits, and atomic state-file replacement.
- `public/sw.js` caches only the application shell. API responses are always fetched from the network so attendance, registry, courses, notifications, and permissions stay current.
- PWA assets include the manifest, SVG application icons, Apple touch icon metadata, an install prompt for Chromium browsers, and Add to Home Screen instructions for iPhone Safari.
- Service-worker updates use a versioned shell cache and activate new workers without caching institutional API data.
- Development uses Vite proxying from `/api` to the server. Production should deploy the frontend and API behind HTTPS on the same origin or set `VITE_API_URL` to the HTTPS API origin.
- Mobile browsers require HTTPS for service workers and install prompts, except for localhost development.

Future Enhancements

- [ ] Replace demo client-selected identity with the existing production authentication provider
- [ ] Enforce authenticated workspace authorization in the production API
- [ ] Real facial recognition
- [ ] Real biometric scanning
- [ ] Email notifications
- [ ] Mobile app version
