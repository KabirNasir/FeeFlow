import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import CreateClass from './pages/CreateClass';
import ClassDetail from './pages/ClassDetail';
import StudentList from './pages/StudentList';
import CreateStudent from './pages/CreateStudent';
import EditStudent from './pages/EditStudent'
import EditClass from './pages/EditClass';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* when hitting “/” send to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/resetpassword/:resettoken" element={<ResetPassword />} /> 

        {/* everything else requires auth */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* once inside layout, default to /dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="classes/new" element={<CreateClass />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="classes/:classId/edit" element={<EditClass />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/new" element={<CreateStudent />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/new" element={<CreateStudent />} />
            <Route path="students/:studentId/edit" element={<EditStudent />} />{' '}
          </Route>
        </Route>

        {/* any other path → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// // import logo from './logo.svg';
// import './App.css';

// //Importing Components
// import Login from './pages/Login';
// import Register from './pages/Register'
// import ProtectedRoute from './components/ProtectedRoute';
// import { AuthProvider } from './contexts/AuthContext';
// import Dashboard from './pages/Dashboard';
// import CreateClass from './pages/CreateClass';
// import Layout from './components/Layout';
// import ClassDetail from './pages/ClassDetail';
// import StudentList from './pages/StudentList';
// import CreateStudent from './pages/CreateStudent';


// function App() {
//   return (
//     <AuthProvider>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/" element={<Navigate to="/dashboard" replace />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* All routes below are protected */}
//         <Route element={<ProtectedRoute />}>
//           {/* <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/classes/new" element={<CreateClass />} /> */}
//           <Route element={<Layout />}>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/classes/new" element={<CreateClass />} />
//             <Route path="/classes/:classId" element={<ClassDetail />} />
//             <Route path="/students" element={<StudentList />} />
//             <Route path="/students/new" element={<CreateStudent />} />
//           </Route>
//         </Route>
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </AuthProvider>
//   );
// }

// export default App;
