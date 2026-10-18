import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatbotService } from '../../services/chatbotService';
import { Send, Sparkles, ArrowRight, User, Bot, Trash2, X, MessageCircle } from 'lucide-react';

const parseMarkdown = (text) => {
  if (!text) return '';
  let parsed = text;
  parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/^\*\s+(.*?)$/gm, '<li class="ml-4 list-disc">$1</li>');
  parsed = parsed.replace(/^-\s+(.*?)$/gm, '<li class="ml-4 list-disc">$1</li>');
  return parsed.split('\n').join('<br />');
};

/** Floating chatbot bubble — only shown to tourist role */
export const FloatingChatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef(null);

  // Only show for tourist
  if (!user || user.role !== 'tourist') return null;

  const welcome = user
    ? `Hi ${user.fullName?.split(' ')[0] || 'there'}! 🌴 I'm **Isla AI**. Ask me anything about Dinagat Islands — beaches, resorts, ferry schedules, or travel tips!`
    : `Welcome! 🌴 I'm **Isla AI**. Ask me about Dinagat Islands!`;

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ type: 'bot', text: welcome }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;
    if (!textToSend) setInput('');

    setMessages(prev => [...prev, { type: 'user', text: prompt }]);
    setLoading(true);
    if (!open) setUnread(u => u + 1);

    try {
      const userId = user ? user.uid : 'guest';
      const chatLog = await chatbotService.sendMessage(userId, prompt);
      setMessages(prev => [...prev, { type: 'bot', text: chatLog.response }]);
      if (!open) setUnread(u => u + 1);
    } catch {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I had trouble reaching the AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
  };

  const suggestions = [
    'Best beaches in Dinagat?',
    'Transportation schedule from Surigao',
    'Local foods to try',
  ];

  return (
    <>
      {/* Floating bubble button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-full shadow-2xl shadow-teal-700/40 flex items-center justify-center hover:scale-110 transition-transform duration-200 group"
          title="Chat with Isla AI"
        >
          <MessageCircle className="h-6 w-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[999] w-[350px] sm:w-[380px] max-h-[520px] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/15 rounded-xl">
                <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300/20" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-tight">Isla AI — Travel Guide</h3>
                <p className="text-[9px] text-teal-100">Powered by Gemini · Dinagat Islands</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { chatbotService.resetSession(); setMessages([{ type: 'bot', text: welcome }]); }}
                title="Clear chat"
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-white/80" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-3.5 w-3.5 text-white/80" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-3 space-y-3 overflow-y-auto bg-slate-50/60">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 max-w-[90%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`p-1.5 rounded-xl shrink-0 ${msg.type === 'user' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                  {msg.type === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed text-left ${
                  msg.type === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-none shadow-sm'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2 mr-auto">
                <div className="p-1.5 rounded-xl bg-slate-200 text-slate-600 shrink-0">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="p-2.5 bg-white border border-slate-200/60 rounded-xl rounded-tl-none text-[11px] text-slate-400 flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce delay-100" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && !loading && (
            <div className="px-3 pb-1 pt-2 bg-white border-t border-slate-100 shrink-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick questions</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="text-[10px] text-teal-600 bg-teal-50 border border-teal-100 hover:bg-teal-100 font-semibold px-2.5 py-1 rounded-full transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Dinagat Islands..."
              className="flex-1 text-[11px] border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 font-semibold"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
