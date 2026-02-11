"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Form Fields
    const [nameAr, setNameAr] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [descriptionAr, setDescriptionAr] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [selectedUnits, setSelectedUnits] = useState<Record<string, { checked: boolean; price: string }>>({
        kg: { checked: true, price: "" },
        piece: { checked: false, price: "" },
        box: { checked: false, price: "" },
        bundle: { checked: false, price: "" },
    });
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [active, setActive] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/products");
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products);
                    setCategories(data.categories);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const UNIT_LABELS: Record<string, string> = {
        kg: "كيلو",
        piece: "قطعة",
        box: "صندوق",
        bundle: "ضمة",
    };

    const openModal = (product?: Product) => {
        if (product) {
            setEditingId(product.id);
            setNameAr(product.nameAr);
            setNameEn(product.nameEn || "");
            setDescriptionAr(product.descriptionAr || "");
            setDescriptionEn(product.descriptionEn || "");
            const newUnits: Record<string, { checked: boolean; price: string }> = {
                kg: { checked: false, price: "" },
                piece: { checked: false, price: "" },
                box: { checked: false, price: "" },
                bundle: { checked: false, price: "" },
            };
            product.units.forEach(u => {
                if (newUnits[u.unit]) {
                    newUnits[u.unit] = { checked: true, price: u.price.toString() };
                }
            });
            setSelectedUnits(newUnits);
            setCategoryId(product.categoryId ? String(product.categoryId) : "");
            setImageUrl(product.imageUrl || "");
            setActive(product.active);
        } else {
            setEditingId(null);
            setNameAr("");
            setNameEn("");
            setDescriptionAr("");
            setDescriptionEn("");
            setSelectedUnits({
                kg: { checked: true, price: "" },
                piece: { checked: false, price: "" },
                box: { checked: false, price: "" },
                bundle: { checked: false, price: "" },
            });
            setCategoryId("");
            setImageUrl("");
            setActive(true);
        }
        setIsModalOpen(true);
    };

    const refreshProducts = async () => {
        try {
            const res = await fetch("/api/admin/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
                setCategories(data.categories);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);

        // Build units array from checkboxes
        const checkedUnits = Object.entries(selectedUnits)
            .filter(([, v]) => v.checked)
            .map(([key, v]) => ({ unit: key, price: Number(v.price) || 0 }));

        if (checkedUnits.length === 0) {
            alert("يجب اختيار وحدة واحدة على الأقل");
            setFormSubmitting(false);
            return;
        }

        // Validate that all checked units have a price
        const missingPrice = checkedUnits.find(u => u.price <= 0);
        if (missingPrice) {
            alert(`يجب إدخال سعر للوحدة: ${UNIT_LABELS[missingPrice.unit]}`);
            setFormSubmitting(false);
            return;
        }

        try {
            const payload = {
                nameAr,
                nameEn,
                descriptionAr,
                descriptionEn,
                units: checkedUnits,
                categoryId: Number(categoryId),
                imageUrl,
                active,
            };

            if (editingId) {
                const res = await fetch("/api/admin/products", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingId, ...payload }),
                });
                if (!res.ok) throw new Error("Failed to update");
            } else {
                const res = await fetch("/api/admin/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Failed to create");
            }
            await refreshProducts();
            setIsModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Error saving product");
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("هل أنت متأكد من الحذف؟")) {
            try {
                const res = await fetch("/api/admin/products", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                });
                if (res.ok) {
                    setProducts(prev => prev.filter(p => p.id !== id));
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
                <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark">
                    <Plus className="w-5 h-5 ml-2" />
                    منتج جديد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow border overflow-hidden flex flex-col">
                        <div className="relative h-48 w-full bg-gray-100">
                            {product.imageUrl ? (
                                <Image src={product.imageUrl} alt={product.nameAr} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">لا توجد صورة</div>
                            )}
                            {!product.active && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">غير فعال</div>
                            )}
                        </div>
                        <div className="p-4 flex-1">
                            <h3 className="font-bold text-lg">{product.nameAr}</h3>
                            <p className="text-sm text-gray-500 mb-2">{categories.find(c => c.id === Number(product.categoryId))?.nameAr || "بلا تصنيف"}</p>
                            <div className="flex flex-wrap gap-2">
                                {product.units.map(u => (
                                    <span key={u.unit} className="text-brand font-bold text-sm bg-brand-50 px-2 py-1 rounded">
                                        {u.price} د.أ / {UNIT_LABELS[u.unit] || u.unit}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            <button onClick={() => openModal(product)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Pencil className="w-5 h-5" /></button>
                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" dir="rtl">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingId ? "تعديل منتج" : "منتج جديد"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">اسم المنتج (عربي)</label>
                                    <input type="text" required className="w-full border rounded p-2" value={nameAr} onChange={e => setNameAr(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Product Name (English)</label>
                                    <input type="text" className="w-full border rounded p-2" value={nameEn} onChange={e => setNameEn(e.target.value)} dir="ltr" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">الوصف (عربي)</label>
                                    <textarea className="w-full border rounded p-2" rows={3} value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Description (English)</label>
                                    <textarea className="w-full border rounded p-2" rows={3} value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} dir="ltr" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">الوحدات والأسعار</label>
                                <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                                    {Object.entries(UNIT_LABELS).map(([key, label]) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id={`unit-${key}`}
                                                checked={selectedUnits[key]?.checked || false}
                                                onChange={e => {
                                                    setSelectedUnits(prev => ({
                                                        ...prev,
                                                        [key]: { ...prev[key], checked: e.target.checked }
                                                    }));
                                                }}
                                                className="w-4 h-4 accent-brand"
                                            />
                                            <label htmlFor={`unit-${key}`} className="text-sm font-medium w-16">{label}</label>
                                            {selectedUnits[key]?.checked && (
                                                <div className="flex items-center gap-1 flex-1">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="السعر"
                                                        className="border rounded p-2 w-32"
                                                        value={selectedUnits[key]?.price || ""}
                                                        onChange={e => {
                                                            setSelectedUnits(prev => ({
                                                                ...prev,
                                                                [key]: { ...prev[key], price: e.target.value }
                                                            }));
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-500">د.أ</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">التصنيف</label>
                                <select required className="w-full border rounded p-2" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                    <option value="">اختر تصنيف</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.nameAr}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">صورة المنتج (رابط)</label>
                                <input type="url" className="w-full border rounded p-2" dir="ltr" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                                {imageUrl && (
                                    <div className="mt-2 relative w-24 h-24 rounded overflow-hidden border">
                                        <Image src={imageUrl} alt="preview" fill className="object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} id="active" />
                                <label htmlFor="active">فعال</label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">إلغاء</button>
                                <button type="submit" disabled={formSubmitting} className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark disabled:opacity-50">
                                    {formSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "حفظ"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
