import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET all categories (admin)
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const all = await db.select().from(categories).orderBy(asc(categories.sortOrder));
        return NextResponse.json(all);
    } catch (error) {
        console.error("Admin categories error:", error);
        return NextResponse.json({ error: "فشل جلب الفئات" }, { status: 500 });
    }
}

// POST: Create category
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { nameAr, nameEn, sortOrder } = await req.json();
        if (!nameAr) return NextResponse.json({ error: "اسم الفئة مطلوب" }, { status: 400 });

        const [cat] = await db.insert(categories).values({
            nameAr,
            nameEn: nameEn || null,
            sortOrder: sortOrder ?? 0,
        }).returning();

        return NextResponse.json(cat);
    } catch (error) {
        console.error("Create category error:", error);
        return NextResponse.json({ error: "فشل إنشاء الفئة" }, { status: 500 });
    }
}

// PUT: Update category
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { id, nameAr, nameEn, sortOrder } = await req.json();
        if (!id) return NextResponse.json({ error: "معرف الفئة مطلوب" }, { status: 400 });

        const [cat] = await db.update(categories).set({
            nameAr,
            nameEn: nameEn || null,
            sortOrder: sortOrder ?? 0,
        }).where(eq(categories.id, id)).returning();

        return NextResponse.json(cat);
    } catch (error) {
        console.error("Update category error:", error);
        return NextResponse.json({ error: "فشل تحديث الفئة" }, { status: 500 });
    }
}

// DELETE: Delete category
export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { id } = await req.json();
        await db.delete(categories).where(eq(categories.id, id));
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Delete category error:", error);
        return NextResponse.json({ error: "فشل حذف الفئة" }, { status: 500 });
    }
}
