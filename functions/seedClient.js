

const https = require('https');

const API_KEY        = 'AIzaSyBKxt6QivAfGDNWuwVgx-WK5dghiRFl1cg';
const PROJECT_ID     = 'dinagat-tourism';
const ADMIN_EMAIL    = 'admin@dinagat.com';   
const ADMIN_PASSWORD = 'admin123';          

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
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch {
          resolve(responseData);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

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
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve(JSON.parse(data)));
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
    if (v !== undefined && v !== null) {
      fields[k] = toFirestore(v);
    }
  }
  return fields;
}

const ATTRACTIONS = [
  {
    id: 'attr-bitaog',
    name: 'Bitaog Beach',
    description: 'A stunning white-sand beach in Basilisa characterized by clean waters, massive limestone formations, and ancestral trees.',
    category: 'Beaches',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1345,
    longitude: 125.6123,
    entranceFee: 50,
    operatingHours: '06:00 AM - 06:00 PM',
    featured: true,
  },
  {
    id: 'attr-bababu',
    name: 'Lake Bababu',
    description: 'A mysterious freshwater lake situated on top of a mountain, linked to the sea by an underwater cave network. Sacred to locals.',
    category: 'Nature',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.2312,
    longitude: 125.5901,
    entranceFee: 100,
    operatingHours: '07:00 AM - 04:30 PM',
    featured: true,
  },
  {
    id: 'attr-hagakhak',
    name: 'Hagakhak Rock Formations',
    description: 'Jagged, cathedral-like limestone cliffs emerging from deep turquoise waters. Perfect for boat tours and photography.',
    category: 'Rock Formations',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1582,
    longitude: 125.5892,
    entranceFee: 0,
    operatingHours: '24/7 (Guided tours recommended)',
    featured: true,
  },
  {
    id: 'attr-cabacungan',
    name: 'Cabacungan Cove',
    description: 'An adventurous destination with high-walled rock structures enclosing a sheltered cove filled with coral gardens.',
    category: 'Beaches',
    location: 'Cagdianao, Dinagat Islands',
    latitude: 10.2104,
    longitude: 125.6321,
    entranceFee: 75,
    operatingHours: '08:00 AM - 05:00 PM',
    featured: false,
  },
  {
    id: 'attr-duyos',
    name: 'Duyos Beach',
    description: 'Lined with coconut trees, Duyos Beach has soft white sand and shallow waters, ideal for swimming and sunsets.',
    category: 'Beaches',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0523,
    longitude: 125.5810,
    entranceFee: 30,
    operatingHours: '06:00 AM - 08:00 PM',
    featured: false,
  },
  {
    id: 'attr-loreto',
    name: 'Loreto Port & Mangroves',
    description: 'A scenic fishing port surrounded by dense mangrove forests. Offers boat rides and glimpses of local fishermen\'s life.',
    category: 'Nature',
    location: 'Loreto, Dinagat Islands',
    latitude: 9.9700,
    longitude: 125.5100,
    entranceFee: 0,
    operatingHours: '06:00 AM - 06:00 PM',
    featured: false,
  },
];

const ACCOMMODATIONS = [
  {
    id: 'acc-isla',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1', 
    hotelName: 'Isla Beach Resort',
    description: 'A luxurious beach resort featuring pristine oceanfront cabanas, infinity pool, dive center, and seafood dining.',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1360,
    longitude: 125.6130,
    pricePerNight: 3500,
    availableRooms: 12,
    contactInfo: '+63 923 456 7890',
    rating: 4.8,
  },
  {
    id: 'acc-oceanview',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    hotelName: 'Oceanview Homestay',
    description: 'A cozy family-run homestay overlooking San Jose Bay. Warm local hospitality and home-cooked Filipino meals.',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0510,
    longitude: 125.5820,
    pricePerNight: 1200,
    availableRooms: 5,
    contactInfo: '+63 934 567 8901',
    rating: 4.5,
  },
  {
    id: 'acc-sj-inn',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    hotelName: 'San Jose Port Inn',
    description: 'Conveniently 2 minutes from the passenger terminal. Modern, compact air-conditioned rooms for active travelers.',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0505,
    longitude: 125.5789,
    pricePerNight: 1600,
    availableRooms: 8,
    contactInfo: '+63 912 345 6789',
    rating: 4.2,
  },
  {
    id: 'acc-cagdianao',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    hotelName: 'Cagdianao Nature Lodge',
    description: 'An eco-friendly solar-powered lodge with indigenous-inspired architecture and guided nature tours.',
    location: 'Cagdianao, Dinagat Islands',
    latitude: 10.2100,
    longitude: 125.6340,
    pricePerNight: 20,
    availableRooms: 6,
    contactInfo: '+63 945 678 9012',
    rating: 4.6,
  },
];

