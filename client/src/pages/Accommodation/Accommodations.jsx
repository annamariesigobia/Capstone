import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accommodationService } from '../../services/accommodationService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/messageService';
import InteractiveMap from '../../components/maps/InteractiveMap';
import { Home, MapPin, Star, ShieldCheck, Calendar, Users, DollarSign, Upload, X, CheckCircle, Info, MessageSquare } from 'lucide-react';

export const Accommodations = ({ inline = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState([]);
  const [selectedAcc, setSelectedAcc] = useState(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [paymentFile, setPaymentFile] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [tempBooking, setTempBooking] = useState(null);
  const [operatorGcash, setOperatorGcash] = useState({ gcashName: null, gcashNumber: null, operatorName: null });
  const [dateErrors, setDateErrors] = useState({ checkIn: '', checkOut: '' });

  // Today's date string for min attributes
  const todayStr = new Date().toISOString().split('T')[0];

  const validateDates = (ci, co) => {
    const errors = { checkIn: '', checkOut: '' };
    const today = new Date(); today.setHours(0,0,0,0);
    if (ci) {
      const d = new Date(ci);
      if (d < today) errors.checkIn = 'Check-in date cannot be in the past.';
    }
    if (co) {
      const d = new Date(co);
      if (d < today) errors.checkOut = 'Check-out date cannot be in the past.';
      if (ci && co && new Date(co) <= new Date(ci)) errors.checkOut = 'Check-out must be after check-in.';
    }
    setDateErrors(errors);
    return !errors.checkIn && !errors.checkOut;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const list = await accommodationService.getAccommodations();
        setAccommodations(list);
        if (list.length > 0) {
          setSelectedAcc(list[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  // Fetch operator GCash info whenever selected accommodation changes
  useEffect(() => {
    if (!selectedAcc?.operatorId) return;
    accommodationService.getOperatorGcash(selectedAcc.operatorId)
      .then(info => setOperatorGcash(info))
      .catch(() => setOperatorGcash({ gcashName: null, gcashNumber: null, operatorName: null }));
  }, [selectedAcc?.operatorId]);

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const days = calculateDays();
  const totalAmount = selectedAcc ? days * selectedAcc.pricePerNight : 0;

  const handleCreateBookingDraft = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!validateDates(checkIn, checkOut)) return;
    if (days <= 0) {
      setDateErrors(prev => ({ ...prev, checkOut: 'Check-out must be after check-in.' }));
      return;
    }
    setBookingStep(2);
  };

  const handleUploadPayment = async (e) => {
    e.preventDefault();
    if (!user || !selectedAcc) return;

    if (!paymentFile) {
      alert("Please select or upload a proof of payment receipt image first.");
      return;
    }

    setBookingLoading(true);
    try {
      // Step 1: Read the file as a data URL BEFORE creating the booking
      let proofDataUrl = '';
      if (paymentFile instanceof File || paymentFile instanceof Blob) {
        proofDataUrl = await new Promise((resolve) => {
          const timeoutId = setTimeout(() => {
            console.warn('File read timed out');
            resolve('');
          }, 15000);

          const reader = new FileReader();
          reader.onload = (ev) => {
            clearTimeout(timeoutId);
            resolve(ev.target?.result || '');
          };
          reader.onerror = () => {
            clearTimeout(timeoutId);
            resolve('');
          };
          reader.readAsDataURL(paymentFile);
        });
      }

      // Step 2: Create booking with paymentProof already embedded — one atomic operation
      const bookingData = {
        touristId: user.uid,
        touristName: user.fullName || user.email || 'Tourist',
        accommodationId: selectedAcc.id,
        hotelName: selectedAcc.hotelName,
        operatorId: selectedAcc.operatorId || 'mock-operator-uid',
        checkIn,
        checkOut,
        guests: Number(guests),
        totalAmount,
        paymentProof: proofDataUrl  // included directly in booking creation
      };

      const booking = await bookingService.createBooking(bookingData);

      setTempBooking(booking);
      setBookingStep(3);
    } catch (err) {
      console.error("Booking creation error:", err);
      alert("Booking creation failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const resetModal = () => {
    setShowBookingModal(false);
    setBookingStep(1);
    setCheckIn('');
    setCheckOut('');
    setGuests(2);
    setPaymentFile(null);
    setTempBooking(null);
  };

  return (
    <div className={inline ? "text-left w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left"}>
      {!inline && (
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Accommodations &amp; Resorts</h1>
          <p className="text-xs text-slate-500 mt-1">Book native ocean front cottages and homestays. Secure check-ins approved directly by tour agencies.</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Resorts list */}
        <div className="lg:col-span-5 space-y-5">
          {accommodations.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setSelectedAcc(acc)}
              className={`bg-white border rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 ${selectedAcc?.id === acc.id
                  ? 'border-teal-500 shadow-md ring-1 ring-teal-500/20'
                  : 'border-slate-100 shadow-sm hover:border-slate-200'
                }`}
            >
              <img
                src={(acc.images && acc.images.length > 0) ? acc.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'}
                alt={acc.hotelName}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">{acc.hotelName}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center space-x-0.5 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>{acc.location}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-teal-600 block">₱{acc.pricePerNight}</span>
                    <span className="text-[9px] text-slate-400 font-bold block">per night</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-4">
                  {(acc.amenities || []).slice(0, 4).map((am, i) => (
                    <span key={i} className="text-[9px] bg-slate-100 font-bold text-slate-600 px-2.5 py-0.5 rounded-full">
                      {am}
                    </span>
                  ))}
                  {(acc.amenities || []).length > 4 && (
                    <span className="text-[9px] bg-teal-50 font-bold text-teal-700 px-2 py-0.5 rounded-full">
                      +{acc.amenities.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected resort detail panel */}
        {selectedAcc && (
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-800">{selectedAcc.hotelName}</h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-0.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedAcc.location}</span>
              </p>

              <p className="text-xs text-slate-600 leading-relaxed mt-4">{selectedAcc.description}</p>

              {/* Details & Capacity Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs mt-4">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Owner</span>
                  <span className="font-extrabold text-slate-800 block">{selectedAcc.ownerName || selectedAcc.owner || '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Contact Person</span>
                  <span className="font-extrabold text-slate-800 block">{selectedAcc.contactPerson || '—'}</span>
                  {selectedAcc.contactNumber && <span className="text-[10px] text-teal-600 font-bold block">{selectedAcc.contactNumber}</span>}
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Rooms &amp; Beds</span>
                  <span className="font-bold text-slate-800 block">{selectedAcc.availableRooms} Rooms / {selectedAcc.noOfBeds || 0} Beds</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Cottages &amp; Rate</span>
                  <span className="font-bold text-slate-800 block">{selectedAcc.noOfCottages || 0} Cottages</span>
                  <span className="text-teal-600 font-black text-xs block">₱{selectedAcc.pricePerNight} / night</span>
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">Amenities Included</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(selectedAcc.amenities || []).map((am, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl">
                      <ShieldCheck className="h-4 w-4 text-teal-500" />
                      <span>{am}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 bg-slate-50 border border-slate-100 p-5 rounded-2xl flex justify-between items-center">
                <div className="text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Special Promo Rate</span>
                  <span className="text-lg font-black text-slate-800">₱{selectedAcc.pricePerNight} <span className="text-xs font-semibold text-slate-500">/ night</span></span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Only {selectedAcc.availableRooms} rooms remaining!</p>
                </div>

                {user ? (
                  user.role === 'tourist' ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition-colors"
                      >
                        Book Accommodation
                      </button>
                      {selectedAcc.operatorId && (
                        <button
                          onClick={() => {
                            const allUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
                            const op = Object.values(allUsers).find(u => u.uid === selectedAcc.operatorId);
                            messageService.startConversation(
                              selectedAcc.operatorId,
                              op?.fullName || selectedAcc.operatorName || 'Tour Agency'
                            );
                            navigate('/dashboard/messages');
                          }}
                          className="px-4 py-3.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-bold rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Message Agency
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                      Logged in as {user.role}. Switch to Tourist to book.
                    </div>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md text-center"
                  >
                    Login to Book
                  </Link>
                )}
              </div>
            </div>

            {/* Map wrapper */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-800 mb-4">Location Map</h3>
              <InteractiveMap items={[selectedAcc]} selectedItem={selectedAcc} height="250px" zoom={13} />
            </div>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingModal && selectedAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden relative">
            <button
              onClick={resetModal}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Step 1: Input Dates & Guests */}
            {bookingStep === 1 && (
              <form onSubmit={handleCreateBookingDraft} className="p-6 text-left">
                <h3 className="text-sm font-black text-slate-800 mb-1">Book {selectedAcc.hotelName}</h3>
                <p className="text-[10px] text-slate-400 mb-6 font-semibold">Select your stay timeline and details below.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Check-in Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={checkIn}
                        min={todayStr}
                        onChange={(e) => {
                          setCheckIn(e.target.value);
                          validateDates(e.target.value, checkOut);
                        }}
                        className={`text-xs border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none w-full font-semibold ${
                          dateErrors.checkIn ? 'border-rose-400 bg-rose-50 focus:border-rose-500 text-rose-700' : 'border-slate-200 focus:border-teal-500'
                        }`}
                        required
                      />
                    </div>
                    {dateErrors.checkIn && (
                      <p className="mt-1 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        {dateErrors.checkIn}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Check-out Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn || todayStr}
                        onChange={(e) => {
                          setCheckOut(e.target.value);
                          validateDates(checkIn, e.target.value);
                        }}
                        className={`text-xs border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none w-full font-semibold ${
                          dateErrors.checkOut ? 'border-rose-400 bg-rose-50 focus:border-rose-500 text-rose-700' : 'border-slate-200 focus:border-teal-500'
                        }`}
                        required
                      />
                    </div>
                    {dateErrors.checkOut && (
                      <p className="mt-1 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        {dateErrors.checkOut}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Number of Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="text-xs border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-teal-500 w-full font-semibold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {days > 0 && (
                  <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">₱{selectedAcc.pricePerNight} × {days} nights:</span>
                    <span className="font-black text-teal-600 text-sm">₱{totalAmount}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition-colors"
                >
                  Continue to Payment
                </button>
              </form>
            )}

            {/* Step 2: Payment Receipt Upload */}
            {bookingStep === 2 && (
              <form onSubmit={handleUploadPayment} className="p-6 text-left">
                <h3 className="text-sm font-black text-slate-800 mb-1">Proof of Payment</h3>
                {/* Dynamic GCash details from operator profile */}
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                  <p className="text-[9px] font-black text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    GCash Payment Instructions
                  </p>
                  {operatorGcash.gcashNumber ? (
                    <>
                      <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                        Send <strong className="text-teal-700">₱{totalAmount}</strong> to:
                      </p>
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase w-16 shrink-0">Number</span>
                          <span className="text-xs font-black text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-lg select-all">{operatorGcash.gcashNumber}</span>
                        </div>
                        {operatorGcash.gcashName && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase w-16 shrink-0">Name</span>
                            <span className="text-xs font-bold text-slate-700">{operatorGcash.gcashName}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2">Then upload a screenshot of your GCash receipt below.</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Please transfer <strong>₱{totalAmount}</strong> via GCash and upload your receipt. Contact the operator for payment details.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-200 hover:border-teal-500/50 p-6 rounded-2xl text-center cursor-pointer transition-colors relative bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPaymentFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-8 w-8 text-teal-600" />
                      <span className="text-xs text-slate-700 font-bold">
                        {paymentFile ? paymentFile.name : 'Click or Drag receipt photo here'}
                      </span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP formats</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Or select file:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPaymentFile(e.target.files[0]);
                        }
                      }}
                      className="text-xs text-slate-600 font-semibold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full mt-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{bookingLoading ? "Submitting Request..." : "Submit Booking"}</span>
                </button>
              </form>
            )}

            {bookingStep === 3 && (
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                  <CheckCircle className="h-10 w-10" />
                </div>

                <h3 className="text-sm font-black text-slate-800">Booking Submitted!</h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Your reservation request at <strong>{selectedAcc.hotelName}</strong> has been created. The tour agency has been notified and is currently verifying your payment.
                </p>

                <div className="mt-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left text-[11px] space-y-1.5 font-semibold text-slate-600">
                  <div>Booking ID: <span className="font-bold text-slate-800">#{tempBooking?.id?.substr(5)}</span></div>
                  <div>Nights: <span className="font-bold text-slate-800">{days}</span></div>
                  <div>Total Fare: <span className="font-bold text-teal-600">₱{totalAmount}</span></div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  {selectedAcc?.operatorId && (
                    <button
                      onClick={() => {
                        const allUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
                        const op = Object.values(allUsers).find(u => u.uid === selectedAcc.operatorId);
                        messageService.startConversation(
                          selectedAcc.operatorId,
                          op?.fullName || selectedAcc.operatorName || 'Tour Agency'
                        );
                        resetModal();
                        navigate('/dashboard/messages');
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Direct Message Agency</span>
                    </button>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={resetModal}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md text-center"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={resetModal}
                    className="w-full py-3 border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-50"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Accommodations;
