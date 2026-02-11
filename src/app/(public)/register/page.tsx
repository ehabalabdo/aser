"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function RegisterPage() {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim().toLowerCase(),
                    displayName: name,
                    phone,
                    password,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "فشل إنشاء الحساب. حاول مرة أخرى.");
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
            setError("فشل إنشاء الحساب. حاول مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">{t("register.title")}</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t("register.subtitle")}
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="sr-only">{t("register.full_name")}</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                            placeholder={t("register.full_name")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="sr-only">{t("auth.phone")}</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                            placeholder={t("register.phone_placeholder")}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

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
                            minLength={6}
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                            placeholder={t("register.password_placeholder")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-70 transition-colors"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t("register.submit")}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        {t("auth.has_account")}{" "}
                        <Link href="/login" className="font-medium text-brand hover:text-brand-dark">
                            {t("auth.login_link") || t("auth.submit_login")}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
