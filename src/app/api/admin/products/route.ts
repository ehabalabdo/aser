import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productUnits, categories } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET all products (admin - includes inactive)
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
        const allUnits = await db.select().from(productUnits);
        const allCategories = await db.select().from(categories);

        const result = allProducts.map(p => ({
            ...p,
            units: allUnits
                .filter(u => u.productId === p.id)
                .map(u => ({ id: u.id, unit: u.unit, price: Number(u.price), isDefault: u.isDefault })),
        }));

        return NextResponse.json({ products: result, categories: allCategories });
    } catch (error) {
        console.error("Admin products error:", error);
        return NextResponse.json({ error: "فشل جلب المنتجات" }, { status: 500 });
    }
}

// POST: Create product
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const body = await req.json();
        const { nameAr, nameEn, descriptionAr, descriptionEn, categoryId, imageUrl, active, units } = body;

        if (!nameAr) return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
        if (!units || units.length === 0) return NextResponse.json({ error: "يجب إضافة وحدة واحدة على الأقل" }, { status: 400 });

        const [product] = await db.insert(products).values({
            nameAr,
            nameEn: nameEn || null,
            descriptionAr: descriptionAr || null,
            descriptionEn: descriptionEn || null,
            categoryId: categoryId || null,
            imageUrl: imageUrl || null,
            active: active ?? true,
        }).returning();

        // Insert units
        for (let i = 0; i < units.length; i++) {
            await db.insert(productUnits).values({
                productId: product.id,
                unit: units[i].unit,
                price: units[i].price.toString(),
                isDefault: i === 0,
            });
        }

        return NextResponse.json({ id: product.id });
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json({ error: "فشل إنشاء المنتج" }, { status: 500 });
    }
}

// PUT: Update product
export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const body = await req.json();
        const { id, nameAr, nameEn, descriptionAr, descriptionEn, categoryId, imageUrl, active, units } = body;

        if (!id) return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });

        await db.update(products).set({
            nameAr,
            nameEn: nameEn || null,
            descriptionAr: descriptionAr || null,
            descriptionEn: descriptionEn || null,
            categoryId: categoryId || null,
            imageUrl: imageUrl || null,
            active: active ?? true,
            updatedAt: new Date(),
        }).where(eq(products.id, id));

        // Replace units: delete old, insert new
        await db.delete(productUnits).where(eq(productUnits.productId, id));
        for (let i = 0; i < units.length; i++) {
            await db.insert(productUnits).values({
                productId: id,
                unit: units[i].unit,
                price: units[i].price.toString(),
                isDefault: i === 0,
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Update product error:", error);
        return NextResponse.json({ error: "فشل تحديث المنتج" }, { status: 500 });
    }
}

// DELETE: Delete product
export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "admin") {
            return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        }

        const { id } = await req.json();
        await db.delete(products).where(eq(products.id, id));
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json({ error: "فشل حذف المنتج" }, { status: 500 });
    }
}
