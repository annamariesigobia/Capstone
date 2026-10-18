import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { diningService } from '../../services/diningService';
import InteractiveMap from '../../components/maps/InteractiveMap';
import { Utensils, MapPin, Clock, Tag, Star, Search, Filter, ShieldCheck, Flame, Coffee, Heart } from 'lucide-react';

export const Dining = () => {
  const [diningSpots, setDiningSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchDining = async () => {
      try {
        const list = await diningService.getDiningSpots();
        setDiningSpots(list);
        if (list.length > 0) {
          setSelectedSpot(list[0]);
        }
      } catch (err) {
        console.error('Failed to fetch dining spots:', err);
      }
    };
    fetchDining();
  }, []);

  const categories = ['All', 'Seafood & Grill', 'Beachfront Dining', 'Local Cuisine', 'Cafe & Bistro'];

  const filteredSpots = diningSpots.filter((spot) => {
    const matchesCategory = activeCategory === 'All' || spot.category === activeCategory;
    const specStr = Array.isArray(spot.specialties) ? spot.specialties.join(' ') : (spot.specialties || '');
    const matchesSearch =
      (spot.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (spot.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      specStr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── HERO HEADER ── */}
      <section className="relative py-16 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-15 mix-blend-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase px-4 py-1.5 rounded-full tracking-wider mb-4">
            <Utensils className="h-4 w-4 text-amber-400" />
            <span>Local Flavors &amp; Coastal Dining</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Restaurants &amp; <span className="text-amber-400">Dining Facilities</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-emerald-100 max-w-2xl mx-auto mt-3 font-medium leading-relaxed">
            Savor fresh seafood grills, authentic island native carinderias, beachfront bistros, and coastal coffee spots across Dinagat Islands.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Filter & Search Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dining spots or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
        </div>

        {/* Grid Layout: Restaurants List + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Dining List */}
          <div className="lg:col-span-6 space-y-5">
            {filteredSpots.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <Utensils className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-extrabold text-sm text-slate-700">No Dining Spots Found</h3>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or category filter.</p>
              </div>
            ) : (
              filteredSpots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`bg-white border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 text-left ${
                      isSelected
                        ? 'border-emerald-600 shadow-xl ring-2 ring-emerald-500/20 translate-y-[-2px]'
                        : 'border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md'
                    }`}
                  >
                    <div className="relative h-48 sm:h-52 overflow-hidden">
                      <img
                        src={(spot.images && spot.images[0]) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <span className="absolute top-3 left-3 bg-emerald-800/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        {spot.category || 'Restaurant'}
                      </span>
                      
                      <span className="absolute top-3 right-3 bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                        <Star className="h-3.5 w-3.5 fill-amber-950" />
                        <span>{spot.rating || '4.8'}</span>
                      </span>

                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-white font-extrabold text-lg sm:text-xl drop-shadow-md leading-tight">{spot.name}</h3>
                        <p className="text-white/80 text-xs flex items-center gap-1 mt-1 font-semibold">
                          <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>{spot.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {spot.description}
                      </p>

                      {/* Contact & Business Info */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Owner / Contact</span>
                          <span className="font-bold text-slate-700">{spot.owner || spot.ownerName || spot.contactPerson || '—'}</span>
                          {spot.contactNumber && <span className="block text-[10px] text-emerald-700 font-bold">{spot.contactNumber}</span>}
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Employees & Address</span>
                          <span className="font-bold text-slate-700 block">{spot.employeeCount ? `${spot.employeeCount} Employees` : '—'}</span>
                          <span className="text-[10px] text-slate-500 font-semibold truncate block">{spot.address || spot.location || '—'}</span>
                        </div>
                      </div>

                      {spot.specialties && (
                        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-2xl">
                          <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block mb-1 flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-amber-500" /> House Specialties
                          </span>
                          <p className="text-xs font-bold text-emerald-800 leading-snug">
                            {Array.isArray(spot.specialties) ? spot.specialties.join(', ') : spot.specialties}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{spot.operatingHours || '08:00 AM - 09:00 PM'}</span>
                        </span>

                        <span className="text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg font-black text-[11px]">
                          Price: {spot.priceRange || '₱₱'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Restaurant Detail & Interactive Map */}
          <div className="lg:col-span-6 space-y-6 sticky top-6">
            {selectedSpot && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                      {selectedSpot.category}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-800 mt-2">{selectedSpot.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{selectedSpot.address || selectedSpot.location}</span>
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {selectedSpot.priceRange || '₱₱'}
                  </span>
                </div>

                {/* Additional Business Details Grid */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-xs">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Owner / Management</span>
                    <span className="font-extrabold text-slate-800 block">{selectedSpot.owner || selectedSpot.ownerName || '—'}</span>
                    <span className="text-[10px] text-slate-500 font-semibold block">Contact Person: {selectedSpot.contactPerson || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Contact & Staff</span>
                    <span className="font-extrabold text-emerald-700 block">{selectedSpot.contactNumber || '—'}</span>
                    <span className="text-[10px] text-slate-600 font-bold block">{selectedSpot.employeeCount ? `${selectedSpot.employeeCount} Employees` : '—'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                  {selectedSpot.description}
                </p>

                {selectedSpot.specialties && (
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                    <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-600" /> Recommended Dishes &amp; Drinks
                    </h4>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {Array.isArray(selectedSpot.specialties) ? selectedSpot.specialties.join(', ') : selectedSpot.specialties}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Map Wrapper */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
              <h3 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Restaurant Location Map</span>
              </h3>
              <InteractiveMap
                items={diningSpots.map(s => ({
                  id: s.id,
                  name: s.name,
                  category: s.category,
                  description: s.specialties || s.description,
                  entranceFee: s.priceRange || '₱₱',
                  latitude: s.latitude,
                  longitude: s.longitude,
                  images: s.images
                }))}
                selectedItem={selectedSpot ? {
                  id: selectedSpot.id,
                  latitude: selectedSpot.latitude,
                  longitude: selectedSpot.longitude
                } : null}
                height="320px"
                zoom={12}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dining;
