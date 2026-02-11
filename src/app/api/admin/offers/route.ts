import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { offers } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET all offers (admin - includes inactive)
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const all = await db.select().from(offers).orderBy(desc(offers.createdAt));
        return NextResponse.json(all);
    } catch (error) {
        console.error("Admin offers error:", error);
        return NextResponse.json({ error: "فشل جلب العروض" }, { status: 500 });
    }
}

// POST: Create offer
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { titleAr, titleEn, subtitleAr, subtitleEn, imageUrl, priority, active } = await req.json();
        if (!titleAr) return NextResponse.json({ error: "عنوان العرض مطلوب" }, { status: 400 });

        const [offer] = await db.insert(offers).values({
            titleAr,
            titleEn: titleEn || null,
            subtitleAr: subtitleAr || null,
            subtitleEn: subtitleEn || null,
            imageUrl: imageUrl || null,
            priority: priority ?? 0,
            active: active ?? true,
        }).returning();

        return NextResponse.json(offer);
    } catch (error) {
        console.error("Create offer error:", error);
        return NextResponse.json({ error: "فشل إنشاء العرض" }, { status: 500 });
    }
}

// PUT: Update offer
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { id, titleAr, titleEn, subtitleAr, subtitleEn, imageUrl, priority, active } = await req.json();
        if (!id) return NextResponse.json({ error: "معرف العرض مطلوب" }, { status: 400 });

        const [offer] = await db.update(offers).set({
            titleAr,
            titleEn: titleEn || null,
            subtitleAr: subtitleAr || null,
            subtitleEn: subtitleEn || null,
            imageUrl: imageUrl || null,
            priority: priority ?? 0,
            active: active ?? true,
        }).where(eq(offers.id, id)).returning();

        return NextResponse.json(offer);
    } catch (error) {
        console.error("Update offer error:", error);
        return NextResponse.json({ error: "فشل تحديث العرض" }, { status: 500 });
    }
}

// DELETE: Delete offer
export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { id } = await req.json();
        await db.delete(offers).where(eq(offers.id, id));
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Delete offer error:", error);
        return NextResponse.json({ error: "فشل حذف العرض" }, { status: 500 });
    }
}
