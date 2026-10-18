import React from 'react';
import ChatAssistant from '../../components/chatbot/ChatAssistant';
import { Sparkles, MessageSquare } from 'lucide-react';

export const Chatbot = () => {
  return (
    <div className="text-left w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-teal-600" />
          <span>Interactive AI Travel Assistant</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chat with our AI to learn about beaches, routes, resorts, dining, and custom guidelines for Dinagat Islands — no account required.
        </p>
      </div>

      <ChatAssistant inline={true} />
    </div>
  );
};

export default Chatbot;
