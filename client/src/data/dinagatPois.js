// Comprehensive Points of Interest (POIs) across Dinagat Islands
// Includes Attractions, Restaurants & Dining, Accommodations, and Ports/Terminals

export const ALL_DINAGAT_POIS = [
  // ── ATTRACTIONS ──
  {
    id: 'poi-attr-bitaog',
    name: 'Bitaog Beach',
    category: 'Attraction',
    subCategory: 'Beaches',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1345,
    longitude: 125.6123,
    entranceFee: 50,
    priceRange: '₱50 Entrance',
    operatingHours: '06:00 AM - 06:00 PM',
    description: 'A stunning white-sand beach in Basilisa with clean turquoise waters, massive limestone cliffs, and ancient trees.',
    images: ['/images/spots/bitaog-beach.png']
  },
  {
    id: 'poi-attr-bababu',
    name: 'Lake Bababu',
    category: 'Attraction',
    subCategory: 'Nature',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.2312,
    longitude: 125.5901,
    entranceFee: 100,
    priceRange: '₱100 Trek Fee',
    operatingHours: '07:00 AM - 04:30 PM',
    description: 'A sacred freshwater lake on top of a mountain, linked to the sea by a mysterious underwater cave network.',
    images: ['/images/spots/lake-bababu.png']
  },
  {
    id: 'poi-attr-hagakhak',
    name: 'Hagakhak Rock Formations',
    category: 'Attraction',
    subCategory: 'Rock Formations',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1582,
    longitude: 125.5892,
    entranceFee: 0,
    priceRange: 'Free Entry',
    operatingHours: '24/7 (Guided boat tour recommended)',
    description: 'Cathedral-like limestone cliffs emerging from deep blue waters. Perfect for boat tours and photography.',
    images: ['/images/spots/hagakhak-rocks.png']
  },
  {
    id: 'poi-attr-cabacungan',
    name: 'Cabacungan Cove',
    category: 'Attraction',
    subCategory: 'Beaches',
    location: 'Cagdianao, Dinagat Islands',
    latitude: 10.2104,
    longitude: 125.6321,
    entranceFee: 75,
    priceRange: '₱75 Entrance',
    operatingHours: '08:00 AM - 05:00 PM',
    description: 'An adventurous sheltered cove enclosed by high-walled rock structures and vibrant coral gardens.',
    images: ['/images/spots/cabacungan-cove.png']
  },
  {
    id: 'poi-attr-duyos',
    name: 'Duyos Beach',
    category: 'Attraction',
    subCategory: 'Beaches',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0523,
    longitude: 125.5810,
    entranceFee: 30,
    priceRange: '₱30 Entrance',
    operatingHours: '06:00 AM - 08:00 PM',
    description: 'Lined with coconut palms, Duyos Beach features soft white sand and shallow waters perfect for swimming & sunsets.',
    images: ['/images/spots/duyos-beach.png']
  },
  {
    id: 'poi-attr-pangabangan',
    name: 'Pangabangan Tidal Pools',
    category: 'Attraction',
    subCategory: 'Nature',
    location: 'Libjo, Dinagat Islands',
    latitude: 10.2200,
    longitude: 125.5500,
    entranceFee: 50,
    priceRange: '₱50 Entrance',
    operatingHours: '07:00 AM - 05:00 PM',
    description: 'Natural tidal pools carved into coastal rock formations with crystal-clear emerald seawater.',
    images: ['/images/spots/tidal-pools.png']
  },
  {
    id: 'poi-attr-isla-haga',
    name: 'Isla Haga White Sand Island',
    category: 'Attraction',
    subCategory: 'Beaches',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1750,
    longitude: 125.6020,
    entranceFee: 50,
    priceRange: '₱50 Island Fee',
    operatingHours: '06:00 AM - 05:00 PM',
    description: 'An uncrowded tropical islet with powdery white sand, palm trees, and crystal diving spots.',
    images: ['/images/spots/bitaog-beach.png']
  },

  // ── RESTAURANTS & DINING ──
  {
    id: 'poi-resto-boulevard',
    name: 'San Jose Boulevard Seafood Shacks',
    category: 'Restaurant',
    subCategory: 'Seafood Grill',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0520,
    longitude: 125.5795,
    entranceFee: 0,
    priceRange: '₱150 - ₱400 per meal',
    operatingHours: '08:00 AM - 10:00 PM',
    description: 'Freshly caught grilled tuna, kinilaw, garlic butter crabs, and cold coconut shakes right by San Jose Boulevard waterfront.',
    images: ['/images/spots/duyos-beach.png']
  },
  {
    id: 'poi-resto-isla-bistro',
    name: 'Isla Beach Grill & Bistro',
    category: 'Restaurant',
    subCategory: 'Beachfront Dining',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1370,
    longitude: 125.6110,
    entranceFee: 0,
    priceRange: '₱200 - ₱500 per meal',
    operatingHours: '07:00 AM - 09:00 PM',
    description: 'Alfresco beachfront dining serving traditional Surigaonon sinugba, native chicken tinola, and fruit smoothies.',
    images: ['/images/spots/bitaog-beach.png']
  },
  {
    id: 'poi-resto-bababu-cafe',
    name: 'Bababu Mountain Eco-Cafe',
    category: 'Restaurant',
    subCategory: 'Cafe & Native Snacks',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.2280,
    longitude: 125.5890,
    entranceFee: 0,
    priceRange: '₱50 - ₱200',
    operatingHours: '06:00 AM - 06:00 PM',
    description: 'Organic mountain pitstop offering hot Dinagat native coffee, sticky rice cakes (suman), and fresh buko water before trekking.',
    images: ['/images/spots/lake-bababu.png']
  },
  {
    id: 'poi-resto-libjo-diner',
    name: 'Libjo Tidal View Carinderia',
    category: 'Restaurant',
    subCategory: 'Local Eatery',
    location: 'Libjo, Dinagat Islands',
    latitude: 10.2180,
    longitude: 125.5480,
    entranceFee: 0,
    priceRange: '₱100 - ₱300 per meal',
    operatingHours: '07:00 AM - 07:00 PM',
    description: 'Famous local seaside diner serving mantis shrimp (tatan), squid adobo, and fresh coconut water with tidal views.',
    images: ['/images/spots/tidal-pools.png']
  },
  {
    id: 'poi-resto-cagdianao-bar',
    name: 'Cagdianao Cove Resto Shack',
    category: 'Restaurant',
    subCategory: 'Seaside Grill',
    location: 'Cagdianao, Dinagat Islands',
    latitude: 10.2080,
    longitude: 125.6300,
    entranceFee: 0,
    priceRange: '₱180 - ₱450 per meal',
    operatingHours: '10:00 AM - 10:00 PM',
    description: 'Cozy wooden dock diner offering grilled pork belly, lechon kawali, cold drinks, and scenic ocean views.',
    images: ['/images/spots/cabacungan-cove.png']
  },

  // ── ACCOMMODATIONS & RESORTS ──
  {
    id: 'poi-acc-isla-resort',
    name: 'Isla Beach Resort & Cabanas',
    category: 'Accommodation',
    subCategory: 'Resort',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1360,
    longitude: 125.6130,
    pricePerNight: 3500,
    priceRange: '₱3,500/night',
    operatingHours: '24/7 Front Desk',
    description: 'Oceanfront cabanas, swimming pool, dive center, and restaurant amenities located right by Basilisa beach.',
    images: ['/images/spots/bitaog-beach.png']
  },
  {
    id: 'poi-acc-oceanview',
    name: 'Oceanview Homestay San Jose',
    category: 'Accommodation',
    subCategory: 'Homestay',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0510,
    longitude: 125.5820,
    pricePerNight: 1200,
    priceRange: '₱1,200/night',
    operatingHours: '24/7 Front Desk',
    description: 'A cozy family-run homestay overlooking San Jose Bay with home-cooked meals and warm hospitality.',
    images: ['/images/spots/duyos-beach.png']
  },
  {
    id: 'poi-acc-port-inn',
    name: 'San Jose Port Inn',
    category: 'Accommodation',
    subCategory: 'Inn',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0505,
    longitude: 125.5789,
    pricePerNight: 1600,
    priceRange: '₱1,600/night',
    operatingHours: '24/7 Front Desk',
    description: 'Conveniently located 2 minutes from San Jose ferry terminal with air-conditioned rooms for active travelers.',
    images: ['/images/spots/duyos-beach.png']
  },

  // ── PORTS & TERMINALS ──
  {
    id: 'poi-port-san-jose',
    name: 'San Jose Passenger Ferry Terminal',
    category: 'Port',
    subCategory: 'Ferry Port',
    location: 'San Jose, Dinagat Islands',
    latitude: 10.0500,
    longitude: 125.5780,
    entranceFee: 15,
    priceRange: '₱15 Terminal Fee',
    operatingHours: '05:00 AM - 07:00 PM',
    description: 'Main passenger ferry port connecting Surigao City Port to San Jose, Dinagat Islands.',
    images: ['/images/spots/duyos-beach.png']
  },
  {
    id: 'poi-port-basilisa',
    name: 'Basilisa Boat Terminal & Dock',
    category: 'Port',
    subCategory: 'Boat Dock',
    location: 'Basilisa, Dinagat Islands',
    latitude: 10.1330,
    longitude: 125.6150,
    entranceFee: 10,
    priceRange: '₱10 Dock Fee',
    operatingHours: '06:00 AM - 06:00 PM',
    description: 'Primary jump-off dock for island hopping tours to Bitaog Beach, Hagakhak Rocks, and Isla Haga.',
    images: ['/images/spots/bitaog-beach.png']
  },
  {
    id: 'poi-port-cagdianao',
    name: 'Cagdianao Municipal Pier',
    category: 'Port',
    subCategory: 'Boat Dock',
    location: 'Cagdianao, Dinagat Islands',
    latitude: 10.2050,
    longitude: 125.6340,
    entranceFee: 10,
    priceRange: '₱10 Dock Fee',
    operatingHours: '06:00 AM - 06:00 PM',
    description: 'East coast motorboat jump-off terminal for Cabacungan Cove and coral reefs.',
    images: ['/images/spots/cabacungan-cove.png']
  },
  {
    id: 'poi-port-libjo',
    name: 'Libjo Municipal Pier',
    category: 'Port',
    subCategory: 'Boat Dock',
    location: 'Libjo, Dinagat Islands',
    latitude: 10.2220,
    longitude: 125.5460,
    entranceFee: 10,
    priceRange: '₱10 Dock Fee',
    operatingHours: '06:00 AM - 06:00 PM',
    description: 'Northern pier for Pangabangan Tidal Pools, Lake Bababu access, and island hopping.',
    images: ['/images/spots/tidal-pools.png']
  }
];

// Helper to calculate Haversine distance in kilometers
export const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Calculate perpendicular/sampled distance from point P to segment AB
export const getDistanceToSegment = (pLat, pLng, aLat, aLng, bLat, bLng) => {
  const dA = getHaversineDistance(pLat, pLng, aLat, aLng);
  const dB = getHaversineDistance(pLat, pLng, bLat, bLng);
  
  // Sample 5 interpolation points along segment AB to approximate distance
  let minD = Math.min(dA, dB);
  for (let i = 1; i <= 5; i++) {
    const t = i / 6;
    const sampleLat = aLat + (bLat - aLat) * t;
    const sampleLng = aLng + (bLng - aLng) * t;
    const dSample = getHaversineDistance(pLat, pLng, sampleLat, sampleLng);
    if (dSample < minD) minD = dSample;
  }

  return Math.round(minD * 10) / 10;
};
