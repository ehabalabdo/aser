"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";
type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
    // General
    "app.name": { ar: "أسر", en: "Asr" },
    "loading": { ar: "جاري التحميل...", en: "Loading..." },
    "error": { ar: "حدث خطأ", en: "An error occurred" },

    // Auth
    "login": { ar: "تسجيل الدخول", en: "Login" },
    "logout": { ar: "تسجيل الخروج", en: "Logout" },

    // Navigation
    "nav.home": { ar: "الرئيسية", en: "Home" },
    "nav.cart": { ar: "السلة", en: "Cart" },
    "nav.orders": { ar: "طلباتي", en: "My Orders" },
    "nav.admin": { ar: "لوحة الإدارة", en: "Admin Dashboard" },
    "nav.cashier": { ar: "نظام الكاشير", en: "Cashier System" },

    // Cashier
    "cashier.title": { ar: "لوحة الكاشير", en: "Cashier Dashboard" },
    "cashier.subtitle": { ar: "متابعة الطلبات المباشرة", en: "Live Order Tracking" },
    "cashier.new_orders": { ar: "طلبات جديدة", en: "New Orders" },
    "cashier.preparing": { ar: "قيد التجهيز", en: "In Progress" },
    "cashier.delivery": { ar: "جاري التوصيل", en: "Out for Delivery" },
    "cashier.sound_on": { ar: "الصوت مفعل", en: "Sound On" },
    "cashier.sound_off": { ar: "الصوت معطل", en: "Sound Off" },
    "cashier.accept": { ar: "قبول", en: "Accept" },
    "cashier.reject": { ar: "رفض", en: "Reject" },
    "cashier.print": { ar: "طباعة", en: "Print" },
    "cashier.start_preparing": { ar: "بدء التحضير", en: "Start Preparing" },
    "cashier.send_delivery": { ar: "إرسال للتوصيل", en: "Send to Delivery" },
    "cashier.delivered": { ar: "تم التسليم", en: "Delivered" },
    "cashier.empty_new": { ar: "لا يوجد طلبات جديدة", en: "No new orders" },
    "cashier.empty_progress": { ar: "لا يوجد طلبات قيد التجهيز", en: "No orders in progress" },
    "cashier.empty_delivery": { ar: "لا يوجد طلبات في الطريق", en: "No orders out for delivery" },

    // Common
    "common.back": { ar: "رجوع", en: "Back" },
    "common.save": { ar: "حفظ", en: "Save" },
    "common.cancel": { ar: "إلغاء", en: "Cancel" },
    "common.delete": { ar: "حذف", en: "Delete" },
    "common.edit": { ar: "تعديل", en: "Edit" },
    "common.search": { ar: "بحث", en: "Search" },
    "common.filter_all": { ar: "الكل", en: "All" },
    "common.currency": { ar: "د.أ", en: "JOD" },
    "common.quantity": { ar: "الكمية", en: "Qty" },
    "common.price": { ar: "السعر", en: "Price" },
    "common.total": { ar: "المجموع", en: "Total" },
    "common.subtotal": { ar: "المجموع الفرعي", en: "Subtotal" },
    "common.delivery_fee": { ar: "رسوم التوصيل", en: "Delivery Fee" },
    "common.unknown": { ar: "غير معروف", en: "Unknown" },
    "common.no_data": { ar: "لا يوجد بيانات", en: "No data available" },
    "common.kg": { ar: "كغ", en: "kg" },

    // Auth
    "auth.login_title": { ar: "تسجيل الدخول", en: "Login" },
    "auth.login_desc": { ar: "أدخل بريدك الإلكتروني وكلمة المرور", en: "Enter your email and password" },
    "auth.register_title": { ar: "إنشاء حساب", en: "Create Account" },
    "auth.email": { ar: "اسم المستخدم", en: "Username" },
    "auth.username": { ar: "اسم المستخدم", en: "Username" },
    "auth.username_placeholder": { ar: "أدخل اسم المستخدم", en: "Enter username" },
    "auth.password": { ar: "كلمة المرور", en: "Password" },
    "auth.name": { ar: "الاسم الكامل", en: "Full Name" },
    "auth.phone": { ar: "رقم الهاتف", en: "Phone Number" },
    "auth.submit_login": { ar: "دخول", en: "Sign In" },
    "auth.submit_register": { ar: "تسجيل", en: "Register" },
    "auth.has_account": { ar: "لديك حساب؟", en: "Have an account?" },
    "auth.no_account": { ar: "ليس لديك حساب؟", en: "No account?" },
    "auth.welcome_back": { ar: "أهلاً بك مجدداً في متجرنا", en: "Welcome back to our store" },
    "auth.or_continue": { ar: "أو تابع باستخدام", en: "Or continue with" },
    "auth.register_now": { ar: "سجل مجاناً", en: "Register for free" },

    // Home
    "home.welcome": { ar: "أهلا بك في أسر", en: "Welcome to Asr" },
    "home.search_placeholder": { ar: "ابحث عن منتج...", en: "Search for a product..." },
    "home.categories": { ar: "التصنيفات", en: "Categories" },
    "home.featured": { ar: "عروض مميزة", en: "Featured Offers" },
    "home.add_to_cart": { ar: "أضف للسلة", en: "Add to Cart" },
    "home.out_of_stock": { ar: "نفذت الكمية", en: "Out of Stock" },

    // Cart
    "cart.title": { ar: "سلة المشتريات", en: "Shopping Cart" },
    "cart.empty": { ar: "السلة فارغة", en: "Your cart is empty" },
    "cart.empty_desc": { ar: "تسوق الان وأضف منتجات طازجة", en: "Shop now and add fresh products" },
    "cart.shopping_continue": { ar: "متابعة التسوق", en: "Continue Shopping" },
    "cart.summary": { ar: "ملخص الطلب", en: "Order Summary" },
    "cart.checkout": { ar: "إتمام الطلب", en: "Checkout" },
    "cart.delivery_info": { ar: "بيانات التوصيل", en: "Delivery Info" },
    "cart.select_zone": { ar: "اختر المنطقة", en: "Select Zone" },
    "cart.street": { ar: "اسم الشارع", en: "Street Name" },
    "cart.building": { ar: "رقم العمارة", en: "Building No." },
    "cart.details": { ar: "تفاصيل إضافية", en: "Additional Details" },
    "cart.payment_cod": { ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
    "cart.loading_zones": { ar: "جاري تحميل المناطق...", en: "Loading zones..." },
    "cart.fill_address": { ar: "يرجى تعبئة العنوان", en: "Please fill address details" },
    "cart.order_success": { ar: "تم استلام طلبك بنجاح!", en: "Order received successfully!" },

    // Admin
    "admin.products": { ar: "المنتجات", en: "Products" },
    "admin.categories": { ar: "التصنيفات", en: "Categories" },
    "admin.zones": { ar: "المناطق", en: "Zones" },
    "admin.offers": { ar: "العروض", en: "Offers" },
    "admin.orders": { ar: "الطلبات", en: "Orders" },
    "admin.users": { ar: "المستخدمين", en: "Users" },
    "admin.settings": { ar: "الإعدادات", en: "Settings" },
    "admin.add_new": { ar: "إضافة جديد", en: "Add New" },
    "admin.table.name": { ar: "الاسم", en: "Name" },
    "admin.table.price": { ar: "السعر", en: "Price" },
    "admin.table.active": { ar: "فعال", en: "Active" },
    "admin.table.actions": { ar: "إجراءات", en: "Actions" },
    "admin.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },

    // Admin Stats
    "admin.stats.sales": { ar: "إجمالي المبيعات", en: "Total Sales" },
    "admin.stats.orders": { ar: "إجمالي الطلبات", en: "Total Orders" },
    "admin.stats.active_orders": { ar: "الطلبات النشطة", en: "Active Orders" },
    "admin.stats.customers": { ar: "العملاء", en: "Customers" },
    "admin.overview": { ar: "نظرة عامة", en: "Overview" },
    "admin.recent_orders": { ar: "أحدث الطلبات", en: "Recent Orders" },
    "admin.view_all": { ar: "عرض الكل", en: "View All" },

    // Admin Table Headers
    "admin.table.order_no": { ar: "رقم الطلب", en: "Order #" },
    "admin.table.customer": { ar: "العميل", en: "Customer" },
    "admin.table.status": { ar: "الحالة", en: "Status" },
    "admin.table.total": { ar: "المجموع", en: "Total" },
    "admin.table.date": { ar: "التاريخ", en: "Date" },

    // Statuses
    "status.pending": { ar: "قيد الانتظار", en: "Pending" },
    "status.preparing": { ar: "جاري التحضير", en: "Preparing" },
    "status.accepted": { ar: "تم القبول", en: "Accepted" },
    "status.out_for_delivery": { ar: "في الطريق", en: "Out for Delivery" },
    "status.delivered": { ar: "تم التوصيل", en: "Delivered" },
    "status.rejected": { ar: "مرفوض", en: "Rejected" },

    // Cart (New keys)
    "cart.items_count": { ar: "لديك {{count}} منتجات في السلة", en: "You have {{count}} items in cart" },
    "cart.address_error": { ar: "يرجى تعبئة جميع تفاصيل العنوان", en: "Please fill in all address details" },
    "cart.order_fail_internet": { ar: "فشل إنشاء الطلب. تأكد من الاتصال بالإنترنت.", en: "Failed to create order. Please check your internet connection." },
    "cart.browse_products": { ar: "تصفح المنتجات", en: "Browse Products" },
    "common.no_image": { ar: "لا صورة", en: "No Image" },

    // Accounting
    "admin.accounting.title": { ar: "الملخص المالي (آخر 100 طلب)", en: "Financial Summary (Last 100 Orders)" },
    "admin.accounting.total_delivered_sales": { ar: "إجمالي المبيعات (المسلمة)", en: "Total Sales (Delivered)" },
    "admin.accounting.completed_orders_count": { ar: "عدد الطلبات المكتملة", en: "Completed Orders Count" },
    "admin.accounting.all_orders_count": { ar: "إجمالي الطلبات (الكل)", en: "Total Orders (All)" },
    "admin.accounting.export_csv": { ar: "تصدير CSV", en: "Export CSV" },

    // Order Tracking (Client Side)
    "order.details_title": { ar: "تفاصيل الطلب", en: "Order Details" },
    "order.track_title": { ar: "متابعة الطلب", en: "Track Order" },
    "order.status_step_1": { ar: "تم الاستلام", en: "Received" },
    "order.status_step_2": { ar: "تم التأكيد", en: "Confirmed" },
    "order.status_step_3": { ar: "جاري التحضير", en: "Preparing" },
    "order.status_step_4": { ar: "في الطريق", en: "On the Way" },
    "order.status_step_5": { ar: "تم التوصيل", en: "Delivered" },
    "order.track_order": { ar: "تتبع الطلب", en: "Track Order" },
    "order.order_id": { ar: "رقم الطلب", en: "Order ID" },
    "order.placed_on": { ar: "تم الطلب في", en: "Placed on" },
    "order.items_summary": { ar: "ملخص المنتجات", en: "Items Summary" },
    "order.payment_method": { ar: "طريقة الدفع", en: "Payment Method" },
    "order.shipping_address": { ar: "عنوان التوصيل", en: "Shipping Address" },
    "order.need_help": { ar: "هل تحتاج مساعدة؟", en: "Need Help?" },
    "order.contact_support": { ar: "تواصل مع الدعم", en: "Contact Support" },
    "order.empty_history": { ar: "لا توجد طلبات سابقة", en: "No previous orders" },
    "order.shop_now": { ar: "تسوق الآن", en: "Shop Now" },

    // Register
    "register.title": { ar: "إنشاء حساب جديد", en: "Create New Account" },
    "register.subtitle": { ar: "سجل معنا لتتمتع بأفضل المنتجات الطازجة", en: "Register with us to enjoy the best fresh products" },
    "register.submit": { ar: "إنشاء الحساب", en: "Create Account" },
    "register.phone_placeholder": { ar: "رقم الهاتف (07xxxxxxxxx)", en: "Phone Number (07xxxxxxxxx)" },
    "register.password_placeholder": { ar: "كلمة المرور (6 خانات على الأقل)", en: "Password (at least 6 chars)" },
    "register.full_name": { ar: "الاسم الكامل", en: "Full Name" },

    // Cashier Receipt & Modals
    "cashier.reject_modal_title": { ar: "رفض الطلب", en: "Reject Order" },
    "cashier.reject_reason_placeholder": { ar: "اذكر سبب الرفض...", en: "Reason for rejection..." },
    "cashier.confirm_reject": { ar: "تأكيد الرفض", en: "Confirm Rejection" },
    "cashier.receipt.title": { ar: "فاتورة طلب", en: "Order Receipt" },
    "cashier.receipt.customer_info": { ar: "بيانات العميل", en: "Customer Info" },
    "cashier.receipt.product": { ar: "المنتج", en: "Product" },
    "cashier.receipt.thanks": { ar: "شكراً لتسوقكم معنا!", en: "Thank you for shopping with us!" },
    "cashier.receipt.customer_service": { ar: "خدمة العملاء", en: "Customer Service" },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("ar");

    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = lang;
    };

    // Initialize dir on mount
    useEffect(() => {
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string, params?: Record<string, string | number>) => {
        let text = translations[key]?.[language] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{{${k}}}`, String(v));
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir: language === "ar" ? "rtl" : "ltr" }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
