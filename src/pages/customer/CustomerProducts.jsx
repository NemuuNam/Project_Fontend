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

    const isOwner = userData?.role_level === 2;

    // --- 📦 Logic คงเดิมตามคำขอ ---
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

            {/* --- ☁️ Background Patterns --- */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
                <Leaf className="absolute top-10 left-[5%] rotate-12" size={180} />
                <Cookie className="absolute bottom-20 right-[5%] -rotate-12" size={150} />
                <Smile className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={300} />
            </div>

            {/* --- 🍃 Hero Section --- */}
            <section className="relative pt-20 pb-12 px-6">
                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
                        <Sparkles size={14} className="text-[#D97706]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B7E66]">คอลเลกชันพิเศษ</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-[#2D241E] mb-10 tracking-tighter uppercase italic leading-none">
                        เมนู <span className="text-[#8B7E66] font-light">โฮมเมด</span>
                    </h1>
                    
                    <div className="max-w-2xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C2B8A3] group-focus-within:text-[#2D241E] transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="ค้นหาความอร่อยที่คุณต้องการ..." 
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2.5rem] text-lg outline-none shadow-sm focus:shadow-md transition-all placeholder:text-[#C2B8A3]" 
                            value={searchTerm} 
                            onChange={(e) => {setSearchTerm(e.target.value); setSearchParams({ search: e.target.value });}} 
                        />
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-6 lg:px-12 py-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* --- 🏷️ Sidebar Filter --- */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="sticky top-32 bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-[#2D241E]">
                                    <SlidersHorizontal size={18} />
                                </div>
                                <h2 className="font-black text-xl tracking-tight uppercase">ตัวกรอง</h2>
                            </div>
                            
                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C2B8A3] mb-6 border-b border-slate-50 pb-3">หมวดหมู่</h3>
                                    <div className="space-y-4 text-left">
                                        {categories.map(cat => (
                                            <label key={cat.category_id} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="peer h-5 w-5 appearance-none rounded-lg border border-slate-200 checked:bg-[#2D241E] transition-all" 
                                                        checked={selectedCats.includes(Number(cat.category_id))} 
                                                        onChange={(e) => {
                                                            const catId = Number(cat.category_id);
                                                            if (e.target.checked) setSelectedCats([...selectedCats, catId]);
                                                            else setSelectedCats(selectedCats.filter(id => id !== catId));
                                                        }} 
                                                    />
                                                    <Check className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={12} strokeWidth={4} />
                                                </div>
                                                <span className="text-sm font-bold text-[#8B7E66] group-hover:text-[#2D241E] transition-colors">{cat.category_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C2B8A3] mb-6 border-b border-slate-50 pb-3">ช่วงราคา</h3>
                                    <div className="space-y-4 text-left">
                                        {[
                                            { label: 'ต่ำกว่า 100 ฿', val: '0-100' }, 
                                            { label: '101 - 200 ฿', val: '101-200' }, 
                                            { label: '201 - 500 ฿', val: '201-500' }, 
                                            { label: 'มากกว่า 500 ฿', val: '501+' }
                                        ].map((range) => (
                                            <label key={range.val} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="peer h-5 w-5 appearance-none rounded-lg border border-slate-200 checked:bg-[#2D241E] transition-all" 
                                                        checked={priceRange.includes(range.val)} 
                                                        onChange={(e) => e.target.checked ? setPriceRange([...priceRange, range.val]) : setPriceRange(priceRange.filter(r => r !== range.val))} 
                                                    />
                                                    <Check className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={12} strokeWidth={4} />
                                                </div>
                                                <span className="text-sm font-bold text-[#8B7E66] group-hover:text-[#2D241E] transition-colors">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {(selectedCats.length > 0 || priceRange.length > 0) && (
                                <button 
                                    onClick={() => { setSelectedCats([]); setPriceRange([]); }} 
                                    className="mt-10 w-full py-4 bg-slate-50 text-[#2D241E] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100"
                                >
                                    ล้างค่าตัวกรอง
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* --- 🍪 Product Grid --- */}
                    <div className="flex-1">
                        <div className="mb-8 flex justify-between items-center px-4">
                            <p className="text-[10px] font-black text-[#C2B8A3] uppercase tracking-[0.2em]">พบสินค้าทั้งหมด <span className="text-[#2D241E]">{filteredProducts.length} รายการ</span></p>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    <div key={product.product_id} className="group bg-white rounded-[3.5rem] p-6 border border-slate-50 hover:shadow-2xl transition-all duration-700 flex flex-col h-full relative overflow-hidden">
                                        <button 
                                            onClick={(e) => toggleWishlist(e, product.product_id)} 
                                            className="absolute top-8 right-8 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center hover:scale-110 transition-all"
                                        >
                                            <Heart size={18} className={`${wishlistedIds.includes(product.product_id) ? 'fill-red-500 text-red-500' : 'text-[#C2B8A3]'}`} />
                                        </button>

                                        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] mb-6 bg-slate-50 cursor-pointer" onClick={() => openProductDetail(product)}>
                                            <img 
                                                src={product.images?.[0]?.image_url || '/placeholder.png'} 
                                                alt={product.product_name} 
                                                className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${product.stock_quantity <= 0 ? 'grayscale opacity-40' : ''}`} 
                                            />
                                            {product.stock_quantity <= 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="bg-white/95 text-[#2D241E] px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">สินค้าหมด</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-2 flex flex-col flex-grow text-left">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#D97706] bg-amber-50 px-3 py-1 rounded-lg">
                                                    {product.category?.category_name}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-[#2D241E] leading-tight mb-4 uppercase tracking-tighter italic line-clamp-2">
                                                {product.product_name}
                                            </h3>
                                            
                                            <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <p className="text-[9px] font-black text-[#C2B8A3] uppercase tracking-widest mb-0.5">ราคา</p>
                                                    <span className="text-2xl font-black text-[#2D241E] tracking-tighter">฿{Number(product.unit_price).toLocaleString()}</span>
                                                </div>
                                                <button 
                                                    onClick={() => addToCart(product)} 
                                                    disabled={product.stock_quantity <= 0} 
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${product.stock_quantity > 0 ? 'bg-white border-slate-100 text-[#2D241E] hover:shadow-md active:scale-95' : 'bg-slate-50 text-[#C2B8A3] cursor-not-allowed'}`}
                                                >
                                                    <ShoppingCart size={20}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-slate-100">
                                <PackageX size={60} className="mx-auto text-slate-100 mb-6" />
                                <h3 className="text-xl font-black text-[#C2B8A3] uppercase tracking-widest">ไม่พบสินค้าที่ต้องการ</h3>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- 📝 Detail Modal --- */}
            {isDetailModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 lg:p-12">
                    <div className="absolute inset-0 bg-[#2D241E]/10 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsDetailModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-6xl h-[95vh] lg:h-[85vh] overflow-hidden rounded-[3rem] lg:rounded-[5rem] shadow-2xl flex flex-col lg:flex-row border border-white animate-in zoom-in-95 duration-500">
                        
                        <div className="lg:w-1/2 h-1/2 lg:h-full bg-slate-50 relative shrink-0">
                            <img src={selectedProduct.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt={selectedProduct.product_name} />
                        </div>

                        <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-white">
                            <div className="p-8 lg:p-14 pb-0 shrink-0 text-left">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-3">
                                        <span className="px-4 py-1.5 bg-slate-50 text-[#8B7E66] rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedProduct.category?.category_name}</span>
                                        <h2 className="text-3xl lg:text-5xl font-black text-[#2D241E] tracking-tighter uppercase italic leading-tight">{selectedProduct.product_name}</h2>
                                    </div>
                                    <button onClick={() => setIsDetailModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white text-[#C2B8A3] hover:text-red-400 rounded-full shadow-sm border border-slate-50 transition-all active:scale-95"><X size={24} /></button>
                                </div>
                                
                                <div className="flex gap-10 border-b border-slate-50">
                                    {['detail', 'reviews'].map(tab => (
                                        <button 
                                            key={tab} 
                                            onClick={() => setActiveTab(tab)} 
                                            className={`pb-5 text-[11px] font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === tab ? 'text-[#2D241E]' : 'text-[#C2B8A3]'}`}
                                        >
                                            {tab === 'detail' ? 'รายละเอียด' : `รีวิวจากลูกค้า (${reviews.length})`}
                                            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2D241E] rounded-full"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-14 custom-scrollbar text-left">
                                {activeTab === 'detail' ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <p className="text-[10px] font-black text-[#D97706] uppercase tracking-[0.3em] flex items-center gap-2"><Info size={14}/> ข้อมูลสินค้า</p>
                                        <p className="text-base lg:text-lg font-light text-[#2D241E]/80 leading-relaxed whitespace-pre-wrap italic">
                                            {selectedProduct.description || "สินค้าแฮนด์เมดคุณภาพที่คัดสรรมาอย่างดีเพื่อคุณ"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        {reviews.length > 0 ? reviews.map((rev, idx) => (
                                            <div key={idx} className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-white shadow-sm">
                                                <div className="flex text-amber-400 gap-1 mb-3">
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating_score ? "currentColor" : "none"} strokeWidth={1} />)}
                                                </div>
                                                <p className="text-[#2D241E] text-sm italic font-medium">"{rev.comment}"</p>
                                            </div>
                                        )) : (
                                            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-white">
                                                <MessageCircle size={40} className="mx-auto text-slate-200 mb-4"/>
                                                <p className="text-[#C2B8A3] font-black uppercase tracking-widest text-[9px]">ยังไม่มีการรีวิวสำหรับเมนูนี้</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 lg:p-14 border-t border-slate-50 flex items-center justify-between gap-8 shrink-0">
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-[#C2B8A3] uppercase tracking-widest mb-1">ราคาต่อหน่วย</p>
                                    <span className="text-4xl font-black text-[#2D241E] tracking-tighter italic">฿{Number(selectedProduct.unit_price).toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={() => { addToCart(selectedProduct); setIsDetailModalOpen(false); }} 
                                    disabled={selectedProduct.stock_quantity <= 0}
                                    className="flex-1 bg-white text-[#2D241E] py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-xl border border-slate-100 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
                                >
                                    <ShoppingCart size={20} /> เพิ่มลงถาดขนม
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer userData={userData} />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #F3E9DC; border-radius: 10px; }
                input::placeholder { color: #C2B8A3; font-weight: 500; font-size: 15px; }
            `}} />
        </div>
    );
};

export default CustomerProducts;