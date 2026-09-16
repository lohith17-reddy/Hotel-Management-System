import { Hostel, Block, Room, Bed } from '../../../src/types/index.ts';

export const seedHostels: Hostel[] = [
  {
    id: 'h-cvr-1',
    name: 'C.V. Raman Boys Hostel',
    hostelCode: 'CVR-BH1',
    gender: 'male',
    address: 'North Campus, Engineering Block East, University Grounds',
    numberOfBlocks: 2,
    status: 'active',
    wardenId: 'u-warden-1',
    wardenName: 'Prof. Rajesh Sharma',
    capacity: 40,
    occupancy: 24,
  },
  {
    id: 'h-sng-2',
    name: 'Sarojini Naidu Girls Hostel',
    hostelCode: 'SNG-GH2',
    gender: 'female',
    address: 'South Campus, Science Enclave, University Grounds',
    numberOfBlocks: 2,
    status: 'active',
    wardenId: 'u-warden-2',
    wardenName: 'Dr. Sunita Deshmukh',
    capacity: 36,
    occupancy: 20,
  }
];

export const seedBlocks: Block[] = [
  {
    id: 'b-cvr-a',
    hostelId: 'h-cvr-1',
    name: 'Block A (Main Wing)',
    floors: 3,
    status: 'active',
  },
  {
    id: 'b-cvr-b',
    hostelId: 'h-cvr-1',
    name: 'Block B (Deluxe Wing)',
    floors: 2,
    status: 'active',
  },
  {
    id: 'b-sng-a',
    hostelId: 'h-sng-2',
    name: 'Block A (Sunrise Wing)',
    floors: 3,
    status: 'active',
  },
  {
    id: 'b-sng-b',
    hostelId: 'h-sng-2',
    name: 'Block B (Meadow Wing)',
    floors: 2,
    status: 'active',
  }
];

export const seedRooms: Room[] = [
  // CVR Block A (Boys)
  {
    id: 'r-cvr-101',
    hostelId: 'h-cvr-1',
    blockId: 'b-cvr-a',
    roomNumber: 'A-101',
    floor: 1,
    roomType: 'quad',
    capacity: 4,
    occupiedBeds: 3,
    status: 'available',
  },
  {
    id: 'r-cvr-102',
    hostelId: 'h-cvr-1',
    blockId: 'b-cvr-a',
    roomNumber: 'A-102',
    floor: 1,
    roomType: 'quad',
    capacity: 4,
    occupiedBeds: 4,
    status: 'occupied',
  },
  {
    id: 'r-cvr-201',
    hostelId: 'h-cvr-1',
    blockId: 'b-cvr-a',
    roomNumber: 'A-201',
    floor: 2,
    roomType: 'double',
    capacity: 2,
    occupiedBeds: 1,
    status: 'available',
  },
  {
    id: 'r-cvr-202',
    hostelId: 'h-cvr-1',
    blockId: 'b-cvr-a',
    roomNumber: 'A-202',
    floor: 2,
    roomType: 'single',
    capacity: 1,
    occupiedBeds: 1,
    status: 'occupied',
  },
  // CVR Block B (Boys)
  {
    id: 'r-cvr-b101',
    hostelId: 'h-cvr-1',
    blockId: 'b-cvr-b',
    roomNumber: 'B-101',
    floor: 1,
    roomType: 'double',
    capacity: 2,
    occupiedBeds: 0,
    status: 'available',
  },
  // SNG Block A (Girls)
  {
    id: 'r-sng-101',
    hostelId: 'h-sng-2',
    blockId: 'b-sng-a',
    roomNumber: 'G-101',
    floor: 1,
    roomType: 'triple',
    capacity: 3,
    occupiedBeds: 2,
    status: 'available',
  },
  {
    id: 'r-sng-102',
    hostelId: 'h-sng-2',
    blockId: 'b-sng-a',
    roomNumber: 'G-102',
    floor: 1,
    roomType: 'triple',
    capacity: 3,
    occupiedBeds: 3,
    status: 'occupied',
  },
  {
    id: 'r-sng-201',
    hostelId: 'h-sng-2',
    blockId: 'b-sng-a',
    roomNumber: 'G-201',
    floor: 2,
    roomType: 'double',
    capacity: 2,
    occupiedBeds: 1,
    status: 'available',
  },
  // SNG Block B (Girls)
  {
    id: 'r-sng-b101',
    hostelId: 'h-sng-2',
    blockId: 'b-sng-b',
    roomNumber: 'GB-101',
    floor: 1,
    roomType: 'double',
    capacity: 2,
    occupiedBeds: 0,
    status: 'available',
  }
];

