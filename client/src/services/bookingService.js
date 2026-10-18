import { db, storage, isMockMode } from './firebase';
import {
  collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc,
  serverTimestamp, query, where, orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { notifyOperatorNewBooking, notifyTouristBookingConfirmed } from './emailService';

const MOCK_BOOKINGS_KEY = 'dinagat_mock_bookings';
const MOCK_NOTIFICATIONS_KEY = 'dinagat_mock_notifications';

const safeSaveLocalStorage = (key, data) => {
  // Always write to localStorage first so cross-tab reads work
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (quotaErr) {
    console.warn(`LocalStorage quota exceeded for ${key}. Clearing old data and retrying.`, quotaErr);
    // Try clearing the key and re-saving
    try {
      localStorage.removeItem(key);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e2) {
      console.warn(`Storage still full. Data will not persist.`, e2);
    }
  }
  // Keep in-memory mirror as backup
  window[`__dinagat_memory_${key}`] = data;
};

const safeGetLocalStorage = (key, defaultVal = null) => {
  // Always prefer localStorage so changes from other calls are visible
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Update in-memory mirror
      window[`__dinagat_memory_${key}`] = parsed;
      return parsed;
    }
  } catch (e) {
    // fall through to memory
  }
  if (window[`__dinagat_memory_${key}`]) {
    return window[`__dinagat_memory_${key}`];
  }
  return defaultVal;
};

const deduplicateBookings = (list) => {
  if (!Array.isArray(list)) return [];
  const seenKeys = new Set();
  const clean = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    // Skip empty stub entries that lack basic info
    if (!item.hotelName && !item.touristName && !item.totalAmount) continue;

    const idKey = item.id ? String(item.id) : null;
    const contentKey = `${item.touristId || ''}_${item.hotelName || ''}_${item.checkIn || ''}_${item.checkOut || ''}_${item.totalAmount || 0}`;

    if (idKey && seenKeys.has(idKey)) continue;
    if (seenKeys.has(contentKey)) continue;

    if (idKey) seenKeys.add(idKey);
    seenKeys.add(contentKey);
    clean.push(item);
  }
  return clean;
};

const getMockBookings = () => {
  const raw = safeGetLocalStorage(MOCK_BOOKINGS_KEY, null);
  if (!raw) {
    // Start with empty list — no fake seed data
    safeSaveLocalStorage(MOCK_BOOKINGS_KEY, []);
    return [];
  }
  // Remove the old hardcoded seed booking (book-1) if any real bookings exist alongside it
  let filtered = raw;
  const realBookings = raw.filter(b => b.id !== 'book-1');
  if (realBookings.length > 0 && raw.some(b => b.id === 'book-1')) {
    filtered = realBookings;
  }
  const clean = deduplicateBookings(filtered);
  if (clean.length !== raw.length) {
    safeSaveLocalStorage(MOCK_BOOKINGS_KEY, clean);
  }
  return clean;
};




