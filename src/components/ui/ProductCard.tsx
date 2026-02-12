"use client";

import { Product, UnitPrice } from "@/lib/types";
import { useCart } from "@/lib/store";
import Image from "next/image";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/components/providers/LanguageProvider"; // Hook
import { cn } from "@/lib/utils"; // Assuming cn utility for class merging

const UNIT_LABELS: Record<string, { ar: string; en: string }> = {
    kg: { ar: "كيلو", en: "Kg" },
    piece: { ar: "قطعة", en: "Piece" },
    box: { ar: "صندوق", en: "Box" },
    bundle: { ar: "ضمة", en: "Bundle" },
};

export default function ProductCard({ product }: { product: Product }) {
    const { items, addItem, updateQuantity } = useCart();
    const { t, language } = useLanguage();

    // Get available units
    const availableUnits: UnitPrice[] = useMemo(() => {
        return product.units;
    }, [product.units]);

    const [selectedUnit, setSelectedUnit] = useState<string>(availableUnits[0].unit);
    const [adding, setAdding] = useState(false);

    const currentUnitPrice = availableUnits.find(u => u.unit === selectedUnit)?.price ?? availableUnits[0]?.price ?? 0;
    const cartKey = `${product.id}_${selectedUnit}`;
    const cartItem = items.find((i) => i.cartKey === cartKey || (i.productId === product.id && i.unit === selectedUnit));

    const handleAdd = () => {
        addItem({
            productId: product.id,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            price: currentUnitPrice,
            qty: 1,
            unit: selectedUnit,
            imageUrl: product.imageUrl,
            cartKey,
        });
        setAdding(true);
        setTimeout(() => setAdding(false), 500);
    };

    const unitLabel = (u: string) => {
        const labels = UNIT_LABELS[u];
        if (!labels) return u;
        return language === "en" ? labels.en : labels.ar;
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
                        {currentUnitPrice.toFixed(2)} {t("common.currency")} / {unitLabel(selectedUnit)}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-3 sm:p-4 flex-1 flex flex-col gap-1.5 sm:gap-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 text-sm sm:text-lg">
                        {language === 'en' ? (product.nameEn || product.nameAr) : product.nameAr}
                    </h3>
                </div>
                {(product.descriptionAr || product.descriptionEn) && (
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                        {language === 'en' ? (product.descriptionEn || product.descriptionAr) : product.descriptionAr}
                    </p>
                )}

                {/* Unit selector - only show if multiple units */}
                {availableUnits.length > 1 && (
                    <div className="flex gap-1 sm:gap-1.5 flex-wrap mt-1">
                        {availableUnits.map(u => (
                            <button
                                key={u.unit}
                                onClick={() => setSelectedUnit(u.unit)}
                                className={cn(
                                    "text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all font-medium",
                                    selectedUnit === u.unit
                                        ? "bg-brand text-white border-brand shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-light hover:text-brand-dark"
                                )}
                            >
                                {unitLabel(u.unit)} - {u.price.toFixed(2)}
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 sm:p-4 pt-0">
                {cartItem ? (
                    <div className="flex items-center justify-between w-full bg-brand-50 rounded-lg p-1 border border-brand-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(cartItem.cartKey || String(product.id), cartItem.qty - 1)}
                            className="h-8 w-8 text-brand-dark hover:bg-brand-100 hover:text-brand-dark"
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-brand-dark w-8 text-center">{cartItem.qty}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(cartItem.cartKey || String(product.id), cartItem.qty + 1)}
                            className="h-8 w-8 text-brand-dark hover:bg-brand-100 hover:text-brand-dark"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={handleAdd}
                        className={cn("w-full gap-2 font-bold shadow-sm transition-all relative overflow-hidden",
                            adding ? "bg-brand-dark" : "hover:translate-y-[-2px]")}
                        disabled={adding}
                    >
                        {/* Ripple/Success Effect */}
                        <div className={cn("absolute inset-0 bg-brand-dark flex items-center justify-center transition-transform duration-300",
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