export const seedBeds: Bed[] = [
  // Room A-101 (4 beds, 3 occupied, 1 available)
  { id: 'bed-cvr-101-a', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-101', bedNumber: 'Bed 1', status: 'occupied', currentStudentId: 's-1', currentStudentName: 'Rohan Verma' },
  { id: 'bed-cvr-101-b', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-101', bedNumber: 'Bed 2', status: 'occupied', currentStudentId: 's-3', currentStudentName: 'Aditya Kulkarni' },
  { id: 'bed-cvr-101-c', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-101', bedNumber: 'Bed 3', status: 'occupied', currentStudentId: 's-6', currentStudentName: 'Sameer Khan' },
  { id: 'bed-cvr-101-d', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-101', bedNumber: 'Bed 4', status: 'available' },

  // Room A-102 (4 beds, 4 occupied)
  { id: 'bed-cvr-102-a', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-102', bedNumber: 'Bed 1', status: 'occupied', currentStudentId: 's-8', currentStudentName: 'Vikram Mehta' },
  { id: 'bed-cvr-102-b', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-102', bedNumber: 'Bed 2', status: 'occupied', currentStudentId: 's-10', currentStudentName: 'Aryan Das' },
  { id: 'bed-cvr-102-c', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-102', bedNumber: 'Bed 3', status: 'occupied', currentStudentId: 's-1', currentStudentName: 'Assigned Occupant' },
  { id: 'bed-cvr-102-d', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-102', bedNumber: 'Bed 4', status: 'occupied', currentStudentId: 's-3', currentStudentName: 'Assigned Occupant' },

  // Room A-201 (2 beds, 1 occupied, 1 available)
  { id: 'bed-cvr-201-a', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-201', bedNumber: 'Bed 1', status: 'occupied', currentStudentId: 's-8', currentStudentName: 'Senior Scholar' },
  { id: 'bed-cvr-201-b', hostelId: 'h-cvr-1', blockId: 'b-cvr-a', roomId: 'r-cvr-201', bedNumber: 'Bed 2', status: 'available' },

  // Room B-101 (2 beds, 2 available)
  { id: 'bed-cvr-b101-a', hostelId: 'h-cvr-1', blockId: 'b-cvr-b', roomId: 'r-cvr-b101', bedNumber: 'Bed 1', status: 'available' },
  { id: 'bed-cvr-b101-b', hostelId: 'h-cvr-1', blockId: 'b-cvr-b', roomId: 'r-cvr-b101', bedNumber: 'Bed 2', status: 'available' },

  // Room G-101 (3 beds, 2 occupied, 1 available)
  { id: 'bed-sng-101-a', hostelId: 'h-sng-2', blockId: 'b-sng-a', roomId: 'r-sng-101', bedNumber: 'Bed 1', status: 'occupied', currentStudentId: 's-2', currentStudentName: 'Ananya Iyer' },
  { id: 'bed-sng-101-b', hostelId: 'h-sng-2', blockId: 'b-sng-a', roomId: 'r-sng-101', bedNumber: 'Bed 2', status: 'occupied', currentStudentId: 's-4', currentStudentName: 'Priya Sen' },
  { id: 'bed-sng-101-c', hostelId: 'h-sng-2', blockId: 'b-sng-a', roomId: 'r-sng-101', bedNumber: 'Bed 3', status: 'available' },

  // Room G-102 (3 beds, 3 occupied)
  { id: 'bed-sng-102-a', hostelId: 'h-sng-2', blockId: 'b-sng-a', roomId: 'r-sng-102', bedNumber: 'Bed 1', status: 'occupied', currentStudentId: 's-5', currentStudentName: 'Kavya Nair' },
  { id: 'bed-sng-102-b', hostelId: 'h-sng-2', blockId: 'b-sng-a', roomId: 'r-sng-102', bedNumber: 'Bed 2', status: 'occupied', currentStudentId: 's-7', currentStudentName: 'Neha Gupta' },
  { id: 'bed-sng-102-c', hostelId: 'h-sng-2', blockId: 'b-sng-a', roomId: 'r-sng-102', bedNumber: 'Bed 3', status: 'occupied', currentStudentId: 's-9', currentStudentName: 'Tanvi Joshi' },

  // Room G-201 (2 beds, 1 occupied, 1 available)
  { id: 'bed-sng-201-a', hostelId: 'h-sng-2', blockId: 'b-sng-a', roomId: 'r-sng-201', bedNumber: 'Bed 1', status: 'occupied', currentStudentId: 's-9', currentStudentName: 'Resident Student' },
  { id: 'bed-sng-201-b', hostelId: 'h-sng-2', blockId: 'b-sng-a', roomId: 'r-sng-201', bedNumber: 'Bed 2', status: 'available' },

  // Room GB-101 (2 beds, 2 available)
  { id: 'bed-sng-b101-a', hostelId: 'h-sng-2', blockId: 'b-sng-b', roomId: 'r-sng-b101', bedNumber: 'Bed 1', status: 'available' },
  { id: 'bed-sng-b101-b', hostelId: 'h-sng-2', blockId: 'b-sng-b', roomId: 'r-sng-b101', bedNumber: 'Bed 2', status: 'available' }
];
