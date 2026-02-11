import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(null, { status: 401 });
    }

    const [user] = await db.select({
        id: users.id,
        uid: users.uid,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
    }).from(users).where(eq(users.id, session.userId)).limit(1);

    if (!user) {
        return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json(user);
}
