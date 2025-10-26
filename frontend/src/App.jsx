// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Webhooks from './pages/Webhooks';
import Deliveries from './pages/Deliveries';
import Failed from './pages/Failed';
import Metrics from './pages/Metrics';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { getAdminKey } from './lib/auth';

function Protected({ children }) {
  const key = getAdminKey();
  if (!key) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }) {
  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Sidebar />
        <div className="page">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const loggedIn = Boolean(getAdminKey());

  return (
    <Routes>
      {/* Public login route: no sidebar or shell */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes within the app shell */}
      <Route
        path="/webhooks"
        element={
          <Protected>
            <Shell><Webhooks /></Shell>
          </Protected>
        }
      />
      <Route
        path="/deliveries"
        element={
          <Protected>
            <Shell><Deliveries /></Shell>
          </Protected>
        }
      />
      <Route
        path="/failed"
        element={
          <Protected>
            <Shell><Failed /></Shell>
          </Protected>
        }
      />
      <Route
        path="/metrics"
        element={
          <Protected>
            <Shell><Metrics /></Shell>
          </Protected>
        }
      />

      {/* Default: redirect based on auth */}
      <Route
        path="/"
        element={loggedIn ? <Navigate to="/webhooks" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={loggedIn ? <Navigate to="/webhooks" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
