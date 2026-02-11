# أسر (Asr)

نظام متكامل لطلب الخضار والفواكه، يحتوي على 3 واجهات:
1. **العملاء**: تصفح المنتجات، العروض، وإرسال الطلبات.
2. **الكاشير**: استلام الطلبات في الوقت الفعلي مع تنبيه صوتي.
3. **الإدارة**: إدارة المنتجات، التصنيفات، المناطق، العروض، والمحاسبة.

## التقنيات المستخدمة
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS.
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions).
- **Style**: RTL support, Arabic Cairo Font.

## التثبيت والتشغيل (محلياً)

1. **استنساخ المستودع**:
   ```bash
   git clone https://github.com/USERNAME/asr.git
   cd asr
   ```

2. **تثبيت المكتبات**:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **إعداد Firebase**:
   - قم بإنشاء مشروع جديد في [Firebase Console](https://console.firebase.google.com).
   - قم بتفعيل **Authentication** (Email/Password + Google).
   - قم بتفعيل **Firestore Database** (ابدأ بوضع Test Mode ثم سنقوم بنشر القواعد).
   - قم بتفعيل **Storage**.
   - احصل على إعدادات الويب (API Keys) من Project Settings.

4. **ضبط المتغيرات البيئية**:
   - قم بإنشاء ملف `.env.local` في المجلد الرئيسي وانسخ المتحوى التالي مع تعديل القيم:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   NEXT_PUBLIC_WHATSAPP_NUMBER=9627xxxxxxxx
   NEXT_PUBLIC_ADMIN_BOOTSTRAP_EMAIL=admin@example.com
   ```

5. **تشغيل التطبيق**:
   ```bash
   npm run dev
   ```
   افتح [http://localhost:3000](http://localhost:3000)

## نشر Backend (Cloud Functions & Rules)

يجب تثبيت Firebase CLI وتسجيل الدخول:
```bash
npm install -g firebase-tools
firebase login
firebase init
# اختر Functions و Firestore و Storage واربطهم بالمشروع
```

**لنشر الدوال والقواعد الأمنية**:
```bash
firebase deploy --only functions,firestore,storage
```

**إعداد البريد الإلكتروني (لإشعارات الطلبات)**:
يجب ضبط متغيرات البيئة الخاصة بـ Cloud Functions:
```bash
firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="app-password"
# أو استخدم SendGrid
```
*ملاحظة: الكود الحالي في `functions/src/index.ts` يستخدم env vars. تأكد من ضبطها في `.env` الخاص بالـ functions أو في إعدادات النظام.*

## إعداد المسؤول الأول (Admin)
1. قم بتسجيل حساب جديد في التطبيق باستخدام البريد الإلكتروني المطابق لـ `NEXT_PUBLIC_ADMIN_BOOTSTRAP_EMAIL`.
2. اذهب للرابط `/bootstrap` واضغط على "تفعيل الصلاحيات".
3. سيتم تحويلك للوحة الإدارة `/admin`.

## المجلدات والبنية
- `src/app`: صفحات الموقع.
- `src/lib`: دوال مساعدة وإعدادات Firebase.
- `src/components`: مكونات الواجهة.
- `functions`: كود السيرفر (Back-end logic).

## ملاحظات هامة
- تأكد من استبدال ملف `public/ring.mp3` بملف صوتي حقيقي لتنبيه الكاشير.
- لتشغيل الدوال محلياً، استخدم `firebase emulators:start`.

## الحقوق
تم التطوير بواسطة مساعد الذكاء الاصطناعي.
