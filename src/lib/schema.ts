import {
    pgTable, serial, text, integer, boolean, numeric,
    timestamp, jsonb, unique, index, check,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// ==================== USERS ====================
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    uid: text("uid").unique().notNull(),
    username: text("username").unique().notNull(),
    email: text("email").unique().notNull(),
    displayName: text("display_name"),
    phone: text("phone"),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("customer"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),
}));

// ==================== CATEGORIES ====================
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

// ==================== PRODUCTS ====================
export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en"),
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    imageUrl: text("image_url"),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
    index("idx_products_category").on(table.categoryId),
    index("idx_products_active").on(table.active),
]);

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
    units: many(productUnits),
}));

// ==================== PRODUCT UNITS ====================
export const productUnits = pgTable("product_units", {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    unit: text("unit").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    isDefault: boolean("is_default").default(false),
}, (table) => [
    unique().on(table.productId, table.unit),
    index("idx_product_units_product").on(table.productId),
]);

export const productUnitsRelations = relations(productUnits, ({ one }) => ({
    product: one(products, { fields: [productUnits.productId], references: [products.id] }),
}));

// ==================== DELIVERY ZONES ====================
export const deliveryZones = pgTable("delivery_zones", {
    id: serial("id").primaryKey(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en"),
    fee: numeric("fee", { precision: 10, scale: 2 }).notNull().default("0"),
    active: boolean("active").default(true),
    sortOrder: integer("sort_order").default(0),
});

// ==================== OFFERS ====================
export const offers = pgTable("offers", {
    id: serial("id").primaryKey(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en"),
    subtitleAr: text("subtitle_ar"),
    subtitleEn: text("subtitle_en"),
    imageUrl: text("image_url"),
    priority: integer("priority").default(0),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==================== ORDERS ====================
export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    zoneId: integer("zone_id").references(() => deliveryZones.id),
    zoneName: text("zone_name"),
    street: text("street"),
    building: text("building"),
    addressDetails: text("address_details"),
    locationLink: text("location_link"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: text("payment_method").default("COD"),
    status: text("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    acceptedBy: integer("accepted_by").references(() => users.id),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    rejectedBy: integer("rejected_by").references(() => users.id),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
    index("idx_orders_user").on(table.userId),
    index("idx_orders_status").on(table.status),
    index("idx_orders_created").on(table.createdAt),
]);

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, { fields: [orders.userId], references: [users.id] }),
    zone: one(deliveryZones, { fields: [orders.zoneId], references: [deliveryZones.id] }),
    items: many(orderItems),
    statusHistory: many(orderStatusHistory),
}));

// ==================== ORDER ITEMS ====================
export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en"),
    unit: text("unit").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    qty: integer("qty").notNull(),
    lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
    imageUrl: text("image_url"),
}, (table) => [
    index("idx_order_items_order").on(table.orderId),
]);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
    product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// ==================== ORDER STATUS HISTORY ====================
export const orderStatusHistory = pgTable("order_status_history", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    changedBy: integer("changed_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
    order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
    user: one(users, { fields: [orderStatusHistory.changedBy], references: [users.id] }),
}));

// ==================== SETTINGS ====================
export const settings = pgTable("settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
