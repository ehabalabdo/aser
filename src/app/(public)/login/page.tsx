"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LoginPage() {
    const { t } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "فشل تسجيل الدخول");
                return;
            }
            // Redirect based on role
            const role = data.user?.role;
            if (role === 'admin') {
                window.location.href = '/admin';
            } else if (role === 'cashier') {
                window.location.href = '/cashier';
            } else {
                window.location.href = '/';
            }
        } catch {
            setError("فشل تسجيل الدخول. تأكد من اسم المستخدم وكلمة المرور.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <img src="/logo.png" alt="Logo" className="mx-auto w-20 h-20" />
                    <img src="/logossd.png" alt="اسر" className="mx-auto mt-3 h-14 object-contain" />
                    <h2 className="mt-4 text-3xl font-bold text-gray-900">{t("auth.login_title")}</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t("auth.welcome_back")}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">{t("auth.username")}</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                                placeholder={t("auth.username")}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">{t("auth.password")}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                                placeholder={t("auth.password")}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-70 transition-colors"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t("auth.submit_login")}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        {t("auth.no_account")}{" "}
                        <Link href="/register" className="font-medium text-brand hover:text-brand-dark">
                            {t("auth.register_now")}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
