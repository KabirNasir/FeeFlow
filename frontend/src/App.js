import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ReportDetail from './pages/ReportDetail';
import Dashboard from './pages/Dashboard';
import DashboardReimagined from './pages/DashboardReimagined';
import CreateClass from './pages/CreateClass';
import ClassDetail from './pages/ClassDetail';
import StudentList from './pages/StudentList';
import CreateStudent from './pages/CreateStudent';
import EditStudent from './pages/EditStudent'
import Classes from './pages/Classes';
import EditClass from './pages/EditClass';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Fees from './pages/Fees';
import Profile from './pages/Profile'
import StudentProfile from './pages/StudentProfile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
    <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
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
            <Route path="dashboard" element={<DashboardReimagined />} />
            <Route path="classes/new" element={<CreateClass />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="classes/:classId/edit" element={<EditClass />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/new" element={<CreateStudent />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/new" element={<CreateStudent />} />
            <Route path="students/:studentId/edit" element={<EditStudent />} />{' '}
            <Route path="reports" element={<Reports />} /> 
            <Route path="reports/:reportId" element={<ReportDetail />} />
            <Route path="classes" element={<Classes />} />\
            <Route path="fees" element={<Fees />} />
            <Route path="profile" element={<Profile/>} />
              <Route path="/students/:id/profile" element={<StudentProfile />} /> 
          </Route>
        </Route>

        {/* any other path → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
    </GoogleOAuthProvider>
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
