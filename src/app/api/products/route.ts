import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productUnits } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const allProducts = await db.select().from(products).where(eq(products.active, true));
        const allUnits = await db.select().from(productUnits);

        const result = allProducts.map(p => ({
            ...p,
            units: allUnits
                .filter(u => u.productId === p.id)
                .map(u => ({ id: u.id, unit: u.unit, price: Number(u.price), isDefault: u.isDefault })),
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Products fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
