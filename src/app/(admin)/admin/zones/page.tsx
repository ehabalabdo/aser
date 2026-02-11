"use client";

import { useState, useEffect } from "react";
import { DeliveryZone } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function ZonesPage() {
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [nameAr, setNameAr] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [fee, setFee] = useState("");
    const [sortOrder, setSortOrder] = useState(0);
    const [active, setActive] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const res = await fetch("/api/admin/zones");
                if (res.ok) {
                    const data = await res.json();
                    setZones(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchZones();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);
        try {
            const payload = { nameAr, nameEn, fee: Number(fee), sortOrder: Number(sortOrder), active };

            if (editingId) {
                const res = await fetch("/api/admin/zones", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingId, ...payload }),
                });
                if (!res.ok) throw new Error("Failed to update");
                const updated = await res.json();
                setZones(prev => prev.map(z => z.id === editingId ? updated : z));
            } else {
                const res = await fetch("/api/admin/zones", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Failed to create");
                const created = await res.json();
                setZones(prev => [...prev, created]);
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
                const res = await fetch("/api/admin/zones", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                });
                if (res.ok) {
                    setZones(prev => prev.filter(z => z.id !== id));
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const openModal = (zone?: DeliveryZone) => {
        if (zone) {
            setEditingId(zone.id);
            setNameAr(zone.nameAr);
            setNameEn(zone.nameEn || "");
            setFee(zone.fee.toString());
            setSortOrder(zone.sortOrder);
            setActive(zone.active);
        } else {
            setEditingId(null);
            setNameAr("");
            setNameEn("");
            setFee("");
            setSortOrder(zones.length + 1);
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
                <h1 className="text-2xl font-bold text-gray-900">إدارة مناطق التوصيل</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark"
                >
                    <Plus className="w-5 h-5 ml-2" />
                    منطقة جديدة
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الترتيب
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                المنطقة
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                رسوم التوصيل
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الحالة
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الإجراءات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {zones.map((zone) => (
                            <tr key={zone.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {zone.sortOrder}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {zone.nameAr} ({zone.nameEn || 'N/A'})
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {zone.fee} د.أ
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {zone.active ? <span className="text-brand">فعال</span> : <span className="text-red-500">غير فعال</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-4">
                                    <button onClick={() => openModal(zone)} className="text-blue-600 hover:text-blue-900">
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(zone.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-right" dir="rtl">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingId ? "تعديل منطقة" : "إضافة منطقة جديدة"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">اسم المنطقة</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    value={nameAr}
                                    onChange={(e) => setNameAr(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">رسوم التوصيل (د.أ)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">الترتيب</label>
                                <input
                                    type="number"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="activeZone" checked={active} onChange={e => setActive(e.target.checked)} />
                                <label htmlFor="activeZone">فعال</label>
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
