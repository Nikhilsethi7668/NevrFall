import {create} from 'zustand';

interface OrderState {
  coupon: string;
  setCoupon: (coupon: string) => void;
  address: any; // You might want to define a proper type for the address
  setAddress: (address: any) => void;
  cartRecomendation: any[];
  setCartRecomendation: (cartRecomendation: any[]) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  coupon: '',
  setCoupon: (coupon) => set({ coupon }),
  address: null,
  setAddress: (address) => set({ address }),
  cartRecomendation: [],
  setCartRecomendation: (cartRecomendation) => set({ cartRecomendation }),
}));