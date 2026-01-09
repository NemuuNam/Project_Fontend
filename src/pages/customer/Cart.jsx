import React, { useState, useEffect, useCallback } from 'react';
import { 
    Trash2, Plus, Minus, ShoppingBag, ArrowLeft, 
    CreditCard, Loader2, AlertCircle, 
    Leaf, Cookie, Smile, Sparkles, ShoppingCart, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Cart = ({ userData }) => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopSettings, setShopSettings] = useState({ delivery_fee: 0, min_free_shipping: 0 });

    const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

    // --- 📦 1. Fetch Shop Settings (คงเดิม) ---
    const fetchSettings = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
            if (res.success && res.data) {
                setShopSettings({
                    delivery_fee: parseFloat(res.data.delivery_fee) || 0,
                    min_free_shipping: parseInt(res.data.min_free_shipping, 10) || 0
                });
            }
        } catch (err) { 
            console.error("Fetch Settings Error:", err);
            setShopSettings({ delivery_fee: 35, min_free_shipping: 20 }); 
        }
    }, []);

    // --- 🔄 2. Sync Cart Data (คงเดิม) ---
    const syncCartWithDatabase = useCallback(async () => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length === 0) { setCartItems([]); return; }
        
        try {
            const productIds = localCart.map(item => item.product_id);
            const res = await axiosInstance.post(`${API_ENDPOINTS.PRODUCTS}/sync-cart`, { ids: productIds });
            
            if (res.success) {
                const mergedCart = localCart.map(localItem => {
                    const latestInfo = res.data.find(p => p.product_id === localItem.product_id);
                    if (!latestInfo) return null;
                    const finalQty = Math.min(localItem.quantity, latestInfo.stock_quantity);

                    return {
                        ...latestInfo,
                        quantity: finalQty,
                        image_url: latestInfo.images?.find(img => img.is_main)?.image_url || latestInfo.images?.[0]?.image_url
                    };
                }).filter(Boolean);

                setCartItems(mergedCart);
                localStorage.setItem('cart', JSON.stringify(mergedCart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (err) { console.error("Sync Error:", err); }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([syncCartWithDatabase(), fetchSettings()]);
            setLoading(false);
        };
        init();
    }, [syncCartWithDatabase, fetchSettings]);

    // --- 🧮 3. Calculation ---
    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
    const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const isFreeShipping = shopSettings.min_free_shipping > 0 && totalItemsCount >= shopSettings.min_free_shipping;
    const currentShipping = isFreeShipping ? 0 : shopSettings.delivery_fee;
    const finalTotal = subtotal + currentShipping;

    // --- ✍️ 4. Handlers ---
    const updateQuantity = (id, delta) => {
        const updated = cartItems.map(item => {
            if (item.product_id === id) {
                const newQty = Math.max(1, Math.min(item.quantity + delta, item.stock_quantity));
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated.map(i => ({ product_id: i.product_id, quantity: i.quantity }))));
        window.dispatchEvent(new Event('storage'));
    };

    const removeItem = (id) => {
        Swal.fire({
            title: 'นำออกจากตะกร้า?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            cancelButtonColor: '#fff',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            background: '#fff',
            customClass: { popup: "rounded-[3rem] border border-slate-50 shadow-2xl font-['Kanit']" }
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = cartItems.filter(item => item.product_id !== id);
                setCartItems(updated);
                localStorage.setItem('cart', JSON.stringify(updated.map(i => ({ product_id: i.product_id, quantity: i.quantity }))));
                window.dispatchEvent(new Event('storage'));
                toast.success("นำสินค้าออกแล้ว");
            }
        });
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex flex-col min-h-screen bg-[#ffffff] font-['Kanit'] text-[#2D241E] relative selection:bg-[#F3E9DC] overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Cozy Patterns --- */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.025] z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12" size={250} />
                <Cookie className="absolute bottom-[10%] right-[10%] -rotate-12" size={200} />
                <Smile className="absolute top-[40%] right-[15%] opacity-40" size={150} />
            </div>
            
            <main className="flex-grow w-full max-w-[1300px] mx-auto px-6 md:px-10 py-16 relative z-10 text-left">
                <div className="mb-12">
                    <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 text-[20px] font-black text-[#2D241E] hover:text-[#2D241E] mb-6 transition-all uppercase tracking-widest group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> กลับไปหน้าเมนู
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-[#2D241E] rounded-full"></div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">รายการในถาดขนม</h1>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-40 bg-white rounded-[4rem] border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
                        <ShoppingCart size={80} className="mx-auto text-slate-100 mb-8" />
                        <h2 className="text-3xl font-black text-[#2D241E] uppercase italic">ถาดขนมของคุณยังว่างอยู่</h2>
                        <button onClick={() => navigate('/products')} className="mt-10 bg-white text-[#2D241E] border border-slate-100 px-12 py-5 rounded-full font-black uppercase tracking-widest text-[20px] shadow-md hover:shadow-xl transition-all">ไปเลือกซื้อความอร่อยกัน</button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10 items-start">
                        
                        {/* 🛒 Product List (Compact & Readable) */}
                        <div className="w-full lg:w-[65%] space-y-5">
                            {cartItems.map((item) => (
                                <div key={item.product_id} className="bg-white p-6 rounded-[3rem] flex flex-col sm:flex-row items-center gap-8 shadow-sm border border-slate-100 hover:border-[#F3E9DC] transition-all duration-500 group relative">
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 overflow-hidden rounded-[2.5rem] bg-slate-50 border-2 border-white shadow-sm">
                                        <img src={item.image_url || '/placeholder.png'} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>

                                    <div className="flex-1 text-center sm:text-left space-y-2">
                                        {/* หมวดหมู่: ปรับให้ใหญ่ขึ้น */}
                                        <span className="text-[20px] font-black text-[#2D241E] uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg inline-block">
                                            {item.category?.category_name || "ขนม"}
                                        </span>
                                        <h3 className="text-xl md:text-2xl font-black text-[#2D241E] tracking-tight uppercase line-clamp-1">{item.product_name}</h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-2">
                                            <span className="text-[20px] font-bold text-[#2D241E] uppercase">ราคาต่อหน่วย</span>
                                            <p className="text-2xl font-black text-[#2D241E]">฿{Number(item.unit_price).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-6 w-full sm:w-auto pt-5 sm:pt-0 border-t sm:border-t-0 border-slate-50 justify-between sm:justify-center">
                                        <div className="flex items-center gap-5 bg-slate-50/80 p-2 rounded-full border border-slate-100 shadow-inner">
                                            <button onClick={() => updateQuantity(item.product_id, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-[#2D241E] hover:text-[#2D241E] shadow-sm transition-all"><Minus size={16} /></button>
                                            <span className="text-xl font-black w-8 text-center tabular-nums">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product_id, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-[#2D241E] hover:text-[#2D241E] shadow-sm transition-all"><Plus size={16} /></button>
                                        </div>
                                        <button onClick={() => removeItem(item.product_id)} className="text-[#2D241E] hover:text-red-500 transition-all flex items-center gap-2 font-bold text-[20px]">
                                            <Trash2 size={20} /> <span className="hidden sm:inline">ลบรายการนี้</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 📊 Summary Sidebar (Increased Text Size) */}
                        <div className="w-full lg:w-[35%] lg:sticky lg:top-32">
                            <div className="bg-white text-[#2D241E] p-10 rounded-[3.5rem] shadow-xl border border-slate-100 relative overflow-hidden text-left animate-in slide-in-from-right-4 duration-700">
                                <Smile className="absolute -top-10 -right-10 opacity-[0.03] text-[#2D241E] rotate-12" size={150} />
                                <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter italic border-b border-slate-50 pb-6">สรุปรายการสั่งซื้อ</h2>

                                <div className="space-y-8 mb-12 relative z-10">
                                    {/* ปรับขนาดหัวข้อและยอดเงินให้อ่านง่ายขึ้น */}
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span className="opacity-70">ยอดรวมสินค้า ({totalItemsCount} ชิ้น)</span>
                                        <span className="text-2xl font-black italic">฿{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span className="opacity-70">ค่าจัดส่ง</span>
                                        {isFreeShipping ? (
                                            <span className="text-green-500 italic font-black text-2xl uppercase">Free</span>
                                        ) : (
                                            <span className="text-2xl font-black italic">฿{shopSettings.delivery_fee.toLocaleString()}</span>
                                        )}
                                    </div>

                                    {/* กล่องส่งฟรี: ตัวหนังสือใหญ่ขึ้นและชัดเจนขึ้น */}
                                    {!isFreeShipping && shopSettings.min_free_shipping > 0 && (
                                        <div className="bg-[#F3E9DC]/40 p-6 rounded-[2rem] border border-[#F3E9DC] text-center shadow-inner">
                                            <p className="text-[20px] font-bold text-[#2D241E] uppercase tracking-wide leading-relaxed">
                                                ซื้อเพิ่มอีก <span className="text-[#2D241E] font-black text-xl">{(shopSettings.min_free_shipping - totalItemsCount)} ชิ้น</span> <br/> เพื่อรับสิทธิ์จัดส่งฟรี!
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t-4 border-[#2D241E] mb-12 relative z-10">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black uppercase tracking-tighter text-[#2D241E] italic leading-none">Net total</span>
                                            <span className="text-[20px] font-bold text-[#2D241E] uppercase mt-1">ยอดชำระสุทธิ</span>
                                        </div>
                                        <span className="text-5xl md:text-6xl font-black text-[#2D241E] tracking-tighter tabular-nums">฿{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate('/checkout')} 
                                    disabled={isStaff}
                                    className={`w-full py-7 rounded-full font-black text-base flex items-center justify-center gap-4 transition-all shadow-lg border uppercase tracking-[0.1em] ${
                                        isStaff 
                                        ? 'bg-slate-50 text-slate-300 border-none' 
                                        : 'bg-white text-[#2D241E] border-slate-100 hover:shadow-2xl hover:-translate-y-1 active:scale-95'
                                    }`}
                                >
                                    ยืนยันรายการ <CreditCard size={22} className="text-[#2D241E]" />
                                </button>
                            </div>
                            <button onClick={() => navigate('/products')} className="w-full mt-10 text-[#2D241E] hover:text-[#2D241E] font-black text-[20px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                <ArrowLeft size={16} /> กลับไปเลือกขนมเพิ่ม
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Cart;