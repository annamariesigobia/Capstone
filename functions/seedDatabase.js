

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (admin.apps.length === 0) {
  const serviceAccountPath = path.join(__dirname, 'serviceAccount.json');

  if (fs.existsSync(serviceAccountPath)) {
    
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'dinagat-tourism',
    });
    console.log('🔑 Using serviceAccount.json credentials');
  } else {
    
    admin.initializeApp({
      projectId: 'dinagat-tourism',
    });
    console.log('🔑 Using Application Default Credentials');
  }
}

const db = admin.firestore();

const USERS = [
  {
    id: 'admin-uid-001',
    fullName: 'System Administrator',
    email: 'admin@dinagat.com',
    role: 'admin',
    phone: '+63 912 345 6789',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'operator-uid-001',
    fullName: 'Isla Tour Agency',
    email: 'operator@dinagat.com',
    role: 'operator',
    phone: '+63 923 456 7890',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'operator-uid-002',
    fullName: 'Oceanview Homestay Owner',
    email: 'operator2@dinagat.com',
    role: 'operator',
    phone: '+63 934 567 8901',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'tourist-uid-001',
    fullName: 'Jane Doe',
    email: 'tourist@dinagat.com',
    role: 'tourist',
    phone: '+63 934 567 8901',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

const ATTRACTIONS = [
  {
    id: 'attr-bitaog',
    name: 'Bitaog Beach',
    description:
      'A stunning white-sand beach in Basilisa characterized by clean waters, massive limestone formations, and ancestral trees. One of Dinagat\'s most photographed spots.',
    category: 'Beaches',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1345,
    longitude: 125.6123,
    entranceFee: 50,
    operatingHours: '06:00 AM - 06:00 PM',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'attr-bababu',
    name: 'Lake Bababu',
    description:
      'A mysterious freshwater lake situated on top of a mountain, linked to the sea by an underwater cave network. Sacred to the indigenous people of Dinagat.',
    category: 'Nature',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.2312,
    longitude: 125.5901,
    entranceFee: 100,
    operatingHours: '07:00 AM - 04:30 PM',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'attr-hagakhak',
    name: 'Hagakhak Rock Formations',
    description:
      'Jagged, cathedral-like limestone cliffs emerging from deep turquoise waters. Perfect for boat tours, cliff diving, and photography enthusiasts.',
    category: 'Rock Formations',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1582,
    longitude: 125.5892,
    entranceFee: 0,
    operatingHours: '24/7 (Guided tours recommended)',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'attr-cabacungan',
    name: 'Cabacungan Cove',
    description:
      'An adventurous destination with high-walled rock structures enclosing a sheltered cove filled with vibrant coral gardens and marine life.',
    category: 'Beaches',
    location: 'Cagdianao, Dinagat Islands',
    latitude: 10.2104,
    longitude: 125.6321,
    entranceFee: 75,
    operatingHours: '08:00 AM - 05:00 PM',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&auto=format&fit=crop&q=80',
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'attr-duyos',
    name: 'Duyos Beach',
    description:
      'Lined with coconut trees, Duyos Beach has soft white sand and shallow waters, making it an ideal destination for swimming and watching breathtaking sunsets.',
    category: 'Beaches',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0523,
    longitude: 125.5810,
    entranceFee: 30,
    operatingHours: '06:00 AM - 08:00 PM',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&auto=format&fit=crop&q=80',
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'attr-loreto',
    name: 'Loreto Port & Mangroves',
    description:
      'A scenic fishing port surrounded by dense mangrove forests. Offers boat rides through the mangrove channels and a glimpse of local fishermen\'s life.',
    category: 'Nature',
    location: 'Loreto, Dinagat Islands',
    latitude: 9.9700,
    longitude: 125.5100,
    entranceFee: 0,
    operatingHours: '06:00 AM - 06:00 PM',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80',
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

const ACCOMMODATIONS = [
  {
    id: 'acc-isla',
    operatorId: 'operator-uid-001',
    hotelName: 'Isla Beach Resort',
    description:
      'A luxurious beach resort featuring pristine oceanfront cabanas, infinity pool, dive center, and a dynamic seafood dining experience overlooking the sea.',
    amenities: ['WiFi', 'Pool', 'Aircon', 'Restaurant', 'Beach Access', 'Bar', 'Dive Center', 'Parking'],
    availableRooms: 12,
    noOfBeds: 24,
    noOfCottages: 6,
    pricePerNight: 3500,
    ownerName: 'Don Fernando Isla',
    contactPerson: 'Isabella Isla',
    contactNumber: '0923-456-7890',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1360,
    longitude: 125.6130,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
    ],
    contactInfo: '+63 923 456 7890 | operator@dinagat.com',
    rating: 4.8,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'acc-oceanview',
    operatorId: 'operator-uid-002',
    hotelName: 'Oceanview Homestay',
    description:
      'An affordable, cozy family-run homestay overlooking San Jose Bay. Experience warm local hospitality and home-cooked Filipino meals every morning.',
    amenities: ['WiFi', 'Kitchen Access', 'Fan', 'Terrace', 'Breakfast'],
    availableRooms: 5,
    noOfBeds: 10,
    noOfCottages: 2,
    pricePerNight: 1200,
    ownerName: 'Clara Oceanview',
    contactPerson: 'Clara Santos',
    contactNumber: '0934-567-8901',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0510,
    longitude: 125.5820,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    ],
    contactInfo: '+63 934 567 8901',
    rating: 4.5,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'acc-sj-inn',
    operatorId: 'operator-uid-001',
    hotelName: 'San Jose Port Inn',
    description:
      'Conveniently situated 2 minutes from the passenger terminal. Modern, compact air-conditioned rooms designed for active travelers catching early ferries.',
    amenities: ['WiFi', 'Aircon', 'Cable TV', '24/7 Front Desk', 'Luggage Storage'],
    availableRooms: 8,
    noOfBeds: 12,
    noOfCottages: 0,
    pricePerNight: 1600,
    ownerName: 'Ramon Portes',
    contactPerson: 'Ramon Portes',
    contactNumber: '0912-345-6789',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0505,
    longitude: 125.5789,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
    ],
    contactInfo: '+63 912 345 6789',
    rating: 4.2,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'acc-cagdianao',
    operatorId: 'operator-uid-002',
    hotelName: 'Cagdianao Nature Lodge',
    description:
      'An eco-friendly lodge nestled among tropical trees near Cabacungan Cove. Solar-powered with indigenous-inspired architecture and guided nature tours.',
    amenities: ['WiFi', 'Fan', 'Nature Trails', 'Guided Tours', 'Organic Meals'],
    availableRooms: 6,
    noOfBeds: 8,
    noOfCottages: 3,
    pricePerNight: 2000,
    ownerName: 'Gabriel Verde',
    contactPerson: 'Gabriel Verde',
    contactNumber: '0945-678-9012',
    location: 'Cagdianao, Dinagat Islands',
    latitude: 10.2100,
    longitude: 125.6340,
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&auto=format&fit=crop&q=80',
    ],
    contactInfo: '+63 945 678 9012',
    rating: 4.6,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

const TRANSPORTATION = [
  {
    id: 'trans-ferry-1',
    operatorId: 'operator-uid-001',
    type: 'Ferry',
    route: 'Surigao Port → San Jose Terminal',
    fare: 320,
    departure: '08:30 AM',
    arrival: '10:00 AM',
    schedule: 'Daily',
    capacity: 200,
    notes: 'Main passenger ferry. Book early during peak season.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'trans-ferry-2',
    operatorId: 'operator-uid-001',
    type: 'Ferry',
    route: 'Surigao Port → San Jose Terminal',
    fare: 320,
    departure: '01:30 PM',
    arrival: '03:00 PM',
    schedule: 'Daily',
    capacity: 200,
    notes: 'Afternoon departure. Subject to weather conditions.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'trans-ferry-3',
    operatorId: 'operator-uid-001',
    type: 'Ferry',
    route: 'San Jose Terminal → Surigao Port',
    fare: 320,
    departure: '05:00 AM',
    arrival: '06:30 AM',
    schedule: 'Daily',
    capacity: 200,
    notes: 'Early morning return trip. Arrive 30 minutes before departure.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'trans-boat-1',
    operatorId: 'operator-uid-002',
    type: 'Boat',
    route: 'San Jose Port → Basilisa Island Hopping',
    fare: 2000,
    departure: '07:00 AM',
    arrival: '04:00 PM',
    schedule: 'On-Demand Charter',
    capacity: 12,
    notes: 'Full-day island hopping tour. Minimum 8 passengers. Includes snorkeling gear.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'trans-jeepney-1',
    operatorId: 'operator-uid-002',
    type: 'Jeepney',
    route: 'San Jose Terminal → Loreto Port',
    fare: 150,
    departure: '09:00 AM',
    arrival: '11:30 AM',
    schedule: 'Mon, Wed, Fri',
    capacity: 20,
    notes: 'Scenic mountain road. Not recommended during heavy rains.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'trans-tricycle-1',
    operatorId: 'operator-uid-001',
    type: 'Tricycle',
    route: 'San Jose Terminal → Duyos Beach',
    fare: 80,
    departure: 'On demand (07:00 AM - 06:00 PM)',
    arrival: '15 minutes',
    schedule: 'Daily',
    capacity: 3,
    notes: 'Available at the tricycle terminal near the port.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

const DINING_SPOTS = [
  {
    id: 'dine-1',
    name: 'San Jose Harbor Seafood Grill & Bistro',
    category: 'Seafood & Grill',
    municipality: 'San Jose',
    location: 'San Jose Port, Dinagat Islands',
    address: 'San Jose Port Promenade, San Jose, Dinagat Islands',
    owner: 'Capt. Manuel Santos',
    contactPerson: 'Manuel Santos',
    contactNumber: '0917-555-0101',
    employeeCount: 12,
    priceRange: '₱150 - ₱450',
    operatingHours: '07:00 AM - 09:30 PM',
    specialties: ['Grilled Buttered Lobster', 'Fresh Tuna Kinilaw', 'Steamed Crabs', 'Coconut Shake'],
    description: 'Fresh sea catch daily served right at the San Jose port promenade with sunset harbor views.',
    latitude: 10.0525,
    longitude: 125.6070,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'],
    rating: 4.9,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'dine-2',
    name: 'Basilisa Cove Sunset Eatery',
    category: 'Beachfront Dining',
    municipality: 'Basilisa',
    location: 'Basilisa, Dinagat Islands',
    address: 'Bitaog Beachfront, Basilisa, Dinagat Islands',
    owner: 'Elena B. Rodriguez',
    contactPerson: 'Elena Rodriguez',
    contactNumber: '0928-555-0102',
    employeeCount: 8,
    priceRange: '₱150 - ₱400',
    operatingHours: '08:00 AM - 08:00 PM',
    specialties: ['Grilled Sinugba Tanguigue', 'Sinigang na Lapu-Lapu', 'Island Buko Juice'],
    description: 'Relaxed beachfront native bamboo dining huts right beside Bitaog Beach and turquoise waters.',
    latitude: 10.1350,
    longitude: 125.5940,
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'],
    rating: 4.8,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'dine-3',
    name: 'Libjo Bay Native Carinderia & Resto',
    category: 'Local Cuisine',
    municipality: 'Libjo',
    location: 'Libjo, Dinagat Islands',
    address: 'Poblacion Baywalk, Libjo, Dinagat Islands',
    owner: 'Chef Pedro Alcantara',
    contactPerson: 'Rosa Alcantara',
    contactNumber: '0939-555-0103',
    employeeCount: 6,
    priceRange: '₱100 - ₱300',
    operatingHours: '06:00 AM - 07:00 PM',
    specialties: ['Adobong Pugita (Octopus)', 'Humba Dinagat', 'Tinolang Manok Bisaya'],
    description: 'Authentic local island homestyle cooking with traditional Caraga & Dinagat spices.',
    latitude: 10.2210,
    longitude: 125.5460,
    images: ['https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&auto=format&fit=crop&q=80'],
    rating: 4.7,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'dine-4',
    name: 'Cagdianao Rockside Cafe & Lounge',
    category: 'Cafe & Bistro',
    municipality: 'Cagdianao',
    location: 'Cagdianao, Dinagat Islands',
    address: 'Cabacungan Cliffside Road, Cagdianao, Dinagat Islands',
    owner: 'Marco & Julia Valenzuela',
    contactPerson: 'Julia Valenzuela',
    contactNumber: '0945-555-0104',
    employeeCount: 10,
    priceRange: '₱120 - ₱350',
    operatingHours: '09:00 AM - 09:00 PM',
    specialties: ['Native Coffee Brew', 'Mango Crêpes', 'Calamansi Mint Cooler', 'Seafood Pasta'],
    description: 'Scenic limestone cliffside coffee bar and dining spot overlooking Cabacungan Cove.',
    latitude: 10.2110,
    longitude: 125.6890,
    images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80'],
    rating: 4.9,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'dine-5',
    name: 'Loreto Seaside Island Kitchen',
    category: 'Seafood & Grill',
    municipality: 'Loreto',
    location: 'Loreto, Dinagat Islands',
    address: 'Northern Wharf Boulevard, Loreto, Dinagat Islands',
    owner: 'Ricardo E. Tan',
    contactPerson: 'Ricardo Tan',
    contactNumber: '0998-555-0105',
    employeeCount: 15,
    priceRange: '₱150 - ₱400',
    operatingHours: '10:00 AM - 09:00 PM',
    specialties: ['Inihaw na Pusit', 'Crispy Calamari', 'Sizzling Gambas', 'Cold Local Juices'],
    description: 'Popular northern island seafood hub with open-air dining decks overlooking the Philippine Sea.',
    latitude: 10.3610,
    longitude: 125.5810,
    images: ['https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&auto=format&fit=crop&q=80'],
    rating: 4.8,
  }
];

const REVIEWS = [
  {
    id: 'rev-001',
    userId: 'tourist-uid-001',
    userName: 'Jane Doe',
    attractionId: 'attr-bitaog',
    rating: 5,
    comment:
      'Absolutely spectacular! The limestone formations look like miniature versions of El Nido but with zero crowds. A must-visit gem!',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'rev-002',
    userId: 'tourist-uid-001',
    userName: 'Jane Doe',
    attractionId: 'attr-bababu',
    rating: 4,
    comment:
      'The trek up is quite challenging but the lake at the top is serene and mesmerizing. Bring lots of water and wear good shoes.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'rev-003',
    userId: 'tourist-uid-001',
    userName: 'Jane Doe',
    attractionId: 'attr-hagakhak',
    rating: 5,
    comment:
      'Breathtaking rock formations! Our boat glided right between them. The water is incredibly clear. Highly recommend a guided boat tour.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function seedCollection(collectionName, documents) {
  console.log(`\n📂 Seeding collection: ${collectionName}`);
  const batch = db.batch();

  for (const item of documents) {
    const { id, ...data } = item;
    const ref = id
      ? db.collection(collectionName).doc(id)
      : db.collection(collectionName).doc();
    batch.set(ref, data, { merge: true });
    console.log(`   ✅ ${collectionName}/${id || 'auto-id'}`);
  }

  await batch.commit();
  console.log(`   🎉 ${documents.length} documents written to [${collectionName}]`);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Dinagat Tourism — Firestore Database Seeder     ║');
  console.log('║  Project: dinagat-tourism                        ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('\n🚀 Starting database seed...\n');

  try {
    await seedCollection('users', USERS);
    await seedCollection('attractions', ATTRACTIONS);
    await seedCollection('accommodations', ACCOMMODATIONS);
    await seedCollection('transportation', TRANSPORTATION);
    await seedCollection('dining_spots', DINING_SPOTS);
    await seedCollection('reviews', REVIEWS);

    console.log('\n══════════════════════════════════════════════════');
    console.log('✅  Database seeded successfully!');
    console.log('══════════════════════════════════════════════════');
    console.log('\nCollections created:');
    console.log('  • users            (4 documents)');
    console.log('  • attractions      (6 documents)');
    console.log('  • accommodations   (4 documents)');
    console.log('  • transportation   (6 documents)');
    console.log('  • dining_spots     (5 documents)');
    console.log('  • reviews          (3 documents)');
    console.log('\nView your data at:');
    console.log('  https://console.firebase.google.com/project/dinagat-tourism/firestore\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.code === 7) {
      console.error('\n💡 Permission denied. Make sure you are authenticated:');
      console.error('   Run: firebase login');
      console.error('   Then: firebase use dinagat-tourism');
    }
    process.exit(1);
  }
}

main();
