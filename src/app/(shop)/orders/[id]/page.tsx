"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/lib/types";
import { Loader2, CheckCircle2, Clock, Truck, Home, XCircle, ShoppingBag, ChevronLeft, MapPin, Phone } from "lucide-react";
import { useParams, useRouter } from "next/navigation"; // Added useRouter
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/components/providers/LanguageProvider"; // Added import



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

        // Mock Data for Demo Mode
        if (id === 'DEMO-123' || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            const mockOrder: Order = {
                id: 'DEMO-123',
                createdAt: Date.now(),
                userId: 'demo-user',
                customer: { name: 'Sim User', phone: '079999999', email: 'demo@example.com' },
                items: [
                    { productId: '1', nameAr: 'طماطم بلدي', nameEn: 'Local Tomatoes', price: 0.75, qty: 1, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80' },
                    { productId: '2', nameAr: 'خيار شمسي', nameEn: 'Sunny Cucumber', price: 0.60, qty: 1, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=500&q=80' }
                ],
                subtotal: 1.35,
                deliveryFee: 1.00,
                total: 2.35,
                status: 'pending',
                address: {
                    zoneId: '1',
                    zoneName: 'الجبيهة',
                    street: 'Happy Street',
                    building: '7',
                    details: 'Near the park'
                },
                paymentMethod: 'COD',
                statusHistory: []
            };
            setOrder(mockOrder);
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(doc(db, "orders", id as string), (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
            } else {
                setOrder(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [id, t]); // Added t dependency

    if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    if (!order) return <div className="text-center py-12 text-lg font-medium text-gray-500">{t("common.no_data")}</div>;

    const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
    const isRejected = order.status === 'rejected';


    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header / Nav */}
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm hover:bg-gray-50">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("order.track_title")}</h1>
                    <p className="text-gray-500 text-sm">#{order.id.slice(0, 8)}...</p>
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
                <CardContent className="p-8">
                    {isRejected ? (
                        <div className="flex flex-col items-center justify-center text-red-600 py-6 animate-fade-in">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <XCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">عذراً، تم رفض الطلب</h2>
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
                                    <div key={step.key} className="flex flex-col items-center gap-2 relative group">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10",
                                            isCompleted ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110" : "bg-white border-gray-100 text-gray-300",
                                            isCurrent && "ring-4 ring-primary/20"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <p className={cn(
                                            "text-xs sm:text-sm font-bold absolute -bottom-8 whitespace-nowrap transition-colors duration-300",
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
                            <div key={i} className="flex items-center gap-4 border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                    {/* Handle missing image by showing generic or null, removed if for brevity if empty */}
                                    {item.imageUrl ? <Image src={item.imageUrl} alt={language === 'en' ? item.nameEn || item.nameAr : item.nameAr} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Img</div>}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{language === 'en' ? (item.nameEn || item.nameAr) : item.nameAr}</h3>
                                    <p className="text-sm text-gray-500 font-ibm">{item.qty} × {item.price} {t("common.currency")}</p>
                                </div>
                                <div className="font-bold text-gray-900 font-ibm">
                                    {(item.price * item.qty).toFixed(2)}
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
                                    <p className="font-bold text-gray-900">{order.customer.name}</p>
                                    <p className="text-sm text-gray-500 font-ibm">{order.customer.phone}</p>
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