const getMockNotifications = () => {
  const notifications = safeGetLocalStorage(MOCK_NOTIFICATIONS_KEY, null);
  if (!notifications) {
    const list = [
      {
        id: 'notif-1',
        userId: 'mock-tourist-uid',
        title: 'Welcome to Dinagat Islands!',
        message: 'Thank you for registering. You can now plan itineraries and book resorts!',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
    safeSaveLocalStorage(MOCK_NOTIFICATIONS_KEY, list);
    return list;
  }
  return notifications;
};

export const bookingService = {
  
  createBooking: async (bookingData) => {
    const list = getMockBookings();

    // Check if an identical booking was already created
    const existing = list.find(b => 
      b.touristId === bookingData.touristId &&
      b.hotelName === bookingData.hotelName &&
      b.checkIn === bookingData.checkIn &&
      b.checkOut === bookingData.checkOut &&
      Number(b.totalAmount) === Number(bookingData.totalAmount)
    );
    if (existing) {
      if (bookingData.paymentProof && !existing.paymentProof) {
        existing.paymentProof = bookingData.paymentProof;
        safeSaveLocalStorage(MOCK_BOOKINGS_KEY, deduplicateBookings(list));
      }
      return existing;
    }

    const newBooking = {
      id: 'book-' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentProof: '',
      ...bookingData,
      guests: Number(bookingData.guests) || 2,
      totalAmount: Number(bookingData.totalAmount) || 3000
    };
    list.push(newBooking);
    safeSaveLocalStorage(MOCK_BOOKINGS_KEY, deduplicateBookings(list));

    try {
      await bookingService.createNotification({
        userId: bookingData.operatorId,
        title: 'New Booking Request',
        message: `You received a reservation request at ${bookingData.hotelName || 'your property'}.`
      });
    } catch (e) {}

    // Send email notification to operator
    try {
      // Look up operator email from mock users store
      const allUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
      const operatorEntry = Object.values(allUsers).find(u => u.uid === bookingData.operatorId || u.email === bookingData.operatorId);
      if (operatorEntry?.email) {
        notifyOperatorNewBooking({
          operatorEmail: operatorEntry.email,
          operatorName: operatorEntry.fullName || 'Tour Agency',
          touristName: bookingData.touristName || 'Guest',
          hotelName: bookingData.hotelName,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
        }).catch(() => {});
      }
    } catch (e) {}

    if (!isMockMode) {
      try {
        // Compress the receipt image using canvas before saving to Firestore.
        // Firestore allows up to 1MB per document — compressed JPEG is typically 30-80KB, well within limit.
        // No Firebase Storage needed — receipt is saved directly inside the booking document.
        let proofToSave = bookingData.paymentProof || '';
        if (proofToSave && proofToSave.startsWith('data:')) {
          proofToSave = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX = 600;
              let w = img.width, h = img.height;
              if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
              if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
              canvas.width = w; canvas.height = h;
              canvas.getContext('2d').drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL('image/jpeg', 0.45));
            };
            img.onerror = () => resolve(proofToSave);
            img.src = proofToSave;
          });
        }

        // Save booking to Firestore with compressed receipt included in one write
        const newDocRef = doc(collection(db, 'bookings'));
        await setDoc(newDocRef, {
          touristId: bookingData.touristId,
          touristName: bookingData.touristName || '',
          accommodationId: bookingData.accommodationId || '',
          hotelName: bookingData.hotelName || '',
          operatorId: bookingData.operatorId || '',
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: Number(bookingData.guests) || 2,
          totalAmount: Number(bookingData.totalAmount) || 3000,
          paymentProof: proofToSave,
          status: 'pending',
          rejectReason: '',
          createdAt: serverTimestamp()
        });

        // Update local cache with real Firestore ID and compressed receipt
        const curList = getMockBookings();
        const bIdx = curList.findIndex(b => b.id === newBooking.id);
        if (bIdx !== -1) {
          curList[bIdx].id = newDocRef.id;
          curList[bIdx].paymentProof = proofToSave;
          safeSaveLocalStorage(MOCK_BOOKINGS_KEY, deduplicateBookings(curList));
        }
        newBooking.id = newDocRef.id;
        newBooking.paymentProof = proofToSave;

      } catch (err) {
        console.warn("Firestore createBooking error, using local fallback:", err);
      }
    }


    return newBooking;
  },

  getBookingsForTourist: async (touristId) => {
    if (isMockMode) {
      const localList = getMockBookings().filter(b => String(b.touristId) === String(touristId));
      return deduplicateBookings(localList);
    } else {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('touristId', '==', String(touristId))
        );
        const snap = await getDocs(q);
        const remoteList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return deduplicateBookings(remoteList);
      } catch (err) {
        console.warn("Firestore getBookingsForTourist error, using local fallback:", err);
        const localList = getMockBookings().filter(b => String(b.touristId) === String(touristId));
        return deduplicateBookings(localList);
      }
    }
  },

  getBookingsForOperator: async (operatorId) => {
    if (isMockMode) {
      const allBookings = getMockBookings();
      const filtered = allBookings.filter(b => 
        String(b.operatorId) === String(operatorId) || 
        b.operatorId === 'mock-operator-uid' || 
        b.operatorId === 'operator-uid-001'
      );
      return deduplicateBookings(filtered);
    } else {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('operatorId', '==', String(operatorId))
        );
        const snap = await getDocs(q);
        const remoteList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return deduplicateBookings(remoteList);
      } catch (err) {
        console.warn("Firestore getBookingsForOperator error, using local fallback:", err);
        const allBookings = getMockBookings();
        return deduplicateBookings(allBookings.filter(b => String(b.operatorId) === String(operatorId)));
      }
    }
  },

  getAllBookings: async () => {
    if (isMockMode) {
      const localList = getMockBookings();
      return deduplicateBookings(localList);
    } else {
      try {
        const snap = await getDocs(collection(db, 'bookings'));
        const remoteList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return deduplicateBookings(remoteList);
      } catch (err) {
        console.warn("Firestore getAllBookings error, using local fallback:", err);
        const localList = getMockBookings();
        return deduplicateBookings(localList);
      }
    }
  },

  uploadPaymentProof: async (bookingId, file) => {
    let proofUrl = null;

    if (file && (file instanceof File || file instanceof Blob)) {
      proofUrl = await new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          console.warn('FileReader timed out, using placeholder');
          resolve(null);
        }, 15000);

        const reader = new FileReader();
        reader.onload = (e) => {
          clearTimeout(timeoutId);
          const result = e.target?.result;
          resolve(result || null);
        };
        reader.onerror = () => {
          clearTimeout(timeoutId);
          console.warn('FileReader error');
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    } else if (typeof file === 'string' && file.trim().length > 0) {
      proofUrl = file.trim();
    }

    if (!proofUrl) {
      proofUrl = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60';
    }

    const list = getMockBookings();
    let idx = list.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      list[idx].paymentProof = proofUrl;
      list[idx].status = 'pending';
    } else {
      let altIdx = list.findIndex(b => b.status === 'pending' && (!b.paymentProof || b.paymentProof === ''));
      if (altIdx !== -1) {
        list[altIdx].paymentProof = proofUrl;
      }
    }
    safeSaveLocalStorage(MOCK_BOOKINGS_KEY, deduplicateBookings(list));

    // Send notification to operator
    try {
      const bItem = list.find(b => b.id === bookingId);
      if (bItem && bItem.operatorId) {
        await bookingService.createNotification({
          userId: bItem.operatorId,
          title: 'Payment Receipt Uploaded',
          message: `A tourist uploaded proof of payment for Booking #${bookingId.slice(-6)}.`
        });
      }
    } catch (e) { /* silent */ }

    // Sync to Firestore if in live mode
    if (!isMockMode && file && (file instanceof File || file instanceof Blob)) {
      try {
        const storageRef = ref(storage, `payments/${bookingId}/proof.jpg`);
        await uploadBytes(storageRef, file);
        const uploadedUrl = await getDownloadURL(storageRef);
        const docRef = doc(db, 'bookings', bookingId);
        await updateDoc(docRef, { paymentProof: uploadedUrl, status: 'pending' });
        // Update local cache with the real URL
        const updatedList = getMockBookings();
        const uIdx = updatedList.findIndex(b => b.id === bookingId);
        if (uIdx !== -1) {
          updatedList[uIdx].paymentProof = uploadedUrl;
          safeSaveLocalStorage(MOCK_BOOKINGS_KEY, updatedList);
        }
        return uploadedUrl;
      } catch (err) {
        console.warn('Firestore uploadPaymentProof failed, using local data URL:', err);
      }
    }

    return proofUrl;
  },

  updateBookingStatus: async (bookingId, status, rejectReason = '') => {
    // 1. Update local mock session bookings list
    const list = getMockBookings();
    const idx = list.findIndex(b => b.id === bookingId);

    if (idx !== -1) {
      list[idx].status = status;
      if (rejectReason) {
        list[idx].rejectReason = rejectReason;
      }
      safeSaveLocalStorage(MOCK_BOOKINGS_KEY, list);

      try {
        await bookingService.createNotification({
          userId: list[idx].touristId,
          title: `Booking ${status.toUpperCase()}`,
          message: status === 'confirmed'
            ? `Your reservation at ${list[idx].hotelName} has been confirmed! Enjoy your stay.`
            : `Your reservation at ${list[idx].hotelName} was declined. Reason: ${rejectReason || 'Unavailable'}`
        });
      } catch (e) {}

      // Send confirmation email to tourist if booking confirmed
      if (status === 'confirmed') {
        try {
          const allUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
          const touristEntry = Object.values(allUsers).find(u => u.uid === list[idx].touristId || u.email === list[idx].touristId);
          if (touristEntry?.email) {
            notifyTouristBookingConfirmed({
              touristEmail: touristEntry.email,
              touristName: touristEntry.fullName || 'Guest',
              hotelName: list[idx].hotelName,
              checkIn: list[idx].checkIn,
              checkOut: list[idx].checkOut,
              totalAmount: list[idx].totalAmount,
            }).catch(() => {});
          }
        } catch (e) {}
      }
    } else {
      const fallbackEntry = {
        id: bookingId,
        status: status,
        ...(rejectReason ? { rejectReason } : {})
      };
      list.push(fallbackEntry);
      safeSaveLocalStorage(MOCK_BOOKINGS_KEY, list);
    }

    // 2. Sync to Firestore if in live mode
    if (!isMockMode) {
      try {
        const docRef = doc(db, 'bookings', bookingId);
        const updateData = { status };
        if (rejectReason) {
          updateData.rejectReason = rejectReason;
        }
        await updateDoc(docRef, updateData);
      } catch (err) {
        console.warn("Firestore updateBookingStatus error, fallback applied:", err);
      }
    }

    return true;
  },

getNotifications: async (userId) => {
    if (isMockMode) {
      const list = getMockNotifications();
      return list.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        if (err.message.includes('FAILED_PRECONDITION')) {
          const q = query(collection(db, 'notifications'), where('userId', '==', userId));
          const snap = await getDocs(q);
          const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return docs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        }
        throw err;
      }
    }
  },

createNotification: async (notifData) => {
    if (isMockMode) {
      const list = getMockNotifications();
      const newNotif = {
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        isRead: false,
        createdAt: new Date().toISOString(),
        ...notifData
      };
      list.push(newNotif);
      safeSaveLocalStorage(MOCK_NOTIFICATIONS_KEY, list);
      return newNotif;
    } else {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notifData,
        isRead: false,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...notifData };
    }
  },

markAsRead: async (notifId) => {
    if (isMockMode) {
      const list = getMockNotifications();
      const idx = list.findIndex(n => n.id === notifId);
      if (idx !== -1) {
        list[idx].isRead = true;
        safeSaveLocalStorage(MOCK_NOTIFICATIONS_KEY, list);
        return true;
      }
      return false;
    } else {
      const docRef = doc(db, 'notifications', notifId);
      await updateDoc(docRef, { isRead: true });
      return true;
    }
  }
};

export default bookingService;
