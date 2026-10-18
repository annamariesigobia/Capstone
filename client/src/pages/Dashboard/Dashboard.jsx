import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminView } from './AdminView';
import { OperatorView } from './OperatorView';
import { TouristView } from './TouristView';

export const Dashboard = () => {
  const { user, loading } = useAuth();
  const { tab } = useParams();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Loading dashboard view...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="text-center p-8 text-xs text-slate-500">
        Please sign in to view this dashboard.
      </div>
    );
  }

  if (tab === 'itineraries') {
    return <TouristView />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminView />;
    case 'operator':
      return <OperatorView />;
    case 'tourist':
    default:
      return <TouristView />;
  }
};

export default Dashboard;
