// ─── User & Auth ──────────────────────────────────────────────────
export type UserRole = 'CITIZEN' | 'ISIBO_LEADER' | 'VILLAGE_LEADER' | 'ADMIN';

export interface User {
  id:          string;
  fullName:    string;
  phoneNumber: string;
  role:        UserRole;
  villageId:   string;
  isiboId?:    string;
  isActive:    boolean;
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  tokenType:    'Bearer';
  expiresIn:    number;
  user:         User;
}

// ─── Activity ─────────────────────────────────────────────────────
export type ActivityType   = 'UMUGANDA' | 'IMIHIGO' | 'OTHER';
export type ActivityStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Activity {
  id:           string;
  villageId:    string;
  createdBy:    string;
  type:         ActivityType;
  title:        string;
  scheduledAt:  string;
  location?:    string;
  status:       ActivityStatus;
}

// ─── Attendance ───────────────────────────────────────────────────
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export interface AttendanceRecord {
  id:           string;
  activityId:   string;
  citizenId:    string;
  citizenName:  string;
  status:       AttendanceStatus;
  markedAt?:    string;
  syncedOffline: boolean;
}

// ─── Penalty ──────────────────────────────────────────────────────
export type PenaltyStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export interface Penalty {
  id:           string;
  citizenId:    string;
  citizenName:  string;
  activityId:   string;
  activityTitle: string;
  amountRwf:    number;
  reason?:      string;
  status:       PenaltyStatus;
  paymentId?:   string;
}

// ─── Payment ──────────────────────────────────────────────────────
export type PaymentMethod = 'MTN_MOMO' | 'AIRTEL_MONEY';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id:             string;
  payerId:        string;
  amountRwf:      number;
  paymentMethod:  PaymentMethod;
  externalTxId?:  string;
  status:         PaymentStatus;
  paidAt?:        string;
}

// ─── Service Request ──────────────────────────────────────────────
export type RequestType   = 'UBUDEHE' | 'ASSISTANCE' | 'DOCUMENT' | 'OTHER';
export type RequestStatus = 'PENDING' | 'INFO_REQUIRED' | 'APPROVED' | 'REJECTED';

export interface ServiceRequest {
  id:           string;
  citizenId:    string;
  citizenName:  string;
  type:         RequestType;
  description:  string;
  status:       RequestStatus;
  reviewedBy?:  string;
  response?:    string;
  createdAt:    string;
  updatedAt:    string;
}

// ─── Notification ─────────────────────────────────────────────────
export type NotificationChannel = 'PUSH' | 'SMS' | 'BOTH';

export interface Notification {
  id:          string;
  type:        string;
  message:     string;
  channel:     NotificationChannel;
  isRead:      boolean;
  createdAt:   string;
}

// ─── Emergency ────────────────────────────────────────────────────
export type EmergencyType   = 'FLOOD' | 'HEALTH' | 'FIRE' | 'OTHER';
export type EmergencyStatus = 'REPORTED' | 'VERIFIED' | 'BROADCAST' | 'RESOLVED';

export interface EmergencyReport {
  id:          string;
  reporterId:  string;
  type:        EmergencyType;
  description: string;
  status:      EmergencyStatus;
  createdAt:   string;
}

// ─── Admin Dashboard (US-7.1) ─────────────────────────────────────
export interface VillageKpi {
  villageId:             string;
  villageName:           string;
  attendanceRate:        number;
  paymentsCollectedRwf:  number;
  openServiceRequests:   number;
}

export interface AdminDashboardData {
  villages:            VillageKpi[];
  totalAttendanceRate: number;
  totalCollectedRwf:   number;
  totalOpenRequests:   number;
}

export interface VillageDrillDown {
  villageId:           string;
  villageName:         string;
  topPenalties:        { citizenName: string; amountRwf: number }[];
  lowAttendanceIsibs:  { isiboName: string; attendanceRate: number }[];
}

// ─── Audit Log (US-7.3) ───────────────────────────────────────────
export type AuditActionType =
  | 'ROLE_CHANGE'
  | 'PENALTY_ASSIGNED'
  | 'PAYMENT_CONFIRMED'
  | 'EMERGENCY_REPORTED'
  | 'USER_DEACTIVATED'
  | 'USER_ACTIVATED';

export interface AuditLogEntry {
  id:             string;
  actingUserId:   string;
  actingUserName: string;
  actionType:     AuditActionType;
  targetEntity:   string;
  beforeValue?:   string;
  afterValue?:    string;
  createdAt:      string;
}

export interface AuditLogParams {
  userId?:     string;
  actionType?: AuditActionType;
  page?:       number;
  size?:       number;
}

// ─── User Deactivate (US-7.2) ─────────────────────────────────────
export interface DeactivateUserPayload {
  userId: string;
}

// ─── Generic Pagination ───────────────────────────────────────────
export interface PageResponse<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  size:          number;
  number:        number;
}

// ─── API Response Envelope ────────────────────────────────────────
export interface ApiResponse<T> {
  success:   boolean;
  data:      T;
  message:   string;
  timestamp: string;
}

export interface ApiError {
  message:   string;
  status:    number;
  code:      string;
  timestamp: string;
}


// ─── Role Assignment (US-1.2) ─────────────────────────────────────
export interface UpdateRolePayload {
  userId: string;
  role:   UserRole;
}

export interface UserSearchParams {
  phone?: string;
  name?:  string;
  role?:  UserRole;
}

// ─── Activity Form & API (US-2.1) ────────────────────────────────
export interface CreateActivityPayload {
  title:       string;
  type:        ActivityType;
  scheduledAt: string;
  location:    string;
  villageId:   string;
}

export interface ActivitySearchParams {
  type?:    ActivityType;
  status?:  ActivityStatus;
  villageId?: string;
}

// ─── Activity Performance (US-2.4) ───────────────────────────────
export interface IsiboAttendance {
  isiboId:      string;
  isiboName:    string;
  totalInvited: number;
  totalPresent: number;
  totalAbsent:  number;
  percentage:   number;
}

export interface ActivityPerformance {
  activityId:        string;
  activityTitle:     string;
  totalInvited:      number;
  totalPresent:      number;
  totalAbsent:       number;
  participationRate: number;
  isiboBreakdown:    IsiboAttendance[];
}

// ─── Penalties (US-3.1) ───────────────────────────────────────────
export interface AssignPenaltyPayload {
  citizenId:  string;
  activityId: string;
  amountRwf:  number;
  reason?:    string;
}

export interface ExemptionPayload {
  citizenId:  string;
  activityId: string;
  reason:     string;
}

export interface PenaltySearchParams {
  citizenId?:  string;
  activityId?: string;
  status?:     PenaltyStatus;
}

// ─── Penalties View (US-3.2 & US-3.3) ────────────────────────────
export interface CitizenPenaltyView {
  id:            string;
  activityTitle: string;
  amountRwf:     number;
  status:        PenaltyStatus;
  reason?:       string;
  paidAt?:       string;
}

export interface HouseholdPenaltySummary {
  householdId:      string;
  householdName:    string;
  totalOutstanding: number;
  unpaidCount:      number;
  penalties:        Penalty[];
}

export interface IsiboPenaltyOverview {
  isiboId:    string;
  isiboName:  string;
  households: HouseholdPenaltySummary[];
}