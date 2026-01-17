"use client";

import { useEffect, useState } from "react";
import { User, Shield, ExternalLink, ShoppingBag } from "lucide-react";

export default function DevRoleSwitcher() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Only show in local/demo mode
    const isDemo = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-mode';

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isDemo) return null;

    const switchRole = (role: 'admin' | 'cashier' | 'customer') => {
        const email = role === 'admin' ? 'admin@demo.com' : (role === 'cashier' ? 'cashier@demo.com' : 'customer@demo.com');
        const name = role === 'admin' ? 'مدير النظام' : (role === 'cashier' ? 'الكاشير' : 'زبون تجريبي');

        const session = {
            uid: 'demo-' + role,
            email: email,
            role: role,
            name: name
        };

        localStorage.setItem('demo_user_session', JSON.stringify(session));
        window.location.href = role === 'admin' ? '/admin' : (role === 'cashier' ? '/cashier' : '/');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans" dir="ltr">
            {isOpen && (
                <div className="bg-white p-2 rounded-lg shadow-2xl border border-gray-200 mb-2 flex flex-col gap-2 min-w-[220px] animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-center px-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Dev Tools</span>
                        <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Active</span>
                    </div>

                    <button
                        onClick={() => switchRole('admin')}
                        className="flex items-center gap-3 p-2 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-md transition-colors text-left"
                    >
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Admin</span>
                    </button>

                    <button
                        onClick={() => switchRole('cashier')}
                        className="flex items-center gap-3 p-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-md transition-colors text-left"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">Cashier</span>
                    </button>

                    <button
                        onClick={() => switchRole('customer')}
                        className="flex items-center gap-3 p-2 hover:bg-green-50 text-gray-700 hover:text-green-600 rounded-md transition-colors text-left"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span className="text-sm font-medium">Customer</span>
                    </button>

                    <div className="border-t my-1"></div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('demo_user_session');
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500 rounded-md transition-colors text-left"
                    >
                        <span className="text-xs">Logout / Reset</span>
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-900 text-white px-4 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 font-medium"
            >
                <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">DEV</code>
                <span>{isOpen ? 'Close Tools' : 'Switch Role'}</span>
            </button>
        </div>
    );
}
