import { db, isMockMode } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const PRESEEDED_TRANSPORT = [
  // ── SAN JOSE TO SURIGAO CITY BOULEVARD ──
  {
    id: 'trans-sj-sur-1',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VIELS LINER',
    type: 'FASTCRAFT',
    route: 'San Jose Port → Surigao City Boulevard',
    fare: 250,
    discountedFare: 200,
    departure: '5:50 am',
    arrival: '6:50 am',
    schedule: 'Daily'
  },
  {
    id: 'trans-sj-sur-2',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V NEWS MPC ISLAND NAVIGATOR',
    type: 'FASTCRAFT',
    route: 'San Jose Port → Surigao City Boulevard',
    fare: 250,
    discountedFare: 200,
    departure: '7:45 am',
    arrival: '8:45 am',
    schedule: 'Daily'
  },
  {
    id: 'trans-sj-sur-3',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VINCE GABRIEL',
    type: 'FASTCRAFT',
    route: 'San Jose Port → Surigao City Boulevard',
    fare: 250,
    discountedFare: 200,
    departure: '8:30 am',
    arrival: '9:30 am',
    schedule: 'Daily'
  },
  {
    id: 'trans-sj-sur-4',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VIELS LINER',
    type: 'FASTCRAFT',
    route: 'San Jose Port → Surigao City Boulevard',
    fare: 250,
    discountedFare: 200,
    departure: '10:15 am',
    arrival: '11:15 am',
    schedule: 'Daily'
  },
  {
    id: 'trans-sj-sur-5',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VIELS LINER',
    type: 'FASTCRAFT',
    route: 'San Jose Port → Surigao City Boulevard',
    fare: 250,
    discountedFare: 200,
    departure: '12:05 pm',
    arrival: '01:05 pm',
    schedule: 'Daily'
  },
  {
    id: 'trans-sj-sur-6',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V NEWS MPC ISLAND NAVIGATOR',
    type: 'FASTCRAFT',
    route: 'San Jose Port → Surigao City Boulevard',
    fare: 250,
    discountedFare: 200,
    departure: '1:00 pm',
    arrival: '2:00 pm',
    schedule: 'Daily'
  },
  {
    id: 'trans-sj-sur-7',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VIELS LINER',
    type: 'FASTCRAFT',
    route: 'San Jose Port → Surigao City Boulevard',
    fare: 250,
    discountedFare: 200,
    departure: '3:45 pm',
    arrival: '4:55 pm',
    schedule: 'Daily'
  },
  {
    id: 'trans-sj-sur-8',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VINCE GABRIEL',
    type: 'FASTCRAFT',
    route: 'San Jose Port → Surigao City Boulevard',
    fare: 250,
    discountedFare: 200,
    departure: '4:30 pm',
    arrival: '5:30 pm',
    schedule: 'Daily'
  },

  // ── SURIGAO CITY BOULEVARD TO SAN JOSE ──
  {
    id: 'trans-sur-sj-1',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VINCE GABRIEL',
    type: 'FASTCRAFT',
    route: 'Surigao City Boulevard → San Jose Port',
    fare: 250,
    discountedFare: 200,
    departure: '5:20 AM',
    arrival: '6:20 AM',
    schedule: 'Daily'
  },
  {
    id: 'trans-sur-sj-2',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VIELS LINER',
    type: 'FASTCRAFT',
    route: 'Surigao City Boulevard → San Jose Port',
    fare: 250,
    discountedFare: 200,
    departure: '6:15 AM',
    arrival: '7:15 AM',
    schedule: 'Daily'
  },
  {
    id: 'trans-sur-sj-3',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VIELS LINER',
    type: 'FASTCRAFT',
    route: 'Surigao City Boulevard → San Jose Port',
    fare: 250,
    discountedFare: 200,
    departure: '8:20 AM',
    arrival: '9:20 AM',
    schedule: 'Daily'
  },
  {
    id: 'trans-sur-sj-4',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V NEWS MPC ISLAND NAVIGATOR',
    type: 'FASTCRAFT',
    route: 'Surigao City Boulevard → San Jose Port',
    fare: 250,
    discountedFare: 200,
    departure: '10:10 AM',
    arrival: '11:10 AM',
    schedule: 'Daily'
  },
  {
    id: 'trans-sur-sj-5',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VIELS LINER',
    type: 'FASTCRAFT',
    route: 'Surigao City Boulevard → San Jose Port',
    fare: 250,
    discountedFare: 200,
    departure: '12:00 PM',
    arrival: '1:00 PM',
    schedule: 'Daily'
  },
  {
    id: 'trans-sur-sj-6',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VINCE GABRIEL',
    type: 'FASTCRAFT',
    route: 'Surigao City Boulevard → San Jose Port',
    fare: 250,
    discountedFare: 200,
    departure: '1:30 PM',
    arrival: '2:30 PM',
    schedule: 'Daily'
  },
  {
    id: 'trans-sur-sj-7',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V NEWS MPC ISLAND NAVIGATOR',
    type: 'FASTCRAFT',
    route: 'Surigao City Boulevard → San Jose Port',
    fare: 250,
    discountedFare: 200,
    departure: '4:00 PM',
    arrival: '5:00 PM',
    schedule: 'Daily'
  },
  {
    id: 'trans-sur-sj-8',
    operatorId: 'mock-operator-uid',
    vesselName: 'M/V VIELS LINER',
    type: 'FASTCRAFT',
    route: 'Surigao City Boulevard → San Jose Port',
    fare: 250,
    discountedFare: 200,
    departure: '5:50 PM',
    arrival: '6:50 PM',
    schedule: 'Daily'
  }
];

