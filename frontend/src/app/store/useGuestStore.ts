// frontend/src/app/store/useGuestStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GuestCartItem {
    variantId: string;
    quantity: number;
}

interface GuestStore {
    // Guest Cart State
    guestCart: GuestCartItem[];
    guestWishlist: string[];

    // Cart Actions
    addToGuestCart: (variantId: string, quantity?: number) => void;
    removeFromGuestCart: (variantId: string) => void;
    updateGuestCartQuantity: (variantId: string, quantity: number) => void;
    clearGuestCart: () => void;
    getGuestCartCount: () => number;

    // Wishlist Actions
    addToGuestWishlist: (productId: string) => void;
    removeFromGuestWishlist: (productId: string) => void;
    toggleGuestWishlist: (productId: string) => void;
    isInGuestWishlist: (productId: string) => boolean;
    clearGuestWishlist: () => void;
    getGuestWishlistCount: () => number;

    // Combined Actions
    clearAllGuestData: () => void;
    hasGuestData: () => boolean;
}

export const useGuestStore = create<GuestStore>()(
    persist(
        (set, get) => ({
            // Initial State
            guestCart: [],
            guestWishlist: [],

            // Cart Actions
            addToGuestCart: (variantId: string, quantity: number = 1) => {
                set((state) => {
                    const existingIndex = state.guestCart.findIndex(
                        (item) => item.variantId === variantId
                    );

                    if (existingIndex > -1) {
                        // Update quantity for existing item
                        const newCart = [...state.guestCart];
                        newCart[existingIndex].quantity += quantity;
                        return { guestCart: newCart };
                    } else {
                        // Add new item
                        return {
                            guestCart: [...state.guestCart, { variantId, quantity }],
                        };
                    }
                });
            },

            removeFromGuestCart: (variantId: string) => {
                set((state) => ({
                    guestCart: state.guestCart.filter((item) => item.variantId !== variantId),
                }));
            },

            updateGuestCartQuantity: (variantId: string, quantity: number) => {
                set((state) => {
                    if (quantity <= 0) {
                        // Remove item if quantity is 0 or less
                        return {
                            guestCart: state.guestCart.filter((item) => item.variantId !== variantId),
                        };
                    }

                    const existingIndex = state.guestCart.findIndex(
                        (item) => item.variantId === variantId
                    );

                    if (existingIndex > -1) {
                        const newCart = [...state.guestCart];
                        newCart[existingIndex].quantity = quantity;
                        return { guestCart: newCart };
                    }

                    return state;
                });
            },

            clearGuestCart: () => {
                set({ guestCart: [] });
            },

            getGuestCartCount: () => {
                return get().guestCart.reduce((total, item) => total + item.quantity, 0);
            },

            // Wishlist Actions
            addToGuestWishlist: (productId: string) => {
                set((state) => {
                    if (!state.guestWishlist.includes(productId)) {
                        return {
                            guestWishlist: [...state.guestWishlist, productId],
                        };
                    }
                    return state;
                });
            },

            removeFromGuestWishlist: (productId: string) => {
                set((state) => ({
                    guestWishlist: state.guestWishlist.filter((id) => id !== productId),
                }));
            },

            toggleGuestWishlist: (productId: string) => {
                set((state) => {
                    if (state.guestWishlist.includes(productId)) {
                        return {
                            guestWishlist: state.guestWishlist.filter((id) => id !== productId),
                        };
                    } else {
                        return {
                            guestWishlist: [...state.guestWishlist, productId],
                        };
                    }
                });
            },

            isInGuestWishlist: (productId: string) => {
                return get().guestWishlist.includes(productId);
            },

            clearGuestWishlist: () => {
                set({ guestWishlist: [] });
            },

            getGuestWishlistCount: () => {
                return get().guestWishlist.length;
            },

            // Combined Actions
            clearAllGuestData: () => {
                set({ guestCart: [], guestWishlist: [] });
            },

            hasGuestData: () => {
                const state = get();
                return state.guestCart.length > 0 || state.guestWishlist.length > 0;
            },
        }),
        {
            name: 'guest-storage', // localStorage key
            partialize: (state) => ({
                guestCart: state.guestCart,
                guestWishlist: state.guestWishlist,
            }),
        }
    )
);
