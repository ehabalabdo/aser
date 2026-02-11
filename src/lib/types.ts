export type Role = "customer" | "cashier" | "admin";

export interface UserProfile {
    id: number;
    uid: string;
    username: string;
    email: string;
    displayName: string | null;
    phone: string | null;
    role: Role;
    createdAt: string;
}

export interface Category {
    id: number;
    nameAr: string;
    nameEn?: string | null;
    sortOrder: number;
}

export interface UnitPrice {
    id: number;
    unit: string;
    price: number;
    isDefault: boolean;
}

export interface Product {
    id: number;
    nameAr: string;
    nameEn?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    categoryId?: number | null;
    imageUrl?: string | null;
    active: boolean;
    units: UnitPrice[];
    createdAt: string;
    updatedAt: string;
}

export interface Offer {
    id: number;
    titleAr: string;
    titleEn?: string | null;
    subtitleAr?: string | null;
    subtitleEn?: string | null;
    imageUrl?: string | null;
    priority: number;
    active: boolean;
    createdAt: string;
}

export interface DeliveryZone {
    id: number;
    nameAr: string;
    nameEn?: string | null;
    fee: number;
    active: boolean;
    sortOrder: number;
}

export interface CartItem {
    productId: number;
    nameAr: string;
    nameEn?: string | null;
    price: number;
    qty: number;
    unit: string;
    imageUrl?: string | null;
    cartKey?: string;
}

export interface OrderAddress {
    zoneId: number;
    zoneName: string;
    street: string;
    building: string;
    details?: string;
    locationLink?: string;
}

export type OrderStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "preparing"
    | "out_for_delivery"
    | "delivered";

export interface OrderItem {
    id: number;
    productId: number | null;
    nameAr: string;
    nameEn?: string | null;
    unit: string;
    price: number;
    qty: number;
    lineTotal: number;
    imageUrl?: string | null;
}

export interface OrderStatusEntry {
    id: number;
    status: string;
    changedBy?: number | null;
    createdAt: string;
}

export interface Order {
    id: number;
    userId: number;
    customer?: {
        name: string;
        email: string;
        phone: string;
    };
    address: OrderAddress;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: string;
    status: OrderStatus;
    rejectionReason?: string | null;
    statusHistory: OrderStatusEntry[];
    createdAt: string;
    updatedAt: string;
}
