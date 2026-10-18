/**
 * emailService.js
 * Handles all email notifications using EmailJS browser SDK.
 *
 * NOTE: To fully activate email sending you need to:
 * 1. Create a free account at https://www.emailjs.com
 * 2. Create an Email Service (Gmail) and note the Service ID
 * 3. Create templates for each notification type and note Template IDs
 * 4. Note your Public Key from Account → API Keys
 * 5. Replace the placeholder values below with your real credentials
 */

// ─── EmailJS Configuration ───────────────────────────────────────────────────
const EMAILJS_PUBLIC_KEY  = 'YOUR_EMAILJS_PUBLIC_KEY';   // replace with real key
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';           // replace with real service ID

// Template IDs — create one per type in EmailJS dashboard
const TEMPLATE = {
  OTP:              'template_otp',           // {{to_email}}, {{otp_code}}, {{user_name}}
  BOOKING_CONFIRM:  'template_booking_confirm', // {{to_email}}, {{user_name}}, {{hotel_name}}, {{check_in}}, {{check_out}}, {{total_amount}}
  NEW_BOOKING:      'template_new_booking',   // {{to_email}}, {{operator_name}}, {{tourist_name}}, {{hotel_name}}, {{check_in}}, {{check_out}}
  PENDING_AGENCY:   'template_pending_agency', // {{to_email}}, {{admin_name}}, {{agency_name}}, {{agency_email}}
};

let emailjsLoaded = false;
let emailjs = null;

/** Lazy-load the @emailjs/browser SDK */
const getEmailJS = async () => {
  if (emailjsLoaded) return emailjs;
  try {
    const mod = await import('@emailjs/browser');
    emailjs = mod.default || mod;
    emailjs.init(EMAILJS_PUBLIC_KEY);
    emailjsLoaded = true;
    return emailjs;
  } catch (err) {
    console.warn('EmailJS not available:', err);
    return null;
  }
};

/** Internal sender — logs gracefully if EmailJS is not configured */
const send = async (templateId, params) => {
  if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
    // EmailJS not configured yet — log for dev purposes only
    console.info('[emailService] (mock) Would send email:', templateId, params);
    return { status: 200, text: 'mock_ok' };
  }
  const ejs = await getEmailJS();
  if (!ejs) return;
  try {
    return await ejs.send(EMAILJS_SERVICE_ID, templateId, params);
  } catch (err) {
    console.error('[emailService] Send failed:', err);
  }
};

// ─── OTP ─────────────────────────────────────────────────────────────────────
/** Generate a 6-digit OTP and store in sessionStorage with 10-min expiry */
export const generateAndSendOTP = async (email, name = 'User') => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  sessionStorage.setItem('dinagat_otp', JSON.stringify({ otp, email, expiry }));

  await send(TEMPLATE.OTP, {
    to_email: email,
    user_name: name || email,
    otp_code: otp,
  });

  return otp; // returned so mock mode can display it
};

/** Verify the OTP entered by the user */
export const verifyOTP = (email, enteredOTP) => {
  try {
    const stored = JSON.parse(sessionStorage.getItem('dinagat_otp') || 'null');
    if (!stored) return { valid: false, reason: 'No OTP found. Please request a new one.' };
    if (stored.email !== email) return { valid: false, reason: 'OTP mismatch for this email.' };
    if (Date.now() > stored.expiry) {
      sessionStorage.removeItem('dinagat_otp');
      return { valid: false, reason: 'OTP has expired. Please request a new one.' };
    }
    if (stored.otp !== enteredOTP.trim()) return { valid: false, reason: 'Incorrect OTP. Please try again.' };
    sessionStorage.removeItem('dinagat_otp');
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Verification error. Please try again.' };
  }
};

// ─── Booking Confirmed → notify Tourist ──────────────────────────────────────
export const notifyTouristBookingConfirmed = async ({ touristEmail, touristName, hotelName, checkIn, checkOut, totalAmount }) => {
  return send(TEMPLATE.BOOKING_CONFIRM, {
    to_email: touristEmail,
    user_name: touristName || 'Valued Guest',
    hotel_name: hotelName,
    check_in: checkIn,
    check_out: checkOut,
    total_amount: `₱${Number(totalAmount).toLocaleString()}`,
  });
};

// ─── New Booking → notify Tour Agency ────────────────────────────────────────
export const notifyOperatorNewBooking = async ({ operatorEmail, operatorName, touristName, hotelName, checkIn, checkOut }) => {
  return send(TEMPLATE.NEW_BOOKING, {
    to_email: operatorEmail,
    operator_name: operatorName || 'Tour Agency',
    tourist_name: touristName,
    hotel_name: hotelName,
    check_in: checkIn,
    check_out: checkOut,
  });
};

// ─── New Pending Agency → notify Admin ───────────────────────────────────────
export const notifyAdminNewPendingAgency = async ({ adminEmail, adminName, agencyName, agencyEmail }) => {
  return send(TEMPLATE.PENDING_AGENCY, {
    to_email: adminEmail,
    admin_name: adminName || 'Administrator',
    agency_name: agencyName,
    agency_email: agencyEmail,
  });
};
