import { db, isMockMode } from './firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';

const MOCK_PACKAGES_KEY = 'dinagat_mock_tour_packages';

const safeSaveLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (quotaErr) {
    console.warn(`LocalStorage quota error for key ${key}:`, quotaErr);
  }
  window[`__dinagat_memory_${key}`] = data;
};

const safeGetLocalStorage = (key, defaultVal = []) => {
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

export const tourPackageService = {

  /**
   * Get all tour packages for a specific operator.
   */
  getPackagesByOperator: async (operatorId) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_PACKAGES_KEY, []);
      return list.filter(pkg => pkg.operatorId === operatorId);
    } else {
      const q = query(collection(db, 'tourPackages'), where('operatorId', '==', operatorId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  /**
   * Get all tour packages (for public/tourist browsing).
   */
  getAllPackages: async () => {
    if (isMockMode) {
      return safeGetLocalStorage(MOCK_PACKAGES_KEY, []);
    } else {
      const snap = await getDocs(collection(db, 'tourPackages'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  /**
   * Add a new tour package.
   */
  addPackage: async (packageData) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_PACKAGES_KEY, []);
      const newPkg = {
        id: 'pkg-' + Math.random().toString(36).substr(2, 9),
        ...packageData,
        price: Number(packageData.price) || 0,
        duration: packageData.duration || '',
        createdAt: new Date().toISOString()
      };
      list.push(newPkg);
      safeSaveLocalStorage(MOCK_PACKAGES_KEY, list);
      return newPkg;
    } else {
      const docRef = await addDoc(collection(db, 'tourPackages'), {
        ...packageData,
        price: Number(packageData.price) || 0,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...packageData };
    }
  },

  /**
   * Update an existing tour package.
   */
  updatePackage: async (id, updatedData) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_PACKAGES_KEY, []);
      const index = list.findIndex(pkg => pkg.id === id);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...updatedData,
          price: updatedData.price !== undefined ? Number(updatedData.price) : list[index].price
        };
        safeSaveLocalStorage(MOCK_PACKAGES_KEY, list);
        return list[index];
      }
      throw new Error('Tour package not found');
    } else {
      const docRef = doc(db, 'tourPackages', id);
      await updateDoc(docRef, {
        ...updatedData,
        price: updatedData.price !== undefined ? Number(updatedData.price) : undefined
      });
      return true;
    }
  },

  /**
   * Delete a tour package.
   */
  deletePackage: async (id) => {
    if (isMockMode) {
      const list = safeGetLocalStorage(MOCK_PACKAGES_KEY, []);
      const filtered = list.filter(pkg => pkg.id !== id);
      safeSaveLocalStorage(MOCK_PACKAGES_KEY, filtered);
      return true;
    } else {
      const docRef = doc(db, 'tourPackages', id);
      await deleteDoc(docRef);
      return true;
    }
  },

  /**
   * Upload a tour package image (compresses to base64 in mock mode).
   */
  uploadPackageImage: async (packageId, file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      if (typeof file === 'string') return resolve(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result;
        if (!rawDataUrl) return resolve(null);

        const timeout = setTimeout(() => resolve(rawDataUrl), 1000);
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
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          } catch (err) {
            resolve(rawDataUrl);
          }
        };
        img.onerror = () => { clearTimeout(timeout); resolve(rawDataUrl); };
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
};

export default tourPackageService;
