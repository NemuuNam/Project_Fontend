import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, ShoppingCart, X, SlidersHorizontal, PackageX, Check,
    Star, MessageCircle, Info, Heart, Activity, Sparkles, Loader2, Filter
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';

import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const CustomerProducts = ({ userData }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get('search') || '';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistedIds, setWishlistedIds] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('detail');
    const [reviews, setReviews] = useState([]);

    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [selectedCats, setSelectedCats] = useState([]);
    const [priceRange, setPriceRange] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, wishRes] = await Promise.allSettled([
                axiosInstance.get(API_ENDPOINTS.PRODUCTS),
                axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/categories`),
                userData ? axiosInstance.get('/api/wishlist') : Promise.resolve({ success: true, data: [] })
            ]);

            if (prodRes.status === 'fulfilled' && prodRes.value.success) setProducts(prodRes.value.data || []);
            if (catRes.status === 'fulfilled' && catRes.value.success) {
                setCategories(catRes.value.data?.categories || catRes.value.data || []);
            }
            if (wishRes.status === 'fulfilled' && wishRes.value.success) {
                setWishlistedIds((wishRes.value.data || []).map(w => w.product_id));
            }
        } catch (err) { toast.error("โหลดข้อมูลล้มเหลว"); } 
        finally { setLoading(false); }
    }, [userData]);

    useEffect(() => {
        fetchData();
        updateCartCount();
    }, [fetchData]);

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    const toggleWishlist = async (e, productId) => {
        e.stopPropagation();
        if (!userData) return toast.error("กรุณาเข้าสู่ระบบก่อนครับ");
        try {
            const isExist = wishlistedIds.includes(productId);
            const res = await axiosInstance.post('/api/wishlist/toggle', { product_id: productId });
            if (res.success) {
                setWishlistedIds(prev => isExist ? prev.filter(id => id !== productId) : [...prev, productId]);
                toast.success(isExist ? "ลบจากรายการโปรด" : "เพิ่มในรายการโปรดแล้ว");
            }
        } catch (err) { toast.error("ดำเนินการไม่สำเร็จ"); }
    };

    const openProductDetail = (product) => {
        setSelectedProduct(product);
        setActiveTab('detail');
        setIsDetailModalOpen(true);
        axiosInstance.get(`/api/reviews/${product.product_id}`).then(res => {
            if (res.success) setReviews(res.data);
        }).catch(() => setReviews([]));
    };

    const addToCart = (product) => {
        if (product.stock_quantity <= 0) return toast.error("สินค้าหมดชั่วคราว");
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.product_id === product.product_id);
        if (existing) existing.quantity += 1;
        else cart.push({ product_id: product.product_id, product_name: product.product_name, price: product.unit_price, image_url: product.images?.[0]?.image_url, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        window.dispatchEvent(new Event('storage'));
        toast.success(`เพิ่มลงตะกร้าแล้ว ✨`);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCats.length === 0 || selectedCats.includes(Number(p.category_id));
        const matchesPrice = priceRange.length === 0 || priceRange.some(range => {
            const price = Number(p.unit_price);
            if (range === '0-100') return price <= 100;
            if (range === '101-200') return price > 100 && price <= 200;
            if (range === '201-500') return price > 200 && price <= 500;
            if (range === '501+') return price > 500;
            return true;
        });
        return matchesSearch && matchesCat && matchesPrice;
    });

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-black" size={48} /></div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] relative selection:bg-slate-200 overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- Hero Section --- */}
            <section className="relative pt-24 pb-6 bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-medium text-black mb-6 tracking-tighter uppercase  leading-none">
                        Products
                    </h1>
                    {/* 🚀 Search Bar: Borderless, Shadow */}
                    <div className="max-w-xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาเมนูที่คุณต้องการ..."
                            className="w-full pl-14 pr-8 py-4 bg-white rounded-full text-lg outline-none shadow-md focus:shadow-lg transition-all"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setSearchParams({ search: e.target.value }); }}
                        />
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-6 md:px-10 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- Sidebar Filter: Borderless, Shadow --- */}
                    <aside className="w-full lg:w-64 shrink-0 hidden lg:block">
                        <div className="sticky top-32 bg-white p-6 rounded-[2.5rem] shadow-md text-left">
                            <div className="flex items-center gap-3 mb-6">
                                <Filter size={20} className="text-black" />
                                <h2 className="font-medium text-xl uppercase italic">Filters</h2>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 mb-4 pb-2">Category</h3>
                                    <div className="space-y-3">
                                        {categories.map(cat => (
                                            <label key={cat.category_id} className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" className="h-5 w-5 appearance-none rounded border-2 border-slate-200 checked:bg-black checked:border-black transition-all cursor-pointer outline-none" 
                                                    checked={selectedCats.includes(Number(cat.category_id))} 
                                                    onChange={(e) => {
                                                        const id = Number(cat.category_id);
                                                        setSelectedCats(e.target.checked ? [...selectedCats, id] : selectedCats.filter(c => c !== id));
                                                    }} 
                                                />
                                                <span className="text-base font-medium text-[#111827] group-hover:translate-x-1 transition-transform">{cat.category_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* --- Product Grid --- */}
                    <div className="flex-1">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    // 🚀 Product Card: Borderless, Shadow-sm -> hover:Shadow-xl
                                    <div key={product.product_id} className="group bg-white rounded-[3rem] p-5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                                        {/* 🚀 Wishlist Button: Borderless, Shadow */}
                                        <button onClick={(e) => toggleWishlist(e, product.product_id)} className="absolute top-6 right-6 z-20 w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center hover:scale-110 transition-all">
                                            <Heart size={20} className={wishlistedIds.includes(product.product_id) ? 'fill-red-500 text-red-500' : 'text-black'} />
                                        </button>

                                        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] mb-4 bg-[#FDFCFB] cursor-pointer" onClick={() => openProductDetail(product)}>
                                            <img src={product.images?.[0]?.image_url || '/placeholder.png'} alt="" className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${product.stock_quantity <= 0 ? 'grayscale opacity-50' : ''}`} />
                                            {product.stock_quantity <= 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                                                    <span className="bg-white text-black px-4 py-1.5 rounded-full font-medium text-xs uppercase tracking-widest shadow-xl">Out of Stock</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col flex-grow text-left">
                                            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1 italic">{product.category?.category_name}</span>
                                            <h3 className="text-2xl font-medium text-black leading-tight mb-2 uppercase tracking-tighter italic line-clamp-2">{product.product_name}</h3>
                                            
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className={`w-2 h-2 rounded-full ${product.stock_quantity <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                                <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
                                                    Stock: {product.stock_quantity > 0 ? product.stock_quantity : 'Empty'}
                                                </span>
                                            </div>

                                            {/* 🚀 Footer: No Border Top */}
                                            <div className="mt-auto flex justify-between items-center pt-4">
                                                <div className="flex flex-col leading-none">
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Price</p>
                                                    <span className="text-3xl font-medium text-black tracking-tighter italic">฿{Number(product.unit_price).toLocaleString()}</span>
                                                </div>
                                                {/* 🚀 Add Cart Button: Borderless, Shadow */}
                                                <button onClick={() => addToCart(product)} disabled={product.stock_quantity <= 0} className="w-12 h-12 bg-white rounded-[1.25rem] flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-all active:scale-90 disabled:opacity-30">
                                                    <ShoppingCart size={22} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // 🚀 Empty State: Borderless, Shadow
                            <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm">
                                <PackageX size={64} className="text-slate-200 mx-auto mb-4" />
                                <h3 className="text-xl font-medium uppercase italic text-slate-300 tracking-widest">No Products Found</h3>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- Detail Modal --- */}
            {isDetailModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-md animate-in fade-in" onClick={() => setIsDetailModalOpen(false)}></div>
                    {/* 🚀 Modal Container: Borderless, Shadow-2xl */}
                    <div className="relative bg-white w-full max-w-6xl h-[85vh] overflow-hidden rounded-[3.5rem] shadow-2xl flex flex-col lg:flex-row animate-in zoom-in-95">
                        
                        <div className="lg:w-1/2 h-1/2 lg:h-full bg-slate-50 shrink-0">
                            <img src={selectedProduct.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
                        </div>

                        <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-white overflow-hidden text-left p-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-2">
                                    <span className="px-3 py-1 bg-black text-white rounded-lg text-[10px] font-medium uppercase tracking-widest italic">{selectedProduct.category?.category_name}</span>
                                    <h2 className="text-4xl lg:text-6xl font-medium text-black tracking-tighter uppercase italic leading-tight">{selectedProduct.product_name}</h2>
                                    <div className="flex items-center gap-3">
                                        <Activity size={16} className="text-emerald-500" />
                                        <span className="text-sm font-medium uppercase text-slate-400 italic">{selectedProduct.stock_quantity} available in stock</span>
                                    </div>
                                </div>
                                {/* 🚀 Close Button: Borderless, Shadow */}
                                <button onClick={() => setIsDetailModalOpen(false)} className="p-3 bg-white rounded-full text-black hover:bg-slate-50 transition-all shadow-md"><X size={24} strokeWidth={3} /></button>
                            </div>

                            {/* 🚀 Tabs: No Border Bottom */}
                            <div className="flex gap-10 mb-6">
                                {['detail', 'reviews'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-medium uppercase tracking-widest relative italic transition-all ${activeTab === tab ? 'text-black' : 'text-slate-300'}`}>
                                        {tab === 'detail' ? 'Information' : `Product Reviews (${reviews.length})`}
                                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black rounded-full"></div>}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 mb-8">
                                {activeTab === 'detail' ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Info size={18} />
                                            <p className="text-[10px] font-medium uppercase tracking-widest italic leading-none">Product Description</p>
                                        </div>
                                        <p className="text-xl font-medium text-slate-600 leading-relaxed italic">{selectedProduct.description || "โฮมเมดคุกกี้สูตรพิเศษ คัดสรรวัตถุดิบคุณภาพดีที่สุดเพื่อคุณ"}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.length > 0 ? reviews.map((rev, idx) => (
                                            // 🚀 Review Card: Borderless, Shadow
                                            <div key={idx} className="p-6 bg-[#FDFCFB] rounded-[2rem] shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {[...Array(rev.rating_score)].map((_, i) => <Star key={i} size={14} className="fill-[#FACC15] text-[#EAB308]" />)}
                                                </div>
                                                <p className="text-black text-lg italic font-medium leading-relaxed">"{rev.comment}"</p>
                                                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">- Verified Customer</p>
                                            </div>
                                        )) : <p className="text-center text-slate-300 italic py-10 uppercase text-xs tracking-[0.3em]">No reviews for this product yet</p>}
                                    </div>
                                )}
                            </div>

                            {/* 🚀 Footer: No Border Top */}
                            <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-8 pt-8">
                                <div className="text-left w-full sm:w-auto">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Unit Price</p>
                                    <span className="text-4xl md:text-5xl font-medium text-black tracking-tighter italic">฿{Number(selectedProduct.unit_price).toLocaleString()}</span>
                                </div>
                                {/* 🚀 Add to Cart (Modal): Borderless, Strong Shadow */}
                                <button onClick={() => { addToCart(selectedProduct); setIsDetailModalOpen(false); }} disabled={selectedProduct.stock_quantity <= 0} className="w-full sm:flex-1 bg-white text-black py-5 rounded-full font-medium text-xl uppercase shadow-lg hover:bg-black hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95 italic">
                                    <ShoppingCart size={24} strokeWidth={2.5} /> ADD TO BASKET
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer userData={userData} />
        </div>
    );
};

export default CustomerProducts;