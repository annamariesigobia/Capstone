import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Calendar, ClipboardList, Map, Users,
  Navigation, FileBarChart, Menu, X, LogOut, ChevronDown,
  Sparkles, MessageSquare, User, Home, Utensils
} from 'lucide-react';
import FloatingChatbot from '../components/chatbot/FloatingChatbot';
import { messageService } from '../services/messageService';

export const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [msgUnread, setMsgUnread] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Poll unread message count every 5s for tourist & operator
  useEffect(() => {
    if (!user || (user.role !== 'tourist' && user.role !== 'operator')) return;
    const tick = () => setMsgUnread(messageService.getUnreadCount(user.uid, user.role));
    tick();
    const iv = setInterval(tick, 5000);
    const handler = () => tick();
    window.addEventListener('dinagat_new_message', handler);
    return () => { clearInterval(iv); window.removeEventListener('dinagat_new_message', handler); };
  }, [user]);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/dashboard/profile') {
      if (user?.role === 'admin') return 'Admin Profile';
      if (user?.role === 'operator') return 'Tour Agency Profile';
      return 'Tourist Profile';
    }
    if (p === '/dashboard') {
      if (user?.role === 'admin') return 'Admin Overview';
      if (user?.role === 'operator') return 'Tour Agency Overview';
      return 'Tourist';
    }
    if (p === '/dashboard/messages') return 'Private Messages';
    if (p === '/dashboard/bookings') return user?.role === 'operator' ? 'Guest Bookings' : 'My Bookings';
    if (p === '/dashboard/itineraries') return 'Saved Itineraries';
    if (p === '/dashboard/attractions') return 'Manage Attractions';
    if (p === '/dashboard/dining') return 'Manage Dining Facilities';
    if (p === '/dashboard/schedules') return 'Manage Schedules';
    if (p === '/dashboard/users') return 'Users Directory';
    if (p === '/dashboard/properties') return 'My Property';
    if (p === '/reports') return 'Analytics Reports';
    if (p === '/itinerary') return 'AI Itinerary Planner';
    if (p === '/chatbot') return 'AI Chat Assistant';
    return 'Dashboard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getSidebarLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { to: '/', label: 'Home', icon: Home },
          { to: '/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
          { to: '/dashboard/bookings', label: 'All Bookings', icon: ClipboardList },
          { to: '/dashboard/attractions', label: 'Manage Attractions', icon: Map },
          { to: '/dashboard/dining', label: 'Manage Dining', icon: Utensils },
          { to: '/dashboard/schedules', label: 'Manage Schedules', icon: Navigation },
          { to: '/dashboard/users', label: 'Users Directory', icon: Users },
          { to: '/dashboard/profile', label: 'Admin Profile', icon: User },
          { to: '/reports', label: 'Analytics Reports', icon: FileBarChart }
        ];
      case 'operator':
        return [
          { to: '/', label: 'Home', icon: Home },
          { to: '/dashboard', label: 'Tour Agency Overview', icon: LayoutDashboard },
          { to: '/dashboard/bookings', label: 'Guest Bookings', icon: ClipboardList },
          { to: '/dashboard/properties', label: 'My Property', icon: Calendar },
          { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: msgUnread },
          { to: '/dashboard/profile', label: 'Agency Profile', icon: User },
        ];
      case 'tourist':
      default:
        return [
          { to: '/', label: 'Home', icon: Home },
          { to: '/dashboard', label: 'Tourist Profile', icon: LayoutDashboard },
          { to: '/dashboard/bookings', label: 'My Bookings', icon: ClipboardList },
          { to: '/dashboard/itineraries', label: 'Saved Itineraries', icon: Map },
          { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: msgUnread },
          { to: '/itinerary', label: 'AI Itinerary Planner', icon: Sparkles },
          { to: '/chatbot', label: 'AI Chat Assistant', icon: MessageSquare }
        ];
    }
  };

  const links = getSidebarLinks();

  const handleLogout = async () => {
    setProfileDropdown(false);
    await logout();
    navigate('/');
  };

  /* ─── Sidebar content (reused in desktop + drawer) ─── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="bg-emerald-900 flex items-center justify-center py-5 px-4 shrink-0">
        <img
          src="/images/dinagat-seal.png"
          alt="Province of Dinagat Islands"
          className="h-14 w-14 rounded-full object-cover shadow-inner border border-emerald-700"
        />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              className={`flex flex-col items-center justify-center py-4 px-2 text-center transition-all duration-150 relative ${isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1 shrink-0" />
                {link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider leading-tight">
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* ═══ DESKTOP SIDEBAR (always visible, lg+) ═══ */}
      <aside className="hidden lg:flex flex-col w-[88px] bg-emerald-800 shrink-0 fixed left-0 top-0 bottom-0 z-30 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* ═══ MOBILE DRAWER OVERLAY ═══ */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ═══ MOBILE SLIDE DRAWER ═══ */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-[88px] bg-emerald-800 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-3 right-2 p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-700 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[88px]">

        {/* ─── TOP HEADER ─── */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm h-[56px] flex items-center px-4 gap-3">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page Title & Go to Landing Page Link */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <span className="text-sm font-extrabold uppercase tracking-widest text-slate-800 truncate">
              {getPageTitle()}
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-all shadow-sm shrink-0"
              title="View Public Landing Page"
            >
              <Home className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden xs:inline">Landing Page</span>
            </Link>
          </div>

          {/* Messages shortcut for tourist/operator */}
          {(user.role === 'tourist' || user.role === 'operator') && (
            <Link
              to="/dashboard/messages"
              className="relative p-2 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              title="Private Messages"
            >
              <MessageSquare className="h-5 w-5" />
              {msgUnread > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5">
                  {msgUnread > 9 ? '9+' : msgUnread}
                </span>
              )}
            </Link>
          )}

          {/* Right: User name + avatar + dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdown(!profileDropdown)}
              className="flex items-center space-x-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors"
            >
              <img
                src={user.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                alt={user.fullName}
                className="h-8 w-8 rounded-full border-2 border-emerald-400 object-cover shrink-0 aspect-square"
              />
              <span className="hidden sm:block text-xs font-bold text-slate-700 uppercase tracking-wide truncate max-w-[120px]">
                {user.fullName}
              </span>
              <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${profileDropdown ? 'rotate-180' : ''}`} />
            </button>
            {/* Dropdown */}
            {profileDropdown && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 border-b border-slate-100">
                  <p className="text-xs font-extrabold text-slate-800 truncate">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 capitalize">{user.role}</p>
                </div>
                <Link
                  to="/"
                  onClick={() => setProfileDropdown(false)}
                  className="flex items-center space-x-2 w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 font-semibold border-b border-slate-100"
                >
                  <Home className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Homepage</span>
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={() => setProfileDropdown(false)}
                  className="flex items-center space-x-2 w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 font-semibold border-b border-slate-100"
                >
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ─── PAGE CONTENT ─── */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 min-h-[calc(100vh-120px)]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating AI Chatbot — tourist only */}
      <FloatingChatbot />
    </div>
  );
};

export default DashboardLayout;
