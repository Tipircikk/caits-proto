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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/database" element={<Database />} />
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
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;