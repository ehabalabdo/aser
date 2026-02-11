import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "asr-secret-change-me");
const TOKEN_NAME = "asr-token";

export interface TokenPayload {
    userId: number;
    uid: string;
    username: string;
    role: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
    return new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<TokenPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}

export function tokenCookieOptions() {
    return {
        name: TOKEN_NAME,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    };
}
