"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

import { useLanguage } from "@/components/providers/LanguageProvider"; // Import hook

export default function CashierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useLanguage();
    return (
        <RoleGuard allowedRoles={["cashier", "admin"]}>
            <div className="min-h-screen bg-slate-950">
                <nav className="bg-slate-900 border-b border-slate-800 h-16 flex items-center shadow-md justify-between">
                    <div className="px-6 text-emerald-500 font-bold text-xl flex items-center gap-2">
                        {/* You can add an icon here if needed */}
                        {t("nav.cashier")}
                    </div>
                    <div className="px-6">
                        <LanguageSwitcher />
                    </div>
                </nav>
                <main className="h-[calc(100vh-4rem)] overflow-hidden">
                    {children}
                </main>
            </div>
        </RoleGuard>
    );
}
