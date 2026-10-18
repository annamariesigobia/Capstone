import { db, storage, isMockMode } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PRESEEDED_ATTRACTIONS = [
  {
    id: 'attr-bitaog',
    name: 'Bitaog Beach',
    description: 'A stunning white-sand beach in Basilisa, characterized by clean waters, massive limestone formations, and ancestral trees.',
    category: 'Beaches',
    location: 'Basilisa, Dinagat Islands',
    ownerName: 'Basilisa Local Tourism Council',
    contactPerson: 'Juan Dela Cruz',
    contactNumber: '0917-888-0011',
    noOfRooms: 4,
    noOfBeds: 8,
    noOfCottages: 12,
    rate: 500,
    latitude: 10.1345,
    longitude: 125.6123,
    entranceFee: 50,
    operatingHours: '06:00 AM - 06:00 PM',
    featured: true,
    images: ['/images/spots/bitaog-beach.png']
  },
  {
    id: 'attr-bababu',
    name: 'Lake Bababu',
    description: 'A mysterious freshwater lake situated on top of a mountain, linked to the sea by an underwater cave network. Sacred to locals.',
    category: 'Nature',
    location: 'Basilisa, Dinagat Islands',
    ownerName: 'Bababu Ecotourism Association',
    contactPerson: 'Mario E. Bababu',
    contactNumber: '0928-888-0022',
    noOfRooms: 0,
    noOfBeds: 0,
    noOfCottages: 5,
    rate: 350,
    latitude: 10.2312,
    longitude: 125.5901,
    entranceFee: 100,
    operatingHours: '07:00 AM - 04:30 PM',
    featured: true,
    images: ['/images/spots/lake-bababu.png']
  },
  {
    id: 'attr-hagakhak',
    name: 'Hagakhak Rock Formations',
    description: 'Jagged, cathedral-like limestone cliffs emerging from deep turquoise waters. Perfect for boat tours and photography.',
    category: 'Rock Formations',
    location: 'Basilisa, Dinagat Islands',
    ownerName: 'Dinagat Island Boat Captains Cooperative',
    contactPerson: 'Capt. Antonio Reyes',
    contactNumber: '0939-888-0033',
    noOfRooms: 0,
    noOfBeds: 0,
    noOfCottages: 3,
    rate: 1500,
    latitude: 10.1582,
    longitude: 125.5892,
    entranceFee: 0,
    operatingHours: '24/7 (Guided tours recommended)',
    featured: true,
    images: ['/images/spots/hagakhak-rocks.png']
  },
  {
    id: 'attr-cabacungan',
    name: 'Cabacungan Cove',
    description: 'An adventurous destination with high-walled rock structures enclosing a sheltered cove filled with coral gardens.',
    category: 'Beaches',
    location: 'Cagdianao, Dinagat Islands',
    ownerName: 'Cagdianao Ecotourism Office',
    contactPerson: 'Rosa Cabacungan',
    contactNumber: '0945-888-0044',
    noOfRooms: 6,
    noOfBeds: 12,
    noOfCottages: 8,
    rate: 600,
    latitude: 10.2104,
    longitude: 125.6321,
    entranceFee: 75,
    operatingHours: '08:00 AM - 05:00 PM',
    featured: false,
    images: ['/images/spots/cabacungan-cove.png']
  },
  {
    id: 'attr-duyos',
    name: 'Duyos Beach',
    description: 'Lined with coconut trees, Duyos Beach has soft white sand and shallow waters, making it an ideal destination for swimming and sunsets.',
    category: 'Beaches',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0523,
    longitude: 125.5810,
    entranceFee: 30,
    operatingHours: '06:00 AM - 08:00 PM',
    featured: false,
    images: ['/images/spots/duyos-beach.png']
  },
  {
    id: 'attr-pangabangan',
    name: 'Pangabangan Tidal Pools',
    description: 'Natural tidal pools carved into coastal rock formations with crystal-clear seawater.',
    category: 'Nature',
    location: 'Libjo, Dinagat Islands',
    latitude: 10.2200,
    longitude: 125.5500,
    entranceFee: 50,
    operatingHours: '07:00 AM - 05:00 PM',
    featured: false,
    images: ['/images/spots/tidal-pools.png']
  }
];

