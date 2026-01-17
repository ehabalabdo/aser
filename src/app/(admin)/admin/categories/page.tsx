"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form State
    const [nameAr, setNameAr] = useState("");
    const [nameEn, setNameEn] = useState(""); // Added
    const [order, setOrder] = useState(0);
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
            setCategories([
                { id: "veg", nameAr: "خضروات", nameEn: "Vegetables", order: 1 },
                { id: "fruit", nameAr: "فواكه", nameEn: "Fruits", order: 2 },
            ]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, "categories"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Category[];
            setCategories(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);
        try {
            const payload = {
                nameAr,
                nameEn, // Added
                order: Number(order)
            };

            if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
                if (editingCategory) {
                    setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...payload } : c));
                } else {
                    const newCategory: Category = { id: Math.random().toString(), ...payload };
                    setCategories(prev => [...prev, newCategory]);
                }
                closeModal();
                setFormSubmitting(false);
                return;
            }

            if (editingCategory) {
                await updateDoc(doc(db, "categories", editingCategory.id), payload);
            } else {
                await addDoc(collection(db, "categories"), payload);
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
                setCategories(prev => prev.filter(c => c.id !== id));
                return;
            }
            await deleteDoc(doc(db, "categories", id));
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setNameAr(category.nameAr);
            setNameEn(category.nameEn || ""); // Added
            setOrder(category.order);
        } else {
            setEditingCategory(null);
            setNameAr("");
            setNameEn(""); // Added
            setOrder(categories.length + 1);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة التصنيفات</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة تصنيف
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
                                الاسم بالعربية
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                English
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الإجراءات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.order}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {category.nameAr}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.nameEn || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-4">
                                    <button onClick={() => openModal(category)} className="text-blue-600 hover:text-blue-900">
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">
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
                            {editingCategory ? "تعديل تصنيف" : "إضافة تصنيف جديد"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">الاسم بالعربية</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={nameAr}
                                    onChange={(e) => setNameAr(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category Name (English)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={nameEn}
                                    onChange={(e) => setNameEn(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">الترتيب</label>
                                <input
                                    type="number"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                />
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
