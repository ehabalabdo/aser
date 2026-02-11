"use client";

import { useState, useEffect } from "react";
import { Offer } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [titleAr, setTitleAr] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [subtitleAr, setSubtitleAr] = useState("");
    const [subtitleEn, setSubtitleEn] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [priority, setPriority] = useState(1);
    const [active, setActive] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch("/api/admin/offers");
                if (res.ok) {
                    const data = await res.json();
                    setOffers(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);
        try {
            const payload = { titleAr, titleEn, subtitleAr, subtitleEn, imageUrl, priority: Number(priority), active };

            if (editingId) {
                const res = await fetch("/api/admin/offers", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingId, ...payload }),
                });
                if (!res.ok) throw new Error("Failed to update");
                const updated = await res.json();
                setOffers(prev => prev.map(o => o.id === editingId ? updated : o));
            } else {
                const res = await fetch("/api/admin/offers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Failed to create");
                const created = await res.json();
                setOffers(prev => [...prev, created]);
            }
            closeModal();
        } catch (e) {
            console.error(e);
            alert("حدث خطأ");
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("هل أنت متأكد من الحذف؟")) {
            try {
                const res = await fetch("/api/admin/offers", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                });
                if (res.ok) {
                    setOffers(prev => prev.filter(o => o.id !== id));
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const openModal = (offer?: Offer) => {
        if (offer) {
            setEditingId(offer.id);
            setTitleAr(offer.titleAr);
            setTitleEn(offer.titleEn || "");
            setSubtitleAr(offer.subtitleAr || "");
            setSubtitleEn(offer.subtitleEn || "");
            setImageUrl(offer.imageUrl || "");
            setPriority(offer.priority);
            setActive(offer.active);
        } else {
            setEditingId(null);
            setTitleAr("");
            setTitleEn("");
            setSubtitleAr("");
            setSubtitleEn("");
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
                    className="flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark"
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
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    value={titleAr}
                                    onChange={(e) => setTitleAr(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Offer Title (English)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    value={titleEn}
                                    onChange={(e) => setTitleEn(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">عنوان فرعي (عربي)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    value={subtitleAr}
                                    onChange={(e) => setSubtitleAr(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subtitle (English)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
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
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    value={priority}
                                    onChange={(e) => setPriority(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">صورة العرض (رابط)</label>
                                <input type="url" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" dir="ltr" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                                {imageUrl && (
                                    <div className="mt-2 relative w-24 h-24 rounded overflow-hidden border">
                                        <Image src={imageUrl} alt="preview" fill className="object-cover" />
                                    </div>
                                )}
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
                                    className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark disabled:opacity-50"
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
