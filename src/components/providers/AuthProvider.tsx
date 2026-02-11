"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
    user: UserProfile | null;
    profile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    logout: async () => { },
    refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        window.location.href = "/login";
    };

    const refreshProfile = async () => {
        await fetchMe();
    };

    return (
        <AuthContext.Provider value={{ user, profile: user, loading, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
