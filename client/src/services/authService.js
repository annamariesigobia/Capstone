import { auth, db, isMockMode } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { notifyAdminNewPendingAgency } from './emailService';

const DEFAULT_ROLE = 'tourist';

const MOCK_USERS_KEY = 'dinagat_mock_users';
const MOCK_SESSION_KEY = 'dinagat_mock_session';

const getMockUsers = () => {
  const users = localStorage.getItem(MOCK_USERS_KEY);
  if (!users) {
    const defaultUsers = {
      'admin@dinagat.com': {
        uid: 'mock-admin-uid',
        fullName: 'System Administrator',
        email: 'admin@dinagat.com',
        role: 'admin',
        phone: '+63 912 345 6789',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        status: 'active',
        password: 'password123'
      },
      'operator@dinagat.com': {
        uid: 'mock-operator-uid',
        fullName: 'Isla Tour Agency',
        email: 'operator@dinagat.com',
        role: 'operator',
        phone: '+63 923 456 7890',
        gcashName: 'Isla Tour Agency',
        gcashNumber: '0923-456-7890',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        status: 'active',
        password: 'password123'
      },
      'tourist@dinagat.com': {
        uid: 'mock-tourist-uid',
        fullName: 'Jane Doe (Tourist)',
        email: 'tourist@dinagat.com',
        role: 'tourist',
        phone: '+63 934 567 8901',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        status: 'active',
        password: 'password123'
      }
    };
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  const parsedUsers = JSON.parse(users);
  const opUser = parsedUsers['operator@dinagat.com'];
  if (opUser) {
    let changed = false;
    if (opUser.fullName !== 'Isla Tour Agency') { opUser.fullName = 'Isla Tour Agency'; changed = true; }
    if (!opUser.gcashName) { opUser.gcashName = 'Isla Tour Agency'; changed = true; }
    if (!opUser.gcashNumber) { opUser.gcashNumber = '0923-456-7890'; changed = true; }
    if (changed) localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(parsedUsers));
  }
  return parsedUsers;
};

