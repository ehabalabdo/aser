
"use client";

import { useEffect, useState } from "react";
import { Product, Category, Offer } from "@/lib/types";
import ProductCard from "@/components/ui/ProductCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function HomePage() {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes, offerRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/categories"),
                    fetch("/api/offers"),
                ]);
                if (prodRes.ok) setProducts(await prodRes.json());
                if (catRes.ok) setCategories(await catRes.json());
                if (offerRes.ok) setOffers(await offerRes.json());
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
        const matchesCategory = selectedCategory === "all" || product.categoryId === Number(selectedCategory);
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
            <div className="md:hidden sticky top-14 z-30 bg-white/95 backdrop-blur-md px-3 py-2 shadow-sm -mx-4">
                <div className="relative">
                    <Search className="absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                    <Input
                        type="text"
                        placeholder={t("home.search_placeholder")}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white transition-all shadow-sm rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="absolute top-2.5 p-1.5 rounded-lg bg-brand-50 text-brand-dark rtl:left-3 ltr:right-3">
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
                <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/7]">
                    <div className="absolute inset-0 transition-transform duration-700 ease-out flex" style={{ transform: `translateX(${-currentSlide * 100}%)`, direction: 'ltr' }}>
                        {/* Note: Direction LTR is needed for transform translateX logic to work predictably, but content is RTL */}
                        {offers.map((offer, index) => (
                            <div key={offer.id} className="relative min-w-full h-full bg-gradient-to-br from-primary via-brand-dark to-secondary" dir="rtl">
                                {offer.imageUrl && <Image src={offer.imageUrl} alt={offer.titleAr} fill className="object-cover" priority={index === 0} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-center px-4 sm:px-6 md:px-12 text-white">
                                    <Badge className="w-fit mb-2 sm:mb-4 bg-accent text-black font-bold animate-fade-in text-xs sm:text-sm">{t("home.featured")}</Badge>
                                    <h2 className="text-xl sm:text-3xl md:text-5xl font-black mb-1 sm:mb-2 max-w-lg leading-tight animate-fade-in">
                                        {language === 'en' ? (offer.titleEn || offer.titleAr) : offer.titleAr}
                                    </h2>
                                    <p className="text-sm sm:text-lg md:text-xl opacity-90 max-w-md animate-fade-in line-clamp-2" style={{ animationDelay: '100ms' }}>
                                        {language === 'en' ? (offer.subtitleEn || offer.subtitleAr) : offer.subtitleAr}
                                    </p>
                                    <Button className="w-fit mt-3 sm:mt-6 bg-white text-black hover:bg-white/90 font-bold text-sm sm:text-base" size="lg">{t("cart.shopping_continue")}</Button>
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
            <section className="-mx-4 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("home.categories")}</h2>
                    <button className="text-sm text-primary font-medium hover:underline">{t("common.filter_all")}</button>
                </div>
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={cn(
                            "flex-none snap-start flex flex-col items-center gap-1.5 sm:gap-2 min-w-[4rem] sm:min-w-[5rem] group",
                        )}
                    >
                        <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-sm border",
                            selectedCategory === "all" ? "bg-primary text-white border-primary ring-4 ring-primary/10" : "bg-white text-gray-500 border-gray-100 group-hover:border-primary/50")}>
                            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className={cn("text-xs sm:text-sm font-medium transition-colors", selectedCategory === "all" ? "text-primary" : "text-gray-600")}>{t("common.filter_all")}</span>
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(String(cat.id))}
                            className={cn(
                                "flex-none snap-start flex flex-col items-center gap-1.5 sm:gap-2 min-w-[4rem] sm:min-w-[5rem] group",
                            )}
                        >
                            <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-sm border overflow-hidden relative",
                                selectedCategory === String(cat.id) ? "bg-primary text-white border-primary ring-4 ring-primary/10" : "bg-white text-gray-500 border-gray-100 group-hover:border-primary/50")}>
                                <span className="text-2xl">🥬</span>
                            </div>
                            <span className={cn("text-xs sm:text-sm font-medium transition-colors", selectedCategory === String(cat.id) ? "text-primary" : "text-gray-600")}>
                                {language === 'en' ? (cat.nameEn || cat.nameAr) : cat.nameAr}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Products Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("home.featured")}</h2>
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
