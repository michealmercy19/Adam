# ADAM Attendance System

A modern, mobile-first attendance tracking system built with React and Vite.

## Features

### For Students
- Dashboard with attendance overview
- Facial recognition-based attendance marking
- Attendance history tracking
- Profile management
- Biometric verification

### For Lecturers
- Class dashboard and management
- Live attendance tracking
- Walk-in class scheduling
- Attendance reports with export
- Class session monitoring

### For Administrators
- Department-wide dashboard
- User management (Students & Lecturers)
- Advanced search and record management
- Attendance analytics and reports
- System settings and configuration
- Complaint and support management

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS with CSS Variables
- **State Management**: React Context API

## Project Structure

```
src/
├── components/
│   ├── pages/          # Page components for each view
│   ├── layout/         # Layout components (Sidebar)
│   ├── common/         # Reusable UI components
│   └── forms/          # Form components
├── context/            # React Context setup
├── hooks/              # Custom React hooks
├── styles/             # Global styles
├── utils/              # Utility functions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Build

```bash
npm run build
```

## Usage

1. **Select a Role**: Use the role selector in the sidebar to switch between Student, Lecturer, or Admin views
2. **Navigate**: Click navigation buttons to explore different sections
3. **Perform Actions**: Use the interactive elements to simulate various operations

## Color Scheme

- Primary Blue: `#1746d1`
- Success Green: `#16865b`
- Error Red: `#d92d20`
- Background: `#f6f8fc`
- Text: `#172033`

## Features in Detail

### Facial Recognition System
- Real-time face scanning simulation
- Fallback for poor network conditions
- Biometric verification requirement

### Attendance Session Management
- Configurable on-time and late windows
- Maximum 35-minute session limit
- Real-time attendance counters

### Reporting & Analytics
- Downloadable attendance reports (CSV)
- PDF export functionality
- Department-wide analytics

## License

MIT
