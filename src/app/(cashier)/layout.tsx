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
            <div className="min-h-screen bg-surface">
                <nav className="bg-brand border-b border-brand-dark h-12 sm:h-16 flex items-center shadow-md justify-between">
                    <div className="px-4 sm:px-6 text-white font-bold text-base sm:text-xl flex items-center gap-2">
                        {t("nav.cashier")}
                    </div>
                    <div className="px-4 sm:px-6 flex items-center gap-2 sm:gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={logout}
                            className="flex items-center gap-1.5 sm:gap-2 text-white/70 hover:text-red-300 transition-colors text-xs sm:text-sm"
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
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
