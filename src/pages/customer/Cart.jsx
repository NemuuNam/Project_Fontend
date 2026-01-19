import React, { useState, useEffect, useCallback } from 'react';
import { 
    Trash2, Plus, Minus, ArrowLeft, 
    Loader2, ShoppingCart, Sparkles, Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { create } from 'zustand';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

// --- 📦 ZUSTAND STORE ---
const useCartStore = create((set, get) => ({
    cartItems: [],
    setCartItems: (items) => {
        const simplifiedCart = items.map(i => ({ product_id: i.product_id, quantity: i.quantity }));
        localStorage.setItem('cart', JSON.stringify(simplifiedCart));
        set({ cartItems: items });
        window.dispatchEvent(new Event('storage'));
    },
    updateQty: (id, delta) => {
        const { cartItems, setCartItems } = get();
        const updated = cartItems.map(item => {
            if (item.product_id === id) {
                const newQty = Math.max(1, Math.min(item.quantity + delta, item.stock_quantity || 99));
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(updated);
    },
    removeProduct: (id) => {
        const { cartItems, setCartItems } = get();
        const updated = cartItems.filter(item => item.product_id !== id);
        setCartItems(updated);
    }
}));

const Cart = ({ userData }) => {
    const navigate = useNavigate();
    const { cartItems, setCartItems, updateQty, removeProduct } = useCartStore();
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
        } catch (err) { setShopSettings({ delivery_fee: 35, min_free_shipping: 5 }); }
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
                    return {
                        ...latestInfo,
                        quantity: Math.min(localItem.quantity, latestInfo.stock_quantity),
                        image_url: latestInfo.images?.find(img => img.is_main)?.image_url || latestInfo.images?.[0]?.image_url
                    };
                }).filter(Boolean);
                setCartItems(mergedCart);
            }
        } catch (err) { console.error("Sync Error:", err); }
    }, [setCartItems]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([syncCartWithDatabase(), fetchSettings()]);
            setLoading(false);
        };
        init();
    }, [syncCartWithDatabase, fetchSettings]);

    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
    const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const isFreeShipping = shopSettings.min_free_shipping > 0 && totalItemsCount >= shopSettings.min_free_shipping;
    const shippingCost = isFreeShipping ? 0 : shopSettings.delivery_fee;
    const finalTotal = subtotal + shippingCost;

    const handleRemove = (id) => {
        Swal.fire({
            title: 'นำขนมออก?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'rounded-[3rem] border-2 border-slate-300 font-["Kanit"]' }
        }).then((result) => { if (result.isConfirmed) { removeProduct(id); toast.success("นำสินค้าออกเรียบร้อย"); } });
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-[#000000]" size={48} /></div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] relative overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- ☁️ Hero Section: pt-20 --- */}
            <section className="relative pt-20 pb-8 bg-[#FDFCFB] border-b-2 border-slate-300 text-left">
                <div className="container mx-auto px-6 lg:px-16">
                    <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-slate-300 mb-6 hover:bg-slate-50 transition-all text-sm font-medium uppercase italic text-[#000000]">
                        <ArrowLeft size={16} /> Return to Shop
                    </button>
                    <div className="flex justify-between items-end">
                        <h1 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter leading-none text-[#000000]">
                            Shopping <span className="font-light italic text-[#374151]">Bag</span>
                        </h1>
                        <p className="text-2xl font-medium text-[#374151] italic">({totalItemsCount} items)</p>
                    </div>
                </div>
            </section>
            
            <main className="container mx-auto px-6 lg:px-16 py-8 relative z-10">
                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-slate-300 flex flex-col items-center">
                        <ShoppingCart size={80} strokeWidth={1.5} className="text-[#374151] mb-6" />
                        <h2 className="text-4xl font-medium text-[#000000] uppercase italic mb-8">Your bag is empty</h2>
                        <button 
                            onClick={() => navigate('/products')} 
                            className="bg-white text-[#000000] border-2 border-slate-300 px-12 py-4 rounded-full font-medium uppercase text-lg shadow-md hover:bg-slate-50 transition-all italic"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        
                        {/* 🛒 Items List */}
                        <div className="lg:col-span-8 space-y-4 text-left">
                            {cartItems.map((item) => (
                                <div key={item.product_id} className="bg-white p-8 rounded-[3rem] flex items-center gap-8 border-2 border-slate-300 shadow-sm transition-all">
                                    <div className="w-32 h-32 shrink-0 overflow-hidden rounded-[2rem] bg-[#FDFCFB] border-2 border-slate-300">
                                        <img src={item.image_url || '/placeholder.png'} alt={item.product_name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-sm font-medium text-[#374151] uppercase tracking-widest leading-none whitespace-nowrap">{item.category?.category_name || "Bakery"}</span>
                                                <h3 className="text-2xl font-medium text-[#111827] tracking-tight uppercase italic mt-1">{item.product_name}</h3>
                                                <p className="text-3xl font-medium italic text-[#000000] mt-2">฿{Number(item.unit_price).toLocaleString()}</p>
                                            </div>
                                            <button onClick={() => handleRemove(item.product_id)} className="text-[#374151] hover:text-red-600 transition-all p-2">
                                                <Trash2 size={24} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 bg-white w-fit p-2 rounded-full border-2 border-slate-300">
                                            <button onClick={() => updateQty(item.product_id, -1)} className="w-8 h-8 flex items-center justify-center bg-white border-2 border-slate-300 rounded-full active:scale-90"><Minus size={14} strokeWidth={2.5} /></button>
                                            <span className="text-2xl font-medium w-8 text-center tabular-nums text-[#000000]">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.product_id, 1)} className="w-8 h-8 flex items-center justify-center bg-white border-2 border-slate-300 rounded-full active:scale-90"><Plus size={14} strokeWidth={2.5} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 📊 Order Summary */}
                        <div className="lg:col-span-4 lg:sticky lg:top-28 text-left">
                            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-300 shadow-lg relative overflow-hidden">
                                <h2 className="text-3xl font-medium text-[#000000] mb-8 uppercase tracking-tighter italic border-b-2 border-slate-300 pb-4">Summary</h2>
                                
                                <div className="space-y-6 mb-8">
                                    <div className="flex justify-between items-center text-xl font-medium text-[#374151]">
                                        <span className="uppercase tracking-widest">Subtotal</span>
                                        <span className="text-[#111827]">฿{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-medium text-[#374151]">
                                        <span className="uppercase tracking-widest">Delivery</span>
                                        {isFreeShipping ? <span className="text-[#000000] font-bold italic underline decoration-slate-300">FREE</span> : <span className="text-[#111827]">฿{shippingCost.toLocaleString()}</span>}
                                    </div>
                                    
                                    {!isFreeShipping && shopSettings.min_free_shipping > 0 && (
                                        <div className="bg-white rounded-[2rem] p-4 text-center border-2 border-slate-300 mt-4">
                                            <p className="text-lg font-medium text-[#111827] italic">Add <span className="text-[#000000] font-medium">{(shopSettings.min_free_shipping - totalItemsCount)} pcs</span> for <span className="underline decoration-slate-300">Free Delivery</span></p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t-2 border-slate-300 mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-medium uppercase text-[#374151]">Total</span>
                                        <span className="text-5xl font-medium tracking-tighter italic text-[#000000] leading-none">฿{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* 🚀 ปุ่ม Proceed to Checkout: พื้นขาว ขอบชัด */}
                                <button 
                                    onClick={() => navigate('/checkout')} 
                                    disabled={isStaff} 
                                    className={`w-full py-5 rounded-full font-medium text-lg flex items-center justify-center gap-3 transition-all uppercase tracking-widest italic shadow-md border-2 ${
                                        isStaff 
                                        ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed' 
                                        : 'bg-white text-[#000000] border-slate-300 hover:bg-slate-50 active:scale-95'
                                    }`}
                                >
                                    Proceed to Checkout <Navigation size={20} strokeWidth={2.5} className="rotate-90" />
                                </button>
                                
                                <button onClick={() => navigate('/products')} className="w-full mt-6 text-[#374151] font-medium uppercase text-sm transition-all italic text-center underline underline-offset-4 decoration-slate-300">Continue Shopping</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Cart;