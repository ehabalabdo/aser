"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Role } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (profile && !allowedRoles.includes(profile.role)) {
                router.push("/"); // Unauthorized redirect
            }
        }
    }, [user, profile, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-brand" />
            </div>
        );
    }

    if (!user || (profile && !allowedRoles.includes(profile.role))) {
        return null;
    }

    return <>{children}</>;
}
