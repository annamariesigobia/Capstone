/**
 * seedBookings.js — Seed sample bookings into Firestore
 * Run: node seedBookings.js
 */

const https = require('https');

const API_KEY    = 'AIzaSyBKxt6QivAfGDNWuwVgx-WK5dghiRFl1cg';
const PROJECT_ID = 'dinagat-tourism';

// Known operator UID from seedClient.js / accommodations
const OPERATOR_UID = 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1';

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let out = '';
      res.on('data', c => { out += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(out)); } catch { resolve(out); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Create a Firestore document via REST (PATCH = create or overwrite by ID)
function firestoreSet(idToken, collection, docId, fields) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ fields });
    const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
    const options = {
      hostname: 'firestore.googleapis.com',
      path,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function toFirestore(value) {
  if (typeof value === 'string')  return { stringValue: value };
  if (typeof value === 'number')  return Number.isInteger(value)
    ? { integerValue: String(value) }
    : { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value))       return { arrayValue: { values: value.map(toFirestore) } };
  return { stringValue: String(value) };
}

function toFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) fields[k] = toFirestore(v);
  }
  return fields;
}

async function login(email, passwords) {
  const tries = Array.isArray(passwords) ? passwords : [passwords];
  for (const password of tries) {
    const res = await httpPost(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    if (res.idToken) return { idToken: res.idToken, uid: res.localId, password };
  }
  throw new Error(`Login failed for ${email} — tried ${tries.join(', ')}`);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Dinagat Tourism — Seed Sample Bookings          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Login as admin to get write token (try multiple passwords)
  console.log('🔐 Logging in as admin@dinagat.com...');
  let adminToken, adminUid;
  try {
    const admin = await login('admin@dinagat.com', ['password123', 'admin123', 'dinagat123', 'Admin123!']);
    adminToken = admin.idToken;
    adminUid   = admin.uid;
    console.log(`   ✅ Admin UID: ${adminUid}\n`);
  } catch (e) {
    console.log(`   ⚠️  Admin login failed, falling back to tourist token...`);
    adminToken = null;
  }

  // Login as tourist to get their real UID
  console.log('🔐 Logging in as tourist@dinagat.com...');
  const tourist = await login('tourist@dinagat.com', ['password123', 'dinagat123', 'tourist123']);
  console.log(`   ✅ Tourist UID: ${tourist.uid}\n`);

  const touristId   = tourist.uid;
  const operatorId  = OPERATOR_UID;

  // Use admin token if available; otherwise use tourist token (rules allow create for any authenticated user)
  const idToken = adminToken || tourist.idToken;

  const now = new Date();
  const daysFromNow = (d) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split('T')[0];
  };

  const BOOKINGS = [
    {
      id: 'booking-seed-001',
      touristId,
      touristName: 'Jane Doe (Tourist)',
      operatorId,
      accommodationId: 'acc-isla',
      hotelName: 'Isla Beach Resort',
      checkIn: daysFromNow(5),
      checkOut: daysFromNow(8),
      guests: 2,
      totalAmount: 10500,
      status: 'pending',
      paymentProof: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
      createdAt: now.toISOString(),
      rejectReason: '',
    },
    {
      id: 'booking-seed-002',
      touristId,
      touristName: 'Jane Doe (Tourist)',
      operatorId,
      accommodationId: 'acc-oceanview',
      hotelName: 'Oceanview Homestay',
      checkIn: daysFromNow(14),
      checkOut: daysFromNow(17),
      guests: 3,
      totalAmount: 3600,
      status: 'confirmed',
      paymentProof: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      rejectReason: '',
    },
    {
      id: 'booking-seed-003',
      touristId,
      touristName: 'Jane Doe (Tourist)',
      operatorId,
      accommodationId: 'acc-cagdianao',
      hotelName: 'Cagdianao Nature Lodge',
      checkIn: daysFromNow(21),
      checkOut: daysFromNow(25),
      guests: 4,
      totalAmount: 8800,
      status: 'pending',
      paymentProof: '',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      rejectReason: '',
    },
    {
      id: 'booking-seed-004',
      touristId,
      touristName: 'Jane Doe (Tourist)',
      operatorId,
      accommodationId: 'acc-sj-inn',
      hotelName: 'San Jose Port Inn',
      checkIn: daysFromNow(-10),
      checkOut: daysFromNow(-8),
      guests: 1,
      totalAmount: 3200,
      status: 'confirmed',
      paymentProof: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
      createdAt: new Date(now.getTime() - 86400000 * 12).toISOString(),
      rejectReason: '',
    },
  ];

  console.log('📂 Seeding: bookings');
  for (const booking of BOOKINGS) {
    const { id, ...data } = booking;
    const result = await firestoreSet(idToken, 'bookings', id, toFields(data));
    if (result.error) {
      console.error(`   ❌ bookings/${id} FAILED: ${result.error.message}`);
    } else {
      console.log(`   ✅ bookings/${id}  [${data.hotelName}] — ${data.status.toUpperCase()}`);
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('✅  Sample bookings seeded successfully!');
  console.log('══════════════════════════════════════════════════');
  console.log('\nView bookings in Firestore:');
  console.log(`  https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/bookings\n`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
