import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deliveryZones } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET all zones (admin - includes inactive)
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const all = await db.select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder));
        return NextResponse.json(all.map(z => ({ ...z, fee: Number(z.fee) })));
    } catch (error) {
        console.error("Admin zones error:", error);
        return NextResponse.json({ error: "فشل جلب المناطق" }, { status: 500 });
    }
}

// POST: Create zone
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { nameAr, nameEn, fee, active, sortOrder } = await req.json();
        if (!nameAr) return NextResponse.json({ error: "اسم المنطقة مطلوب" }, { status: 400 });

        const [zone] = await db.insert(deliveryZones).values({
            nameAr,
            nameEn: nameEn || null,
            fee: (fee ?? 0).toString(),
            active: active ?? true,
            sortOrder: sortOrder ?? 0,
        }).returning();

        return NextResponse.json({ ...zone, fee: Number(zone.fee) });
    } catch (error) {
        console.error("Create zone error:", error);
        return NextResponse.json({ error: "فشل إنشاء المنطقة" }, { status: 500 });
    }
}

// PUT: Update zone
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { id, nameAr, nameEn, fee, active, sortOrder } = await req.json();
        if (!id) return NextResponse.json({ error: "معرف المنطقة مطلوب" }, { status: 400 });

        const [zone] = await db.update(deliveryZones).set({
            nameAr,
            nameEn: nameEn || null,
            fee: (fee ?? 0).toString(),
            active: active ?? true,
            sortOrder: sortOrder ?? 0,
        }).where(eq(deliveryZones.id, id)).returning();

        return NextResponse.json({ ...zone, fee: Number(zone.fee) });
    } catch (error) {
        console.error("Update zone error:", error);
        return NextResponse.json({ error: "فشل تحديث المنطقة" }, { status: 500 });
    }
}

// DELETE: Delete zone
export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { id } = await req.json();
        await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Delete zone error:", error);
        return NextResponse.json({ error: "فشل حذف المنطقة" }, { status: 500 });
    }
}
