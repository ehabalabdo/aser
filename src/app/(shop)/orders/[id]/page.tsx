"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/lib/types";
import { Loader2, CheckCircle2, Clock, Truck, Home, XCircle, ShoppingBag, ChevronLeft, MapPin, Phone } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function OrderDetailsPage() {
    const { t, language } = useLanguage();
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const statusSteps: { key: OrderStatus, label: string, icon: any }[] = [
        { key: 'pending', label: t("status.pending"), icon: Clock },
        { key: 'accepted', label: t("status.accepted"), icon: CheckCircle2 },
        { key: 'preparing', label: t("status.preparing"), icon: ShoppingBag },
        { key: 'out_for_delivery', label: t("status.out_for_delivery"), icon: Truck },
        { key: 'delivered', label: t("status.delivered"), icon: Home },
    ];

    useEffect(() => {
        if (!id) return;

        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${id}`);
                if (res.ok) {
                    setOrder(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();

        // Poll for updates every 10 seconds
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders/${id}`);
                if (res.ok) setOrder(await res.json());
            } catch { /* ignore */ }
        }, 10000);

        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    if (!order) return <div className="text-center py-12 text-lg font-medium text-gray-500">{t("common.no_data")}</div>;

    const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
    const isRejected = order.status === 'rejected';


    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header / Nav */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm hover:bg-gray-50">
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </Button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t("order.track_title")}</h1>
                    <p className="text-gray-500 text-xs sm:text-sm">#{String(order.id)}</p>
                </div>
            </div>

            {/* Status Timeline Card */}
            <Card className="overflow-hidden border-none shadow-lg">
                <div className="bg-primary/5 p-4 border-b border-primary/10 flex justify-between items-center">
                    <h2 className="font-bold text-primary flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {t("status.pending")} {/* Reuse pending or generic Status title? "Status" -> t("admin.table.status") */}
                        {t("admin.table.status")}
                    </h2>
                    <Badge variant={isRejected ? "danger" : "default"} className={cn("text-sm px-3 py-1", !isRejected && "bg-primary")}>
                        {isRejected ? t("status.rejected") : statusSteps[currentStepIndex]?.label || t("common.unknown")}
                    </Badge>
                </div>
                <CardContent className="p-4 sm:p-8">
                    {isRejected ? (
                        <div className="flex flex-col items-center justify-center text-red-600 py-4 sm:py-6 animate-fade-in">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-2">عذراً، تم رفض الطلب</h2>
                            {order.rejectionReason && <p className="bg-red-50 px-4 py-2 rounded-lg text-gray-700 max-w-md text-center border border-red-100">{order.rejectionReason}</p>}
                        </div>
                    ) : (
                        <div className="relative flex justify-between">
                            {/* Process Bar Background */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10 rounded-full" />

                            {/* Active Process Bar */}
                            <div
                                className="absolute top-1/2 right-0 h-1 bg-primary -translate-y-1/2 -z-10 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                            />

                            {statusSteps.map((step, idx) => {
                                const Icon = step.icon;
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;

                                return (
                                    <div key={step.key} className="flex flex-col items-center gap-1.5 sm:gap-2 relative group">
                                        <div className={cn(
                                            "w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-4 transition-all duration-500 z-10",
                                            isCompleted ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110" : "bg-white border-gray-100 text-gray-300",
                                            isCurrent && "ring-2 sm:ring-4 ring-primary/20"
                                        )}>
                                            <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                                        </div>
                                        <p className={cn(
                                            "text-[10px] sm:text-sm font-bold absolute -bottom-6 sm:-bottom-8 whitespace-nowrap transition-colors duration-300",
                                            isCompleted ? "text-primary" : "text-gray-300"
                                        )}>
                                            {step.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* Spacer for labels */}
                    <div className="h-6" />
                </CardContent>
            </Card>

            {/* Items & Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Items List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                            {t("order.items_summary")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 sm:gap-4 border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                    {/* Handle missing image by showing generic or null, removed if for brevity if empty */}
                                    {item.imageUrl ? <Image src={item.imageUrl} alt={language === 'en' ? item.nameEn || item.nameAr : item.nameAr} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Img</div>}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{language === 'en' ? (item.nameEn || item.nameAr) : item.nameAr}</h3>
                                    <p className="text-sm text-gray-500 font-ibm">{item.qty} × {item.price} {t("common.currency")}</p>
                                </div>
                                <div className="font-bold text-gray-900 font-ibm">
                                    {(item.lineTotal || item.price * item.qty).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center rounded-b-2xl">
                        <span className="font-bold text-gray-600">{t("common.total")}</span>
                        <span className="text-2xl font-bold text-primary font-ibm">{order.total.toFixed(2)} {t("common.currency")}</span>
                    </div>
                </Card>

                {/* Delivery Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                {t("order.shipping_address")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-primary" />
                                <div>
                                    <p className="text-sm text-gray-500">{t("cart.select_zone")}</p>
                                    <p className="font-medium text-gray-900">{order.address.zoneName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-primary" />
                                <div>
                                    <p className="text-sm text-gray-500">{t("cart.street")}</p>
                                    <p className="font-medium text-gray-900">{order.address.street}, {t("cart.building")} {order.address.building}</p>
                                    {order.address.details && <p className="text-sm text-gray-600 mt-1">{order.address.details}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {t("admin.table.customer")}
                            </h3>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <div>
                                    <p className="font-bold text-gray-900">{order.customer?.name}</p>
                                    <p className="text-sm text-gray-500 font-ibm">{order.customer?.phone}</p>
                                </div>
                                <Badge variant="secondary">{t("admin.table.customer")}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
