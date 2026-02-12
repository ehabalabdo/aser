"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/lib/store";
import { ShoppingCart, User } from "lucide-react";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState, useRef, useEffect } from "react";

export function Header() {
    const { user, profile, logout } = useAuth();
    const { t } = useLanguage();
    const cartItems = useCart((state) => state.items);
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 safe-top">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
                        <img src="/logo.png" alt={t("app.name")} className="w-8 h-8 sm:w-10 sm:h-10" />
                        <span className="text-lg sm:text-2xl font-bold text-brand">{t("app.name")}</span>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <LanguageSwitcher />

                        {profile?.role === 'admin' && (
                            <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-brand hidden sm:block">
                                {t("nav.admin")}
                            </Link>
                        )}

                        {profile?.role === 'cashier' && (
                            <Link href="/cashier" className="text-sm font-medium text-gray-500 hover:text-brand hidden sm:block">
                                {t("nav.cashier")}
                            </Link>
                        )}

                        <Link href="/cart" className="relative p-1.5 sm:p-2 text-gray-600 hover:text-brand transition-colors">
                            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 inline-flex items-center justify-center w-5 h-5 sm:w-auto sm:h-auto sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative" ref={menuRef}>
                                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1.5 text-gray-700 hover:text-brand">
                                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                                    <span className="hidden sm:inline text-sm font-medium">{profile?.displayName || t("nav.users")}</span>
                                </button>
                                {menuOpen && (
                                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                                        {profile?.role === 'admin' && (
                                            <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden">{t("nav.admin")}</Link>
                                        )}
                                        {profile?.role === 'cashier' && (
                                            <Link href="/cashier" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden">{t("nav.cashier")}</Link>
                                        )}
                                        <Link href="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{t("nav.orders")}</Link>
                                        <button onClick={() => { setMenuOpen(false); logout(); }} className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                                            {t("logout")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm font-medium text-brand hover:text-brand-dark">
                                تسجيل دخول
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
