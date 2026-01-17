"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/lib/types";
import { Loader2 } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider"; // Added import

export default function AccountingPage() {
    const { t, language } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    // ... [keep state]

    // ... [keep useEffect] ...

    const downloadCSV = () => {
        // Headers can be localized based on current language or fixed. 
        // Using Fixed English headers for CSV compatibility for now, or user preference.
        const headers = ["Order ID", "Customer Name", "Phone", "Total", "Status", "Date"];
        // ...
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t("admin.accounting.title")}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">{t("admin.accounting.total_delivered_sales")}</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{totalSales.toFixed(2)} {t("common.currency")}</p>
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
                <button
                    onClick={downloadCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    {t("admin.accounting.export_csv")}
                </button>
            </div>

            {/* Short list of recent orders could go here */}
        </div>
    );
}
