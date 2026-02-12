"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, ShoppingBag, Tags, MapPin, Percent, FileText, Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useState } from "react";


import { useLanguage } from "@/components/providers/LanguageProvider"; // Import hook

export function AdminNav() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { t } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigation = [
        { name: t('admin.orders'), href: '/admin', icon: LayoutDashboard },
        { name: t('admin.products'), href: '/admin/products', icon: ShoppingBag },
        { name: t('admin.categories'), href: '/admin/categories', icon: Tags },
        { name: t('admin.zones'), href: '/admin/zones', icon: MapPin }, // Need to add 'admin.zones' to dictionary if missing, will check later or default to key
        { name: t('admin.offers'), href: '/admin/offers', icon: Percent }, // check keys
        { name: t('admin.settings'), href: '/admin/accounting', icon: FileText }, // using settings key for accounting for now
    ];

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14 sm:h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center font-bold text-brand text-lg ml-4 sm:ml-6">
                            {t('nav.admin')}
                        </div>
                        {/* Desktop nav */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-4 sm:space-x-reverse">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={clsx(
                                            pathname === item.href
                                                ? 'border-brand text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                        )}
                                    >
                                        <Icon className="w-4 h-4 ml-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={() => logout()}
                            className="hidden sm:block text-gray-500 hover:text-red-600 text-sm font-medium"
                        >
                            {t('logout')}
                        </button>
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="sm:hidden p-2 text-gray-500 hover:text-brand"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile menu */}
            {mobileOpen && (
                <div className="sm:hidden border-t border-gray-100 bg-white shadow-lg">
                    <div className="px-2 py-3 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={clsx(
                                        pathname === item.href
                                            ? 'bg-brand-50 text-brand-dark border-brand'
                                            : 'text-gray-600 hover:bg-gray-50 border-transparent',
                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border-r-4'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => { setMobileOpen(false); logout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            {t('logout')}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
