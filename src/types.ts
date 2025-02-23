export enum UserRole {
  ADMIN = 'ADMIN',
  POLICE_CHIEF = 'POLICE_CHIEF',      // Başkomiser
  GENDARMERIE_COMMANDER = 'GENDARMERIE_COMMANDER', // Jandarma Komutanı
  POLICE_OFFICER = 'POLICE_OFFICER',   // Polis
  GENDARMERIE = 'GENDARMERIE',        // Jandarma
  CITIZEN = 'CITIZEN'                  // Vatandaş
}

export enum Department {
  POLICE = 'POLICE',
  GENDARMERIE = 'GENDARMERIE',
  CITIZEN = 'CITIZEN'
}

export interface User {
  id: string;
  username: string; // TC Kimlik No
  role: UserRole;
  name: string;
  department: Department;
  isApproved: boolean;
  email: string;
  phone: string;
  station?: string;
  stationType?: 'POLICE' | 'GENDARMERIE';
}

export interface Complaint {
  id: number;
  title: string;
  licensePlate: string;
  gpsLocation: string;
  cameraStatus: string;
  vehicleStatus: string;
  isResolved: boolean;
  policeStation?: string;
  timestamp: Date;
  engineRunning: boolean;
  autoParking: boolean;
}

export interface LicensePlateInfo {
  plate: string;
  owner: string;
  vehicle: string;
  color: string;
  phone: string;
  email: string;
  tcNo: string;
}

export const SAMPLE_PLATE_DATA: LicensePlateInfo[] = [
  { 
    plate: "34 ABC 123", 
    owner: "Ahmet Yılmaz", 
    vehicle: "Toyota Corolla", 
    color: "Beyaz",
    phone: "0532 123 4567",
    email: "ahmet@example.com",
    tcNo: "12345678901"
  },
  { 
    plate: "06 XYZ 789", 
    owner: "Mehmet Demir", 
    vehicle: "Honda Civic", 
    color: "Siyah",
    phone: "0533 987 6543",
    email: "mehmet@example.com",
    tcNo: "98765432109"
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: "admin",
    username: "11111111111", // Admin TC
    role: UserRole.ADMIN,
    name: "Sistem Yöneticisi",
    department: Department.POLICE,
    isApproved: true,
    email: "admin@ihbartakip.gov.tr",
    phone: "5551234567",
    station: "Emniyet Genel Müdürlüğü",
    stationType: "POLICE"
  }
];