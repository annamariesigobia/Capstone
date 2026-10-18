import { db, isMockMode } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'dinagat_dining_spots';

export const INITIAL_DINING_SPOTS = [
  {
    id: 'dine-1',
    name: 'San Jose Harbor Seafood Grill & Bistro',
    category: 'Seafood & Grill',
    municipality: 'San Jose',
    location: 'San Jose Port, Dinagat Islands',
    address: 'San Jose Port Promenade, San Jose, Dinagat Islands',
    owner: 'Capt. Manuel Santos',
    contactPerson: 'Manuel Santos',
    contactNumber: '0917-555-0101',
    employeeCount: 12,
    priceRange: '₱150 - ₱450',
    operatingHours: '07:00 AM - 09:30 PM',
    specialties: ['Grilled Buttered Lobster', 'Fresh Tuna Kinilaw', 'Steamed Crabs', 'Coconut Shake'],
    description: 'Fresh sea catch daily served right at the San Jose port promenade with sunset harbor views.',
    latitude: 10.0525,
    longitude: 125.6070,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'],
    rating: 4.9
  },
  {
    id: 'dine-2',
    name: 'Basilisa Cove Sunset Eatery',
    category: 'Beachfront Dining',
    municipality: 'Basilisa',
    location: 'Basilisa, Dinagat Islands',
    address: 'Bitaog Beachfront, Basilisa, Dinagat Islands',
    owner: 'Elena B. Rodriguez',
    contactPerson: 'Elena Rodriguez',
    contactNumber: '0928-555-0102',
    employeeCount: 8,
    priceRange: '₱150 - ₱400',
    operatingHours: '08:00 AM - 08:00 PM',
    specialties: ['Grilled Sinugba Tanguigue', 'Sinigang na Lapu-Lapu', 'Island Buko Juice'],
    description: 'Relaxed beachfront native bamboo dining huts right beside Bitaog Beach and turquoise waters.',
    latitude: 10.1350,
    longitude: 125.5940,
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'],
    rating: 4.8
  },
  {
    id: 'dine-3',
    name: 'Libjo Bay Native Carinderia & Resto',
    category: 'Local Cuisine',
    municipality: 'Libjo',
    location: 'Libjo, Dinagat Islands',
    address: 'Poblacion Baywalk, Libjo, Dinagat Islands',
    owner: 'Chef Pedro Alcantara',
    contactPerson: 'Rosa Alcantara',
    contactNumber: '0939-555-0103',
    employeeCount: 6,
    priceRange: '₱100 - ₱300',
    operatingHours: '06:00 AM - 07:00 PM',
    specialties: ['Adobong Pugita (Octopus)', 'Humba Dinagat', 'Tinolang Manok Bisaya'],
    description: 'Authentic local island homestyle cooking with traditional Caraga & Dinagat spices.',
    latitude: 10.2210,
    longitude: 125.5460,
    images: ['https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&auto=format&fit=crop&q=80'],
    rating: 4.7
  },
  {
    id: 'dine-4',
    name: 'Cagdianao Rockside Cafe & Lounge',
    category: 'Cafe & Bistro',
    municipality: 'Cagdianao',
    location: 'Cagdianao, Dinagat Islands',
    address: 'Cabacungan Cliffside Road, Cagdianao, Dinagat Islands',
    owner: 'Marco & Julia Valenzuela',
    contactPerson: 'Julia Valenzuela',
    contactNumber: '0945-555-0104',
    employeeCount: 10,
    priceRange: '₱120 - ₱350',
    operatingHours: '09:00 AM - 09:00 PM',
    specialties: ['Native Coffee Brew', 'Mango Crêpes', 'Calamansi Mint Cooler', 'Seafood Pasta'],
    description: 'Scenic limestone cliffside coffee bar and dining spot overlooking Cabacungan Cove.',
    latitude: 10.2110,
    longitude: 125.6890,
    images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80'],
    rating: 4.9
  },
  {
    id: 'dine-5',
    name: 'Loreto Seaside Island Kitchen',
    category: 'Seafood & Grill',
    municipality: 'Loreto',
    location: 'Loreto, Dinagat Islands',
    address: 'Northern Wharf Boulevard, Loreto, Dinagat Islands',
    owner: 'Ricardo E. Tan',
    contactPerson: 'Ricardo Tan',
    contactNumber: '0998-555-0105',
    employeeCount: 15,
    priceRange: '₱150 - ₱400',
    operatingHours: '10:00 AM - 09:00 PM',
    specialties: ['Inihaw na Pusit', 'Crispy Calamari', 'Sizzling Gambas', 'Cold Local Juices'],
    description: 'Popular northern island seafood hub with open-air dining decks overlooking the Philippine Sea.',
    latitude: 10.3610,
    longitude: 125.5810,
    images: ['https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&auto=format&fit=crop&q=80'],
    rating: 4.8
  }
];

const normalizeSpot = (spot) => ({
  ...spot,
  specialties: typeof spot.specialties === 'string'
    ? spot.specialties.split(',').map(s => s.trim()).filter(Boolean)
    : (Array.isArray(spot.specialties) ? spot.specialties : [])
});

export const diningService = {
  getDiningSpots: async () => {
    let rawList = [];
    if (isMockMode) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          rawList = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
      if (!rawList || rawList.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DINING_SPOTS));
        rawList = INITIAL_DINING_SPOTS;
      }
    } else {
      try {
        const querySnapshot = await getDocs(collection(db, 'dining_spots'));
        querySnapshot.forEach((docSnap) => {
          rawList.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (rawList.length === 0) {
          for (const spot of INITIAL_DINING_SPOTS) {
            try {
              await setDoc(doc(db, 'dining_spots', spot.id), spot);
            } catch (seedErr) {
              console.warn('Could not auto-seed spot to firestore:', seedErr);
            }
          }
          rawList = INITIAL_DINING_SPOTS;
        }
      } catch (err) {
        console.error('Firestore getDiningSpots failed, using mock data fallback:', err);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try { rawList = JSON.parse(stored); } catch (e) {}
        }
        if (!rawList || rawList.length === 0) {
          rawList = INITIAL_DINING_SPOTS;
        }
      }
    }
    return rawList.map(normalizeSpot);
  },

  addDiningSpot: async (data) => {
    const newId = `dine-${Date.now()}`;
    const newSpot = { id: newId, rating: 5.0, ...data };

    if (isMockMode) {
      const list = await diningService.getDiningSpots();
      const updated = [newSpot, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newSpot;
    } else {
      try {
        await setDoc(doc(db, 'dining_spots', newId), newSpot);
      } catch (fsErr) {
        console.warn('Firestore setDoc failed, saving to local state:', fsErr);
      }
      const list = await diningService.getDiningSpots();
      const updated = [newSpot, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newSpot;
    }
  },

  updateDiningSpot: async (id, data) => {
    if (isMockMode) {
      const list = await diningService.getDiningSpots();
      const updated = list.map(item => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } else {
      try {
        await updateDoc(doc(db, 'dining_spots', id), data);
      } catch (fsErr) {
        console.warn('Firestore updateDoc failed, saving to local state:', fsErr);
      }
      const list = await diningService.getDiningSpots();
      const updated = list.map(item => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  },

  deleteDiningSpot: async (id) => {
    if (isMockMode) {
      const list = await diningService.getDiningSpots();
      const updated = list.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } else {
      try {
        await deleteDoc(doc(db, 'dining_spots', id));
      } catch (fsErr) {
        console.warn('Firestore deleteDoc failed, updating local state:', fsErr);
      }
      const list = await diningService.getDiningSpots();
      const updated = list.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  }
};

export default diningService;
