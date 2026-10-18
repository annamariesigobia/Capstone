import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Youtube, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer-tourist">
      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/images/dinagat-seal.png"
                alt="Province of Dinagat Islands"
                className="h-12 w-12 rounded-full object-cover shadow-md border-2 border-white/30"
              />
              <div>
                <span className="block text-xl font-extrabold text-white tracking-tight">DINAGAT ISLANDS</span>

              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-sm">
              Discover the mystic beauties of the Dinagat Islands. A centralized booking, itinerary planning, and AI travel assistant system designed to elevate your travel experiences.
            </p>
            <div>

              <div className="flex items-center space-x-3">
                <a href="#" className="footer-social-tourist"><Facebook className="h-4 w-4" /></a>
                <a href="#" className="footer-social-tourist"><Twitter className="h-4 w-4" /></a>
                <a href="#" className="footer-social-tourist"><Linkedin className="h-4 w-4" /></a>
                <a href="#" className="footer-social-tourist"><Youtube className="h-4 w-4" /></a>
                <a href="#" className="footer-social-tourist"><Instagram className="h-4 w-4" /></a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-heading-tourist">About Us</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/attractions" className="footer-link-tourist">
                  <span>Attractions</span>
                </Link>
              </li>
              <li>
                <Link to="/accommodations" className="footer-link-tourist">
                  <span>Accommodations</span>
                </Link>
              </li>
              <li>
                <Link to="/itinerary" className="footer-link-tourist">
                  <span>AI Itinerary Planner</span>
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="footer-link-tourist">
                  <span>AI Travel Chat</span>
                </Link>
              </li>
              <li>
                <Link to="/transportation" className="footer-link-tourist">
                  <span>Transportation Schedules</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h4 className="footer-heading-tourist">Core Features</h4>
            <ul className="space-y-3">
              <li>
                <span className="footer-link-tourist">
                  <span>Interactive Leaflet Mapping</span>
                </span>
              </li>
              <li>
                <span className="footer-link-tourist">
                  <span>AI Travel Planner & Custom Itineraries</span>
                </span>
              </li>
              <li>
                <span className="footer-link-tourist">
                  <span>Transportation & Local Banca Schedules</span>
                </span>
              </li>
              <li>
                <span className="footer-link-tourist">
                  <span>Tour Agency Booking Dashboard & Portals</span>
                </span>
              </li>
              <li>
                <span className="footer-link-tourist">
                  <span>Real-time AI Chatbot Assistant</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="footer-bottom-tourist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center py-4">
          <span className="text-xs text-white/60 text-center">
            &copy; {new Date().getFullYear()} Integrated Tourism System of Dinagat Islands. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
