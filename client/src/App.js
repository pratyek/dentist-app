// // client/src/App.js
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import jwtDecode from 'jwt-decode';

// // Components
// import Navbar from './components/layout/Navbar';
// import Landing from './components/layout/Landing';

// // Auth Components
// import Register from './components/auth/Register';
// import Login from './components/auth/Login';

// // Patient Components
// import PatientDashboard from './components/patient/PatientDashboard';
// import DentistList from './components/patient/DentistList';
// import NewCheckupRequest from './components/patient/NewCheckupRequest';
// import CheckupDetails from './components/patient/CheckupDetails';

// // Dentist Components
// import DentistDashboard from './components/dentist/DentistDashboard';
// import PatientList from './components/dentist/PatientList';
// import SubmitCheckupResult from './components/dentist/SubmitCheckupResult';

// // Auth Context
// import { AuthProvider } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext';

// // Private Route Component
// const PrivateRoute = ({ element, role }) => {
//   const token = localStorage.getItem('token');
  
//   if (!token) {
//     return <Navigate to="/login" />;
//   }
  
//   try {
//     const decoded = jwtDecode(token);
//     const currentTime = Date.now() / 1000;
    
//     if (decoded.exp < currentTime) {
//       localStorage.removeItem('token');
//       return <Navigate to="/login" />;
//     }
    
//     if (role && decoded.role !== role) {
//       return <Navigate to="/" />;
//     }
    
//     return element;
//   } catch (err) {
//     localStorage.removeItem('token');
//     return <Navigate to="/login" />;
//   }
// };

// function App() {
//   return (
//     <AuthProvider>
//       <SocketProvider>
//         <Router>
//           <div className="App">
//             <Navbar />
//             <ToastContainer position="top-right" autoClose={3000} />
//             <Routes>
//               <Route path="/" element={<Landing />} />
//               <Route path="/register" element={<Register />} />
//               <Route path="/login" element={<Login />} />
              
//               {/* Patient Routes */}
//               <Route 
//                 path="/patient/dashboard" 
//                 element={<PrivateRoute element={<PatientDashboard />} role="patient" />} 
//               />
//               <Route 
//                 path="/patient/dentists" 
//                 element={<PrivateRoute element={<DentistList />} role="patient" />} 
//               />
//               <Route 
//                 path="/patient/request-checkup/:dentistId" 
//                 element={<PrivateRoute element={<NewCheckupRequest />} role="patient" />} 
//               />
//               <Route 
//                 path="/patient/checkup/:requestId" 
//                 element={<PrivateRoute element={<CheckupDetails />} role="patient" />} 
//               />
              
//               {/* Dentist Routes */}
//               <Route 
//                 path="/dentist/dashboard" 
//                 element={<PrivateRoute element={<DentistDashboard />} role="dentist" />} 
//               />
//               <Route 
//                 path="/dentist/patients" 
//                 element={<PrivateRoute element={<PatientList />} role="dentist" />} 
//               />
//               <Route 
//                 path="/dentist/submit-result/:requestId" 
//                 element={<PrivateRoute element={<SubmitCheckupResult />} role="dentist" />} 
//               />
//             </Routes>
//           </div>
//         </Router>
//       </SocketProvider>
//     </AuthProvider>
//   );
// }

// export default App;
// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jwtDecode from 'jwt-decode';

// Components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';

// Auth Components
import Register from './components/auth/Register';
import Login from './components/auth/Login';

// Patient Components
import PatientDashboard from './components/patient/PatientDashboard';
import DentistList from './components/patient/DentistList';
import NewCheckupRequest from './components/patient/NewCheckupRequest';
import CheckupDetails from './components/patient/CheckupDetails';

// Dentist Components
import DentistDashboard from './components/dentist/DentistDashboard';
import PatientList from './components/dentist/PatientList';
import SubmitCheckupResult from './components/dentist/SubmitCheckupResult';

// Auth Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// RequireAuth component - for protected routes
const RequireAuth = ({ children, role }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Check if user has the required role
    if (role && decoded.role !== role) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  } catch (err) {
    localStorage.removeItem('token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

// Main AuthWrapper component to solve the Router context issue
const AuthWrapper = ({ children }) => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

function App() {
  return (
    <AuthWrapper>
      <div className="App">
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Patient Routes */}
          <Route 
            path="/patient/dashboard" 
            element={
              <RequireAuth role="patient">
                <PatientDashboard />
              </RequireAuth>
            } 
          />
          <Route 
            path="/patient/dentists" 
            element={
              <RequireAuth role="patient">
                <DentistList />
              </RequireAuth>
            } 
          />
          <Route 
            path="/patient/new-checkup" 
            element={
              <RequireAuth role="patient">
                <DentistList />
              </RequireAuth>
            } 
          />
          <Route 
            path="/patient/request-checkup/:dentistId" 
            element={
              <RequireAuth role="patient">
                <NewCheckupRequest />
              </RequireAuth>
            } 
          />
          <Route 
            path="/patient/checkup/:requestId" 
            element={
              <RequireAuth role="patient">
                <CheckupDetails />
              </RequireAuth>
            } 
          />
          
          {/* Dentist Routes */}
          <Route 
            path="/dentist/dashboard" 
            element={
              <RequireAuth role="dentist">
                <DentistDashboard />
              </RequireAuth>
            } 
          />
          <Route 
            path="/dentist/patients" 
            element={
              <RequireAuth role="dentist">
                <PatientList />
              </RequireAuth>
            } 
          />
          <Route 
            path="/dentist/submit-result/:requestId" 
            element={
              <RequireAuth role="dentist">
                <SubmitCheckupResult />
              </RequireAuth>
            } 
          />
          <Route 
            path="/dentist/checkup/:requestId" 
            element={
              <RequireAuth role="dentist">
                <CheckupDetails />
              </RequireAuth>
            } 
          />
        </Routes>
      </div>
    </AuthWrapper>
  );
}

export default App;