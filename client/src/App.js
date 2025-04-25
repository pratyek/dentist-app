// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PatientDashboard from './components/patient/PatientDashboard';
import NewCheckupRequest from './components/patient/NewCheckupRequest';
import DentistDashboard from './components/dentist/DentistDashboard';
import SubmitCheckupResult from './components/dentist/SubmitCheckupResult';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/patient/dashboard"
                element={
                  <PrivateRoute roles={['patient']}>
                    <PatientDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/new-checkup"
                element={
                  <PrivateRoute roles={['patient']}>
                    <NewCheckupRequest />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dentist/dashboard"
                element={
                  <PrivateRoute roles={['dentist']}>
                    <DentistDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dentist/checkup/:id"
                element={
                  <PrivateRoute roles={['dentist']}>
                    <SubmitCheckupResult />
                  </PrivateRoute>
                }
              />
            </Routes>
            <ToastContainer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;