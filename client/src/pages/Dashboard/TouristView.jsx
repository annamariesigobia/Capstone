import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { itineraryService } from '../../services/itineraryService';
import { messageService } from '../../services/messageService';
import { Accommodations } from '../Accommodation/Accommodations';

import { User, ClipboardList, Map, ShieldAlert, Edit, Trash2, Calendar, Users, DollarSign, CheckCircle, HelpCircle, Upload, X, ZoomIn, MessageSquare } from 'lucide-react';

export const TouristView = () => {
  const { tab } = useParams();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(tab || 'profile');
  const [bookings, setBookings] = useState([]);
  const [itineraries, setItineraries] = useState([]);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const validatePhone = (val) => {
    const digits = val.replace(/\D/g, '');
    if (val && digits.length !== 11) {
      setPhoneError('Phone number must be exactly 11 digits (e.g. 09XXXXXXXXX).');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const [uploadingBookingId, setUploadingBookingId] = useState(null);
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    setActiveTab(tab || 'profile');
  }, [tab]);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        await itineraryService.processPendingItinerary(user.uid);

        const bookingsList = await bookingService.getBookingsForTourist(user.uid);
        setBookings(bookingsList);

        const itinList = await itineraryService.getItineraries(user.uid);
        setItineraries(itinList);
      } catch (err) {
        console.error(err);
      }
    };
    loadDashboardData();
  }, [user, activeTab, tab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;
    try {
      let finalProfileImage = user?.profileImage;
      if (profileImageFile) {
        finalProfileImage = profileImagePreview || user?.profileImage;
      } else if (profileImageUrl.trim()) {
        finalProfileImage = profileImageUrl.trim();
      }
      await updateProfile({ fullName, phone, profileImage: finalProfileImage });
      setEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handleDeleteItinerary = async (e, id) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setItineraries(prev => prev.filter(it => it.id !== id));

    try {
      await itineraryService.deleteItinerary(id);
    } catch (err) {
      console.error("Delete itinerary error:", err);
    }
  };

  const handleReceiptUpload = async (bookingId, file) => {
    if (!file) return;
    setUploadingBookingId(bookingId);
    try {
      await bookingService.uploadPaymentProof(bookingId, file);
      const updatedList = await bookingService.getBookingsForTourist(user.uid);
      setBookings(updatedList);
      setReceiptSuccessMsg("Proof of payment uploaded successfully!");
      setTimeout(() => setReceiptSuccessMsg(''), 3500);
    } catch (err) {
      console.error("Payment upload error:", err);
      alert("Failed to upload proof of payment.");
    } finally {
      setUploadingBookingId(null);
    }
  };

  return (
    <>
    <div className="text-left">
      <div className="border-b border-slate-100 pb-5 mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-normal text-slate-800">
          {activeTab === 'bookings' ? 'My Bookings' :
            activeTab === 'itineraries' ? 'Saved Itineraries' :
              'Tourist Profile'}
        </h2>
      </div>

      <div className="flex md:hidden space-x-2 border-b border-slate-100 pb-3 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap ${activeTab === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-slate-500'}`}>Profile</button>
        <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap ${activeTab === 'bookings' ? 'bg-teal-50 text-teal-700' : 'text-slate-500'}`}>Bookings ({bookings.length})</button>
        <button onClick={() => setActiveTab('itineraries')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap ${activeTab === 'itineraries' ? 'bg-teal-50 text-teal-700' : 'text-slate-500'}`}>Itineraries ({itineraries.length})</button>
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Profile image with upload overlay */}
            <div className="relative group shrink-0">
              <img
                src={profileImagePreview || user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                alt={user?.fullName}
                className="h-20 w-20 rounded-full border-2 border-teal-500/20 object-cover shadow-sm shrink-0 aspect-square"
              />
              {editing && (
                <label htmlFor="touristProfileImageInput" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="h-5 w-5 text-white" />
                  <input
                    id="touristProfileImageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      setProfileImageFile(f);
                      setProfileImageUrl('');
                      const reader = new FileReader();
                      reader.onload = (ev) => setProfileImagePreview(ev.target.result);
                      reader.readAsDataURL(f);
                    }}
                  />
                </label>
              )}
            </div>
            <div className="text-left flex-grow">
              <span className="text-[9px] font-black uppercase text-teal-700 bg-teal-50 border border-teal-200/50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Verified {user?.role}
              </span>
              <h3 className="font-extrabold text-sm text-slate-800">{user?.fullName}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-bold">{user?.email}</p>
            </div>

            <button
              onClick={() => {
                setEditing(!editing);
                setFullName(user.fullName);
                setPhone(user.phone);
                setProfileImageUrl('');
                setProfileImageFile(null);
                setProfileImagePreview(null);
              }}
              className="px-4.5 py-2.5 border border-slate-200 text-slate-650 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-1.5 self-start md:self-center"
            >
              <Edit className="h-4 w-4" />
              <span>{editing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>
          {updateSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold">
              Profile updated successfully!
            </div>
          )}

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-100 p-6 rounded-3xl max-w-md space-y-4">
              <h4 className="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wider">Edit Contact Information</h4>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profile Picture URL (or hover photo above to upload)</label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={profileImageUrl}
                  onChange={(e) => { setProfileImageUrl(e.target.value); setProfileImageFile(null); setProfileImagePreview(e.target.value); }}
                  className="text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 w-full font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 w-full font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  maxLength={11}
                  onChange={(e) => { setPhone(e.target.value); validatePhone(e.target.value); }}
                  className={`text-xs border rounded-xl px-4 py-2.5 focus:outline-none w-full font-semibold ${
                    phoneError ? 'border-rose-400 bg-rose-50 text-rose-700 focus:border-rose-500' : 'border-slate-200 focus:border-teal-500'
                  }`}
                  placeholder="09XXXXXXXXX (11 digits)"
                  required
                />
                {phoneError && (
                  <p className="mt-1 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {phoneError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Save Details
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-100 p-4.5 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Account Created</span>
                <span className="text-xs text-slate-700 font-bold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString([], { dateStyle: 'long' }) : 'June 2026'}
                </span>
              </div>
              <div className="border border-slate-100 p-4.5 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Phone Number</span>
                <span className="text-xs text-slate-700 font-bold">{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {receiptSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{receiptSuccessMsg}</span>
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
              <ClipboardList className="h-10 w-10 text-slate-300" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">No Reservations Made</h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  You haven't booked any accommodations yet.
                </p>
              </div>
            </div>
          ) : (
            bookings.map((book) => (
              <div key={book.id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-left flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-slate-800">{book.hotelName}</h3>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${book.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                      book.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                        book.status === 'cancelled' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                      }`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-[11px] font-semibold text-slate-500">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Check In</span>
                      <span className="text-slate-800">{book.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Check Out</span>
                      <span className="text-slate-800">{book.checkOut}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Guests</span>
                      <span className="text-slate-800">{book.guests} persons</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Fare</span>
                      <span className="text-teal-600 font-extrabold">₱{book.totalAmount}</span>
                    </div>
                  </div>

                  {book.status === 'rejected' && book.rejectReason && (
                    <p className="mt-3 text-[11px] bg-rose-50/50 border border-rose-100 text-rose-800 p-2.5 rounded-xl font-bold">
                      Tour Agency Note: {book.rejectReason}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col md:items-end gap-2.5 w-full md:w-auto">
                  {book.paymentProof ? (
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[9px] font-bold text-slate-400 block mb-1">Receipt Proof</span>
                      <button
                        onClick={() => setLightboxImg(book.paymentProof)}
                        className="relative group focus:outline-none"
                        title="Click to view full size"
                      >
                        <img
                          src={book.paymentProof}
                          alt="receipt"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 group-hover:scale-105 transition-transform cursor-zoom-in"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
                          <ZoomIn className="h-5 w-5 text-white" />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-lg">
                      No receipt attached
                    </span>
                  )}

                  {/* Message Agency button */}
                  {book.operatorId && (
                    <button
                      onClick={() => {
                        const allUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
                        const op = Object.values(allUsers).find(u => u.uid === book.operatorId);
                        messageService.startConversation(
                          book.operatorId,
                          op?.fullName || 'Tour Agency'
                        );
                        navigate('/dashboard/messages');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[10px] font-bold rounded-xl transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message Agency
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Inline Accommodations List */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800 mb-6 uppercase tracking-wider">Available Accommodations</h3>
            <Accommodations inline={true} />
          </div>

        </div>
      )}

      {/* ITINERARIES TAB */}
      {activeTab === 'itineraries' && (
        <div className="space-y-4">
          {itineraries.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
              <Map className="h-10 w-10 text-slate-300" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">No Saved Itineraries</h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Create custom itineraries using our AI Travel Planner and save them here.
                </p>
              </div>
              <Link to="/itinerary" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-sm">Plan with AI</Link>
            </div>
          ) : (
            itineraries.map((it) => (
              <details key={it.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm group">
                <summary className="flex justify-between items-center cursor-pointer list-none select-none font-bold text-slate-800 text-xs">
                  <div className="flex-grow text-left">
                    <h3 className="font-extrabold text-slate-800">{it.title}</h3>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                      <span>{it.duration} days</span>
                      <span>•</span>
                      <span>Budget: ₱{it.estimatedCost}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItinerary(e, it.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all cursor-pointer z-10"
                      title="Delete Itinerary"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <span className="text-[10px] font-black text-teal-600 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>

                <div className="mt-6 border-t border-slate-100 pt-5 space-y-5 text-left text-xs">
                  {Object.keys(it.days).map((dayKey, idx) => (
                    <div key={dayKey}>
                      <h4 className="font-black text-slate-800 mb-2">Day {idx + 1}</h4>
                      <ul className="space-y-2 font-semibold text-slate-500 pl-4 list-disc">
                        {it.days[dayKey].map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            ))
          )}
        </div>
      )}
    </div>

    {/* Lightbox Modal */}
    {lightboxImg && (
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={() => setLightboxImg(null)}
      >
        <div
          className="relative max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <X className="h-5 w-5" /> Close
          </button>
          <img
            src={lightboxImg}
            alt="Receipt full view"
            className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
          />
          <p className="text-center text-white/50 text-[10px] font-bold mt-3">Proof of Payment Receipt</p>
        </div>
      </div>
    )}
  </>
  );
};