const TRANSPORTATION = [
  {
    id: 'trans-ferry-1',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    type: 'Ferry',
    route: 'Surigao Port → San Jose Terminal',
    fare: 320,
    departure: '08:30 AM',
    arrival: '10:00 AM',
    schedule: 'Daily',
    notes: 'Main passenger ferry. Book early during peak season.',
  },
  {
    id: 'trans-ferry-2',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    type: 'Ferry',
    route: 'Surigao Port → San Jose Terminal',
    fare: 320,
    departure: '01:30 PM',
    arrival: '03:00 PM',
    schedule: 'Daily',
    notes: 'Afternoon departure. Subject to weather conditions.',
  },
  {
    id: 'trans-ferry-3',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    type: 'Ferry',
    route: 'San Jose Terminal → Surigao Port',
    fare: 320,
    departure: '05:00 AM',
    arrival: '06:30 AM',
    schedule: 'Daily',
    notes: 'Early morning return trip.',
  },
  {
    id: 'trans-boat-1',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    type: 'Boat',
    route: 'San Jose Port → Basilisa Island Hopping',
    fare: 2000,
    departure: '07:00 AM',
    arrival: '04:00 PM',
    schedule: 'On-Demand Charter',
    notes: 'Full-day island hopping. Minimum 8 passengers.',
  },
  {
    id: 'trans-jeepney-1',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    type: 'Jeepney',
    route: 'San Jose Terminal → Loreto Port',
    fare: 150,
    departure: '09:00 AM',
    arrival: '11:30 AM',
    schedule: 'Mon, Wed, Fri',
    notes: 'Scenic mountain road.',
  },
  {
    id: 'trans-tricycle-1',
    operatorId: 'Cyf8ia18ZtVe5EO0V5KkUIK7lXx1',
    type: 'Tricycle',
    route: 'San Jose Terminal → Duyos Beach',
    fare: 80,
    departure: 'On demand 07:00 AM - 06:00 PM',
    arrival: '15 minutes',
    schedule: 'Daily',
    notes: 'Available at the tricycle terminal near the port.',
  },
];

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Dinagat Tourism — Firestore Seeder (Client)     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

console.log(`🔐 Logging in as ${ADMIN_EMAIL}...`);
  let loginRes = await httpPost(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }
  );

  let idToken;
  let localId;

  if (!loginRes.idToken) {
    console.log(`⚠️  Admin user not found or wrong password. Trying to register ${ADMIN_EMAIL}...`);
    const signupRes = await httpPost(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }
    );

    if (!signupRes.idToken) {
      console.error('\n❌ Registration and Login failed:', signupRes.error?.message || JSON.stringify(signupRes));
      console.error('\n💡 Suriin ang ADMIN_EMAIL at ADMIN_PASSWORD sa itaas ng file.');
      process.exit(1);
    }
    idToken = signupRes.idToken;
    localId = signupRes.localId;
    console.log('✅ Registered successfully!\n');
  } else {
    idToken = loginRes.idToken;
    localId = loginRes.localId;
    console.log('✅ Logged in successfully!\n');
  }

console.log('📂 Seeding: users (Admin Profile)');
  const adminProfile = {
    fullName: 'System Administrator',
    email: ADMIN_EMAIL,
    role: 'admin',
    phone: '+63 912 345 6789',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'active',
  };
  await firestoreSet(idToken, 'users', localId, toFields(adminProfile));
  console.log(`   ✅ users/${localId} (Role: admin)`);

console.log('📂 Seeding: attractions');
  for (const item of ATTRACTIONS) {
    const { id, ...data } = item;
    await firestoreSet(idToken, 'attractions', id, toFields(data));
    console.log(`   ✅ attractions/${id}`);
  }

console.log('\n📂 Seeding: accommodations');
  for (const item of ACCOMMODATIONS) {
    const { id, ...data } = item;
    await firestoreSet(idToken, 'accommodations', id, toFields(data));
    console.log(`   ✅ accommodations/${id}`);
  }

console.log('\n📂 Seeding: transportation');
  for (const item of TRANSPORTATION) {
    const { id, ...data } = item;
    await firestoreSet(idToken, 'transportation', id, toFields(data));
    console.log(`   ✅ transportation/${id}`);
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('✅  Database seeded successfully!');
  console.log('══════════════════════════════════════════════════');
  console.log('\nView your data:');
  console.log('  https://console.firebase.google.com/project/dinagat-tourism/firestore\n');
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
