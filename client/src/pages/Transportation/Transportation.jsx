import React, { useEffect, useState } from 'react';
import { transportationService } from '../../services/transportationService';
import { Ship, MapPin, Tag, UserCheck, Search, Info, Calendar, Globe } from 'lucide-react';

export const Transportation = () => {
  const [schedules, setSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const list = await transportationService.getSchedules();
        setSchedules(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchedules();
  }, []);

  // Filter schedules based on search query
  const filtered = schedules.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.vesselName || '').toLowerCase().includes(q) ||
      (item.route || '').toLowerCase().includes(q) ||
      (item.type || '').toLowerCase().includes(q) ||
      (item.departure || '').toLowerCase().includes(q)
    );
  });

  // Group into San Jose -> Surigao and Surigao -> San Jose (case-insensitive)
  const sjToSurigao = filtered.filter(item => {
    const r = (item.route || '').toLowerCase();
    const sjIdx = r.indexOf('san jose');
    const surIdx = r.indexOf('surigao');
    if (sjIdx !== -1 && surIdx !== -1 && sjIdx < surIdx) return true;
    return item.id && item.id.includes('sj-sur');
  });

  const surigaoToSj = filtered.filter(item => {
    const r = (item.route || '').toLowerCase();
    const sjIdx = r.indexOf('san jose');
    const surIdx = r.indexOf('surigao');
    if (sjIdx !== -1 && surIdx !== -1 && surIdx < sjIdx) return true;
    return item.id && item.id.includes('sur-sj');
  });


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      
      {/* ── TOP HEADER BANNER (matching Official Poster Style) ── */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/images/dinagat-seal.png" alt="San Jose Seal" className="h-10 w-10 rounded-full border-2 border-emerald-400 shadow-md object-cover" />
              <div>
                <span className="text-xs font-black tracking-widest text-amber-400 uppercase block">VESSEL TRIP UPDATES</span>
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Municipal Information Office San Jose</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              Trip Schedule
            </h1>
            <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1.5 font-semibold">
              <Calendar className="h-3.5 w-3.5 text-amber-300" />
              <span>Official Fastcraft Crossing Timetable as of <strong className="text-white">OCTOBER 7, 2026</strong></span>
            </p>
          </div>

          {/* Route search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-300 pointer-events-none" />
            <input
              type="text"
              placeholder="Search vessel or trip (e.g. Viels)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl text-white placeholder-emerald-200 focus:outline-none focus:border-amber-400 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* ── FARE & DISCOUNT ADVISORY BOX ── */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shrink-0">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-black text-amber-900 uppercase tracking-wide">Approved Ticket Fare Rates</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs">
              <span className="text-slate-700 font-bold">Standard Minimum Fare: <strong className="text-teal-700 font-black text-sm">₱250</strong></span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-amber-950 font-bold">Discounted Rate: <strong className="text-emerald-700 font-black text-sm">₱200</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-amber-200 px-4 py-2.5 rounded-2xl shadow-xs text-xs font-bold text-amber-900 shrink-0">
          <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Discount applies to: <strong>Students, PWD, Senior Citizens &amp; Men in Uniform</strong></span>
        </div>
      </div>

      {/* ── SECTION 1: SAN JOSE TO SURIGAO CITY BOULEVARD ── */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md">
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-400 fill-amber-400/20" />
            <h2 className="text-sm sm:text-base font-black tracking-wide uppercase">
              SAN JOSE TO SURIGAO CITY BOULEVARD
            </h2>
          </div>
          <span className="text-[10px] bg-emerald-700 text-emerald-100 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
            8 Daily Trips
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-950/10 border-b border-slate-200 text-emerald-900 font-black text-[10px] tracking-wider uppercase">
                <th className="py-3.5 px-6">Departure</th>
                <th className="py-3.5 px-6">Vessels Name</th>
                <th className="py-3.5 px-6 text-center">Type</th>
                <th className="py-3.5 px-6">Arrival</th>
                <th className="py-3.5 px-6 text-center">Standard Fare</th>
                <th className="py-3.5 px-6 text-right">Discounted Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
              {sjToSurigao.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">No trips matching filter.</td>
                </tr>
              ) : (
                sjToSurigao.map((trans, idx) => (
                  <tr key={trans.id || idx} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/60'}>
                    <td className="py-3.5 px-6 font-extrabold text-slate-900 text-xs sm:text-sm">
                      {trans.departure}
                    </td>
                    <td className="py-3.5 px-6 font-black text-slate-800 tracking-tight">
                      <span>{trans.vesselName || trans.type}</span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {trans.type || 'FASTCRAFT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-extrabold text-slate-700 text-xs sm:text-sm">
                      {trans.arrival}
                    </td>
                    <td className="py-3.5 px-6 text-center font-black text-slate-800 text-sm">
                      ₱{trans.fare || 250}
                    </td>
                    <td className="py-3.5 px-6 text-right font-black text-emerald-600 text-sm">
                      ₱{trans.discountedFare || 200}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2: SURIGAO CITY BOULEVARD TO SAN JOSE ── */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md">
        <div className="bg-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-400 fill-amber-400/20" />
            <h2 className="text-sm sm:text-base font-black tracking-wide uppercase">
              SURIGAO CITY BOULEVARD TO SAN JOSE
            </h2>
          </div>
          <span className="text-[10px] bg-teal-700 text-teal-100 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
            8 Daily Trips
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-teal-950/10 border-b border-slate-200 text-teal-900 font-black text-[10px] tracking-wider uppercase">
                <th className="py-3.5 px-6">Departure</th>
                <th className="py-3.5 px-6">Vessels Name</th>
                <th className="py-3.5 px-6 text-center">Type</th>
                <th className="py-3.5 px-6">Arrival</th>
                <th className="py-3.5 px-6 text-center">Standard Fare</th>
                <th className="py-3.5 px-6 text-right">Discounted Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
              {surigaoToSj.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">No trips matching filter.</td>
                </tr>
              ) : (
                surigaoToSj.map((trans, idx) => (
                  <tr key={trans.id || idx} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/60'}>
                    <td className="py-3.5 px-6 font-extrabold text-slate-900 text-xs sm:text-sm">
                      {trans.departure}
                    </td>
                    <td className="py-3.5 px-6 font-black text-slate-800 tracking-tight">
                      <span>{trans.vesselName || trans.type}</span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="bg-teal-100 text-teal-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {trans.type || 'FASTCRAFT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-extrabold text-slate-700 text-xs sm:text-sm">
                      {trans.arrival}
                    </td>
                    <td className="py-3.5 px-6 text-center font-black text-slate-800 text-sm">
                      ₱{trans.fare || 250}
                    </td>
                    <td className="py-3.5 px-6 text-right font-black text-emerald-600 text-sm">
                      ₱{trans.discountedFare || 200}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* ── OFFICIAL ADVISORY FOOTER (Exact Bisaya Notice from Poster Image) ── */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-800/80">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-2xl shrink-0 mt-0.5 border border-emerald-700/50">
            <Info className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Pahibalo sa Biyahero (Official Notice)</h4>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed font-semibold max-w-3xl">
              "Kini nga schedule naka basi sa impormasyon nga gihatag gikan sa tag-iya/personahe sa fastcraft. Palihug i-verify ang ilang ticketing offices before mo byahe."
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 self-stretch md:self-auto bg-white/10 border border-white/15 px-4 py-3 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <img src="/images/dinagat-seal.png" alt="San Jose Seal" className="h-9 w-9 rounded-full border border-emerald-400 object-cover shadow-sm" />
            <div>
              <span className="block text-[11px] font-black uppercase text-white tracking-wider">LIG-ON NGA SAN JOSE</span>
              <span className="block text-[9px] text-emerald-300 font-bold">Municipal Information Office</span>
            </div>
          </div>

          <div className="h-6 w-px bg-emerald-700/60 hidden sm:block mx-1" />

          <div className="flex items-center gap-3 text-[10px] text-emerald-200 font-bold pt-1 sm:pt-0">
            <a href="https://facebook.com/LigOnNgaSanJose" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span>/LigOnNgaSanJose</span>
            </a>
            <span>•</span>
            <a href="https://sanjosedi.gov.ph" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
              <Globe className="h-3.5 w-3.5 text-emerald-300" />
              <span>sanjosedi.gov.ph</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Transportation;
