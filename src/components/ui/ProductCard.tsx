"use client";

import { Product } from "@/lib/types";
import { useCart } from "@/lib/store";
import Image from "next/image";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/components/providers/LanguageProvider"; // Hook
import { cn } from "@/lib/utils"; // Assuming cn utility for class merging

export default function ProductCard({ product }: { product: Product }) {
    const { items, addItem, updateQuantity } = useCart();
    const { t, language } = useLanguage();
    const cartItem = items.find((i) => i.productId === product.id);
    const [adding, setAdding] = useState(false);

    const handleAdd = () => {
        addItem({
            productId: product.id,
            nameAr: product.nameAr,
            nameEn: product.nameEn, // Added
            price: product.price,
            qty: 1,
            unit: product.unit,
            imageUrl: product.imageUrl
        });
        setAdding(true);
        setTimeout(() => setAdding(false), 500);
    };

    return (
        <Card className="h-full flex flex-col overflow-hidden group border-0 shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Image Section */}
            <div className="relative aspect-[4/3] w-full bg-surface overflow-hidden">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.nameAr}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                        <ShoppingCart className="w-8 h-8 opacity-20" />
                    </div>
                )}
                {/* Overlay only on hover */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Price Tag Overlay */}
                <div className="absolute bottom-2 left-2">
                    <Badge className="bg-white/90 text-primary hover:bg-white shadow-sm backdrop-blur-sm text-sm font-bold px-3 py-1">
                        {product.price.toFixed(2)} {t("common.currency")}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 text-lg">
                        {language === 'en' ? (product.nameEn || product.nameAr) : product.nameAr}
                    </h3>
                </div>
                {(product.descriptionAr || product.descriptionEn) && (
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                        {language === 'en' ? (product.descriptionEn || product.descriptionAr) : product.descriptionAr}
                    </p>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0">
                {cartItem ? (
                    <div className="flex items-center justify-between w-full bg-green-50 rounded-lg p-1 border border-green-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(product.id, cartItem.qty - 1)}
                            className="h-8 w-8 text-green-700 hover:bg-green-100 hover:text-green-800"
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-green-700 w-8 text-center">{cartItem.qty}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(product.id, cartItem.qty + 1)}
                            className="h-8 w-8 text-green-700 hover:bg-green-100 hover:text-green-800"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={handleAdd}
                        className={cn("w-full gap-2 font-bold shadow-sm transition-all relative overflow-hidden",
                            adding ? "bg-green-700" : "hover:translate-y-[-2px]")}
                        disabled={adding}
                    >
                        {/* Ripple/Success Effect */}
                        <div className={cn("absolute inset-0 bg-green-700 flex items-center justify-center transition-transform duration-300",
                            adding ? "translate-y-0" : "translate-y-full")}>
                            <ShoppingCart className="w-5 h-5 animate-bounce" />
                        </div>

                        <span className={cn("flex items-center gap-2", adding && "opacity-0")}>
                            <Plus className="w-5 h-5" />
                            {t("home.add_to_cart")}
                        </span>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

