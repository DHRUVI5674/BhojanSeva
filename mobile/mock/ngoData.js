export const ngoMockData = {
  ngo: {
    name: 'Sneha Child Care NGO',
    verified: true,
    address: 'Paldi, Ahmedabad',
    phone: '+91 9876543002',
    email: 'contact@sneha.org',
  },
  nearbySummary: {
    totalDonations: 12,
    totalQuantity: 150, // servings
    availableFoodCount: 8,
  },
  foodListings: [
    {
      id: 'f1',
      title: 'Fresh Vegetable Pack',
      image: 'https://picsum.photos/400/300?food=4',
      quantity: 30,
      unit: 'servings',
      distanceKm: 2.1,
      deadline: 'Today 6:00 PM',
      prepTime: '12:00 PM',
      storage: 'Refrigerated',
    },
    {
      id: 'f2',
      title: 'Baked Samosas (50 pcs)',
      image: 'https://picsum.photos/400/300?food=5',
      quantity: 50,
      unit: 'pieces',
      distanceKm: 3.5,
      deadline: 'Tomorrow 10:00 AM',
      prepTime: 'Today 3:00 PM',
      storage: 'Room Temp',
    },
  ],
  pendingRequests: [
    { id: 'pr1', foodTitle: 'Fresh Vegetable Pack', quantity: 10, unit: 'servings', status: 'PENDING' },
  ],
  approvedCollections: [
    { id: 'ac1', foodTitle: 'Baked Samosas', quantity: 20, unit: 'pieces', status: 'APPROVED' },
  ],
  activePickups: [
    { id: 'up1', address: 'Radhe Caterers, SG Highway', eta: '15 mins', status: 'EN ROUTE' },
  ],
  volunteerAvailability: {
    totalVolunteers: 8,
    availableNow: 5,
  },
  distributionHistory: [
    { id: 'dh1', foodTitle: 'Fruit Mix', deliveredAt: '3 days ago', image: 'https://picsum.photos/400/300?food=6' },
  ],
  impact: {
    totalFoodCollected: 250, // units
    totalMealsDistributed: 200,
    peopleServed: 180,
    completedDistributions: 45,
  },
};
