# ADAM Attendance System - Development Guide

## Component Architecture

### Pages (Student)
- **StudentHome** - Dashboard overview
- **StudentAttendance** - Multi-step attendance marking (face scan → details → biometrics)
- **StudentHistory** - Past attendance records
- **StudentProfile** - Student information

### Pages (Lecturer)
- **LecturerDashboard** - Overview and quick actions
- **LecturerHost** - Schedule and start class sessions
- **LecturerAttendance** - Real-time attendance tracking
- **LecturerClasses** - Manage assigned courses
- **LecturerReports** - Generate and export reports

### Pages (Admin)
- **AdminDashboard** - Department overview
- **AdminUsers** - User management
- **AdminRecords** - Search and extract records
- **AdminReports** - Department analytics
- **AdminSettings** - System configuration
- **AdminComplaints** - Support management

### Layout Components
- **Sidebar** - Navigation and role selector

### Common Components (UI.jsx)
- `Badge` - Status indicators (good, pending, danger)
- `Pill` - Accent badges
- `Card` - Content container
- `Button` - Action buttons (primary, ghost, danger)
- `Grid` - Layout grid (2, 3, or 4 columns)

## State Management

Using React Context API (`AppContext`):
- `currentRole` - Selected user role (student/lecturer/admin)
- `currentPage` - Active page ID
- `attendanceData` - Attendance-related state
- `setCurrentRole()` - Change role
- `setCurrentPage()` - Navigate to page

## Styling

Global CSS with CSS Variables for:
- Colors
- Spacing
- Typography
- Responsive breakpoints

### Key Breakpoints
- Desktop: 850px+
- Tablet: 370px - 850px
- Mobile: < 370px

## Adding New Features

### 1. Create a new page component
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

### 2. Add to App.jsx pageMap
```jsx
import NewPage from './components/pages/NewPage';

const pageMap = {
  'new-page-id': NewPage,
};
```

### 3. Add to Sidebar navigation (Sidebar.jsx)
```jsx
const navs = {
  student: [
    ['new-page-id', 'New Page'],
  ],
};
```

## Performance Optimization

- Components are code-split by page
- CSS is scoped with class names
- No unnecessary re-renders with Context API
- Mobile-optimized layout

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Backend API integration
- [ ] Real facial recognition
- [ ] Real biometric scanning
- [ ] Persistent data storage
- [ ] User authentication
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Dark mode theme
