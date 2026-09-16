import crypto from 'crypto';
import { db } from '../db/database.ts';
import { User, Student, WardenProfile, AdminProfile } from '../../src/types/index.ts';

const PASSWORD_SALT = 'campus_hostel_salt_2025_secure';

export function hashPassword(password: string): string {
  if (!password) return '';
  return crypto.createHmac('sha256', PASSWORD_SALT).update(password.trim()).digest('hex');
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!password || !storedHash) return false;
  const cleanPass = password.trim();
  // Check direct equality or sha256 hash match
  if (storedHash === cleanPass) return true;
  const hashed = hashPassword(cleanPass);
  if (storedHash === hashed) return true;
  if (cleanPass === 'demo123' && (storedHash === 'student123' || storedHash === 'warden123' || storedHash === 'admin123')) {
    return true;
  }
  return false;
}

export const DEMO_ACCOUNTS_INFO = {
  student: {
    role: 'student' as const,
    name: 'Aarav Sharma (Resident Demo)',
    email: 'student.demo@campus.edu',
    altEmail: 'student@campus.edu',
    password: 'student123',
    tag: 'Student Resident',
    description: 'B.Tech CSE 3rd Year • Room A-101 (C.V. Raman Boys Hostel)',
    details: {
      rollNumber: 'CS24B001',
      registrationNumber: 'REG-2024-CS-001',
      department: 'Computer Science & Engineering',
      hostel: 'C.V. Raman Boys Hostel',
      room: 'Room A-101 (Bed 1)',
    },
  },
  warden: {
    role: 'warden' as const,
    name: 'Prof. Rajesh Sharma (Warden Demo)',
    email: 'warden.demo@campus.edu',
    altEmail: 'warden@campus.edu',
    password: 'warden123',
    tag: 'Hostel Warden',
    description: 'Chief Resident Warden • C.V. Raman Boys Wing',
    details: {
      employeeId: 'EMP-WAR-DEMO-01',
      hostelAssigned: 'C.V. Raman Boys Hostel',
      qualification: 'M.Tech, Ph.D. in Computer Engineering',
    },
  },
  admin: {
    role: 'admin' as const,
    name: 'Dr. Lohith Sagar (Admin Demo)',
    email: 'admin.demo@campus.edu',
    altEmail: 'admin@campus.edu',
    password: 'admin123',
    tag: 'System Administrator',
    description: 'Directorate of Student Affairs & Central Residence Management',
    details: {
      adminId: 'ADM-SYS-DEMO-01',
      organization: 'Directorate of Student Affairs & Residence Management',
      accessLevel: 'Super Administrator (Full Governance)',
    },
  },
};