const MOCK_TRANSPORT_KEY = 'dinagat_mock_transport';

const initMockData = () => {
  try {
    const existingStr = localStorage.getItem(MOCK_TRANSPORT_KEY);
    if (!existingStr) {
      localStorage.setItem(MOCK_TRANSPORT_KEY, JSON.stringify(PRESEEDED_TRANSPORT));
    }
  } catch {
    localStorage.setItem(MOCK_TRANSPORT_KEY, JSON.stringify(PRESEEDED_TRANSPORT));
  }
};

if (isMockMode) {
  initMockData();
}

export const transportationService = {
  
  getSchedules: async () => {
    let list = [];

    if (isMockMode) {
      initMockData();
      try {
        list = JSON.parse(localStorage.getItem(MOCK_TRANSPORT_KEY) || '[]');
      } catch {
        list = PRESEEDED_TRANSPORT;
      }
      if (!list || list.length === 0) {
        localStorage.setItem(MOCK_TRANSPORT_KEY, JSON.stringify(PRESEEDED_TRANSPORT));
        list = PRESEEDED_TRANSPORT;
      }
    } else {
      try {
        const q = collection(db, 'transportation');
        const snap = await getDocs(q);
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Seed Firestore once if empty
        if (!list || list.length === 0) {
          list = [];
          for (const item of PRESEEDED_TRANSPORT) {
            const { id, ...data } = item;
            const docRef = await addDoc(collection(db, 'transportation'), {
              ...data,
              createdAt: serverTimestamp()
            });
            list.push({ id: docRef.id, ...data });
          }
        }
      } catch (err) {
        console.warn("Firestore transportation fetch warning:", err);
        list = PRESEEDED_TRANSPORT;
      }
    }

    // Clean formatting and fallbacks without overwriting user edits
    return list.map(item => ({
      ...item,
      vesselName: item.vesselName || 'M/V VIELS LINER',
      type: item.type || 'FASTCRAFT',
      fare: Number(item.fare) || 250,
      discountedFare: Number(item.discountedFare) || 200,
      route: item.route || 'San Jose Port → Surigao City Boulevard',
      departure: item.departure || '08:00 AM',
      arrival: item.arrival || '09:00 AM',
      schedule: item.schedule || 'Daily'
    }));
  },

  addSchedule: async (scheduleData) => {
    const formattedData = {
      ...scheduleData,
      type: scheduleData.type || 'FASTCRAFT',
      vesselName: scheduleData.vesselName || 'M/V VIELS LINER',
      fare: Number(scheduleData.fare) || 250,
      discountedFare: Number(scheduleData.discountedFare) || 200,
      schedule: scheduleData.schedule || 'Daily'
    };

    if (isMockMode) {
      initMockData();
      const list = JSON.parse(localStorage.getItem(MOCK_TRANSPORT_KEY) || '[]');
      const newSchedule = {
        id: 'trans-' + Math.random().toString(36).substr(2, 9),
        ...formattedData
      };
      list.push(newSchedule);
      localStorage.setItem(MOCK_TRANSPORT_KEY, JSON.stringify(list));
      return newSchedule;
    } else {
      const docRef = await addDoc(collection(db, 'transportation'), {
        ...formattedData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...formattedData };
    }
  },

  updateSchedule: async (id, scheduleData) => {
    const formattedData = {
      ...scheduleData,
      fare: Number(scheduleData.fare) || 250,
      discountedFare: Number(scheduleData.discountedFare) || 200
    };

    if (isMockMode) {
      initMockData();
      const list = JSON.parse(localStorage.getItem(MOCK_TRANSPORT_KEY) || '[]');
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...formattedData
        };
        localStorage.setItem(MOCK_TRANSPORT_KEY, JSON.stringify(list));
        return list[idx];
      }
      // If not found in mock list by id, append or update match
      const fallbackIdx = list.findIndex(s => s.departure === scheduleData.departure);
      if (fallbackIdx !== -1) {
        list[fallbackIdx] = { ...list[fallbackIdx], ...formattedData };
        localStorage.setItem(MOCK_TRANSPORT_KEY, JSON.stringify(list));
        return list[fallbackIdx];
      }
      return { id, ...formattedData };
    } else {
      const docRef = doc(db, 'transportation', id);
      await updateDoc(docRef, formattedData);
      return { id, ...formattedData };
    }
  },

  deleteSchedule: async (id) => {
    if (isMockMode) {
      initMockData();
      const list = JSON.parse(localStorage.getItem(MOCK_TRANSPORT_KEY) || '[]');
      const updatedList = list.filter(s => s.id !== id);
      localStorage.setItem(MOCK_TRANSPORT_KEY, JSON.stringify(updatedList));
      return true;
    } else {
      const docRef = doc(db, 'transportation', id);
      await deleteDoc(docRef);
      return true;
    }
  },

  resetToOfficialSchedules: async () => {
    if (isMockMode) {
      localStorage.setItem(MOCK_TRANSPORT_KEY, JSON.stringify(PRESEEDED_TRANSPORT));
    } else {
      try {
        const q = collection(db, 'transportation');
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, 'transportation', docSnap.id));
        }
        for (const item of PRESEEDED_TRANSPORT) {
          const { id, ...data } = item;
          await addDoc(collection(db, 'transportation'), {
            ...data,
            createdAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Failed to reset Firestore schedules:", err);
      }
    }
    return PRESEEDED_TRANSPORT;
  }
};

export default transportationService;
