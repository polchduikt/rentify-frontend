export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    google: '/auth/google',
  },
  users: {
    profile: '/users/profile',
    publicProfile: (userId: number) => `/users/${userId}/public`,
    changePassword: '/users/profile/password',
    avatar: '/users/profile/avatar',
  },
  bookings: {
    root: '/bookings',
    mine: '/bookings/my',
    incoming: '/bookings/incoming',
    byId: (id: number) => `/bookings/${id}`,
    cancel: (id: number) => `/bookings/${id}/cancel`,
    confirm: (id: number) => `/bookings/${id}/confirm`,
    reject: (id: number) => `/bookings/${id}/reject`,
  },
  conversations: {
    root: '/conversations',
    sendToProperty: (propertyId: number) => `/conversations/property/${propertyId}`,
    reply: (conversationId: number) => `/conversations/${conversationId}/reply`,
    messages: (conversationId: number) => `/conversations/${conversationId}/messages`,
  },
  favorites: {
    root: '/favorites',
    byProperty: (propertyId: number) => `/favorites/${propertyId}`,
  },
  locations: {
    suggest: '/locations/suggest',
  },
  amenities: {
    root: '/amenities',
    grouped: '/amenities/grouped',
  },
  payments: {
    mine: '/payments/my',
    payBooking: (bookingId: number) => `/payments/bookings/${bookingId}/mock-pay`,
    byBooking: (bookingId: number) => `/payments/bookings/${bookingId}`,
  },
  promotions: {
    topPackages: '/promotions/top-packages',
    subscriptionPackages: '/promotions/subscription-packages',
    purchaseTopForProperty: (propertyId: number) => `/promotions/properties/${propertyId}/top`,
    purchaseSubscription: '/promotions/subscription',
  },
  properties: {
    root: '/properties',
    mine: '/properties/my',
    search: '/properties/search',
    byId: (id: number) => `/properties/${id}`,
    photos: (id: number) => `/properties/${id}/photos`,
    photoById: (id: number, photoId: number) => `/properties/${id}/photos/${photoId}`,
    availability: (propertyId: number) => `/properties/${propertyId}/availability`,
    unavailableRanges: (propertyId: number) => `/properties/${propertyId}/availability/unavailable`,
    availabilityBlockById: (propertyId: number, blockId: number) =>
      `/properties/${propertyId}/availability/${blockId}`,
    status: (id: number) => `/properties/${id}/status`,
  },
  reviews: {
    root: '/reviews',
    byProperty: (propertyId: number) => `/reviews/property/${propertyId}`,
  },
  wallet: {
    root: '/wallet',
    topUp: '/wallet/top-up',
    transactions: '/wallet/transactions',
    topUpOptions: '/wallet/top-up-options',
  },
} as const;
