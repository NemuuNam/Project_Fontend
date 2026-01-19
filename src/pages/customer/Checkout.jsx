import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft, MapPin, Upload, Loader2, Navigation, Phone, 
    Copy, X, Receipt, ChevronLeft, ChevronRight, Check
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

    // 🚀 State สำหรับการสไลด์ที่อยู่ (Pagination)
    const [addressPage, setAddressPage] = useState(0);
    const addressesPerPage = 4;

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
        toast.success("คัดลอกเลขบัญชีแล้ว");
    };

    const { subtotal, shippingCost, totalAmount } = useMemo(() => {
        const sub = cartItems.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
        const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const fee = Number(shopSettings.delivery_fee) || 0;
        const minItems = Number(shopSettings.min_free_shipping) || 0;
        const free = minItems > 0 && count >= minItems;
        const ship = free ? 0 : fee;
        return { subtotal: sub, shippingCost: ship, totalAmount: sub + ship };
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
                    return { ...dbProduct, quantity: li.quantity, image_url: dbProduct?.images?.[0]?.image_url };
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

    // 🚀 Logic การสไลด์ที่อยู่
    const paginatedAddresses = useMemo(() => {
        const start = addressPage * addressesPerPage;
        return savedAddresses.slice(start, start + addressesPerPage);
    }, [savedAddresses, addressPage]);

    const totalAddressPages = Math.ceil(savedAddresses.length / addressesPerPage);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setSlipFile(file); setSlipPreview(URL.createObjectURL(file)); }
    };

    const handleSubmitOrder = async () => {
        if (!slipFile) return toast.error("กรุณาแนบสลิปโอนเงิน");
        try {
            Swal.fire({ title: 'Processing Order...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            let finalAddressId = selectedAddressId;
            if (isAddingNew) {
                const addrRes = await axiosInstance.post(API_ENDPOINTS.ADDRESSES, addressForm);
                if (addrRes.success) finalAddressId = addrRes.data.address_id;
                else throw new Error("Address error");
            }
            const formData = new FormData();
            formData.append('slip', slipFile);
            formData.append('order_data', JSON.stringify({
                address_id: finalAddressId,
                total_amount: totalAmount,
                shipping_cost: shippingCost,
                items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.unit_price }))
            }));
            const res = await axiosInstance.post(API_ENDPOINTS.ORDERS, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.success) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage'));
                Swal.fire({ icon: 'success', title: 'ORDER SUCCESS!', confirmButtonColor: '#000000' }).then(() => navigate('/my-orders'));
            }
        } catch (err) { Swal.fire({ icon: 'error', title: 'ERROR' }); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-[#000000]" size={48} /></div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] relative overflow-x-hidden selection:bg-slate-200">
            <Toaster position="bottom-center" />
            <HeaderHome userData={userData} />
            
            <main className="max-w-[1400px] mx-auto px-8 pt-16 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 text-left">
                    <div>
                        <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 px-6 py-2 bg-white border-2 border-slate-300 rounded-full mb-6 text-sm font-medium uppercase italic text-[#000000]">
                            <ArrowLeft size={16} /> Edit Cart
                        </button>
                        <h1 className="text-6xl md:text-7xl font-medium uppercase tracking-tighter leading-none text-[#000000]">
                            Checkout <span className="font-light italic text-[#374151]">Process</span>
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* --- LEFT: Details (7 Cols) --- */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* 01. Shipping: ระบบสไลด์ที่อยู่ 4 ช่อง */}
                        <section className="bg-white p-8 rounded-[3rem] border-2 border-slate-300 shadow-sm text-left">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-medium italic uppercase text-[#000000]">01. Shipping Details</h2>
                                <div className="flex border-2 border-slate-300 rounded-full p-1 bg-white">
                                    <button onClick={() => setIsAddingNew(false)} className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${!isAddingNew ? 'bg-[#000000] text-white' : 'text-[#374151]'}`}>Existing</button>
                                    <button onClick={() => setIsAddingNew(true)} className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${isAddingNew ? 'bg-[#000000] text-white' : 'text-[#374151]'}`}>New Registry</button>
                                </div>
                            </div>

                            {!isAddingNew ? (
                                <div className="space-y-6">
                                    {/* 🚀 Grid 2x2 (4 Slots) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {paginatedAddresses.map(addr => (
                                            <div key={addr.address_id} onClick={() => setSelectedAddressId(addr.address_id)} className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all relative overflow-hidden group ${selectedAddressId === addr.address_id ? 'border-[#000000] bg-[#FDFCFB] shadow-inner' : 'border-slate-100 hover:border-slate-300'}`}>
                                                <div className="flex flex-col h-full text-left">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-xl font-medium text-[#000000] uppercase italic truncate w-4/5">{addr.recipient_name}</p>
                                                        {selectedAddressId === addr.address_id && <Check size={18} className="text-black" strokeWidth={3} />}
                                                    </div>
                                                    <p className="text-base text-[#374151] leading-tight line-clamp-2 italic">"{addr.address_detail}"</p>
                                                    <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-medium text-[#111827]">
                                                        <Phone size={14}/> {formatPhoneNumber(addr.phone_number)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 🚀 Slide Controls (ปรากฏเมื่อมีมากกว่า 4 ที่อยู่) */}
                                    {totalAddressPages > 1 && (
                                        <div className="flex justify-center items-center gap-6 pt-4 border-t border-slate-50">
                                            <button onClick={() => setAddressPage(p => Math.max(0, p - 1))} disabled={addressPage === 0} className="p-2 bg-white border-2 border-slate-300 rounded-xl text-[#000000] disabled:opacity-20 active:scale-90 transition-all"><ChevronLeft size={20} strokeWidth={3} /></button>
                                            <span className="font-medium text-lg italic uppercase text-[#000000]">Page {addressPage + 1} / {totalAddressPages}</span>
                                            <button onClick={() => setAddressPage(p => Math.min(totalAddressPages - 1, p + 1))} disabled={addressPage === totalAddressPages - 1} className="p-2 bg-white border-2 border-slate-300 rounded-xl text-[#000000] disabled:opacity-20 active:scale-90 transition-all"><ChevronRight size={20} strokeWidth={3} /></button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                    <input name="recipient_name" onChange={(e) => setAddressForm({...addressForm, recipient_name: e.target.value})} placeholder="Recipient Name" className="px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl outline-none text-lg focus:border-[#000000]" />
                                    <input name="phone_number" value={formatPhoneNumber(addressForm.phone_number)} onChange={(e) => setAddressForm({...addressForm, phone_number: e.target.value.replace(/\D/g, '')})} placeholder="Phone Number" className="px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl outline-none text-lg focus:border-[#000000]" />
                                    <textarea name="address_detail" onChange={(e) => setAddressForm({...addressForm, address_detail: e.target.value})} placeholder="Full Shipping Address" rows="3" className="col-span-2 px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl outline-none text-lg focus:border-[#000000] resize-none" />
                                </div>
                            )}
                        </section>

                        {/* 02. Transfer */}
                        <section className="bg-white p-8 rounded-[3rem] border-2 border-slate-300 shadow-sm text-left">
                            <h2 className="text-3xl font-medium italic uppercase text-[#000000] mb-8">02. Transfer Verification</h2>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {paymentMethods.map(m => (
                                    <button key={m.method_id} onClick={() => setSelectedMethod(m)} className={`px-8 py-3 rounded-full text-xs font-medium border-2 transition-all ${selectedMethod?.method_id === m.method_id ? 'bg-[#000000] text-white border-[#000000]' : 'bg-white border-slate-300 text-[#374151]'}`}>{m.bank_name}</button>
                                ))}
                            </div>
                            {selectedMethod && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="bg-[#FDFCFB] p-6 rounded-[2.5rem] border-2 border-slate-300">
                                            <p className="text-[10px] uppercase font-medium tracking-[0.3em] text-[#374151] mb-1">Account Info</p>
                                            <p className="text-xl font-medium text-[#000000] uppercase">{selectedMethod.account_name}</p>
                                            <div className="mt-4 flex items-center justify-between bg-white px-4 py-2 rounded-xl border-2 border-slate-300">
                                                <p className="text-2xl font-medium italic tabular-nums text-[#000000]">{formatBankNumber(selectedMethod.account_number)}</p>
                                                <button onClick={() => copyToClipboard(selectedMethod.account_number)} className="p-2 text-[#000000] hover:bg-slate-100 rounded-lg transition-all"><Copy size={18}/></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`border-4 border-dashed rounded-[3rem] p-6 flex flex-col items-center justify-center relative transition-all border-slate-200 bg-white min-h-[220px]`}>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                        {slipPreview ? (
                                            <div className="relative z-30"><img src={slipPreview} className="w-32 h-44 object-cover rounded-xl border-4 border-slate-300 shadow-md" alt="slip" /><button onClick={() => { setSlipFile(null); setSlipPreview(null); }} className="absolute -top-4 -right-4 bg-white border-2 border-slate-300 rounded-full p-2"><X size={16}/></button></div>
                                        ) : (
                                            <div className="text-center"><Upload className="mx-auto mb-3 text-[#374151]" size={32} /><p className="text-xs font-medium text-[#111827] uppercase italic">Attach Transfer Slip</p></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* --- RIGHT: Summary (5 Cols) --- */}
                    <div className="lg:col-span-5 lg:sticky lg:top-28">
                        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-300 shadow-sm text-left">
                            <h3 className="text-3xl font-medium italic uppercase mb-8 border-b-2 border-slate-300 pb-4 text-[#000000]">Order Summary</h3>
                            <div className="space-y-3 mb-8 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item.product_id} className="flex justify-between items-center gap-4 bg-[#FDFCFB] p-4 rounded-[1.5rem] border border-slate-100">
                                        <div className="flex gap-4 items-center min-w-0">
                                            <div className="w-14 h-14 rounded-xl border-2 border-slate-300 overflow-hidden shrink-0"><img src={item.image_url} className="w-full h-full object-cover" alt="" /></div>
                                            <div className="min-w-0"><p className="text-lg font-medium uppercase truncate italic text-[#111827]">{item.product_name}</p><p className="text-xs font-medium text-[#374151]">QTY: {item.quantity}</p></div>
                                        </div>
                                        <p className="font-medium text-xl italic text-[#000000]">฿{(item.unit_price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-lg font-medium text-[#374151] italic"><span>Subtotal</span><span>฿{subtotal.toLocaleString()}</span></div>
                                <div className="flex justify-between text-lg font-medium text-[#374151] italic"><span>Delivery Fee</span><span>฿{shippingCost.toLocaleString()}</span></div>
                                <div className="border-t-4 border-[#000000] pt-6 flex justify-between items-end">
                                    <div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#374151] mb-1 leading-none">Net Total</p><p className="text-3xl font-medium italic uppercase text-[#000000]">ยอดสุทธิ</p></div>
                                    <p className="text-5xl font-medium tracking-tighter tabular-nums text-[#000000]">฿{totalAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            <button onClick={handleSubmitOrder} className="w-full bg-white text-[#000000] border-2 border-slate-300 py-6 rounded-full font-medium text-xl uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-4 italic active:scale-95 shadow-md">
                                Confirm Payment <Navigation size={24} className="rotate-90" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer userData={userData} />
        </div>
    );
};

export default Checkout;