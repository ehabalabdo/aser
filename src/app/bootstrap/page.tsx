"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BootstrapPage() {
    const { user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const router = useRouter();

    const handleBootstrap = async () => {
        if (!user || !user.email) return;

        if (user.email !== process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_EMAIL) {
            setMsg("هذا البريد الإلكتروني غير مصرح له بأن يكون مسؤولاً.");
            return;
        }

        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                role: "admin"
            });
            await refreshProfile();
            setMsg("تم منح صلاحيات المسؤول بنجاح! جاري التوجيه...");
            setTimeout(() => router.push("/admin"), 1500);
        } catch (e) {
            console.error(e);
            setMsg("حدث خطأ أثناء تحديث الصلاحيات.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <p>يرجى تسجيل الدخول أولاً.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full text-center">
                <ShieldCheck className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">تفعيل حساب المسؤول</h1>
                <p className="text-gray-600 mb-6">
                    سيتم التحقق من بريدك الإلكتروني ومنحك صلاحيات المسؤول إذا كان مطابقاً للإعدادات.
                </p>

                {msg && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${msg.includes("نجاح") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {msg}
                    </div>
                )}

                <button
                    onClick={handleBootstrap}
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "تفعيل الصلاحيات"}
                </button>
            </div>
        </div>
    );
}
