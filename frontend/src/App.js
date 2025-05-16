import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';

//Importing Components
import Login from './pages/Login';
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import CreateClass from './pages/CreateClass';
import Layout from './components/Layout';
import ClassDetail from './pages/ClassDetail';
import StudentList from './pages/StudentList';
import CreateStudent from './pages/CreateStudent';


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
          {/* <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classes/new" element={<CreateClass />} /> */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classes/new" element={<CreateClass />} />
            <Route path="/classes/:classId" element={<ClassDetail />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/new" element={<CreateStudent />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
