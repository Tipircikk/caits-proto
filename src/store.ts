import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Complaint, LicensePlateInfo, SAMPLE_PLATE_DATA, User, INITIAL_USERS, UserRole, Department } from './types';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

interface AppStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  users: User[];
  pendingUsers: User[];
  complaints: Complaint[];
  plateData: LicensePlateInfo[];
  deviceData: {
    gpsLocation: string;
    cameraStatus: string;
    vehicleStatus: string;
    engineRunning: boolean;
    autoParking: boolean;
  };
  socket: typeof socket;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  resetPassword: (username: string, email: string) => Promise<void>;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'timestamp'>) => void;
  resolveComplaint: (id: number, policeStation: string) => void;
  getPlateInfo: (plate: string) => LicensePlateInfo | undefined;
  updateDeviceData: (data: any) => void;
  addPlateInfo: (plateInfo: LicensePlateInfo) => void;
  removePlateInfo: (plate: string) => void;
  updateVehicleStatus: (complaintId: number, engineRunning: boolean, autoParking: boolean) => void;
  canApproveUsers: (user: User) => boolean;
}

// Kullanıcının onay yetkisi olup olmadığını kontrol eden fonksiyon
const hasApprovalAuthority = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.POLICE_CHIEF,
    UserRole.GENDARMERIE_COMMANDER
  ].includes(role);
};

const store = (set: any, get: any) => ({
  isAuthenticated: false,
  isLoading: false,
  currentUser: null,
  users: INITIAL_USERS,
  pendingUsers: [],
  complaints: [],
  plateData: SAMPLE_PLATE_DATA,
  deviceData: {
    gpsLocation: "Bekleniyor...",
    cameraStatus: "Bekleniyor...",
    vehicleStatus: "Bekleniyor...",
    engineRunning: false,
    autoParking: false
  },
  socket,
  
  canApproveUsers: (user: User): boolean => {
    if (!user) return false;
    return hasApprovalAuthority(user.role);
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = get().users.find((u: User) => u.username === username && u.isApproved);
    
    if (user) {
      if (user.role === UserRole.ADMIN && password === 'Admin2024!') {
        set({ isAuthenticated: true, currentUser: user, isLoading: false });
        return true;
      }
      
      if (user.role !== UserRole.ADMIN && password === 'User123!') {
        set({ isAuthenticated: true, currentUser: user, isLoading: false });
        return true;
      }
    }
    
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    set({ isAuthenticated: false, currentUser: null });
    window.location.href = '/login';
  },

  register: async (userData: any) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: userData.username,
      role: userData.role,
      name: userData.name,
      department: userData.department,
      isApproved: userData.role === UserRole.CITIZEN,
      email: userData.email,
      phone: userData.phone,
      station: userData.station,
      stationType: userData.stationType
    };
    
    if (newUser.role === UserRole.CITIZEN) {
      set((state: AppStore) => ({
        users: [...state.users, newUser],
        isLoading: false
      }));
    } else {
      set((state: AppStore) => ({
        pendingUsers: [...state.pendingUsers, newUser],
        isLoading: false
      }));
      
      // Onay yetkisi olan tüm kullanıcılar için bildirim güncelle
      const currentUser = get().currentUser;
      if (currentUser && hasApprovalAuthority(currentUser.role)) {
        const unreadCount = get().pendingUsers.length + 1;
        document.title = `(${unreadCount}) İhbar Takip Sistemi`;
      }
    }
  },

  resetPassword: async (username: string, email: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = get().users.find((u: User) => u.username === username && u.email === email);
    if (!user) {
      set({ isLoading: false });
      throw new Error('Kullanıcı bulunamadı');
    }
    
    set({ isLoading: false });
  },

  approveUser: (userId: string) => {
    const user = get().pendingUsers.find((u: User) => u.id === userId);
    if (user) {
      set((state: AppStore) => ({
        users: [...state.users, { ...user, isApproved: true }],
        pendingUsers: state.pendingUsers.filter(u => u.id !== userId)
      }));
    }
  },

  rejectUser: (userId: string) => {
    set((state: AppStore) => ({
      pendingUsers: state.pendingUsers.filter(u => u.id !== userId)
    }));
  },

  addComplaint: (complaint: Omit<Complaint, 'id' | 'timestamp'>) =>
    set((state: AppStore) => ({
      complaints: [
        ...state.complaints,
        {
          ...complaint,
          id: state.complaints.length + 1,
          timestamp: new Date(),
          engineRunning: false,
          autoParking: false
        },
      ],
    })),

  resolveComplaint: (id: number, policeStation: string) =>
    set((state: AppStore) => {
      const complaint = state.complaints.find(c => c.id === id);
      if (complaint) {
        socket.emit('complaintResolved', {
          plate: complaint.licensePlate,
          policeStation,
          engineRunning: complaint.engineRunning,
          autoParking: complaint.autoParking
        });
      }
      return {
        complaints: state.complaints.map((complaint) =>
          complaint.id === id
            ? { ...complaint, isResolved: true }
            : complaint
        ),
      };
    }),

  getPlateInfo: (plate: string) => {
    const state = get();
    return state.plateData.find((p: LicensePlateInfo) => p.plate === plate);
  },

  updateDeviceData: (data: any) => {
    set({ deviceData: data });
    socket.emit('deviceUpdate', data);
  },

  addPlateInfo: (plateInfo: LicensePlateInfo) =>
    set((state: AppStore) => ({
      plateData: [...state.plateData, plateInfo],
    })),

  removePlateInfo: (plate: string) =>
    set((state: AppStore) => ({
      plateData: state.plateData.filter(p => p.plate !== plate),
    })),

  updateVehicleStatus: (complaintId: number, engineRunning: boolean, autoParking: boolean) =>
    set((state: AppStore) => ({
      complaints: state.complaints.map(complaint =>
        complaint.id === complaintId
          ? { ...complaint, engineRunning, autoParking }
          : complaint
      )
    }))
});

export const useStore = create<AppStore>()(
  persist(
    store,
    {
      name: 'caies-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        users: state.users,
        pendingUsers: state.pendingUsers,
        complaints: state.complaints,
        plateData: state.plateData,
        deviceData: state.deviceData
      })
    }
  )
);

socket.on('updateData', (data) => {
  useStore.getState().updateDeviceData(data);
});

socket.on('notificationSent', (response) => {
  if (!response.success) {
    console.error('Bildirim gönderilemedi:', response.error);
  }
});