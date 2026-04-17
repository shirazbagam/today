/**
 * Global TypeScript Types & Interfaces
 * Eliminates need for 'any' type throughout the app
 */

// ============ Common Response Structures ============

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

// ============ User & Authentication ============

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: "admin" | "superadmin";
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
  expiresIn?: number;
}

export interface AuthToken {
  value: string;
  expiresAt: number;
  user?: AdminUser;
}

// ============ Riders ============

export interface Rider {
  userId: string;
  name: string;
  phone: string | null;
  email?: string;
  isOnline: boolean;
  vehicleType: string | null;
  city?: string | null;
  role?: string | null;
  lat: number;
  lng: number;
  updatedAt: string;
  ageSeconds: number;
  isFresh: boolean;
  action?: string | null;
  batteryLevel?: number | null;
  lastSeen?: string;
  lastActive?: string | null;
  currentTripId?: string | null;
  approvalStatus?: "pending" | "approved" | "rejected";
  walletBalance?: number;
  totalRides?: number;
  averageRating?: number;
  penalties?: RiderPenalty[];
}

export interface RiderPenalty {
  id: string;
  riderId: string;
  type: "warning" | "suspension" | "deactivation";
  reason: string;
  createdAt: string;
  expiresAt?: string;
}

export interface RiderLocation {
  userId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface RiderStatus {
  userId: string;
  isOnline: boolean;
  updatedAt: string;
  name?: string;
  batteryLevel?: number | null;
}

export interface RiderHeartbeat {
  userId: string;
  batteryLevel?: number | null;
  lastSeen: string;
}

export interface RiderTrail {
  latitude: number;
  longitude: number;
  createdAt: string;
  speed?: number;
  accuracy?: number;
}

// ============ Orders ============

export interface Order {
  id: string;
  customerId: string;
  riderId?: string;
  status: "pending" | "accepted" | "pickup" | "delivery" | "completed" | "cancelled";
  items: OrderItem[];
  total: number;
  paymentMethod: "cash" | "card" | "wallet";
  paymentStatus: "pending" | "completed" | "failed";
  deliveryAddress: Address;
  pickupAddress?: Address;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  latitude: number;
  longitude: number;
  postalCode?: string;
}

// ============ Rides ============

export interface Ride {
  id: string;
  customerId: string;
  riderId?: string;
  status: "pending" | "accepted" | "started" | "completed" | "cancelled";
  pickupLocation: RideLocation;
  dropoffLocation: RideLocation;
  distance?: number;
  duration?: number;
  fare?: number;
  paymentStatus?: "pending" | "completed";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  feedback?: RideFeedback;
}

export interface RideLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface RideFeedback {
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface RideAuditTrail {
  id: string;
  rideId: string;
  action: string;
  changedFields?: Record<string, unknown>;
  changedBy: string;
  changedAt: string;
}

// ============ Users/Customers ============

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: Address;
  status: "active" | "inactive" | "suspended" | "deleted";
  createdAt: string;
  kyc?: KYCData;
  totalOrders?: number;
  totalSpent?: number;
}

export interface KYCData {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  documents: KYCDocument[];
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface KYCDocument {
  type: string;
  url: string;
  label: string;
  uploadedAt: string;
}

// ============ SOS Alerts ============

export interface SosAlert {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  rideId?: string | null;
  sentAt: string;
  createdAt: string;
  body: string;
  title: string;
  sosStatus: "pending" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// ============ Dashboard ============

export interface DashboardStats {
  totalUsers: number;
  activeRiders: number;
  totalOrders: number;
  totalRevenue: number;
  totalDistance?: number;
  averageRating?: number;
  nextRideIn?: string;
  topCities?: CityStats[];
  topProducts?: ProductStats[];
}

export interface CityStats {
  city: string;
  orders: number;
  revenue: number;
  activeRiders: number;
}

export interface ProductStats {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

// ============ Settings ============

export interface SecurityDashboard {
  totalLoginAttempts: number;
  failedAttempts: number;
  lockedAccounts: number;
  suspiciousActivities: number;
  blocklistSize: number;
}

export interface LoginLockout {
  phone: string;
  attempts: number;
  lastAttempt: string;
  unlocksAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  admin: string;
  details?: Record<string, unknown>;
  timestamp: string;
  status: "success" | "failed";
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  user?: string;
  timestamp: string;
  resolved: boolean;
}

// ============ Broadcast & Notifications ============

export interface BroadcastMessage {
  id: string;
  title: string;
  body: string;
  target: "all" | "users" | "riders" | "vendors";
  sentAt: string;
  read: number;
  total?: number;
  template?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
}

// ============ Promo Codes ============

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  minOrderValue?: number;
}

// ============ Form State ============

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============ Error Types ============

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
  status?: number;
  timestamp: string;
  trackingId?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public trackingId?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationErrorClass extends AppError {
  constructor(
    message: string,
    public errors?: ValidationError[]
  ) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

// ============ Generic Utility Types ============

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFn<T = void> = () => Promise<T>;
export type RequestFn<Req, Res> = (data: Req) => Promise<Res>;

export interface LoadingState {
  isLoading: boolean;
  error: ErrorResponse | null;
  data: unknown;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
