export interface Trip {
  id: string;
  title: string;
  location: string;
  image: string;
  isPopular?: boolean;
  description?: string;
}

export type Page = 'landing' | 'login' | 'signup' | 'recovery' | 'verify' | 'reset-password' | 'dashboard' | 'profile' | 'admin' | 'monitoring' | 'planner' | 'booking-management' | 'checkout' | 'review' | 'system-pulse' | 'system-config' | 'ai-config' | 'system-audit' | 'hotel-inventory' | 'destination-assets';

export interface CheckoutItem {
  id: string;
  name: string;
  type: 'flight' | 'hotel' | 'addon';
  price: number;
  details?: string;
  image?: string;
  date?: string;
  duration?: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Customer';
  status: 'Active' | 'Locked';
  createdAt: any;
  lastLogin?: any;
  isVerified: boolean;
  phoneNumber?: string;
  location?: string;
  travelTier?: string;
  voyagerMiles?: number;
  cabinPreference?: 'Economy' | 'Premium Economy' | 'Business Class' | 'First Class';
  dietary?: string;
  bedType?: string;
  aiConciergeMode?: boolean;
  avatarUrl?: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  pricePerNight: number;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED';
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  status: 'Active' | 'Pending Audit' | 'Maintenance';
  image: string;
  description: string;
}

export interface Attraction {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  status: 'Active' | 'Pending Audit' | 'Maintenance';
  image: string;
  description: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  assetId: string;
  assetName: string;
  assetType: 'hotel' | 'restaurant' | 'attraction';
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  amount?: number;
  hasReview?: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  rating: number;
  highlights: string[];
  comment: string;
  createdAt: any;
}

export type DashboardTab = 'hotels' | 'restaurants' | 'attractions' | 'bookings' | 'planner';

export interface SystemSettings {
  profitMarkup: number;
  defaultCurrency: string;
  exchangeRates: {
    id: string;
    pair: string;
    rate: number;
    change: string;
    isOverride: boolean;
  }[];
  stripeApiKey: string;
  stripeWebhookSecret: string;
  paypalClientId: string;
  paypalSecret: string;
  lastSecretRotation?: any;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
