import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { attractionService } from '../../services/attractionService';
import { useAuth } from '../../contexts/AuthContext';
import InteractiveMap from '../../components/maps/InteractiveMap';
import { Star, MapPin, DollarSign, Clock, Map, MessageSquare } from 'lucide-react';

export const Attractions = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [attractions, setAttractions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedAttr, setSelectedAttr] = useState(null);

const [search, setSearch] = useState(location.state?.search || '');
  const [activeCategory, setActiveCategory] = useState('All');

const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const list = await attractionService.getAttractions();
        setAttractions(list);
        setFiltered(list);
        if (list.length > 0) {
          setSelectedAttr(list[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

useEffect(() => {
    if (!selectedAttr) return;
    const loadReviews = async () => {
      try {
        const list = await attractionService.getReviews(selectedAttr.id);
        setReviews(list);
      } catch (err) {
        console.error(err);
      }
    };
    loadReviews();
  }, [selectedAttr]);

useEffect(() => {
    let result = attractions;
    if (activeCategory !== 'All') {
      result = result.filter(item => item.category === activeCategory);
    }
    if (search.trim() !== '') {
      result = result.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
    if (result.length > 0) {
      setSelectedAttr(result[0]);
    } else {
      setSelectedAttr(null);
    }
  }, [search, activeCategory, attractions]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !selectedAttr) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.fullName,
        attractionId: selectedAttr.id,
        rating: Number(newRating),
        comment: newComment
      };
      const savedReview = await attractionService.addReview(reviewData);
      setReviews(prev => [...prev, savedReview]);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const categories = ['All', 'Beaches', 'Nature', 'Rock Formations'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Tourist Attractions</h1>
          <p className="text-xs text-slate-500 mt-1">Discover the magical beaches, mystical lakes, and ancient formations of Dinagat.</p>
        </div>
{/* Search */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search attractions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 w-full md:w-60 font-semibold"
          />
        </div>
      </div>

      {}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-xs font-extrabold rounded-full transition-all shrink-0 ${activeCategory === cat
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {}
        <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center text-xs text-slate-400">No attractions found matching filters.</div>
          ) : (
            filtered.map((attr) => (
              <div
                key={attr.id}
                onClick={() => setSelectedAttr(attr)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex space-x-4 ${selectedAttr?.id === attr.id
                  ? 'border-teal-500 bg-teal-50/20 shadow-md'
                  : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                  }`}
              >
                <img
                  src={(attr.images && attr.images.length > 0) ? attr.images[0] : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'}
                  alt={attr.name}
                  className="w-20 h-20 object-cover rounded-xl shrink-0"
                />
                <div className="flex flex-col justify-between min-w-0 text-left">
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 truncate">{attr.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-0.5">

                                            <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{attr.location}</span>

                                        </p>
                  </div>

                                    <span className="text-[9px] font-bold text-teal-600 mt-2">Entrance: ₱{attr.entranceFee}</span>
                </div>

                            </div>
            ))
          )}
        </div>

{/* Selected atraction detail & Map panel */}

                {selectedAttr && (

                    <div className="lg:col-span-8 space-y-6">

                        {/* Image & Main specs */}

                        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">

                            <div className="relative h-64 md:h-80">

                                <img

                                    src={(selectedAttr.images && selectedAttr.images.length > 0) ? selectedAttr.images[0] : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&auto=format&fit=crop&q=80'}
                  alt={selectedAttr.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 text-white text-left">
                  <span className="text-[10px] font-extrabold uppercase bg-teal-600 px-3 py-1 rounded-md">
                    {selectedAttr.category}
                  </span>
                  <h2 className="text-xl md:text-3xl font-extrabold mt-2 tracking-tight">{selectedAttr.name}</h2>
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs text-slate-600 leading-relaxed mb-6">{selectedAttr.description}</p>

                {/* Specific features grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Location</span>
                      <span className="text-xs text-slate-700 font-semibold">{selectedAttr.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Entrance Fee</span>
                      <span className="text-xs text-slate-700 font-semibold">₱{selectedAttr.entranceFee}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Operating Hours</span>
                      <span className="text-xs text-slate-700 font-semibold">{selectedAttr.operatingHours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews & Map side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT — Reviews list thread */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
                <h3 className="font-extrabold text-sm text-slate-800 mb-6 flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-teal-600" />
                  <span>Visitor Feedback & Reviews ({reviews.length})</span>
                </h3>

                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No visitor feedback written yet. Be the first to share your experience!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                          <div className="flex items-center space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                        <span className="text-[9px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Leave a review form */}
                {user ? (
                  <form onSubmit={handleAddReview} className="border-t border-slate-100 pt-6">
                    <h4 className="font-bold text-xs text-slate-800 mb-3 uppercase tracking-wider">Leave a Review</h4>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-xs text-slate-500 font-semibold">Your Rating:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setNewRating(stars)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-5 w-5 ${stars <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <textarea
                        placeholder="Share details of your visit..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-grow text-xs border border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-teal-500 h-20 font-semibold"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="self-end px-5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition-colors"
                      >
                        Post Review
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl text-center text-xs text-slate-500 font-semibold border border-slate-100/50">
                    Please <Link to="/login" className="text-teal-600 underline">login</Link> to post a review.
                  </div>
                )}
              </div>

              {/* RIGHT — Map location panel */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center space-x-2">
                    <Map className="h-5 w-5 text-teal-600" />
                    <span>Geographic Map Location</span>
                  </h3>
                </div>
                <div className="flex-grow min-h-[350px]">
                  <InteractiveMap items={[selectedAttr]} selectedItem={selectedAttr} height="100%" zoom={13} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attractions;
