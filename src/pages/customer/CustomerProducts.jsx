import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Plus, Filter, Loader2, ShoppingCart, 
    X, SlidersHorizontal, PackageX, Check, Eye, Settings2,
    Star, MessageCircle, Info, Heart, Activity, Leaf, Cookie, Smile, 
    Sparkles 
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
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
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    const isOwner = userData?.role_level === 2;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, wishRes] = await Promise.allSettled([
                axiosInstance.get(API_ENDPOINTS.PRODUCTS),
                axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/categories`), 
                userData ? axiosInstance.get('/api/wishlist') : Promise.resolve({ success: true, data: [] })
            ]);
            
            if (prodRes.status === 'fulfilled' && prodRes.value.success) {
                setProducts(prodRes.value.data || []);
            }

            if (catRes.status === 'fulfilled' && catRes.value.success) {
                const categoryList = catRes.value.data?.categories || catRes.value.data || [];
                setCategories(categoryList);
            }

            if (wishRes.status === 'fulfilled' && wishRes.value.success) {
                const wishData = wishRes.value.data || [];
                setWishlistedIds(wishData.map(w => w.product_id));
            }
        } catch (err) {
            toast.error("โหลดข้อมูลล้มเหลว");
        } finally {
            setLoading(false);
        }
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
        if (!userData) return toast.error("กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด");
        try {
            const isExist = wishlistedIds.includes(productId);
            const res = await axiosInstance.post('/api/wishlist/toggle', { product_id: productId });
            if (res.success) {
                if (isExist) {
                    setWishlistedIds(prev => prev.filter(id => id !== productId));
                    toast.success("ลบออกจากรายการโปรด");
                } else {
                    setWishlistedIds(prev => [...prev, productId]);
                    toast.success("เพิ่มในรายการโปรดแล้ว");
                }
            }
        } catch (err) { toast.error("ไม่สามารถดำเนินการได้"); }
    };

    const openProductDetail = (product) => {
        setSelectedProduct(product);
        setActiveTab('detail');
        setIsDetailModalOpen(true);
        axiosInstance.post(`/api/products/${product.product_id}/view`).catch(() => {});
        axiosInstance.get(`/api/reviews/${product.product_id}`).then(res => {
            if (res.success) setReviews(res.data);
        }).catch(() => setReviews([]));
    };

    const addToCart = (product) => {
        if (isOwner) return toast.error("แอดมินไม่สามารถสั่งซื้อสินค้าได้");
        if (product.stock_quantity <= 0) return toast.error("สินค้าหมดชั่วคราว");
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.product_id === product.product_id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ product_id: product.product_id, product_name: product.product_name, price: product.unit_price, image_url: product.images?.[0]?.image_url, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        window.dispatchEvent(new Event('storage'));
        toast.success(`เพิ่ม ${product.product_name} ลงตะกร้าแล้ว`);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCats.length === 0 || selectedCats.includes(Number(product.category_id));
        const matchesPrice = priceRange.length === 0 || priceRange.some(range => {
            const price = Number(product.unit_price);
            if (range === '0-100') return price <= 100;
            if (range === '101-200') return price > 100 && price <= 200;
            if (range === '201-500') return price > 200 && price <= 500;
            if (range === '501+') return price > 500;
            return true;
        });
        return matchesSearch && matchesCat && matchesPrice;
    });

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] relative selection:bg-[#F3E9DC] overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <Leaf className="absolute top-10 left-[5%] rotate-12" size={180} />
                <Cookie className="absolute bottom-20 right-[5%] -rotate-12" size={150} />
                <Smile className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={300} />
            </div>

            {/* --- 🍃 Hero Section (Balanced Sizes) --- */}
            <section className="relative pt-24 md:pt-32 pb-6 md:pb-8 bg-[#FAFAFA] border-b-2 border-slate-100">
                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md mb-6 animate-bounce-slow">
                        <Sparkles size={12} className="text-white" />
                        <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white">Special Selection</span>
                    </div>
                    {/* ปรับขนาดหัวข้อลงจาก 7xl -> 5xl */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#2D241E] mb-6 md:mb-8 tracking-tighter uppercase italic leading-tight">
                        เมนู <span className="text-[#2D241E] font-light not-italic opacity-40">โฮมเมด</span>
                    </h1>
                    
                    <div className="max-w-xl mx-auto relative group px-4">
                        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-[#2D241E]" size={18} />
                        <input 
                            type="text" 
                            placeholder="ค้นหาความอร่อย..." 
                            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-full text-base md:text-lg outline-none shadow-sm focus:border-[#2D241E] transition-all placeholder:text-[#2D241E]/30" 
                            value={searchTerm} 
                            onChange={(e) => {setSearchTerm(e.target.value); setSearchParams({ search: e.target.value });}} 
                        />
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 md:px-6 lg:px-12 py-8 md:py-12 relative z-10">
                <button 
                    onClick={() => setShowMobileFilter(!showMobileFilter)}
                    className="lg:hidden w-full mb-6 py-4 bg-[#2D241E] text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg text-sm uppercase tracking-widest"
                >
                    <Filter size={18} /> {showMobileFilter ? 'Close Filter' : 'Filter Menu'}
                </button>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
                    
                    {/* --- 🏷️ Sidebar Filter --- */}
                    <aside className={`w-full lg:w-64 shrink-0 ${showMobileFilter ? 'block' : 'hidden lg:block'} animate-in slide-in-from-left-4 duration-300`}>
                        <div className="sticky top-32 bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
                            <div className="flex items-center gap-3 mb-8">
                                <SlidersHorizontal size={18} className="text-[#2D241E]" />
                                <h2 className="font-black text-lg tracking-tight uppercase italic">ตัวกรอง</h2>
                            </div>
                            
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 mb-5 italic border-b border-slate-50 pb-2">หมวดหมู่</h3>
                                    <div className="space-y-3 text-left">
                                        {categories.map(cat => (
                                            <label key={cat.category_id} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input type="checkbox" className="peer h-5 w-5 appearance-none rounded-lg border-2 border-slate-200 checked:bg-[#2D241E] transition-all" checked={selectedCats.includes(Number(cat.category_id))} onChange={(e) => {
                                                        const catId = Number(cat.category_id);
                                                        if (e.target.checked) setSelectedCats([...selectedCats, catId]);
                                                        else setSelectedCats(selectedCats.filter(id => id !== catId));
                                                    }} />
                                                    <Check className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={12} strokeWidth={4} />
                                                </div>
                                                <span className="text-sm md:text-base font-bold text-[#2D241E] group-hover:translate-x-1 transition-transform">{cat.category_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 mb-5 italic border-b border-slate-50 pb-2">ช่วงราคา</h3>
                                    <div className="space-y-3 text-left">
                                        {[{ label: 'ต่ำกว่า 100 ฿', val: '0-100' }, { label: '101 - 200 ฿', val: '101-200' }, { label: '201 - 500 ฿', val: '201-500' }, { label: 'มากกว่า 500 ฿', val: '501+' }].map((range) => (
                                            <label key={range.val} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input type="checkbox" className="peer h-5 w-5 appearance-none rounded-lg border-2 border-slate-200 checked:bg-[#2D241E] transition-all" checked={priceRange.includes(range.val)} onChange={(e) => e.target.checked ? setPriceRange([...priceRange, range.val]) : setPriceRange(priceRange.filter(r => r !== range.val))} />
                                                    <Check className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={12} strokeWidth={4} />
                                                </div>
                                                <span className="text-sm md:text-base font-bold text-[#2D241E] group-hover:translate-x-1 transition-transform">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* --- 🍪 Product Grid (Balanced Card Typography) --- */}
                    <div className="flex-1">
                        <div className="mb-6 flex justify-between items-center px-2">
                            <p className="text-xs md:text-sm font-black text-[#2D241E] uppercase tracking-widest">
                                Results: <span className="text-[#2D241E] underline italic">{filteredProducts.length} items</span>
                            </p>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                                {filteredProducts.map((product) => (
                                    <div key={product.product_id} className="group bg-white rounded-[2.5rem] p-5 md:p-6 border-2 border-slate-50 hover:border-[#2D241E] hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                                        <button onClick={(e) => toggleWishlist(e, product.product_id)} className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-slate-100 flex items-center justify-center hover:scale-110 transition-all active:scale-90">
                                            <Heart size={18} className={`${wishlistedIds.includes(product.product_id) ? 'fill-red-500 text-red-500' : 'text-[#2D241E]'}`} />
                                        </button>

                                        <div className="relative aspect-square overflow-hidden rounded-[1.8rem] mb-6 bg-slate-50 cursor-pointer" onClick={() => openProductDetail(product)}>
                                            <img src={product.images?.[0]?.image_url || '/placeholder.png'} alt="" className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${product.stock_quantity <= 0 ? 'grayscale opacity-40' : ''}`} />
                                            {product.stock_quantity <= 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                                                    <span className="bg-white text-[#2D241E] px-5 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl italic">OUT OF STOCK</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-1 flex flex-col flex-grow text-left">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/50 bg-slate-100 px-2 py-0.5 rounded-lg">
                                                    {product.category?.category_name}
                                                </span>
                                            </div>
                                            {/* ปรับขนาดชื่อสินค้าให้พอดี md:text-xl */}
                                            <h3 className="text-lg md:text-xl font-black text-[#2D241E] leading-tight mb-4 uppercase tracking-tighter italic line-clamp-2">
                                                {product.product_name}
                                            </h3>
                                            
                                            <div className="mt-auto flex justify-between items-center pt-5 border-t-2 border-slate-50">
                                                <div className="flex flex-col">
                                                    <p className="text-[9px] font-black text-[#2D241E]/40 uppercase tracking-widest mb-1">Unit Price</p>
                                                    <span className="text-xl md:text-2xl font-black text-[#2D241E] tracking-tighter italic">฿{Number(product.unit_price).toLocaleString()}</span>
                                                </div>
                                                <button onClick={() => addToCart(product)} disabled={product.stock_quantity <= 0} className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg border-2 ${product.stock_quantity > 0 ? 'bg-[#2D241E] border-[#2D241E] text-white hover:bg-black active:scale-90' : 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'}`}>
                                                    <ShoppingCart size={20} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 md:py-48 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center">
                                <PackageX size={60} className="text-slate-200 mb-6" />
                                <h3 className="text-xl font-black text-[#2D241E] uppercase tracking-widest italic opacity-30">ไม่พบเมนูที่คุณต้องการ</h3>
                                <button onClick={() => {setSearchTerm(''); setSelectedCats([]); setPriceRange([]);}} className="mt-6 text-[#2D241E] font-black underline uppercase tracking-widest text-xs italic">Clear Search</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- 📝 Detail Modal (Balanced Proportions) --- */}
            {isDetailModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-12">
                    <div className="absolute inset-0 bg-[#2D241E]/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsDetailModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-6xl h-full lg:h-[85vh] overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl flex flex-col lg:flex-row border-4 border-[#2D241E] animate-in zoom-in-95 duration-500">
                        
                        <div className="lg:w-1/2 h-2/5 lg:h-full bg-slate-100 relative shrink-0 border-b-4 lg:border-b-0 lg:border-r-4 border-[#2D241E]">
                            <img src={selectedProduct.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
                        </div>

                        <div className="lg:w-1/2 h-3/5 lg:h-full flex flex-col bg-white overflow-hidden">
                            <div className="p-8 md:p-10 pb-0 shrink-0 text-left">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-2">
                                        <span className="px-3 py-1 bg-[#2D241E] text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic">{selectedProduct.category?.category_name}</span>
                                        {/* ปรับขนาดชื่อสินค้าลงจาก 5xl -> 4xl */}
                                        <h2 className="text-2xl lg:text-4xl font-black text-[#2D241E] tracking-tighter uppercase italic leading-tight">{selectedProduct.product_name}</h2>
                                    </div>
                                    <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-[#2D241E] hover:text-red-500 rounded-full shadow-md border-2 border-[#2D241E] transition-all active:scale-95"><X size={20} strokeWidth={3} /></button>
                                </div>
                                
                                <div className="flex gap-8 border-b-4 border-slate-50">
                                    {['detail', 'reviews'].map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm md:text-base font-black uppercase tracking-[0.1em] relative transition-all italic ${activeTab === tab ? 'text-[#2D241E]' : 'text-[#2D241E]/30'}`}>
                                            {tab === 'detail' ? 'Info' : `Reviews (${reviews.length})`}
                                            {activeTab === tab && <div className="absolute bottom-[-4px] left-0 w-full h-[4px] bg-[#2D241E] rounded-full"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar text-left">
                                {activeTab === 'detail' ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <p className="text-xs font-black text-[#2D241E] uppercase tracking-[0.2em] flex items-center gap-2 italic"><Info size={14} strokeWidth={3}/> Description</p>
                                        <p className="text-base md:text-lg font-bold text-[#2D241E]/70 leading-relaxed italic">
                                            {selectedProduct.description || "สูตรลับความอร่อยฉบับโฮมเมด คัดสรรเฉพาะวัตถุดิบพรีเมียม เพื่อส่งต่อความสุขให้คุณในทุกคำ"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        {reviews.length > 0 ? reviews.map((rev, idx) => (
                                            <div key={idx} className="bg-slate-50 p-5 rounded-[1.8rem] border-2 border-slate-100 shadow-sm">
                                                <div className="flex text-amber-500 gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating_score ? "currentColor" : "none"} strokeWidth={2} />)}
                                                </div>
                                                <p className="text-[#2D241E] text-base italic font-bold leading-relaxed">"{rev.comment}"</p>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-4 border-dashed border-white">
                                                <MessageCircle size={40} className="mx-auto text-slate-200 mb-3"/>
                                                <p className="text-[#2D241E] font-black uppercase tracking-widest text-xs italic opacity-30">No reviews yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 md:p-10 border-t-4 border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 bg-slate-50/50">
                                <div className="text-left w-full sm:w-auto">
                                    <p className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-widest mb-1">Price</p>
                                    <span className="text-3xl md:text-4xl font-black text-[#2D241E] tracking-tighter italic">฿{Number(selectedProduct.unit_price).toLocaleString()}</span>
                                </div>
                                <button onClick={() => { addToCart(selectedProduct); setIsDetailModalOpen(false); }} disabled={selectedProduct.stock_quantity <= 0} className="w-full sm:flex-1 bg-[#2D241E] text-white py-5 rounded-full font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4 italic">
                                    <ShoppingCart size={22} strokeWidth={2.5} /> ADD TO BASKET
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer userData={userData} />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
                input::placeholder { color: #2D241E; opacity: 0.3; font-style: italic; font-weight: 700; font-size: 14px; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
            `}} />
        </div>
    );
};

export default CustomerProducts;