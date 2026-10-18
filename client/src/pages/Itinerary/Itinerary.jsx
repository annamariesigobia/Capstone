import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { itineraryService } from '../../services/itineraryService';
import { attractionService } from '../../services/attractionService';
import { useAuth } from '../../contexts/AuthContext';
import InteractiveMap from '../../components/maps/InteractiveMap';
import { Sparkles, Calendar, DollarSign, Heart, Map, Clock, Check, Save, LogIn } from 'lucide-react';

export const Itinerary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState(10000);
  const [interests, setInterests] = useState(['Beaches']);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [mapItems, setMapItems] = useState([]);
  const [activeDay, setActiveDay] = useState('day1');

  useEffect(() => {
    const loadAttractions = async () => {
      try {
        const list = await attractionService.getAttractions();
        setMapItems(list);
      } catch (err) {
        console.error(err);
      }
    };
    loadAttractions();

    const pending = itineraryService.getPendingItinerary();
    if (pending) {
      setResult(pending);
    }
  }, []);

  const handleInterestToggle = (interest) => {
    if (interests.includes(interest)) {
      setInterests(prev => prev.filter(i => i !== interest));
    } else {
      setInterests(prev => [...prev, interest]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (interests.length === 0) {
      alert("Please select at least one travel interest.");
      return;
    }
    setGenerating(true);
    setSavedSuccess(false);

    try {
      const generated = await itineraryService.generateAIItinerary(duration, budget, interests);
      setResult(generated);
      itineraryService.setPendingItinerary(generated);
      setActiveDay('day1');
    } catch (err) {
      console.error(err);
      alert("Failed to generate itinerary.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !result) return;
    setSaving(true);
    try {
      const itineraryToSave = {
        touristId: user.uid,
        title: result.title,
        duration: result.duration,
        estimatedCost: result.estimatedCost,
        attractions: result.attractions,
        days: result.days,
        generatedByAI: true
      };
      await itineraryService.saveItinerary(itineraryToSave);
      setSavedSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/itineraries');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-left w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
          <Sparkles className="h-7 w-7 text-amber-500 fill-amber-500/15 animate-pulse" />
          <span>AI Travel Itinerary Planner</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Let OpenAI curate a customized, day-by-day vacation checklist mapping top spots in Dinagat Islands — no account required.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Plan Specifications Form */}
        <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-left">
          <h3 className="font-extrabold text-sm text-slate-800 mb-6 uppercase tracking-wider">Plan Specifications</h3>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Duration (Days)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`flex-grow py-2.5 text-xs font-bold rounded-xl border transition-all ${duration === d
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/10'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {d} {d === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Maximum Budget (PHP)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 text-xs font-bold">₱</span>
                <input
                  type="number"
                  min="2000"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="text-xs border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:border-teal-500 w-full font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Interests</label>
              <div className="flex flex-col gap-2">
                {['Beaches', 'Nature', 'Adventure'].map((int) => {
                  const isChecked = interests.includes(int);
                  return (
                    <button
                      key={int}
                      type="button"
                      onClick={() => handleInterestToggle(int)}
                      className={`flex items-center justify-between p-3 border rounded-xl text-xs font-bold transition-all ${isChecked
                          ? 'border-teal-500 bg-teal-50/25 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <span>{int}</span>
                      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'}`}>
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full mt-2 py-4.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-teal-500/10 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
            >
              <Sparkles className="h-4.5 w-4.5" />
              <span>{generating ? "Computing Plans..." : "Generate Itinerary"}</span>
            </button>
          </form>
        </div>

        {/* Results layout panel */}
        <div className="lg:col-span-8 space-y-6">
          {result ? (
            <>
              {/* Header result info */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                  <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    AI Curated Travel Guide
                  </span>
                  <h2 className="text-md font-extrabold text-slate-800 mt-2">{result.title}</h2>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Estimated budget allocation: <strong>₱{result.estimatedCost}</strong></p>
                </div>

                {/* Save Itinerary Button — or Login prompt for guests */}
                {user ? (
                  <button
                    onClick={handleSave}
                    disabled={saving || savedSuccess}
                    className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all self-start md:self-center shrink-0 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Saved Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{saving ? "Saving..." : "Save Itinerary"}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => {
                      if (result) itineraryService.setPendingItinerary(result);
                    }}
                    className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all self-start md:self-center shrink-0"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login to Save</span>
                  </Link>
                )}
              </div>

              {/* Day-by-day tabs */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
                <div className="flex space-x-2 border-b border-slate-100 pb-3 mb-6 overflow-x-auto">
                  {Object.keys(result.days).map((dayKey, i) => (
                    <button
                      key={dayKey}
                      onClick={() => setActiveDay(dayKey)}
                      className={`px-4.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap ${activeDay === dayKey
                          ? 'bg-teal-50 text-teal-700 font-extrabold'
                          : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      Day {i + 1}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {result.days[activeDay]?.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="h-6 w-6 rounded-full bg-teal-50 text-teal-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold pt-0.5">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map highlighting attractions */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center space-x-1.5">
                  <Map className="h-4.5 w-4.5 text-teal-600" />
                  <span>Itinerary Stops Coordinates</span>
                </h3>
                <InteractiveMap
                  items={mapItems}
                  selectedItem={mapItems.find(m => result.attractions.includes(m.name))}
                  height="300px"
                />
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-4 h-full">
              <Calendar className="h-12 w-12 text-slate-300" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">No Itinerary Compiled Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Enter your travel duration, budget constraints, and active interests in the specifications form and trigger compile.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
