"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Order, OrderStatus } from "@/lib/types";
import { Loader2, Truck, Package, Home, Clock, MapPin, MonitorSpeaker, Printer, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function CashierDashboard() {
    const { t, language } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevPendingIdsRef = useRef<Set<number>>(new Set());
    const [audioReady, setAudioReady] = useState(false);
    const shouldRingRef = useRef(false);

    const { user } = useAuth();

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Request notification permission on load
    useEffect(() => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Persistent click/touch handler to unlock audio & start playing if needed
    useEffect(() => {
        const tryPlay = async () => {
            if (!audioRef.current) return;
            if (!audioReady) {
                try {
                    audioRef.current.muted = true;
                    await audioRef.current.play();
                    audioRef.current.pause();
                    audioRef.current.muted = false;
                    audioRef.current.currentTime = 0;
                    setAudioReady(true);
                } catch { return; }
            }
            // If we should be ringing, start now
            if (shouldRingRef.current && audioRef.current.paused) {
                try {
                    await audioRef.current.play();
                } catch {}
            }
        };
        document.addEventListener("click", tryPlay);
        document.addEventListener("touchstart", tryPlay);
        return () => {
            document.removeEventListener("click", tryPlay);
            document.removeEventListener("touchstart", tryPlay);
        };
    }, [audioReady]);

    // --- Order Fetching Logic (polling every 5s) ---
    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // --- Ringing Logic: ALWAYS ring when pending orders exist ---
    useEffect(() => {
        const currentPendingIds = new Set(orders.filter(o => o.status === 'pending').map(o => o.id));
        
        // Check for NEW pending orders
        const newOrderIds: number[] = [];
        currentPendingIds.forEach(id => {
            if (!prevPendingIdsRef.current.has(id)) {
                newOrderIds.push(id);
            }
        });

        const hasPending = currentPendingIds.size > 0;
        shouldRingRef.current = hasPending;

        if (hasPending) {
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play().catch(() => {
                    // Browser blocked autoplay — will start on next user tap
                });
            }
        } else {
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }

        // Browser notification + vibrate for new orders
        if (newOrderIds.length > 0 && !loading) {
            try {
                if (navigator.vibrate) {
                    navigator.vibrate([300, 100, 300, 100, 300]);
                }
                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    const count = newOrderIds.length;
                    new Notification(
                        count === 1 ? '🔔 طلب جديد!' : `🔔 ${count} طلبات جديدة!`,
                        {
                            body: count === 1
                                ? `طلب #${newOrderIds[0]} بانتظار القبول`
                                : `${count} طلبات جديدة بانتظار القبول`,
                            icon: '/logo.png',
                            tag: 'new-order',
                        } as NotificationOptions
                    );
                }
            } catch {}
        }

        prevPendingIdsRef.current = currentPendingIds;
    }, [orders, loading]);


    // --- Status Actions ---
    const handleUpdateStatus = async (orderId: number | string, status: OrderStatus, reason?: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, rejectionReason: reason }),
            });
            if (!res.ok) throw new Error("Failed to update");
            // Update local state immediately
            setOrders(prev => prev.map(o => {
                if (o.id === orderId) {
                    return { ...o, status, rejectionReason: reason };
                }
                return o;
            }));
            setRejectOrderId(null);
            setRejectReason("");
        } catch (e) {
            console.error(e);
            alert("خطأ في تحديث الحالة");
        }
    };

    const handlePrint = (order: Order) => {
        setSelectedOrder(order);
        setTimeout(() => window.print(), 100);
    };

    // --- Group Orders ---
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const inProgressOrders = orders.filter(o => ['accepted', 'preparing'].includes(o.status));
    const deliveryOrders = orders.filter(o => o.status === 'out_for_delivery');

    // We can show minimal recent completed orders or none
    // const completedOrders = orders.filter(o => ['delivered', 'rejected'].includes(o.status)).slice(0, 5);

    if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center p-8"><Loader2 className="animate-spin h-10 w-10 text-brand" /></div>;

    return (
        <div className="min-h-screen bg-surface text-gray-800 p-3 sm:p-6 font-sans flex flex-col gap-3 sm:gap-6">
            <audio ref={audioRef} loop preload="auto">
                <source src="/notify.mp3" type="audio/mpeg" />
                <source src="/notify.wav" type="audio/wav" />
            </audio>

            {/* Tap to enable sound banner */}
            {!audioReady && (
                <div
                    className="bg-secondary text-white text-center py-3 px-4 rounded-xl font-bold text-lg cursor-pointer animate-pulse no-print"
                    onClick={() => {
                        if (audioRef.current) {
                            audioRef.current.muted = true;
                            audioRef.current.play().then(() => {
                                audioRef.current!.pause();
                                audioRef.current!.muted = false;
                                audioRef.current!.currentTime = 0;
                                setAudioReady(true);
                                if (shouldRingRef.current) {
                                    audioRef.current!.play().catch(() => {});
                                }
                            }).catch(() => {});
                        }
                    }}
                >
                    🔔 اضغط هنا لتفعيل صوت التنبيهات
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center bg-white p-3 sm:p-4 rounded-2xl border border-brand-100 shadow-sm no-print">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-brand-50 p-1.5 sm:p-2 rounded-lg">
                        <MonitorSpeaker className="w-6 h-6 sm:w-8 sm:h-8 text-brand" />
                    </div>
                    <div>
                        <h1 className="font-black text-lg sm:text-2xl tracking-wide text-brand-dark">{t("cashier.title")}</h1>
                        <p className="text-brown/60 text-xs sm:text-sm">{t("cashier.subtitle")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-brand-light text-sm">
                    <span className="inline-block w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                    {t("cashier.subtitle") || "مباشر"}
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 flex-1 no-print md:overflow-hidden md:h-[calc(100vh-160px)]">

                {/* Column 1: New Orders */}
                <div className="flex flex-col bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-sm">
                    <div className="p-3 sm:p-4 bg-secondary/10 border-b border-secondary/20 flex justify-between items-center">
                        <h2 className="font-bold text-base sm:text-xl text-secondary flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                            {t("cashier.new_orders")}
                        </h2>
                        <Badge className="bg-secondary text-white font-mono text-base sm:text-lg">{pendingOrders.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[50vh] md:max-h-none">
                        {pendingOrders.map(order => (
                            <OrderCard key={order.id} order={order} actions={
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        className="border-red-400 text-red-600 hover:bg-red-50 w-full"
                                        onClick={() => setRejectOrderId(order.id)}
                                    >
                                        {t("cashier.reject")}
                                    </Button>
                                    <Button
                                        className="bg-brand hover:bg-brand-dark text-white animate-pulse w-full shadow-lg shadow-brand/30"
                                        onClick={() => handleUpdateStatus(order.id, 'accepted')}
                                    >
                                        {t("cashier.accept")}
                                    </Button>
                                </div>
                            } />
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="text-center py-10 text-brown/40">
                                <p>{t("cashier.empty_new")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: In Progress */}
                <div className="flex flex-col bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-sm">
                    <div className="p-3 sm:p-4 bg-brand-50 border-b border-brand-100 flex justify-between items-center">
                        <h2 className="font-bold text-base sm:text-xl text-brand flex items-center gap-2">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                            {t("cashier.preparing")}
                        </h2>
                        <Badge className="bg-brand text-white font-mono text-base sm:text-lg">{inProgressOrders.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[50vh] md:max-h-none">
                        {inProgressOrders.map(order => (
                            <OrderCard key={order.id} order={order} actions={
                                <div className="space-y-2 mt-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="secondary"
                                            className="bg-brand-50 hover:bg-brand-100 text-brand-dark"
                                            onClick={() => handlePrint(order)}
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            {t("cashier.print")}
                                        </Button>
                                        {order.status === 'accepted' ? (
                                            <Button
                                                className="bg-brand hover:bg-brand-dark text-white"
                                                onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                            >
                                                {t("cashier.start_preparing")}
                                            </Button>
                                        ) : (
                                            <Button
                                                className="bg-secondary hover:bg-secondary-hover text-white"
                                                onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                                            >
                                                <Truck className="w-4 h-4 mr-2" />
                                                {t("cashier.send_delivery")}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            } />
                        ))}
                        {inProgressOrders.length === 0 && (
                            <div className="text-center py-10 text-brown/40">
                                <p>{t("cashier.empty_progress")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Out for Delivery */}
                <div className="flex flex-col bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-sm">
                    <div className="p-3 sm:p-4 bg-warm-tan/20 border-b border-warm-tan/30 flex justify-between items-center">
                        <h2 className="font-bold text-base sm:text-xl text-brown flex items-center gap-2">
                            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                            {t("cashier.delivery")}
                        </h2>
                        <Badge className="bg-brown text-white font-mono text-base sm:text-lg">{deliveryOrders.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[50vh] md:max-h-none">
                        {deliveryOrders.map(order => (
                            <OrderCard key={order.id} order={order} actions={
                                <div className="mt-4">
                                    <Button
                                        className="w-full bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/30"
                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                    >
                                        <Home className="w-4 h-4 mr-2" />
                                        {t("cashier.delivered")}
                                    </Button>
                                </div>
                            } />
                        ))}
                        {deliveryOrders.length === 0 && (
                            <div className="text-center py-10 text-brown/40">
                                <p>{t("cashier.empty_delivery")}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modals & Technical Components */}

            {/* Reject Modal */}
            {rejectOrderId && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm no-print">
                    <div className="bg-white p-6 sm:p-8 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md border border-brand-100 shadow-2xl">
                        <h3 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6 text-brand-dark">{t("cashier.reject_modal_title")}</h3>
                        <textarea
                            className="w-full bg-surface border border-brand-100 text-gray-800 p-4 rounded-xl mb-6 focus:ring-2 focus:ring-red-400 outline-none"
                            placeholder={t("cashier.reject_reason_placeholder")}
                            rows={3}
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setRejectOrderId(null)} className="text-brown hover:text-brand-dark hover:bg-brand-50">{t("common.cancel")}</Button>
                            <Button variant="danger" onClick={() => handleUpdateStatus(rejectOrderId, 'rejected', rejectReason)} className="bg-red-600 hover:bg-red-500">{t("cashier.confirm_reject")}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Receipt for Printing */}
            <div id="printable-receipt" className={`hidden`}>
                {selectedOrder && (
                    <div className={cn("p-8 bg-white text-black font-sans", language === 'ar' ? 'dir-rtl' : 'dir-ltr')}>
                        <div className="text-center mb-8 border-b-2 border-dashed border-black pb-4">
                            <h1 className="text-4xl font-black mb-2">{t("app.name")}</h1>
                            <p className="text-lg">{t("cashier.receipt.title")}</p>
                            <p className="text-sm mt-2">{new Date().toLocaleString(language === 'ar' ? 'ar-JO' : 'en-US')}</p>
                        </div>

                        <div className="flex justify-between mb-6 text-lg font-bold">
                            <div>#{selectedOrder.id}</div>
                            <div>{new Date(selectedOrder.createdAt).toLocaleDateString(language === 'ar' ? 'ar-JO' : 'en-US')}</div>
                        </div>

                        <div className="mb-8 p-4 border border-black rounded-lg">
                            <p className="font-bold mb-2">{t("cashier.receipt.customer_info")}:</p>
                            <p>{selectedOrder.customer?.name}</p>
                            <p>{selectedOrder.customer?.phone}</p>
                            <p>{selectedOrder.address.zoneName} - {selectedOrder.address.street} - {selectedOrder.address.building}</p>
                        </div>

                        <table className="w-full text-right mb-8">
                            <thead className="border-b-2 border-black">
                                <tr>
                                    <th className="py-2">{t("cashier.receipt.product")}</th>
                                    <th className="py-2 text-center">{t("common.quantity")}</th>
                                    <th className="py-2 text-left">{t("common.price")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {selectedOrder.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-2 font-bold">{language === 'en' ? (item.nameEn || item.nameAr) : item.nameAr}</td>
                                        <td className="py-2 text-center">{item.qty}</td>
                                        <td className="py-2 text-left">{(item.price * item.qty).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-black font-bold text-xl">
                                <tr>
                                    <td className="pt-4">{t("common.total")}</td>
                                    <td className="pt-4"></td>
                                    <td className="pt-4 text-left">{selectedOrder.total.toFixed(2)} {t("common.currency")}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="text-center text-sm border-t border-dashed border-black pt-4">
                            <p>{t("cashier.receipt.thanks")}</p>
                            <p>{t("cashier.receipt.customer_service")}: 0790000000</p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

// --- Sub Components ---
function OrderCard({ order, actions }: { order: Order, actions: React.ReactNode }) {
    const { t, language } = useLanguage();

    return (
        <div className="bg-surface border border-brand-100 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            {/* Decorator Line */}
            <div className={cn("absolute top-0 left-0 bottom-0 w-1",
                order.status === 'pending' ? "bg-secondary" :
                    order.status === 'accepted' ? "bg-brand" :
                        order.status === 'preparing' ? "bg-brand-light" :
                            order.status === 'out_for_delivery' ? "bg-warm-tan" : "bg-brown/30"
            )} />

            <div className="mr-3">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <span className="font-mono font-bold text-brand-dark text-base sm:text-lg">#{order.id}</span>
                    <span className="text-[10px] sm:text-xs text-brown/60 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-JO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className="mb-2 sm:mb-3">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-0.5 sm:mb-1">{order.customer?.name || 'غير معروف'}</h3>
                    <div className="flex items-center gap-2 text-brown/60 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 text-brand" />
                        {order.address.zoneName} - {order.address.street}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 border border-brand-100">
                    <div className="flex justify-between items-center mb-1.5 sm:mb-2 text-[10px] sm:text-xs text-brown/50 uppercase font-bold">
                        <span>{t("cashier.receipt.product")}</span>
                        <span>{t("common.quantity")}</span>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 max-h-20 sm:max-h-24 overflow-y-auto custom-scrollbar">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-700 line-clamp-1">{language === 'en' ? (item.nameEn || item.nameAr) : item.nameAr}</span>
                                <span className="font-mono text-brand font-bold flex-shrink-0 mr-1 sm:mr-0">x{item.qty}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-brand-100">
                    <span className="text-brown/60 text-xs sm:text-sm">{t("common.total")}:</span>
                    <span className="font-bold text-lg sm:text-xl text-brand font-mono">{order.total.toFixed(2)} {t("common.currency")}</span>
                </div>

                {actions}
            </div>
        </div>
    )
}