export class AuthService {
  static ensureDemoAccounts() {
    try {
      const users = db.get('users') || [];
      let updated = false;

      // 1. Admin Demo
      if (!users.some(u => u.email.toLowerCase() === DEMO_ACCOUNTS_INFO.admin.email.toLowerCase())) {
        users.unshift({
          id: 'u-admin-demo',
          name: DEMO_ACCOUNTS_INFO.admin.name,
          email: DEMO_ACCOUNTS_INFO.admin.email,
          phone: '+1 (555) 234-5678',
          passwordHash: 'admin123',
          role: 'admin',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        });
        updated = true;
      }

      // 2. Warden Demo
      if (!users.some(u => u.email.toLowerCase() === DEMO_ACCOUNTS_INFO.warden.email.toLowerCase())) {
        users.unshift({
          id: 'u-warden-demo',
          name: DEMO_ACCOUNTS_INFO.warden.name,
          email: DEMO_ACCOUNTS_INFO.warden.email,
          phone: '+1 (555) 345-6789',
          passwordHash: 'warden123',
          role: 'warden',
          status: 'active',
          hostelId: 'h-cvr-1',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          createdAt: '2025-01-02T00:00:00Z',
          updatedAt: '2025-01-02T00:00:00Z',
        });
        updated = true;
      }

      // 3. Student Demo
      if (!users.some(u => u.email.toLowerCase() === DEMO_ACCOUNTS_INFO.student.email.toLowerCase())) {
        users.unshift({
          id: 'u-stu-demo',
          name: DEMO_ACCOUNTS_INFO.student.name,
          email: DEMO_ACCOUNTS_INFO.student.email,
          phone: '+1 (555) 901-1122',
          passwordHash: 'student123',
          role: 'student',
          status: 'active',
          hostelId: 'h-cvr-1',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-10T00:00:00Z',
        });
        updated = true;
      }

      if (updated) {
        db.set('users', users);
      }

      // Ensure Student Profile
      const students = db.get('students') || [];
      if (!students.some(s => s.id === 's-demo' || s.userId === 'u-stu-demo')) {
        students.unshift({
          id: 's-demo',
          userId: 'u-stu-demo',
          registrationNumber: 'REG-2024-CS-001',
          rollNumber: 'CS24B001',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CSE',
          year: 3,
          gender: 'male',
          dateOfBirth: '2004-04-12',
          guardianName: 'Sunil Sharma',
          guardianPhone: '+1 (555) 901-1100',
          address: 'B-14 Green Park, Sector 5, Campus City',
          emergencyContact: '+1 (555) 901-1100',
          admissionDate: '2024-07-15',
          status: 'active',
        });
        db.set('students', students);
      }

      // Ensure Allocation
      const allocations = db.get('allocations') || [];
      if (!allocations.some(a => a.studentId === 's-demo')) {
        allocations.unshift({
          id: 'alloc-demo',
          studentId: 's-demo',
          studentName: DEMO_ACCOUNTS_INFO.student.name,
          registrationNumber: 'REG-2024-CS-001',
          hostelId: 'h-cvr-1',
          hostelName: 'C.V. Raman Boys Hostel',
          blockId: 'b-cvr-a',
          blockName: 'Block A (Main Wing)',
          roomId: 'r-cvr-101',
          roomNumber: 'A-101',
          bedId: 'bed-cvr-101-a',
          bedNumber: 'Bed 1',
          allocationDate: '2024-08-01T09:00:00Z',
          status: 'active',
          allocatedBy: 'Prof. Rajesh Sharma (Hostel Warden)',
          checkInDate: '2024-08-02T10:00:00Z',
        });
        db.set('allocations', allocations);
      }

      // Ensure Warden Profile
      const wardenProfiles = db.get('wardenProfiles') || [];
      if (!wardenProfiles.some(wp => wp.userId === 'u-warden-demo')) {
        wardenProfiles.unshift({
          id: 'wp-demo',
          userId: 'u-warden-demo',
          employeeId: 'EMP-WAR-DEMO-01',
          hostelAssigned: 'C.V. Raman Boys Hostel',
          qualification: 'M.Tech, Ph.D. in Computer Engineering',
          experience: '7 years campus resident warden',
          createdAt: '2025-01-02T00:00:00Z',
        });
        db.set('wardenProfiles', wardenProfiles);
      }

      // Ensure Admin Profile
      const adminProfiles = db.get('adminProfiles') || [];
      if (!adminProfiles.some(ap => ap.userId === 'u-admin-demo')) {
        adminProfiles.unshift({
          id: 'ap-demo',
          userId: 'u-admin-demo',
          adminId: 'ADM-SYS-DEMO-01',
          organization: 'Directorate of Student Affairs & Residence Management',
          accessLevel: 'Super Administrator (Full Governance)',
          createdAt: '2025-01-01T00:00:00Z',
        });
        db.set('adminProfiles', adminProfiles);
      }
    } catch (e) {
      console.warn('Error ensuring demo accounts:', e);
    }
  }

  static getUsers(): User[] {
    this.ensureDemoAccounts();
    return db.get('users') || [];
  }

  static getUserById(id: string): User | undefined {
    this.ensureDemoAccounts();
    return (db.get('users') || []).find(u => u.id === id);
  }

  static getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    this.ensureDemoAccounts();
    const clean = email.trim().toLowerCase();

    // Check alias matching for demo convenience
    if (clean === 'student@campus.edu' || clean === 'student.demo@campus.edu' || clean === 'demo.student@campus.edu') {
      const demoStu = (db.get('users') || []).find(u => u.email.toLowerCase() === 'student.demo@campus.edu');
      if (demoStu) return demoStu;
    }
    if (clean === 'warden@campus.edu' || clean === 'warden.demo@campus.edu' || clean === 'demo.warden@campus.edu') {
      const demoWar = (db.get('users') || []).find(u => u.email.toLowerCase() === 'warden.demo@campus.edu');
      if (demoWar) return demoWar;
    }
    if (clean === 'admin@campus.edu' || clean === 'admin.demo@campus.edu' || clean === 'demo.admin@campus.edu') {
      const demoAdm = (db.get('users') || []).find(u => u.email.toLowerCase() === 'admin.demo@campus.edu' || u.email.toLowerCase() === 'admin@campus.edu');
      if (demoAdm) return demoAdm;
    }

