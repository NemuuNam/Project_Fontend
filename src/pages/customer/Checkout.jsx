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
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopSettings, setShopSettings] = useState({ delivery_fee: 0, min_free_shipping: 0 });
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({ recipient_name: '', phone_number: '', address_detail: '' });
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);

    // --- Helper Functions ---
    const formatBankNumber = (num) => {
        if (!num) return '';
        const cleaned = num.toString().replace(/\D/g, '');
        return cleaned.length === 10 ? `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9)}` : cleaned;
    };

    const formatPhoneNumber = (val) => {
        const cleaned = val.replace(/\D/g, '');
        if (cleaned.length <= 10) return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        return cleaned;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("คัดลอกเลขบัญชีแล้ว", { style: { borderRadius: '15px', background: '#2D241E', color: '#fff' } });
    };

    const { subtotal, shippingCost, isFreeShipping, totalAmount } = useMemo(() => {
        const sub = cartItems.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
        const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const fee = Number(shopSettings.delivery_fee) || 0;
        const minItems = Number(shopSettings.min_free_shipping) || 0;
        const free = minItems > 0 && count >= minItems;
        const ship = free ? 0 : fee;
        return { subtotal: sub, shippingCost: ship, isFreeShipping: free, totalAmount: sub + ship };
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
                setShopSettings({ delivery_fee: parseFloat(settings.delivery_fee) || 0, min_free_shipping: parseInt(settings.min_free_shipping, 10) || 0 });
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
        if (file) { setSlipFile(file); setSlipPreview(URL.createObjectURL(file)); }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({ ...prev, [name]: name === 'phone_number' ? value.replace(/\D/g, '').slice(0, 10) : value }));
    };

    // --- จุดสำคัญ: ฟังก์ชันสั่งซื้อแบบสมบูรณ์ ---
    const handleSubmitOrder = async () => {
        if (!slipFile) return toast.error("กรุณาแนบสลิปโอนเงิน");

        try {
            Swal.fire({ title: 'กำลังประมวลผล...', text: 'กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูล', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            let finalAddressId = selectedAddressId;

            // 1. บันทึกที่อยู่ใหม่ถ้ามีการกรอกเพิ่ม
            if (isAddingNew) {
                if (!addressForm.recipient_name || !addressForm.phone_number || !addressForm.address_detail) {
                    Swal.close();
                    return toast.error("กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน");
                }

                console.log("Saving New Address:", addressForm); // Debug
                const addrRes = await axiosInstance.post(API_ENDPOINTS.ADDRESSES, addressForm);
                
                if (addrRes.success) {
                    finalAddressId = addrRes.data.address_id;
                    console.log("Address Saved Success, ID:", finalAddressId); // Debug
                } else {
                    throw new Error(addrRes.message || "บันทึกที่อยู่ล้มเหลว");
                }
            }

            if (!finalAddressId) {
                Swal.close();
                return toast.error("กรุณาเลือกที่อยู่จัดส่ง");
            }

            // 2. สร้างคำสั่งซื้อ
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
                    icon: 'success', title: 'สั่งซื้อสำเร็จ!', text: 'เราได้รับออเดอร์เรียบร้อยแล้ว', confirmButtonColor: '#2D241E',
                    customClass: { popup: 'rounded-[3rem] border-4 border-[#2D241E] font-["Kanit"]' }
                }).then(() => navigate('/my-orders'));
            }
        } catch (err) {
            console.error("Submit Order Detail Error:", err.response?.data || err.message); // Debug ดู Error จริงจาก Backend
            Swal.fire({ 
                icon: 'error', title: 'ขออภัย!', text: err.response?.data?.message || 'สลิปชำระเงินขนาดไม่ถูกต้อง', confirmButtonColor: '#2D241E' 
            });
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={48} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative selection:bg-[#F3E9DC]">
            <Toaster position="bottom-center" />
            <HeaderHome userData={userData} />
            
            <main className="max-w-[1300px] mx-auto px-4 md:px-6 py-24 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    
                    {/* Left Column: Shipping & Payment */}
                    <div className="flex-1 space-y-8">
                        {/* 01. Shipping */}
                        <section className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border-2 border-slate-50">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl md:text-2xl font-black italic uppercase">01. Shipping</h2>
                                <div className="flex bg-slate-100 p-1 rounded-full">
                                    <button onClick={() => setIsAddingNew(false)} className={`px-6 py-2 rounded-full text-xs font-bold ${!isAddingNew ? 'bg-white shadow-sm' : 'text-slate-500'}`}>ที่อยู่เดิม</button>
                                    <button onClick={() => setIsAddingNew(true)} className={`px-6 py-2 rounded-full text-xs font-bold ${isAddingNew ? 'bg-white shadow-sm' : 'text-slate-500'}`}>เพิ่มใหม่</button>
                                </div>
                            </div>

                            {!isAddingNew ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedAddresses.map(addr => (
                                        <div key={addr.address_id} onClick={() => setSelectedAddressId(addr.address_id)} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedAddressId === addr.address_id ? 'border-[#2D241E] bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                            <p className="font-black italic uppercase mb-1">{addr.recipient_name}</p>
                                            <p className="text-sm text-slate-600 mb-4 italic leading-relaxed">"{addr.address_detail}"</p>
                                            <p className="text-sm font-bold flex items-center gap-2 border-t pt-4"><Phone size={14}/> {formatPhoneNumber(addr.phone_number)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input name="recipient_name" value={addressForm.recipient_name} onChange={handleAddressChange} placeholder="ชื่อผู้รับ" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-[#2D241E]/10" />
                                        <input name="phone_number" value={formatPhoneNumber(addressForm.phone_number)} onChange={handleAddressChange} placeholder="เบอร์โทรศัพท์" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-[#2D241E]/10" />
                                    </div>
                                    <textarea name="address_detail" value={addressForm.address_detail} onChange={handleAddressChange} placeholder="ที่อยู่โดยละเอียด" rows="3" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-[#2D241E]/10 resize-none" />
                                </div>
                            )}
                        </section>

                        {/* 02. Payment (Simplified for length) */}
                        <section className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border-2 border-slate-50">
                            <h2 className="text-xl md:text-2xl font-black italic uppercase mb-8">02. Payment</h2>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {paymentMethods.map(m => (
                                    <button key={m.method_id} onClick={() => setSelectedMethod(m)} className={`px-8 py-3 rounded-full text-xs font-black uppercase border-2 transition-all ${selectedMethod?.method_id === m.method_id ? 'bg-[#2D241E] text-white border-[#2D241E]' : 'border-slate-200'}`}>{m.bank_name}</button>
                                ))}
                            </div>
                            
                            {selectedMethod && (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-[#F3E9DC] flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="text-center md:text-left">
                                            <p className="text-[10px] uppercase font-black tracking-widest opacity-50">Account Name</p>
                                            <p className="text-xl font-black italic uppercase">{selectedMethod.account_name}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                                            <p className="text-2xl font-black italic tabular-nums">{formatBankNumber(selectedMethod.account_number)}</p>
                                            <button onClick={() => copyToClipboard(selectedMethod.account_number)} className="p-2 bg-[#2D241E] text-white rounded-lg hover:bg-black"><Copy size={16}/></button>
                                        </div>
                                    </div>
                                    <div className={`border-4 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative transition-all ${slipPreview ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100 hover:border-[#2D241E]'}`}>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                        {slipPreview ? (
                                            <div className="relative z-30">
                                                <img src={slipPreview} className="w-40 h-56 object-cover rounded-xl shadow-lg border-4 border-white" alt="slip" />
                                                <button onClick={() => { setSlipFile(null); setSlipPreview(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 border-4 border-white"><X size={14}/></button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto mb-2 opacity-20" size={32} />
                                                <p className="text-sm font-black uppercase tracking-widest">กรุณาเพิ่มสลิปการชำระเงิน ขนาดไม่เกิน 4.5 MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-[400px] xl:w-[450px] lg:sticky lg:top-32">
                        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border-2 border-slate-50 relative overflow-hidden">
                            <Receipt className="absolute -top-10 -right-10 opacity-[0.03] -rotate-12" size={250} />
                            <h3 className="text-xl font-black italic uppercase mb-8 border-b-4 border-slate-50 pb-4">Summary</h3>
                            
                            <div className="space-y-4 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item.product_id} className="flex justify-between items-center gap-4">
                                        <div className="flex gap-3 items-center min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shrink-0"><img src={item.image_url} className="w-full h-full object-cover" alt="" /></div>
                                            <div className="min-w-0"><p className="text-xs font-black uppercase truncate italic">{item.product_name}</p><p className="text-[10px] font-bold opacity-50 uppercase">{item.quantity} x ฿{item.unit_price.toLocaleString()}</p></div>
                                        </div>
                                        <p className="font-black italic">฿{(item.unit_price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-slate-50 pt-6 space-y-3 mb-8">
                                <div className="flex justify-between text-sm font-bold"><span>Subtotal</span><span>฿{subtotal.toLocaleString()}</span></div>
                                <div className="flex justify-between text-sm font-bold"><span>Delivery</span><span>{isFreeShipping ? <span className="text-emerald-600">FREE</span> : `฿${shippingCost.toLocaleString()}`}</span></div>
                            </div>

                            <div className="border-t-4 border-[#2D241E] pt-6 mb-8 flex justify-between items-end">
                                <div><p className="text-[10px] font-black uppercase tracking-widest opacity-50">Total Amount</p><p className="text-2xl font-black italic uppercase leading-none">ยอดสุทธิ</p></div>
                                <p className="text-4xl font-black tracking-tighter tabular-nums">฿{totalAmount.toLocaleString()}</p>
                            </div>

                            <button onClick={handleSubmitOrder} className="w-full bg-[#2D241E] text-white py-6 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4 italic group">
                                Confirm Order <Navigation size={20} className="rotate-90 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Checkout;