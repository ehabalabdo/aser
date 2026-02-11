import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, users } from "@/lib/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET: All orders for cashier/admin (with filters)
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "admin" && session.role !== "cashier")) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let query;
        if (status) {
            query = db.select().from(orders)
                .where(eq(orders.status, status))
                .orderBy(desc(orders.createdAt));
        } else {
            query = db.select().from(orders)
                .orderBy(desc(orders.createdAt));
        }

        const allOrders = await query;

        // Fetch items for all orders
        const orderIds = allOrders.map(o => o.id);
        let items: any[] = [];
        let history: any[] = [];
        if (orderIds.length > 0) {
            items = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
            history = await db.select().from(orderStatusHistory).where(inArray(orderStatusHistory.orderId, orderIds));
        }

        // Fetch user info for customer data
        const userIds = [...new Set(allOrders.map(o => o.userId))];
        let usersMap: Record<number, any> = {};
        if (userIds.length > 0) {
            const allUsers = await db.select({
                id: users.id,
                displayName: users.displayName,
                phone: users.phone,
                email: users.email,
            }).from(users).where(inArray(users.id, userIds));
            allUsers.forEach(u => { usersMap[u.id] = u; });
        }

        const result = allOrders.map(o => {
            const u = usersMap[o.userId];
            return {
                ...o,
                total: Number(o.total),
                subtotal: Number(o.subtotal),
                deliveryFee: Number(o.deliveryFee),
                customer: u ? { name: u.displayName || u.email, phone: u.phone || "", email: u.email } : undefined,
                address: {
                    zoneId: o.zoneId,
                    zoneName: o.zoneName,
                    street: o.street,
                    building: o.building,
                    details: o.addressDetails,
                    locationLink: o.locationLink,
                },
                items: items
                    .filter(i => i.orderId === o.id)
                    .map(i => ({ ...i, price: Number(i.price), lineTotal: Number(i.lineTotal) })),
                statusHistory: history.filter(h => h.orderId === o.id),
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Admin orders error:", error);
        return NextResponse.json({ error: "فشل جلب الطلبات" }, { status: 500 });
    }
}
