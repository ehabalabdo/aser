"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, ShoppingBag, Tags, MapPin, Percent, FileText } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";



import { useLanguage } from "@/components/providers/LanguageProvider"; // Import hook

export function AdminNav() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { t } = useLanguage();

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
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center font-bold text-green-600 text-lg ml-6">
                            {t('nav.admin')}
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-4 sm:space-x-reverse">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href} // Use href as key since name changes
                                        href={item.href}
                                        className={clsx(
                                            pathname === item.href
                                                ? 'border-green-500 text-gray-900'
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
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={() => logout()}
                            className="text-gray-500 hover:text-red-600 text-sm font-medium"
                        >
                            {t('logout')}
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile menu could go here */}
        </nav>
    );
}
