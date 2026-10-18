import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RedirectIfAuth from '../components/common/RedirectIfAuth';
import { useAuth } from '../contexts/AuthContext';

import Home from '../pages/Home/Home';
import Attractions from '../pages/Attractions/Attractions';
import Accommodations from '../pages/Accommodation/Accommodations';
import Dining from '../pages/Dining/Dining';
import Transportation from '../pages/Transportation/Transportation';
import Itinerary from '../pages/Itinerary/Itinerary';
import Chatbot from '../pages/Chatbot/Chatbot';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';

import Dashboard from '../pages/Dashboard/Dashboard';
import ReportsPage from '../pages/Reports/ReportsPage';
import MessagesPage from '../pages/Messages/MessagesPage';

// Renders DashboardLayout for logged in users, and MainLayout for guests
const ConditionalLayout = () => {
  const { user } = useAuth();
  return user ? <DashboardLayout /> : <MainLayout />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes under MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/attractions" element={<Attractions />} />
        <Route path="/accommodations" element={<Accommodations />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/transportation" element={<Transportation />} />
        <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
      </Route>

      {/* Adaptive Routes: DashboardLayout if logged in, MainLayout if guest */}
      <Route element={<ConditionalLayout />}>
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Route>

{/* Protected Dashboard Routes under DashboardLayout */}
      <Route element={<DashboardLayout />}>

        {}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['admin', 'operator', 'tourist']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/:tab" element={
          <ProtectedRoute roles={['admin', 'operator', 'tourist']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {}
        <Route path="/tourist-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/tourist-dashboard/:tab" element={<Navigate to="/dashboard" replace />} />
        <Route path="/operator-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/operator-dashboard/:tab" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin-dashboard/:tab" element={<Navigate to="/dashboard" replace />} />

        {}
        {/* Messages — tourist & operator only */}
        <Route path="/dashboard/messages" element={
          <ProtectedRoute roles={['tourist', 'operator']}>
            <MessagesPage />
          </ProtectedRoute>
        } />

        {/* Analytics — admin only */}
        <Route path="/reports" element={
          <ProtectedRoute roles={['admin']}>
            <ReportsPage />
          </ProtectedRoute>
        } />

      </Route>
{/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
