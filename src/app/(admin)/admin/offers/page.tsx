"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Offer } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import Image from "next/image";

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [titleAr, setTitleAr] = useState("");
    const [titleEn, setTitleEn] = useState(""); // Added
    const [subtitleAr, setSubtitleAr] = useState("");
    const [subtitleEn, setSubtitleEn] = useState(""); // Added
    const [imageUrl, setImageUrl] = useState("");
    const [priority, setPriority] = useState(1);
    const [active, setActive] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            setOffers([
                { id: "1", titleAr: "عرض خاص", titleEn: "Special Offer", subtitleAr: "خصم 20% على الفواكه", subtitleEn: "20% off Fruits", priority: 1, active: true, createdAt: 0, imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80" },
                { id: "2", titleAr: "توصيل مجاني", titleEn: "Free Delivery", subtitleAr: "للطلبات فوق 20 دينار", subtitleEn: "Orders over 20 JOD", priority: 2, active: true, createdAt: 0, imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80" }
            ]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, "offers"), orderBy("priority", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Offer[];
            setOffers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);
        try {
            const payload = {
                titleAr,
                titleEn, // Added
                subtitleAr,
                subtitleEn, // Added
                imageUrl,
                priority: Number(priority),
                active,
                createdAt: Date.now() // Will be ignored on update if not handled, but safely handled below
            };
            if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
                if (editingId) {
                    setOffers(prev => prev.map(o => o.id === editingId ? { ...o, ...payload, id: o.id, createdAt: o.createdAt } as Offer : o));
                } else {
                    const newOffer: Offer = { ...payload, id: Math.random().toString(), createdAt: Date.now() } as Offer;
                    setOffers(prev => [...prev, newOffer]);
                }
                closeModal();
                setFormSubmitting(false);
                return;
            }

            if (editingId) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { createdAt, ...updatePayload } = payload;
                await updateDoc(doc(db, "offers", editingId), updatePayload);
            } else {
                await addDoc(collection(db, "offers"), payload);
            }
            closeModal();
        } catch (e) {
            console.error(e);
            alert("حدث خطأ");
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("هل أنت متأكد من الحذف؟")) {
            if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
                setOffers(prev => prev.filter(o => o.id !== id));
                return;
            }
            await deleteDoc(doc(db, "offers", id));
        }
    };

    const openModal = (offer?: Offer) => {
        if (offer) {
            setEditingId(offer.id);
            setTitleAr(offer.titleAr);
            setTitleEn(offer.titleEn || ""); // Added
            setSubtitleAr(offer.subtitleAr || "");
            setSubtitleEn(offer.subtitleEn || ""); // Added
            setImageUrl(offer.imageUrl || "");
            setPriority(offer.priority);
            setActive(offer.active);
        } else {
            setEditingId(null);
            setTitleAr("");
            setTitleEn(""); // Added
            setSubtitleAr("");
            setSubtitleEn(""); // Added
            setImageUrl("");
            setPriority(1);
            setActive(true);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة العروض</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Plus className="w-5 h-5 ml-2" />
                    عرض جديد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="bg-white rounded-lg shadow border overflow-hidden flex flex-col">
                        <div className="relative h-40 w-full bg-gray-100">
                            {offer.imageUrl ? (
                                <Image src={offer.imageUrl} alt={offer.titleAr} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">لا توجد صورة</div>
                            )}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                أولوية: {offer.priority}
                            </div>
                            {!offer.active && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">غير فعال</div>
                            )}
                        </div>
                        <div className="p-4 flex-1">
                            <h3 className="font-bold text-lg">{offer.titleAr}</h3>
                            <p className="text-xs text-gray-400 font-mono mb-1">{offer.titleEn || "-"}</p>
                            <p className="text-sm text-gray-500">{offer.subtitleAr}</p>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            <button onClick={() => openModal(offer)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Pencil className="w-5 h-5" /></button>
                            <button onClick={() => handleDelete(offer.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-right" dir="rtl">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingId ? "تعديل عرض" : "إضافة عرض جديد"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">عنوان العرض (عربي)</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={titleAr}
                                    onChange={(e) => setTitleAr(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Offer Title (English)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={titleEn}
                                    onChange={(e) => setTitleEn(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">عنوان فرعي (عربي)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={subtitleAr}
                                    onChange={(e) => setSubtitleAr(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subtitle (English)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={subtitleEn}
                                    onChange={(e) => setSubtitleEn(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">الأولوية (الأقل = يظهر أولاً)</label>
                                <input
                                    type="number"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={priority}
                                    onChange={(e) => setPriority(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">صورة العرض</label>
                                <ImageUpload folder="offers" value={imageUrl} onChange={setImageUrl} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="activeOffer" checked={active} onChange={e => setActive(e.target.checked)} />
                                <label htmlFor="activeOffer">فعال</label>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={formSubmitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {formSubmitting ? "جاري الحفظ..." : "حفظ"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
