import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deliveryZones } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
    try {
        const result = await db.select().from(deliveryZones)
            .where(eq(deliveryZones.active, true))
            .orderBy(asc(deliveryZones.sortOrder));
        return NextResponse.json(result.map(z => ({ ...z, fee: Number(z.fee) })));
    } catch (error) {
        console.error("Zones fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 });
    }
}
