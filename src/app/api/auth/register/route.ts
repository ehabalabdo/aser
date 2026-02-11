import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken, tokenCookieOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { username, password, displayName, phone } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "اسم المستخدم وكلمة المرور مطلوبين" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
        }

        const cleanUsername = username.trim().toLowerCase();
        const email = `${cleanUsername}@asr.jo`;

        // Check if username exists
        const existing = await db.select().from(users).where(eq(users.username, cleanUsername)).limit(1);
        if (existing.length > 0) {
            return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const uid = randomUUID();

        const [newUser] = await db.insert(users).values({
            uid,
            username: cleanUsername,
            email,
            displayName: displayName || cleanUsername,
            phone: phone || null,
            passwordHash,
            role: "customer",
        }).returning();

        const token = await signToken({
            userId: newUser.id,
            uid: newUser.uid,
            username: newUser.username,
            role: newUser.role,
        });

        const response = NextResponse.json({
            user: {
                id: newUser.id,
                uid: newUser.uid,
                username: newUser.username,
                email: newUser.email,
                displayName: newUser.displayName,
                phone: newUser.phone,
                role: newUser.role,
            },
        });

        response.cookies.set({ ...tokenCookieOptions(), value: token });
        return response;
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "فشل إنشاء الحساب" }, { status: 500 });
    }
}
