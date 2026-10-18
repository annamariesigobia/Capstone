import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { accommodationService } from '../../services/accommodationService';
import { tourPackageService } from '../../services/tourPackageService';
import { messageService } from '../../services/messageService';
import MapPickerModal from '../../components/maps/MapPickerModal';
import InlineMapPicker from '../../components/maps/InlineMapPicker';
import { 
  ClipboardList, Home, Edit, Check, X, ShieldAlert, AlertCircle, Sparkles, 
  CheckCircle, Upload, Image, ZoomIn, Plus, MapPin, LayoutDashboard, 
  TrendingUp, DollarSign, BedDouble, Calendar, ArrowRight, Clock, User,
  Package, Timer, Trash2, MessageSquare, Map
} from 'lucide-react';

export const OperatorView = () => {
  const { tab } = useParams();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [showPropMapPicker, setShowPropMapPicker] = useState(false);

  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profilePhoneError, setProfilePhoneError] = useState('');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileGcashName, setProfileGcashName] = useState(user?.gcashName || '');
  const [profileGcashNumber, setProfileGcashNumber] = useState(user?.gcashNumber || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
      setProfileGcashName(user.gcashName || '');
      setProfileGcashNumber(user.gcashNumber || '');
    }
  }, [user]);

  const validatePhone = (val) => {
    const digits = val.replace(/\D/g, '');
    if (val && digits.length !== 11) {
      setProfilePhoneError('Phone number must be exactly 11 digits (e.g. 09XXXXXXXXX).');
      return false;
    }
    setProfilePhoneError('');
    return true;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validatePhone(profilePhone)) return;
    try {
      // Determine profile image: file takes priority, then URL input, then existing
      let finalProfileImage = user?.profileImage;
      if (profileImageFile) {
        // Convert to data URL for mock mode
        finalProfileImage = profileImagePreview || user?.profileImage;
      } else if (profileImageUrl.trim()) {
        finalProfileImage = profileImageUrl.trim();
      }

      await updateProfile({
        fullName: profileName,
        phone: profilePhone,
        address: profileAddress,
        gcashName: profileGcashName,
        gcashNumber: profileGcashNumber,
        profileImage: finalProfileImage
      });
      setEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const [declineBookingId, setDeclineBookingId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const [editingPropId, setEditingPropId] = useState(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editRooms, setEditRooms] = useState(0);
  const [editBeds, setEditBeds] = useState(0);
  const [editCottages, setEditCottages] = useState(0);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editPropLat, setEditPropLat] = useState('');
  const [editPropLng, setEditPropLng] = useState('');
  const [editPropImageFile, setEditPropImageFile] = useState(null);
  const [editPropImagePreview, setEditPropImagePreview] = useState('');
  const [editPropImageUrlInput, setEditPropImageUrlInput] = useState('');
  const [editPropUploading, setEditPropUploading] = useState(false);

  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [lightboxImg, setLightboxImg] = useState(null);

  // Add Property state
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [addPropLoading, setAddPropLoading] = useState(false);
  const [newProp, setNewProp] = useState({
    hotelName: '', description: '', pricePerNight: '', availableRooms: '',
    noOfBeds: '', noOfCottages: '', ownerName: '', contactPerson: '', contactNumber: '',
    location: '', amenitiesInput: '', imageUrl: '', latitude: '', longitude: ''
  });
  const [newPropImageFile, setNewPropImageFile] = useState(null);
  const [newPropImagePreview, setNewPropImagePreview] = useState('');

  // Tour Packages state
  const [tourPackages, setTourPackages] = useState([]);
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    name: '', description: '', price: '', duration: '', inclusions: '', imageUrl: ''
  });

  useEffect(() => {
    // Always sync URL tab param → activeTab state.
    // When navigating to /dashboard (no :tab), tab is undefined → reset to 'overview'.
    setActiveTab(tab || 'overview');
  }, [tab]);

  const loadData = async () => {
    if (!user) return;
    try {
      const bookingsList = await bookingService.getBookingsForOperator(user.uid);
      if (bookingsList) setBookings(bookingsList);
    } catch (err) {
      console.warn("Operator bookings load warning:", err);
    }

    try {
      const propList = await accommodationService.getAccommodationsByOperator(user.uid);
      if (propList) setProperties(propList);
    } catch (err) {
      console.warn("Operator properties load warning:", err);
    }

    try {
      const pkgList = await tourPackageService.getPackagesByOperator(user.uid);
      if (pkgList) setTourPackages(pkgList);
    } catch (err) {
      console.warn("Tour packages load warning:", err);
    }

    setLastRefresh(Date.now());
  };

  // One-time cleanup: remove stale mock seed booking (book-1) and any corrupt entries
  useEffect(() => {
    try {
      const raw = localStorage.getItem('dinagat_mock_bookings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const realBookings = parsed.filter(b => b.id !== 'book-1' && b.hotelName && b.touristName);
          // If real bookings exist, drop the seed; otherwise keep a clean empty list
          if (parsed.some(b => b.id === 'book-1')) {
            localStorage.setItem('dinagat_mock_bookings', JSON.stringify(realBookings));
          }
        }
      }
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => {
    loadData();
  }, [user]);

  // Auto-refresh bookings every 5 seconds to catch payment proof uploads
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const bookingsList = await bookingService.getBookingsForOperator(user.uid);
        if (bookingsList) setBookings(bookingsList);
      } catch (err) { /* silent */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const startEditProperty = (prop) => {
    setEditingPropId(prop.id);
    setEditPrice(prop.pricePerNight || 0);
    setEditRooms(prop.availableRooms || 0);
    setEditBeds(prop.noOfBeds || 0);
    setEditCottages(prop.noOfCottages || 0);
    setEditOwnerName(prop.ownerName || prop.owner || '');
    setEditContactPerson(prop.contactPerson || '');
    setEditContactNumber(prop.contactNumber || prop.contactInfo || '');
    setEditPropLat(prop.latitude || '');
    setEditPropLng(prop.longitude || '');
    const existingImg = (prop.images && prop.images.length > 0) ? prop.images[0] : '';
    setEditPropImagePreview(existingImg);
    setEditPropImageUrlInput(existingImg);
    setEditPropImageFile(null);
  };

  const handlePropImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditPropImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPropImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Approve this booking? The guest's payment proof will be confirmed.")) return;
    
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));

    try {
      await bookingService.updateBookingStatus(bookingId, 'confirmed');

      const matchedBooking = bookings.find(b => b.id === bookingId);
      if (matchedBooking) {
        const prop = properties.find(p => p.id === matchedBooking.accommodationId);
        if (prop && prop.availableRooms > 0) {
          await accommodationService.updateAccommodation(prop.id, {
            availableRooms: prop.availableRooms - 1
          });
        }
      }
      loadData();
    } catch (err) {
      console.error("Approval warning:", err);
    }
  };

  const handleDecline = async (e) => {
    e.preventDefault();
    if (!declineReason.trim()) return;

    const targetId = declineBookingId;
    const reason = declineReason;

    setBookings(prev => prev.map(b => b.id === targetId ? { ...b, status: 'rejected', rejectReason: reason } : b));
    setDeclineBookingId(null);
    setDeclineReason('');

    try {
      await bookingService.updateBookingStatus(targetId, 'rejected', reason);
      loadData();
    } catch (err) {
      console.error("Rejection warning:", err);
    }
  };

  const handleUpdateProperty = async (propertyId) => {
    setEditPropUploading(true);
    try {
      let finalImageUrl = null;

      if (editPropImageFile) {
        try {
          const uploaded = await accommodationService.uploadAccommodationImage(propertyId, editPropImageFile);
          if (uploaded) {
            finalImageUrl = uploaded;
          } else {
            finalImageUrl = editPropImagePreview;
          }
        } catch (uploadErr) {
          console.warn("Upload fallback to preview:", uploadErr);
          finalImageUrl = editPropImagePreview;
        }
      } else if (editPropImageUrlInput && editPropImageUrlInput.trim()) {
        finalImageUrl = editPropImageUrlInput.trim();
      } else if (editPropImagePreview) {
        finalImageUrl = editPropImagePreview;
      }

      const updatePayload = {
        pricePerNight: Number(editPrice),
        availableRooms: Number(editRooms),
        noOfBeds: Number(editBeds) || 0,
        noOfCottages: Number(editCottages) || 0,
        ownerName: editOwnerName,
        contactPerson: editContactPerson,
        contactNumber: editContactNumber,
        latitude: editPropLat !== '' ? parseFloat(editPropLat) : null,
        longitude: editPropLng !== '' ? parseFloat(editPropLng) : null
      };

      if (finalImageUrl) {
        updatePayload.images = [finalImageUrl];
      }

      await accommodationService.updateAccommodation(propertyId, updatePayload);

      setEditingPropId(null);
      setEditPropImageFile(null);
      setEditPropImagePreview('');
      setEditPropImageUrlInput('');
      loadData();
      alert("Property details and image updated successfully!");
    } catch (err) {
      console.error("Property update error:", err);
      alert("Property update failed.");
    } finally {
      setEditPropUploading(false);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newProp.hotelName.trim()) { alert('Property name is required.'); return; }
    setAddPropLoading(true);
    try {
      let imageUrl = newProp.imageUrl.trim();
      if (newPropImageFile) {
        const uploaded = await accommodationService.uploadAccommodationImage('new', newPropImageFile);
        if (uploaded) imageUrl = uploaded;
      }
      const amenities = newProp.amenitiesInput
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);
      await accommodationService.addAccommodation({
        hotelName: newProp.hotelName.trim(),
        description: newProp.description.trim(),
        pricePerNight: Number(newProp.pricePerNight) || 1500,
        availableRooms: Number(newProp.availableRooms) || 5,
        noOfBeds: Number(newProp.noOfBeds) || 0,
        noOfCottages: Number(newProp.noOfCottages) || 0,
        ownerName: newProp.ownerName.trim(),
        contactPerson: newProp.contactPerson.trim(),
        contactNumber: newProp.contactNumber.trim(),
        location: newProp.location.trim() || 'Dinagat Islands',
        amenities,
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'],
        operatorId: user.uid,
        contactInfo: newProp.contactNumber.trim() || user.email || '',
        latitude: newProp.latitude !== '' ? parseFloat(newProp.latitude) : null,
        longitude: newProp.longitude !== '' ? parseFloat(newProp.longitude) : null
      });
      setShowAddProperty(false);
      setNewProp({ hotelName: '', description: '', pricePerNight: '', availableRooms: '', noOfBeds: '', noOfCottages: '', ownerName: '', contactPerson: '', contactNumber: '', location: '', amenitiesInput: '', imageUrl: '', latitude: '', longitude: '' });
      setNewPropImageFile(null);
      setNewPropImagePreview('');
      loadData();
      alert('Property added! It will now appear in Accommodations & Resorts.');
    } catch (err) {
      console.error('Add property error:', err);
      alert('Failed to add property. Please try again.');
    } finally {
      setAddPropLoading(false);
    }
  };

  const handleDeleteProperty = async (prop) => {
    if (!window.confirm(`Delete "${prop.hotelName}"? This cannot be undone.`)) return;
    try {
      await accommodationService.deleteAccommodation(prop.id);
      loadData();
    } catch (err) {
      console.error('Delete property error:', err);
      alert('Failed to delete property.');
    }
  };

  // Tour Package Handlers
  const resetPkgForm = () => setPkgForm({ name: '', description: '', price: '', duration: '', inclusions: '', imageUrl: '' });

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!pkgForm.name.trim()) { alert('Package name is required.'); return; }
    setPkgLoading(true);
    try {
      const payload = {
        name: pkgForm.name.trim(),
        description: pkgForm.description.trim(),
        price: Number(pkgForm.price) || 0,
        duration: pkgForm.duration.trim(),
        inclusions: pkgForm.inclusions.split(',').map(s => s.trim()).filter(Boolean),
        imageUrl: pkgForm.imageUrl.trim(),
        operatorId: user.uid,
        operatorName: user.fullName || user.email
      };
      if (editingPkg) {
        await tourPackageService.updatePackage(editingPkg.id, payload);
        alert('Tour package updated successfully!');
      } else {
        await tourPackageService.addPackage(payload);
        alert('Tour package added successfully!');
      }
      setShowPkgForm(false);
      setEditingPkg(null);
      resetPkgForm();
      loadData();
    } catch (err) {
      console.error('Package save error:', err);
      alert('Failed to save tour package.');
    } finally {
      setPkgLoading(false);
    }
  };

  const handleEditPackage = (pkg) => {
    setEditingPkg(pkg);
    setPkgForm({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price || '',
      duration: pkg.duration || '',
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : (pkg.inclusions || ''),
      imageUrl: pkg.imageUrl || ''
    });
    setShowPkgForm(true);
  };

  const handleDeletePackage = async (pkg) => {
    if (!window.confirm(`Delete tour package "${pkg.name}"? This cannot be undone.`)) return;
    try {
      await tourPackageService.deletePackage(pkg.id);
      loadData();
      alert('Tour package deleted.');
    } catch (err) {
      console.error('Delete package error:', err);
      alert('Failed to delete tour package.');
    }
  };

  // Metrics calculation for overview
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalAvailableRooms = properties.reduce((sum, p) => sum + (Number(p.availableRooms) || 0), 0);

  return (
    <>
    <div className="text-left relative">
      <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-teal-600" />
            Tour Agency Dashboard
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold">
            Manage resort configurations, verify guest payment proofs, and monitor booking operations.
          </p>
        </div>
        <button
          onClick={() => setShowAddProperty(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-100 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'overview' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Agency Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'bookings' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Guest Reservations ({bookings.length})</span>
          {pendingBookings.length > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black animate-pulse">
              {pendingBookings.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('properties')} 
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'properties' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Manage Property Listings ({properties.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('packages')} 
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'packages' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          <span>Tour Packages ({tourPackages.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'profile' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Agency Profile</span>
        </button>
      </div>

      {/* AGENCY PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Pending account banner */}
          {user?.status !== 'active' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">Account Pending Admin Approval</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Your tour agency account is awaiting verification by the system administrator. Some features may be restricted until your account is approved.</p>
              </div>
            </div>
          )}

          <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Profile image with upload overlay */}
            <div className="relative group shrink-0">
              <img
                src={profileImagePreview || user?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
                alt={user?.fullName}
                className="h-20 w-20 rounded-full border-2 border-teal-500/20 object-cover shadow-sm shrink-0 aspect-square"
              />
              {editingProfile && (
                <label htmlFor="opProfileImageInput" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="h-5 w-5 text-white" />
                  <input
                    id="opProfileImageInput"
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
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase text-teal-700 bg-teal-50 border border-teal-200/50 px-2.5 py-0.5 rounded-full inline-block">
                  Registered {user?.role === 'operator' ? 'Tour Agency / Accommodations Host' : user?.role}
                </span>
                {user?.status === 'active' ? (
                  <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Pending Approval
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-800">{user?.fullName || 'Tour Agency'}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-bold">{user?.email}</p>
            </div>

            <button
              onClick={() => {
                setEditingProfile(!editingProfile);
                setProfileName(user?.fullName || '');
                setProfilePhone(user?.phone || '');
                setProfileAddress(user?.address || '');
                setProfileGcashName(user?.gcashName || '');
                setProfileGcashNumber(user?.gcashNumber || '');
                setProfileImageUrl('');
                setProfileImageFile(null);
                setProfileImagePreview(null);
              }}
              className="px-4.5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-1.5 self-start md:self-center transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>{editingProfile ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>

          {profileSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Tour agency profile updated successfully!</span>
            </div>
          )}

          {editingProfile ? (
            <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-100 p-6 rounded-3xl max-w-lg space-y-4 shadow-sm">
              <h4 className="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wider">Edit Tour Agency Contact Details</h4>

              {/* Profile picture URL input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profile Picture URL (or hover photo above to upload file)</label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={profileImageUrl}
                  onChange={(e) => { setProfileImageUrl(e.target.value); setProfileImageFile(null); setProfileImagePreview(e.target.value); }}
                  className="text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 w-full font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tour Agency / Representative Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 w-full font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={profilePhone}
                  maxLength={11}
                  onChange={(e) => { setProfilePhone(e.target.value); validatePhone(e.target.value); }}
                  className={`text-xs border rounded-xl px-4 py-2.5 focus:outline-none w-full font-semibold ${
                    profilePhoneError ? 'border-rose-400 bg-rose-50 text-rose-700 focus:border-rose-500' : 'border-slate-200 focus:border-teal-500'
                  }`}
                  placeholder="09XXXXXXXXX (11 digits)"
                  required
                />
                {profilePhoneError && (
                  <p className="mt-1 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {profilePhoneError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Agency Address</label>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="e.g. Loreto, Dinagat Islands"
                  className="text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 w-full font-semibold"
                />
              </div>

              {/* GCash Section */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  GCash Payment Account
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">GCash Account Name</label>
                    <input
                      type="text"
                      value={profileGcashName}
                      onChange={(e) => setProfileGcashName(e.target.value)}
                      placeholder="e.g. Isla Tour Agency"
                      className="text-xs border border-emerald-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">GCash Mobile Number</label>
                    <input
                      type="text"
                      value={profileGcashNumber}
                      onChange={(e) => setProfileGcashNumber(e.target.value)}
                      placeholder="e.g. 0923-456-7890"
                      className="text-xs border border-emerald-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 w-full font-semibold"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    ⚠️ This GCash number will be shown to tourists when they book your properties. Make sure it is correct.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Contact Email</span>
                <span className="text-xs text-slate-800 font-bold">{user?.email}</span>
              </div>
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Contact Phone</span>
                <span className="text-xs text-slate-800 font-bold">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Agency Address</span>
                <span className="text-xs text-slate-800 font-bold">{user?.address || 'Not provided'}</span>
              </div>
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Verification Status</span>
                {user?.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    <CheckCircle className="h-3 w-3" /> Verified Agency
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    <Clock className="h-3 w-3" /> Pending Admin Approval
                  </span>
                )}
              </div>
              {/* GCash Payment Account Cards */}
              <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  GCash Payment Account — shown to tourists during booking
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border border-emerald-100 p-3.5 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">GCash Account Name</span>
                    {user?.gcashName ? (
                      <span className="text-xs text-emerald-700 font-black">{user.gcashName}</span>
                    ) : (
                      <span className="text-[10px] text-rose-500 font-bold italic">Not set — click Edit Profile to add</span>
                    )}
                  </div>
                  <div className="bg-white border border-emerald-100 p-3.5 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">GCash Number</span>
                    {user?.gcashNumber ? (
                      <span className="text-xs text-emerald-700 font-black">{user.gcashNumber}</span>
                    ) : (
                      <span className="text-[10px] text-rose-500 font-bold italic">Not set — click Edit Profile to add</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-emerald-100 block tracking-wider">Confirmed Revenue</span>
                <span className="text-xl font-black mt-0.5 block">₱{totalRevenue.toLocaleString()}</span>
                <span className="text-[9px] text-emerald-200 font-semibold">{confirmedBookings.length} confirmed booking(s)</span>
              </div>
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm shrink-0">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
              pendingBookings.length > 0 
                ? 'bg-amber-50 border-amber-200 text-amber-900 ring-2 ring-amber-400/30' 
                : 'bg-white border-slate-100 text-slate-800'
            }`}>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Pending Verification</span>
                <span className="text-xl font-black mt-0.5 block flex items-center gap-1.5">
                  {pendingBookings.length}
                  {pendingBookings.length > 0 && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Action Needed</span>
                  )}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold">Awaiting payment check</span>
              </div>
              <div className={`p-3 rounded-2xl shrink-0 ${pendingBookings.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Clock className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Total Bookings</span>
                <span className="text-xl font-black text-slate-800 mt-0.5 block">{bookings.length}</span>
                <span className="text-[9px] text-slate-500 font-semibold">{confirmedBookings.length} confirmed, {bookings.length - confirmedBookings.length - pendingBookings.length} declined</span>
              </div>
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Properties & Rooms</span>
                <span className="text-xl font-black text-slate-800 mt-0.5 block">{properties.length} Listings</span>
                <span className="text-[9px] text-teal-600 font-bold">{totalAvailableRooms} available room(s)</span>
              </div>
              <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl shrink-0">
                <BedDouble className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* ACTIONABLE PENDING BOOKINGS ALERT BANNER */}
          {pendingBookings.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-6">
                <AlertCircle className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-200" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Payment Verification Required ({pendingBookings.length})</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-[10px] font-bold underline text-amber-100 hover:text-white flex items-center gap-1"
                  >
                    View All Guests <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs text-amber-100 font-semibold mb-4 max-w-2xl leading-relaxed">
                  Guests have submitted reservation requests for your properties. Please verify their GCash payment receipts and approve their bookings.
                </p>

                <div className="space-y-3">
                  {pendingBookings.slice(0, 3).map((book) => (
                    <div key={book.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{book.touristName}</span>
                          <span className="text-[10px] text-amber-200 font-bold">({book.guests} guests)</span>
                        </div>
                        <p className="text-[10px] text-amber-100/90 font-medium mt-0.5">
                          Dates: {book.checkIn} to {book.checkOut} • Total: <strong className="text-white font-black">₱{book.totalAmount}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap">
                        {book.paymentProof ? (
                          <button
                            onClick={() => setLightboxImg(book.paymentProof)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[10px] font-bold transition-all border border-white/30"
                          >
                            <ZoomIn className="h-3.5 w-3.5" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-200 italic font-semibold">No receipt attached</span>
                        )}

                        {/* Message the tourist directly */}
                        {book.touristId && (
                          <button
                            onClick={() => {
                              messageService.startConversation(
                                book.touristId,
                                book.touristName || 'Tourist'
                              );
                              navigate('/dashboard/messages');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-[10px] font-bold transition-all border border-white/20"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Message</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleApprove(book.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setDeclineBookingId(book.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROPERTIES & ROOM SNAPSHOT */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Home className="h-4 w-4 text-teal-600" />
                  Your Property Listings Snapshot
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Overview of resort prices and available room capacities.</p>
              </div>
              <button
                onClick={() => setActiveTab('properties')}
                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                Manage All <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl p-6">
                <Home className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No properties listed yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-3">Add your resort or homestay to begin receiving tourist bookings.</p>
                <button
                  onClick={() => setShowAddProperty(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Property Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((prop) => (
                  <div key={prop.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <img
                        src={(prop.images && prop.images.length > 0) ? prop.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'}
                        alt={prop.hotelName}
                        className="w-16 h-16 object-cover rounded-xl shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-xs text-slate-800 truncate">{prop.hotelName}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0 text-teal-600" /> {prop.location || 'Dinagat Islands'}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                          <span className="text-teal-600 font-black">₱{prop.pricePerNight} / night</span>
                          <span className={`px-2 py-0.5 rounded-full ${prop.availableRooms > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {prop.availableRooms} rooms left
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT RESERVATIONS LEDGER */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-teal-600" />
                  Recent Booking Activity
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Latest guest reservations and payment verification logs.</p>
              </div>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View All Reservations ({bookings.length}) <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No reservation activity recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-[9px] uppercase text-slate-400 font-extrabold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Guest Name</th>
                      <th className="py-2.5 px-4">Dates</th>
                      <th className="py-2.5 px-4">Guests</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-800">{b.touristName}</td>
                        <td className="py-3 px-4 text-[10px] text-slate-500">{b.checkIn} to {b.checkOut}</td>
                        <td className="py-3 px-4 text-[10px] text-slate-500">{b.guests} guests</td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                            b.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-teal-600">₱{b.totalAmount}</td>
                        <td className="py-3 px-4 text-center">
                          {b.paymentProof ? (
                            <button
                              onClick={() => setLightboxImg(b.paymentProof)}
                              className="text-[10px] font-bold text-teal-600 hover:underline inline-flex items-center gap-1"
                            >
                              <ZoomIn className="h-3 w-3" /> View
                            </button>
                          ) : (
                            <span className="text-[9px] text-slate-400 italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
              <ClipboardList className="h-10 w-10 text-slate-300" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">No Bookings Made Yet</h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  As guests submit reservations for your resort, their logs, payment details, and receipts will appear here.
                </p>
              </div>
            </div>
          ) : (
            bookings.map((book) => (
              <div 
                key={book.id} 
                className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center text-left"
              >
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Guest: {book.touristName}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${book.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                      book.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-[10px] font-semibold text-slate-500">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Dates</span>
                      <span className="text-slate-800">{book.checkIn} to {book.checkOut}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Guests</span>
                      <span className="text-slate-800">{book.guests} persons</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Amount due</span>
                      <span className="text-teal-600 font-extrabold">₱{book.totalAmount}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Booking ID</span>
                      <span className="text-slate-800 font-mono">#{book.id.substr(5)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment proof receipt link */}
                {book.paymentProof ? (
                  <div className="shrink-0 flex flex-col items-start md:items-center">
                    <span className="text-[9px] font-bold text-slate-400 block mb-1">Receipt Proof</span>
                    <button
                      onClick={() => setLightboxImg(book.paymentProof)}
                      className="relative group focus:outline-none"
                      title="Click to view full size"
                    >
                      <img
                        src={book.paymentProof}
                        alt="Proof receipt"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm group-hover:scale-105 transition-transform cursor-zoom-in"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
                        <ZoomIn className="h-5 w-5 text-white" />
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200/50 p-2.5 rounded-xl font-bold shrink-0">
                    No payment uploaded
                  </div>
                )}

                {/* Actions */}
                {book.status === 'pending' && (
                  <div className="flex gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                    <button
                      onClick={() => handleApprove(book.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                      title="Approve Booking"
                    >
                      <Check className="h-4 w-4" />
                      <span className="md:hidden">Approve</span>
                    </button>
                    <button
                      onClick={() => setDeclineBookingId(book.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                      title="Reject Booking"
                    >
                      <X className="h-4 w-4" />
                      <span className="md:hidden">Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* PROPERTIES TAB */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          {/* Header with Add button */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Your Properties</h3>
            <button
              onClick={() => setShowAddProperty(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New Property
            </button>
          </div>

          {properties.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
              <Home className="h-10 w-10 text-slate-300" />
              <div>
                <h4 className="font-extrabold text-sm text-slate-700">No Properties Yet</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Click <strong>Add New Property</strong> above to list your resort or homestay.</p>
              </div>
            </div>
          ) : (
            properties.map((prop) => (
              <div 
                key={prop.id} 
                className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center text-left"
              >
                <img 
                  src={(prop.images && prop.images.length > 0) ? prop.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'} 
                  alt={prop.hotelName} 
                  className="w-full md:w-36 h-48 md:h-24 object-cover rounded-2xl shrink-0"
                />

                <div className="flex-grow min-w-0 w-full">
                  <h3 className="font-extrabold text-sm text-slate-800">{prop.hotelName}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal line-clamp-2">{prop.description}</p>

                  {editingPropId === prop.id ? (
                    <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Price per Night / Rate (₱)</label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 w-full font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Available Rooms</label>
                          <input
                            type="number"
                            value={editRooms}
                            onChange={(e) => setEditRooms(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 w-full font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">No. of Beds</label>
                          <input
                            type="number"
                            value={editBeds}
                            onChange={(e) => setEditBeds(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 w-full font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">No. of Cottages</label>
                          <input
                            type="number"
                            value={editCottages}
                            onChange={(e) => setEditCottages(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 w-full font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Owner Name</label>
                          <input
                            type="text"
                            value={editOwnerName}
                            onChange={(e) => setEditOwnerName(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 w-full font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Contact Person</label>
                          <input
                            type="text"
                            value={editContactPerson}
                            onChange={(e) => setEditContactPerson(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 w-full font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Contact Number</label>
                          <input
                            type="text"
                            value={editContactNumber}
                            onChange={(e) => setEditContactNumber(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 w-full font-bold"
                          />
                        </div>
                      </div>

                      <InlineMapPicker
                        lat={editPropLat}
                        lng={editPropLng}
                        onChange={(newLat, newLng) => {
                          setEditPropLat(newLat);
                          setEditPropLng(newLng);
                        }}
                        label="Update Resort / Accommodation Location Pin on Map (Click to set)"
                      />

                      {/* Photo Upload Section */}
                      <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                        <label className="text-[10px] font-extrabold text-slate-700 block uppercase tracking-wider">
                          Update Property Image
                        </label>
                        
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 1: Image URL</span>
                          <input
                            type="url"
                            placeholder="https://example.com/resort-photo.jpg"
                            value={editPropImageUrlInput}
                            onChange={(e) => {
                              setEditPropImageUrlInput(e.target.value);
                              if (e.target.value && !editPropImageFile) {
                                setEditPropImagePreview(e.target.value);
                              }
                            }}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 w-full font-medium bg-white"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold mb-2 block">Option 2: Upload Photo File</span>
                          {editPropImagePreview && (
                            <div className="mb-3 relative rounded-xl overflow-hidden border border-slate-200 max-w-sm">
                              <img src={editPropImagePreview} alt="Preview" className="w-full h-36 object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setEditPropImageFile(null);
                                  setEditPropImagePreview('');
                                  setEditPropImageUrlInput('');
                                }}
                                className="absolute top-2 right-2 px-2.5 py-1 bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg shadow backdrop-blur-sm"
                              >
                                Remove Photo
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <input
                              id={`propImgInput-${prop.id}`}
                              type="file"
                              accept="image/*"
                              onChange={handlePropImageChange}
                              className="text-xs text-slate-600 font-semibold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 block">Supported: PNG, JPG, WEBP (compressed automatically)</span>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingPropId(null)}
                          className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={editPropUploading}
                          onClick={() => handleUpdateProperty(prop.id)}
                          className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                        >
                          {editPropUploading ? "Uploading & Saving..." : "Save Property Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                      <div>
                        <span className="text-[8px] text-slate-400 block mb-0.5">Rate / Night</span>
                        <span className="text-teal-600 font-extrabold text-xs">₱{prop.pricePerNight}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block mb-0.5">Capacity</span>
                        <span className="text-slate-800 text-xs font-black">{prop.availableRooms} Rms / {prop.noOfBeds || 0} Beds / {prop.noOfCottages || 0} Cot.</span>
                      </div>
                      {(prop.ownerName || prop.contactPerson) && (
                        <div>
                          <span className="text-[8px] text-slate-400 block mb-0.5">Owner / Contact</span>
                          <span className="text-slate-700 text-xs font-bold">{prop.ownerName || prop.contactPerson} {prop.contactNumber ? `(${prop.contactNumber})` : ''}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingPropId !== prop.id && (
                  <div className="flex gap-2 w-full md:w-auto shrink-0 mt-3 md:mt-0">
                    <button
                      onClick={() => startEditProperty(prop)}
                      className="flex-1 md:flex-none justify-center p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 flex items-center space-x-1.5 font-bold text-xs"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(prop)}
                      className="flex-1 md:flex-none justify-center p-2.5 border border-rose-200 hover:bg-rose-50 rounded-xl text-rose-600 flex items-center space-x-1.5 font-bold text-xs transition-colors"
                      title="Delete property"
                    >
                      <X className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TOUR PACKAGES TAB ── */}
      {activeTab === 'packages' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Package className="h-4 w-4 text-teal-600" />
                Your Tour Packages
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage the tour packages your agency offers to tourists.</p>
            </div>
            <button
              onClick={() => { setEditingPkg(null); resetPkgForm(); setShowPkgForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Package</span>
            </button>
          </div>

          {/* Add / Edit Package Form */}
          {showPkgForm && (
            <form onSubmit={handleSavePackage} className="bg-gradient-to-br from-slate-50 to-teal-50/30 border border-teal-200/50 p-5 rounded-3xl space-y-4 shadow-sm animate-in fade-in duration-200">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-teal-600" />
                {editingPkg ? 'Edit Tour Package' : 'Add New Tour Package'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Package Name *</label>
                  <input
                    type="text"
                    value={pkgForm.name}
                    onChange={e => setPkgForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Island Hopping Adventure"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    min="0"
                    value={pkgForm.price}
                    onChange={e => setPkgForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. 1500"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duration</label>
                  <input
                    type="text"
                    value={pkgForm.duration}
                    onChange={e => setPkgForm(p => ({ ...p, duration: e.target.value }))}
                    placeholder="e.g. 1 Day, 3D/2N"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inclusions <span className="normal-case text-slate-300">(comma separated)</span></label>
                  <input
                    type="text"
                    value={pkgForm.inclusions}
                    onChange={e => setPkgForm(p => ({ ...p, inclusions: e.target.value }))}
                    placeholder="Boat ride, Snorkeling gear, Lunch, Tour guide"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    value={pkgForm.description}
                    onChange={e => setPkgForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe what tourists will experience..."
                    rows={3}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowPkgForm(false); setEditingPkg(null); resetPkgForm(); }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pkgLoading}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  {pkgLoading ? 'Saving...' : (editingPkg ? 'Update Package' : 'Add Package')}
                </button>
              </div>
            </form>
          )}

          {/* Packages List */}
          {tourPackages.length === 0 && !showPkgForm ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center gap-3">
              <Package className="h-10 w-10 text-slate-300" />
              <div>
                <h4 className="font-extrabold text-sm text-slate-700">No Tour Packages Yet</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Click <strong>Add New Package</strong> to create a tour package for tourists to browse.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tourPackages.map(pkg => (
                <div key={pkg.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                  {/* Package Image */}
                  <div className="relative h-40 bg-gradient-to-br from-teal-400 to-emerald-600 overflow-hidden">
                    {pkg.imageUrl ? (
                      <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-white/40" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/95 backdrop-blur-sm text-teal-700 font-black text-xs px-2.5 py-1 rounded-xl shadow-sm">
                        ₱{Number(pkg.price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Package Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-extrabold text-sm text-slate-800 mb-1">{pkg.name}</h4>
                    {pkg.duration && (
                      <div className="flex items-center gap-1 text-[10px] text-teal-600 font-bold mb-2">
                        <Timer className="h-3 w-3" />
                        <span>{pkg.duration}</span>
                      </div>
                    )}
                    {pkg.description && (
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed line-clamp-2 mb-3">{pkg.description}</p>
                    )}
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(Array.isArray(pkg.inclusions) ? pkg.inclusions : [pkg.inclusions]).slice(0, 3).map((inc, i) => (
                          <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-100">{inc}</span>
                        ))}
                        {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 3 && (
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">+{pkg.inclusions.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-bold transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Decline Modal */}
      {declineBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleDecline} className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-800 mb-1">Decline Reservation</h3>
            <p className="text-[10px] text-slate-400 mb-4 font-semibold">Please input a short reason (e.g. rooms fully booked) for the tourist's notification.</p>

            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Input reason here..."
              className="text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-teal-500 w-full h-20 font-semibold mb-4"
              required
            />

            <div className="flex justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => { setDeclineBookingId(null); setDeclineReason(''); }}
                className="flex-grow py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-grow py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md transition-colors"
              >
                Confirm Decline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>

    {/* Add Property Modal */}
    {showAddProperty && (
      <div className="fixed inset-0 z-[998] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <form
          onSubmit={handleAddProperty}
          className="bg-white rounded-3xl w-full max-w-lg p-6 border border-slate-100 shadow-2xl relative overflow-y-auto max-h-[90vh]"
        >
          <button
            type="button"
            onClick={() => setShowAddProperty(false)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="text-sm font-black text-slate-800 mb-0.5">Add New Property</h3>
          <p className="text-[10px] text-slate-400 font-semibold mb-5">Fill in your resort or homestay details. It will be visible to tourists immediately.</p>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Property Name *</label>
              <input
                type="text"
                value={newProp.hotelName}
                onChange={e => setNewProp(p => ({ ...p, hotelName: e.target.value }))}
                placeholder="e.g. Sunset Cove Resort"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
              <textarea
                value={newProp.description}
                onChange={e => setNewProp(p => ({ ...p, description: e.target.value }))}
                placeholder="Briefly describe your property..."
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Price / Night (₱) *</label>
                <input
                  type="number"
                  min="1"
                  value={newProp.pricePerNight}
                  onChange={e => setNewProp(p => ({ ...p, pricePerNight: e.target.value }))}
                  placeholder="1500"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Available Rooms *</label>
                <input
                  type="number"
                  min="1"
                  value={newProp.availableRooms}
                  onChange={e => setNewProp(p => ({ ...p, availableRooms: e.target.value }))}
                  placeholder="5"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">No. of Beds</label>
                <input
                  type="number"
                  min="0"
                  value={newProp.noOfBeds}
                  onChange={e => setNewProp(p => ({ ...p, noOfBeds: e.target.value }))}
                  placeholder="10"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">No. of Cottages</label>
                <input
                  type="number"
                  min="0"
                  value={newProp.noOfCottages}
                  onChange={e => setNewProp(p => ({ ...p, noOfCottages: e.target.value }))}
                  placeholder="2"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Owner Name</label>
                <input
                  type="text"
                  value={newProp.ownerName}
                  onChange={e => setNewProp(p => ({ ...p, ownerName: e.target.value }))}
                  placeholder="e.g. Don Fernando Isla"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newProp.contactPerson}
                  onChange={e => setNewProp(p => ({ ...p, contactPerson: e.target.value }))}
                  placeholder="e.g. Isabella Isla"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={newProp.contactNumber}
                  onChange={e => setNewProp(p => ({ ...p, contactNumber: e.target.value }))}
                  placeholder="e.g. 0923-456-7890"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Location</label>
              <input
                type="text"
                value={newProp.location}
                onChange={e => setNewProp(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Basilisa, Dinagat Islands"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Amenities <span className="normal-case text-slate-300">(comma separated)</span></label>
              <input
                type="text"
                value={newProp.amenitiesInput}
                onChange={e => setNewProp(p => ({ ...p, amenitiesInput: e.target.value }))}
                placeholder="Wifi, Pool, Aircon, Restaurant"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>

            <InlineMapPicker
              lat={newProp.latitude}
              lng={newProp.longitude}
              onChange={(newLat, newLng) => {
                setNewProp(p => ({ ...p, latitude: newLat, longitude: newLng }));
              }}
              label="Accommodation Pin Location on Map (Click to set pin)"
            />

            {/* Image */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Property Photo</label>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-1">Option 1: Image URL</span>
                <input
                  type="url"
                  value={newProp.imageUrl}
                  onChange={e => setNewProp(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-medium bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-2">Option 2: Upload File</span>
                {newPropImagePreview && (
                  <img src={newPropImagePreview} alt="preview" className="w-full h-32 object-cover rounded-xl border border-slate-200 mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setNewPropImageFile(f);
                      const r = new FileReader();
                      r.onload = ev => setNewPropImagePreview(ev.target?.result || '');
                      r.readAsDataURL(f);
                    }
                  }}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => setShowAddProperty(false)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addPropLoading}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md text-xs disabled:opacity-50 transition-colors"
            >
              {addPropLoading ? 'Saving...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    )}

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

    {/* ── INTERACTIVE MAP PICKER MODAL ── */}
    <MapPickerModal
      isOpen={showPropMapPicker}
      onClose={() => setShowPropMapPicker(false)}
      initialLat={newProp.latitude}
      initialLng={newProp.longitude}
      title="Select Accommodation Location Pin"
      onSelectLocation={(lat, lng) => {
        setNewProp(p => ({ ...p, latitude: lat, longitude: lng }));
      }}
    />
  </>
  );
};
