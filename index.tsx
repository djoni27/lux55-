
import { GoogleGenAI } from "@google/genai";

// @ts-ignore
const { createApp } = (window as any).Vue;

const TRANSLATIONS: any = {
    ar: {
        loading: "جاري تجهيز متجرك...",
        adminTitle: "استوديو التحكم البلاتيني",
        saveBtn: "حفظ ونشر",
        basicSettings: "الهوية",
        designSettings: "التصميم",
        manageCats: "الفئات",
        manageProds: "المخزون",
        basicInfo: "بيانات المتجر",
        languageSelect: "اللغة",
        storeNameLabel: "اسم المتجر",
        phoneLabel: "رقم الواتساب",
        heroTitleLabel: "عنوان الهيرو",
        logoLabel: "الشعار",
        uploadLogo: "رفع شعار",
        heroStyle: "تنسيق الهيرو",
        fontSize: "حجم الخط",
        bgLabel: "الخلفية",
        uploadBg: "رفع خلفية",
        modesLabel: "الأنماط",
        all: "الكل",
        currency: "د.ج",
        cartTitle: "الحقيبة",
        emptyCart: "الحقيبة فارغة",
        total: "الإجمالي",
        checkoutBtn: "طلب عبر واتساب",
        addToCart: "إضافة للحقيبة",
        shareProduct: "مشاركة",
        prodDescDefault: "منتج بضمان الجودة البلاتينية.",
        addProduct: "إضافة منتج",
        editProduct: "تعديل منتج",
        prodNamePlaceholder: "اسم المنتج",
        pricePlaceholder: "السعر",
        catPlaceholder: "الفئة",
        uploadProductImg: "صورة المنتج",
        addToList: "نشر المنتج",
        saveEdit: "حفظ التعديلات",
        searchPlaceholder: "ابحث عن منتج...",
        aiThinking: "المساعد يفكر بعمق...",
        aiDefault: "مرحباً! أنا مساعدك الذكي، كيف يمكنني مساعدتك في اختيار المنتج المثالي؟"
    }
};

