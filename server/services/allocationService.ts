import { db } from '../db/database.ts';
import { Allocation, RoomTransfer } from '../../src/types/index.ts';

export class AllocationService {
  /**
   * Helper to recalculate room & hostel occupancy stats
   */
  public static refreshOccupancies() {
    const rooms = db.get('rooms');
    const beds = db.get('beds');
    const hostels = db.get('hostels');

    // Update rooms
    for (const room of rooms) {
      const roomBeds = beds.filter(b => b.roomId === room.id);
      const occupiedCount = roomBeds.filter(b => b.status === 'occupied').length;
      room.occupiedBeds = occupiedCount;
      if (occupiedCount >= room.capacity) {
        room.status = 'occupied';
      } else if (occupiedCount === 0) {
        room.status = 'available';
      } else {
        room.status = 'available';
      }
    }
    db.set('rooms', rooms);

    // Update hostels
    for (const hostel of hostels) {
      const hostelBeds = beds.filter(b => b.hostelId === hostel.id);
      const occupied = hostelBeds.filter(b => b.status === 'occupied').length;
      hostel.capacity = hostelBeds.length;
      hostel.occupancy = occupied;
    }
    db.set('hostels', hostels);
  }

  /**
   * Allocate student to a bed
   */
  public static allocateStudent(params: {
    studentId: string;
    hostelId: string;
    blockId: string;
    roomId: string;
    bedId: string;
    allocatedBy?: string;
    reason?: string;
  }): Allocation {
    const { studentId, hostelId, blockId, roomId, bedId, allocatedBy, reason } = params;

    const students = db.get('students');
    const student = students.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const users = db.get('users');
    const studentUser = users.find(u => u.id === student.userId);
    const studentName = studentUser ? studentUser.name : 'Unknown Student';

    const allocations = db.get('allocations');
    // Check if student already has an active allocation
    const existingActive = allocations.find(a => a.studentId === studentId && a.status === 'active');
    if (existingActive) {
      throw new Error(`Student ${studentName} already has an active room allocation (${existingActive.roomNumber || existingActive.roomId}). Please deallocate or initiate a transfer first.`);
    }

    const beds = db.get('beds');
    const bed = beds.find(b => b.id === bedId);
    if (!bed) throw new Error('Bed not found');
    if (bed.status === 'occupied') {
      throw new Error(`Bed ${bed.bedNumber} is already occupied.`);
    }

    const rooms = db.get('rooms');
    const room = rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found');
    if (room.occupiedBeds >= room.capacity) {
      throw new Error(`Room ${room.roomNumber} has reached its maximum capacity of ${room.capacity} students.`);
    }

    const hostels = db.get('hostels');
    const hostel = hostels.find(h => h.id === hostelId);

    const blocks = db.get('blocks');
    const block = blocks.find(b => b.id === blockId);

    // 1. Create Allocation Record
    const newAllocation: Allocation = {
      id: `alloc-${Date.now()}`,
      studentId,
      studentName,
      registrationNumber: student.registrationNumber,
      hostelId,
      hostelName: hostel ? hostel.name : 'Hostel',
      blockId,
      blockName: block ? block.name : 'Block',
      roomId,
      roomNumber: room.roomNumber,
      bedId,
      bedNumber: bed.bedNumber,
      allocationDate: new Date().toISOString(),
      status: 'active',
      reason: reason || 'Fresh Academic Term Allocation',
      allocatedBy: allocatedBy || 'Hostel Administrator',
      checkInDate: new Date().toISOString(),
    };

    allocations.unshift(newAllocation);
    db.set('allocations', allocations);

    // 2. Mark Bed as Occupied
    bed.status = 'occupied';
    bed.currentStudentId = studentId;
    bed.currentStudentName = studentName;
    db.set('beds', beds);

    // 3. Update Student User Assigned Hostel
    if (studentUser && hostelId) {
      studentUser.hostelId = hostelId;
      db.set('users', users);
    }

    // 4. Recalculate Occupancies
    this.refreshOccupancies();

    // 5. Send Notification
    const notifications = db.get('notifications');
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: student.userId,
      title: 'Hostel Room Allocated!',
      message: `You have been allocated Room ${room.roomNumber} (${bed.bedNumber}) at ${hostel?.name || 'the hostel'}.`,
      type: 'allocation',
      isRead: false,
      link: '/my-room',
      createdAt: new Date().toISOString(),
    });
    db.set('notifications', notifications);

    // 6. Audit Log
    const auditLogs = db.get('auditLogs');
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: allocatedBy || 'system',
      userName: allocatedBy || 'Admin',
      userRole: 'admin',
      action: 'ROOM_ALLOCATION',
      entity: 'Allocation',
      entityId: newAllocation.id,
      details: `Allocated ${room.roomNumber} (${bed.bedNumber}) to ${studentName} (${student.registrationNumber})`,
      newValue: newAllocation,
      timestamp: new Date().toISOString(),
    });
    db.set('auditLogs', auditLogs);

    return newAllocation;
  }

  /**
   * Request room transfer
   */
  public static requestTransfer(params: {
    studentId: string;
    newHostelId: string;
    newBlockId: string;
    newRoomId: string;
    newBedId: string;
    reason: string;
    requestedBy: string;
  }): RoomTransfer {
    const { studentId, newHostelId, newBlockId, newRoomId, newBedId, reason, requestedBy } = params;

    const allocations = db.get('allocations');
    const activeAlloc = allocations.find(a => a.studentId === studentId && a.status === 'active');
    if (!activeAlloc) {
      throw new Error('Student does not have an active room allocation to transfer from.');
    }

    const beds = db.get('beds');
    const newBed = beds.find(b => b.id === newBedId);
    if (!newBed) throw new Error('Target bed not found');
    if (newBed.status === 'occupied') {
      throw new Error('Target bed is currently occupied.');
    }

    const hostels = db.get('hostels');
    const newHostel = hostels.find(h => h.id === newHostelId);
    const blocks = db.get('blocks');
    const newBlock = blocks.find(b => b.id === newBlockId);
    const rooms = db.get('rooms');
    const newRoom = rooms.find(r => r.id === newRoomId);

    const transfers = db.get('transfers');
    const newTransfer: RoomTransfer = {
      id: `tr-${Date.now()}`,
      studentId,
      studentName: activeAlloc.studentName,
      oldHostelId: activeAlloc.hostelId,
      oldHostelName: activeAlloc.hostelName,
      oldBlockId: activeAlloc.blockId,
      oldBlockName: activeAlloc.blockName,
      oldRoomId: activeAlloc.roomId,
      oldRoomNumber: activeAlloc.roomNumber,
      oldBedId: activeAlloc.bedId,
      oldBedNumber: activeAlloc.bedNumber,
      newHostelId,
      newHostelName: newHostel?.name,
      newBlockId,
      newBlockName: newBlock?.name,
      newRoomId,
      newRoomNumber: newRoom?.roomNumber,
      newBedId,
      newBedNumber: newBed.bedNumber,
      requestedBy,
      requestDate: new Date().toISOString(),
      reason,
      status: 'pending',
    };

    transfers.unshift(newTransfer);
    db.set('transfers', transfers);

    return newTransfer;
  }

  /**
   * Approve room transfer
   */
  public static approveTransfer(transferId: string, approvedBy: string): RoomTransfer {
    const transfers = db.get('transfers');
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) throw new Error('Transfer request not found');
    if (transfer.status !== 'pending') throw new Error(`Transfer request is already ${transfer.status}`);

    const beds = db.get('beds');
    const newBed = beds.find(b => b.id === transfer.newBedId);
    if (!newBed || newBed.status === 'occupied') {
      throw new Error('Target bed is no longer available. Cannot approve transfer.');
    }

    const oldBed = beds.find(b => b.id === transfer.oldBedId);

    // 1. Mark Old Allocation as Transferred
    const allocations = db.get('allocations');
    const oldAlloc = allocations.find(a => a.studentId === transfer.studentId && a.status === 'active');
    if (oldAlloc) {
      oldAlloc.status = 'transferred';
      oldAlloc.deallocationDate = new Date().toISOString();
      oldAlloc.checkOutDate = new Date().toISOString();
    }

    // 2. Free Old Bed
    if (oldBed) {
      oldBed.status = 'available';
      delete oldBed.currentStudentId;
      delete oldBed.currentStudentName;
    }

    // 3. Assign New Bed
    newBed.status = 'occupied';
    newBed.currentStudentId = transfer.studentId;
    newBed.currentStudentName = transfer.studentName;
    db.set('beds', beds);

    // 4. Create New Active Allocation
    const newAlloc: Allocation = {
      id: `alloc-${Date.now()}`,
      studentId: transfer.studentId,
      studentName: transfer.studentName,
      hostelId: transfer.newHostelId,
      hostelName: transfer.newHostelName,
      blockId: transfer.newBlockId,
      blockName: transfer.newBlockName,
      roomId: transfer.newRoomId,
      roomNumber: transfer.newRoomNumber,
      bedId: transfer.newBedId,
      bedNumber: transfer.newBedNumber,
      allocationDate: new Date().toISOString(),
      status: 'active',
      reason: `Transferred from ${transfer.oldRoomNumber || 'old room'}: ${transfer.reason}`,
      allocatedBy: approvedBy,
      checkInDate: new Date().toISOString(),
    };
    allocations.unshift(newAlloc);
    db.set('allocations', allocations);

    // 5. Update Transfer Record
    transfer.status = 'approved';
    transfer.approvedBy = approvedBy;
    transfer.approvalDate = new Date().toISOString();
    db.set('transfers', transfers);

    // 6. Recalculate Occupancy
    this.refreshOccupancies();

    // 7. Notification & Audit Log
    const students = db.get('students');
    const student = students.find(s => s.id === transfer.studentId);
    if (student) {
      const notifications = db.get('notifications');
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: student.userId,
        title: 'Room Transfer Approved!',
        message: `Your transfer to ${transfer.newRoomNumber} (${transfer.newBedNumber}) has been approved. You may now check in.`,
        type: 'transfer',
        isRead: false,
        link: '/my-room',
        createdAt: new Date().toISOString(),
      });
      db.set('notifications', notifications);
    }

    const auditLogs = db.get('auditLogs');
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: approvedBy,
      userName: approvedBy,
      userRole: 'warden',
      action: 'ROOM_TRANSFER_APPROVED',
      entity: 'RoomTransfer',
      entityId: transfer.id,
      details: `Approved transfer for ${transfer.studentName} from ${transfer.oldRoomNumber} to ${transfer.newRoomNumber}`,
      timestamp: new Date().toISOString(),
    });
    db.set('auditLogs', auditLogs);

    return transfer;
  }

  /**
   * Reject room transfer
   */
  public static rejectTransfer(transferId: string, rejectedBy: string, reason?: string): RoomTransfer {
    const transfers = db.get('transfers');
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) throw new Error('Transfer request not found');

    transfer.status = 'rejected';
    transfer.approvedBy = rejectedBy;
    transfer.approvalDate = new Date().toISOString();
    if (reason) transfer.reason += ` [Rejection Reason: ${reason}]`;
    db.set('transfers', transfers);

    return transfer;
  }

  /**
   * Deallocate student (Free bed, mark allocation deallocated, preserve history)
   */
  public static deallocateStudent(allocationId: string, deallocatedBy: string, reason?: string): Allocation {
    const allocations = db.get('allocations');
    const allocation = allocations.find(a => a.id === allocationId);
    if (!allocation) throw new Error('Allocation record not found');
    if (allocation.status !== 'active') throw new Error(`Allocation is already ${allocation.status}`);

    const beds = db.get('beds');
    const bed = beds.find(b => b.id === allocation.bedId);
    if (bed) {
      bed.status = 'available';
      delete bed.currentStudentId;
      delete bed.currentStudentName;
      db.set('beds', beds);
    }

    allocation.status = 'deallocated';
    allocation.deallocationDate = new Date().toISOString();
    allocation.checkOutDate = new Date().toISOString();
    if (reason) allocation.reason = `Deallocated: ${reason}`;
    db.set('allocations', allocations);

    this.refreshOccupancies();

    // Audit log
    const auditLogs = db.get('auditLogs');
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: deallocatedBy,
      userName: deallocatedBy,
      userRole: 'admin',
      action: 'ROOM_DEALLOCATION',
      entity: 'Allocation',
      entityId: allocation.id,
      details: `Deallocated ${allocation.studentName} from Room ${allocation.roomNumber} (${allocation.bedNumber})`,
      timestamp: new Date().toISOString(),
    });
    db.set('auditLogs', auditLogs);

    return allocation;
  }
}
