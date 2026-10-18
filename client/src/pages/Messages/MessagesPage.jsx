import React from 'react';
import { PrivateMessages } from '../../components/messages/PrivateMessages';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const MessagesPage = () => {
  const { user } = useAuth();

  // Only tourist and operator can access this page
  if (user && user.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="text-left w-full">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Private Messages
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">
          {user?.role === 'tourist'
            ? 'Chat privately with tour agencies about bookings, availability, or special requests.'
            : 'Chat privately with tourists. Answer inquiries about your properties and services.'}
        </p>
      </div>
      <PrivateMessages />
    </div>
  );
};

export default MessagesPage;
