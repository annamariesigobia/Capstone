import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import {
  Compass, Bell, User, LogOut, ShieldAlert, Sparkles, Menu, X,
  MapPin, Phone, Mail,
  ChevronDown, Home
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isMock, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const aboutRef = useRef(null);

  const isDashboard = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/reports');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target)) {
        setAboutDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadNotifs = async () => {
      try {
        const list = await bookingService.getNotifications(user.uid);
        setNotifications(list);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    loadNotifs();

    let timer;
    if (isMock) {
      timer = setInterval(loadNotifs, 3000);
    }
    return () => timer && clearInterval(timer);
  }, [user, isMock]);

  const handleMarkAsRead = async (id) => {
    await bookingService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinkClass = ({ isActive }) =>
    `nav-link-tourist ${isActive ? 'nav-link-active' : ''}`;

  return (
    <>
      { }
      {!isDashboard && (
        <div className={`topbar-tourist ${scrolled ? 'topbar-hidden' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
            <div className="flex flex-col md:flex-row items-center md:space-x-6 gap-1 md:gap-0 text-[11px] md:text-xs w-full justify-center md:justify-start">
              <span className="flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-300" />
                <span className="font-semibold">Email: PTO.dinagat@gmail.com</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-300" />
                <span className="font-semibold">Hotline: 0909-013-7306</span>
              </span>
            </div>
          </div>
        </div>
      )}
      {/* ═══════ Main Navigation ═══════ */}
      <nav className={`main-nav-tourist ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            {!isDashboard && (
              <Link to="/" className="flex items-center space-x-3 shrink-0 group">
                <img
                  src="/images/dinagat-seal.png"
                  alt="Province of Dinagat Islands"
                  className="h-12 w-12 rounded-full object-cover shadow-md border-2 border-emerald-600/30 group-hover:scale-105 transition-transform"
                />
                <div className="block">
                  <span className="block text-base sm:text-lg font-extrabold tracking-tight text-emerald-800 leading-tight group-hover:text-emerald-700 transition-colors">
                    DINAGAT ISLANDS
                  </span>
                </div>
              </Link>
            )}

            {/* Desktop Nav Links */}
            {!isDashboard && (
              <div className="hidden lg:flex items-center space-x-1">
                <NavLink to="/" end className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/attractions" className={navLinkClass}>
                  Attractions
                </NavLink>
                <NavLink to="/accommodations" className={navLinkClass}>
                  Accommodations
                </NavLink>
                <NavLink to="/dining" className={navLinkClass}>
                  Restaurants &amp; Dining
                </NavLink>
                <NavLink to="/transportation" className={navLinkClass}>
                  Transportation Schedules
                </NavLink>
                <NavLink to="/itinerary" className={navLinkClass}>
                  AI Itinerary Planner
                </NavLink>
                <NavLink to="/chatbot" className={navLinkClass}>
                  AI Chat Assistant
                </NavLink>

              </div>
            )}

            {/* Right Action Icons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Quick Mock Role Switcher */}
              {isMock && user && (
                <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2.5 py-1 rounded-full">
                  <span className="font-semibold">Test Role:</span>
                  <select
                    value={user.role}
                    onChange={(e) => switchRole(e.target.value)}
                    className="bg-transparent font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="tourist">Tourist</option>
                    <option value="operator">Tour Agency</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              {user ? (
                <>
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifDropdown(!showNotifDropdown);
                        setShowProfileDropdown(false);
                      }}
                      className="p-2 text-slate-500 hover:text-emerald-600 rounded-full hover:bg-emerald-50 focus:outline-none relative transition-colors"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifDropdown && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
                          <span className="text-xs font-bold text-slate-800">Notifications</span>
                          <span className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">No notifications yet.</div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleMarkAsRead(notif.id)}
                                className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-emerald-50/30' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-xs font-semibold text-slate-800">{notif.title}</span>
                                  {!notif.isRead && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1" />}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 leading-normal">{notif.message}</p>
                                <span className="text-[9px] text-slate-400 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(!showProfileDropdown);
                        setShowNotifDropdown(false);
                      }}
                      className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-50 focus:outline-none"
                    >
                      <img
                        src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                        alt={user.fullName}
                        className="h-8 w-8 rounded-full border-2 border-emerald-500/30 object-cover shrink-0 aspect-square"
                      />
                      <span className="text-xs font-semibold text-slate-700 hidden lg:block">{user.fullName}</span>
                    </button>

                    { }
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 bg-emerald-50 text-left">
                          <p className="text-xs font-bold text-slate-800 truncate">{user.fullName}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                          <span className="inline-block text-[9px] font-bold tracking-wider uppercase bg-emerald-700 text-white px-2 py-0.5 rounded-md mt-1.5">
                            {user.role}
                          </span>

                        </div>

                        { }
                        <Link
                          to="/"
                          className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 font-semibold border-b border-slate-100"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <Home className="h-4 w-4 text-emerald-600" />
                          <span>Go to Homepage</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 font-semibold"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <ShieldAlert className="h-4 w-4" />
                          <span>Go to Dashboard</span>

                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold border-t border-slate-100"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>

                        </button>
                      </div>

                    )}

                  </div>
                </>

              ) : (

                <div className="flex items-center space-x-3">

                  <Link to="/login" className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors whitespace-nowrap">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-register-tourist">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu-tourist ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          {!isDashboard && (
            <>
              <NavLink to="/" className="mobile-link-tourist" onClick={() => setMobileMenuOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/attractions" className="mobile-link-tourist" onClick={() => setMobileMenuOpen(false)}>
                Attractions
              </NavLink>
              <NavLink to="/accommodations" className="mobile-link-tourist" onClick={() => setMobileMenuOpen(false)}>
                Accommodations
              </NavLink>
              <NavLink to="/dining" className="mobile-link-tourist" onClick={() => setMobileMenuOpen(false)}>
                Restaurants &amp; Dining
              </NavLink>
              <NavLink to="/transportation" className="mobile-link-tourist" onClick={() => setMobileMenuOpen(false)}>
                Transportation Schedules
              </NavLink>
              <NavLink to="/itinerary" className="mobile-link-tourist" onClick={() => setMobileMenuOpen(false)}>
                AI Itinerary Planner
              </NavLink>
              <NavLink to="/chatbot" className="mobile-link-tourist" onClick={() => setMobileMenuOpen(false)}>
                AI Chat Assistant
              </NavLink>
            </>
          )}

          <hr className="border-slate-100 my-2" />

          {user ? (
            <div className="space-y-2 pt-2 px-4 pb-4">
              <Link
                to="/dashboard"
                className="block text-sm font-bold text-emerald-600 p-2 rounded-lg hover:bg-emerald-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left text-sm font-bold text-rose-600 p-2 rounded-lg hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-2 px-4 pb-4">
              <Link to="/login" className="text-center text-sm font-bold text-slate-700 border border-slate-200 py-2.5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="text-center text-sm font-bold bg-emerald-700 text-white py-2.5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
