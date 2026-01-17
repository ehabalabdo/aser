
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Category, Offer } from "@/lib/types";
import ProductCard from "@/components/ui/ProductCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/components/providers/LanguageProvider"; // Hook

export default function HomePage() {
    const { t, language } = useLanguage(); // Get t and language
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    const MOCK_PRODUCTS: Product[] = [
        { id: "1", nameAr: "طماطم بلدي", nameEn: "Local Tomatoes", descriptionAr: "طماطم حمراء طازجة درجة اولى", descriptionEn: "Fresh red local tomatoes, premium quality", price: 0.75, unit: "كغ", categoryId: "veg", imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
        { id: "2", nameAr: "خيار شمسي", nameEn: "Cucumber", descriptionAr: "خيار طازج وصغير", descriptionEn: "Fresh small cucumbers", price: 0.60, unit: "كغ", categoryId: "veg", imageUrl: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
        { id: "3", nameAr: "بطاطا", nameEn: "Potatoes", descriptionAr: "بطاطا للطبخ والقلي", descriptionEn: "Potatoes perfect for frying and cooking", price: 0.50, unit: "كغ", categoryId: "veg", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
        { id: "4", nameAr: "تفاح أحمر", nameEn: "Red Apples", descriptionAr: "تفاح سكري فاخر", descriptionEn: "Premium sweet red apples", price: 1.25, unit: "كغ", categoryId: "fruit", imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
        { id: "5", nameAr: "موز", nameEn: "Bananas", descriptionAr: "موز صومالي درجة اولى", descriptionEn: "Premium Somali Bananas", price: 0.95, unit: "كغ", categoryId: "fruit", imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
        { id: "6", nameAr: "برتقال عصير", nameEn: "Juice Oranges", descriptionAr: "برتقال طازج للعصير", descriptionEn: "Fresh oranges perfect for juicing", price: 0.85, unit: "كغ", categoryId: "fruit", imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=500&q=80", createdAt: 0, updatedAt: 0, active: true },
    ];

    const MOCK_CATS: Category[] = [
        { id: "veg", nameAr: "خضروات", nameEn: "Vegetables", order: 1 },
        { id: "fruit", nameAr: "فواكه", nameEn: "Fruits", order: 2 },
        { id: "leafs", nameAr: "ورقيات", nameEn: "Leafy Greens", order: 3 },
        { id: "herbs", nameAr: "أعشاب", nameEn: "Herbs", order: 4 },
    ];

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            // Force Demo Mode Check
            if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode') {
                setCategories(MOCK_CATS);
                setProducts(MOCK_PRODUCTS);
                setOffers([
                    { id: "1", titleAr: "عرض التوفير", titleEn: "Super Saver", subtitleAr: "سلة خضار مشكلة بـ 5 دنانير فقط", subtitleEn: "Mixed Veggie Box for only 5 JOD", priority: 1, active: true, createdAt: 0, imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80" },
                    { id: "2", titleAr: "فواكه طازجة", titleEn: "Fresh Fruits", subtitleAr: "خصم 20% على جميع الفواكه المستوردة", subtitleEn: "20% Off all imported fruits", priority: 2, active: true, createdAt: 0, imageUrl: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=80" }
                ]);
                setLoading(false);
                return;
            }

            try {
                // Fetch Categories
                const catSnap = await getDocs(query(collection(db, "categories"), orderBy("order", "asc")));
                setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));

                // Fetch Active Products
                const prodSnap = await getDocs(query(collection(db, "products"), where("active", "==", true)));
                setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));

                // Fetch Active Offers
                const offerSnap = await getDocs(query(collection(db, "offers"), where("active", "==", true), orderBy("priority", "asc")));
                setOffers(offerSnap.docs.map(d => ({ id: d.id, ...d.data() } as Offer)));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Auto-advance slider
    useEffect(() => {
        if (offers.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % offers.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [offers.length]);

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
        const matchesSearch =
            product.nameAr.includes(searchTerm) ||
            (product.nameEn && product.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.descriptionAr && product.descriptionAr.includes(searchTerm)) ||
            (product.descriptionEn && product.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

    return (
        <div className="space-y-8 pb-20">
            {/* Search Bar - Sticky on Mobile */}
            <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-md px-4 py-3 shadow-sm -mx-4">
                <div className="relative">
                    <Search className="absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                    <Input
                        type="text"
                        placeholder={t("home.search_placeholder")}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white transition-all shadow-sm rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="absolute top-2.5 p-1.5 rounded-lg bg-green-50 text-green-700 rtl:left-3 ltr:right-3">
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Desktop Search (Hidden on Mobile) */}
            <div className="hidden md:block relative max-w-2xl mx-auto">
                <Input
                    type="text"
                    placeholder={t("home.search_placeholder")}
                    className="h-14 text-lg rounded-full bg-white border-gray-100 shadow-md focus:shadow-lg transition-all rtl:pr-14 rtl:pl-6 ltr:pl-14 ltr:pr-6"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute top-4 text-primary w-6 h-6 rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto" />
            </div>

            {/* Hero Section (Offers Slider) */}
            {offers.length > 0 && (
                <section className="relative rounded-3xl overflow-hidden shadow-lg aspect-[21/9] md:aspect-[21/7]">
                    <div className="absolute inset-0 transition-transform duration-700 ease-out flex" style={{ transform: `translateX(${currentSlide * 100}%)`, direction: 'ltr' }}>
                        {/* Note: Direction LTR is needed for transform translateX logic to work predictably, but content is RTL */}
                        {offers.map((offer, index) => (
                            <div key={offer.id} className="relative min-w-full h-full" dir="rtl">
                                {offer.imageUrl && <Image src={offer.imageUrl} alt={offer.titleAr} fill className="object-cover" priority={index === 0} />}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-center px-6 md:px-12 text-white">
                                    <Badge className="w-fit mb-4 bg-accent text-black font-bold animate-fade-in">{t("home.featured")}</Badge>
                                    <h2 className="text-3xl md:text-5xl font-black mb-2 max-w-lg leading-tight animate-fade-in">
                                        {language === 'en' ? (offer.titleEn || offer.titleAr) : offer.titleAr}
                                    </h2>
                                    <p className="text-lg md:text-xl opacity-90 max-w-md animate-fade-in" style={{ animationDelay: '100ms' }}>
                                        {language === 'en' ? (offer.subtitleEn || offer.subtitleAr) : offer.subtitleAr}
                                    </p>
                                    <Button className="w-fit mt-6 bg-white text-black hover:bg-white/90 font-bold" size="lg">{t("cart.shopping_continue")}</Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Slider Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10" dir="ltr">
                        {offers.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={cn("w-2 h-2 rounded-full transition-all", idx === currentSlide ? "bg-white w-6" : "bg-white/50 hover:bg-white/80")}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Categories Horizontal Scroll */}
            <section className="-mx-4 space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-bold text-gray-900">{t("home.categories")}</h2>
                    <button className="text-sm text-primary font-medium hover:underline">{t("common.filter_all")}</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={cn(
                            "flex-none snap-start flex flex-col items-center gap-2 min-w-[5rem] group",
                        )}
                    >
                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-sm border",
                            selectedCategory === "all" ? "bg-primary text-white border-primary ring-4 ring-primary/10" : "bg-white text-gray-500 border-gray-100 group-hover:border-primary/50")}>
                            <SlidersHorizontal className="w-6 h-6" />
                        </div>
                        <span className={cn("text-sm font-medium transition-colors", selectedCategory === "all" ? "text-primary" : "text-gray-600")}>{t("common.filter_all")}</span>
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex-none snap-start flex flex-col items-center gap-2 min-w-[5rem] group",
                            )}
                        >
                            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-sm border overflow-hidden relative",
                                selectedCategory === cat.id ? "bg-primary text-white border-primary ring-4 ring-primary/10" : "bg-white text-gray-500 border-gray-100 group-hover:border-primary/50")}>
                                {/* Placeholder for Category Icon/Image if added later */}
                                <span className="text-2xl">
                                    {cat.id === 'veg' ? '🍅' : (cat.id === 'fruit' ? '🍎' : (cat.id === 'leafs' ? '🥬' : '🌿'))}
                                </span>
                            </div>
                            <span className={cn("text-sm font-medium transition-colors", selectedCategory === cat.id ? "text-primary" : "text-gray-600")}>
                                {language === 'en' ? (cat.nameEn || cat.nameAr) : cat.nameAr}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Products Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{t("home.featured")}</h2>
                    <div className="flex gap-2">
                        <button className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"><ChevronRight className="w-5 h-5 rtl:rotate-180" /></button>
                        <button className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"><ChevronLeft className="w-5 h-5 rtl:rotate-180" /></button>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">{t("common.no_data")}</h3>
                        <p className="text-gray-500">{t("home.search_placeholder")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
