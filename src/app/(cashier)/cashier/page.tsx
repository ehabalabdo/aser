"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/lib/types";
import { Loader2, Check, X, Truck, Package, Home, Clock, MapPin, Phone, User, MonitorSpeaker, Volume2, VolumeX, Printer, AlertCircle, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider"; // Added import
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function CashierDashboard() {
    const { t, language } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { user } = useAuth();

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // --- Order Fetching Logic ---
    useEffect(() => {
        const q = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
        );

        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            const MOCK_ORDERS: Order[] = [
                {
                    id: "DEMO-101",
                    userId: "u1",
                    customer: { name: "خالد وليد", phone: "0790000000", email: "khalid@demo.com" },
                    address: { zoneId: "z1", zoneName: "التلاع العلي", street: "شارع المدينة", building: "12" },
                    items: [
                        { productId: "p1", nameAr: "طماطم بلدي", price: 0.85, qty: 3, unit: "كغ", imageUrl: "" },
                        { productId: "p2", nameAr: "خيار شمسي", price: 0.65, qty: 2, unit: "كغ", imageUrl: "" }
                    ],
                    subtotal: 3.85,
                    deliveryFee: 1.5,
                    total: 5.35,
                    paymentMethod: 'COD',
                    status: "pending",
                    createdAt: Date.now() - 1000 * 60 * 5, // 5 mins ago
                    statusHistory: []
                },
                {
                    id: "DEMO-102",
                    userId: "u2",
                    customer: { name: "سعاد احمد", phone: "0780000000", email: "suad@demo.com" },
                    address: { zoneId: "z2", zoneName: "الجبيهة", street: "شارع الجامعة", building: "5B" },
                    items: [
                        { productId: "p3", nameAr: "بطاطا", price: 0.55, qty: 5, unit: "كغ", imageUrl: "" }
                    ],
                    subtotal: 2.75,
                    deliveryFee: 1.0,
                    total: 3.75,
                    paymentMethod: 'COD',
                    status: "accepted",
                    createdAt: Date.now() - 1000 * 60 * 20, // 20 mins ago
                    statusHistory: []
                },
                {
                    id: "DEMO-103",
                    userId: "u3",
                    customer: { name: "محمد علي", phone: "0770000000", email: "mohd@demo.com" },
                    address: { zoneId: "z1", zoneName: "خلدا", street: "شارع وصفي التل", building: "20" },
                    items: [
                        { productId: "p4", nameAr: "تفاح أحمر", price: 1.25, qty: 2, unit: "كغ", imageUrl: "" }
                    ],
                    subtotal: 2.50,
                    deliveryFee: 1.5,
                    total: 4.00,
                    paymentMethod: 'COD',
                    status: "out_for_delivery",
                    createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
                    statusHistory: []
                }
            ];
            setOrders(MOCK_ORDERS);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(data);
            setLoading(false);
        }, (err) => {
            console.error(err);
        });

        return () => unsubscribe();
    }, []);

    // --- Ringing Logic ---
    useEffect(() => {
        const pendingOrders = orders.filter(o => o.status === 'pending');
        if (pendingOrders.length > 0 && soundEnabled) {
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play().catch(e => console.error("Audio play failed", e));
            }
        } else {
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [orders, soundEnabled]);


    // --- Status Actions ---
    const handleUpdateStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            setOrders(prev => prev.map(o => {
                if (o.id === orderId) {
                    const newHistory = [...(o.statusHistory || []), { status, at: Date.now(), by: 'demo-cashier' }];
                    return { ...o, status, statusHistory: newHistory, rejectionReason: reason };
                }
                return o;
            }));
            setRejectOrderId(null);
            setRejectReason("");
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {
                status,
                statusHistory: [...(orders.find(o => o.id === orderId)?.statusHistory || []), {
                    status,
                    at: Date.now(),
                    by: user?.uid
                }]
            };

            if (status === 'accepted') {
                updateData.acceptedBy = user?.uid;
                updateData.acceptedAt = Date.now();
            } else if (status === 'rejected') {
                updateData.rejectedBy = user?.uid;
                updateData.rejectedAt = Date.now();
                updateData.rejectionReason = reason;
            }

            await updateDoc(doc(db, "orders", orderId), updateData);
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

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8"><Loader2 className="animate-spin h-10 w-10 text-emerald-500" /></div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans flex flex-col gap-6">
            <audio ref={audioRef} src="/ring.mp3" loop />

            {/* Header */}
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg no-print">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                        <MonitorSpeaker className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl tracking-wide text-white">{t("cashier.title")}</h1>
                        <p className="text-slate-400 text-sm">{t("cashier.subtitle")}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant={soundEnabled ? "primary" : "outline"}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={cn("gap-2", soundEnabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-slate-700 text-slate-400 hover:bg-slate-800")}
                    >
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        {soundEnabled ? t("cashier.sound_on") : t("cashier.sound_off")}
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 no-print overflow-hidden h-[calc(100vh-160px)]">

                {/* Column 1: New Orders */}
                <div className="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex justify-between items-center backdrop-blur-sm">
                        <h2 className="font-bold text-xl text-amber-500 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6 animate-pulse" />
                            {t("cashier.new_orders")}
                        </h2>
                        <Badge className="bg-amber-500 text-white font-mono text-lg">{pendingOrders.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {pendingOrders.map(order => (
                            <OrderCard key={order.id} order={order} actions={
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        className="border-red-500/50 text-red-500 hover:bg-red-950 w-full"
                                        onClick={() => setRejectOrderId(order.id)}
                                    >
                                        {t("cashier.reject")}
                                    </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse w-full shadow-lg shadow-emerald-900/50"
                                        onClick={() => handleUpdateStatus(order.id, 'accepted')}
                                    >
                                        {t("cashier.accept")}
                                    </Button>
                                </div>
                            } />
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="text-center py-10 text-slate-600">
                                <p>{t("cashier.empty_new")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: In Progress */}
                <div className="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-4 bg-blue-500/10 border-b border-blue-500/20 flex justify-between items-center backdrop-blur-sm">
                        <h2 className="font-bold text-xl text-blue-400 flex items-center gap-2">
                            <Package className="w-6 h-6" />
                            {t("cashier.preparing")}
                        </h2>
                        <Badge className="bg-blue-600 text-white font-mono text-lg">{inProgressOrders.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {inProgressOrders.map(order => (
                            <OrderCard key={order.id} order={order} actions={
                                <div className="space-y-2 mt-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="secondary"
                                            className="bg-slate-700 hover:bg-slate-600"
                                            onClick={() => handlePrint(order)}
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            {t("cashier.print")}
                                        </Button>
                                        {order.status === 'accepted' ? (
                                            <Button
                                                className="bg-blue-600 hover:bg-blue-500 text-white"
                                                onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                            >
                                                {t("cashier.start_preparing")}
                                            </Button>
                                        ) : (
                                            <Button
                                                className="bg-amber-600 hover:bg-amber-500 text-white"
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
                            <div className="text-center py-10 text-slate-600">
                                <p>{t("cashier.empty_progress")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Out for Delivery */}
                <div className="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-4 bg-purple-500/10 border-b border-purple-500/20 flex justify-between items-center backdrop-blur-sm">
                        <h2 className="font-bold text-xl text-purple-400 flex items-center gap-2">
                            <Truck className="w-6 h-6" />
                            {t("cashier.delivery")}
                        </h2>
                        <Badge className="bg-purple-600 text-white font-mono text-lg">{deliveryOrders.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {deliveryOrders.map(order => (
                            <OrderCard key={order.id} order={order} actions={
                                <div className="mt-4">
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50"
                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                    >
                                        <Home className="w-4 h-4 mr-2" />
                                        {t("cashier.delivered")}
                                    </Button>
                                </div>
                            } />
                        ))}
                        {deliveryOrders.length === 0 && (
                            <div className="text-center py-10 text-slate-600">
                                <p>{t("cashier.empty_delivery")}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modals & Technical Components */}

            {/* Reject Modal */}
            {rejectOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm no-print">
                    <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
                        <h3 className="font-bold text-2xl mb-6 text-white">{t("cashier.reject_modal_title")}</h3>
                        <textarea
                            className="w-full bg-slate-800 border-slate-700 text-white p-4 rounded-xl mb-6 focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder={t("cashier.reject_reason_placeholder")}
                            rows={3}
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setRejectOrderId(null)} className="text-slate-400 hover:text-white hover:bg-slate-800">{t("common.cancel")}</Button>
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
                            <div>#{selectedOrder.id.slice(0, 5)}</div>
                            <div>{new Date(selectedOrder.createdAt).toLocaleDateString(language === 'ar' ? 'ar-JO' : 'en-US')}</div>
                        </div>

                        <div className="mb-8 p-4 border border-black rounded-lg">
                            <p className="font-bold mb-2">{t("cashier.receipt.customer_info")}:</p>
                            <p>{selectedOrder.customer.name}</p>
                            <p>{selectedOrder.customer.phone}</p>
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
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            {/* Decorator Line */}
            <div className={cn("absolute top-0 left-0 bottom-0 w-1",
                order.status === 'pending' ? "bg-amber-500" :
                    order.status === 'accepted' ? "bg-blue-500" :
                        order.status === 'preparing' ? "bg-blue-400" :
                            order.status === 'out_for_delivery' ? "bg-purple-500" : "bg-slate-500"
            )} />

            <div className="mr-3">
                <div className="flex justify-between items-start mb-3">
                    <span className="font-mono font-bold text-slate-300 text-lg">#{order.id.slice(0, 5)}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-JO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className="mb-3">
                    <h3 className="font-bold text-white text-lg mb-1">{order.customer.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {order.address.zoneName} - {order.address.street}
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 mb-3 border border-slate-700/50">
                    <div className="flex justify-between items-center mb-2 text-xs text-slate-500 uppercase font-bold">
                        <span>{t("cashier.receipt.product")}</span>
                        <span>{t("common.quantity")}</span>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-slate-200">{language === 'en' ? (item.nameEn || item.nameAr) : item.nameAr}</span>
                                <span className="font-mono text-emerald-400 font-bold">x{item.qty}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                    <span className="text-slate-400 text-sm">{t("common.total")}:</span>
                    <span className="font-bold text-xl text-emerald-400 font-mono">{order.total.toFixed(2)} {t("common.currency")}</span>
                </div>

                {actions}
            </div>
        </div>
    )
}
