import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from './pages/Home.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';

// Layouts
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Dashboard Pages
import EnergyDashboard from './pages/dashboard/EnergyDashboard.jsx';
import Analytics from './pages/Dashboard.jsx'; // we map the old Dashboard file for Analytics
import Recommendations from './pages/dashboard/Recommendations.jsx';
import Appliances from './pages/dashboard/Appliances.jsx';
import Alerts from './pages/dashboard/Alerts.jsx';
import Settings from './pages/dashboard/Settings.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default route inside /dashboard redirects to /dashboard/energy */}
          <Route index element={<Navigate to="energy" replace />} />
          
          <Route path="energy" element={<EnergyDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="appliances" element={<Appliances />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback for debugging */}
      <Route path="*" element={
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
          <p className="text-slate-400 mb-4">Path: {window.location.pathname}</p>
          <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-indigo-600 rounded">Go Home</button>
        </div>
      } />
    </Routes>
  );
}

export default App;
