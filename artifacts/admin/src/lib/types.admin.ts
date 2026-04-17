/**
 * Admin Panel Type Definitions
 * Replaces 100+ instances of `any` type throughout the codebase
 * Provides full type safety for API responses, state management, and UI components
 */

/* ── Vendor Types ── */
export interface Vendor {
  id: string;
  name: string;
  phone: string;
  email: string;
  walletAddress?: string;
  wallet?: {
    balance: number;
    locked: number;
    total: number;
  };
  status: "active" | "suspended" | "blocked";
  createdAt: string;
  updatedAt: string;
  city?: string;
  rating?: number;
  commissionRate?: number;
}

export interface VendorWalletTransaction {
  id: string;
  vendorId: string;
  amount: number;
  type: "credit" | "debit";
  reason?: string;
  createdAt: string;
}

/* ── Rider Types ── */
export interface Rider {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  wallet?: {
    balance: number;
    locked: number;
    total: number;
  };
  status: "active" | "suspended" | "banned";
  isOnline: boolean;
  currentStatus: "offline" | "online" | "busy";
  vehicleType?: string;
  currentTripId?: string;
  location?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  lastSeen?: string;
  batteryLevel?: number;
}

export interface RiderWalletTransaction {
  id: string;
  riderId: string;
  amount: number;
  type: "credit" | "debit";
  reason?: string;
  createdAt: string;
}

/* ── Order Types ── */
export interface Order {
  id: string;
  orderId: string;
  status: "pending" | "accepted" | "picked_up" | "delivered" | "cancelled";
  customerId: string;
  riderId?: string;
  vendorId?: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  deliveryLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

/* ── GPS & Location Types ── */
export interface GpsAlert {
  id: string;
  userId: string;
  userName?: string;
  type: "spoofing" | "speed" | "geofence" | "battery";
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  status: "open" | "resolved" | "ignored";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface GpsViolation {
  id: string;
  riderId: string;
  violationType: "speed_limit" | "geofence_exit" | "battery_low" | "signal_loss";
  latitude: number;
  longitude: number;
  timestamp: string;
  details?: Record<string, any>;
}

/* ── SOS Alert Types ── */
export interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  phone?: string;
  rideId?: string;
  latitude: number;
  longitude: number;
  status: "active" | "resolved" | "false_alarm";
  sentAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  emergencyContacts?: Array<{ name: string; phone: string }>;
}

/* ── Withdrawal Types ── */
export interface Withdrawal {
  id: string;
  userId: string;
  userType: "rider" | "vendor";
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  refNo?: string;
  note?: string;
}

export interface WithdrawalApprovalData {
  id: string;
  refNo: string;
  note?: string;
}

export interface WithdrawalRejectData {
  id: string;
  reason: string;
}

/* ── Delivery Access Types ── */
export interface DeliveryAccess {
  id: string;
  userId: string;
  accessType: "delivery_partner" | "vendor";
  zones: string[];
  grantedAt: string;
  grantedBy?: string;
  expiresAt?: string;
  status: "active" | "suspended" | "expired";
}

export interface WhitelistEntry {
  id: string;
  userId: string;
  userType: "rider" | "vendor";
  grantedAt: string;
  grantedBy: string;
  zones?: string[];
  permissions?: string[];
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, [any, any]>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/* ── Parcel Types ── */
export interface ParcelBooking {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  cost: number;
  createdAt: string;
  deliveredAt?: string;
  trackingEvents?: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: { lat: number; lng: number } |undefined;
  note?: string;
}

/* ── Account Conditions Types ── */
export interface AccountCondition {
  id: string;
  userId: string;
  userType: "rider" | "vendor" | "customer";
  conditionType: "suspension" | "warning" | "restriction" | "ban";
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  startDate: string;
  endDate?: string;
  actions: ConditionAction[];
  appliedBy?: string;
  notes?: string;
}

export interface ConditionAction {
  type: "restrict_orders" | "disable_wallet" | "disable_location" | "disable_communication";
  enabled: boolean;
  expiresAt?: string;
}

/* ── Security/Auth Types ── */
export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  resourceId?: string;
  resourceType?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: "success" | "failure";
  errorMessage?: string;
}

export interface PlatformSetting {
  key: string;
  value: string;
  category: string;
  description?: string;
  updatedAt: string;
  updatedBy?: string;
  type?: "string" | "number" | "boolean" | "json";
}

export interface ServiceConfig {
  id: string;
  serviceName: string;
  enabled: boolean;
  config: Record<string, any>;
  updatedAt: string;
  updatedBy?: string;
}

export interface SecurityDashboard {
  activeAdmins: number;
  recentActivity: AdminLog[];
  alertsCount: number;
  failedLogins: number;
  ipBlockCount: number;
  suspiciousActivity: AdminLog[];
}

export interface LoginLockout {
  phone: string;
  attempts: number;
  lastAttempt: string;
  lockedUntil: string;
  reason?: string;
}

export interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  blockedBy?: string;
  unblockAt?: string;
  status: "active" | "expired";
}

export interface SecurityEvent {
  id: string;
  eventType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: string;
  sourceIP?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/* ── API Response Wrappers ── */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp: string;
}

export interface ListApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/* ── Filter/Query Types ── */
export interface QueryFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

/* ── Error Handling ── */
export interface AppError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
}
