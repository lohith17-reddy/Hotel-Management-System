import fs from 'fs';
import path from 'path';
import {
  User,
  Student,
  WardenProfile,
  AdminProfile,
  Hostel,
  Block,
  Room,
  Bed,
  Allocation,
  RoomTransfer,
  Fee,
  Payment,
  Complaint,
  MaintenanceRequest,
  Visitor,
  Attendance,
  LeaveRequest,
  Announcement,
  Notification,
  InventoryItem,
  AuditLog,
  MealAttendance,
  MealPrediction,
  FoodPreparation,
  FoodCost,
  FoodWasteInsight,
  FoodWasteSettings
} from '../../src/types/index.ts';
import { initialSeedData } from './seedData.ts';

export interface DatabaseSchema {
  users: User[];
  students: Student[];
  wardenProfiles: WardenProfile[];
  adminProfiles: AdminProfile[];
  hostels: Hostel[];
  blocks: Block[];
  rooms: Room[];
  beds: Bed[];
  allocations: Allocation[];
  transfers: RoomTransfer[];
  fees: Fee[];
  payments: Payment[];
  complaints: Complaint[];
  maintenanceRequests: MaintenanceRequest[];
  visitors: Visitor[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  notifications: Notification[];
  inventory: InventoryItem[];
  auditLogs: AuditLog[];
  mealAttendance: MealAttendance[];
  mealPredictions: MealPrediction[];
  foodPreparations: FoodPreparation[];
  foodCosts: FoodCost[];
  foodWasteInsights: FoodWasteInsight[];
  foodWasteSettings: FoodWasteSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hostel_database.json');

class DatabaseEngine {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.data = this.loadOrSeed();
  }

  private loadOrSeed(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        if (fileContent.trim()) {
          const parsed = JSON.parse(fileContent);
          // ensure all collections exist
          return {
            ...initialSeedData,
            ...parsed,
          };
        }
      }
    } catch (err) {
      console.error('Error loading database, re-seeding:', err);
    }

    const seed = initialSeedData;
    this.saveDirect(seed);
    return seed;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public save() {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      this.saveDirect(this.data);
      this.isSaving = false;
    }, 50);
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public set<K extends keyof DatabaseSchema>(collection: K, value: DatabaseSchema[K]) {
    this.data[collection] = value;
    this.save();
  }

  public resetToSeed() {
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.saveDirect(this.data);
    return this.data;
  }

  public raw(): DatabaseSchema {
    return this.data;
  }
}

export const db = new DatabaseEngine();
