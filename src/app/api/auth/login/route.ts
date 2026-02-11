import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken, tokenCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "اسم المستخدم وكلمة المرور مطلوبين" }, { status: 400 });
        }

        const cleanUsername = username.trim().toLowerCase();

        const [user] = await db.select().from(users).where(eq(users.username, cleanUsername)).limit(1);
        if (!user) {
            return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
        }

        const token = await signToken({
            userId: user.id,
            uid: user.uid,
            username: user.username,
            role: user.role,
        });

        const response = NextResponse.json({
            user: {
                id: user.id,
                uid: user.uid,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                phone: user.phone,
                role: user.role,
            },
        });

        response.cookies.set({ ...tokenCookieOptions(), value: token });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "فشل تسجيل الدخول" }, { status: 500 });
    }
}
