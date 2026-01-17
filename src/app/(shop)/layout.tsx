"use client";

import { Header } from "@/components/layout/Header";
import { MessageCircle } from "lucide-react";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "96270000000";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Floating WhatsApp Button */}
            <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-50 flex items-center justify-center"
            >
                <MessageCircle className="w-8 h-8" />
            </a>
        </div>
    );
}
