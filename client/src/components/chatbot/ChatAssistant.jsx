import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatbotService } from '../../services/chatbotService';
import { Send, Sparkles, ArrowRight, User, Bot, Trash2 } from 'lucide-react';

const parseMarkdown = (text) => {
  if (!text) return '';
  let parsed = text;

parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

parsed = parsed.replace(/^\*\s+(.*?)$/gm, '<li class="ml-4 list-disc">$1</li>');
  parsed = parsed.replace(/^-\s+(.*?)$/gm, '<li class="ml-4 list-disc">$1</li>');

return parsed.split('\n').join('<br />');
};

export const ChatAssistant = ({ inline = false }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const clearChat = () => {
    chatbotService.resetSession();
    const welcomeText = user
      ? `Hi ${user.fullName || 'there'}! 🌴 I'm **Isla AI**, your Dinagat Islands travel guide. Ask me anything about beaches, resorts, ferry schedules, or custom itineraries!`
      : `Welcome! 🌴 I'm **Isla AI**, your Dinagat Islands AI Assistant. Ask me anything about beaches, attractions, hotels, or ferry schedules — no login required!`;
    setMessages([{ type: 'bot', text: welcomeText }]);
  };

  useEffect(() => {
    if (!user) {
      // Guest mode: show welcome message without loading logs
      setMessages([{
        type: 'bot',
        text: `Welcome! 🌴 I am your **Dinagat Islands AI Assistant**. Ask me anything about beaches, attractions, hotels, or ferry schedules — no login required!`
      }]);
      return;
    }

    const loadLogs = async () => {
      try {
        const logs = await chatbotService.getChatLogs(user.uid);
        
        const mapped = [];
        logs.forEach(log => {
          mapped.push({ type: 'user', text: log.prompt });
          mapped.push({ type: 'bot', text: log.response });
        });

        if (mapped.length === 0) {
          mapped.push({
            type: 'bot',
            text: `Hi ${user.fullName || 'there'}! 🌴 I am your **Dinagat Islands AI Assistant**. Ask me anything about beaches, attractions, hotels, or ferry schedules!`
          });
        }
        setMessages(mapped);
      } catch (err) {
        console.error("Error fetching chat logs", err);
      }
    };
    loadLogs();
  }, [user]);

  useEffect(() => {
    
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    if (!textToSend) setInput('');

    setMessages(prev => [...prev, { type: 'user', text: prompt }]);
    setLoading(true);

    try {
      // Use user.uid if logged in, otherwise 'guest' for anonymous usage
      const userId = user ? user.uid : 'guest';
      const chatLog = await chatbotService.sendMessage(userId, prompt);
      setMessages(prev => [...prev, { type: 'bot', text: chatLog.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I had trouble reaching the AI service. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What are the best beaches in Dinagat Islands?",
    "Tell me about the mystery of Lake Bababu",
    "Transportation schedules from Surigao Port",
    "Where is Isla Beach Resort located?"
  ];

  return (
    <div className={`flex flex-col bg-white border border-slate-100 rounded-2xl shadow-lg overflow-hidden ${inline ? 'h-[600px]' : 'h-[500px]'}`}>
      
      {}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-left">
          <div className="p-1.5 bg-white/10 rounded-xl">
            <Sparkles className="h-5 w-5 text-amber-300 fill-amber-300/20" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight">Isla AI — Travel Guide</h3>
            <p className="text-[10px] text-teal-100">Dinagat Islands Assistant • Powered by Gemini 1.5 Flash</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          title="Clear conversation"
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4 text-white/80" />
        </button>
      </div>

      {}
      <div 
        ref={scrollRef}
        className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-50/50"
      >
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex items-start space-x-2.5 max-w-[85%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'}`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${msg.type === 'user' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'}`}>
              {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
<div 
              className={`p-3 rounded-2xl text-xs text-left leading-relaxed ${
                msg.type === 'user' 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-none shadow-sm'
              }`}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} 
                className="prose prose-sm"
              />
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start space-x-2.5 mr-auto max-w-[85%]">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 bg-white border border-slate-200/60 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center space-x-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce delay-100" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce delay-200" />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Prompts */}
      {messages.length <= 2 && !loading && (
        <div className="p-3 bg-white border-t border-slate-100/80">
          <p className="text-[10px] font-bold text-slate-400 text-left mb-1.5 tracking-wider uppercase">Suggested Questions</p>
          <div className="flex flex-col space-y-1">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="flex items-center justify-between text-left text-[11px] text-teal-600 hover:text-teal-700 hover:bg-teal-50/50 p-2 rounded-lg font-semibold transition-colors group"
              >
                <span>{sug}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about travel advice, hotels, coves..."
          className="flex-grow text-xs border border-slate-200 rounded-xl px-4.5 py-3.5 focus:outline-none focus:border-teal-500 transition-all font-semibold"
          disabled={loading}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          className="p-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/10 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
};

export default ChatAssistant;
