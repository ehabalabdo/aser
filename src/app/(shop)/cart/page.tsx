"use client";

import { useCart } from "@/lib/store";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { DeliveryZone } from "@/lib/types";
import { Loader2, Trash2, Plus, Minus, MapPin, Truck, ChevronLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

const UNIT_LABELS_AR: Record<string, string> = {
    kg: "كيلو",
    piece: "قطعة",
    box: "صندوق",
    bundle: "ضمة",
};

const UNIT_LABELS_EN: Record<string, string> = {
    kg: "Kg",
    piece: "Piece",
    box: "Box",
    bundle: "Bundle",
};

export default function CartPage() {
    const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
    const { user } = useAuth();
    const { t, language } = useLanguage(); // Added hook
    const router = useRouter();

    // State
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loadingZones, setLoadingZones] = useState(true);

    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [street, setStreet] = useState("");
    const [building, setBuilding] = useState("");
    const [details, setDetails] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const res = await fetch("/api/zones");
                if (res.ok) {
                    setZones(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingZones(false);
            }
        };
        fetchZones();
    }, []);

    const selectedZone = zones.find(z => z.id === Number(selectedZoneId));
    const deliveryFee = selectedZone ? selectedZone.fee : 0;
    const total = subtotal() + deliveryFee;

    const handleCheckout = async () => {
        if (!user) {
            router.push("/login?redirect=/cart");
            return;
        }
        if (!selectedZoneId || !street || !building) {
            setError(t("cart.address_error"));
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.productId,
                        unit: item.unit,
                        qty: item.qty,
                    })),
                    address: {
                        zoneId: Number(selectedZoneId),
                        street,
                        building,
                        details,
                    },
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || t("cart.order_fail_internet"));
                return;
            }
            clearCart();
            router.push(`/orders/${data.orderId}`);
        } catch {
            setError(t("cart.order_fail_internet"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-fade-in relative">
                <div className="w-32 h-32 bg-brand-50 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 bg-brand-100 rounded-full animate-ping opacity-20" />
                    <Truck className="w-16 h-16 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{t("cart.empty")}</h2>
                <p className="text-gray-500 text-lg max-w-sm text-center">{t("cart.empty_desc")}</p>
                <Link href="/">
                    <Button size="lg" className="rounded-full shadow-xl shadow-primary/20">{t("cart.browse_products")}</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pb-4 lg:pb-20">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-3 sm:gap-4 mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 sm:p-3 bg-white hover:bg-gray-50 rounded-full shadow-sm border border-gray-100 transition-colors group"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-primary transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t("cart.title")}</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">{t("cart.items_count", { count: items.length })}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {items.map((item) => {
                        const itemKey = item.cartKey || String(item.productId);
                        return (
                        <Card key={itemKey} className="flex flex-row items-center p-2.5 sm:p-4 gap-2.5 sm:gap-4 hover:shadow-md transition-shadow">
                            <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt={item.nameAr} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-gray-400">{t("common.no_image")}</div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-between self-stretch py-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-lg line-clamp-1">
                                            {language === 'en' ? (item.nameEn || item.nameAr) : item.nameAr}
                                        </h3>
                                        <button onClick={() => removeItem(itemKey)} className="text-gray-400 hover:text-danger transition-colors p-1">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-primary font-bold text-xs sm:text-sm bg-brand-50 w-fit px-2 py-0.5 rounded-md mt-0.5 sm:mt-1">
                                        {item.price.toFixed(2)} {t("common.currency")} <span className="text-gray-400 font-normal">/ {language === 'en' ? (UNIT_LABELS_EN[item.unit] || item.unit) : (UNIT_LABELS_AR[item.unit] || item.unit)}</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                                    <div className="flex items-center bg-gray-50 rounded-lg p-0.5 sm:p-1 border border-gray-200">
                                        <button
                                            onClick={() => updateQuantity(itemKey, item.qty - 1)}
                                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-danger transition-colors disabled:opacity-50"
                                            disabled={item.qty <= 1}
                                        >
                                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                        <span className="w-8 sm:w-10 text-center font-bold text-gray-900 text-sm sm:text-base font-ibm">{item.qty}</span>
                                        <button
                                            onClick={() => updateQuantity(itemKey, item.qty + 1)}
                                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm sm:text-lg">{(item.price * item.qty).toFixed(2)} {t("common.currency")}</span>
                                </div>
                            </div>
                        </Card>
                    );
                    })}
                </div>
            </div>

            {/* Checkout Sidebar */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="sticky top-24 border-none shadow-xl shadow-gray-100 overflow-hidden">
                    <div className="bg-primary/5 p-4 border-b border-primary/10">
                        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            {t("cart.summary")}
                        </h2>
                    </div>

                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>{t("common.subtotal")}</span>
                                <span className="font-semibold font-ibm">{subtotal().toFixed(2)} {t("common.currency")}</span>
                            </div>

                            {/* Delivery Zone Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-900">{t("cart.select_zone")} <span className="text-red-500">*</span></label>
                                {loadingZones ? (
                                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={selectedZoneId}
                                            onChange={(e) => setSelectedZoneId(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                        >
                                            <option value="">{t("cart.select_zone")}...</option>
                                            {zones.map(z => (
                                                <option key={z.id} value={z.id}>
                                                    {language === 'en' ? (z.nameEn || z.nameAr) : z.nameAr} ({z.fee} {t("common.currency")})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Truck className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-3">
                                <span>{t("common.delivery_fee")}</span>
                                <span className="font-semibold font-ibm text-primary">{deliveryFee > 0 ? `+ ${deliveryFee.toFixed(2)}` : '0.00'} {t("common.currency")}</span>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                                <span className="text-lg font-bold text-gray-900">{t("common.total")}</span>
                                <span className="text-2xl font-bold text-primary font-ibm">{total.toFixed(2)} {t("common.currency")}</span>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {t("cart.delivery_info")}
                            </h3>
                            <Input
                                type="text"
                                placeholder={t("cart.street")}
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className="bg-gray-50 border-gray-200"
                            />
                            <Input
                                type="text"
                                placeholder={t("cart.building")}
                                value={building}
                                onChange={(e) => setBuilding(e.target.value)}
                                className="bg-gray-50 border-gray-200"
                            />
                            <textarea
                                rows={2}
                                placeholder={t("cart.details")}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center border border-red-100 flex items-center justify-center gap-2">
                                <span className="font-bold">{t("error")}:</span> {error}
                            </div>
                        )}

                        <Button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? t("loading") : t("cart.checkout")}
                        </Button>
                        <p className="text-xs text-center text-gray-400 font-medium">{t("cart.payment_cod")} 💵</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
