# دليل النشر - Deployment Guide

## النشر على Vercel

1. قم بإنشاء حساب على [Vercel](https://vercel.com)
2. اربط مستودع GitHub الخاص بك
3. أضف متغيرات البيئة:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
4. انقر على Deploy

## النشر على Netlify

1. قم بإنشاء حساب على [Netlify](https://netlify.com)
2. اربط مستودع GitHub
3. أضف إعدادات البناء:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. أضف متغيرات البيئة في Settings
5. انقر على Deploy

## النشر اليدوي

1. قم ببناء المشروع:
```bash
npm run build
```

2. ارفع محتويات مجلد `dist` إلى أي خادم استضافة ويب

3. تأكد من إعداد متغيرات البيئة على الخادم

## ملاحظات مهمة

- تأكد من إضافة جميع متغيرات البيئة قبل النشر
- قاعدة بيانات Supabase جاهزة للاستخدام
- كلمة مرور لوحة التحكم الافتراضية: `1234` (يُنصح بتغييرها)
- للحصول على مفتاح Gemini API، قم بزيارة [Google AI Studio](https://ai.google.dev)

## دعم HTTPS

يُوصى بشدة باستخدام HTTPS لحماية البيانات وتفعيل جميع الميزات بشكل صحيح.
