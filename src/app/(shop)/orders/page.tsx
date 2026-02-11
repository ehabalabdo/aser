"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Order } from "@/lib/types";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function OrdersListPage() {
    const { t, language } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            const fetchOrders = async () => {
                try {
                    const res = await fetch("/api/orders");
                    if (res.ok) {
                        setOrders(await res.json());
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-brand" /></div>;

    if (orders.length === 0) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t("order.empty_history")}</h2>
                <Link href="/" className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark">{t("order.shop_now")}</Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-blue-100 text-blue-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-brand-100 text-brand-dark';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t("nav.orders")}</h1>
            <div className="space-y-4">
                {orders.map(order => (
                    <Link href={`/orders/${order.id}`} key={order.id} className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-gray-900">#{String(order.id).slice(0, 8)}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {t(`status.${order.status}`)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-JO' : 'en-US')}
                                </p>
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-brand">{order.total.toFixed(2)} {t("common.currency")}</span>
                                <span className="text-xs text-gray-500">{order.items.length} {t("admin.products")}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