const saveMockUser = (user) => {
  const users = getMockUsers();
  users[user.email] = user;
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

export const authService = {

  isMock: () => isMockMode,

  subscribeToAuthChanges: (callback) => {
    if (isMockMode) {
      const checkSession = () => {
        const session = localStorage.getItem(MOCK_SESSION_KEY);
        if (session) {
          const user = JSON.parse(session);
          // Always merge latest data from mock users store into session
          // This ensures profile updates (name, phone, gcash, etc.) are reflected immediately
          const allUsers = getMockUsers();
          const storedUser = allUsers[user.email];
          if (storedUser) {
            const { password: _pw, ...safeStored } = storedUser;
            const merged = { ...user, ...safeStored };
            // Persist merge back to session so it's consistent
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(merged));
            callback(merged);
          } else {
            callback(user);
          }
        } else {
          callback(null);
        }
      };

      checkSession();

      window.addEventListener('dinagat_auth_change', checkSession);
      return () => window.removeEventListener('dinagat_auth_change', checkSession);
    } else {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const profile = userDocSnap.data();

              const idTokenResult = await firebaseUser.getIdTokenResult(true);
              const role = idTokenResult.claims.role || profile.role || DEFAULT_ROLE;

              callback({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role,
                ...profile
              });
            } else {

              callback({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: DEFAULT_ROLE
              });
            }
          } catch (error) {
            console.error("Error checking auth profile", error);
            callback({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              role: DEFAULT_ROLE
            });
          }
        } else {
          callback(null);
        }
      });
    }
  },

  register: async (email, password, fullName, phone, role = DEFAULT_ROLE, address = '') => {
    if (isMockMode) {
      const users = getMockUsers();
      if (users[email]) {
        throw new Error("Email already in use.");
      }

      // Tour agencies start as pending until admin approves
      const initialStatus = role === 'operator' ? 'pending' : 'active';

      const newMockUser = {
        uid: 'mock-' + Math.random().toString(36).substr(2, 9),
        fullName,
        email,
        role,
        phone: phone || '',
        address: address || '',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        status: initialStatus,
        createdAt: new Date().toISOString()
      };

      users[email] = { ...newMockUser, password };
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(newMockUser));

      // Notify admin when a new tour agency registers
      if (role === 'operator') {
        const allUsers = getMockUsers();
        const adminEntry = Object.values(allUsers).find(u => u.role === 'admin');
        if (adminEntry?.email) {
          notifyAdminNewPendingAgency({
            adminEmail: adminEntry.email,
            adminName: adminEntry.fullName || 'Administrator',
            agencyName: fullName,
            agencyEmail: email,
          }).catch(() => {});
        }
      }

      window.dispatchEvent(new Event('dinagat_auth_change'));
      return newMockUser;
    } else {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Tour agencies start as pending until admin approves
      const initialStatus = role === 'operator' ? 'pending' : 'active';

      const userProfile = {
        fullName,
        email,
        role,
        phone: phone || '',
        address: address || '',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        status: initialStatus,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      await firebaseSendEmailVerification(user);

      // Notify admin when a new tour agency registers
      if (role === 'operator') {
        try {
          const adminSnap = await getDocs(collection(db, 'users'));
          const adminDoc = adminSnap.docs.find(d => d.data().role === 'admin');
          if (adminDoc) {
            const adminData = adminDoc.data();
            notifyAdminNewPendingAgency({
              adminEmail: adminData.email,
              adminName: adminData.fullName || 'Administrator',
              agencyName: fullName,
              agencyEmail: email,
            }).catch(() => {});
          }
        } catch (e) {}
      }

      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        ...userProfile
      };
    }
  },

  login: async (email, password) => {
    if (isMockMode) {
      const users = getMockUsers();
      const matched = users[email];
      if (!matched || matched.password !== password) {
        throw new Error("Invalid email or password.");
      }

      const sessionUser = { ...matched };
      delete sessionUser.password;

      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
      window.dispatchEvent(new Event('dinagat_auth_change'));
      return sessionUser;
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const profile = userDocSnap.exists() ? userDocSnap.data() : {};
      return { uid: user.uid, email: user.email, emailVerified: user.emailVerified, ...profile };
    }
  },

  loginWithGoogle: async (role = DEFAULT_ROLE, address = '') => {
    if (isMockMode) {
      // In mock mode, show a simple role picker dialog
      const choice = window.prompt(
        'Mock Google Sign-In\n\nEnter account to simulate:\n1 = Tourist (Jane Doe)\n2 = Operator (Isla Tour Agency)\n3 = Admin\n\nType 1, 2, or 3:'
      );
      if (choice === null) throw new Error('Google sign-in cancelled.');

      let mockGoogleUser;
      if (choice === '2') {
        mockGoogleUser = {
          uid: 'mock-operator-uid',
          fullName: 'Isla Tour Agency',
          email: 'operator@dinagat.com',
          role: 'operator',
          phone: '',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          status: 'active'
        };
      } else if (choice === '3') {
        mockGoogleUser = {
          uid: 'mock-admin-uid',
          fullName: 'System Administrator',
          email: 'admin@dinagat.com',
          role: 'admin',
          phone: '',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          status: 'active'
        };
      } else {
        mockGoogleUser = {
          uid: 'mock-tourist-uid',
          fullName: 'Jane Doe (Tourist)',
          email: 'tourist@dinagat.com',
          role: 'tourist',
          phone: '',
          profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
          status: 'active'
        };
      }

      const users = getMockUsers();
      users[mockGoogleUser.email] = { ...mockGoogleUser, password: 'googlepassword123' };
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockGoogleUser));
      window.dispatchEvent(new Event('dinagat_auth_change'));
      return mockGoogleUser;
    } else {
      // Real Firebase — always show Google account picker
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Tour agencies start as pending until admin approves
        const initialStatus = role === 'operator' ? 'pending' : 'active';
        const userProfile = {
          fullName: user.displayName || 'Google User',
          email: user.email,
          role: role,
          phone: user.phoneNumber || '',
          address: '',
          profileImage: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          status: initialStatus,
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, userProfile);

        // Notify admin when a new tour agency registers via Google
        if (role === 'operator') {
          try {
            const adminSnap = await getDocs(collection(db, 'users'));
            const adminDoc = adminSnap.docs.find(d => d.data().role === 'admin');
            if (adminDoc) {
              const adminData = adminDoc.data();
              notifyAdminNewPendingAgency({
                adminEmail: adminData.email,
                adminName: adminData.fullName || 'Administrator',
                agencyName: userProfile.fullName,
                agencyEmail: user.email,
              }).catch(() => {});
            }
          } catch (e) {}
        }

        return {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...userProfile
        };
      } else {
        const profile = userDocSnap.data();
        return {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...profile
        };
      }
    }
  },

  // Link email/password to a Google account so the user can sign in both ways
  linkEmailPassword: async (email, newPassword) => {
    if (isMockMode) {
      // In mock mode, just save the password
      const users = getMockUsers();
      if (users[email]) {
        users[email].password = newPassword;
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
        return true;
      }
      throw new Error('Account not found.');
    } else {
      // Step 1: Re-authenticate with Google to confirm ownership
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account', login_hint: email });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error('The Google account you signed in with does not match. Please use the correct Google account.');
      }

      // Step 2: Link the email/password credential to the Google account
      const credential = EmailAuthProvider.credential(email, newPassword);
      await linkWithCredential(user, credential);

      // Fetch and return full profile
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const profile = userDocSnap.exists() ? userDocSnap.data() : {};
      return { uid: user.uid, email: user.email, emailVerified: user.emailVerified, ...profile };
    }
  },

  logout: async () => {
    if (isMockMode) {
      localStorage.removeItem(MOCK_SESSION_KEY);
      window.dispatchEvent(new Event('dinagat_auth_change'));
      return true;
    } else {
      await firebaseSignOut(auth);
      return true;
    }
  },

  sendVerificationEmail: async () => {
    if (isMockMode) {
      console.log("Mock verification email sent.");
      return true;
    } else {
      if (auth.currentUser) {
        await firebaseSendEmailVerification(auth.currentUser);
        return true;
      }
      throw new Error("No user currently signed in.");
    }
  },

  resetPassword: async (email) => {
    if (isMockMode) {
      console.log(`Mock reset password link sent to ${email}.`);
      return true;
    } else {
      await firebaseSendPasswordResetEmail(auth, email);
      return true;
    }
  },

  updateProfile: async (uid, data) => {
    if (isMockMode) {
      const session = localStorage.getItem(MOCK_SESSION_KEY);
      if (session) {
        const currentUser = JSON.parse(session);
        if (currentUser.uid === uid) {
          const updatedUser = { ...currentUser, ...data };
          localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));

          const users = getMockUsers();
          const email = currentUser.email;
          if (users[email]) {
            users[email] = { ...users[email], ...data };
            localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
          }

          window.dispatchEvent(new Event('dinagat_auth_change'));
          return updatedUser;
        }
      }
      throw new Error("Mock profile update failed.");
    } else {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, data);
      return true;
    }
  },

  debugSwitchRole: (uid, newRole) => {
    if (isMockMode) {
      const session = localStorage.getItem(MOCK_SESSION_KEY);
      if (session) {
        const currentUser = JSON.parse(session);
        currentUser.role = newRole;
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(currentUser));

        const users = getMockUsers();
        if (users[currentUser.email]) {
          users[currentUser.email].role = newRole;
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
        }

        window.dispatchEvent(new Event('dinagat_auth_change'));
        return currentUser;
      }
    }
    console.warn("debugSwitchRole is only available in Mock mode.");
    return null;
  },

  getAllUsers: async () => {
    if (isMockMode) {
      const users = getMockUsers();
      return Object.values(users).map(u => {
        const { password, ...safe } = u;
        return safe;
      });
    } else {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
    }
  }
};
export default authService;
