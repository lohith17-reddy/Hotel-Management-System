export type UserRole = 'admin' | 'warden' | 'staff' | 'student';
export type UserStatus = 'active' | 'inactive' | 'disabled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  hostelId?: string; // For warden or student assigned hostel
  createdAt: string;
  updatedAt: string;
}

export interface WardenProfile {
  id: string;
  userId: string;
  employeeId: string;
  hostelAssigned: string;
  qualification: string;
  experience: string;
  createdAt: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  adminId: string;
  organization: string;
  accessLevel: string;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  registrationNumber: string;
  rollNumber: string;
  department: string;
  course: string;
  year: number;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  emergencyContact: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  // Joined fields for convenience
  user?: User;
  currentAllocation?: Allocation;
}

export interface Hostel {
  id: string;
  name: string;
  hostelCode: string;
  gender: 'male' | 'female' | 'co-ed';
  address: string;
  numberOfBlocks: number;
  status: 'active' | 'maintenance' | 'inactive';
  wardenId?: string;
  wardenName?: string;
  capacity: number;
  occupancy: number;
}

export interface Block {
  id: string;
  hostelId: string;
  name: string;
  floors: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export type RoomType = 'single' | 'double' | 'triple' | 'quad';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface Room {
  id: string;
  hostelId: string;
  blockId: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  capacity: number;
  occupiedBeds: number;
  status: RoomStatus;
}

export interface Bed {
  id: string;
  hostelId: string;
  blockId: string;
  roomId: string;
  bedNumber: string; // e.g. 'A', 'B', '1', '2'
  status: 'available' | 'occupied' | 'maintenance';
  currentStudentId?: string;
  currentStudentName?: string;
}

export type AllocationStatus = 'active' | 'transferred' | 'deallocated' | 'completed';

export interface Allocation {
  id: string;
  studentId: string;
  studentName?: string;
  registrationNumber?: string;
  hostelId: string;
  hostelName?: string;
  blockId: string;
  blockName?: string;
  roomId: string;
  roomNumber?: string;
  bedId: string;
  bedNumber?: string;
  allocationDate: string;
  deallocationDate?: string;
  status: AllocationStatus;
  reason?: string;
  allocatedBy?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface RoomTransfer {
  id: string;
  studentId: string;
  studentName?: string;
  oldHostelId: string;
  oldHostelName?: string;
  oldBlockId: string;
  oldBlockName?: string;
  oldRoomId: string;
  oldRoomNumber?: string;
  oldBedId: string;
  oldBedNumber?: string;
  newHostelId: string;
  newHostelName?: string;
  newBlockId: string;
  newBlockName?: string;
  newRoomId: string;
  newRoomNumber?: string;
  newBedId: string;
  newBedNumber?: string;
  requestedBy: string;
  approvedBy?: string;
  requestDate: string;
  approvalDate?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type FeeType = 'hostel_rent' | 'mess_fee' | 'amenities' | 'security_deposit' | 'maintenance';
export type FeeStatus = 'pending' | 'paid' | 'partially_paid' | 'overdue';

export interface Fee {
  id: string;
  studentId: string;
  studentName?: string;
  feeType: FeeType;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: FeeStatus;
  semester: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  feeId: string;
  feeType?: FeeType;
  amount: number;
  paymentDate: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cash';
  transactionId: string;
  receiptNumber: string;
  status: 'success' | 'pending' | 'failed';
}

export type ComplaintCategory = 'electrical' | 'plumbing' | 'internet' | 'cleaning' | 'furniture' | 'food' | 'security' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplaintStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';

export interface Complaint {
  id: string;
  studentId: string;
  studentName?: string;
  hostelId?: string;
  hostelName?: string;
  roomId?: string;
  roomNumber?: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: Priority;
  status: ComplaintStatus;
  assignedTo?: string; // staff user id
  assignedStaffName?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRequest {
  id: string;
  studentId?: string;
  studentName?: string;
  hostelId: string;
  roomId?: string;
  roomNumber?: string;
  category: string;
  description: string;
  priority: Priority;
  assignedStaff?: string;
  assignedStaffName?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface Visitor {
  id: string;
  studentId: string;
  studentName?: string;
  studentRoom?: string;
  visitorName: string;
  relationship: string;
  phone: string;
  purpose: string;
  idProofNumber?: string;
  entryTime: string;
  exitTime?: string;
  status: 'expected' | 'checked_in' | 'checked_out';
  approvedBy?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string;
  hostelId: string;
  roomNumber?: string;
  date: string;
  status: 'present' | 'absent' | 'on_leave';
  markedBy: string;
  remarks?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName?: string;
  hostelId?: string;
  roomNumber?: string;
  startDate: string;
  endDate: string;
  reason: string;
  destination: string;
  emergencyContact: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approverName?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'student' | 'warden' | 'staff';
  hostelId?: string; // null means all hostels
  priority: 'normal' | 'important' | 'urgent';
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'allocation' | 'transfer' | 'complaint' | 'leave' | 'fee' | 'food' | 'general';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  hostelId: string;
  hostelName?: string;
  itemName: string;
  category: 'furniture' | 'electrical' | 'sanitary' | 'bedding' | 'kitchen_equipment' | 'other';
  quantity: number;
  availableQuantity: number;
  condition: 'good' | 'fair' | 'needs_repair';
  location: string;
  lastAudited: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  timestamp: string;
}

// ----------------------------------------------------
// Section 37: Food Wastage Prediction & Management Types
// ----------------------------------------------------

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealAttendance {
  id: string;
  studentId: string;
  studentName?: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  status: 'eating' | 'not_eating';
  source: 'student_opt_in' | 'manual_staff' | 'leave_system';
  createdAt: string;
}

export interface MealPrediction {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  totalStudents: number;
  onLeaveStudents: number;
  studentOptInEating: number;
  studentOptInNotEating: number;
  predictedAttendance: number;
  recommendedQuantity: number; // includes safety buffer
  confidence: number; // e.g. 92%
  safetyBufferPercent: number; // e.g. 3%
  expectedWastage: number; // expected servings/kg
  expectedWastagePercent: number;
  modelVersion: string;
  createdAt: string;
}

export interface FoodPreparation {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodItem: string; // e.g. "Rice", "Dal", "Vegetable Curry", "Chapati"
  quantityPrepared: number;
  quantityServed: number;
  quantityConsumed: number;
  quantityWasted: number;
  wastePercentage: number;
  unit: 'kg' | 'servings' | 'liters' | 'pieces';
  studentsAttended: number;
  costPerUnit: number; // e.g. INR per unit
  totalCostWasted: number;
  reasonForWastage?: string;
  createdAt: string;
}

export interface FoodCost {
  id: string;
  foodItem: string;
  costPerUnit: number;
  unit: string;
  effectiveFrom: string;
}

export interface FoodWasteInsight {
  id: string;
  date: string;
  mealType?: MealType;
  insight: string;
  severity: 'info' | 'warning' | 'critical';
  estimatedWaste?: string;
  estimatedCost?: number;
  recommendation: string;
  createdAt: string;
}

export interface FoodWasteSettings {
  wasteThresholdPercent: number; // e.g. 10%
  safetyBufferPercent: number; // e.g. 3%
  predictionModel: 'WMA_LEAVE_ADJUSTED' | 'HYBRID_AI' | 'MOVING_AVG';
  mealTimings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalWardens: number;
  totalStaff: number;
  totalHostels: number;
  totalBlocks: number;
  totalRooms: number;
  occupiedRooms?: number;
  availableRooms?: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyPercentage: number;
  pendingComplaints: number;
  pendingLeaveRequests: number;
  pendingTransfers: number;
  pendingPaymentsAmount: number;
  pendingPaymentsCount: number;
  totalMaintenanceRequests: number;
  // Food wastage snapshot
  todayPredictedMeals: number;
  todayFoodWasteKg: number;
  todayFoodWasteCost: number;
  averageWastePercentage: number;
}
