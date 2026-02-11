import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, users } from "@/lib/schema";
import { eq, desc, and, gte, lte, sql, count, sum } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET: Admin dashboard stats
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== "admin" && session.role !== "cashier")) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "today";

        // Calculate date range
        const now = new Date();
        let dateFrom = new Date(now);
        dateFrom.setHours(0, 0, 0, 0);

        if (range === "week") {
            dateFrom.setDate(dateFrom.getDate() - 7);
        } else if (range === "month") {
            dateFrom.setMonth(dateFrom.getMonth() - 1);
        }

        // Order stats
        const orderStats = await db.select({
            total: count(),
            totalRevenue: sum(orders.total),
        }).from(orders).where(gte(orders.createdAt, dateFrom));

        const statusCounts = await db.select({
            status: orders.status,
            count: count(),
        }).from(orders)
            .where(gte(orders.createdAt, dateFrom))
            .groupBy(orders.status);

        // Users count
        const userCount = await db.select({ total: count() }).from(users);

        // Recent orders with customer info
        const recentOrders = await db.select().from(orders)
            .orderBy(desc(orders.createdAt))
            .limit(10);

        const userIds = [...new Set(recentOrders.map(o => o.userId))];
        let usersMap: Record<number, any> = {};
        if (userIds.length > 0) {
            const { inArray } = await import("drizzle-orm");
            const allUsers = await db.select({
                id: users.id,
                displayName: users.displayName,
                phone: users.phone,
                email: users.email,
            }).from(users).where(inArray(users.id, userIds));
            allUsers.forEach(u => { usersMap[u.id] = u; });
        }

        return NextResponse.json({
            orders: {
                total: orderStats[0]?.total ?? 0,
                revenue: Number(orderStats[0]?.totalRevenue ?? 0),
                byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s.count])),
            },
            users: userCount[0]?.total ?? 0,
            recentOrders: recentOrders.map(o => {
                const u = usersMap[o.userId];
                return {
                    ...o,
                    total: Number(o.total),
                    subtotal: Number(o.subtotal),
                    deliveryFee: Number(o.deliveryFee),
                    customer: u ? { name: u.displayName || u.email, phone: u.phone || "", email: u.email } : undefined,
                };
            }),
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "فشل جلب الإحصائيات" }, { status: 500 });
    }
}
