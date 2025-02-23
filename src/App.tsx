import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import PendingApprovals from './components/PendingApprovals';
import Database from './components/Database';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { isAuthenticated, currentUser } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && currentUser?.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function App() {
  const { isAuthenticated } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route
          path="/database"
          element={
            <PrivateRoute>
              <Database />
            </PrivateRoute>
          }
        />
        <Route
          path="/pending-approvals"
          element={
            <PrivateRoute adminOnly>
              <PendingApprovals />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;