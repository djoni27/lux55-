import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const { createApp } = (window as any).Vue;

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const TRANSLATIONS: any = {
    ar: {
        loading: "جاري تجهيز متجرك...",
        adminTitle: "استوديو التحكم البلاتيني",
        saveBtn: "حفظ ونشر",
        languageSelect: "لغة المتجر",
        storeNameLabel: "اسم المتجر",
        phoneLabel: "رقم الواتساب",
        heroTitleLabel: "عنوان الهيرو",
        logoLabel: "الشعار",
        uploadLogo: "رفع شعار",
        fontSize: "حجم الخط",
        bgLabel: "الخلفية",
        uploadBg: "رفع خلفية",
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
        descPlaceholder: "الوصف",
        uploadProductImg: "صورة المنتج",
        addToList: "نشر المنتج",
        saveEdit: "حفظ التعديلات",
        searchPlaceholder: "ابحث عن منتج...",
        aiTitle: "المساعد الذكي",
        aiThinking: "المساعد يفكر بعمق...",
        aiPlaceholder: "اسأل المساعد عن المنتجات...",
        aiDefault: "مرحباً! أنا مساعدك الذكي، كيف يمكنني مساعدتك في اختيار المنتج المثالي؟"
    },
    en: {
        loading: "Loading your store...",
        adminTitle: "Pro Control Studio",
        saveBtn: "Save & Publish",
        languageSelect: "Store Language",
        storeNameLabel: "Store Name",
        phoneLabel: "WhatsApp Number",
        heroTitleLabel: "Hero Title",
        logoLabel: "Logo",
        uploadLogo: "Upload Logo",
        fontSize: "Font Size",
        bgLabel: "Background",
        uploadBg: "Upload Background",
        all: "All",
        currency: "DA",
        cartTitle: "Cart",
        emptyCart: "Cart is empty",
        total: "Total",
        checkoutBtn: "Order via WhatsApp",
        addToCart: "Add to Cart",
        shareProduct: "Share",
        prodDescDefault: "Premium quality product.",
        addProduct: "Add Product",
        editProduct: "Edit Product",
        prodNamePlaceholder: "Product Name",
        pricePlaceholder: "Price",
        catPlaceholder: "Category",
        descPlaceholder: "Description",
        uploadProductImg: "Product Image",
        addToList: "Publish Product",
        saveEdit: "Save Changes",
        searchPlaceholder: "Search for a product...",
        aiTitle: "AI Assistant",
        aiThinking: "AI is thinking...",
        aiPlaceholder: "Ask the assistant about products...",
        aiDefault: "Hello! I'm your AI assistant. How can I help you choose the perfect product?"
    },
    fr: {
        loading: "Chargement de votre magasin...",
        adminTitle: "Studio de Contrôle Pro",
        saveBtn: "Enregistrer et Publier",
        languageSelect: "Langue du Magasin",
        storeNameLabel: "Nom du Magasin",
        phoneLabel: "Numéro WhatsApp",
        heroTitleLabel: "Titre Principal",
        logoLabel: "Logo",
        uploadLogo: "Télécharger le Logo",
        fontSize: "Taille de Police",
        bgLabel: "Arrière-plan",
        uploadBg: "Télécharger l'Arrière-plan",
        all: "Tout",
        currency: "DA",
        cartTitle: "Panier",
        emptyCart: "Le panier est vide",
        total: "Total",
        checkoutBtn: "Commander via WhatsApp",
        addToCart: "Ajouter au Panier",
        shareProduct: "Partager",
        prodDescDefault: "Produit de qualité premium.",
        addProduct: "Ajouter un Produit",
        editProduct: "Modifier le Produit",
        prodNamePlaceholder: "Nom du Produit",
        pricePlaceholder: "Prix",
        catPlaceholder: "Catégorie",
        descPlaceholder: "Description",
        uploadProductImg: "Image du Produit",
        addToList: "Publier le Produit",
        saveEdit: "Enregistrer les Modifications",
        searchPlaceholder: "Rechercher un produit...",
        aiTitle: "Assistant IA",
        aiThinking: "L'IA réfléchit...",
        aiPlaceholder: "Demandez à l'assistant à propos des produits...",
        aiDefault: "Bonjour! Je suis votre assistant IA. Comment puis-je vous aider à choisir le produit parfait?"
    }
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
            settings: {
                storeName: "Platinum Store",
                heroTitle: "Premium Quality & Modern Elegance",
                phone: "213",
                bgColor: "#0f172a",
                bgImage: "",
                logo: "",
                cardMode: "3d",
                heroColor: "#ffffff",
                heroFont: "'Tajawal', sans-serif",
                heroSize: "3"
            },
            products: [],
            productForm: { name: '', price: '', category: '', image: '', description: '' },
            isEditing: false,
            editingIndex: -1,
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
                { id: 'luxury', name: 'Luxury', icon: 'fa-solid fa-crown', color: '#d4af37' },
                { id: 'comic', name: 'Comic', icon: 'fa-solid fa-comment-dots', color: '#000' },
                { id: 'gradient', name: 'Gradient', icon: 'fa-solid fa-palette', color: '#ff00cc' },
                { id: 'clay', name: 'Clay', icon: 'fa-solid fa-cloud', color: '#94a3b8' },
                { id: 'cyber', name: 'Cyber', icon: 'fa-solid fa-robot', color: '#fcee0a' },
                { id: 'nature', name: 'Nature', icon: 'fa-solid fa-leaf', color: '#16a34a' }
            ]
        }
    },
    computed: {
        t() { return TRANSLATIONS[this.currentLang] || TRANSLATIONS.ar; },
        categories() { return [...new Set(this.products.map((p: any) => p.category))]; },
        filteredProducts() {
            let result = this.products;
            if (this.filter !== 'all') result = result.filter((p: any) => p.category === this.filter);
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter((p: any) => p.name.toLowerCase().includes(q));
            }
            return result;
        },
        cartTotal() { return this.cart.reduce((s: number, i: any) => s + Number(i.price), 0); },
        bodyStyle() {
            let style: any = { backgroundColor: this.settings.bgColor };
            if (this.settings.bgImage) {
                style.backgroundImage = `url('${this.settings.bgImage}')`;
            }
            return style;
        },
        heroTextStyle() {
            return {
                color: this.settings.heroColor,
                fontFamily: this.settings.heroFont,
                fontSize: this.settings.heroSize + 'rem',
                fontWeight: '900'
            }
        },
        textColor() {
            const mode = this.settings.cardMode;
            if (['neon', 'glass', 'luxury'].includes(mode) || this.settings.bgImage) return 'white';
            return '#0f172a';
        },
        textColorClass() {
            return ['neon', 'luxury', 'glass'].includes(this.settings.cardMode) ? 'text-inherit' : 'text-slate-900';
        }
    },
    methods: {
        async loadData() {
            try {
                const { data: settingsData } = await supabase
                    .from('store_settings')
                    .select('*')
                    .maybeSingle();

                if (settingsData) {
                    this.settings = {
                        storeName: settingsData.store_name,
                        heroTitle: settingsData.hero_title,
                        phone: settingsData.phone,
                        bgColor: settingsData.bg_color,
                        bgImage: settingsData.bg_image,
                        logo: settingsData.logo,
                        cardMode: settingsData.card_mode,
                        heroColor: settingsData.hero_color,
                        heroFont: settingsData.hero_font,
                        heroSize: settingsData.hero_size
                    };
                }

                const { data: productsData } = await supabase
                    .from('products')
                    .select('*')
                    .order('sort_order', { ascending: false });

                if (productsData) {
                    this.products = productsData;
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        },
        async handleUpload(event: any, type: string) {
            const file = event.target.files[0];
            if (!file) return;
            try {
                const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800 };
                const compressed = await (window as any).imageCompression(file, options);
                const reader = new FileReader();
                reader.readAsDataURL(compressed);
                reader.onload = () => {
                    if (type === 'logo') this.settings.logo = reader.result as string;
                    else if (type === 'bg') this.settings.bgImage = reader.result as string;
                    else if (type === 'product') this.productForm.image = reader.result as string;
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
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
                const ai = new GoogleGenAI({ apiKey });
                const prompt = `أنت مساعد ذكي لمتجر إلكتروني يسمى ${this.settings.storeName}.
                إليك قائمة المنتجات المتاحة: ${JSON.stringify(this.products)}.
                أجب على استفسار العميل التالي بذكاء وساعده في اختيار ما يناسبه: ${userQuery}.
                تأكد من ذكر الأسعار والمميزات المذكورة في الوصف.`;

                const result = await ai.models.generateContent({
                    model: 'gemini-2.0-flash-thinking-exp-1219',
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
        async saveToCloud() {
            this.saving = true;
            try {
                const { data: existingSettings } = await supabase
                    .from('store_settings')
                    .select('id')
                    .maybeSingle();

                const settingsPayload = {
                    store_name: this.settings.storeName,
                    hero_title: this.settings.heroTitle,
                    phone: this.settings.phone,
                    bg_color: this.settings.bgColor,
                    bg_image: this.settings.bgImage,
                    logo: this.settings.logo,
                    card_mode: this.settings.cardMode,
                    hero_color: this.settings.heroColor,
                    hero_font: this.settings.heroFont,
                    hero_size: this.settings.heroSize
                };

                if (existingSettings) {
                    await supabase
                        .from('store_settings')
                        .update(settingsPayload)
                        .eq('id', existingSettings.id);
                } else {
                    await supabase
                        .from('store_settings')
                        .insert([settingsPayload]);
                }

                (window as any).Swal.fire({ icon: 'success', title: 'تم الحفظ!', timer: 1500, showConfirmButton: false });
            } catch (error) {
                console.error('Save error:', error);
                (window as any).Swal.fire({ icon: 'error', title: 'خطأ في الحفظ', timer: 1500 });
            } finally {
                this.saving = false;
            }
        },
        async saveProduct() {
            if (!this.productForm.name || !this.productForm.image) return;

            try {
                const productPayload = {
                    name: this.productForm.name,
                    price: Number(this.productForm.price),
                    category: this.productForm.category,
                    description: this.productForm.description,
                    image: this.productForm.image,
                    sort_order: Date.now()
                };

                if (this.isEditing && this.products[this.editingIndex]) {
                    const productId = this.products[this.editingIndex].id;
                    await supabase
                        .from('products')
                        .update(productPayload)
                        .eq('id', productId);

                    this.products[this.editingIndex] = { ...productPayload, id: productId };
                } else {
                    const { data } = await supabase
                        .from('products')
                        .insert([productPayload])
                        .select()
                        .single();

                    if (data) {
                        this.products.unshift(data);
                    }
                }

                this.cancelEdit();
                (window as any).Swal.fire({ icon: 'success', title: 'تم الحفظ!', timer: 1000, showConfirmButton: false });
            } catch (error) {
                console.error('Product save error:', error);
                (window as any).Swal.fire({ icon: 'error', title: 'خطأ في الحفظ', timer: 1500 });
            }
        },
        editProduct(i: number) {
            this.productForm = { ...this.products[i] };
            this.isEditing = true;
            this.editingIndex = i;
        },
        async deleteProduct(productId: string) {
            try {
                const result = await (window as any).Swal.fire({
                    title: 'هل أنت متأكد؟',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'نعم، احذف',
                    cancelButtonText: 'إلغاء'
                });

                if (result.isConfirmed) {
                    await supabase
                        .from('products')
                        .delete()
                        .eq('id', productId);

                    this.products = this.products.filter((p: any) => p.id !== productId);
                    (window as any).Swal.fire({ icon: 'success', title: 'تم الحذف!', timer: 1000, showConfirmButton: false });
                }
            } catch (error) {
                console.error('Delete error:', error);
                (window as any).Swal.fire({ icon: 'error', title: 'خطأ في الحذف', timer: 1500 });
            }
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
            let msg = `🛍️ طلب جديد من متجر ${this.settings.storeName}:\n\n`;
            this.cart.forEach((p: any) => msg += `• ${p.name} (${p.price} ${this.t.currency})\n`);
            msg += `\n💰 الإجمالي: ${this.cartTotal} ${this.t.currency}`;
            window.open(`https://wa.me/${this.settings.phone}?text=${encodeURIComponent(msg)}`, '_blank');
        },
        nativeShare(p: any) {
            if (navigator.share) {
                navigator.share({ title: p.name, text: p.description, url: window.location.href });
            }
        }
    },
    async mounted() {
        await this.loadData();
        this.aiMessages.push({ role: 'model', content: this.t.aiDefault });
        setTimeout(() => this.loading = false, 1000);
    }
});

app.mount('#app');
