import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET single order
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const orderId = Number(id);
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

        const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
        if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

        // Check ownership or admin/cashier
        if (order.userId !== session.userId && !["admin", "cashier"].includes(session.role)) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
        const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId));
        const [user] = await db.select({ displayName: users.displayName, email: users.email, phone: users.phone })
            .from(users).where(eq(users.id, order.userId)).limit(1);

        return NextResponse.json({
            ...order,
            subtotal: Number(order.subtotal),
            deliveryFee: Number(order.deliveryFee),
            total: Number(order.total),
            customer: { name: user?.displayName || "", email: user?.email || "", phone: user?.phone || "" },
            address: { zoneId: order.zoneId, zoneName: order.zoneName, street: order.street, building: order.building, details: order.addressDetails, locationLink: order.locationLink },
            items: items.map(i => ({ ...i, price: Number(i.price), lineTotal: Number(i.lineTotal) })),
            statusHistory: history,
        });
    } catch (error) {
        console.error("Fetch order error:", error);
        return NextResponse.json({ error: "فشل جلب الطلب" }, { status: 500 });
    }
}

// PATCH: Update order status (cashier/admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const orderId = Number(id);
        const session = await getSession();
        if (!session || !["admin", "cashier"].includes(session.role)) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const body = await req.json();
        const { status, rejectionReason } = body;

        const validStatuses = ["accepted", "rejected", "preparing", "out_for_delivery", "delivered"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = { status, updatedAt: new Date() };
        if (status === "accepted") {
            updateData.acceptedBy = session.userId;
            updateData.acceptedAt = new Date();
        } else if (status === "rejected") {
            updateData.rejectedBy = session.userId;
            updateData.rejectedAt = new Date();
            updateData.rejectionReason = rejectionReason || null;
        }

        await db.update(orders).set(updateData).where(eq(orders.id, orderId));

        await db.insert(orderStatusHistory).values({
            orderId,
            status,
            changedBy: session.userId,
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Update order error:", error);
        return NextResponse.json({ error: "فشل تحديث الطلب" }, { status: 500 });
    }
}
