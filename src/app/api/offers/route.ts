import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { offers } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
    try {
        const result = await db.select().from(offers)
            .where(eq(offers.active, true))
            .orderBy(asc(offers.priority));
        return NextResponse.json(result);
    } catch (error) {
        console.error("Offers fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
    }
}
