import React, { useState, useEffect, useCallback } from 'react';
import { 
    Trash2, Plus, Minus, ShoppingBag, ArrowLeft, 
    CreditCard, Loader2, AlertCircle, 
    Leaf, Cookie, Smile, Sparkles, ShoppingCart, Heart, Navigation
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

    const fetchSettings = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
            if (res.success && res.data) {
                const settings = Array.isArray(res.data) 
                    ? res.data.reduce((acc, curr) => ({ ...acc, [curr.config_key]: curr.config_value }), {})
                    : res.data;

                setShopSettings({
                    delivery_fee: parseFloat(settings.delivery_fee) || 0,
                    min_free_shipping: parseInt(settings.min_free_shipping, 10) || 0
                });
            }
        } catch (err) { 
            setShopSettings({ delivery_fee: 35, min_free_shipping: 5 }); 
        }
    }, []);

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

    // --- 🧮 การคำนวณยอดรวม (แก้ไขชื่อตัวแปรที่นี่) ---
    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
    const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const isFreeShipping = shopSettings.min_free_shipping > 0 && totalItemsCount >= shopSettings.min_free_shipping;
    const shippingCost = isFreeShipping ? 0 : shopSettings.delivery_fee; // เปลี่ยนชื่อจาก currentShipping เป็น shippingCost
    const finalTotal = subtotal + shippingCost;

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
            text: "คุณต้องการนำสินค้าชิ้นนี้ออกจากถาดขนมใช่หรือไม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                popup: 'rounded-[2.5rem] border-4 border-[#2D241E] font-["Kanit"]',
                confirmButton: 'rounded-full px-8 py-2 font-black uppercase italic',
                cancelButton: 'rounded-full px-8 py-2 font-bold text-[#2D241E]'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = cartItems.filter(item => item.product_id !== id);
                setCartItems(updated);
                localStorage.setItem('cart', JSON.stringify(updated.map(i => ({ product_id: i.product_id, quantity: i.quantity }))));
                window.dispatchEvent(new Event('storage'));
                toast.success("นำสินค้าออกเรียบร้อย");
            }
        });
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] selection:bg-[#F3E9DC] relative overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Background Elements --- */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 text-[#2D241E]" size={250} />
                <Cookie className="absolute bottom-[10%] right-[10%] -rotate-12 text-[#2D241E]" size={150} />
            </div>

            {/* --- 🍃 Hero Header --- */}
            <section className="relative pt-24 pb-6 md:pt-32 md:pb-8 bg-[#FAFAFA] border-b-2 border-slate-100">
                <div className="container mx-auto px-6 text-left relative z-10">
                    <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-200 mb-4 hover:bg-[#2D241E] hover:text-white transition-all group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#2D241E]">Back to Menu</span>
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none text-[#2D241E]">
                            Shopping <span className="font-light not-italic text-[#2D241E]/60">Bag</span>
                        </h1>
                        <p className="text-sm md:text-base font-bold italic text-[#2D241E] underline decoration-[#2D241E]/10 underline-offset-4">มีสินค้าทั้งหมด {totalItemsCount} ชิ้นในถาด</p>
                    </div>
                </div>
            </section>
            
            <main className="container mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-10 relative z-10">
                {cartItems.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                        <ShoppingCart size={80} strokeWidth={1} className="text-slate-200 mb-6" />
                        <h2 className="text-3xl font-black text-[#2D241E] uppercase italic mb-6">ถาดขนมว่างเปล่า</h2>
                        <button onClick={() => navigate('/products')} className="bg-[#2D241E] text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-lg shadow-xl hover:scale-105 transition-all italic">
                            เลือกขนมเลย
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                        
                        {/* 🛒 Cart Items List */}
                        <div className="w-full lg:w-[62%] space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.product_id} className="bg-white p-4 md:p-6 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-6 shadow-lg border-2 border-slate-50 hover:border-[#2D241E]/10 transition-all duration-500 group relative">
                                    <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-[2rem] bg-slate-50 border-2 border-white shadow-md">
                                        <img src={item.image_url || '/placeholder.png'} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>

                                    <div className="flex-1 text-left space-y-2">
                                        <span className="text-[11px] font-black text-[#2D241E] uppercase tracking-widest italic">{item.category?.category_name || "Bakery"}</span>
                                        <h3 className="text-xl md:text-2xl font-black text-[#2D241E] tracking-tight uppercase leading-tight italic">{item.product_name}</h3>
                                        <p className="text-2xl font-black text-[#2D241E] tracking-tighter">฿{Number(item.unit_price).toLocaleString()}</p>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-full border border-slate-200 shadow-inner">
                                                <button onClick={() => updateQuantity(item.product_id, -1)} className="w-9 h-9 flex items-center justify-center bg-white rounded-full text-[#2D241E] hover:bg-[#2D241E] hover:text-white shadow-sm transition-all active:scale-90"><Minus size={14} strokeWidth={3} /></button>
                                                <span className="text-lg font-black w-8 text-center tabular-nums text-[#2D241E]">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product_id, 1)} className="w-9 h-9 flex items-center justify-center bg-white rounded-full text-[#2D241E] hover:bg-[#2D241E] hover:text-white shadow-sm transition-all active:scale-90"><Plus size={14} strokeWidth={3} /></button>
                                            </div>
                                            <button onClick={() => removeItem(item.product_id)} className="text-[#2D241E] hover:text-red-500 transition-all p-2 group/del">
                                                <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 📊 Order Summary (Matched with Checkout Hierarchy) */}
                        <div className="w-full lg:w-[38%] lg:sticky lg:top-28">
                            <div className="bg-white text-[#2D241E] p-8 md:p-10 rounded-[3rem] shadow-2xl border-2 border-slate-100 relative overflow-hidden text-left animate-in slide-in-from-right-4 duration-700">
                                <Sparkles className="absolute -top-10 -right-10 opacity-[0.05] text-[#2D241E] rotate-12" size={180} />
                                
                                <h2 className="text-xl md:text-2xl font-black mb-8 uppercase tracking-tighter italic border-b-4 border-slate-50 pb-6 text-[#2D241E]">
                                    Summary <span className="font-light not-italic text-[#2D241E]/40">Order</span>
                                </h2>

                                <div className="space-y-6 mb-10 relative z-10">
                                    <div className="flex justify-between items-center text-[#2D241E]">
                                        <span className="text-base font-black uppercase tracking-[0.1em] opacity-80">Subtotal</span>
                                        <span className="font-black text-xl italic">฿{subtotal.toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-[#2D241E]">
                                        <span className="text-base font-black uppercase tracking-[0.1em] opacity-80">Delivery Fee</span>
                                        {isFreeShipping ? (
                                            <span className="text-green-700 font-black text-xl uppercase tracking-widest italic">FREE</span>
                                        ) : (
                                            <span className="font-black text-xl italic">฿{shippingCost.toLocaleString()}</span>
                                        )}
                                    </div>

                                    {!isFreeShipping && shopSettings.min_free_shipping > 0 && (
                                        <div className="bg-[#F3E9DC]/40 border-2 border-[#F3E9DC] rounded-[2.5rem] p-5 text-center shadow-inner mt-4">
                                            <p className="text-[15px] font-bold italic text-[#2D241E] leading-relaxed">
                                                ซื้อเพิ่มอีก <span className="font-black text-xl text-black">{(shopSettings.min_free_shipping - totalItemsCount)}</span> ชิ้น เพื่อ <span className="underline underline-offset-8 decoration-4 decoration-[#2D241E]">จัดส่งฟรี!</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t-4 border-[#2D241E] mb-10 relative z-10 text-left">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col text-left">
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50 mb-1 text-[#2D241E]">Grand Total</span>
                                            <span className="text-xl md:text-2xl font-black uppercase italic leading-none text-[#2D241E]">ยอดสุทธิ</span>
                                        </div>
                                        {/* NET AMOUNT: ปรับลดขนาดลงให้สมดุล (4xl ถึง 5xl) */}
                                        <span className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums leading-none text-[#2D241E]">
                                            ฿{finalTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate('/checkout')} 
                                    disabled={isStaff}
                                    className={`w-full py-6 rounded-full font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl uppercase tracking-widest italic active:scale-95 ${
                                        isStaff 
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-none' 
                                        : 'bg-[#2D241E] text-white hover:bg-black hover:scale-[1.02]'
                                    }`}
                                >
                                    Proceed to Checkout <Navigation size={20} strokeWidth={3} className="rotate-90" />
                                </button>
                                
                                <button onClick={() => navigate('/products')} className="w-full mt-6 text-[#2D241E] hover:underline font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 italic">
                                    <ArrowLeft size={12} /> Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
            `}} />
        </div>
    );
};

export default Cart;