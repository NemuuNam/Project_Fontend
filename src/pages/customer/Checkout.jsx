import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft, MapPin, CreditCard, Upload,
    Loader2, ChevronRight, CheckCircle2,
    Landmark, Smile, Leaf, Cookie, Sparkles, Receipt,
    User, Home, Plus, X, ShoppingBag, Copy, Heart, Info, AlertCircle, Navigation, Phone
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const Checkout = ({ userData }) => {
    const navigate = useNavigate();
    const addressSectionRef = useRef(null);

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopSettings, setShopSettings] = useState({ delivery_fee: 0, min_free_shipping: 0 });
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({ recipient_name: '', phone_number: '', address_detail: '' });

    const [errors, setErrors] = useState({});
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);

    const formatBankNumber = (num) => {
        if (!num) return '';
        const cleaned = num.toString().replace(/\D/g, '');
        return cleaned.length === 10 ? `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9)}` : cleaned;
    };

    const formatPhoneNumber = (val) => {
        const cleaned = val.replace(/\D/g, '');
        if (cleaned.length <= 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        return cleaned;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("คัดลอกเลขบัญชีแล้ว", { style: { borderRadius: '15px', background: '#2D241E', color: '#fff' } });
    };

    const { subtotal, shippingCost, isFreeShipping, totalAmount, totalItemsCount } = useMemo(() => {
        const sub = cartItems.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
        const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const fee = Number(shopSettings.delivery_fee) || 0;
        const minItems = Number(shopSettings.min_free_shipping) || 0;
        const free = minItems > 0 && count >= minItems;
        const ship = free ? 0 : fee;
        return { subtotal: sub, shippingCost: ship, isFreeShipping: free, totalAmount: sub + ship, totalItemsCount: count };
    }, [cartItems, shopSettings]);

    const initCheckout = useCallback(async () => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length === 0) return navigate('/cart');
        try {
            setLoading(true);
            const [prodRes, settingsRes, paymentRes, addrRes] = await Promise.all([
                axiosInstance.post(`${API_ENDPOINTS.PRODUCTS}/sync-cart`, { ids: localCart.map(i => i.product_id) }),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`),
                axiosInstance.get(API_ENDPOINTS.ADDRESSES)
            ]);

            if (prodRes.success) {
                setCartItems(localCart.map(li => {
                    const dbProduct = prodRes.data.find(p => p.product_id === li.product_id);
                    return { ...dbProduct, quantity: li.quantity, image_url: dbProduct?.images?.find(img => img.is_main)?.image_url || dbProduct?.images?.[0]?.image_url };
                }).filter(i => i.product_id));
            }
            if (settingsRes.success) {
                const settings = Array.isArray(settingsRes.data)
                    ? settingsRes.data.reduce((acc, curr) => ({ ...acc, [curr.config_key]: curr.config_value }), {})
                    : settingsRes.data;
                setShopSettings({
                    delivery_fee: parseFloat(settings.delivery_fee) || 0,
                    min_free_shipping: parseInt(settings.min_free_shipping, 10) || 0
                });
            }
            if (paymentRes.success && paymentRes.data.length > 0) {
                setPaymentMethods(paymentRes.data);
                setSelectedMethod(paymentRes.data[0]);
            }
            if (addrRes.success) {
                setSavedAddresses(addrRes.data);
                if (addrRes.data.length > 0) setSelectedAddressId(addrRes.data[0].address_id);
                else setIsAddingNew(true);
            }
        } catch (err) { toast.error("การเชื่อมต่อระบบขัดข้อง"); }
        finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { initCheckout(); }, [initCheckout]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSlipFile(file);
            setSlipPreview(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, slip: null }));
        }
    };

    const handleSubmitOrder = async () => {
        if (!slipFile) return toast.error("กรุณาแนบสลิปโอนเงิน");
        try {
            Swal.fire({ title: 'กำลังประมวลผล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            let finalAddressId = selectedAddressId;
            const formData = new FormData();
            formData.append('slip', slipFile);
            formData.append('order_data', JSON.stringify({
                address_id: finalAddressId,
                total_amount: totalAmount,
                shipping_cost: shippingCost,
                items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.unit_price }))
            }));

            const res = await axiosInstance.post(API_ENDPOINTS.ORDERS, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.success) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage'));
                Swal.fire({
                    icon: 'success',
                    title: 'สั่งซื้อสำเร็จ!',
                    text: 'เราได้รับออเดอร์ของคุณเรียบร้อยแล้ว',
                    confirmButtonColor: '#2D241E',
                    customClass: { popup: 'rounded-[3rem] border-4 border-[#2D241E] font-["Kanit"]' }
                }).then(() => navigate('/my-orders'));
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'ขออภัย!', text: err.response?.data?.message || 'เกิดข้อผิดพลาด', confirmButtonColor: '#2D241E', customClass: { popup: 'rounded-[3rem] font-["Kanit"]' } });
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: name === 'phone_number' ? value.replace(/\D/g, '').slice(0, 10) : value
        }));
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={48} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden selection:bg-[#F3E9DC] relative">
            <Toaster position="bottom-center" />
            <HeaderHome userData={userData} />

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12" size={200} />
                <Cookie className="absolute bottom-[20%] right-[5%] -rotate-12" size={180} />
            </div>

            {/* --- 🍃 Hero Header --- */}
            <section className="relative pt-24 pb-6 md:pt-32 md:pb-8 bg-[#FAFAFA] border-b-2 border-slate-100">
                <div className="container mx-auto px-4 md:px-6 text-left relative z-10 max-w-[1300px]">
                    <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-200 mb-4 hover:bg-[#2D241E] hover:text-white transition-all group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#2D241E]">Back to Bag</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none text-[#2D241E]">
                            Checkout <span className="font-light not-italic text-[#2D241E]/60">Order</span>
                        </h1>
                        <p className="text-sm md:text-base font-bold italic text-[#2D241E] underline decoration-[#2D241E]/20 underline-offset-4">สรุปข้อมูลการสั่งซื้อและที่อยู่จัดส่ง</p>
                    </div>
                </div>
            </section>

            <main className="relative z-10 max-w-[1300px] mx-auto px-4 md:px-6 py-6 md:py-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                    {/* Left Column */}
                    <div className="flex-1 space-y-6 md:space-y-8 w-full text-left">

                        {/* 1. Shipping */}
                        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border-2 border-slate-50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                                <h2 className="text-xl md:text-2xl font-black italic uppercase flex items-center gap-4 text-[#2D241E]">
                                    <span className="text-[#2D241E] text-lg not-italic font-black">01.</span> Shipping
                                </h2>
                                <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100 shadow-inner w-full sm:w-auto">
                                    <button onClick={() => setIsAddingNew(false)} className={`flex-1 sm:px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!isAddingNew ? 'bg-white shadow-md text-[#2D241E]' : 'text-slate-500'}`}>ที่อยู่เดิม</button>
                                    <button onClick={() => setIsAddingNew(true)} className={`flex-1 sm:px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isAddingNew ? 'bg-white shadow-md text-[#2D241E]' : 'text-slate-500'}`}>+ เพิ่มใหม่</button>
                                </div>
                            </div>

                            {!isAddingNew && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedAddresses.map(addr => (
                                        <div key={addr.address_id} onClick={() => setSelectedAddressId(addr.address_id)} className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all relative ${selectedAddressId === addr.address_id ? 'border-[#2D241E] bg-white shadow-xl scale-[1.01]' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <Home size={20} className={selectedAddressId === addr.address_id ? 'text-[#2D241E]' : 'text-slate-500'} />
                                                {selectedAddressId === addr.address_id && <CheckCircle2 size={24} className="text-[#2D241E]" strokeWidth={3} />}
                                            </div>
                                            <p className="font-black text-lg uppercase italic mb-1 text-[#2D241E]">{addr.recipient_name}</p>
                                            <p className="text-sm text-[#2D241E] font-bold line-clamp-2 mb-6 leading-relaxed italic">"{addr.address_detail}"</p>
                                            <p className="text-sm font-black border-t border-slate-50 pt-4 text-[#2D241E] flex items-center gap-2">
                                                <Phone size={14} strokeWidth={3} /> {formatPhoneNumber(addr.phone_number)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isAddingNew && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* ชื่อผู้รับ */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-4">Recipient Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2D241E]/40 group-focus-within:text-[#2D241E] transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="recipient_name"
                                                    value={addressForm.recipient_name}
                                                    onChange={handleAddressChange}
                                                    placeholder="ชื่อ-นามสกุล ผู้รับ"
                                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-[#2D241E] focus:bg-white rounded-[2rem] transition-all outline-none font-bold"
                                                />
                                            </div>
                                        </div>

                                        {/* เบอร์โทรศัพท์ */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-4">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2D241E]/40 group-focus-within:text-[#2D241E] transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="phone_number"
                                                    value={formatPhoneNumber(addressForm.phone_number)}
                                                    onChange={handleAddressChange}
                                                    placeholder="08X-XXX-XXXX"
                                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-[#2D241E] focus:bg-white rounded-[2rem] transition-all outline-none font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ที่อยู่รายละเอียด */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-4">Shipping Address</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-6 top-6 text-[#2D241E]/40 group-focus-within:text-[#2D241E] transition-colors" size={20} />
                                            <textarea
                                                name="address_detail"
                                                value={addressForm.address_detail}
                                                onChange={handleAddressChange}
                                                placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                                                rows="3"
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-[#2D241E] focus:bg-white rounded-[2.5rem] transition-all outline-none font-bold resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 2. Payment */}
                        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-xl border-2 border-slate-50">
                            <h2 className="text-xl md:text-2xl font-black italic uppercase flex items-center gap-4 mb-8 text-[#2D241E]">
                                <span className="text-[#2D241E] text-lg not-italic font-black">02.</span> Payment
                            </h2>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {paymentMethods.map(m => (
                                    <button key={m.method_id} onClick={() => setSelectedMethod(m)} className={`px-8 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all border-2 ${selectedMethod?.method_id === m.method_id ? 'bg-[#2D241E] text-white border-[#2D241E] shadow-xl' : 'bg-white text-[#2D241E] border-slate-200 hover:border-slate-400'}`}>{m.bank_name}</button>
                                ))}
                            </div>

                            {selectedMethod && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="relative bg-slate-50 p-6 md:p-10 rounded-[3rem] border border-[#F3E9DC] overflow-hidden group">
                                        <Landmark className="absolute -right-8 -bottom-8 opacity-[0.15] -rotate-12 text-[#2D241E]" size={150} />
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-[#2D241E] uppercase tracking-[0.2em]">Account Name</p>
                                                <p className="text-xl md:text-2xl font-black italic uppercase text-[#2D241E]">{selectedMethod.account_name}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white px-6 py-4 rounded-[2rem] shadow-md border border-slate-100">
                                                <p className="text-2xl md:text-4xl font-black italic tracking-tighter text-[#2D241E] tabular-nums">{formatBankNumber(selectedMethod.account_number)}</p>
                                                <button onClick={() => copyToClipboard(selectedMethod.account_number)} className="p-2.5 bg-[#2D241E] text-white rounded-[1rem] hover:bg-black transition-all shadow-sm"><Copy size={18} /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`relative border-4 border-dashed rounded-[3rem] p-8 md:p-12 flex flex-col items-center justify-center transition-all group ${slipPreview ? 'border-emerald-200 bg-emerald-50/5' : errors.slip ? 'border-red-400 bg-red-50/5' : 'border-slate-200 bg-white hover:border-[#2D241E]'}`}>
                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={handleFileChange} />
                                        {slipPreview ? (
                                            <div className="relative z-30">
                                                <img src={slipPreview} className="w-48 h-64 md:w-56 md:h-72 object-cover rounded-[1.5rem] shadow-2xl border-4 border-white mx-auto" alt="สลิป" />
                                                <button onClick={(e) => { e.stopPropagation(); setSlipFile(null); setSlipPreview(null); }} className="absolute -top-3 -right-3 bg-[#2D241E] text-white rounded-full p-2.5 shadow-xl hover:bg-red-500 transition-all border-4 border-white"><X size={16} strokeWidth={3} /></button>
                                            </div>
                                        ) : (
                                            <div className="text-center pointer-events-none">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 group-hover:scale-110 transition-transform shadow-sm"><Upload className="text-[#2D241E]" size={28} strokeWidth={2.5} /></div>
                                                <p className="text-lg font-black uppercase tracking-widest mb-1 text-[#2D241E]">Attach Payment Slip</p>
                                                <p className="text-xs font-black italic text-[#2D241E] uppercase">คลิกเพื่อแนบหลักฐานการโอนเงิน</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Order Summary (Color Darkened) */}
                    <div className="w-full lg:w-[400px] xl:w-[450px] lg:sticky lg:top-32 text-left">
                        <div className="bg-white p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] shadow-2xl border-2 border-slate-100 relative overflow-hidden">
                            <Receipt className="absolute -top-12 -right-12 opacity-[0.05] -rotate-12 text-[#2D241E]" size={300} />
                            <h3 className="text-xl md:text-2xl font-black italic uppercase mb-8 pb-4 border-b-4 border-slate-50 relative z-10 text-[#2D241E]">Order Summary</h3>

                            <div className="space-y-5 mb-10 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                                {cartItems.map(item => (
                                    <div key={item.product_id} className="flex gap-4 items-center group">
                                        <div className="w-14 h-14 rounded-2xl border border-slate-100 overflow-hidden shadow-sm shrink-0 bg-slate-50">
                                            <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="font-black text-sm uppercase truncate italic text-[#2D241E]">{item.product_name}</p>
                                            <p className="text-[11px] text-[#2D241E] font-black uppercase tracking-widest">{item.quantity} ชิ้น — ฿{Number(item.unit_price).toLocaleString()}</p>
                                        </div>
                                        <p className="font-black text-lg italic tracking-tight text-[#2D241E]">฿{(item.unit_price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mb-10 relative z-10 border-t-2 border-slate-50 pt-8 text-left">
                                <div className="flex justify-between items-center text-[#2D241E]">
                                    <span className="text-base font-black uppercase tracking-[0.1em]">Subtotal</span>
                                    <span className="font-black text-xl italic">฿{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#2D241E]">
                                    <span className="text-base font-black uppercase tracking-[0.1em]">Delivery Fee</span>
                                    {isFreeShipping ? (
                                        <span className="text-emerald-700 italic font-black text-xl uppercase">FREE</span>
                                    ) : (
                                        <span className="font-black text-xl italic">฿{shippingCost.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 border-t-4 border-[#2D241E] mb-10 relative z-10 text-left">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] mb-1 text-[#2D241E]">Grand Total</span>
                                        <span className="text-xl md:text-2xl font-black uppercase italic leading-none text-[#2D241E]">ยอดสุทธิ</span>
                                    </div>
                                    <span className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums leading-none text-[#2D241E]">
                                        ฿{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button onClick={handleSubmitOrder} className="w-full bg-[#2D241E] text-white py-6 rounded-full font-black uppercase tracking-widest text-lg shadow-xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 italic group">
                                Confirm Order <Navigation size={22} strokeWidth={3} className="rotate-90 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
                input::placeholder, textarea::placeholder { color: #2D241E; opacity: 0.8; font-style: italic; }
            `}} />
        </div>
    );
};

export default Checkout;