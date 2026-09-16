import {
  User,
  Student,
  Hostel,
  Block,
  Room,
  Bed,
  Allocation,
  RoomTransfer,
  Fee,
  Payment,
  Complaint,
  LeaveRequest,
  Visitor,
  Attendance,
  Announcement,
  Notification,
  InventoryItem,
  AuditLog,
  DashboardStats,
  MealPrediction,
  FoodPreparation,
  MealAttendance,
  FoodWasteInsight,
  FoodWasteSettings
} from '../types/index.ts';

const BASE_URL = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('campushostel_auth_token') || '';
  const userId = localStorage.getItem('campushostel_user_id') || '';

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
    authHeaders['x-auth-token'] = token;
  }
  if (userId) {
    authHeaders['x-user-id'] = userId;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Dedicated Role-Based Authentication
  studentSignUp: (data: any) =>
    fetchJSON<{ success: boolean; message: string; user: User; student: Student }>(`${BASE_URL}/student/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  studentLogin: (email: string, password?: string) =>
    fetchJSON<{ success: boolean; user: User; token: string; message?: string }>(`${BASE_URL}/student/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  wardenSignUp: (data: any) =>
    fetchJSON<{ success: boolean; message: string; user: User; wardenProfile: any }>(`${BASE_URL}/warden/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  wardenLogin: (email: string, password?: string) =>
    fetchJSON<{ success: boolean; user: User; token: string; message?: string }>(`${BASE_URL}/warden/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  adminSignUp: (data: any) =>
    fetchJSON<{ success: boolean; message: string; user: User; adminProfile: any }>(`${BASE_URL}/admin/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminLogin: (email: string, password?: string) =>
    fetchJSON<{ success: boolean; user: User; token: string; message?: string }>(`${BASE_URL}/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Demo Accounts & Fast Login
  getDemoAccounts: () =>
    fetchJSON<{
      success: boolean;
      accounts: {
        student: { name: string; role: 'student'; email: string; password: string; tag: string; description: string; details: any };
        warden: { name: string; role: 'warden'; email: string; password: string; tag: string; description: string; details: any };
        admin: { name: string; role: 'admin'; email: string; password: string; tag: string; description: string; details: any };
      };
    }>(`${BASE_URL}/auth/demo-accounts`),

  demoLogin: (role: 'student' | 'warden' | 'admin') =>
    fetchJSON<{ success: boolean; user: User; token: string; message?: string }>(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // Legacy/Fallback Auth
  login: (email: string, password?: string) =>
    fetchJSON<{ success: boolean; user: User; token: string; message?: string }>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    fetchJSON<{ success: boolean; message: string }>(`${BASE_URL}/auth/logout`, {
      method: 'POST',
    }),

  forgotPassword: (email: string) =>
    fetchJSON<{ success: boolean; message: string }>(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getCurrentUser: (userId?: string) =>
    fetchJSON<{ success: boolean; user: User }>(`${BASE_URL}/auth/me${userId ? `?userId=${userId}` : ''}`),

  getUsers: () =>
    fetchJSON<{ success: boolean; users: User[] }>(`${BASE_URL}/users`),

  // Students
  getStudents: (params?: { query?: string; department?: string; gender?: string; year?: number | string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.query) q.set('query', params.query);
    if (params?.department) q.set('department', params.department);
    if (params?.gender) q.set('gender', params.gender);
    if (params?.year) q.set('year', String(params.year));
    if (params?.status) q.set('status', params.status);
    return fetchJSON<{ success: boolean; students: (Student & { user?: User; currentAllocation?: Allocation })[]; total: number }>(
      `${BASE_URL}/students?${q.toString()}`
    );
  },

  getStudentDetails: (id: string) =>
    fetchJSON<{ success: boolean; student: Student & { user?: User; currentAllocation?: Allocation; allocationHistory: Allocation[]; transfers: RoomTransfer[]; fees: Fee[]; payments: Payment[]; complaints: Complaint[]; leaves: LeaveRequest[]; attendance: Attendance[]; visitors: Visitor[] } }>(
      `${BASE_URL}/students/${id}`
    ),

  createStudent: (data: any) =>
    fetchJSON<{ success: boolean; student: Student; user: User }>(`${BASE_URL}/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStudent: (id: string, data: Partial<Student & { name?: string; phone?: string }>) =>
    fetchJSON<{ success: boolean; student: Student }>(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteStudent: (id: string) =>
    fetchJSON<{ success: boolean; message: string }>(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
    }),

  // Hostels & Structure
  getHostels: () =>
    fetchJSON<{ success: boolean; hostels: Hostel[] }>(`${BASE_URL}/hostels`),

  createHostel: (data: Partial<Hostel>) =>
    fetchJSON<{ success: boolean; hostel: Hostel }>(`${BASE_URL}/hostels`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBlocks: (hostelId?: string) =>
    fetchJSON<{ success: boolean; blocks: Block[] }>(`${BASE_URL}/blocks${hostelId ? `?hostelId=${hostelId}` : ''}`),

  createBlock: (data: Partial<Block>) =>
    fetchJSON<{ success: boolean; block: Block }>(`${BASE_URL}/blocks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRooms: (params?: { hostelId?: string; blockId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.hostelId) q.set('hostelId', params.hostelId);
    if (params?.blockId) q.set('blockId', params.blockId);
    if (params?.status) q.set('status', params.status);
    return fetchJSON<{ success: boolean; rooms: (Room & { beds?: Bed[] })[] }>(`${BASE_URL}/rooms?${q.toString()}`);
  },

  createRoom: (data: { hostelId: string; blockId: string; roomNumber: string; floor: number; roomType: string; capacity: number }) =>
    fetchJSON<{ success: boolean; room: Room }>(`${BASE_URL}/rooms`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBeds: (params?: { roomId?: string; hostelId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.roomId) q.set('roomId', params.roomId);
    if (params?.hostelId) q.set('hostelId', params.hostelId);
    if (params?.status) q.set('status', params.status);
    return fetchJSON<{ success: boolean; beds: Bed[] }>(`${BASE_URL}/beds?${q.toString()}`);
  },

  // Allocations & Transfers
  getAllocations: (params?: { status?: string; studentId?: string; hostelId?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.studentId) q.set('studentId', params.studentId);
    if (params?.hostelId) q.set('hostelId', params.hostelId);
    return fetchJSON<{ success: boolean; allocations: Allocation[]; total: number }>(`${BASE_URL}/allocations?${q.toString()}`);
  },

  allocateStudent: (data: { studentId: string; hostelId: string; blockId: string; roomId: string; bedId: string; allocatedBy?: string; reason?: string }) =>
    fetchJSON<{ success: boolean; allocation: Allocation; message: string }>(`${BASE_URL}/allocations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deallocateStudent: (allocationId: string, deallocatedBy: string, reason?: string) =>
    fetchJSON<{ success: boolean; allocation: Allocation; message: string }>(`${BASE_URL}/allocations/${allocationId}/deallocate`, {
      method: 'PUT',
      body: JSON.stringify({ deallocatedBy, reason }),
    }),

  getTransfers: (params?: { status?: string; studentId?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.studentId) q.set('studentId', params.studentId);
    return fetchJSON<{ success: boolean; transfers: RoomTransfer[] }>(`${BASE_URL}/transfers?${q.toString()}`);
  },

  requestTransfer: (data: { studentId: string; newHostelId: string; newBlockId: string; newRoomId: string; newBedId: string; reason: string; requestedBy: string }) =>
    fetchJSON<{ success: boolean; transfer: RoomTransfer; message: string }>(`${BASE_URL}/transfers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approveTransfer: (id: string, approvedBy: string) =>
    fetchJSON<{ success: boolean; transfer: RoomTransfer; message: string }>(`${BASE_URL}/transfers/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approvedBy }),
    }),

  rejectTransfer: (id: string, rejectedBy: string, reason?: string) =>
    fetchJSON<{ success: boolean; transfer: RoomTransfer; message: string }>(`${BASE_URL}/transfers/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectedBy, reason }),
    }),

  // Fees & Payments
  getFees: (params?: { studentId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.set('studentId', params.studentId);
    if (params?.status) q.set('status', params.status);
    return fetchJSON<{ success: boolean; fees: Fee[] }>(`${BASE_URL}/fees?${q.toString()}`);
  },

  createFee: (data: Partial<Fee>) =>
    fetchJSON<{ success: boolean; fee: Fee }>(`${BASE_URL}/fees`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPayments: (params?: { studentId?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.set('studentId', params.studentId);
    return fetchJSON<{ success: boolean; payments: Payment[] }>(`${BASE_URL}/payments?${q.toString()}`);
  },

  recordPayment: (data: { studentId: string; feeId: string; amount: number; paymentMethod: string }) =>
    fetchJSON<{ success: boolean; payment: Payment; fee: Fee }>(`${BASE_URL}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Complaints
  getComplaints: (params?: { studentId?: string; status?: string; category?: string; priority?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.set('studentId', params.studentId);
    if (params?.status) q.set('status', params.status);
    if (params?.category) q.set('category', params.category);
    if (params?.priority) q.set('priority', params.priority);
    return fetchJSON<{ success: boolean; complaints: Complaint[] }>(`${BASE_URL}/complaints?${q.toString()}`);
  },

  createComplaint: (data: { studentId: string; title: string; description: string; category?: string; priority?: string }) =>
    fetchJSON<{ success: boolean; complaint: Complaint }>(`${BASE_URL}/complaints`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateComplaint: (id: string, data: Partial<Complaint>) =>
    fetchJSON<{ success: boolean; complaint: Complaint }>(`${BASE_URL}/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Leaves
  getLeaves: (params?: { studentId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.set('studentId', params.studentId);
    if (params?.status) q.set('status', params.status);
    return fetchJSON<{ success: boolean; leaves: LeaveRequest[] }>(`${BASE_URL}/leaves?${q.toString()}`);
  },

  createLeave: (data: Partial<LeaveRequest>) =>
    fetchJSON<{ success: boolean; leave: LeaveRequest; message: string }>(`${BASE_URL}/leaves`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approveLeave: (id: string, approvedBy: string, approverName: string) =>
    fetchJSON<{ success: boolean; leave: LeaveRequest; message: string }>(`${BASE_URL}/leaves/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approvedBy, approverName }),
    }),

  rejectLeave: (id: string, rejectedBy: string) =>
    fetchJSON<{ success: boolean; leave: LeaveRequest; message: string }>(`${BASE_URL}/leaves/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectedBy }),
    }),

  // Visitors
  getVisitors: () =>
    fetchJSON<{ success: boolean; visitors: Visitor[] }>(`${BASE_URL}/visitors`),

  createVisitor: (data: Partial<Visitor>) =>
    fetchJSON<{ success: boolean; visitor: Visitor }>(`${BASE_URL}/visitors`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkoutVisitor: (id: string) =>
    fetchJSON<{ success: boolean; visitor: Visitor }>(`${BASE_URL}/visitors/${id}/checkout`, {
      method: 'PUT',
    }),

  // Attendance
  getAttendance: (params?: { date?: string; hostelId?: string }) => {
    const q = new URLSearchParams();
    if (params?.date) q.set('date', params.date);
    if (params?.hostelId) q.set('hostelId', params.hostelId);
    return fetchJSON<{ success: boolean; attendance: Attendance[] }>(`${BASE_URL}/attendance?${q.toString()}`);
  },

  saveAttendance: (records: Partial<Attendance>[]) =>
    fetchJSON<{ success: boolean; count: number; message: string }>(`${BASE_URL}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ records }),
    }),

  // Announcements & Notifications
  getAnnouncements: () =>
    fetchJSON<{ success: boolean; announcements: Announcement[] }>(`${BASE_URL}/announcements`),

  createAnnouncement: (data: Partial<Announcement>) =>
    fetchJSON<{ success: boolean; announcement: Announcement }>(`${BASE_URL}/announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getNotifications: (userId: string) =>
    fetchJSON<{ success: boolean; notifications: Notification[] }>(`${BASE_URL}/notifications?userId=${userId}`),

  markNotificationRead: (id: string) =>
    fetchJSON<{ success: boolean; notification: Notification }>(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
    }),

  // Inventory & Audit Logs
  getInventory: () =>
    fetchJSON<{ success: boolean; inventory: InventoryItem[] }>(`${BASE_URL}/inventory`),

  createInventory: (data: Partial<InventoryItem>) =>
    fetchJSON<{ success: boolean; item: InventoryItem }>(`${BASE_URL}/inventory`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAuditLogs: () =>
    fetchJSON<{ success: boolean; auditLogs: AuditLog[] }>(`${BASE_URL}/audit-logs`),

  // Dashboard Stats
  getDashboardStats: () =>
    fetchJSON<{ success: boolean; stats: DashboardStats }>(`${BASE_URL}/dashboard/stats`),

  // Food Wastage (Section 37)
  getFoodWasteDashboard: (date?: string) =>
    fetchJSON<{
      success: boolean;
      date: string;
      predictions: MealPrediction[];
      recentPreparations: FoodPreparation[];
      insights: FoodWasteInsight[];
      accuracy: { mae: number; rmse: number; mape: number; sampleSize: number };
      settings: FoodWasteSettings;
    }>(`${BASE_URL}/food-waste/dashboard${date ? `?date=${date}` : ''}`),

  getFoodWastePredictions: (date?: string) =>
    fetchJSON<{ success: boolean; date: string; predictions: MealPrediction[] }>(`${BASE_URL}/food-waste/predictions${date ? `?date=${date}` : ''}`),

  recordFoodPreparation: (data: Partial<FoodPreparation>) =>
    fetchJSON<{ success: boolean; preparation: FoodPreparation; message: string }>(`${BASE_URL}/food-waste/preparations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMealAttendance: (params?: { studentId?: string; date?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.set('studentId', params.studentId);
    if (params?.date) q.set('date', params.date);
    return fetchJSON<{ success: boolean; mealAttendance: MealAttendance[] }>(`${BASE_URL}/food-waste/meal-attendance?${q.toString()}`);
  },

  setMealOptIn: (data: { studentId: string; studentName?: string; date: string; mealType: string; status: 'eating' | 'not_eating' }) =>
    fetchJSON<{ success: boolean; mealAttendance: MealAttendance; message: string }>(`${BASE_URL}/food-waste/meal-attendance`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getIngredientEstimate: (servings: number, mealType: string) =>
    fetchJSON<{ success: boolean; servings: number; mealType: string; ingredients: Array<{ ingredient: string; quantity: number; unit: string; costPerUnit: number; estimatedCost: number }> }>(
      `${BASE_URL}/food-waste/ingredients-estimate?servings=${servings}&mealType=${mealType}`
    ),

  updateFoodWasteSettings: (settings: Partial<FoodWasteSettings>) =>
    fetchJSON<{ success: boolean; settings: FoodWasteSettings; message: string }>(`${BASE_URL}/food-waste/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // AI Services
  classifyComplaintWithAI: (title: string, description: string) =>
    fetchJSON<{ success: boolean; analysis: { category: string; priority: string; suggestedAction: string; summary: string } }>(
      `${BASE_URL}/ai/classify-complaint`,
      {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      }
    ),

  getHostelAIInsights: () =>
    fetchJSON<{ success: boolean; insights: string[] }>(`${BASE_URL}/ai/hostel-insights`),

  getFoodWasteAIAdvice: (mealType: string, date?: string) =>
    fetchJSON<{ success: boolean; advice: { headline: string; advice: string; actionablePoints: string[] } }>(
      `${BASE_URL}/ai/food-advice`,
      {
        method: 'POST',
        body: JSON.stringify({ mealType, date }),
      }
    ),

  askCampusAIAssistant: (question: string, studentName?: string) =>
    fetchJSON<{ success: boolean; reply: string }>(`${BASE_URL}/ai/faq-chat`, {
      method: 'POST',
      body: JSON.stringify({ question, studentName }),
    }),

  // Database Reset
  resetDatabase: () =>
    fetchJSON<{ success: boolean; message: string }>(`${BASE_URL}/database/reset`, { method: 'POST' }),
};
