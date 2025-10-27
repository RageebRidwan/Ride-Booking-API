export const ROLES = {
  ADMIN: "admin",
  RIDER: "rider",
  DRIVER: "driver",
} as const;

export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
  SUSPENDED: "suspended",
} as const;

export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const RIDE_STATUS = {
  REQUESTED: "requested",
  ACCEPTED: "accepted",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const FARE_CONFIG = {
  BASE_FARE: 50,
  PER_KM_RATE: 20,
} as const;

export const CANCEL_LIMITS = {
  MAX_ATTEMPTS: 3,
  RESET_WINDOW_HOURS: 24,
} as const;