    const users = db.get('users') || [];
    return users.find(u => u.email.toLowerCase() === clean);
  }

  static demoLogin(role: 'student' | 'warden' | 'admin'): { success: boolean; user?: User; token?: string; message?: string } {
    this.ensureDemoAccounts();
    const creds = DEMO_ACCOUNTS_INFO[role];
    if (!creds) {
      return { success: false, message: `Invalid demo role requested: ${role}` };
    }
    if (role === 'student') {
      return this.studentLogin(creds.email, creds.password);
    }
    if (role === 'warden') {
      return this.wardenLogin(creds.email, creds.password);
    }
    if (role === 'admin') {
      return this.adminLogin(creds.email, creds.password);
    }
    return { success: false, message: 'Unsupported demo role' };
  }

  private static recordAudit(userId: string, userName: string, userRole: any, action: string, details: string) {
    const auditLogs = db.get('auditLogs') || [];
    auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userName,
      userRole,
      action,
      entity: 'Authentication',
      entityId: userId,
      details,
      timestamp: new Date().toISOString(),
    });
    db.set('auditLogs', auditLogs);
  }

  // ----------------------------------------------------
  // 1. STUDENT AUTHENTICATION
  // ----------------------------------------------------

  static studentSignUp(data: {
    name: string;
    email: string;
    phone: string;
    registrationNumber: string;
    rollNumber: string;
    department: string;
    course: string;
    year: number | string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    guardianName: string;
    guardianPhone: string;
    address: string;
    emergencyContact: string;
    password: string;
    confirmPassword: string;
  }): { success: boolean; message: string; user?: User; student?: Student } {
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
      emergencyContact,
      password,
      confirmPassword,
    } = data;

    // Basic presence check
    if (!name?.trim() || !email?.trim() || !registrationNumber?.trim() || !rollNumber?.trim()) {
      return { success: false, message: 'Please fill in all required registration fields.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match. Please re-enter your password.' };
    }

    const users = db.get('users') || [];
    const students = db.get('students') || [];

    // Validation: Unique email
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    // Validation: Unique Registration Number
    if (students.some(s => s.registrationNumber.toLowerCase() === registrationNumber.trim().toLowerCase())) {
      return { success: false, message: 'This Registration Number has already been registered in the system.' };
    }

    // Validation: Unique Roll Number
    if (students.some(s => s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase())) {
      return { success: false, message: 'This Roll Number has already been registered in the system.' };
    }

    // Create User record
    const userId = `u-stu-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      passwordHash: hashPassword(password),
      role: 'student',
      status: 'active',
      avatar: `https://images.unsplash.com/photo-${gender === 'female' ? '1534528741775-53994a69daeb' : '1506794778202-cad84cf45f1d'}?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create Student Profile record
    const studentId = `s-${Date.now()}`;
    const newStudent: Student = {
      id: studentId,
      userId,
      registrationNumber: registrationNumber.trim().toUpperCase(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department: department?.trim() || 'Computer Science & Engineering',
      course: course?.trim() || 'B.Tech',
      year: Number(year) || 1,
      gender: gender || 'male',
      dateOfBirth: dateOfBirth || '2005-01-01',
      guardianName: guardianName?.trim() || 'Guardian',
      guardianPhone: guardianPhone?.trim() || phone || '',
      address: address?.trim() || 'Campus Residential Quarter',
      emergencyContact: emergencyContact?.trim() || phone || '',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    users.push(newUser);
    db.set('users', users);

    students.push(newStudent);
    db.set('students', students);

    // Provision baseline term fee record
    const fees = db.get('fees') || [];
    fees.push(
      {
        id: `fee-${Date.now()}-1`,
        studentId: newStudent.id,
        studentName: newUser.name,
        feeType: 'hostel_rent',
        amount: 25000,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'pending',
        semester: 'Semester 1',
        createdAt: new Date().toISOString(),
      },
      {
        id: `fee-${Date.now()}-2`,
        studentId: newStudent.id,
        studentName: newUser.name,
        feeType: 'mess_fee',
        amount: 18000,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'pending',
        semester: 'Semester 1',
        createdAt: new Date().toISOString(),
      }
    );
    db.set('fees', fees);

    this.recordAudit(
      newUser.id,
      newUser.name,
      'student',
      'STUDENT_SIGNUP',
      `New student registered: ${newUser.name} (${newStudent.rollNumber}, ${newStudent.department})`
    );

    return {
      success: true,
      message: 'Student account registered successfully. You may now sign in.',
      user: newUser,
      student: newStudent,
    };
  }

  static studentLogin(email: string, password?: string): { success: boolean; user?: User; token?: string; message?: string } {
    if (!email || !email.trim()) {
      return { success: false, message: 'Student Email is required.' };
    }
    if (!password) {
      return { success: false, message: 'Password is required.' };
    }

    const user = this.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Role check: Only students allowed on Student Sign In
    if (user.role !== 'student') {
      return {
        success: false,
        message: `Account role mismatch: This portal is exclusively for Students. Please sign in through the ${user.role.toUpperCase()} portal.`
      };
    }

    if (user.status === 'disabled' || user.status === 'inactive') {
      return { success: false, message: 'Your student account has been disabled. Please contact the warden or administration.' };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, message: 'Invalid email or password.' };
    }

    this.recordAudit(user.id, user.name, 'student', 'STUDENT_LOGIN', `${user.name} logged into Student Portal`);
    const token = `jwt_${user.id}_${Date.now()}`;
    return { success: true, user, token };
  }

  // ----------------------------------------------------
  // 2. WARDEN AUTHENTICATION
  // ----------------------------------------------------

  static wardenSignUp(data: {
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    hostelAssigned: string;
    qualification: string;
    experience: string;
    password: string;
    confirmPassword: string;
  }): { success: boolean; message: string; user?: User; wardenProfile?: WardenProfile } {
    const {
      name,
      email,
      phone,
      employeeId,
      hostelAssigned,
      qualification,
      experience,
      password,
      confirmPassword,
    } = data;

    if (!name?.trim() || !email?.trim() || !employeeId?.trim()) {
      return { success: false, message: 'Please fill in all required warden registration fields.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match. Please re-enter your password.' };
    }

    const users = db.get('users') || [];
    const wardenProfiles = db.get('wardenProfiles') || [];

    // Unique email
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    // Unique Employee ID
    if (wardenProfiles.some(wp => wp.employeeId.toLowerCase() === employeeId.trim().toLowerCase())) {
      return { success: false, message: 'This Employee ID has already been registered.' };
    }

    const userId = `u-warden-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      passwordHash: hashPassword(password),
      role: 'warden',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newWardenProfile: WardenProfile = {
      id: `wp-${Date.now()}`,
      userId,
      employeeId: employeeId.trim().toUpperCase(),
      hostelAssigned: hostelAssigned?.trim() || 'Aryabhata Boys Hostel',
      qualification: qualification?.trim() || 'Master of Engineering',
      experience: experience?.trim() || '3+ years resident hostel warden',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    db.set('users', users);

    wardenProfiles.push(newWardenProfile);
    db.set('wardenProfiles', wardenProfiles);

    this.recordAudit(
      newUser.id,
      newUser.name,
      'warden',
      'WARDEN_SIGNUP',
      `New warden registered: ${newUser.name} (Emp ID: ${newWardenProfile.employeeId}, Hostel: ${newWardenProfile.hostelAssigned})`
    );

    return {
      success: true,
      message: 'Warden profile created successfully. You may now sign in.',
      user: newUser,
      wardenProfile: newWardenProfile,
    };
  }

  static wardenLogin(email: string, password?: string): { success: boolean; user?: User; token?: string; message?: string } {
    if (!email || !email.trim()) {
      return { success: false, message: 'Warden Email is required.' };
    }
    if (!password) {
      return { success: false, message: 'Password is required.' };
    }

    const user = this.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (user.role !== 'warden') {
      return {
        success: false,
        message: `Account role mismatch: This portal is exclusively for Wardens. Please sign in through the ${user.role.toUpperCase()} portal.`
      };
    }

    if (user.status === 'disabled' || user.status === 'inactive') {
      return { success: false, message: 'Your warden account is disabled. Please contact the administrator.' };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, message: 'Invalid email or password.' };
    }

    this.recordAudit(user.id, user.name, 'warden', 'WARDEN_LOGIN', `${user.name} logged into Warden Portal`);
    const token = `jwt_${user.id}_${Date.now()}`;
    return { success: true, user, token };
  }

  // ----------------------------------------------------
  // 3. ADMIN AUTHENTICATION
  // ----------------------------------------------------

  static adminSignUp(data: {
    name: string;
    email: string;
    phone: string;
    adminId: string;
    organization: string;
    password: string;
    confirmPassword: string;
    securityAccessCode: string;
  }): { success: boolean; message: string; user?: User; adminProfile?: AdminProfile } {
    const {
      name,
      email,
      phone,
      adminId,
      organization,
      password,
      confirmPassword,
      securityAccessCode,
    } = data;

    if (!name?.trim() || !email?.trim() || !adminId?.trim() || !securityAccessCode?.trim()) {
      return { success: false, message: 'Please fill in all required administrator registration fields.' };
    }

    // Validate Security Access Code to prevent unauthorized admin creation
    const validCodes = ['HOSTEL-ADMIN-2025', 'ADMIN2025', 'CAMPUS-MASTER-KEY', 'SUPERADMIN', 'ADMIN-KEY-2025'];
    if (!validCodes.includes(securityAccessCode.trim())) {
      return {
        success: false,
        message: 'Invalid Security Access Code. Contact the campus IT directorate to obtain an authorized administrator provisioning key.'
      };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match. Please re-enter your password.' };
    }

    const users = db.get('users') || [];
    const adminProfiles = db.get('adminProfiles') || [];

    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    if (adminProfiles.some(ap => ap.adminId.toLowerCase() === adminId.trim().toLowerCase())) {
      return { success: false, message: 'This Admin ID has already been registered.' };
    }

    const userId = `u-admin-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      passwordHash: hashPassword(password),
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newAdminProfile: AdminProfile = {
      id: `ap-${Date.now()}`,
      userId,
      adminId: adminId.trim().toUpperCase(),
      organization: organization?.trim() || 'Campus Directorate of Student Affairs',
      accessLevel: 'Super Administrator (Full Governance)',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    db.set('users', users);

    adminProfiles.push(newAdminProfile);
    db.set('adminProfiles', adminProfiles);

    this.recordAudit(
      newUser.id,
      newUser.name,
      'admin',
      'ADMIN_SIGNUP',
      `New administrator registered: ${newUser.name} (Admin ID: ${newAdminProfile.adminId}, Org: ${newAdminProfile.organization})`
    );

    return {
      success: true,
      message: 'Administrator account registered successfully. You may now sign in.',
      user: newUser,
      adminProfile: newAdminProfile,
    };
  }

  static adminLogin(email: string, password?: string): { success: boolean; user?: User; token?: string; message?: string } {
    if (!email || !email.trim()) {
      return { success: false, message: 'Administrator Email is required.' };
    }
    if (!password) {
      return { success: false, message: 'Password is required.' };
    }

    const user = this.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (user.role !== 'admin') {
      return {
        success: false,
        message: `Account role mismatch: This portal is exclusively for System Administrators. Please sign in through the ${user.role.toUpperCase()} portal.`
      };
    }

    if (user.status === 'disabled' || user.status === 'inactive') {
      return { success: false, message: 'Your administrator account is disabled.' };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, message: 'Invalid email or password.' };
    }

    this.recordAudit(user.id, user.name, 'admin', 'ADMIN_LOGIN', `${user.name} authenticated via Central Admin Portal`);
    const token = `jwt_${user.id}_${Date.now()}`;
    return { success: true, user, token };
  }

  // ----------------------------------------------------
  // GENERAL AUTH & PASSWORD RESET
  // ----------------------------------------------------

  static forgotPassword(email: string): { success: boolean; message: string } {
    const user = this.getUserByEmail(email);
    if (!user) {
      return {
        success: true,
        message: 'If an active account exists with that email address, password reset instructions have been dispatched.'
      };
    }

    this.recordAudit(user.id, user.name, user.role, 'PASSWORD_RESET_REQUEST', `Password reset requested for ${user.email}`);

    return {
      success: true,
      message: `Password reset link dispatched to ${user.email}. Follow instructions sent to your institutional email inbox.`
    };
  }

  static updateUser(id: string, updates: Partial<User>): User {
    const users = db.get('users') || [];
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updatedUser = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    users[index] = updatedUser;
    db.set('users', users);
    return updatedUser;
  }
}
