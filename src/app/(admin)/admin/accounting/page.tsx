"use client";

import { useEffect, useState } from "react";
import { Order } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function AccountingPage() {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalSales, setTotalSales] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFrom) params.set("from", dateFrom);
            if (dateTo) params.set("to", dateTo);
            const res = await fetch(`/api/admin/accounting?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
                setTotalSales(data.stats?.totalRevenue || 0);
                setCompletedOrders(data.stats?.totalOrders || 0);
                setTotalOrders(data.stats?.totalOrders || 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const downloadCSV = () => {
        const headers = ["Order ID", "Total", "Status", "Date"];
        const rows = orders.map(o => [
            String(o.id),
            o.total.toFixed(2),
            o.status,
            new Date(o.createdAt).toLocaleDateString("en-US"),
        ]);
        const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `accounting_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t("admin.accounting.title")}</h1>

            {/* Date Filters */}
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                    <input type="date" className="border rounded px-3 py-2" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                    <input type="date" className="border rounded px-3 py-2" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                <button onClick={fetchData} className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark">
                    بحث
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">{t("admin.accounting.total_delivered_sales")}</h3>
                    <p className="text-3xl font-bold text-brand mt-2">{totalSales.toFixed(2)} {t("common.currency")}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">{t("admin.accounting.completed_orders_count")}</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{completedOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">{t("admin.accounting.all_orders_count")}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders}</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={downloadCSV} className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark">
                    {t("admin.accounting.export_csv")}
                </button>
            </div>

            {/* Orders Table */}
            {orders.length > 0 && (
                <div className="bg-white shadow overflow-hidden rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">رقم الطلب</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المبلغ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 text-sm font-mono">#{order.id}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-brand">{order.total.toFixed(2)} د.أ</td>
                                    <td className="px-6 py-4 text-sm">{order.status}</td>
                                    <td className="px-6 py-4 text-sm">{new Date(order.createdAt).toLocaleDateString("ar-JO")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
