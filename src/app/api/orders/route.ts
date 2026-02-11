import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, products, productUnits, deliveryZones, users } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// POST: Create order
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { items, address } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
        }
        if (!address?.zoneId || !address?.street || !address?.building) {
            return NextResponse.json({ error: "بيانات العنوان ناقصة" }, { status: 400 });
        }

        // Verify prices from DB
        let subtotal = 0;
        const verifiedItems: { productId: number; nameAr: string; nameEn: string | null; unit: string; price: number; qty: number; lineTotal: number; imageUrl: string | null }[] = [];

        for (const item of items) {
            const [product] = await db.select().from(products).where(and(eq(products.id, item.productId), eq(products.active, true))).limit(1);
            if (!product) {
                return NextResponse.json({ error: `المنتج غير موجود أو غير فعال` }, { status: 400 });
            }

            // Verify the unit price from DB
            const [unitData] = await db.select().from(productUnits).where(and(eq(productUnits.productId, item.productId), eq(productUnits.unit, item.unit))).limit(1);
            if (!unitData) {
                return NextResponse.json({ error: `الوحدة ${item.unit} غير متوفرة للمنتج ${product.nameAr}` }, { status: 400 });
            }

            const price = Number(unitData.price);
            const qty = Number(item.qty);
            if (qty <= 0 || qty > 1000) {
                return NextResponse.json({ error: "الكمية غير صحيحة" }, { status: 400 });
            }
            const lineTotal = price * qty;
            subtotal += lineTotal;

            verifiedItems.push({
                productId: product.id,
                nameAr: product.nameAr,
                nameEn: product.nameEn || null,
                unit: item.unit,
                price,
                qty,
                lineTotal,
                imageUrl: product.imageUrl || null,
            });
        }

        // Get delivery fee
        const [zone] = await db.select().from(deliveryZones).where(eq(deliveryZones.id, address.zoneId)).limit(1);
        if (!zone) {
            return NextResponse.json({ error: "منطقة التوصيل غير صحيحة" }, { status: 400 });
        }

        const deliveryFee = Number(zone.fee);
        const total = subtotal + deliveryFee;

        // Create order
        const [order] = await db.insert(orders).values({
            userId: session.userId,
            zoneId: zone.id,
            zoneName: zone.nameAr,
            street: address.street,
            building: address.building,
            addressDetails: address.details || null,
            locationLink: address.locationLink || null,
            subtotal: subtotal.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2),
            total: total.toFixed(2),
            paymentMethod: "COD",
            status: "pending",
        }).returning();

        // Insert order items
        for (const item of verifiedItems) {
            await db.insert(orderItems).values({
                orderId: order.id,
                productId: item.productId,
                nameAr: item.nameAr,
                nameEn: item.nameEn,
                unit: item.unit,
                price: item.price.toFixed(2),
                qty: item.qty,
                lineTotal: item.lineTotal.toFixed(2),
                imageUrl: item.imageUrl,
            });
        }

        // Insert status history
        await db.insert(orderStatusHistory).values({
            orderId: order.id,
            status: "pending",
            changedBy: session.userId,
        });

        return NextResponse.json({ orderId: order.id, total });
    } catch (error) {
        console.error("Create order error:", error);
        return NextResponse.json({ error: "فشل إنشاء الطلب" }, { status: 500 });
    }
}

// GET: List orders for current user
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const userOrders = await db.select().from(orders)
            .where(eq(orders.userId, session.userId))
            .orderBy(desc(orders.createdAt));

        const result = [];
        for (const order of userOrders) {
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
            const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id));

            // Get user info
            const [user] = await db.select({ displayName: users.displayName, email: users.email, phone: users.phone })
                .from(users).where(eq(users.id, order.userId)).limit(1);

            result.push({
                ...order,
                subtotal: Number(order.subtotal),
                deliveryFee: Number(order.deliveryFee),
                total: Number(order.total),
                customer: { name: user?.displayName || "", email: user?.email || "", phone: user?.phone || "" },
                address: { zoneId: order.zoneId, zoneName: order.zoneName, street: order.street, building: order.building, details: order.addressDetails, locationLink: order.locationLink },
                items: items.map(i => ({ ...i, price: Number(i.price), lineTotal: Number(i.lineTotal) })),
                statusHistory: history,
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Fetch orders error:", error);
        return NextResponse.json({ error: "فشل جلب الطلبات" }, { status: 500 });
    }
}
