"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Category } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import Image from "next/image";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Form Fields
    const [nameAr, setNameAr] = useState("");
    const [nameEn, setNameEn] = useState(""); // Added
    const [descriptionAr, setDescriptionAr] = useState("");
    const [descriptionEn, setDescriptionEn] = useState(""); // Added
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState("kg");
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            const MOCK_PRODUCTS: Product[] = [
                { id: "1", nameAr: "طماطم بلدي", descriptionAr: "طماطم حمراء طازجة درجة اولى", price: 0.75, unit: "كغ", categoryId: "veg", imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
                { id: "2", nameAr: "خيار شمسي", descriptionAr: "خيار طازج وصغير", price: 0.60, unit: "كغ", categoryId: "veg", imageUrl: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
                { id: "3", nameAr: "بطاطا", descriptionAr: "بطاطا للطبخ والقلي", price: 0.50, unit: "كغ", categoryId: "veg", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
                { id: "4", nameAr: "تفاح أحمر", descriptionAr: "تفاح سكري فاخر", price: 1.25, unit: "كغ", categoryId: "fruit", imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
                { id: "5", nameAr: "موز", descriptionAr: "موز صومالي درجة اولى", price: 0.95, unit: "كغ", categoryId: "fruit", imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
            ];
            const MOCK_CATS: Category[] = [
                { id: "veg", nameAr: "خضروات", order: 1 },
                { id: "fruit", nameAr: "فواكه", order: 2 },
            ];
            setProducts(MOCK_PRODUCTS);
            setCategories(MOCK_CATS);
            setLoading(false);
            return;
        }

        const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
            setLoading(false);
        });
        const unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
            setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
        });
        return () => {
            unsubProducts();
            unsubCategories();
        }
    }, []);

    const openModal = (product?: Product) => {
        if (product) {
            setEditingId(product.id);
            setNameAr(product.nameAr);
            setNameEn(product.nameEn || "");
            setDescriptionAr(product.descriptionAr);
            setDescriptionEn(product.descriptionEn || "");
            setPrice(product.price.toString());
            setUnit(product.unit);
            setCategoryId(product.categoryId || "");
            setImageUrl(product.imageUrl || "");
            setActive(product.active);
        } else {
            setEditingId(null);
            setNameAr("");
            setNameEn("");
            setDescriptionAr("");
            setDescriptionEn("");
            setPrice("");
            setUnit("kg");
            setCategoryId("");
            setImageUrl("");
            setActive(true);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);
        try {
            const payload = {
                nameAr,
                nameEn,
                descriptionAr,
                descriptionEn,
                price: Number(price),
                unit,
                categoryId,
                imageUrl,
                active,
                updatedAt: Date.now()
            };

            if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
                if (editingId) {
                    setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...payload, id: p.id } as Product : p));
                } else {
                    const newProduct: Product = { ...payload, id: Math.random().toString(), createdAt: Date.now() } as Product;
                    setProducts(prev => [newProduct, ...prev]);
                }
                setIsModalOpen(false);
                setFormSubmitting(false);
                return;
            }

            if (editingId) {
                await updateDoc(doc(db, "products", editingId), payload);
            } else {
                await addDoc(collection(db, "products"), {
                    ...payload,
                    createdAt: Date.now()
                });
            }
            setIsModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Error saving product");
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
                setProducts(prev => prev.filter(p => p.id !== id));
                return;
            }
            await deleteDoc(doc(db, "products", id));
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
                <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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
                            <p className="text-sm text-gray-500 mb-2">{categories.find(c => c.id === product.categoryId)?.nameAr || "بلا تصنيف"}</p>
                            <p className="text-green-600 font-bold">{product.price} د.أ / {product.unit}</p>
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

                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium">الوحدة</label>
                                    <select className="w-full border rounded p-2" value={unit} onChange={e => setUnit(e.target.value)}>
                                        <option value="kg">كيلو</option>
                                        <option value="piece">قطعة</option>
                                        <option value="box">صندوق</option>
                                        <option value="bundle">ضمة</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium">السعر (د.أ)</label>
                                    <input type="number" step="0.01" required className="w-full border rounded p-2" value={price} onChange={e => setPrice(e.target.value)} />
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
                                <label className="block text-sm font-medium mb-1">صورة المنتج</label>
                                <ImageUpload value={imageUrl} onChange={setImageUrl} folder="products" />
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} id="active" />
                                <label htmlFor="active">فعال</label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">إلغاء</button>
                                <button type="submit" disabled={formSubmitting} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
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
