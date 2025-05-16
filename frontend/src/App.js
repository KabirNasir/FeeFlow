import React from 'react';
import { Routes, Route , Navigate } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';

//Importing Components
import Login from './pages/Login';
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All routes below are protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 
            Later you can add more protected routes here, e.g.:
            <Route path="/classes/new" element={<CreateClass />} />
            <Route path="/classes/:classId" element={<ClassDetail />} />
          */}
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
