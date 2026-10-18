import { db, isMockMode } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';

const PRESEEDED_ACCOMMODATIONS = [
  {
    id: 'acc-isla',
    operatorId: 'mock-operator-uid',
    hotelName: 'Isla Beach Resort',
    description: 'A luxurious beach resort featuring pristine oceanfront cabanas, infinity pool, dive center, and dynamic seafood dining.',
    amenities: ['Wifi', 'Pool', 'Aircon', 'Restaurant', 'Beach Access', 'Bar'],
    availableRooms: 12,
    noOfBeds: 24,
    noOfCottages: 6,
    pricePerNight: 3500,
    ownerName: 'Don Fernando Isla',
    contactPerson: 'Isabella Isla',
    contactNumber: '0923-456-7890',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1360,
    longitude: 125.6130,
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'],
    contactInfo: '+63 923 456 7890 (operator@dinagat.com)'
  },
  {
    id: 'acc-oceanview',
    operatorId: 'mock-operator-uid',
    hotelName: 'Oceanview Homestay',
    description: 'An affordable, cozy family run homestay overlooking San Jose Bay. Experience warm local hospitality and home-cooked meals.',
    amenities: ['Wifi', 'Kitchen Access', 'Fan', 'Terrace'],
    availableRooms: 5,
    noOfBeds: 10,
    noOfCottages: 2,
    pricePerNight: 1200,
    ownerName: 'Clara Oceanview',
    contactPerson: 'Clara Santos',
    contactNumber: '0934-567-8901',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0510,
    longitude: 125.5820,
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80'],
    contactInfo: '+63 934 567 8901'
  },
  {
    id: 'acc-sj-inn',
    operatorId: 'mock-operator-uid',
    hotelName: 'San Jose Port Inn',
    description: 'Conveniently situated 2 minutes from the passenger terminal. Modern, compact air-conditioned rooms designed for active travelers.',
    amenities: ['Wifi', 'Aircon', 'Cable TV', '24/7 Desk'],
    availableRooms: 8,
    noOfBeds: 12,
    noOfCottages: 0,
    pricePerNight: 1600,
    ownerName: 'Ramon Portes',
    contactPerson: 'Ramon Portes',
    contactNumber: '0912-345-6789',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0505,
    longitude: 125.5789,
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'],
    contactInfo: '+63 912 345 6789'
  }
];


const MOCK_ACCOMMODATIONS_KEY = 'dinagat_mock_accommodations';

const safeSaveLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (quotaErr) {
    console.warn(`LocalStorage quota error for key ${key}, using session memory fallback:`, quotaErr);
  }
  window[`__dinagat_memory_${key}`] = data;
};

const safeGetLocalStorage = (key, defaultVal = []) => {
  // Always read from localStorage first so cross-account changes are visible
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      window[`__dinagat_memory_${key}`] = parsed;
      return parsed;
    }
  } catch (e) { /* fall through */ }
  if (window[`__dinagat_memory_${key}`]) {
    return window[`__dinagat_memory_${key}`];
  }
  return defaultVal;
};

const initMockData = () => {
  // IMPORTANT: Do NOT pre-seed accommodations globally.
  // Each operator only sees accommodations with their own operatorId.
  // This function is intentionally a no-op to prevent shared mock data from
  // leaking across operator accounts.
};

// One-time startup: scrub the old globally-shared preseeded accommodations
// (acc-isla, acc-oceanview, acc-sj-inn) that should never appear for new operators
(() => {
  try {
    const PRESET_IDS = ['acc-isla', 'acc-oceanview', 'acc-sj-inn'];
    const raw = localStorage.getItem(MOCK_ACCOMMODATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const realOnly = parsed.filter(acc => !PRESET_IDS.includes(acc.id));
        if (realOnly.length !== parsed.length) {
          localStorage.setItem(MOCK_ACCOMMODATIONS_KEY, JSON.stringify(realOnly));
          if (window[`__dinagat_memory_${MOCK_ACCOMMODATIONS_KEY}`]) {
            window[`__dinagat_memory_${MOCK_ACCOMMODATIONS_KEY}`] = realOnly;
          }
        }
      }
    }
  } catch (e) { /* silent */ }
})();

