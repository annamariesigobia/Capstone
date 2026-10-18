import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { attractionService } from '../../services/attractionService';
import { transportationService } from '../../services/transportationService';
import { diningService } from '../../services/diningService';
import InteractiveMap from '../../components/maps/InteractiveMap';
import {
  Sparkles, Calendar, ArrowRight, Star, Compass,
  MapPin, Ship, Bot, Map, Palmtree, Tag, Clock, Info, Utensils
} from 'lucide-react';

const heroSlides = [
  {
    image: '/images/hero-bg-1.png',
    title: 'Adventure To Visit Dinagat Islands',
    subtitle: 'Pristine beaches, mystic rock formations, and crystal-clear waters await you in the heart of the Philippines.',
  },
  {
    image: '/images/hero-bg-2.png',
    title: 'Plan Your Perfect Getaway',
    subtitle: 'AI-powered itineraries, real-time ferry schedules, and seamless resort booking — all in one integrated platform.',
  },
  {
    image: '/images/hero-bg-3.png',
    title: 'Experience Nature\'s Wonders',
    subtitle: 'Explore tidal pools, limestone cathedrals, and vibrant coral reefs. The adventure of a lifetime starts here.',
  },
];

const quickLinks = [
  { icon: MapPin, label: 'Attractions', to: '/attractions', color: 'from-emerald-600 to-emerald-700' },
  { icon: Calendar, label: 'Accommodations', to: '/accommodations', color: 'from-emerald-700 to-emerald-800' },
  { icon: Utensils, label: 'Restaurants & Dining', to: '/dining', color: 'from-emerald-600 to-emerald-700' },
  { icon: Ship, label: 'Transportation Schedules', to: '/transportation', color: 'from-emerald-700 to-emerald-800' },
  { icon: Sparkles, label: 'AI Planner', to: '/itinerary', color: 'from-emerald-600 to-emerald-700' },
  { icon: Bot, label: 'AI Chat', to: '/chatbot', color: 'from-emerald-700 to-emerald-800' },
];

