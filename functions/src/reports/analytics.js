const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.generateAnalyticsReport = onCall(async (request) => {
  
  if (!request.auth || request.auth.token.role !== 'admin') {
    throw new HttpsError("permission-denied", "Only administrators can compile dashboard reports.");
  }

  const db = admin.firestore();
  
  try {
    const usersSnap = await db.collection("users").get();
    const bookingsSnap = await db.collection("bookings").get();
    const accSnap = await db.collection("accommodations").get();
    
    const totalTourists = usersSnap.docs.filter(d => d.data().role === 'tourist').length;
    const totalBookings = bookingsSnap.docs.length;
    
    let totalRooms = 0;
    accSnap.forEach(d => {
      totalRooms += (d.data().availableRooms || 0);
    });
    
    const confirmedCount = bookingsSnap.docs.filter(d => d.data().status === 'confirmed').length;
    const accommodationUtilization = totalRooms > 0 ? (confirmedCount / (totalRooms + confirmedCount)) * 100 : 0;
    
    const reportData = {
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalBookings,
      totalTourists,
      accommodationUtilization: Math.round(accommodationUtilization)
    };
    
    const docRef = await db.collection("reports").add(reportData);
    return { id: docRef.id, ...reportData };
  } catch (error) {
    console.error("Report generation failed:", error);
    throw new HttpsError("internal", "Analytics compilation failed.");
  }
});
