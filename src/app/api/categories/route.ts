import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { asc } from "drizzle-orm";

export async function GET() {
    try {
        const result = await db.select().from(categories).orderBy(asc(categories.sortOrder));
        return NextResponse.json(result);
    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
