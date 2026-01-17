"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="gap-2 font-bold"
        >
            <Globe className="w-4 h-4" />
            {language === "ar" ? "English" : "عربي"}
        </Button>
    );
}
