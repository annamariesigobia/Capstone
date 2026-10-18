const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.bookingCreatedTrigger = onDocumentCreated("bookings/{bookingId}", async (event) => {
  const data = event.data.data();
  const db = admin.firestore();

  try {
    await db.collection("notifications").add({
      userId: data.operatorId,
      title: "New Booking Received",
      message: `A guest registered a new booking for ${data.hotelName}. Please verify payment receipt.`,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error("Error dispatching booking creation trigger:", err);
  }
});
