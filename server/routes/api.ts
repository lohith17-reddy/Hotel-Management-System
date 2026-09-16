import express from 'express';
import { db } from '../db/database.ts';
import { AuthService, DEMO_ACCOUNTS_INFO } from '../services/authService.ts';
import { AllocationService } from '../services/allocationService.ts';
import { FoodWasteService } from '../services/foodWasteService.ts';
import { GeminiService } from '../services/geminiService.ts';
import { DashboardStats, Student, User } from '../../src/types/index.ts';
import { authenticate, authorize, requireHostelAccess } from '../middleware/authMiddleware.ts';

export const apiRouter = express.Router();

// ----------------------------------------------------
// 1. AUTHENTICATION & USERS (ROLE-BASED & GENERAL)
// ----------------------------------------------------

// Student Auth
apiRouter.post('/student/signup', (req, res) => {
  const result = AuthService.studentSignUp(req.body);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.post('/student/login', (req, res) => {
  const { email, password } = req.body;
  const result = AuthService.studentLogin(email, password);
  if (!result.success) return res.status(401).json(result);
  res.json(result);
});

// Warden Auth
apiRouter.post('/warden/signup', (req, res) => {
  const result = AuthService.wardenSignUp(req.body);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.post('/warden/login', (req, res) => {
  const { email, password } = req.body;
  const result = AuthService.wardenLogin(email, password);
  if (!result.success) return res.status(401).json(result);
  res.json(result);
});

// Admin Auth
apiRouter.post('/admin/signup', (req, res) => {
  const result = AuthService.adminSignUp(req.body);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const result = AuthService.adminLogin(email, password);
  if (!result.success) return res.status(401).json(result);
  res.json(result);
});

// Demo Accounts & One-Click Demo Auth
apiRouter.get('/auth/demo-accounts', (_req, res) => {
  AuthService.ensureDemoAccounts();
  res.json({
    success: true,
    accounts: DEMO_ACCOUNTS_INFO,
  });
});

apiRouter.post('/auth/demo-login', (req, res) => {
  const { role } = req.body;
  if (!role || !['student', 'warden', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Valid role (student, warden, admin) is required for demo login.' });
  }
  const result = AuthService.demoLogin(role);
  if (!result.success) return res.status(401).json(result);
  res.json(result);
});

// Common Auth & Forgot Password
apiRouter.post('/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
  const result = AuthService.forgotPassword(email);
  res.json(result);
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = AuthService.getUserByEmail(email);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  if (user.role === 'student') return res.json(AuthService.studentLogin(email, password));
  if (user.role === 'warden') return res.json(AuthService.wardenLogin(email, password));
  if (user.role === 'admin') return res.json(AuthService.adminLogin(email, password));
  // Staff or other
  const result = AuthService.studentLogin(email, password);
  res.json(result);
});

apiRouter.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const tokenHeader = req.headers['x-auth-token'] as string;
  const userIdHeader = req.headers['x-user-id'] as string;
  const queryUserId = req.query.userId as string;

  let lookupId = userIdHeader || queryUserId;
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : tokenHeader;
  if (token && token.startsWith('jwt_')) {
    const parts = token.split('_');
    if (parts[1]) lookupId = parts[1];
  }

  if (!lookupId) {
    return res.status(401).json({ success: false, message: 'No active session found.' });
  }

  const user = AuthService.getUserById(lookupId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.status === 'disabled' || user.status === 'inactive') {
    return res.status(403).json({ success: false, message: 'Your account has been disabled. Please contact the administrator.' });
  }
  res.json({ success: true, user });
});

apiRouter.get('/users', (_req, res) => {
  res.json({ success: true, users: db.get('users') });
});

apiRouter.put('/users/:id', (req, res) => {
  try {
    const user = AuthService.updateUser(req.params.id, req.body);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// 2. STUDENTS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/students', (req, res) => {
  const { query, department, gender, year, status } = req.query;
  let students = db.get('students');
  const users = db.get('users');
  const allocations = db.get('allocations');

  // Join user info and current active allocation
  const enriched = students.map(s => {
    const u = users.find(user => user.id === s.userId);
    const activeAlloc = allocations.find(a => a.studentId === s.id && a.status === 'active');
    return {
      ...s,
      user: u,
      currentAllocation: activeAlloc,
    };
  });

  let filtered = enriched;

  if (query) {
    const q = (query as string).toLowerCase();
    filtered = filtered.filter(s =>
      s.user?.name.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.currentAllocation?.roomNumber?.toLowerCase().includes(q)
    );
  }

  if (department && department !== 'all') {
    filtered = filtered.filter(s => s.department === department);
  }
  if (gender && gender !== 'all') {
    filtered = filtered.filter(s => s.gender === gender);
  }
  if (year && year !== 'all') {
    filtered = filtered.filter(s => s.year === Number(year));
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(s => s.status === status);
  }

  res.json({ success: true, students: filtered, total: filtered.length });
});

apiRouter.get('/students/:id', (req, res) => {
  const student = db.get('students').find(s => s.id === req.params.id || s.userId === req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const user = db.get('users').find(u => u.id === student.userId);
  const allocations = db.get('allocations').filter(a => a.studentId === student.id);
  const activeAlloc = allocations.find(a => a.status === 'active');
  const fees = db.get('fees').filter(f => f.studentId === student.id);
  const payments = db.get('payments').filter(p => p.studentId === student.id);
  const complaints = db.get('complaints').filter(c => c.studentId === student.id);
  const leaves = db.get('leaveRequests').filter(l => l.studentId === student.id);
  const attendance = db.get('attendance').filter(at => at.studentId === student.id);
  const visitors = db.get('visitors').filter(v => v.studentId === student.id);
  const transfers = db.get('transfers').filter(t => t.studentId === student.id);

  res.json({
    success: true,
    student: {
      ...student,
      user,
      currentAllocation: activeAlloc,
      allocationHistory: allocations,
      transfers,
      fees,
      payments,
      complaints,
      leaves,
      attendance,
      visitors,
    }
  });
});

apiRouter.post('/students', (req, res) => {
  const {
    name,
    email,
    phone,
    registrationNumber,
    rollNumber,
    department,
    course,
    year,
    gender,
    dateOfBirth,
    guardianName,
    guardianPhone,
    address,
    emergencyContact
  } = req.body;

  const users = db.get('users');
  const students = db.get('students');

  // Check unique email and reg number
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'User with this email already exists' });
  }
  if (students.some(s => s.registrationNumber.toLowerCase() === registrationNumber.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Registration number already exists' });
  }

  // Create User
  const newUser: User = {
    id: `u-${Date.now()}`,
    name,
    email,
    phone,
    role: 'student',
    status: 'active',
    avatar: `https://images.unsplash.com/photo-${gender === 'female' ? '1534528741775-53994a69daeb' : '1506794778202-cad84cf45f1d'}?w=150&auto=format&fit=crop&q=80`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(newUser);
  db.set('users', users);

  // Create Student
  const newStudent: Student = {
    id: `s-${Date.now()}`,
    userId: newUser.id,
    registrationNumber,
    rollNumber,
    department,
    course: course || 'B.Tech',
    year: Number(year) || 1,
    gender,
    dateOfBirth,
    guardianName,
    guardianPhone,
    address,
    emergencyContact,
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'active',
  };
  students.push(newStudent);
  db.set('students', students);

  // Default initial fees for the term
  const fees = db.get('fees');
  fees.push(
    {
      id: `fee-${Date.now()}-1`,
      studentId: newStudent.id,
      studentName: name,
      feeType: 'hostel_rent',
      amount: 25000,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'pending',
      semester: 'Current Term',
      createdAt: new Date().toISOString(),
    },
    {
      id: `fee-${Date.now()}-2`,
      studentId: newStudent.id,
      studentName: name,
      feeType: 'mess_fee',
      amount: 18000,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'pending',
      semester: 'Current Term',
      createdAt: new Date().toISOString(),
    }
  );
  db.set('fees', fees);

  res.json({ success: true, student: newStudent, user: newUser });
});

apiRouter.put('/students/:id', (req, res) => {
  const students = db.get('students');
  const idx = students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Student not found' });

  const current = students[idx];
  const updatedStudent: Student = { ...current, ...req.body };
  students[idx] = updatedStudent;
  db.set('students', students);

  // Update associated user if name/phone provided
  if (req.body.name || req.body.phone) {
    const users = db.get('users');
    const uIdx = users.findIndex(u => u.id === current.userId);
    if (uIdx !== -1) {
      if (req.body.name) users[uIdx].name = req.body.name;
      if (req.body.phone) users[uIdx].phone = req.body.phone;
      users[uIdx].updatedAt = new Date().toISOString();
      db.set('users', users);
    }
  }

  res.json({ success: true, student: updatedStudent });
});

apiRouter.delete('/students/:id', (req, res) => {
  const students = db.get('students');
  const student = students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  student.status = 'inactive';
  db.set('students', students);

  // If active allocation exists, deallocate
  const allocations = db.get('allocations');
  const activeAlloc = allocations.find(a => a.studentId === student.id && a.status === 'active');
  if (activeAlloc) {
    AllocationService.deallocateStudent(activeAlloc.id, 'admin', 'Student deactivated/withdrawn');
  }

  res.json({ success: true, message: 'Student deactivated and room freed if occupied.' });
});

// ----------------------------------------------------
// 3. HOSTELS, BLOCKS, ROOMS & BEDS
// ----------------------------------------------------

apiRouter.get('/hostels', (_req, res) => {
  AllocationService.refreshOccupancies();
  res.json({ success: true, hostels: db.get('hostels') });
});

apiRouter.post('/hostels', (req, res) => {
  const hostels = db.get('hostels');
  const newHostel = {
    ...req.body,
    id: `h-${Date.now()}`,
    capacity: 0,
    occupancy: 0,
    status: req.body.status || 'active',
  };
  hostels.push(newHostel);
  db.set('hostels', hostels);
  res.json({ success: true, hostel: newHostel });
});

apiRouter.get('/blocks', (req, res) => {
  const { hostelId } = req.query;
  let blocks = db.get('blocks');
  if (hostelId) blocks = blocks.filter(b => b.hostelId === hostelId);
  res.json({ success: true, blocks });
});

apiRouter.post('/blocks', (req, res) => {
  const blocks = db.get('blocks');
  const newBlock = {
    ...req.body,
    id: `b-${Date.now()}`,
    status: 'active',
  };
  blocks.push(newBlock);
  db.set('blocks', blocks);
  res.json({ success: true, block: newBlock });
});

apiRouter.get('/rooms', (req, res) => {
  const { hostelId, blockId, status } = req.query;
  AllocationService.refreshOccupancies();
  let rooms = db.get('rooms');
  if (hostelId) rooms = rooms.filter(r => r.hostelId === hostelId);
  if (blockId) rooms = rooms.filter(r => r.blockId === blockId);
  if (status && status !== 'all') rooms = rooms.filter(r => r.status === status);

  const beds = db.get('beds');
  const enrichedRooms = rooms.map(r => ({
    ...r,
    beds: beds.filter(b => b.roomId === r.id),
  }));

  res.json({ success: true, rooms: enrichedRooms });
});

apiRouter.post('/rooms', (req, res) => {
  const { hostelId, blockId, roomNumber, floor, roomType, capacity } = req.body;
  const rooms = db.get('rooms');
  const beds = db.get('beds');

  // Check unique room in block
  if (rooms.some(r => r.blockId === blockId && r.roomNumber.toLowerCase() === roomNumber.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Room number already exists in this block' });
  }

  const newRoomId = `r-${Date.now()}`;
  const cap = Number(capacity) || 2;

  const newRoom = {
    id: newRoomId,
    hostelId,
    blockId,
    roomNumber,
    floor: Number(floor) || 1,
    roomType: roomType || 'double',
    capacity: cap,
    occupiedBeds: 0,
    status: 'available' as const,
  };
  rooms.push(newRoom);
  db.set('rooms', rooms);

  // Automatically generate beds for this room
  for (let i = 1; i <= cap; i++) {
    beds.push({
      id: `bed-${newRoomId}-${i}`,
      hostelId,
      blockId,
      roomId: newRoomId,
      bedNumber: `Bed ${i}`,
      status: 'available',
    });
  }
  db.set('beds', beds);
  AllocationService.refreshOccupancies();

  res.json({ success: true, room: newRoom });
});

apiRouter.get('/beds', (req, res) => {
  const { roomId, hostelId, status } = req.query;
  let beds = db.get('beds');
  if (roomId) beds = beds.filter(b => b.roomId === roomId);
  if (hostelId) beds = beds.filter(b => b.hostelId === hostelId);
  if (status && status !== 'all') beds = beds.filter(b => b.status === status);
  res.json({ success: true, beds });
});

// ----------------------------------------------------
// 4. ALLOCATIONS, TRANSFERS & DEALLOCATIONS
// ----------------------------------------------------

apiRouter.get('/allocations', (req, res) => {
  const { status, studentId, hostelId } = req.query;
  let allocations = db.get('allocations');
  if (status && status !== 'all') allocations = allocations.filter(a => a.status === status);
  if (studentId) allocations = allocations.filter(a => a.studentId === studentId);
  if (hostelId) allocations = allocations.filter(a => a.hostelId === hostelId);
  res.json({ success: true, allocations, total: allocations.length });
});

apiRouter.post('/allocations', (req, res) => {
  try {
    const allocation = AllocationService.allocateStudent(req.body);
    res.json({ success: true, allocation, message: 'Student successfully allocated to bed.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.put('/allocations/:id/deallocate', (req, res) => {
  try {
    const { deallocatedBy, reason } = req.body;
    const allocation = AllocationService.deallocateStudent(req.params.id, deallocatedBy || 'Admin', reason);
    res.json({ success: true, allocation, message: 'Student successfully deallocated.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.get('/transfers', (req, res) => {
  const { status, studentId } = req.query;
  let transfers = db.get('transfers');
  if (status && status !== 'all') transfers = transfers.filter(t => t.status === status);
  if (studentId) transfers = transfers.filter(t => t.studentId === studentId);
  res.json({ success: true, transfers });
});

apiRouter.post('/transfers', (req, res) => {
  try {
    const transfer = AllocationService.requestTransfer(req.body);
    res.json({ success: true, transfer, message: 'Room transfer request submitted for warden approval.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.put('/transfers/:id/approve', (req, res) => {
  try {
    const { approvedBy } = req.body;
    const transfer = AllocationService.approveTransfer(req.params.id, approvedBy || 'Warden');
    res.json({ success: true, transfer, message: 'Room transfer approved and student re-allocated.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.put('/transfers/:id/reject', (req, res) => {
  try {
    const { rejectedBy, reason } = req.body;
    const transfer = AllocationService.rejectTransfer(req.params.id, rejectedBy || 'Warden', reason);
    res.json({ success: true, transfer, message: 'Room transfer rejected.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// 5. FEES & PAYMENTS
// ----------------------------------------------------

apiRouter.get('/fees', (req, res) => {
  const { studentId, status } = req.query;
  let fees = db.get('fees');
  if (studentId) fees = fees.filter(f => f.studentId === studentId);
  if (status && status !== 'all') fees = fees.filter(f => f.status === status);
  res.json({ success: true, fees });
});

apiRouter.post('/fees', (req, res) => {
  const fees = db.get('fees');
  const newFee = {
    ...req.body,
    id: `fee-${Date.now()}`,
    paidAmount: 0,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  fees.unshift(newFee);
  db.set('fees', fees);
  res.json({ success: true, fee: newFee });
});

apiRouter.get('/payments', (req, res) => {
  const { studentId } = req.query;
  let payments = db.get('payments');
  if (studentId) payments = payments.filter(p => p.studentId === studentId);
  res.json({ success: true, payments });
});

apiRouter.post('/payments', (req, res) => {
  const { studentId, feeId, amount, paymentMethod } = req.body;
  const fees = db.get('fees');
  const fee = fees.find(f => f.id === feeId);
  if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

  const payAmount = Number(amount);
  if (payAmount <= 0) return res.status(400).json({ success: false, message: 'Payment amount must be positive' });

  const payments = db.get('payments');
  const newPayment = {
    id: `pay-${Date.now()}`,
    studentId,
    studentName: fee.studentName,
    feeId,
    feeType: fee.feeType,
    amount: payAmount,
    paymentDate: new Date().toISOString(),
    paymentMethod: paymentMethod || 'upi',
    transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    receiptNumber: `RCPT-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
    status: 'success' as const,
  };
  payments.unshift(newPayment);
  db.set('payments', payments);

  // Update Fee Paid Amount & Status
  fee.paidAmount = (fee.paidAmount || 0) + payAmount;
  if (fee.paidAmount >= fee.amount) {
    fee.status = 'paid';
  } else if (fee.paidAmount > 0) {
    fee.status = 'partially_paid';
  }
  db.set('fees', fees);

  res.json({ success: true, payment: newPayment, fee });
});

// ----------------------------------------------------
// 6. COMPLAINTS & MAINTENANCE
// ----------------------------------------------------

apiRouter.get('/complaints', (req, res) => {
  const { studentId, status, category, priority } = req.query;
  let complaints = db.get('complaints');
  if (studentId) complaints = complaints.filter(c => c.studentId === studentId);
  if (status && status !== 'all') complaints = complaints.filter(c => c.status === status);
  if (category && category !== 'all') complaints = complaints.filter(c => c.category === category);
  if (priority && priority !== 'all') complaints = complaints.filter(c => c.priority === priority);
  res.json({ success: true, complaints });
});

apiRouter.post('/complaints', async (req, res) => {
  const { studentId, title, description, category, priority, roomId } = req.body;
  const students = db.get('students');
  const student = students.find(s => s.id === studentId);
  const allocations = db.get('allocations');
  const activeAlloc = allocations.find(a => a.studentId === studentId && a.status === 'active');

  let finalCategory = category;
  let finalPriority = priority;

  // If user didn't specify or wants AI assist, analyze
  if (!finalCategory || !finalPriority) {
    const aiAnalysis = await GeminiService.classifyComplaint(title, description);
    finalCategory = finalCategory || aiAnalysis.category;
    finalPriority = finalPriority || aiAnalysis.priority;
  }

  const complaints = db.get('complaints');
  const newComplaint = {
    id: `comp-${Date.now()}`,
    studentId,
    studentName: activeAlloc?.studentName || student?.registrationNumber || 'Student',
    hostelId: activeAlloc?.hostelId,
    hostelName: activeAlloc?.hostelName,
    roomId: roomId || activeAlloc?.roomId,
    roomNumber: activeAlloc?.roomNumber,
    category: finalCategory || 'other',
    title,
    description,
    priority: finalPriority || 'medium',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  complaints.unshift(newComplaint);
  db.set('complaints', complaints);

  res.json({ success: true, complaint: newComplaint });
});

apiRouter.put('/complaints/:id', (req, res) => {
  const complaints = db.get('complaints');
  const idx = complaints.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const updated = {
    ...complaints[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  complaints[idx] = updated;
  db.set('complaints', complaints);

  res.json({ success: true, complaint: updated });
});

// ----------------------------------------------------
// 7. LEAVE REQUESTS
// ----------------------------------------------------

apiRouter.get('/leaves', (req, res) => {
  const { studentId, status } = req.query;
  let leaves = db.get('leaveRequests');
  if (studentId) leaves = leaves.filter(l => l.studentId === studentId);
  if (status && status !== 'all') leaves = leaves.filter(l => l.status === status);
  res.json({ success: true, leaves });
});

apiRouter.post('/leaves', (req, res) => {
  const { studentId, startDate, endDate, reason, destination, contactNumber, emergencyContact } = req.body;
  const allocations = db.get('allocations');
  const activeAlloc = allocations.find(a => a.studentId === studentId && a.status === 'active');
  const students = db.get('students');
  const student = students.find(s => s.id === studentId);

  const leaves = db.get('leaveRequests');
  const newLeave = {
    id: `leave-${Date.now()}`,
    studentId,
    studentName: activeAlloc?.studentName || student?.registrationNumber || 'Student',
    hostelId: activeAlloc?.hostelId,
    roomNumber: activeAlloc?.roomNumber,
    startDate,
    endDate,
    reason,
    destination,
    contactNumber,
    emergencyContact,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  leaves.unshift(newLeave);
  db.set('leaveRequests', leaves);

  res.json({ success: true, leave: newLeave, message: 'Leave request submitted to warden.' });
});

apiRouter.put('/leaves/:id/approve', (req, res) => {
  const { approvedBy, approverName } = req.body;
  const leaves = db.get('leaveRequests');
  const leave = leaves.find(l => l.id === req.params.id);
  if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

  leave.status = 'approved';
  leave.approvedBy = approvedBy || 'u-warden-1';
  leave.approverName = approverName || 'Warden';
  db.set('leaveRequests', leaves);

  // Recalculate food predictions for leave dates!
  FoodWasteService.predictForDate(leave.startDate);
  FoodWasteService.predictForDate(leave.endDate);

  res.json({ success: true, leave, message: 'Leave approved. Mess attendance automatically deducted for these dates.' });
});

apiRouter.put('/leaves/:id/reject', (req, res) => {
  const leaves = db.get('leaveRequests');
  const leave = leaves.find(l => l.id === req.params.id);
  if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

  leave.status = 'rejected';
  leave.approvedBy = req.body.approvedBy || 'Warden';
  db.set('leaveRequests', leaves);

  res.json({ success: true, leave, message: 'Leave request rejected.' });
});

// ----------------------------------------------------
// 8. VISITORS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/visitors', (_req, res) => {
  res.json({ success: true, visitors: db.get('visitors') });
});

apiRouter.post('/visitors', (req, res) => {
  const visitors = db.get('visitors');
  const allocations = db.get('allocations');
  const activeAlloc = allocations.find(a => a.studentId === req.body.studentId && a.status === 'active');

  const newVisitor = {
    ...req.body,
    id: `vis-${Date.now()}`,
    studentRoom: activeAlloc?.roomNumber,
    studentName: activeAlloc?.studentName,
    status: req.body.status || 'checked_in',
    entryTime: req.body.entryTime || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  visitors.unshift(newVisitor);
  db.set('visitors', visitors);
  res.json({ success: true, visitor: newVisitor });
});

apiRouter.put('/visitors/:id/checkout', (req, res) => {
  const visitors = db.get('visitors');
  const visitor = visitors.find(v => v.id === req.params.id);
  if (!visitor) return res.status(404).json({ success: false, message: 'Visitor record not found' });

  visitor.status = 'checked_out';
  visitor.exitTime = new Date().toISOString();
  db.set('visitors', visitors);
  res.json({ success: true, visitor });
});

// ----------------------------------------------------
// 9. ATTENDANCE
// ----------------------------------------------------

apiRouter.get('/attendance', (req, res) => {
  const { date, hostelId } = req.query;
  let attendance = db.get('attendance');
  if (date) attendance = attendance.filter(a => a.date === date);
  if (hostelId) attendance = attendance.filter(a => a.hostelId === hostelId);
  res.json({ success: true, attendance });
});

apiRouter.post('/attendance', (req, res) => {
  const { records } = req.body; // array of Attendance
  if (!Array.isArray(records)) return res.status(400).json({ success: false, message: 'Records array required' });

  const attendance = db.get('attendance');
  for (const rec of records) {
    const idx = attendance.findIndex(a => a.studentId === rec.studentId && a.date === rec.date);
    if (idx >= 0) {
      attendance[idx] = { ...attendance[idx], ...rec };
    } else {
      attendance.push({
        ...rec,
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      });
    }
  }
  db.set('attendance', attendance);
  res.json({ success: true, count: records.length, message: 'Attendance records saved.' });
});

// ----------------------------------------------------
// 10. ANNOUNCEMENTS & NOTIFICATIONS
// ----------------------------------------------------

apiRouter.get('/announcements', (_req, res) => {
  res.json({ success: true, announcements: db.get('announcements') });
});

apiRouter.post('/announcements', (req, res) => {
  const list = db.get('announcements');
  const newAnn = {
    ...req.body,
    id: `ann-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newAnn);
  db.set('announcements', list);
  res.json({ success: true, announcement: newAnn });
});

apiRouter.get('/notifications', (req, res) => {
  const { userId } = req.query;
  let list = db.get('notifications');
  if (userId) list = list.filter(n => n.userId === userId);
  res.json({ success: true, notifications: list });
});

apiRouter.put('/notifications/:id/read', (req, res) => {
  const list = db.get('notifications');
  const item = list.find(n => n.id === req.params.id);
  if (item) item.isRead = true;
  db.set('notifications', list);
  res.json({ success: true, notification: item });
});

// ----------------------------------------------------
// 11. INVENTORY & AUDIT LOGS
// ----------------------------------------------------

apiRouter.get('/inventory', (_req, res) => {
  res.json({ success: true, inventory: db.get('inventory') });
});

apiRouter.post('/inventory', (req, res) => {
  const list = db.get('inventory');
  const newItem = {
    ...req.body,
    id: `inv-${Date.now()}`,
    lastAudited: new Date().toISOString().split('T')[0],
  };
  list.unshift(newItem);
  db.set('inventory', list);
  res.json({ success: true, item: newItem });
});

apiRouter.get('/audit-logs', (_req, res) => {
  res.json({ success: true, auditLogs: db.get('auditLogs') });
});

// ----------------------------------------------------
// 12. DASHBOARD OVERVIEW STATS
// ----------------------------------------------------

apiRouter.get('/dashboard/stats', (_req, res) => {
  AllocationService.refreshOccupancies();
  const raw = db.raw();

  const totalStudents = raw.students.length;
  const activeStudents = raw.students.filter(s => s.status === 'active').length;
  const totalWardens = raw.users.filter(u => u.role === 'warden').length;
  const totalStaff = raw.users.filter(u => u.role === 'staff').length;
  const totalHostels = raw.hostels.length;
  const totalBlocks = raw.blocks.length;
  const totalRooms = raw.rooms.length;
  const occupiedRooms = raw.rooms.filter(r => r.status === 'occupied' || r.occupiedBeds > 0).length;
  const availableRooms = totalRooms - occupiedRooms;
  const totalBeds = raw.beds.length;
  const occupiedBeds = raw.beds.filter(b => b.status === 'occupied').length;
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyPercentage = totalBeds > 0 ? parseFloat(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0;

  const pendingComplaints = raw.complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
  const pendingLeaveRequests = raw.leaveRequests.filter(l => l.status === 'pending').length;
  const pendingTransfers = raw.transfers.filter(t => t.status === 'pending').length;

  const pendingFees = raw.fees.filter(f => f.status === 'pending' || f.status === 'partially_paid' || f.status === 'overdue');
  const pendingPaymentsAmount = pendingFees.reduce((acc, f) => acc + (f.amount - (f.paidAmount || 0)), 0);

  // Today's food waste quick stats
  const today = new Date().toISOString().split('T')[0];
  const todayPreps = raw.foodPreparations.filter(fp => fp.date === today || fp.date === '2026-08-26');
  const todayWasteKg = todayPreps.filter(p => p.unit === 'kg').reduce((acc, p) => acc + p.quantityWasted, 0);
  const todayWasteCost = todayPreps.reduce((acc, p) => acc + p.totalCostWasted, 0);

  const stats: DashboardStats = {
    totalStudents,
    activeStudents,
    totalWardens,
    totalStaff,
    totalHostels,
    totalBlocks,
    totalRooms,
    occupiedRooms,
    availableRooms,
    totalBeds,
    occupiedBeds,
    availableBeds,
    occupancyPercentage,
    pendingComplaints,
    pendingLeaveRequests,
    pendingTransfers,
    pendingPaymentsAmount,
    pendingPaymentsCount: pendingFees.length,
    totalMaintenanceRequests: raw.maintenanceRequests.filter(m => m.status !== 'completed').length,
    todayPredictedMeals: raw.mealPredictions.filter(p => p.date === today).reduce((acc, p) => acc + p.recommendedQuantity, 0) || 120,
    todayFoodWasteKg: parseFloat(todayWasteKg.toFixed(1)),
    todayFoodWasteCost: Math.round(todayWasteCost),
    averageWastePercentage: 6.8,
  };

  res.json({ success: true, stats });
});

// ----------------------------------------------------
// 13. FOOD WASTAGE PREDICTION & MANAGEMENT (SECTION 37)
// ----------------------------------------------------

apiRouter.get('/food-waste/dashboard', (req, res) => {
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const predictions = FoodWasteService.predictForDate(dateStr);
  const preps = db.get('foodPreparations');
  const insights = db.get('foodWasteInsights');
  const accuracy = FoodWasteService.calculateAccuracyMetrics();
  const settings = db.get('foodWasteSettings');

  res.json({
    success: true,
    date: dateStr,
    predictions,
    recentPreparations: preps.slice(0, 10),
    insights: insights.slice(0, 5),
    accuracy,
    settings,
  });
});

apiRouter.get('/food-waste/predictions', (req, res) => {
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const predictions = FoodWasteService.predictForDate(dateStr);
  res.json({ success: true, date: dateStr, predictions });
});

apiRouter.post('/food-waste/predict', (req, res) => {
  const dateStr = req.body.date || new Date().toISOString().split('T')[0];
  const predictions = FoodWasteService.predictForDate(dateStr);
  res.json({ success: true, predictions });
});

apiRouter.get('/food-waste/preparations', (_req, res) => {
  res.json({ success: true, preparations: db.get('foodPreparations') });
});

apiRouter.post('/food-waste/preparations', (req, res) => {
  try {
    const prep = FoodWasteService.recordPreparation(req.body);
    res.json({ success: true, preparation: prep, message: 'Meal preparation & waste data recorded.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.get('/food-waste/meal-attendance', (req, res) => {
  const { studentId, date } = req.query;
  let list = db.get('mealAttendance');
  if (studentId) list = list.filter(m => m.studentId === studentId);
  if (date) list = list.filter(m => m.date === date);
  res.json({ success: true, mealAttendance: list });
});

apiRouter.post('/food-waste/meal-attendance', (req, res) => {
  const { studentId, studentName, date, mealType, status } = req.body;
  const result = FoodWasteService.setStudentMealOptIn({
    studentId,
    studentName,
    date: date || new Date().toISOString().split('T')[0],
    mealType,
    status,
  });
  // Auto refresh predictions for that date
  FoodWasteService.predictForDate(date || new Date().toISOString().split('T')[0]);
  res.json({ success: true, mealAttendance: result, message: `Meal choice updated to ${status}.` });
});

apiRouter.get('/food-waste/ingredients-estimate', (req, res) => {
  const servings = Number(req.query.servings) || 40;
  const mealType = (req.query.mealType as any) || 'lunch';
  const ingredients = FoodWasteService.estimateIngredients(servings, mealType);
  res.json({ success: true, servings, mealType, ingredients });
});

apiRouter.get('/food-waste/accuracy', (_req, res) => {
  const accuracy = FoodWasteService.calculateAccuracyMetrics();
  res.json({ success: true, accuracy });
});

apiRouter.get('/food-waste/insights', (_req, res) => {
  res.json({ success: true, insights: db.get('foodWasteInsights') });
});

apiRouter.get('/food-waste/costs', (_req, res) => {
  res.json({ success: true, foodCosts: db.get('foodCosts') });
});

apiRouter.put('/food-waste/settings', (req, res) => {
  const updated = FoodWasteService.updateSettings(req.body);
  res.json({ success: true, settings: updated, message: 'Food wastage settings updated.' });
});

// ----------------------------------------------------
// 14. GEMINI AI ENDPOINTS
// ----------------------------------------------------

apiRouter.post('/ai/classify-complaint', async (req, res) => {
  const { title, description } = req.body;
  const analysis = await GeminiService.classifyComplaint(title || '', description || '');
  res.json({ success: true, analysis });
});

apiRouter.get('/ai/hostel-insights', async (_req, res) => {
  const insights = await GeminiService.generateHostelInsights();
  res.json({ success: true, insights });
});

apiRouter.post('/ai/food-advice', async (req, res) => {
  const { mealType, date } = req.body;
  const advice = await GeminiService.generateFoodWasteAdvice(mealType || 'lunch', date || new Date().toISOString().split('T')[0]);
  res.json({ success: true, advice });
});

apiRouter.post('/ai/faq-chat', async (req, res) => {
  const { question, studentName } = req.body;
  const reply = await GeminiService.answerStudentQuestion(question || '', studentName);
  res.json({ success: true, reply });
});

// ----------------------------------------------------
// 15. SYSTEM / DATABASE RESET
// ----------------------------------------------------

apiRouter.post('/database/reset', (_req, res) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to initial demo state.' });
});
