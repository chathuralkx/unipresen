import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OfficeStaffDashboard from './pages/dashboard/OfficeStaffDashboard';
import FacultyManagementDashboard from './pages/dashboard/FacultyManagementDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import LecturerDashboard from './pages/dashboard/LecturerDashboard';
import LectureAssistantDashboard from './pages/dashboard/LectureAssistantDashboard';
import LabAssistantDashboard from './pages/dashboard/LabAssistantDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard/></ProtectedRoute>
            }/>
            <Route path="/dashboard/officestaff" element={
              <ProtectedRoute allowedRoles={['officestaff']}><OfficeStaffDashboard/></ProtectedRoute>
            }/>
            <Route path="/dashboard/facultymanagement" element={
              <ProtectedRoute allowedRoles={['facultymanagement']}><FacultyManagementDashboard/></ProtectedRoute>
            }/>
            <Route path="/dashboard/student" element={
              <ProtectedRoute allowedRoles={['student']}><StudentDashboard/></ProtectedRoute>
            }/>
            <Route path="/dashboard/lecturer" element={
              <ProtectedRoute allowedRoles={['lecturer']}><LecturerDashboard/></ProtectedRoute>
            }/>
            <Route path="/dashboard/lectureassistant" element={
              <ProtectedRoute allowedRoles={['lectureassistant']}><LectureAssistantDashboard/></ProtectedRoute>
            }/>
            <Route path="/dashboard/labassistant" element={
              <ProtectedRoute allowedRoles={['labassistant']}><LabAssistantDashboard/></ProtectedRoute>
            }/>
            <Route path="/unauthorized" element={<div>Unauthorized</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;