const PRESEEDED_REVIEWS = [
  {
    id: 'rev-1',
    userId: 'mock-tourist-uid',
    userName: 'Jane Doe',
    attractionId: 'attr-bitaog',
    rating: 5,
    comment: 'Absolutely spectacular. The limestone formations look like miniature versions of El Nido but with zero crowds!',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'rev-2',
    userId: 'mock-tourist-uid',
    userName: 'Jane Doe',
    attractionId: 'attr-bababu',
    rating: 4,
    comment: 'The trek up is quite challenging but the lake at the top is serene and mesmerizing. Bring lots of water.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const MOCK_ATTRACTIONS_KEY = 'dinagat_mock_attractions';
const MOCK_REVIEWS_KEY = 'dinagat_mock_reviews';

const safeSaveLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (quotaErr) {
    console.warn(`LocalStorage quota error for key ${key}, using session memory fallback:`, quotaErr);
  }
  window[`__dinagat_memory_${key}`] = data;
};

const safeGetLocalStorage = (key, defaultVal = []) => {
  if (window[`__dinagat_memory_${key}`]) {
    return window[`__dinagat_memory_${key}`];
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const mapAttractionImages = (attr) => {
  if (!attr) return attr;
  
  if (attr.images && attr.images.length > 0 && attr.images[0]) {
    const img0 = attr.images[0];
    if (!img0.includes('unsplash.com')) {
      return attr;
    }
  }

  const name = (attr.name || '').toLowerCase();
  let correctImage = '/images/spots/bitaog-beach.png';
  if (name.includes('bitaog')) correctImage = '/images/spots/bitaog-beach.png';
  else if (name.includes('bababu')) correctImage = '/images/spots/lake-bababu.png';
  else if (name.includes('hagakhak')) correctImage = '/images/spots/hagakhak-rocks.png';
  else if (name.includes('cabacungan')) correctImage = '/images/spots/cabacungan-cove.png';
  else if (name.includes('duyos')) correctImage = '/images/spots/duyos-beach.png';
  else if (name.includes('pangabangan') || name.includes('tidal')) correctImage = '/images/spots/tidal-pools.png';

  return { ...attr, images: [correctImage] };
};

const initMockData = () => {
  const existing = safeGetLocalStorage(MOCK_ATTRACTIONS_KEY, null);
  if (!existing || existing.length === 0) {
    safeSaveLocalStorage(MOCK_ATTRACTIONS_KEY, PRESEEDED_ATTRACTIONS);
  } else {
    try {
      let list = [...existing];
      let modified = false;
      PRESEEDED_ATTRACTIONS.forEach(pre => {
        const idx = list.findIndex(a => a.id === pre.id);
        if (idx !== -1) {
          const item = list[idx];
          if (!item.images || item.images.length === 0 || item.images[0].includes('unsplash.com')) {
            list[idx] = { ...item, images: pre.images };
            modified = true;
          }
        } else {
          list.push(pre);
          modified = true;
        }
      });
      if (modified) {
        safeSaveLocalStorage(MOCK_ATTRACTIONS_KEY, list);
      }
    } catch (e) {
      safeSaveLocalStorage(MOCK_ATTRACTIONS_KEY, PRESEEDED_ATTRACTIONS);
    }
  }
  if (!safeGetLocalStorage(MOCK_REVIEWS_KEY, null)) {
    safeSaveLocalStorage(MOCK_REVIEWS_KEY, PRESEEDED_REVIEWS);
  }
};

if (isMockMode) {
  initMockData();
}

export const attractionService = {
  
  getAttractions: async () => {
    if (isMockMode) {
      initMockData();
      const list = safeGetLocalStorage(MOCK_ATTRACTIONS_KEY, []);
      return list.map(mapAttractionImages);
    } else {
      const q = collection(db, 'attractions');
      const snap = await getDocs(q);
      return snap.docs.map(doc => mapAttractionImages({ id: doc.id, ...doc.data() }));
    }
  },

  getAttractionById: async (id) => {
    if (isMockMode) {
      initMockData();
      const list = safeGetLocalStorage(MOCK_ATTRACTIONS_KEY, []);
      const item = list.find(a => a.id === id) || null;
      return mapAttractionImages(item);
    } else {
      const docRef = doc(db, 'attractions', id);
      const snap = await getDoc(docRef);
      return snap.exists() ? mapAttractionImages({ id: snap.id, ...snap.data() }) : null;
    }
  },

  addAttraction: async (attractionData) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_ATTRACTIONS_KEY, []);
      const lat = parseFloat(attractionData.latitude);
      const lng = parseFloat(attractionData.longitude);
      const newAttr = {
        id: 'attr-' + Math.random().toString(36).substr(2, 9),
        featured: false,
        images: attractionData.images || ['/images/spots/bitaog-beach.png'],
        ...attractionData,
        entranceFee: Number(attractionData.entranceFee) || 0,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng
      };
      list.push(newAttr);
      safeSaveLocalStorage(MOCK_ATTRACTIONS_KEY, list);
      return newAttr;
    } else {
      const lat = parseFloat(attractionData.latitude);
      const lng = parseFloat(attractionData.longitude);
      const docRef = await addDoc(collection(db, 'attractions'), {
        ...attractionData,
        entranceFee: Number(attractionData.entranceFee) || 0,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...attractionData };
    }
  },

  getReviews: async (attractionId) => {
    if (isMockMode) {
      initMockData();
      const reviews = safeGetLocalStorage(MOCK_REVIEWS_KEY, []);
      return reviews.filter(r => r.attractionId === attractionId);
    } else {
      const q = query(collection(db, 'reviews'), where('attractionId', '==', attractionId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  addReview: async (reviewData) => {
    if (isMockMode) {
      const reviews = safeGetLocalStorage(MOCK_REVIEWS_KEY, []);
      const newReview = {
        id: 'rev-' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...reviewData,
        rating: Number(reviewData.rating) || 5
      };
      reviews.push(newReview);
      safeSaveLocalStorage(MOCK_REVIEWS_KEY, reviews);
      return newReview;
    } else {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        rating: Number(reviewData.rating) || 5,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...reviewData };
    }
  },

  updateAttraction: async (id, attractionData) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_ATTRACTIONS_KEY, []);
      const idx = list.findIndex(a => a.id === id);
      if (idx !== -1) {
        const lat = parseFloat(attractionData.latitude);
        const lng = parseFloat(attractionData.longitude);
        list[idx] = {
          ...list[idx],
          ...attractionData,
          entranceFee: Number(attractionData.entranceFee) || 0,
          latitude: isNaN(lat) ? list[idx].latitude : lat,
          longitude: isNaN(lng) ? list[idx].longitude : lng
        };
        safeSaveLocalStorage(MOCK_ATTRACTIONS_KEY, list);
        return list[idx];
      }
      throw new Error("Attraction not found");
    } else {
      const lat = parseFloat(attractionData.latitude);
      const lng = parseFloat(attractionData.longitude);
      const docRef = doc(db, 'attractions', id);
      const updateData = {
        ...attractionData,
        entranceFee: Number(attractionData.entranceFee) || 0,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng
      };
      await updateDoc(docRef, updateData);
      return { id, ...updateData };
    }
  },

  deleteAttraction: async (id) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_ATTRACTIONS_KEY, []);
      const updatedList = list.filter(a => a.id !== id);
      safeSaveLocalStorage(MOCK_ATTRACTIONS_KEY, updatedList);
      return true;
    } else {
      const docRef = doc(db, 'attractions', id);
      await deleteDoc(docRef);
      return true;
    }
  },

  uploadAttractionImage: async (attractionId, file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      if (typeof file === 'string') return resolve(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result;
        if (!rawDataUrl) return resolve(null);

        const timeout = setTimeout(() => {
          resolve(rawDataUrl);
        }, 1500);

        const img = new Image();
        img.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 800;
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
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
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
  }
};

export default attractionService;
