const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const { travelAssistant } = require("./src/ai/chatbot");
const { itineraryGenerator } = require("./src/ai/itineraryGenerator");
const { recommendations } = require("./src/ai/recommendations");
const { bookingCreatedTrigger } = require("./src/bookings/bookingNotifications");
const { bookingStatusTrigger } = require("./src/bookings/bookingApproval");
const { generateAnalyticsReport } = require("./src/reports/analytics");

exports.travelAssistant = travelAssistant;
exports.itineraryGenerator = itineraryGenerator;
exports.recommendations = recommendations;
exports.generateAnalyticsReport = generateAnalyticsReport;

exports.bookingCreatedTrigger = bookingCreatedTrigger;
exports.bookingStatusTrigger = bookingStatusTrigger;
