export type Role = 'customer' | 'cashier' | 'admin';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    role: Role;
    createdAt: number; // timestamp
}

export interface VerificationRequest {
    uid: string;
}

export interface Category {
    id: string;
    nameAr: string;
    nameEn?: string; // Added
    order: number;
}

export interface Product {
    id: string;
    nameAr: string;
    nameEn?: string; // Added
    descriptionAr: string;
    descriptionEn?: string; // Added
    price: number;
    unit: string;
    imageUrl?: string;
    categoryId?: string;
    active: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface Offer {
    id: string;
    titleAr: string;
    titleEn?: string; // Added
    subtitleAr?: string;
    subtitleEn?: string; // Added
    imageUrl?: string;
    priority: number;
    active: boolean;
    createdAt: number;
}

export interface DeliveryZone {
    id: string;
    nameAr: string;
    nameEn?: string; // Added
    fee: number;
    active: boolean;
    order: number;
}

export interface CartItem {
    productId: string;
    nameAr: string;
    nameEn?: string; // Added
    price: number;
    qty: number;
    unit: string;
    imageUrl?: string;
}

export interface OrderAddress {
    zoneId: string;
    zoneName: string;
    street: string;
    building: string;
    details?: string;
    locationLink?: string; // Optional Google Maps link
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'preparing' | 'out_for_delivery' | 'delivered';

export interface Order {
    id: string;
    userId: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    address: OrderAddress;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: 'COD'; // Cash On Delivery
    status: OrderStatus;
    createdAt: number; // timestamp

    // Workflow fields
    acceptedBy?: string;
    acceptedAt?: number;
    rejectedBy?: string;
    rejectedAt?: number;
    rejectionReason?: string;

    statusHistory: {
        status: OrderStatus;
        at: number;
        by?: string;
    }[];
}
