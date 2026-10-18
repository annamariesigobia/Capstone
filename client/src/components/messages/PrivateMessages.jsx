import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/messageService';
import {
  Send, MessageSquare, Search, User, ArrowLeft,
  CheckCheck, Clock, Plus, Inbox
} from 'lucide-react';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Avatar = ({ name, image, size = 'md' }) => {
  const sz = size === 'sm' ? 'h-8 w-8 text-[10px]' : size === 'lg' ? 'h-12 w-12 text-sm' : 'h-10 w-10 text-xs';
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return image
    ? <img src={image} alt={name} className={`${sz} rounded-full object-cover shrink-0 border border-slate-200`} />
    : <div className={`${sz} rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black shrink-0`}>{initials}</div>;
};

export const PrivateMessages = () => {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeConv, setActiveConv] = useState(null); // { otherUid, otherName, otherImage }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const scrollRef = useRef(null);
  const pollRef = useRef(null);

  // Load inbox
  const loadInbox = useCallback(async () => {
    if (!user) return;
    const data = await messageService.getInbox(user.uid, user.role);
    setInbox(data);
    setUnreadTotal(messageService.getUnreadCount(user.uid, user.role));
  }, [user]);

  useEffect(() => {
    loadInbox();
    // Load contactable users
    const c = messageService.getContactableUsers(user?.role);
    setContacts(c);

    // Auto-open a conversation if navigated here via startConversation()
    const pending = sessionStorage.getItem('dinagat_open_conv');
    if (pending) {
      try {
        const conv = JSON.parse(pending);
        sessionStorage.removeItem('dinagat_open_conv');
        openConversation({ otherUid: conv.otherUid, otherName: conv.otherName });
      } catch {}
    }
  }, [loadInbox]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadInbox();
      if (activeConv) loadConversation(activeConv.otherUid);
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [activeConv, loadInbox]);

  // Listen for dispatched events
  useEffect(() => {
    const handler = () => {
      loadInbox();
      if (activeConv) loadConversation(activeConv.otherUid);
    };
    window.addEventListener('dinagat_new_message', handler);
    return () => window.removeEventListener('dinagat_new_message', handler);
  }, [activeConv]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversation = async (otherUid) => {
    if (!user || !otherUid) return;
    const data = await messageService.getConversation(user.uid, otherUid, user.role);
    setMessages(data);
    await messageService.markConversationRead(user.uid, otherUid, user.uid, user.role);
    loadInbox();
  };

  const openConversation = async (conv) => {
    // conv can be from inbox or a new contact
    const other = {
      otherUid: conv.otherUid || conv.uid,
      otherName: conv.otherName || conv.fullName,
      otherImage: conv.profileImage || null,
    };
    setActiveConv(other);
    setShowNewChat(false);
    await loadConversation(other.otherUid);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      await messageService.sendMessage({
        senderUid: user.uid,
        senderName: user.fullName || user.email,
        receiverUid: activeConv.otherUid,
        receiverName: activeConv.otherName,
        text: input.trim(),
      });
      setInput('');
      await loadConversation(activeConv.otherUid);
    } finally {
      setSending(false);
    }
  };

  const filteredInbox = inbox.filter(c =>
    (c.otherName || '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredContacts = contacts.filter(c =>
    (c.fullName || '').toLowerCase().includes(search.toLowerCase()) &&
    !inbox.some(ic => ic.otherUid === c.uid)
  );

  const roleLabel = user?.role === 'tourist' ? 'Tour Agencies' : 'Tourists';

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[500px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">

      {/* ── LEFT PANEL: Inbox ── */}
      <div className={`flex flex-col bg-white border-r border-slate-100 ${activeConv ? 'hidden md:flex w-[280px] shrink-0' : 'flex w-full md:w-[280px] shrink-0'}`}>

        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Inbox className="h-4 w-4 text-teal-600" />
              Messages
              {unreadTotal > 0 && (
                <span className="px-1.5 py-0.5 bg-teal-600 text-white rounded-full text-[9px] font-black">{unreadTotal}</span>
              )}
            </h3>
            <button
              onClick={() => { setShowNewChat(!showNewChat); setActiveConv(null); }}
              className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition-colors"
              title={`New message to ${roleLabel}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[11px] border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 font-semibold bg-slate-50"
            />
          </div>
        </div>

        {/* New chat — contacts list */}
        {showNewChat && (
          <div className="border-b border-slate-100">
            <p className="px-4 pt-3 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Start a new conversation with {roleLabel}
            </p>
            {filteredContacts.length === 0 && !search && (
              <p className="px-4 py-3 text-[11px] text-slate-400 font-semibold">No {roleLabel.toLowerCase()} available yet.</p>
            )}
            {filteredContacts.map(c => (
              <button
                key={c.uid}
                onClick={() => openConversation(c)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left"
              >
                <Avatar name={c.fullName} image={c.profileImage} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{c.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate capitalize">{c.role}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredInbox.length === 0 && !showNewChat && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12 space-y-2">
              <MessageSquare className="h-8 w-8 text-slate-200" />
              <p className="text-xs font-bold text-slate-400">No conversations yet</p>
              <p className="text-[10px] text-slate-300 font-semibold">
                Click <strong>+</strong> to start a conversation with a {roleLabel.slice(0, -1)}
              </p>
            </div>
          )}
          {filteredInbox.map(conv => (
            <button
              key={conv.conversationId}
              onClick={() => openConversation(conv)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 transition-colors text-left border-b border-slate-50 ${
                activeConv?.otherUid === conv.otherUid ? 'bg-teal-50 border-l-2 border-l-teal-500' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar name={conv.otherName} image={null} size="sm" />
                {conv.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`text-xs truncate ${conv.unread > 0 ? 'font-extrabold text-slate-900' : 'font-bold text-slate-700'}`}>
                    {conv.otherName}
                  </p>
                  <span className="text-[9px] text-slate-400 font-semibold shrink-0 ml-1">{formatTime(conv.lastMsg?.createdAt)}</span>
                </div>
                <p className={`text-[10px] truncate ${conv.unread > 0 ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>
                  {conv.lastMsg?.senderUid === user.uid ? '↗ You: ' : ''}{conv.lastMsg?.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Active Conversation ── */}
      {activeConv ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat header */}
          <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveConv(null)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Avatar name={activeConv.otherName} image={activeConv.otherImage} size="md" />
            <div>
              <p className="text-sm font-extrabold text-slate-800">{activeConv.otherName}</p>
              <p className="text-[10px] text-slate-400 font-semibold capitalize">
                {user?.role === 'tourist' ? 'Tour Agency' : 'Tourist'}
              </p>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-2">
                <MessageSquare className="h-10 w-10 text-slate-200" />
                <p className="text-xs font-bold text-slate-400">No messages yet</p>
                <p className="text-[10px] text-slate-300">Send a message to start the conversation</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMine = msg.senderUid === user.uid || (user.role === 'operator' && (msg.senderUid === 'mock-operator-uid' || msg.senderUid?.includes('operator')));
              const showDate = idx === 0 ||
                new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-2 my-4">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[9px] font-bold text-slate-400 bg-white px-3 py-0.5 rounded-full border border-slate-200">
                        {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMine && <Avatar name={activeConv.otherName} image={activeConv.otherImage} size="sm" />}
                    <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                        isMine
                          ? 'bg-teal-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[9px] text-slate-400 font-semibold">{formatTime(msg.createdAt)}</span>
                        {isMine && (
                          msg.isRead
                            ? <CheckCheck className="h-3 w-3 text-teal-500" />
                            : <Clock className="h-3 w-3 text-slate-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-100 px-4 py-3 flex items-center gap-2.5 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Message ${activeConv.otherName}...`}
              className="flex-1 text-xs border border-slate-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-teal-400 font-semibold bg-slate-50 transition-colors"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-sm transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty state when no conversation selected */
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center px-6 bg-slate-50/50">
          <div className="p-5 bg-teal-50 rounded-full mb-4">
            <MessageSquare className="h-10 w-10 text-teal-400" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-700">Private Messages</h3>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs font-medium">
            {user?.role === 'tourist'
              ? 'Send private messages to tour agencies. Ask about availability, packages, or special requests.'
              : 'Communicate directly with tourists. Respond to inquiries about your properties and services.'}
          </p>
          <button
            onClick={() => setShowNewChat(true)}
            className="mt-5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Start a Conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default PrivateMessages;