export const accommodationService = {
  
  getAccommodations: async () => {
    if (isMockMode) {
      return safeGetLocalStorage(MOCK_ACCOMMODATIONS_KEY, []);
    } else {
      const q = collection(db, 'accommodations');
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  getAccommodationsByOperator: async (operatorId) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_ACCOMMODATIONS_KEY, []);
      // STRICT isolation: only return accommodations that belong to this operator
      return list.filter(acc => acc.operatorId === operatorId);
    } else {
      const q = query(collection(db, 'accommodations'), where('operatorId', '==', operatorId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // NOTE: No fallback to all-accommodations — operators must only see their own
    }
  },

  getAccommodationById: async (id) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_ACCOMMODATIONS_KEY, []);
      return list.find(acc => acc.id === id) || null;
    } else {
      const docRef = doc(db, 'accommodations', id);
      const snap = await getDoc(docRef);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }
  },

  addAccommodation: async (accData) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_ACCOMMODATIONS_KEY, []);
      const lat = parseFloat(accData.latitude);
      const lng = parseFloat(accData.longitude);
      const newAcc = {
        id: 'acc-' + Math.random().toString(36).substr(2, 9),
        images: accData.images || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'],
        amenities: accData.amenities || [],
        ...accData,
        pricePerNight: Number(accData.pricePerNight) || 1500,
        availableRooms: Number(accData.availableRooms) || 5,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng
      };
      list.push(newAcc);
      safeSaveLocalStorage(MOCK_ACCOMMODATIONS_KEY, list);
      return newAcc;
    } else {
      const lat = parseFloat(accData.latitude);
      const lng = parseFloat(accData.longitude);
      const docRef = await addDoc(collection(db, 'accommodations'), {
        ...accData,
        pricePerNight: Number(accData.pricePerNight) || 1500,
        availableRooms: Number(accData.availableRooms) || 5,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...accData };
    }
  },

  updateAccommodation: async (id, updatedData) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_ACCOMMODATIONS_KEY, []);
      const index = list.findIndex(acc => acc.id === id);
      if (index !== -1) {
        const lat = updatedData.latitude !== undefined ? parseFloat(updatedData.latitude) : undefined;
        const lng = updatedData.longitude !== undefined ? parseFloat(updatedData.longitude) : undefined;
        list[index] = {
          ...list[index],
          ...updatedData,
          pricePerNight: updatedData.pricePerNight !== undefined ? Number(updatedData.pricePerNight) : list[index].pricePerNight,
          availableRooms: updatedData.availableRooms !== undefined ? Number(updatedData.availableRooms) : list[index].availableRooms,
          latitude: lat !== undefined ? (isNaN(lat) ? list[index].latitude : lat) : list[index].latitude,
          longitude: lng !== undefined ? (isNaN(lng) ? list[index].longitude : lng) : list[index].longitude
        };
        safeSaveLocalStorage(MOCK_ACCOMMODATIONS_KEY, list);
        return list[index];
      }
      throw new Error("Accommodation not found");
    } else {
      const docRef = doc(db, 'accommodations', id);
      const lat = updatedData.latitude !== undefined ? parseFloat(updatedData.latitude) : undefined;
      const lng = updatedData.longitude !== undefined ? parseFloat(updatedData.longitude) : undefined;
      const payload = {
        ...updatedData,
        pricePerNight: updatedData.pricePerNight !== undefined ? Number(updatedData.pricePerNight) : undefined,
        availableRooms: updatedData.availableRooms !== undefined ? Number(updatedData.availableRooms) : undefined,
        ...(lat !== undefined ? { latitude: isNaN(lat) ? null : lat } : {}),
        ...(lng !== undefined ? { longitude: isNaN(lng) ? null : lng } : {})
      };
      await updateDoc(docRef, payload);
      return true;
    }
  },

  uploadAccommodationImage: async (accommodationId, file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      if (typeof file === 'string') return resolve(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result;
        if (!rawDataUrl) return resolve(null);

        const timeout = setTimeout(() => {
          resolve(rawDataUrl);
        }, 1000);

        const img = new Image();
        img.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 600;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.6);
            resolve(compressed);
          } catch (err) {
            resolve(rawDataUrl);
          }
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(rawDataUrl);
        };
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  },

  deleteAccommodation: async (id) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_ACCOMMODATIONS_KEY, []);
      const filtered = list.filter(acc => acc.id !== id);
      safeSaveLocalStorage(MOCK_ACCOMMODATIONS_KEY, filtered);
      return true;
    } else {
      const { deleteDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'accommodations', id);
      await deleteDoc(docRef);
      return true;
    }
  },

  /**
   * Get the GCash name & number for a given operatorId.
   * In mock mode: reads from dinagat_mock_users localStorage.
   * In Firebase mode: reads the user document from /users/{operatorId}.
   * Returns { gcashName, gcashNumber } or null values if not set.
   */
  getOperatorGcash: async (operatorId) => {
    if (!operatorId) return { gcashName: null, gcashNumber: null };
    if (isMockMode) {
      try {
        const raw = localStorage.getItem('dinagat_mock_users');
        if (raw) {
          const users = JSON.parse(raw);
          const found = Object.values(users).find(u => u.uid === operatorId);
          if (found) {
            return {
              gcashName: found.gcashName || null,
              gcashNumber: found.gcashNumber || null,
              operatorName: found.fullName || null
            };
          }
        }
      } catch (e) { /* silent */ }
      return { gcashName: null, gcashNumber: null, operatorName: null };
    } else {
      try {
        const { getDoc: _getDoc, doc: _doc } = await import('firebase/firestore');
        const { db: _db } = await import('./firebase');
        const snap = await _getDoc(_doc(_db, 'users', operatorId));
        if (snap.exists()) {
          const data = snap.data();
          return {
            gcashName: data.gcashName || null,
            gcashNumber: data.gcashNumber || null,
            operatorName: data.fullName || null
          };
        }
      } catch (e) { /* silent */ }
      return { gcashName: null, gcashNumber: null, operatorName: null };
    }
  }
};

export default accommodationService;

