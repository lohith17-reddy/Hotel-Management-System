import { DatabaseSchema } from './database.ts';
import { seedUsers, seedStudents } from './seed/usersAndStudents.ts';
import { seedHostels, seedBlocks, seedRooms, seedBeds } from './seed/hostelsAndRooms.ts';
import { seedAllocations, seedTransfers, seedFees, seedPayments } from './seed/allocationsAndTransfers.ts';
import { WardenProfile, AdminProfile } from '../../src/types/index.ts';
import {
  seedComplaints,
  seedMaintenanceRequests,
  seedLeaveRequests,
  seedVisitors,
  seedAttendance,
  seedAnnouncements,
  seedNotifications,
  seedInventory,
  seedAuditLogs
} from './seed/complaintsAndLeaves.ts';
import {
  seedFoodCosts,
  seedFoodWasteSettings,
  seedMealAttendance,
  seedMealPredictions,
  seedFoodPreparations,
  seedFoodWasteInsights
} from './seed/foodWasteSeed.ts';

export const seedWardenProfiles: WardenProfile[] = [
  {
    id: 'wp-demo',
    userId: 'u-warden-demo',
    employeeId: 'EMP-WAR-DEMO-01',
    hostelAssigned: 'C.V. Raman Boys Hostel',
    qualification: 'M.Tech, Ph.D. in Computer Engineering',
    experience: '7 years campus resident warden',
    createdAt: '2025-01-02T00:00:00Z',
  },
  {
    id: 'wp-1',
    userId: 'u-warden-1',
    employeeId: 'EMP-WAR-2021-04',
    hostelAssigned: 'Aryabhata Boys Hostel',
    qualification: 'M.Tech in Mechanical Engineering',
    experience: '6 years campus resident warden',
    createdAt: '2025-01-02T00:00:00Z',
  },
  {
    id: 'wp-2',
    userId: 'u-warden-2',
    employeeId: 'EMP-WAR-2022-11',
    hostelAssigned: 'Gargi Girls Hostel',
    qualification: 'Ph.D in Environmental Science',
    experience: '4 years hostel warden & student counselor',
    createdAt: '2025-01-02T00:00:00Z',
  }
];

export const seedAdminProfiles: AdminProfile[] = [
  {
    id: 'ap-demo',
    userId: 'u-admin-demo',
    adminId: 'ADM-SYS-DEMO-01',
    organization: 'Directorate of Student Affairs & Residence Management',
    accessLevel: 'Super Administrator (Full Governance)',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ap-1',
    userId: 'u-admin-1',
    adminId: 'ADM-DIR-001',
    organization: 'Directorate of Student Affairs & Residence Management',
    accessLevel: 'Super Administrator (Full Governance)',
    createdAt: '2025-01-01T00:00:00Z',
  }
];

export const initialSeedData: DatabaseSchema = {
  users: seedUsers,
  students: seedStudents,
  wardenProfiles: seedWardenProfiles,
  adminProfiles: seedAdminProfiles,
  hostels: seedHostels,
  blocks: seedBlocks,
  rooms: seedRooms,
  beds: seedBeds,
  allocations: seedAllocations,
  transfers: seedTransfers,
  fees: seedFees,
  payments: seedPayments,
  complaints: seedComplaints,
  maintenanceRequests: seedMaintenanceRequests,
  visitors: seedVisitors,
  attendance: seedAttendance,
  leaveRequests: seedLeaveRequests,
  announcements: seedAnnouncements,
  notifications: seedNotifications,
  inventory: seedInventory,
  auditLogs: seedAuditLogs,
  mealAttendance: seedMealAttendance,
  mealPredictions: seedMealPredictions,
  foodPreparations: seedFoodPreparations,
  foodCosts: seedFoodCosts,
  foodWasteInsights: seedFoodWasteInsights,
  foodWasteSettings: seedFoodWasteSettings,
};
