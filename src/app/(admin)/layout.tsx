"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { AdminNav } from "@/components/layout/AdminNav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={["admin"]}>
            <div className="min-h-screen bg-gray-100">
                {/* Admin Sidebar/Navbar could go here */}
                <AdminNav />
                <main className="py-10">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
