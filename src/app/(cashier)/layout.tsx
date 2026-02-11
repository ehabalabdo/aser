"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { LogOut } from "lucide-react";

export default function CashierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useLanguage();
    const { logout } = useAuth();
    return (
        <RoleGuard allowedRoles={["cashier", "admin"]}>
            <div className="min-h-screen bg-slate-950">
                <nav className="bg-slate-900 border-b border-slate-800 h-16 flex items-center shadow-md justify-between">
                    <div className="px-6 text-brand-light font-bold text-xl flex items-center gap-2">
                        {t("nav.cashier")}
                    </div>
                    <div className="px-6 flex items-center gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="hidden sm:inline">{t("logout")}</span>
                        </button>
                    </div>
                </nav>
                <main className="h-[calc(100vh-4rem)] overflow-hidden">
                    {children}
                </main>
            </div>
        </RoleGuard>
    );
}
