// frontend/src/utils/guestStorage.ts
// Utility functions for managing guest cart and wishlist in localStorage

const GUEST_CART_KEY = 'guest_cart';
const GUEST_WISHLIST_KEY = 'guest_wishlist';

// ============ GUEST CART FUNCTIONS ============

export interface GuestCartItem {
    variantId: string;
    quantity: number;
}

export const getGuestCart = (): GuestCartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading guest cart:', error);
        return [];
    }
};

export const setGuestCart = (items: GuestCartItem[]): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving guest cart:', error);
    }
};

export const addToGuestCart = (variantId: string, quantity: number = 1): void => {
    const cart = getGuestCart();
    const existingIndex = cart.findIndex(item => item.variantId === variantId);

    if (existingIndex > -1) {
        // Update quantity for existing item
        cart[existingIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({ variantId, quantity });
    }

    setGuestCart(cart);
};

export const updateGuestCartQuantity = (variantId: string, quantity: number): void => {
    const cart = getGuestCart();
    const existingIndex = cart.findIndex(item => item.variantId === variantId);

    if (existingIndex > -1) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.splice(existingIndex, 1);
        } else {
            cart[existingIndex].quantity = quantity;
        }
        setGuestCart(cart);
    }
};

export const removeFromGuestCart = (variantId: string): void => {
    const cart = getGuestCart();
    const filtered = cart.filter(item => item.variantId !== variantId);
    setGuestCart(filtered);
};

export const clearGuestCart = (): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
        console.error('Error clearing guest cart:', error);
    }
};

export const getGuestCartCount = (): number => {
    const cart = getGuestCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
};

// ============ GUEST WISHLIST FUNCTIONS ============

export const getGuestWishlist = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading guest wishlist:', error);
        return [];
    }
};

export const setGuestWishlist = (productIds: string[]): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(productIds));
    } catch (error) {
        console.error('Error saving guest wishlist:', error);
    }
};

export const addToGuestWishlist = (productId: string): void => {
    const wishlist = getGuestWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        setGuestWishlist(wishlist);
    }
};

export const removeFromGuestWishlist = (productId: string): void => {
    const wishlist = getGuestWishlist();
    const filtered = wishlist.filter(id => id !== productId);
    setGuestWishlist(filtered);
};

export const isInGuestWishlist = (productId: string): boolean => {
    const wishlist = getGuestWishlist();
    return wishlist.includes(productId);
};

export const clearGuestWishlist = (): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(GUEST_WISHLIST_KEY);
    } catch (error) {
        console.error('Error clearing guest wishlist:', error);
    }
};

export const getGuestWishlistCount = (): number => {
    return getGuestWishlist().length;
};

// ============ COMBINED FUNCTIONS ============

export const clearAllGuestData = (): void => {
    clearGuestCart();
    clearGuestWishlist();
};

export const hasGuestData = (): boolean => {
    return getGuestCart().length > 0 || getGuestWishlist().length > 0;
};
