import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/reportService';
import { attractionService } from '../../services/attractionService';
import { transportationService } from '../../services/transportationService';
import { bookingService } from '../../services/bookingService';
import { authService } from '../../services/authService';
import { diningService } from '../../services/diningService';
import MapPickerModal from '../../components/maps/MapPickerModal';
import InlineMapPicker from '../../components/maps/InlineMapPicker';
import { Users, Map, Navigation, ClipboardList, Plus, FileBarChart, ChevronDown, CheckCircle, Clock, XCircle, Edit, Trash2, X, LayoutDashboard, User, ShieldCheck, Building2, Upload, RotateCcw, MapPin, Utensils, Star } from 'lucide-react';

export const AdminView = () => {
  const { tab } = useParams();
  const { user, updateProfile, isMock } = useAuth();
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [mapPickerTarget, setMapPickerTarget] = useState(null); // 'addAttr' | 'editAttr' | null

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profilePhoneError, setProfilePhoneError] = useState('');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
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
      let finalProfileImage = user?.profileImage;
      if (profileImageFile) {
        finalProfileImage = profileImagePreview || user?.profileImage;
      } else if (profileImageUrl.trim()) {
        finalProfileImage = profileImageUrl.trim();
      }
      await updateProfile({
        fullName: profileName,
        phone: profilePhone,
        address: profileAddress,
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

  const [allSchedules, setAllSchedules] = useState([]);

  const [searchAttraction, setSearchAttraction] = useState('');
  const [searchSchedule, setSearchSchedule] = useState('');

  const [editingAttr, setEditingAttr] = useState(null);
  const [editAttrName, setEditAttrName] = useState('');
  const [editAttrDesc, setEditAttrDesc] = useState('');
  const [editAttrCat, setEditAttrCat] = useState('Beaches');
  const [editAttrLoc, setEditAttrLoc] = useState('');
  const [editAttrOwner, setEditAttrOwner] = useState('');
  const [editAttrContactPerson, setEditAttrContactPerson] = useState('');
  const [editAttrContactNumber, setEditAttrContactNumber] = useState('');
  const [editAttrRooms, setEditAttrRooms] = useState('');
  const [editAttrBeds, setEditAttrBeds] = useState('');
  const [editAttrCottages, setEditAttrCottages] = useState('');
  const [editAttrRate, setEditAttrRate] = useState('');
  const [editAttrLat, setEditAttrLat] = useState('');
  const [editAttrLng, setEditAttrLng] = useState('');
  const [editAttrFee, setEditAttrFee] = useState('');
  const [editingSched, setEditingSched] = useState(null);
  const [editTransType, setEditTransType] = useState('Fastcraft');
  const [editTransVesselName, setEditTransVesselName] = useState('');
  const [editTransRoute, setEditTransRoute] = useState('');
  const [editTransFare, setEditTransFare] = useState('250');
  const [editTransDiscountedFare, setEditTransDiscountedFare] = useState('200');
  const [editTransDep, setEditTransDep] = useState('');
  const [editTransArr, setEditTransArr] = useState('');
  const [editTransSched, setEditTransSched] = useState('Daily');

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeSchedules: 0,
    activeAttractions: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [allAttractions, setAllAttractions] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedStatView, setSelectedStatView] = useState(null);

  const [showAttrForm, setShowAttrForm] = useState(false);
  const [attrName, setAttrName] = useState('');
  const [attrDesc, setAttrDesc] = useState('');
  const [attrCat, setAttrCat] = useState('Beaches');
  const [attrLoc, setAttrLoc] = useState('');
  const [attrOwner, setAttrOwner] = useState('');
  const [attrContactPerson, setAttrContactPerson] = useState('');
  const [attrContactNumber, setAttrContactNumber] = useState('');
  const [attrRooms, setAttrRooms] = useState('');
  const [attrBeds, setAttrBeds] = useState('');
  const [attrCottages, setAttrCottages] = useState('');
  const [attrRate, setAttrRate] = useState('');
  const [attrLat, setAttrLat] = useState('');
  const [attrLng, setAttrLng] = useState('');
  const [attrFee, setAttrFee] = useState('');
  const [attrHours, setAttrHours] = useState('08:00 AM - 05:00 PM');
  const [attrImageFile, setAttrImageFile] = useState(null);
  const [attrImagePreview, setAttrImagePreview] = useState(null);
  const [attrImageUrlInput, setAttrImageUrlInput] = useState('');
  const [attrUploading, setAttrUploading] = useState(false);

  const [editAttrImageFile, setEditAttrImageFile] = useState(null);
  const [editAttrImagePreview, setEditAttrImagePreview] = useState(null);
  const [editAttrImageUrlInput, setEditAttrImageUrlInput] = useState('');
  const [editAttrUploading, setEditAttrUploading] = useState(false);
  const [editAttrHours, setEditAttrHours] = useState('08:00 AM - 05:00 PM');

  const [showSchedForm, setShowSchedForm] = useState(false);
  const [transType, setTransType] = useState('Fastcraft');
  const [transVesselName, setTransVesselName] = useState('');
  const [transRoute, setTransRoute] = useState('');
  const [transFare, setTransFare] = useState('250');
  const [transDiscountedFare, setTransDiscountedFare] = useState('200');
  const [transDep, setTransDep] = useState('');
  const [transArr, setTransArr] = useState('');
  const [transSched, setTransSched] = useState('Daily');

  const [allDiningSpots, setAllDiningSpots] = useState([]);
  const [searchDining, setSearchDining] = useState('');
  const [showDiningForm, setShowDiningForm] = useState(false);
  const [editingDining, setEditingDining] = useState(null);

  const [diningName, setDiningName] = useState('');
  const [diningDesc, setDiningDesc] = useState('');
  const [diningCat, setDiningCat] = useState('Seafood & Native Grill');
  const [diningMun, setDiningMun] = useState('San Jose');
  const [diningLoc, setDiningLoc] = useState('');
  const [diningAddress, setDiningAddress] = useState('');
  const [diningOwner, setDiningOwner] = useState('');
  const [diningContactPerson, setDiningContactPerson] = useState('');
  const [diningContactNumber, setDiningContactNumber] = useState('');
  const [diningEmployees, setDiningEmployees] = useState('');
  const [diningLat, setDiningLat] = useState('10.0076');
  const [diningLng, setDiningLng] = useState('125.6072');
  const [diningPrice, setDiningPrice] = useState('₱150 - ₱400');
  const [diningHours, setDiningHours] = useState('07:00 AM - 09:00 PM');
  const [diningRating, setDiningRating] = useState('4.9');
  const [diningSpecialties, setDiningSpecialties] = useState('Grilled Blue Marlin, Coconut Kinilaw, Calamares');
  const [diningImageFile, setDiningImageFile] = useState(null);
  const [diningImagePreview, setDiningImagePreview] = useState(null);
  const [diningImageUrlInput, setDiningImageUrlInput] = useState('');
  const [diningUploading, setDiningUploading] = useState(false);

  const [editDiningName, setEditDiningName] = useState('');
  const [editDiningDesc, setEditDiningDesc] = useState('');
  const [editDiningCat, setEditDiningCat] = useState('Seafood & Native Grill');
  const [editDiningMun, setEditDiningMun] = useState('San Jose');
  const [editDiningLoc, setEditDiningLoc] = useState('');
  const [editDiningAddress, setEditDiningAddress] = useState('');
  const [editDiningOwner, setEditDiningOwner] = useState('');
  const [editDiningContactPerson, setEditDiningContactPerson] = useState('');
  const [editDiningContactNumber, setEditDiningContactNumber] = useState('');
  const [editDiningEmployees, setEditDiningEmployees] = useState('');
  const [editDiningLat, setEditDiningLat] = useState('');
  const [editDiningLng, setEditDiningLng] = useState('');
  const [editDiningPrice, setEditDiningPrice] = useState('₱150 - ₱400');
  const [editDiningHours, setEditDiningHours] = useState('07:00 AM - 09:00 PM');
  const [editDiningRating, setEditDiningRating] = useState('4.9');
  const [editDiningSpecialties, setEditDiningSpecialties] = useState('');
  const [editDiningImageFile, setEditDiningImageFile] = useState(null);
  const [editDiningImagePreview, setEditDiningImagePreview] = useState(null);
  const [editDiningImageUrlInput, setEditDiningImageUrlInput] = useState('');
  const [editDiningUploading, setEditDiningUploading] = useState(false);

  const loadData = async () => {
    try {
      const stats = await reportService.getAnalyticsSummary();
      if (stats?.metrics) setMetrics(stats.metrics);
    } catch (e) {
      console.warn("Analytics load warning:", e);
    }

    try {
      const users = await authService.getAllUsers();
      if (users) setUsersList(users);
    } catch (e) {
      console.warn("Users load warning:", e);
    }

    try {
      const attrs = await attractionService.getAttractions();
      if (attrs) setAllAttractions(attrs);
    } catch (e) {
      console.warn("Attractions load warning:", e);
    }

    try {
      const books = await bookingService.getAllBookings();
      if (books) setAllBookings(books);
    } catch (e) {
      console.warn("Bookings load warning:", e);
    }

    try {
      const scheds = await transportationService.getSchedules();
      if (scheds) setAllSchedules(scheds);
    } catch (e) {
      console.warn("Schedules load warning:", e);
    }

    try {
      const dining = await diningService.getDiningSpots();
      if (dining) setAllDiningSpots(dining);
    } catch (e) {
      console.warn("Dining load warning:", e);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setActiveTab(tab || 'overview'); }, [tab]);

  const handleAttrImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttrImageFile(file);
    setAttrImageUrlInput('');
    setAttrImagePreview(URL.createObjectURL(file));
  };

  const handleEditAttrImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditAttrImageFile(file);
    setEditAttrImageUrlInput('');
    setEditAttrImagePreview(URL.createObjectURL(file));
  };

  const handleAddAttraction = async (e) => {
    e.preventDefault();
    setAttrUploading(true);
    try {
      let imageUrl = null;
      const tempId = 'attr-' + Math.random().toString(36).substr(2, 9);
      if (attrImageFile) {
        try {
          imageUrl = await attractionService.uploadAttractionImage(tempId, attrImageFile);
        } catch (uploadErr) {
          console.warn("Upload fallback to preview:", uploadErr);
          imageUrl = attrImagePreview;
        }
      } else if (attrImageUrlInput.trim()) {
        imageUrl = attrImageUrlInput.trim();
      }

      await attractionService.addAttraction({
        name: attrName, description: attrDesc, category: attrCat,
        location: attrLoc, latitude: Number(attrLat), longitude: Number(attrLng),
        entranceFee: Number(attrFee), operatingHours: attrHours,
        ownerName: attrOwner, contactPerson: attrContactPerson, contactNumber: attrContactNumber,
        noOfRooms: Number(attrRooms) || 0, noOfBeds: Number(attrBeds) || 0,
        noOfCottages: Number(attrCottages) || 0, rate: Number(attrRate) || 0,
        addedBy: user?.uid || 'system',
        addedByEmail: user?.email || 'admin@dinagat.com',
        ...(imageUrl ? { images: [imageUrl] } : {})
      });
      setShowAttrForm(false);
      setAttrName(''); setAttrDesc(''); setAttrLoc(''); setAttrLat(''); setAttrLng(''); setAttrFee('');
      setAttrOwner(''); setAttrContactPerson(''); setAttrContactNumber(''); setAttrRooms(''); setAttrBeds(''); setAttrCottages(''); setAttrRate('');
      setAttrImageFile(null); setAttrImagePreview(null); setAttrImageUrlInput('');
      loadData();
      alert("Attraction added successfully!");
    } catch (err) { console.error(err); alert("Failed to add attraction."); }
    finally { setAttrUploading(false); }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await transportationService.addSchedule({
        type: transType,
        vesselName: transVesselName,
        route: transRoute,
        fare: Number(transFare) || 250,
        discountedFare: Number(transDiscountedFare) || 200,
        departure: transDep,
        arrival: transArr,
        schedule: transSched,
        addedBy: user?.uid || 'system',
        addedByEmail: user?.email || 'admin@dinagat.com'
      });
      setShowSchedForm(false);
      setTransVesselName(''); setTransRoute(''); setTransFare('250'); setTransDiscountedFare('200'); setTransDep(''); setTransArr('');
      loadData();
      alert("Transportation schedule added successfully!");
    } catch (err) { console.error(err); alert("Failed to add schedule."); }
  };

  const handleEditAttraction = (attr) => {
    setEditingAttr(attr);
    setEditAttrName(attr.name || '');
    setEditAttrDesc(attr.description || '');
    setEditAttrCat(attr.category || 'Beaches');
    setEditAttrLoc(attr.location || '');
    setEditAttrOwner(attr.ownerName || attr.owner || '');
    setEditAttrContactPerson(attr.contactPerson || '');
    setEditAttrContactNumber(attr.contactNumber || '');
    setEditAttrRooms(attr.noOfRooms ?? attr.availableRooms ?? '');
    setEditAttrBeds(attr.noOfBeds ?? '');
    setEditAttrCottages(attr.noOfCottages ?? '');
    setEditAttrRate(attr.rate ?? '');
    setEditAttrLat(attr.latitude || '');
    setEditAttrLng(attr.longitude || '');
    setEditAttrFee(attr.entranceFee || 0);
    setEditAttrHours(attr.operatingHours || '08:00 AM - 05:00 PM');

    setEditAttrImageFile(null);
    const existingImg = (attr.images && attr.images.length > 0) ? attr.images[0] : '';
    setEditAttrImagePreview(existingImg || null);
    setEditAttrImageUrlInput(existingImg || '');
  };

  const handleUpdateAttractionSubmit = async (e) => {
    e.preventDefault();
    if (!editingAttr) return;
    setEditAttrUploading(true);
    try {
      let finalImageUrl = null;
      if (editAttrImageFile) {
        try {
          finalImageUrl = await attractionService.uploadAttractionImage(editingAttr.id, editAttrImageFile);
        } catch (uploadErr) {
          console.warn("Upload fallback to preview:", uploadErr);
          finalImageUrl = editAttrImagePreview;
        }
      } else if (editAttrImageUrlInput.trim()) {
        finalImageUrl = editAttrImageUrlInput.trim();
      } else if (editAttrImagePreview) {
        finalImageUrl = editAttrImagePreview;
      }

      await attractionService.updateAttraction(editingAttr.id, {
        name: editAttrName,
        description: editAttrDesc,
        category: editAttrCat,
        location: editAttrLoc,
        latitude: Number(editAttrLat),
        longitude: Number(editAttrLng),
        entranceFee: Number(editAttrFee),
        operatingHours: editAttrHours,
        ownerName: editAttrOwner,
        contactPerson: editAttrContactPerson,
        contactNumber: editAttrContactNumber,
        noOfRooms: Number(editAttrRooms) || 0,
        noOfBeds: Number(editAttrBeds) || 0,
        noOfCottages: Number(editAttrCottages) || 0,
        rate: Number(editAttrRate) || 0,
        ...(finalImageUrl ? { images: [finalImageUrl] } : {})
      });
      setEditingAttr(null);
      setEditAttrImageFile(null); setEditAttrImagePreview(null); setEditAttrImageUrlInput('');
      loadData();
      alert("Attraction updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update attraction.");
    } finally {
      setEditAttrUploading(false);
    }
  };

  const handleDeleteAttraction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attraction? This action cannot be undone.")) return;
    try {
      await attractionService.deleteAttraction(id);
      loadData();
      alert("Attraction deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete attraction.");
    }
  };

  const handleEditSchedule = (sched) => {
    setEditingSched(sched);
    setEditTransType(sched.type || 'Fastcraft');
    setEditTransVesselName(sched.vesselName || '');
    setEditTransRoute(sched.route || '');
    setEditTransFare(sched.fare || 250);
    setEditTransDiscountedFare(sched.discountedFare || 200);
    setEditTransDep(sched.departure || '');
    setEditTransArr(sched.arrival || '');
    setEditTransSched(sched.schedule || 'Daily');
  };

  const handleUpdateScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!editingSched) return;
    try {
      await transportationService.updateSchedule(editingSched.id, {
        type: editTransType,
        vesselName: editTransVesselName,
        route: editTransRoute,
        fare: Number(editTransFare) || 250,
        discountedFare: Number(editTransDiscountedFare) || 200,
        departure: editTransDep,
        arrival: editTransArr,
        schedule: editTransSched
      });
      setEditingSched(null);
      loadData();
      alert("Transportation schedule updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update schedule.");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transportation schedule? This action cannot be undone.")) return;
    try {
      await transportationService.deleteSchedule(id);
      loadData();
      alert("Transportation schedule deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete schedule.");
    }
  };

  const handleResetSchedules = async () => {
    if (!window.confirm("Restore all 16 official fastcraft trip schedules from the San Jose MIO poster?")) return;
    try {
      const resetList = await transportationService.resetToOfficialSchedules();
      setAllSchedules(resetList);
      alert("Schedules successfully restored to all 16 official poster trips!");
    } catch (err) {
      console.error(err);
      alert("Failed to reset schedules.");
    }
  };

  const handleDiningImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDiningImageFile(file);
    setDiningImageUrlInput('');
    setDiningImagePreview(URL.createObjectURL(file));
  };

  const handleEditDiningImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditDiningImageFile(file);
    setEditDiningImageUrlInput('');
    setEditDiningImagePreview(URL.createObjectURL(file));
  };

  const handleAddDining = async (e) => {
    e.preventDefault();
    setDiningUploading(true);
    try {
      let imageUrl = null;
      if (diningImageFile) {
        imageUrl = diningImagePreview;
      } else if (diningImageUrlInput.trim()) {
        imageUrl = diningImageUrlInput.trim();
      }

      const specs = diningSpecialties.split(',').map(s => s.trim()).filter(Boolean);

      await diningService.addDiningSpot({
        name: diningName,
        description: diningDesc,
        category: diningCat,
        municipality: diningMun,
        location: diningLoc || `${diningMun}, Dinagat Islands`,
        address: diningAddress || diningLoc || `${diningMun}, Dinagat Islands`,
        owner: diningOwner,
        contactPerson: diningContactPerson,
        contactNumber: diningContactNumber,
        employeeCount: Number(diningEmployees) || 0,
        latitude: Number(diningLat) || 10.0076,
        longitude: Number(diningLng) || 125.6072,
        priceRange: diningPrice,
        openingHours: diningHours,
        rating: Number(diningRating) || 4.9,
        specialties: specs,
        addedBy: user?.uid || 'system',
        addedByEmail: user?.email || 'admin@dinagat.com',
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80']
      });
      setShowDiningForm(false);
      setDiningName(''); setDiningDesc(''); setDiningLoc(''); setDiningAddress(''); setDiningOwner(''); setDiningContactPerson(''); setDiningContactNumber(''); setDiningEmployees('');
      setDiningImageFile(null); setDiningImagePreview(null); setDiningImageUrlInput('');
      loadData();
      alert("Dining facility added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add dining facility.");
    } finally {
      setDiningUploading(false);
    }
  };

  const handleEditDining = (spot) => {
    setEditingDining(spot);
    setEditDiningName(spot.name || '');
    setEditDiningDesc(spot.description || '');
    setEditDiningCat(spot.category || 'Seafood & Native Grill');
    setEditDiningMun(spot.municipality || 'San Jose');
    setEditDiningLoc(spot.location || '');
    setEditDiningAddress(spot.address || spot.location || '');
    setEditDiningOwner(spot.owner || spot.ownerName || '');
    setEditDiningContactPerson(spot.contactPerson || '');
    setEditDiningContactNumber(spot.contactNumber || spot.contactInfo || '');
    setEditDiningEmployees(spot.employeeCount || spot.noOfEmployees || '');
    setEditDiningLat(spot.latitude || (spot.coordinates && spot.coordinates.lat) || 10.0076);
    setEditDiningLng(spot.longitude || (spot.coordinates && spot.coordinates.lng) || 125.6072);
    setEditDiningPrice(spot.priceRange || '₱150 - ₱400');
    setEditDiningHours(spot.openingHours || '07:00 AM - 09:00 PM');
    setEditDiningRating(spot.rating || 4.9);
    setEditDiningSpecialties(Array.isArray(spot.specialties) ? spot.specialties.join(', ') : (spot.specialties || ''));

    setEditDiningImageFile(null);
    const existingImg = (spot.images && spot.images.length > 0) ? spot.images[0] : '';
    setEditDiningImagePreview(existingImg || null);
    setEditDiningImageUrlInput(existingImg || '');
  };

  const handleUpdateDiningSubmit = async (e) => {
    e.preventDefault();
    if (!editingDining) return;
    setEditDiningUploading(true);
    try {
      let finalImageUrl = null;
      if (editDiningImageFile) {
        finalImageUrl = editDiningImagePreview;
      } else if (editDiningImageUrlInput.trim()) {
        finalImageUrl = editDiningImageUrlInput.trim();
      } else if (editDiningImagePreview) {
        finalImageUrl = editDiningImagePreview;
      }

      const specs = editDiningSpecialties.split(',').map(s => s.trim()).filter(Boolean);

      await diningService.updateDiningSpot(editingDining.id, {
        name: editDiningName,
        description: editDiningDesc,
        category: editDiningCat,
        municipality: editDiningMun,
        location: editDiningLoc || `${editDiningMun}, Dinagat Islands`,
        address: editDiningAddress,
        owner: editDiningOwner,
        contactPerson: editDiningContactPerson,
        contactNumber: editDiningContactNumber,
        employeeCount: Number(editDiningEmployees) || 0,
        latitude: Number(editDiningLat),
        longitude: Number(editDiningLng),
        priceRange: editDiningPrice,
        openingHours: editDiningHours,
        rating: Number(editDiningRating) || 4.9,
        specialties: specs,
        ...(finalImageUrl ? { images: [finalImageUrl] } : {})
      });

      setEditingDining(null);
      setEditDiningImageFile(null); setEditDiningImagePreview(null); setEditDiningImageUrlInput('');
      loadData();
      alert("Dining facility updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update dining facility.");
    } finally {
      setEditDiningUploading(false);
    }
  };

  const handleDeleteDining = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dining facility?")) return;
    try {
      await diningService.deleteDiningSpot(id);
      loadData();
      alert("Dining facility deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete dining facility.");
    }
  };

  const filteredAttractions = allAttractions.filter(attr => {
    return attr.name.toLowerCase().includes(searchAttraction.toLowerCase()) ||
      attr.location.toLowerCase().includes(searchAttraction.toLowerCase());
  });

  const filteredSchedules = allSchedules.filter(sched => {
    return sched.route.toLowerCase().includes(searchSchedule.toLowerCase()) ||
      sched.type.toLowerCase().includes(searchSchedule.toLowerCase());
  });

  const filteredDiningSpots = allDiningSpots.filter(spot => {
    return (spot.name || '').toLowerCase().includes(searchDining.toLowerCase()) ||
      (spot.municipality || '').toLowerCase().includes(searchDining.toLowerCase()) ||
      (spot.category || '').toLowerCase().includes(searchDining.toLowerCase());
  });

  const handleChangeRole = (email, newRole) => {
    const storedUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
    if (storedUsers[email]) {
      storedUsers[email].role = newRole;
      localStorage.setItem('dinagat_mock_users', JSON.stringify(storedUsers));
      loadData();
    }
  };

  const handleAcceptOperator = (email) => {
    if (!window.confirm(`Accept and activate tour agency account for ${email}?`)) return;
    const storedUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
    if (storedUsers[email]) {
      storedUsers[email].status = 'active';
      localStorage.setItem('dinagat_mock_users', JSON.stringify(storedUsers));
      loadData();
      alert('Tour agency has been accepted and activated!');
    }
  };

  const handleDeleteOperator = (email) => {
    if (!window.confirm(`Permanently delete tour agency account for ${email}? This cannot be undone.`)) return;
    const storedUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
    if (storedUsers[email]) {
      delete storedUsers[email];
      localStorage.setItem('dinagat_mock_users', JSON.stringify(storedUsers));
      loadData();
      alert('Tour agency account has been deleted.');
    }
  };

  const tabLabels = {
    overview: 'Stats Overview',
    bookings: 'All Bookings',
    attractions: 'Manage Attractions',
    schedules: 'Manage Transports',
    agencies: 'Tour Agencies',
    users: 'Users Directory',
    profile: 'Admin Profile'
  };

  const inputClass = "text-xs border border-slate-200 rounded-xl p-2.5 w-full font-semibold focus:outline-none focus:border-teal-500";

  return (
    <div className="text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        {/* Admin Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-100 pb-3 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === 'overview' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === 'bookings' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Bookings ({allBookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('attractions')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === 'attractions' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Map className="h-3.5 w-3.5" />
            <span>Attractions ({allAttractions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('dining')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === 'dining' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            <span>Dining Facilities ({allDiningSpots.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === 'schedules' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Schedules ({allSchedules.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('agencies')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === 'agencies' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Tour Agencies ({usersList.filter(u => u.role === 'operator').length})</span>
            {usersList.filter(u => u.role === 'operator' && u.status !== 'active').length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-black animate-pulse">
                {usersList.filter(u => u.role === 'operator' && u.status !== 'active').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === 'users' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>All Users ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === 'profile' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Admin Profile</span>
          </button>
        </div>

        <Link
          to="/reports"
          className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0"
        >
          <FileBarChart className="h-4 w-4" />
          <span>Interactive Analytics</span>
        </Link>
      </div>

      {/* ── ADMIN PROFILE ── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Admin profile image with upload overlay */}
            <div className="relative group shrink-0">
              <img
                src={profileImagePreview || user?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                alt={user?.fullName}
                className="h-20 w-20 rounded-full border-2 border-amber-500/30 object-cover shadow-sm shrink-0 aspect-square"
              />
              {editingProfile && (
                <label htmlFor="adminProfileImageInput" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="h-5 w-5 text-white" />
                  <input
                    id="adminProfileImageInput"
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
              <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
                System Administrator
              </span>
              <h3 className="font-extrabold text-base text-slate-800">{user?.fullName || 'System Administrator'}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-bold">{user?.email}</p>
            </div>

            <button
              onClick={() => {
                setEditingProfile(!editingProfile);
                setProfileName(user?.fullName || '');
                setProfilePhone(user?.phone || '');
                setProfileAddress(user?.address || '');
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
              <span>Admin profile updated successfully!</span>
            </div>
          )}

          {editingProfile ? (
            <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-100 p-6 rounded-3xl max-w-lg space-y-4 shadow-sm">
              <h4 className="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wider">Edit Administrator Details</h4>

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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Office / Agency Address</label>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="e.g. San Jose, Dinagat Islands"
                  className="text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 w-full font-semibold"
                />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Admin Email</span>
                <span className="text-xs text-slate-800 font-bold">{user?.email}</span>
              </div>
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Contact Phone</span>
                <span className="text-xs text-slate-800 font-bold">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Office / Agency Address</span>
                <span className="text-xs text-slate-800 font-bold">{user?.address || 'Not provided'}</span>
              </div>
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Account Status</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  <CheckCircle className="h-3 w-3" /> Active Superuser
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STATS OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { id: 'tourists', label: 'Total Tourists', value: usersList.filter(u => u.role === 'tourist').length || metrics.totalTourists, icon: Users, color: 'teal' },
              { id: 'bookings', label: 'Total Bookings', value: allBookings.length, icon: ClipboardList, color: 'rose' },
              { id: 'attractions', label: 'Attractions', value: allAttractions.length, icon: Map, color: 'sky' },
              { id: 'operators', label: 'Tour Agencies', value: usersList.filter(u => u.role === 'operator').length || metrics.totalOperators, icon: Navigation, color: 'amber' },
            ].map(({ id, label, value, icon: Icon, color }) => (

              <div

                key={id}

                onClick={() => setSelectedStatView(selectedStatView === id ? null : id)}

                className={`border p-4 rounded-2xl flex items-center space-x-3 cursor-pointer transition-all ${selectedStatView === id

                    ? `border-${color}-500 bg-${color}-50 shadow-md ring-2 ring-${color}-500/20`
                    : 'border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm'
                  }`}
              >
                <div className={`p-2.5 bg-${color}-100 rounded-xl text-${color}-600 shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">

                  <span className="text-[9px] text-slate-500 block uppercase font-bold leading-tight">{label}</span>
                  <span className="text-lg font-black text-slate-800">{value}</span>

                </div>
              </div>

            ))}

          </div>

          { }
          {selectedStatView === 'tourists' && (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-600" />
                  Tourists Directory
                </h3>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-extrabold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Name</th>

                      <th className="py-3 px-5">Email</th>
                    </tr>

                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {usersList.filter(u => u.role === 'tourist').map(u => (
                      <tr key={u.email} className="hover:bg-slate-50/50">
                        <td className="py-3 px-5 flex items-center gap-3">
                          <img src={u.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <span>{u.fullName}</span>
                        </td>
                        <td className="py-3 px-5 text-slate-500">{u.email}</td>
                      </tr>
                    ))}
                    {usersList.filter(u => u.role === 'tourist').length === 0 && (
                      <tr><td colSpan="2" className="py-6 text-center text-slate-400">No tourists found.</td></tr>
                    )}
                  </tbody>

                </table>
              </div>

            </div>
          )}

          {selectedStatView === 'operators' && (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-amber-600" />
                  Tour Agencies Directory
                </h3>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-extrabold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Name</th>

                      <th className="py-3 px-5">Email</th>
                    </tr>

                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {usersList.filter(u => u.role === 'operator').map(u => (
                      <tr key={u.email} className="hover:bg-slate-50/50">
                        <td className="py-3 px-5 flex items-center gap-3">
                          <img src={u.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <span>{u.fullName}</span>
                        </td>
                        <td className="py-3 px-5 text-slate-500">{u.email}</td>
                      </tr>
                    ))}
                    {usersList.filter(u => u.role === 'operator').length === 0 && (
                      <tr><td colSpan="2" className="py-6 text-center text-slate-400">No tour agencies found.</td></tr>
                    )}
                  </tbody>

                </table>
              </div>

            </div>
          )}

          {selectedStatView === 'attractions' && (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <Map className="h-4 w-4 text-sky-600" />
                  Attractions Overview
                </h3>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-extrabold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Attraction</th>

                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5">Location</th>

                      <th className="py-3 px-5 text-right">Fee (₱)</th>
                    </tr>

                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {allAttractions.map(attr => (
                      <tr key={attr.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-5 font-bold">{attr.name}</td>
                        <td className="py-3 px-5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] uppercase tracking-wider">{attr.category}</span>
                        </td>
                        <td className="py-3 px-5 text-slate-500">{attr.location}</td>
                        <td className="py-3 px-5 text-right font-black text-sky-600">{attr.entranceFee}</td>
                      </tr>
                    ))}
                    {allAttractions.length === 0 && (
                      <tr><td colSpan="4" className="py-6 text-center text-slate-400">No attractions recorded.</td></tr>
                    )}
                  </tbody>

                </table>
              </div>

            </div>
          )}

          {selectedStatView === 'bookings' && (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-rose-600" />
                  Bookings Ledger
                </h3>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-extrabold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">ID</th>

                      <th className="py-3 px-5">Guest</th>
                      <th className="py-3 px-5">Property</th>

                      <th className="py-3 px-5">Dates</th>
                      <th className="py-3 px-5 text-center">Status</th>

                      <th className="py-3 px-5 text-right">Amount (₱)</th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">

                    {allBookings.map(b => (

                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-5 text-[10px] text-slate-400 uppercase tracking-wider">{b.id.substring(0, 8)}...</td>
                        <td className="py-3 px-5 font-bold text-slate-800">{b.touristName || 'Guest'}</td>
                        <td className="py-3 px-5 text-slate-600">{b.hotelName}</td>
                        <td className="py-3 px-5 text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-5 text-center">
                          {b.status === 'confirmed' && <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider"><CheckCircle className="h-3 w-3" /> Confirmed</span>}
                          {b.status === 'pending' && <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider"><Clock className="h-3 w-3" /> Pending</span>}
                          {b.status === 'rejected' && <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider"><XCircle className="h-3 w-3" /> Rejected</span>}
                        </td>
                        <td className="py-3 px-5 text-right font-black text-rose-600">{b.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {allBookings.length === 0 && (
                      <tr><td colSpan="6" className="py-6 text-center text-slate-400">No bookings recorded.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ALL BOOKINGS ── */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-rose-600" />
                All Guest Reservations
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold italic">Read-only — managed by Tour Agencies</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-extrabold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-5">Guest</th>
                  <th className="py-3 px-5">Property</th>
                  <th className="py-3 px-5">Dates</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Amount (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {allBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-5 text-[10px] text-slate-400 uppercase tracking-wider">{b.id.substring(0, 8)}...</td>
                    <td className="py-3 px-5 font-bold text-slate-800">{b.touristName || 'Guest'}</td>
                    <td className="py-3 px-5 text-slate-600">{b.hotelName}</td>
                    <td className="py-3 px-5 text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {b.status === 'confirmed' && <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider"><CheckCircle className="h-3 w-3" /> Confirmed</span>}
                      {b.status === 'pending' && <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider"><Clock className="h-3 w-3" /> Pending</span>}
                      {b.status === 'rejected' && <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider"><XCircle className="h-3 w-3" /> Rejected</span>}
                    </td>
                    <td className="py-3 px-5 text-right font-black text-rose-600">{b.totalAmount ? Number(b.totalAmount).toLocaleString() : 0}</td>
                  </tr>
                ))}
                {allBookings.length === 0 && (
                  <tr><td colSpan="6" className="py-6 text-center text-slate-400">No bookings recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MANAGE ATTRACTIONS ── */}
      {activeTab === 'attractions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              {/* Filter tabs removed */}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search attractions..."
                value={searchAttraction}
                onChange={e => setSearchAttraction(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-48 font-semibold focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={() => {
                  setEditingAttr(null);
                  setShowAttrForm(!showAttrForm);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Attraction</span>
              </button>
            </div>
          </div>

          {showAttrForm && (
            <form onSubmit={handleAddAttraction} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
              <h4 className="font-bold text-xs text-slate-800 col-span-full uppercase tracking-wider">New Attraction Details</h4>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Attraction Name</label>
                <input type="text" value={attrName} onChange={e => setAttrName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Category</label>
                <select value={attrCat} onChange={e => setAttrCat(e.target.value)} className={inputClass}>
                  <option>Beaches</option>
                  <option>Nature</option>
                  <option>Rock Formations</option>
                </select>
              </div>
              <div className="col-span-full">
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Description</label>
                <textarea value={attrDesc} onChange={e => setAttrDesc(e.target.value)} className={`${inputClass} h-20 resize-none`} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Location (Municipality)</label>
                <input type="text" value={attrLoc} onChange={e => setAttrLoc(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Entrance Fee (PHP)</label>
                <input type="number" value={attrFee} onChange={e => setAttrFee(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Operating Hours</label>
                <input type="text" value={attrHours} onChange={e => setAttrHours(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Owner Name</label>
                <input type="text" value={attrOwner} onChange={e => setAttrOwner(e.target.value)} className={inputClass} placeholder="e.g. Local Tourism Council" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Contact Person</label>
                <input type="text" value={attrContactPerson} onChange={e => setAttrContactPerson(e.target.value)} className={inputClass} placeholder="e.g. Juan Dela Cruz" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Contact Phone Number</label>
                <input type="text" value={attrContactNumber} onChange={e => setAttrContactNumber(e.target.value)} className={inputClass} placeholder="e.g. 0917-888-0011" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">No. of Rooms</label>
                <input type="number" min="0" value={attrRooms} onChange={e => setAttrRooms(e.target.value)} className={inputClass} placeholder="e.g. 4" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">No. of Beds</label>
                <input type="number" min="0" value={attrBeds} onChange={e => setAttrBeds(e.target.value)} className={inputClass} placeholder="e.g. 8" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">No. of Cottages</label>
                <input type="number" min="0" value={attrCottages} onChange={e => setAttrCottages(e.target.value)} className={inputClass} placeholder="e.g. 10" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Rate (Cottage / Package Price ₱)</label>
                <input type="number" min="0" value={attrRate} onChange={e => setAttrRate(e.target.value)} className={inputClass} placeholder="e.g. 500" />
              </div>
              <InlineMapPicker
                lat={attrLat}
                lng={attrLng}
                onChange={(newLat, newLng) => {
                  setAttrLat(newLat);
                  setAttrLng(newLng);
                }}
                label="Attraction Location on Map (Click to set pin)"
              />

              {/* ── Photo Upload ── */}
              <div className="col-span-full space-y-2">
                <label className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Attraction Photo</label>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 1: Paste Image URL</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={attrImageUrlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAttrImageUrlInput(val);
                      setAttrImageFile(null);
                      setAttrImagePreview(val);
                    }}
                    className={inputClass}
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 2: Upload Photo File</span>
                  {attrImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={attrImagePreview} alt="Preview" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label
                          htmlFor="attrImageInput"
                          className="px-3 py-1.5 bg-white text-slate-800 text-[10px] font-bold rounded-lg cursor-pointer shadow"
                        >
                          Change File
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAttrImageFile(null);
                            setAttrImagePreview(null);
                            setAttrImageUrlInput('');
                          }}
                          className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg shadow"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="attrImageInput"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all py-5"
                    >
                      <svg className="h-7 w-7 mb-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] font-bold text-slate-600">Click to select photo file</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                    </label>
                  )}
                  <input
                    id="attrImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleAttrImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={attrUploading} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50">{attrUploading ? 'Uploading...' : 'Save Attraction'}</button>
                <button type="button" onClick={() => setShowAttrForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Cancel</button>
              </div>
            </form>
          )}
          <div className="space-y-3">
            { }
            <div className="sm:hidden space-y-3">
              {filteredAttractions.map(attr => (
                <div key={attr.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={(attr.images && attr.images.length > 0) ? attr.images[0] : '/images/spots/bitaog-beach.png'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-800 truncate">{attr.name}</p>

                      <p className="text-[10px] text-teal-600 font-bold">{attr.category}</p>
                    </div>

                  </div>
                  <div className="text-[10px] text-slate-500 space-y-1">
                    <p><strong className="text-slate-700">Location:</strong> {attr.location}</p>
                    <p><strong className="text-slate-700">Fee:</strong> ₱{attr.entranceFee}</p>
                    <p><strong className="text-slate-700">Hours:</strong> {attr.operatingHours}</p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200/50">
                    <button
                      onClick={() => handleEditAttraction(attr)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAttraction(attr.id)}
                      className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredAttractions.length === 0 && (
                <div className="text-center p-6 text-slate-400 text-xs bg-slate-50 border border-slate-100 rounded-2xl">No attractions found matching filters.</div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Attraction</th>
                      <th className="py-3.5 px-4">Category &amp; Location</th>
                      <th className="py-3.5 px-4">Owner &amp; Contact Person</th>
                      <th className="py-3.5 px-4">Contact Number</th>
                      <th className="py-3.5 px-4 text-center">Rooms / Beds / Cottages</th>
                      <th className="py-3.5 px-4">Fee / Rate</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                    {filteredAttractions.map(attr => (
                      <tr key={attr.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={(attr.images && attr.images.length > 0) ? attr.images[0] : '/images/spots/bitaog-beach.png'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <span className="font-extrabold text-slate-800">{attr.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] uppercase tracking-wider font-bold block w-fit mb-0.5">
                            {attr.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[140px]">{attr.location}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-extrabold text-slate-800 text-[11px]">{attr.ownerName || attr.owner || '—'}</p>
                          <p className="text-[10px] text-slate-400">Contact: <span className="font-semibold text-slate-600">{attr.contactPerson || '—'}</span></p>
                        </td>
                        <td className="py-3 px-4 font-bold text-teal-600 text-[11px]">
                          {attr.contactNumber || '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-[10px] font-extrabold text-slate-700 flex flex-col items-center">
                            <span>{attr.noOfRooms ?? 0} Rooms / {attr.noOfBeds ?? 0} Beds</span>
                            <span className="text-amber-600 font-black">{attr.noOfCottages ?? 0} Cottages</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-black text-sky-600 text-xs">Fee: ₱{attr.entranceFee}</p>
                          {attr.rate ? <p className="text-[10px] text-emerald-700 font-extrabold">Rate: ₱{attr.rate}</p> : null}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditAttraction(attr)}
                              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAttraction(attr.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAttractions.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">No attractions found matching filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MANAGE SCHEDULES ── */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Official Fastcraft Timetables</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchSchedule}
                onChange={e => setSearchSchedule(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-48 font-semibold focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={() => {
                  setEditingSched(null);
                  setShowSchedForm(!showSchedForm);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Schedule</span>
              </button>
            </div>
          </div>

          {showSchedForm && (
            <form onSubmit={handleAddSchedule} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
              <h4 className="font-bold text-xs text-slate-800 col-span-full uppercase tracking-wider">New Crossing Schedule</h4>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Transport Type</label>
                <select value={transType} onChange={e => setTransType(e.target.value)} className={inputClass}>
                  <option>Fastcraft</option>
                  <option>Ferry</option>
                  <option>Boat</option>
                  <option>Jeepney</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Vessels Name</label>
                <input type="text" placeholder="e.g. M/V VIELS LINER" value={transVesselName} onChange={e => setTransVesselName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Route</label>
                <input type="text" placeholder="Surigao - San Jose" value={transRoute} onChange={e => setTransRoute(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Standard Minimum Fare (PHP)</label>
                <input type="number" value={transFare} onChange={e => setTransFare(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Discounted Fare (PHP)</label>
                <input type="number" value={transDiscountedFare} onChange={e => setTransDiscountedFare(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Schedule Cycle</label>
                <input type="text" placeholder="Daily / Weekly" value={transSched} onChange={e => setTransSched(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Departure Time</label>
                <input type="text" placeholder="08:00 AM" value={transDep} onChange={e => setTransDep(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Arrival Time</label>
                <input type="text" placeholder="10:00 AM" value={transArr} onChange={e => setTransArr(e.target.value)} className={inputClass} required />
              </div>
              <div className="col-span-full flex gap-3">
                <button type="submit" className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors">Save Route</button>
                <button type="button" onClick={() => setShowSchedForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Cancel</button>
              </div>
            </form>
          )}

          {/* Transportation List Container */}
          <div className="space-y-3">
            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {filteredSchedules.map(sched => (
                <div key={sched.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-sky-50 text-sky-600 rounded-lg text-[9px] uppercase tracking-wider font-extrabold">
                      {sched.type}
                    </span>
                    <span className="text-xs font-black text-teal-600">₱{sched.fare} <span className="text-[9px] text-emerald-600 font-bold">(Disc: ₱{sched.discountedFare || 200})</span></span>
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-1">
                    <p><strong className="text-slate-700">Vessel:</strong> {sched.vesselName || sched.type}</p>
                    <p><strong className="text-slate-700">Route:</strong> {sched.route}</p>
                    <p><strong className="text-slate-700">Departure:</strong> {sched.departure}</p>
                    <p><strong className="text-slate-700">Arrival:</strong> {sched.arrival}</p>
                    <p><strong className="text-slate-700">Cycle:</strong> {sched.schedule}</p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-200/50">
                    <button
                      onClick={() => handleEditSchedule(sched)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(sched.id)}
                      className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredSchedules.length === 0 && (
                <div className="text-center p-6 text-slate-400 text-xs bg-slate-50 border border-slate-100 rounded-2xl">No schedules found matching filters.</div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="py-3.5 px-5">Type & Vessel</th>
                      <th className="py-3.5 px-5">Route</th>
                      <th className="py-3.5 px-5">Departure</th>
                      <th className="py-3.5 px-5">Arrival</th>
                      <th className="py-3.5 px-5">Schedule Cycle</th>
                      <th className="py-3.5 px-5">Fare</th>
                      <th className="py-3.5 px-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                    {filteredSchedules.map(sched => (
                      <tr key={sched.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-5 font-extrabold text-slate-800">
                          <div>{sched.vesselName || sched.type}</div>
                          <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">{sched.type}</span>
                        </td>
                        <td className="py-3 px-5 text-slate-700">{sched.route}</td>
                        <td className="py-3 px-5 text-slate-500">{sched.departure}</td>
                        <td className="py-3 px-5 text-slate-500">{sched.arrival}</td>
                        <td className="py-3 px-5">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                            {sched.schedule}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="font-black text-teal-600 text-sm">₱{sched.fare}</div>
                          <div className="text-[9px] font-extrabold text-emerald-600">Disc: ₱{sched.discountedFare || 200}</div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditSchedule(sched)}
                              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(sched.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSchedules.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">No schedules found matching filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOUR AGENCIES MANAGEMENT ── */}
      {activeTab === 'agencies' && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl flex items-start gap-3">
            <Building2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800">Tour Agency Management</p>
              <p className="text-[10px] text-amber-700 mt-0.5">Accept registered tour agencies to activate their accounts, or delete agencies that are not approved.</p>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {usersList.filter(u => u.role === 'operator').map((u) => (
              <div key={u.email} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center space-x-3">
                  <img src={u.profileImage} alt={u.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-800 truncate">{u.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    {u.address && <p className="text-[10px] text-slate-400 truncate">{u.address}</p>}
                  </div>
                  <span className={`ml-auto shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{u.status || 'pending'}</span>
                </div>
                <div className="flex gap-2">
                  {(!u.status || u.status !== 'active') && (
                    <button
                      onClick={() => handleAcceptOperator(u.email)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ShieldCheck className="h-3 w-3" /> Accept
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteOperator(u.email)}
                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border border-rose-200"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
            {usersList.filter(u => u.role === 'operator').length === 0 && (
              <div className="text-center p-8 text-slate-400 text-xs bg-slate-50 border border-slate-100 rounded-2xl">No tour agencies registered yet.</div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-4 px-5">Agency Name</th>
                    <th className="py-4 px-5">Email Address</th>
                    <th className="py-4 px-5">Phone</th>
                    <th className="py-4 px-5">Address</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                  {usersList.filter(u => u.role === 'operator').map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <img src={u.profileImage} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-extrabold text-slate-800">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500">{u.email}</td>
                      <td className="py-3.5 px-5 text-slate-500">{u.phone || '—'}</td>
                      <td className="py-3.5 px-5 text-slate-500 text-[10px]">{u.address || '—'}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {u.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {u.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex justify-center gap-2">
                          {(!u.status || u.status !== 'active') && (
                            <button
                              onClick={() => handleAcceptOperator(u.email)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"
                            >
                              <ShieldCheck className="h-3 w-3" /> Accept
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOperator(u.email)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition-colors border border-rose-200"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usersList.filter(u => u.role === 'operator').length === 0 && (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-400">No tour agencies registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS DIRECTORY ── */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {usersList.map((u) => (
              <div key={u.email} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center space-x-3">
                  <img src={u.profileImage} alt={u.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-800 truncate">{u.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                  </div>
                  <span className={`ml-auto shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                      u.role === 'operator' ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-800'
                    }`}>{u.role}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-4 px-5">User Name</th>
                    <th className="py-4 px-5">Email Address</th>
                    <th className="py-4 px-5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                  {usersList.map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <img src={u.profileImage} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-extrabold text-slate-800">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500">{u.email}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                            u.role === 'operator' ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-800'
                          }`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MANAGE DINING FACILITIES ── */}
      {activeTab === 'dining' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-600" />
              Dining Facilities &amp; Restaurants ({filteredDiningSpots.length})
            </h3>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search dining spots..."
                value={searchDining}
                onChange={e => setSearchDining(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-48 font-semibold focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={() => {
                  setEditingDining(null);
                  setShowDiningForm(!showDiningForm);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Dining Facility</span>
              </button>
            </div>
          </div>

          {showDiningForm && (
            <form onSubmit={handleAddDining} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
              <h4 className="font-bold text-xs text-slate-800 col-span-full uppercase tracking-wider text-emerald-800">New Dining Facility Details</h4>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Facility / Restaurant Name</label>
                <input type="text" value={diningName} onChange={e => setDiningName(e.target.value)} className={inputClass} placeholder="e.g. San Jose Harbor Seafood Grill" required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Category</label>
                <select value={diningCat} onChange={e => setDiningCat(e.target.value)} className={inputClass}>
                  <option>Seafood &amp; Native Grill</option>
                  <option>Beachfront Bistro</option>
                  <option>Local Carinderia &amp; Eatery</option>
                  <option>Island Cafe &amp; Pastry</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Municipality</label>
                <select value={diningMun} onChange={e => setDiningMun(e.target.value)} className={inputClass}>
                  <option>San Jose</option>
                  <option>Basilisa</option>
                  <option>Cagdianao</option>
                  <option>Libjo</option>
                  <option>Loreto</option>
                  <option>Tubajon</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Specific Location / Address</label>
                <input type="text" value={diningLoc} onChange={e => setDiningLoc(e.target.value)} className={inputClass} placeholder="e.g. Port Road, San Jose" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Owner Name</label>
                <input type="text" value={diningOwner} onChange={e => setDiningOwner(e.target.value)} className={inputClass} placeholder="e.g. Capt. Manuel Santos" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Contact Person</label>
                <input type="text" value={diningContactPerson} onChange={e => setDiningContactPerson(e.target.value)} className={inputClass} placeholder="e.g. Manuel Santos" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Contact Phone Number</label>
                <input type="text" value={diningContactNumber} onChange={e => setDiningContactNumber(e.target.value)} className={inputClass} placeholder="e.g. 0917-555-0101" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Full Street Address</label>
                <input type="text" value={diningAddress} onChange={e => setDiningAddress(e.target.value)} className={inputClass} placeholder="e.g. San Jose Port Promenade, San Jose" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">No. of Employees</label>
                <input type="number" min="0" value={diningEmployees} onChange={e => setDiningEmployees(e.target.value)} className={inputClass} placeholder="e.g. 12" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Price Range</label>
                <input type="text" value={diningPrice} onChange={e => setDiningPrice(e.target.value)} className={inputClass} placeholder="e.g. ₱150 - ₱450" required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Opening Hours</label>
                <input type="text" value={diningHours} onChange={e => setDiningHours(e.target.value)} className={inputClass} placeholder="e.g. 07:00 AM - 09:00 PM" required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">House Specialties (Comma Separated)</label>
                <input type="text" value={diningSpecialties} onChange={e => setDiningSpecialties(e.target.value)} className={inputClass} placeholder="e.g. Grilled Blue Marlin, Coconut Kinilaw" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Rating (Out of 5.0)</label>
                <input type="number" step="0.1" max="5" min="1" value={diningRating} onChange={e => setDiningRating(e.target.value)} className={inputClass} />
              </div>
              <div className="col-span-full">
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Description</label>
                <textarea value={diningDesc} onChange={e => setDiningDesc(e.target.value)} className={`${inputClass} h-20 resize-none`} placeholder="Describe the dining experience, cuisine, and atmosphere..." required />
              </div>

              {/* Pin Map Picker */}
              <InlineMapPicker
                lat={diningLat}
                lng={diningLng}
                onChange={(newLat, newLng) => {
                  setDiningLat(newLat);
                  setDiningLng(newLng);
                }}
                label="Dining Facility Pin Location on Map (Click to set location)"
              />

              {/* Photo Upload */}
              <div className="col-span-full space-y-2">
                <label className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Facility Photo</label>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 1: Image URL</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={diningImageUrlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDiningImageUrlInput(val);
                      setDiningImageFile(null);
                      setDiningImagePreview(val);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 2: Upload File</span>
                  {diningImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={diningImagePreview} alt="Preview" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDiningImageFile(null);
                            setDiningImagePreview(null);
                            setDiningImageUrlInput('');
                          }}
                          className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg shadow"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="diningImageInput"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all py-5"
                    >
                      <svg className="h-7 w-7 mb-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] font-bold text-slate-600">Click to select dining photo file</span>
                    </label>
                  )}
                  <input
                    id="diningImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleDiningImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={diningUploading} className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50">
                  {diningUploading ? 'Saving...' : 'Save Dining Facility'}
                </button>
                <button type="button" onClick={() => setShowDiningForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Cancel</button>
              </div>
            </form>
          )}

          {/* Dining Spots Table / List */}
          <div className="space-y-3">
            <div className="hidden sm:block border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Restaurant / Facility</th>
                      <th className="py-3.5 px-4">Category &amp; Municipality</th>
                      <th className="py-3.5 px-4">Owner &amp; Contact Person</th>
                      <th className="py-3.5 px-4">Address &amp; Contact</th>
                      <th className="py-3.5 px-4 text-center">Employees</th>
                      <th className="py-3.5 px-4">Price Range</th>
                      <th className="py-3.5 px-4">Specialties</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                    {filteredDiningSpots.map(spot => (
                      <tr key={spot.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={(spot.images && spot.images.length > 0) ? spot.images[0] : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <p className="font-extrabold text-slate-800">{spot.name}</p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-600" /> {spot.location || spot.municipality}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[9px] font-extrabold uppercase block w-fit mb-0.5">
                            {spot.category || 'Dining'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">{spot.municipality || 'San Jose'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-extrabold text-slate-800">{spot.owner || spot.ownerName || '—'}</p>
                          <p className="text-[10px] text-slate-400">Contact Person: <span className="font-semibold text-slate-600">{spot.contactPerson || '—'}</span></p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-700 text-[11px]">{spot.address || spot.location || '—'}</p>
                          <p className="text-[10px] font-bold text-emerald-600">{spot.contactNumber || spot.contactInfo || '—'}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 bg-slate-100 text-slate-800 font-extrabold text-[11px] rounded-lg">
                            {spot.employeeCount ?? spot.noOfEmployees ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-700">{spot.priceRange || '₱150 - ₱400'}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(Array.isArray(spot.specialties) ? spot.specialties : String(spot.specialties || '').split(',')).slice(0, 2).map((sp, idx) => (
                              <span key={idx} className="bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded text-[10px]">
                                {typeof sp === 'string' ? sp.trim() : sp}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEditDining(spot)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                              title="Edit Dining Facility"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDining(spot.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              title="Delete Dining Facility"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredDiningSpots.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-400 font-semibold">
                          No dining facilities found. Click "Add Dining Facility" to create one!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ATTRACTION EDIT MODAL ── */}
      {editingAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Edit Attraction</h3>
              <button onClick={() => setEditingAttr(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateAttractionSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <h4 className="font-bold text-xs text-slate-800 col-span-full uppercase tracking-wider">Modify Attraction Details</h4>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Attraction Name</label>
                <input type="text" value={editAttrName} onChange={e => setEditAttrName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Category</label>
                <select value={editAttrCat} onChange={e => setEditAttrCat(e.target.value)} className={inputClass}>
                  <option>Beaches</option>
                  <option>Nature</option>
                  <option>Rock Formations</option>
                </select>
              </div>
              <div className="col-span-full">
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Description</label>
                <textarea value={editAttrDesc} onChange={e => setEditAttrDesc(e.target.value)} className={`${inputClass} h-20 resize-none`} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Location (Municipality)</label>
                <input type="text" value={editAttrLoc} onChange={e => setEditAttrLoc(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Entrance Fee (PHP)</label>
                <input type="number" value={editAttrFee} onChange={e => setEditAttrFee(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Operating Hours</label>
                <input type="text" value={editAttrHours} onChange={e => setEditAttrHours(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Owner Name</label>
                <input type="text" value={editAttrOwner} onChange={e => setEditAttrOwner(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Contact Person</label>
                <input type="text" value={editAttrContactPerson} onChange={e => setEditAttrContactPerson(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Contact Phone Number</label>
                <input type="text" value={editAttrContactNumber} onChange={e => setEditAttrContactNumber(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">No. of Rooms</label>
                <input type="number" min="0" value={editAttrRooms} onChange={e => setEditAttrRooms(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">No. of Beds</label>
                <input type="number" min="0" value={editAttrBeds} onChange={e => setEditAttrBeds(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">No. of Cottages</label>
                <input type="number" min="0" value={editAttrCottages} onChange={e => setEditAttrCottages(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Rate (Cottage / Package Price ₱)</label>
                <input type="number" min="0" value={editAttrRate} onChange={e => setEditAttrRate(e.target.value)} className={inputClass} />
              </div>
              <InlineMapPicker
                lat={editAttrLat}
                lng={editAttrLng}
                onChange={(newLat, newLng) => {
                  setEditAttrLat(newLat);
                  setEditAttrLng(newLng);
                }}
                label="Attraction Location on Map (Click to set pin)"
              />

              {/* ── Photo Upload (Edit) ── */}
              <div className="col-span-full space-y-2">
                <label className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Attraction Photo</label>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 1: Paste Image URL</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={editAttrImageUrlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditAttrImageUrlInput(val);
                      setEditAttrImageFile(null);
                      setEditAttrImagePreview(val);
                    }}
                    className={inputClass}
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 2: Upload Photo File</span>
                  {editAttrImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={editAttrImagePreview} alt="Preview" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label
                          htmlFor="editAttrImageInput"
                          className="px-3 py-1.5 bg-white text-slate-800 text-[10px] font-bold rounded-lg cursor-pointer shadow"
                        >
                          Change File
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditAttrImageFile(null);
                            setEditAttrImagePreview(null);
                            setEditAttrImageUrlInput('');
                          }}
                          className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg shadow"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="editAttrImageInput"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all py-5"
                    >
                      <svg className="h-7 w-7 mb-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] font-bold text-slate-600">Click to select photo file</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                    </label>
                  )}
                  <input
                    id="editAttrImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleEditAttrImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="col-span-full flex gap-3">
                <button type="submit" disabled={editAttrUploading} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50">{editAttrUploading ? 'Updating...' : 'Update Attraction'}</button>
                <button type="button" onClick={() => setEditingAttr(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingSched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Edit Transportation Schedule</h3>
              <button onClick={() => setEditingSched(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateScheduleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <h4 className="font-bold text-xs text-slate-800 col-span-full uppercase tracking-wider">Modify Crossing Schedule</h4>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Transport Type</label>
                <select value={editTransType} onChange={e => setEditTransType(e.target.value)} className={inputClass}>
                  <option>Fastcraft</option>
                  <option>Ferry</option>
                  <option>Boat</option>
                  <option>Jeepney</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Vessels Name</label>
                <input type="text" value={editTransVesselName} onChange={e => setEditTransVesselName(e.target.value)} className={inputClass} required />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Route</label>
                <input type="text" value={editTransRoute} onChange={e => setEditTransRoute(e.target.value)} className={inputClass} required />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Standard Minimum Fare (PHP)</label>
                <input type="number" value={editTransFare} onChange={e => setEditTransFare(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Discounted Fare (PHP)</label>
                <input type="number" value={editTransDiscountedFare} onChange={e => setEditTransDiscountedFare(e.target.value)} className={inputClass} required />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Schedule Cycle</label>
                <input type="text" value={editTransSched} onChange={e => setEditTransSched(e.target.value)} className={inputClass} required />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Departure Time</label>
                <input type="text" value={editTransDep} onChange={e => setEditTransDep(e.target.value)} className={inputClass} required />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Arrival Time</label>
                <input type="text" value={editTransArr} onChange={e => setEditTransArr(e.target.value)} className={inputClass} required />
              </div>

              <div className="col-span-full flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors">Update Schedule</button>
                <button type="button" onClick={() => setEditingSched(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingDining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Edit Dining Facility</h3>
              <button onClick={() => setEditingDining(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDiningSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <h4 className="font-bold text-xs text-slate-800 col-span-full uppercase tracking-wider text-emerald-800">Modify Dining Facility Details</h4>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Facility / Restaurant Name</label>
                <input type="text" value={editDiningName} onChange={e => setEditDiningName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Category</label>
                <select value={editDiningCat} onChange={e => setEditDiningCat(e.target.value)} className={inputClass}>
                  <option>Seafood &amp; Native Grill</option>
                  <option>Beachfront Bistro</option>
                  <option>Local Carinderia &amp; Eatery</option>
                  <option>Island Cafe &amp; Pastry</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Municipality</label>
                <select value={editDiningMun} onChange={e => setEditDiningMun(e.target.value)} className={inputClass}>
                  <option>San Jose</option>
                  <option>Basilisa</option>
                  <option>Cagdianao</option>
                  <option>Libjo</option>
                  <option>Loreto</option>
                  <option>Tubajon</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Specific Location</label>
                <input type="text" value={editDiningLoc} onChange={e => setEditDiningLoc(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Owner Name</label>
                <input type="text" value={editDiningOwner} onChange={e => setEditDiningOwner(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Contact Person</label>
                <input type="text" value={editDiningContactPerson} onChange={e => setEditDiningContactPerson(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Contact Phone Number</label>
                <input type="text" value={editDiningContactNumber} onChange={e => setEditDiningContactNumber(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Full Street Address</label>
                <input type="text" value={editDiningAddress} onChange={e => setEditDiningAddress(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">No. of Employees</label>
                <input type="number" min="0" value={editDiningEmployees} onChange={e => setEditDiningEmployees(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Price Range</label>
                <input type="text" value={editDiningPrice} onChange={e => setEditDiningPrice(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Opening Hours</label>
                <input type="text" value={editDiningHours} onChange={e => setEditDiningHours(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">House Specialties (Comma Separated)</label>
                <input type="text" value={editDiningSpecialties} onChange={e => setEditDiningSpecialties(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Rating</label>
                <input type="number" step="0.1" max="5" min="1" value={editDiningRating} onChange={e => setEditDiningRating(e.target.value)} className={inputClass} />
              </div>
              <div className="col-span-full">
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Description</label>
                <textarea value={editDiningDesc} onChange={e => setEditDiningDesc(e.target.value)} className={`${inputClass} h-20 resize-none`} required />
              </div>

              {/* Pin Map Picker */}
              <InlineMapPicker
                lat={editDiningLat}
                lng={editDiningLng}
                onChange={(newLat, newLng) => {
                  setEditDiningLat(newLat);
                  setEditDiningLng(newLng);
                }}
                label="Update Dining Location on Map (Click to set location)"
              />

              {/* Photo Upload */}
              <div className="col-span-full space-y-2">
                <label className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Facility Photo</label>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 1: Image URL</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={editDiningImageUrlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditDiningImageUrlInput(val);
                      setEditDiningImageFile(null);
                      setEditDiningImagePreview(val);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Option 2: Upload File</span>
                  {editDiningImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={editDiningImagePreview} alt="Preview" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditDiningImageFile(null);
                            setEditDiningImagePreview(null);
                            setEditDiningImageUrlInput('');
                          }}
                          className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg shadow"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="editDiningImageInput"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all py-5"
                    >
                      <svg className="h-7 w-7 mb-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] font-bold text-slate-600">Click to select photo file</span>
                    </label>
                  )}
                  <input
                    id="editDiningImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleEditDiningImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="col-span-full flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" disabled={editDiningUploading} className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50">
                  {editDiningUploading ? 'Updating...' : 'Update Dining Facility'}
                </button>
                <button type="button" onClick={() => setEditingDining(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE MAP PICKER MODAL ── */}
      <MapPickerModal
        isOpen={mapPickerTarget !== null}
        onClose={() => setMapPickerTarget(null)}
        initialLat={mapPickerTarget === 'addAttr' ? attrLat : editAttrLat}
        initialLng={mapPickerTarget === 'addAttr' ? attrLng : editAttrLng}
        title={mapPickerTarget === 'addAttr' ? 'Select Attraction Location' : 'Update Attraction Location'}
        onSelectLocation={(lat, lng) => {
          if (mapPickerTarget === 'addAttr') {
            setAttrLat(lat);
            setAttrLng(lng);
          } else if (mapPickerTarget === 'editAttr') {
            setEditAttrLat(lat);
            setEditAttrLng(lng);
          }
        }}
      />
    </div>
  );
};

export default AdminView;
