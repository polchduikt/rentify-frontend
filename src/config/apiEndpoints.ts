export const API_ENDPOINTS = {
  auth: {
    login: '/sessions',
    register: '/users',
    google: '/sessions/google',
    logout: '/sessions/current',
  },
  users: {
    profile: '/users/me',
    publicProfile: (userId: number) => `/users/${userId}`,
    changePassword: '/users/me/password',
    avatar: '/users/me/avatar',
  },
  bookings: {
    root: '/bookings',
    list: '/bookings',
    byId: (id: number) => `/bookings/${id}`,
    update: (id: number) => `/bookings/${id}`,
  },
  conversations: {
    root: '/conversations',
    create: '/conversations',
    send: (conversationId: number) => `/conversations/${conversationId}/messages`,
    messages: (conversationId: number) => `/conversations/${conversationId}/messages`,
  },
  favorites: {
    root: '/users/me/favorites',
    byProperty: (propertyId: number) => `/users/me/favorites/${propertyId}`,
  },
  locations: {
    suggest: '/locations/suggest',
  },
  amenities: {
    root: '/amenities',
    grouped: '/amenities/grouped',
  },
  payments: {
    root: '/payments',
    byBooking: (bookingId: number) => `/bookings/${bookingId}/payments`,
  },
  promotions: {
    topPackages: '/promotion-packages/top',
    subscriptionPackages: '/promotion-packages/subscriptions',
    purchaseTopForProperty: (propertyId: number) => `/properties/${propertyId}/top-promotions`,
    purchaseSubscription: '/subscription-purchases',
  },
  properties: {
    root: '/properties',
    mine: '/properties/me',
    mapPins: '/properties/map-pins',
    byId: (id: number) => `/properties/${id}`,
    photos: (id: number) => `/properties/${id}/photos`,
    photoById: (id: number, photoId: number) => `/properties/${id}/photos/${photoId}`,
    availability: (propertyId: number) => `/properties/${propertyId}/availability-blocks`,
    unavailableRanges: (propertyId: number) => `/properties/${propertyId}/unavailable-date-ranges`,
    availabilityBlockById: (propertyId: number, blockId: number) =>
      `/properties/${propertyId}/availability-blocks/${blockId}`,
    status: (id: number) => `/properties/${id}`,
  },
  reviews: {
    root: '/reviews',
    byProperty: (propertyId: number) => `/properties/${propertyId}/reviews`,
  },
  wallet: {
    root: '/wallet',
    transactions: '/wallet/transactions',
    topUpOptions: '/wallet/transaction-amount-options',
  },
} as const;
