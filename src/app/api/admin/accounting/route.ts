import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, users } from "@/lib/schema";
import { eq, and, gte, lte, desc, sum, count, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET: Accounting data (admin only)
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        let conditions = [];
        if (from) conditions.push(gte(orders.createdAt, new Date(from)));
        if (to) conditions.push(lte(orders.createdAt, new Date(to)));

        // Only count delivered orders for accounting
        conditions.push(eq(orders.status, "delivered"));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const stats = await db.select({
            totalOrders: count(),
            totalRevenue: sum(orders.total),
            totalDeliveryFees: sum(orders.deliveryFee),
            totalSubtotals: sum(orders.subtotal),
        }).from(orders).where(whereClause);

        // Recent delivered orders
        const recentOrders = await db.select().from(orders)
            .where(whereClause)
            .orderBy(desc(orders.createdAt))
            .limit(50);

        return NextResponse.json({
            stats: {
                totalOrders: stats[0]?.totalOrders ?? 0,
                totalRevenue: Number(stats[0]?.totalRevenue ?? 0),
                totalDeliveryFees: Number(stats[0]?.totalDeliveryFees ?? 0),
                totalSubtotals: Number(stats[0]?.totalSubtotals ?? 0),
            },
            orders: recentOrders.map(o => ({
                ...o,
                total: Number(o.total),
                subtotal: Number(o.subtotal),
                deliveryFee: Number(o.deliveryFee),
            })),
        });
    } catch (error) {
        console.error("Accounting error:", error);
        return NextResponse.json({ error: "فشل جلب بيانات المحاسبة" }, { status: 500 });
    }
}
