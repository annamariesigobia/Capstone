const { onCall } = require("firebase-functions/v2/https");

exports.recommendations = onCall(async (request) => {
  
  return {
    recommendations: [
      { id: 'attr-bitaog', name: 'Bitaog Beach', reason: 'Matches your interest in white-sand beaches.' },
      { id: 'attr-bababu', name: 'Lake Bababu', reason: 'Top-rated natural tidal lake connection.' }
    ]
  };
});
