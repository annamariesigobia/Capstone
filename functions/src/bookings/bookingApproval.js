const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.bookingStatusTrigger = onDocumentUpdated("bookings/{bookingId}", async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

if (beforeData.status !== afterData.status) {
    const db = admin.firestore();
    const touristId = afterData.touristId;
    const hotelName = afterData.hotelName;
    const status = afterData.status;

    let messageText = `Your reservation request at ${hotelName} is now ${status}.`;
    if (status === "confirmed") {
      messageText = `Great news! Your booking at ${hotelName} has been verified and confirmed by the tour agency.`;
    } else if (status === "rejected") {
      messageText = `Your booking at ${hotelName} was declined by the tour agency. Reason: ${afterData.rejectReason || "No details provided"}`;
    }

    try {
      await db.collection("notifications").add({
        userId: touristId,
        title: `Booking ${status.toUpperCase()}`,
        message: messageText,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Notification sent for booking status change. ID: ${event.params.bookingId}`);
    } catch (err) {
      console.error("Failed to write booking notification trigger:", err);
    }
  }
});
