

const https = require('https');

const API_KEY    = 'AIzaSyBKxt6QivAfGDNWuwVgx-WK5dghiRFl1cg';
const PROJECT_ID = 'dinagat-tourism';

const FALLBACK_PASSWORDS = ['password123', 'admin123', 'dinagat123', 'Admin123!', 'Password123!'];

const USERS_TO_CREATE = [
  {
    email:    'tourist@dinagat.com',
    password: 'password123',
    profile: {
      fullName:     'Jane Doe (Tourist)',
      role:         'tourist',
      phone:        '+63 934 567 8901',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      status:       'active',
    }
  },
  {
    email:    'operator@dinagat.com',
    password: 'password123',
    profile: {
      fullName:     'Isla Tour Agency',
      role:         'operator',
      phone:        '+63 923 456 7890',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      status:       'active',
    }
  },
  {
    email:    'admin@dinagat.com',
    password: 'password123',
    profile: {
      fullName:     'System Administrator',
      role:         'admin',
      phone:        '+63 912 345 6789',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      status:       'active',
    }
  },
];

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
        try { resolve(JSON.parse(responseData)); }
        catch { resolve(responseData); }
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
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function toFirestore(value) {
  if (typeof value === 'string')  return { stringValue: value };
  if (typeof value === 'number')  return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
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

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  Dinagat Tourism — Create Default Firebase Accounts  ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  for (const user of USERS_TO_CREATE) {
    console.log(`\n👤 Processing: ${user.email} (${user.profile.role})`);
    console.log(`   ─────────────────────────────────────────`);

    let idToken, localId;

const signupRes = await httpPost(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { email: user.email, password: user.password, returnSecureToken: true }
    );

    if (signupRes.idToken) {
      idToken  = signupRes.idToken;
      localId  = signupRes.localId;
      console.log(`   ✅ Firebase Auth account created (UID: ${localId})`);
    } else if (signupRes.error?.message === 'EMAIL_EXISTS') {
      
      console.log(`   ℹ️  Email already exists. Trying to log in...`);
      let loggedIn = false;

      for (const tryPassword of FALLBACK_PASSWORDS) {
        const loginRes = await httpPost(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
          { email: user.email, password: tryPassword, returnSecureToken: true }
        );
        if (loginRes.idToken) {
          idToken = loginRes.idToken;
          localId = loginRes.localId;
          console.log(`   ✅ Logged in with password: ${tryPassword} (UID: ${localId})`);
          loggedIn = true;
          break;
        }
      }

      if (!loggedIn) {
        console.error(`   ❌ Cannot log in as ${user.email} — password is unknown.`);
        console.log(`   💡 SOLUSYON: Puntahan ang Firebase Console at i-delete ang account,`);
        console.log(`      tapos patakbuhin ulit ang script na ito.`);
        console.log(`      👉 https://console.firebase.google.com/project/${PROJECT_ID}/authentication/users`);
        continue;
      }
    } else {
      console.error(`   ❌ Signup failed: ${signupRes.error?.message || JSON.stringify(signupRes)}`);
      continue;
    }

const profileData = { ...user.profile, email: user.email };
    await firestoreSet(idToken, 'users', localId, toFields(profileData));
    console.log(`   ✅ Firestore profile saved at users/${localId}`);
    console.log(`   📧 Email   : ${user.email}`);
    console.log(`   🔑 Password: ${user.password}`);
    console.log(`   🏷️  Role    : ${user.profile.role}`);
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log('✅  Lahat ng users ay naka-setup na sa Firebase!');
  console.log('══════════════════════════════════════════════════════');
  console.log('\n🔗 View users sa Firebase Console:');
  console.log('   https://console.firebase.google.com/project/dinagat-tourism/authentication/users');
  console.log('\n🔗 View Firestore profiles:');
  console.log('   https://console.firebase.google.com/project/dinagat-tourism/firestore/data/users\n');
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err.message);
  process.exit(1);
});
