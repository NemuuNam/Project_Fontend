import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Package, ChevronRight, ChevronLeft, Loader2, MapPin, Calendar, CreditCard,
    Truck, X, ClipboardList, Clock, CheckCircle, Info, ArrowLeft,
    ShoppingBag, Phone, Star, MessageSquare, Sparkles, Leaf, Cookie, Smile,
    RotateCcw, Upload, Heart, Eye, AlertCircle, FileWarning, User, ExternalLink,
    Copy, Landmark, PackageCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

// --- 1. Modal อัปโหลดสลิปใหม่ ---
const ResubmitSlipModal = ({ order, paymentMethods, onClose, onRefresh }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return toast.error("กรุณาแนบสลิปโอนเงินใหม่");
        setUploading(true);
        const load = toast.loading("กำลังอัปเดต...");
        try {
            const formData = new FormData();
            formData.append('slip', file);
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ORDERS}/${order.order_id}/reslip`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.success) {
                toast.success("ส่งหลักฐานใหม่สำเร็จ", { id: load });
                onRefresh(); onClose();
            }
        } catch (err) { toast.error("อัปโหลดล้มเหลว", { id: load }); } 
        finally { setUploading(false); }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/30 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] w-full max-w-lg shadow-2xl border-4 border-[#2D241E] animate-in zoom-in-95 overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-slate-50 text-[#2D241E] rounded-full border-2 border-[#2D241E] hover:text-red-500 transition-all z-30"><X size={20} strokeWidth={3} /></button>
                <div className="p-6 md:p-10 text-left space-y-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-[#2D241E] uppercase italic">Resubmit Slip</h3>
                        <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mt-1">Order ID: #{order.order_id}</p>
                    </div>
                    <div className="p-4 bg-red-50 border-2 border-red-600 rounded-2xl flex items-start gap-3 italic">
                        <FileWarning size={20} className="text-red-600 shrink-0" strokeWidth={3} />
                        <p className="text-sm font-black text-[#2D241E] leading-relaxed">{order.rejection_reason}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="relative border-4 border-dashed border-[#2D241E]/10 rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center bg-slate-50 group">
                            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={(e) => { const f = e.target.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
                            {preview ? (
                                <img src={preview} className="w-24 h-36 md:w-32 md:h-44 object-cover rounded-xl shadow-lg border-2 border-white mx-auto z-10" alt="Preview" />
                            ) : (
                                <div className="text-center space-y-2 text-[#2D241E] opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Upload size={32} className="mx-auto" strokeWidth={3} />
                                    <p className="text-[10px] font-black uppercase">Click to select new slip</p>
                                </div>
                            )}
                        </div>
                        <button onClick={handleUpload} disabled={uploading || !file} className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 italic">
                            Confirm Resubmission
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. Modal รีวิวสินค้า ---
const ReviewModal = ({ order, onClose, onSubmit, isSubmitting }) => {
    const [selectedProduct, setSelectedProduct] = useState(order.items?.[0] || null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/30 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] w-full max-w-lg p-6 md:p-10 shadow-2xl border-4 border-[#2D241E] animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-slate-50 text-[#2D241E] rounded-full border-2 border-[#2D241E] hover:text-red-500 transition-all z-30"><X size={20} strokeWidth={3} /></button>
                <div className="text-left space-y-6">
                    <h2 className="text-xl md:text-2xl font-black text-[#2D241E] uppercase tracking-tighter italic">Product Review</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {order.items?.map((item) => (
                            <button key={item.product_id} onClick={() => setSelectedProduct(item)} className={`flex-shrink-0 p-2 rounded-xl border-2 transition-all ${selectedProduct?.product_id === item.product_id ? 'border-[#2D241E] bg-slate-50' : 'border-slate-100'}`}>
                                <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-center gap-2 py-2 md:py-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setRating(star)} className="hover:scale-110 transition-transform">
                                <Star size={28} md:size={32} strokeWidth={3} fill={star <= rating ? "#2D241E" : "none"} className={star <= rating ? "text-[#2D241E]" : "text-slate-200"} />
                            </button>
                        ))}
                    </div>
                    <textarea className="w-full p-4 md:p-5 bg-slate-50 border-2 border-[#2D241E]/10 focus:border-[#2D241E] rounded-2xl outline-none h-24 font-black text-sm italic transition-all text-[#2D241E]" placeholder="Tell us about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
                    <button onClick={() => onSubmit(selectedProduct.product_id, rating, comment)} disabled={isSubmitting || !selectedProduct} className="w-full py-4 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest shadow-xl active:scale-95 italic">
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. ส่วนหลัก ---
const MyOrders = ({ userData }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isResubmitOpen, setIsResubmitOpen] = useState(false);
    const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [ordersRes, paymentsRes] = await Promise.all([
                axiosInstance.get(`${API_ENDPOINTS.ORDERS}/my-orders`),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`)
            ]);
            if (ordersRes.success) setOrders(ordersRes.data);
            if (paymentsRes.success) setPaymentMethods(paymentsRes.data);
        } catch (err) { toast.error("ดึงข้อมูลล้มเหลว"); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
    const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusStyle = (status) => {
        const styles = {
            'สำเร็จ': "bg-green-50 text-green-600 border-green-600",
            'กำลังจัดส่ง': "bg-blue-50 text-blue-600 border-blue-600",
            'รอตรวจสอบชำระเงิน': "bg-orange-50 text-orange-600 border-orange-600",
            'รอแก้ไขสลิป': "bg-red-50 text-red-600 border-red-600 animate-pulse",
            'ยกเลิก': "bg-slate-50 text-slate-500 border-slate-400"
        };
        return styles[status] || 'bg-gray-50 text-gray-600 border-gray-400';
    };

    const handleOpenReview = (order) => { setSelectedOrderForAction(order); setIsReviewOpen(true); };
    const handleOpenResubmit = (order) => { setSelectedOrderForAction(order); setIsResubmitOpen(true); };

    const handleSubmitReview = async (productId, score, comment) => {
        setReviewSubmitting(true);
        try {
            const res = await axiosInstance.post('/api/reviews', { product_id: productId, rating_score: score, comment: comment });
            if (res.success) { toast.success("ส่งรีวิวสำเร็จ!"); setIsReviewOpen(false); }
        } catch (err) { toast.error("ส่งรีวิวไม่สำเร็จ"); } 
        finally { setReviewSubmitting(false); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="min-h-screen bg-white font-['Kanit'] text-[#2D241E] selection:bg-[#F3E9DC] relative overflow-x-hidden">
            <Toaster position="top-right" />
            <HeaderHome userData={userData} />

            <main className="max-w-[1400px] mx-auto pt-24 md:pt-40 pb-24 px-4 md:px-6 relative z-10 text-left">
                
                {/* 🏷️ Page Header */}
                <div className="mb-8 md:mb-12 space-y-4 px-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                        <Sparkles size={14} className="text-white" strokeWidth={3} />
                        <span className="text-xs font-black uppercase tracking-widest text-white">Member Records</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-[#2D241E] italic leading-none">OrderHistory</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
                    {/* 👤 Sidebar Navigation */}
                    <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-32">
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-[#2D241E] shadow-2xl text-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#2D241E] text-white rounded-[1.5rem] md:rounded-[1.8rem] flex items-center justify-center shadow-xl mx-auto mb-4 md:mb-6 font-black text-2xl md:text-3xl italic">
                                {userData?.first_name?.charAt(0)}
                            </div>
                            <h3 className="font-black text-lg md:text-xl uppercase italic text-[#2D241E]">{userData?.first_name} {userData?.last_name}</h3>
                            <nav className="mt-8 md:mt-10 space-y-2 md:space-y-3">
                                <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 rounded-2xl transition-all group font-black text-xs md:text-sm uppercase italic text-[#2D241E] border-2 border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4"><User size={18} strokeWidth={3} /> Profile</div> <ChevronRight size={14} strokeWidth={3}/>
                                </button>
                                <button className="w-full flex items-center justify-between p-4 md:p-5 bg-slate-50 border-2 border-[#2D241E] rounded-2xl font-black text-xs md:text-sm uppercase italic text-[#2D241E]">
                                    <div className="flex items-center gap-4"><Package size={18} strokeWidth={3} /> My Orders</div> <ChevronRight size={14} strokeWidth={3}/>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* 📦 Order Cards List */}
                    <div className="lg:col-span-9 space-y-4 md:space-y-6">
                        {paginatedOrders.map(order => (
                            <div key={order.order_id} className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-xl hover:border-[#2D241E] transition-all group overflow-hidden">
                                <div className="flex flex-col xl:flex-row justify-between gap-6 md:gap-8">
                                    <div className="flex-1 space-y-4 md:space-y-6 text-left">
                                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                            <span className="font-black text-xl md:text-2xl uppercase tracking-tighter italic text-[#2D241E]">#{order.order_id.substring(0,10)}</span>
                                            <span className={`px-4 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider border-2 shadow-sm ${getStatusStyle(order.status)}`}>{order.status}</span>
                                            <span className="text-[9px] md:text-[10px] font-black uppercase text-[#2D241E] flex items-center gap-2 italic"><Calendar size={12} strokeWidth={3}/> {new Date(order.created_at).toLocaleDateString('th-TH')}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm bg-white group-hover:scale-105 transition-transform duration-500">
                                                    <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-row xl:flex-col justify-between items-center xl:items-end gap-4 border-t xl:border-t-0 xl:border-l-2 border-slate-50 pt-4 xl:pt-0 xl:pl-10 min-w-full xl:min-w-[250px]">
                                        <div className="text-left xl:text-right">
                                            <p className="text-[9px] md:text-[10px] font-black uppercase text-[#2D241E] mb-1 tracking-widest opacity-40">Net Amount</p>
                                            <p className="text-2xl md:text-4xl font-black italic text-[#2D241E]">฿{Number(order.total_amount).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setSelectedOrder(order)} className="p-2.5 md:p-3 bg-slate-50 border-2 border-[#2D241E] rounded-xl md:rounded-2xl hover:bg-[#2D241E] hover:text-white transition-all shadow-sm text-[#2D241E]"><Eye size={18} strokeWidth={3}/></button>
                                            {order.status === 'รอแก้ไขสลิป' && (
                                                <button onClick={() => handleOpenResubmit(order)} className="px-4 md:px-6 py-2.5 md:py-3 bg-red-600 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase shadow-lg animate-pulse italic">Fix Payment</button>
                                            )}
                                            {order.status === 'สำเร็จ' && (
                                                <button onClick={() => handleOpenReview(order)} className="px-4 md:px-6 py-2.5 md:py-3 bg-[#2D241E] text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase shadow-lg italic hover:bg-black transition-all">Review Menu</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {orders.length === 0 && (
                            <div className="text-center py-24 md:py-40 bg-slate-50 rounded-[3rem] md:rounded-[4rem] border-4 border-dashed border-slate-100">
                                <ShoppingBag size={60} md:size={80} strokeWidth={1} className="mx-auto text-[#2D241E] opacity-10 mb-6" />
                                <h2 className="text-xl md:text-2xl font-black uppercase text-[#2D241E] italic opacity-20">Your order history is empty</h2>
                                <button onClick={() => navigate('/products')} className="mt-8 px-10 md:px-12 py-4 md:py-5 bg-[#2D241E] text-white rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl active:scale-95 italic">Shop Now</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 md:gap-5 pt-16 md:pt-20">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2.5 md:p-3 border-4 border-[#2D241E] rounded-xl md:rounded-2xl disabled:opacity-20 active:scale-90 shadow-lg text-[#2D241E]"><ChevronLeft size={20} md:size={24} strokeWidth={4} /></button>
                        <span className="font-black text-base md:text-lg italic text-[#2D241E]">Page {currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 md:p-3 border-4 border-[#2D241E] rounded-xl md:rounded-2xl disabled:opacity-20 active:scale-90 shadow-lg text-[#2D241E]"><ChevronRight size={20} md:size={24} strokeWidth={4} /></button>
                    </div>
                )}
            </main>

            {/* --- 📝 Order Detail Modal (Responsive & Optimized) --- */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[1500] flex items-center justify-center p-2 md:p-4 lg:p-10 bg-[#2D241E]/40 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-6xl shadow-2xl border-4 border-[#2D241E] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 h-full max-h-[95vh] md:max-h-[90vh] text-left relative" onClick={e => e.stopPropagation()}>
                        
                        {/* Left Side: Product Details (Scrollable) */}
                        <div className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto custom-scrollbar border-b-2 md:border-b-0 md:border-r-2 border-slate-50">
                            <div className="flex justify-between items-start mb-8 md:mb-10">
                                <div className="space-y-2">
                                    <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-[#2D241E]">Order Info</h2>
                                    <span className={`inline-flex px-4 py-1 rounded-full text-[10px] font-black uppercase border-2 shadow-sm ${getStatusStyle(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-50 text-[#2D241E] border-2 border-[#2D241E] rounded-full hover:text-red-500 transition-all"><X size={20} md:size={24} strokeWidth={3}/></button>
                            </div>

                            <div className="bg-slate-50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-2 border-[#2D241E]/5 mb-8 md:mb-12 shadow-inner">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E] mb-2 opacity-50">Logistics Tracking</p>
                                <p className="text-2xl md:text-3xl font-black italic text-[#2D241E] uppercase tracking-tighter">
                                    {selectedOrder.tracking_number || 'Preparing your box...'}
                                </p>
                            </div>

                            <div className="space-y-6 md:space-y-8">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] border-b-4 border-[#2D241E]/5 pb-3 text-[#2D241E]">Box Contents</h4>
                                {selectedOrder.items?.map(item => (
                                    <div key={item.item_id} className="flex items-center justify-between group gap-4">
                                        <div className="flex items-center gap-4 md:gap-8">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0">
                                                <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div>
                                                <p className="font-black text-lg md:text-xl uppercase leading-tight italic text-[#2D241E]">{item.product?.product_name}</p>
                                                <p className="text-[10px] md:text-[11px] font-black text-[#8B7E66] mt-2 md:mt-3 uppercase tracking-widest italic">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-xl md:text-2xl text-[#2D241E] italic tracking-tighter whitespace-nowrap">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Sidebar: Summary (Scrollable on Mobile) */}
                        <div className="w-full md:w-[380px] lg:w-[420px] bg-[#FAFAFA] flex flex-col p-6 md:p-10 lg:p-14 overflow-y-auto custom-scrollbar border-t-2 md:border-t-0 border-slate-50">
                            <div className="space-y-4 md:space-y-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E] ml-2">Destination</p>
                                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-[#2D241E]/5 shadow-xl relative overflow-hidden">
                                    <MapPin className="absolute -right-4 -bottom-4 text-[#2D241E] opacity-[0.03] rotate-12" size={80} md:size={100} />
                                    <p className="font-black text-lg md:text-xl italic text-[#2D241E] uppercase leading-tight">{selectedOrder.address?.recipient_name}</p>
                                    <p className="text-xs md:text-sm font-bold text-[#2D241E] italic mt-2 md:mt-3 leading-relaxed opacity-70">"{selectedOrder.address?.address_detail}"</p>
                                    <div className="flex items-center gap-3 text-[10px] md:text-xs font-black mt-6 md:mt-8 text-[#2D241E] uppercase tracking-widest bg-slate-50 w-fit px-4 py-2 rounded-xl">
                                        <Phone size={14} strokeWidth={3}/> {selectedOrder.address?.phone_number}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 md:pt-10 border-t-4 border-[#2D241E]/5 space-y-4 md:space-y-5 mt-8 md:mt-auto">
                                <div className="flex justify-between font-black text-sm uppercase text-[#2D241E] tracking-widest">
                                    <span>Subtotal</span>
                                    <span>฿{(Number(selectedOrder.total_amount) - Number(selectedOrder.shipping_cost)).toLocaleString()}</span>
                                </div>
                                {/* ปรับขนาดตัวอักษรค่าส่งที่นี่ (text-sm) */}
                                <div className="flex justify-between font-black text-sm uppercase text-[#2D241E] tracking-widest">
                                    <span>Shipping</span>
                                    <span className="italic">{Number(selectedOrder.shipping_cost) > 0 ? `฿${selectedOrder.shipping_cost}` : 'Free'}</span>
                                </div>
                                <div className="flex justify-between items-end pt-6 md:pt-8 border-t-4 border-[#2D241E] mt-4">
                                    <span className="text-xl md:text-2xl font-black italic text-[#2D241E]">PAYMENT</span>
                                    <span className="text-3xl md:text-4xl font-black italic text-[#2D241E] tracking-tighter">฿{Number(selectedOrder.total_amount).toLocaleString()}</span>
                                </div>
                                {/* ปรับ Padding ปุ่ม py-3.5 และ mt-4 */}
                                <button 
                                    onClick={() => setSelectedOrder(null)} 
                                    className="w-full mt-4 py-3.5 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all italic active:scale-95"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer userData={userData} />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-bounce-slow { animation: bounce-slow 4s infinite; }
            `}} />
        </div>
    );
};

export default MyOrders;