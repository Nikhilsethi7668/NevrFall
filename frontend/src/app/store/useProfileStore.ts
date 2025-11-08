import {create} from 'zustand';

interface ProfileState {
  activeTab: string;
  isLoggedIn: boolean;
  setActiveTab: (tab: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  activeTab: 'overview',
  isLoggedIn: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
}));