const DEFAULT_DATA = {
    settings: {
        storeName: "Platinum Store",
        heroTitle: "Experience Excellence in Every Detail",
        phone: "213",
        bgColor: "#0f172a",
        bgImage: "",
        logo: "",
        cardMode: "3d",
        heroColor: "#ffffff",
        heroFont: "'Tajawal', sans-serif",
        heroSize: "3"
    },
    products: [
        { name: "Platinum Timepiece Pro", price: 15500, category: "Luxury", description: "Precision and style combined into one masterpiece.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
        { name: "Urban Tech Sneakers", price: 12000, category: "Fashion", description: "Modern comfort for the urban explorer.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" }
    ]
};

const app = createApp({
    data() {
        return {
            currentLang: 'ar',
            loading: true,
            saving: false,
            showAdmin: false,
            showCart: false,
            showAI: false,
            cart: [],
            filter: 'all',
            searchQuery: '',
            selectedProduct: null,
            activeTab: 'general',
            data: JSON.parse(JSON.stringify(DEFAULT_DATA)),
            productForm: { name: '', price: '', category: '', image: '', description: '' },
            isEditing: false,
            editingIndex: -1,
            // AI Chat Data
            aiInput: '',
            aiLoading: false,
            aiMessages: [],
            adminTabs: [
                { id: 'general', label: 'basicSettings', icon: 'fa-solid fa-id-card' },
                { id: 'design', label: 'designSettings', icon: 'fa-solid fa-palette' },
                { id: 'products', label: 'manageProds', icon: 'fa-solid fa-box-open' }
            ],
            modes: [
                { id: 'minimal', name: 'Minimal', icon: 'fa-regular fa-square', color: '#64748b' },
                { id: '3d', name: '3D Pop', icon: 'fa-solid fa-cube', color: '#3b82f6' },
                { id: 'neon', name: 'Neon', icon: 'fa-solid fa-bolt', color: '#a855f7' },
                { id: 'glass', name: 'Glass', icon: 'fa-solid fa-wine-glass', color: '#0ea5e9' },
                { id: 'luxury', name: 'Luxury', icon: 'fa-solid fa-crown', color: '#d4af37' }
            ]
        }
    },
    computed: {
        t() { return TRANSLATIONS[this.currentLang] || TRANSLATIONS.ar; },
        categories() { return [...new Set(this.data.products.map((p: any) => p.category))]; },
        filteredProducts() {
            let result = this.data.products;
            if (this.filter !== 'all') result = result.filter((p: any) => p.category === this.filter);
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter((p: any) => p.name.toLowerCase().includes(q));
            }
            return result;
        },
        cartTotal() { return this.cart.reduce((s: number, i: any) => s + Number(i.price), 0); },
        bodyStyle() {
            let style: any = { backgroundColor: this.data.settings.bgColor };
            if (this.data.settings.bgImage) {
                style.backgroundImage = `url('${this.data.settings.bgImage}')`;
            }
            return style;
        },
        heroTextStyle() {
            return {
                color: this.data.settings.heroColor,
                fontFamily: this.data.settings.heroFont,
                fontSize: this.data.settings.heroSize + 'rem',
                fontWeight: '900'
            }
        },
        textColor() {
            const mode = this.data.settings.cardMode;
            if (['neon', 'glass', 'luxury'].includes(mode) || this.data.settings.bgImage) return 'white';
            return '#0f172a';
        },
        textColorClass() {
            return ['neon', 'luxury', 'glass'].includes(this.data.settings.cardMode) ? 'text-inherit' : 'text-slate-900';
        }
    },
    methods: {
        async handleUpload(event: any, type: string) {
            const file = event.target.files[0];
            if (!file) return;
            try {
                // @ts-ignore
                const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800 };
                const compressed = await (window as any).imageCompression(file, options);
                const reader = new FileReader();
                reader.readAsDataURL(compressed);
                reader.onload = () => {
                    if (type === 'logo') this.data.settings.logo = reader.result;
                    else if (type === 'bg') this.data.settings.bgImage = reader.result;
                    else if (type === 'product') this.productForm.image = reader.result;
                };
            } catch (e) { console.error(e); }
        },
        async askAI() {
            if (!this.aiInput.trim() || this.aiLoading) return;
            
            const userQuery = this.aiInput;
            this.aiInput = '';
            this.aiMessages.push({ role: 'user', content: userQuery });
            
            const thinkingMsgIndex = this.aiMessages.length;
            this.aiMessages.push({ role: 'model', content: '', thinking: true });
            this.aiLoading = true;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `أنت مساعد ذكي لمتجر إلكتروني يسمى ${this.data.settings.storeName}. 
                إليك قائمة المنتجات المتاحة: ${JSON.stringify(this.data.products)}. 
                أجب على استفسار العميل التالي بذكاء وساعده في اختيار ما يناسبه: ${userQuery}. 
                تأكد من ذكر الأسعار والمميزات المذكورة في الوصف.`;

                const result = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: prompt,
                    config: {
                        thinkingConfig: { thinkingBudget: 32768 }
                    }
                });

                this.aiMessages[thinkingMsgIndex].content = result.text;
                this.aiMessages[thinkingMsgIndex].thinking = false;
            } catch (error) {
                console.error("AI Error:", error);
                this.aiMessages[thinkingMsgIndex].content = "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة لاحقاً.";
                this.aiMessages[thinkingMsgIndex].thinking = false;
            } finally {
                this.aiLoading = false;
                this.$nextTick(() => {
                    const chat = document.getElementById('ai-chat');
                    if (chat) chat.scrollTop = chat.scrollHeight;
                });
            }
        },
        saveToCloud() {
            this.saving = true;
            localStorage.setItem('platinumStore_Data_Android', JSON.stringify(this.data));
            setTimeout(() => {
                this.saving = false;
                (window as any).Swal.fire({ icon: 'success', title: 'تم الحفظ!', timer: 1500, showConfirmButton: false });
            }, 800);
        },
        saveProduct() {
            if (!this.productForm.name || !this.productForm.image) return;
            if (this.isEditing) {
                this.data.products[this.editingIndex] = { ...this.productForm };
            } else {
                this.data.products.unshift({ ...this.productForm });
            }
            this.cancelEdit();
        },
        editProduct(i: number) {
            this.productForm = { ...this.data.products[i] };
            this.isEditing = true;
            this.editingIndex = i;
        },
        deleteProduct(i: number) {
            (window as any).Swal.fire({
                title: 'هل أنت متأكد؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء'
            }).then((r: any) => {
                if (r.isConfirmed) this.data.products.splice(i, 1);
            });
        },
        cancelEdit() {
            this.isEditing = false;
            this.productForm = { name: '', price: '', category: '', image: '', description: '' };
        },
        addToCart(p: any) {
            this.cart.push({ ...p });
            (window as any).Swal.fire({ icon: 'success', title: 'أضيف للحقيبة', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
        },
        toggleAdmin() {
            (window as any).Swal.fire({ title: 'رمز الدخول', input: 'password', showCancelButton: true }).then((r: any) => {
                if (r.value === '1234') this.showAdmin = true;
            });
        },
        checkout() {
            let msg = `🛍️ طلب جديد من متجر ${this.data.settings.storeName}:\n\n`;
            this.cart.forEach((p: any) => msg += `• ${p.name} (${p.price} ${this.t.currency})\n`);
            msg += `\n💰 الإجمالي: ${this.cartTotal} ${this.t.currency}`;
            window.open(`https://wa.me/${this.data.settings.phone}?text=${encodeURIComponent(msg)}`, '_blank');
        },
        nativeShare(p: any) {
            if (navigator.share) {
                navigator.share({ title: p.name, text: p.description, url: window.location.href });
            }
        }
    },
    mounted() {
        const saved = localStorage.getItem('platinumStore_Data_Android');
        if (saved) this.data = JSON.parse(saved);
        this.aiMessages.push({ role: 'model', content: this.t.aiDefault });
        setTimeout(() => this.loading = false, 1500);
    }
});

app.mount('#app');
