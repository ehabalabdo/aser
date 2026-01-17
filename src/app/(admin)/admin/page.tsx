"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, ShoppingBag, CreditCard, ArrowUpRight, ArrowDownRight, Package, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/components/providers/LanguageProvider"; // Added import

export default function AdminDashboard() {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSales: 0,
        activeOrders: 0,
        totalCustomers: 0
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            try {
                if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
                    // Mock Data
                    setStats({
                        totalOrders: 1250,
                        totalSales: 15430.50,
                        activeOrders: 12,
                        totalCustomers: 450
                    });
                    const MOCK_RECENT: Order[] = [
                        {
                            id: "DEMO-101",
                            createdAt: Date.now(),
                            customer: { name: "خالد يوسف", phone: "0790000000", email: "khalid@demo.com" },
                            status: "pending",
                            total: 12.50,
                            items: [], userId: "u1",
                            address: { zoneId: "z1", zoneName: "الجبيهة", street: "شارع 1", building: "1" },
                            subtotal: 10, deliveryFee: 2.5, paymentMethod: 'COD', statusHistory: []
                        },
                        {
                            id: "DEMO-102",
                            createdAt: Date.now() - 3600000,
                            customer: { name: "منى أحمد", phone: "0791111111", email: "mona@demo.com" },
                            status: "delivered",
                            total: 24.00,
                            items: [], userId: "u2",
                            address: { zoneId: "z2", zoneName: "خلدا", street: "شارع 2", building: "2" },
                            subtotal: 22, deliveryFee: 2, paymentMethod: 'COD', statusHistory: []
                        },
                        {
                            id: "DEMO-103",
                            createdAt: Date.now() - 7200000,
                            customer: { name: "سعيد علي", phone: "0792222222", email: "said@demo.com" },
                            status: "preparing",
                            total: 8.75,
                            items: [], userId: "u3",
                            address: { zoneId: "z1", zoneName: "الجبيهة", street: "شارع 3", building: "3" },
                            subtotal: 7, deliveryFee: 1.75, paymentMethod: 'COD', statusHistory: []
                        },
                        {
                            id: "DEMO-104",
                            createdAt: Date.now() - 86400000,
                            customer: { name: "ليلى حسن", phone: "0793333333", email: "laila@demo.com" },
                            status: "rejected",
                            total: 15.00,
                            items: [], userId: "u4",
                            address: { zoneId: "z3", zoneName: "تلاع العلي", street: "شارع 4", building: "4" },
                            subtotal: 13, deliveryFee: 2, paymentMethod: 'COD', statusHistory: []
                        }
                    ];
                    setRecentOrders(MOCK_RECENT);
                } else {
                    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(10));
                    const snapshot = await getDocs(q);
                    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
                    setRecentOrders(orders);
                    setStats({
                        totalOrders: orders.length,
                        totalSales: orders.reduce((acc, o) => acc + o.total, 0),
                        activeOrders: orders.filter(o => ['pending', 'accepted', 'preparing', 'out_for_delivery'].includes(o.status)).length,
                        totalCustomers: new Set(orders.map(o => o.userId)).size
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-[500px]"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("admin.overview")}</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t("admin.stats.sales")}
                    value={`${stats.totalSales.toLocaleString()} ${t("common.currency")}`}
                    icon={CreditCard}
                    trend="+12%"
                    trendUp={true}
                    className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100"
                    iconClassName="text-emerald-600 bg-emerald-100"
                />
                <StatCard
                    title={t("admin.stats.orders")}
                    value={stats.totalOrders.toString()}
                    icon={ShoppingBag}
                    trend="+5%"
                    trendUp={true}
                    className="bg-white"
                    iconClassName="text-blue-600 bg-blue-100"
                />
                <StatCard
                    title={t("admin.stats.active_orders")}
                    value={stats.activeOrders.toString()}
                    icon={Package}
                    trend="-2%"
                    trendUp={false}
                    className="bg-white"
                    iconClassName="text-amber-600 bg-amber-100"
                />
                <StatCard
                    title={t("admin.stats.customers")}
                    value={stats.totalCustomers.toString()}
                    icon={Users}
                    trend="+8%"
                    trendUp={true}
                    className="bg-white"
                    iconClassName="text-purple-600 bg-purple-100"
                />
            </div>

            {/* Recent Orders Section */}
            <Card className="border-none shadow-sm ring-1 ring-gray-900/5 bg-white">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">{t("admin.recent_orders")}</CardTitle>
                        <button className="text-sm text-primary font-medium hover:underline">{t("admin.view_all")}</button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-4 pr-6 text-start">{t("admin.table.order_no")}</th>
                                    <th className="p-4 text-start">{t("admin.table.customer")}</th>
                                    <th className="p-4 text-start">{t("admin.table.status")}</th>
                                    <th className="p-4 text-start">{t("admin.table.total")}</th>
                                    <th className="p-4 pl-6 text-start">{t("admin.table.date")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-4 pr-6 font-bold text-gray-900 group-hover:text-primary transition-colors text-start">#{order.id.slice(0, 8)}</td>
                                        <td className="p-4 text-gray-600 text-start">
                                            <div className="font-medium text-gray-900">{order.customer.name}</div>
                                            <div className="text-xs text-gray-400 font-sans">{order.customer.phone}</div>
                                        </td>
                                        <td className="p-4 text-start">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="p-4 font-bold font-sans text-gray-900 text-start">{order.total.toFixed(2)} {t("common.currency")}</td>
                                        <td className="p-4 pl-6 text-gray-500 font-sans text-xs text-start">
                                            {new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-JO' : 'en-US')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ title, value, icon: Icon, trend, trendUp, className, iconClassName }: any) {
    return (
        <div className={cn("p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md", className)}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl", iconClassName)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={cn("flex items-center text-xs font-bold px-2 py-1 rounded-full", trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {trend}
                    </div>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 font-sans">{value}</p>
        </div>
    )
}

function OrderStatusBadge({ status }: { status: string }) {
    const { t } = useLanguage();
    const styles = {
        pending: "bg-amber-100 text-amber-700 hover:bg-amber-200",
        preparing: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        accepted: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        out_for_delivery: "bg-purple-100 text-purple-700 hover:bg-purple-200",
        delivered: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        rejected: "bg-red-100 text-red-700 hover:bg-red-200",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const style = (styles as any)[status] || "bg-gray-100 text-gray-600";

    return (
        <Badge variant="secondary" className={cn("font-medium border-none px-3 py-1", style)}>
            {t(`status.${status}`)}
        </Badge>
    );
}
