import { NextResponse } from "next/server";
import { tokenCookieOptions } from "@/lib/auth";

export async function POST() {
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ ...tokenCookieOptions(), value: "", maxAge: 0 });
    return response;
}