export const Home = () => {
  const [attractions, setAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [diningSpots, setDiningSpots] = useState([]);
  const [activeScheduleTab, setActiveScheduleTab] = useState('sjToSur');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const list = await attractionService.getAttractions();
        setAttractions(list);
        if (list.length > 0) {
          setSelectedAttraction(list[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const fetchSchedules = async () => {
      try {
        const scheds = await transportationService.getSchedules();
        setSchedules(scheds);
      } catch (err) {
        console.error('Failed to fetch schedules:', err);
      }
    };
    const fetchDining = async () => {
      try {
        const spots = await diningService.getDiningSpots();
        setDiningSpots(spots);
      } catch (err) {
        console.error('Failed to fetch dining spots:', err);
      }
    };
    fetchFeatured();
    fetchSchedules();
    fetchDining();
  }, []);

  const sjToSurigao = schedules.filter(item => {
    const r = (item.route || '').toLowerCase();
    const sjIdx = r.indexOf('san jose');
    const surIdx = r.indexOf('surigao');
    if (sjIdx !== -1 && surIdx !== -1 && sjIdx < surIdx) return true;
    return item.id && item.id.includes('sj-sur');
  });

  const surigaoToSj = schedules.filter(item => {
    const r = (item.route || '').toLowerCase();
    const sjIdx = r.indexOf('san jose');
    const surIdx = r.indexOf('surigao');
    if (sjIdx !== -1 && surIdx !== -1 && surIdx < sjIdx) return true;
    return item.id && item.id.includes('sur-sj');
  });

  const handleQuickLinkClick = (e, to) => {
    if (to.startsWith('#')) {
      e.preventDefault();
      const el = document.getElementById(to.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 flex flex-col items-center">

      { }
      <section className="w-full relative overflow-hidden" style={{ minHeight: '80vh' }}>
        { }
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-all duration-[800ms] ease-in-out"
            style={{
              opacity: currentSlide === idx ? 1 : 0,
              transform: currentSlide === idx ? 'scale(1)' : 'scale(1.08)',
              zIndex: currentSlide === idx ? 1 : 0,
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            { }
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-emerald-900/60 to-emerald-900/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>
        ))}
        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4" style={{ minHeight: '80vh' }}>
          {/* Badge */}
          <div className="hero-badge-tourist hero-fade-up hero-delay-1">
            <Palmtree className="h-4 w-4 text-amber-400 hero-float" />
            <span>Province of Dinagat Islands • Philippines</span>
          </div>

          { }
          <h1
            key={`title-${currentSlide}`}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white text-center tracking-tight leading-tight max-w-3xl drop-shadow-lg hero-fade-up"
          >
            {heroSlides[currentSlide].title}
          </h1>
          {/* Subtitle */}
          <p
            key={`subtitle-${currentSlide}`}
            className="text-xs sm:text-sm md:text-base text-white/80 text-center max-w-xl mt-4 leading-relaxed drop-shadow-md hero-fade-up hero-delay-1"
          >
            {heroSlides[currentSlide].subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10 hero-fade-up hero-delay-5">
            <Link
              to="/itinerary"
              className="btn-primary-tourist"
            >
              <Sparkles className="h-4 w-4" />
              <span>PLAN WITH AI</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/attractions"
              className="btn-outline-tourist"
            >
              <Compass className="h-4 w-4" />
              <span>EXPLORE ISLANDS</span>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1440 30 1200 0 720 0C240 0 0 30 0 30L0 60Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      <section className="w-full py-16 bg-slate-50 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-tag-tourist">Top Destinations</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3 leading-tight">
              Must-Visit Spots in <span className="text-emerald-700">Dinagat Islands</span>
            </h2>
            <p className="text-sm text-slate-500 mt-3 max-w-2xl mx-auto leading-relaxed">
              From pristine white beaches and mystical mountain lakes to cathedral-like limestone cliffs — experience paradise in its rawest form.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Bitaog Beach', location: 'Basilisa', category: 'Beach', image: '/images/spots/bitaog-beach.png', desc: 'Stunning white-sand beach with massive limestone formations and crystal-clear turquoise waters.' },
              { name: 'Lake Bababu', location: 'Basilisa', category: 'Nature', image: '/images/spots/lake-bababu.png', desc: 'A mystical freshwater lake atop a mountain, connected to the sea by underground caves.' },
              { name: 'Hagakhak Rock Formation', location: 'Basilisa', category: 'Rock Formation', image: '/images/spots/hagakhak-rocks.png', desc: 'Cathedral-like limestone cliffs rising from deep turquoise waters — perfect for boat tours.' },
              { name: 'Cabacungan Cove', location: 'Cagdianao', category: 'Cove', image: '/images/spots/cabacungan-cove.png', desc: 'A hidden cove enclosed by towering rock walls with coral gardens beneath the surface.' },
              { name: 'Duyos Beach', location: 'San Jose', category: 'Beach', image: '/images/spots/duyos-beach.png', desc: 'Palm-lined soft white sand beach with shallow waters, ideal for swimming and sunsets.' },
              { name: 'Pangabangan Tidal Pools', location: 'Libjo', category: 'Nature', image: '/images/spots/tidal-pools.png', desc: 'Natural tidal pools carved into coastal rock formations with crystal-clear seawater.' },
            ].map((spot, idx) => {
              const nameLower = spot.name.toLowerCase();
              const matchedAttr = attractions.find(a => {
                const aLower = a.name.toLowerCase();
                if (nameLower.includes('bitaog') && aLower.includes('bitaog')) return true;
                if (nameLower.includes('bababu') && aLower.includes('bababu')) return true;
                if (nameLower.includes('hagakhak') && aLower.includes('hagakhak')) return true;
                if (nameLower.includes('cabacungan') && aLower.includes('cabacungan')) return true;
                if (nameLower.includes('duyos') && aLower.includes('duyos')) return true;
                if (nameLower.includes('pangabangan') && aLower.includes('pangabangan')) return true;
                return aLower.includes(nameLower) || nameLower.includes(aLower);
              });
              const spotImage = (matchedAttr && matchedAttr.images && matchedAttr.images.length > 0)
                ? matchedAttr.images[0]
                : spot.image;

              return (
                <Link
                  key={idx}
                  to="/attractions"
                  state={{ search: spot.name }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="relative h-52 sm:h-56 overflow-hidden">
                    <img
                      src={spotImage}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      {spot.category}
                    </span>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-white font-extrabold text-base sm:text-lg drop-shadow-lg leading-tight">{spot.name}</h3>
                      <p className="text-white/80 text-xs flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="h-3 w-3" />
                        {spot.location}, Dinagat Islands
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{spot.desc}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span className="text-slate-700">4.8</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-600 group-hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        View Details <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/attractions"
              className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-900/15 transition-all duration-200 uppercase tracking-wide hover:-translate-y-0.5"
            >
              <Compass className="h-4 w-4" />
              <span>Explore All Attractions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── VESSEL TRIP UPDATES / FASTCRAFT SCHEDULES SECTION ── */}
      <section className="w-full py-16 bg-gradient-to-b from-slate-100 to-emerald-950/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black uppercase px-3.5 py-1 rounded-full tracking-wider mb-3">
              <Ship className="h-3.5 w-3.5 text-emerald-700" />
              <span>Vessel Trip Updates • San Jose MIO Poster</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
              Official Fastcraft <span className="text-emerald-700">Trip Schedules</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto font-medium">
              Daily fastcraft sea crossing timetables between San Jose Port (Dinagat Islands) and Surigao City Boulevard (October 7, 2026).
            </p>
          </div>

          {/* Approved Fare Banner */}
          <div className="bg-amber-50 border-2 border-amber-200/80 rounded-3xl p-5 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shrink-0">
                <Tag className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">Approved Fastcraft Ticket Fares</h4>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Standard Minimum Fare: <strong className="text-emerald-800 font-black">₱250</strong> &nbsp;|&nbsp; 
                  Discounted Fare: <strong className="text-emerald-700 font-black">₱200</strong>
                </p>
              </div>
            </div>

            <div className="bg-white border border-amber-200 px-4 py-2 rounded-2xl text-[11px] font-bold text-amber-900 shrink-0">
              Discount applies to: <strong className="text-emerald-700">Students, PWD, Senior Citizens &amp; Men in Uniform</strong>
            </div>
          </div>

          {/* Route Switcher Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1.5 rounded-2xl shadow-md border border-slate-200 inline-flex gap-2">
              <button
                onClick={() => setActiveScheduleTab('sjToSur')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeScheduleTab === 'sjToSur'
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>San Jose → Surigao City</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${activeScheduleTab === 'sjToSur' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'}`}>8 Trips</span>
              </button>

              <button
                onClick={() => setActiveScheduleTab('surToSj')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeScheduleTab === 'surToSj'
                    ? 'bg-teal-800 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>Surigao City → San Jose</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${activeScheduleTab === 'surToSj' ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-500'}`}>8 Trips</span>
              </button>
            </div>
          </div>

          {/* Schedule Table Container */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className={`px-6 py-4 text-white flex items-center justify-between ${
              activeScheduleTab === 'sjToSur' ? 'bg-emerald-800' : 'bg-teal-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <Ship className="h-5 w-5 text-amber-400" />
                <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                  {activeScheduleTab === 'sjToSur'
                    ? 'San Jose Port → Surigao City Boulevard'
                    : 'Surigao City Boulevard → San Jose Port'}
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase bg-white/20 px-3 py-1 rounded-full text-white">
                Daily Sea Crossing
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-6">Departure</th>
                    <th className="py-3.5 px-6">Vessel Name</th>
                    <th className="py-3.5 px-6 text-center">Type</th>
                    <th className="py-3.5 px-6">Arrival</th>
                    <th className="py-3.5 px-6 text-center">Standard Fare</th>
                    <th className="py-3.5 px-6 text-right">Discounted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {(activeScheduleTab === 'sjToSur' ? sjToSurigao : surigaoToSj).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3.5 px-6 font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{item.departure}</span>
                      </td>
                      <td className="py-3.5 px-6 font-black text-slate-800 tracking-tight">
                        {item.vesselName || 'M/V VIELS LINER'}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                          {item.type || 'FASTCRAFT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-700">
                        {item.arrival}
                      </td>
                      <td className="py-3.5 px-6 text-center font-black text-slate-800 text-sm">
                        ₱{item.fare || 250}
                      </td>
                      <td className="py-3.5 px-6 text-right font-black text-emerald-700 text-sm">
                        ₱{item.discountedFare || 200}
                      </td>
                    </tr>
                  ))}
                  {(activeScheduleTab === 'sjToSur' ? sjToSurigao : surigaoToSj).length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">
                        No schedules currently available for this route.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bisaya Notice & View Full Page Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-900 text-white p-5 rounded-3xl shadow-md border border-emerald-800">
            <div className="flex items-center gap-3 text-left">
              <Info className="h-5 w-5 text-amber-400 shrink-0" />
              <p className="text-[11px] text-emerald-100 leading-relaxed font-semibold">
                <strong>Official Notice:</strong> "Kini nga schedule naka basi sa impormasyon nga gihatag gikan sa tag-iya/personahe sa fastcraft. Palihug i-verify ang ilang ticketing offices before mo byahe."
              </p>
            </div>

            <Link
              to="/transportation"
              className="shrink-0 inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black px-6 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 uppercase tracking-wide"
            >
              <span>View Full Transportation Page</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      <section className="w-full relative overflow-hidden py-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url('/images/hero-bg-2.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/85 via-emerald-900/70 to-emerald-800/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-3/5 text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              Your Gateway to<br />
              <span className="text-amber-400">Unforgettable Adventures</span>
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-xl">
              Traveling to Dinagat Islands is the first step towards unlocking a world of natural wonders.
              It's your gateway to pristine beaches, enchanted rock formations, and rich cultural experiences.
              Don't hesitate — seize the chance to explore paradise and embark on a transformative journey today!
            </p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-8 py-4 rounded-lg shadow-xl shadow-emerald-900/30 transition-all duration-200 uppercase tracking-wide"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="lg:w-2/5 flex justify-center">
            <div className="cta-compass-ring">
              <div className="cta-compass-inner overflow-hidden p-1">
                <img src="/images/dinagat-seal.png" alt="Province of Dinagat Islands" className="h-36 w-36 object-cover rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dining & Seafood Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Utensils className="h-3.5 w-3.5" />
              <span>Island Culinary Highlights</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Restaurants &amp; Dining Facilities
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
              Savor fresh ocean catch, authentic Caraga native delicacies, and seaside dining spots across Dinagat Islands.
            </p>
          </div>

          <Link
            to="/dining"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all shrink-0 hover:gap-3"
          >
            <span>Explore All Restaurants</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diningSpots.slice(0, 3).map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={(spot.images && spot.images.length > 0) ? spot.images[0] : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-emerald-900/80 backdrop-blur-md text-amber-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  {spot.category || 'Dining Spot'}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>{spot.rating || 4.9}</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{spot.municipality || 'San Jose'}, Dinagat</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {spot.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {spot.description}
                  </p>

                  {/* House Specialties */}
                  {spot.specialties && (Array.isArray(spot.specialties) ? spot.specialties.length > 0 : Boolean(spot.specialties)) && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">House Specialties</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(spot.specialties) ? spot.specialties : String(spot.specialties).split(',')).slice(0, 3).map((dish, i) => (
                          <span key={i} className="text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-0.5 rounded-lg">
                            {typeof dish === 'string' ? dish.trim() : dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Price Range</span>
                    <span className="text-xs font-black text-slate-800">{spot.priceRange || '₱150 - ₱400'}</span>
                  </div>

                  <Link
                    to="/dining"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all"
                  >
                    <span>View Spot</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="map-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full text-left">
        <div className="mb-10 text-left">
          <span className="section-tag-tourist">Explore</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-2">Interactive Island Maps</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-2">Browse the geo-mapped hot spots in Dinagat Islands. Click on an attraction to focus on the map pin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {attractions.map((attr) => (
              <div
                key={attr.id}
                onClick={() => setSelectedAttraction(attr)}
                className={`attraction-card-tourist ${selectedAttraction?.id === attr.id
                  ? 'attraction-card-active'
                  : ''
                  }`}
              >
                <img
                  src={(attr.images && attr.images.length > 0) ? attr.images[0] : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'}
                  alt={attr.name}
                  className="w-24 h-24 object-cover rounded-xl shrink-0"
                />
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      {attr.category}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800 mt-1 truncate">{attr.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{attr.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-semibold">
                    <span className="text-emerald-600 font-bold">Fee: ₱{attr.entranceFee}</span>
                    <span className="flex items-center space-x-0.5"><Star className="h-3 w-3 text-amber-400 fill-amber-400" /><span>4.8</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7">
            <InteractiveMap
              items={attractions}
              selectedItem={selectedAttraction}
              height="500px"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-16 w-full text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="section-tag-tourist">How It Works</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-2">Dynamic Travel Orchestration</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-2">Learn about our integrated workflow designed to help tour agencies and tourists connect seamlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="promo-card-tourist">
              <div className="promo-icon-tourist bg-emerald-50 text-emerald-600">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">1. Locate Spots</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter and locate accommodations, beaches, coves, and ports on an interactive map. Read ratings and feedback from other verified tourists.
              </p>
            </div>
            <div className="promo-card-tourist">
              <div className="promo-icon-tourist bg-amber-50 text-amber-600">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">2. Secure Bookings</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose rooms, specify dates, and upload payment receipts. Tour agencies review submissions on their own custom dashboards to confirm reservations.
              </p>
            </div>
            <div className="promo-card-tourist">
              <div className="promo-icon-tourist bg-rose-50 text-rose-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">3. Plan with AI</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Feed your interests, travel duration, and budgeting targets to our AI itinerary composer. Receive a day-by-day mapping schedule instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
