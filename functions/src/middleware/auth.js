const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const verifyAuthToken = async (idToken) => {
  if (!idToken) return null;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Firebase ID Token verification failed:", error);
    return null;
  }
};

module.exports = { verifyAuthToken };
