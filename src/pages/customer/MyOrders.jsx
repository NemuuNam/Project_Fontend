import React, { useState, useEffect, useCallback } from 'react';
import {
    Package, ChevronRight, ChevronLeft, Loader2, MapPin, Calendar,
    X, ShoppingBag, Phone, Sparkles, Eye, FileWarning, User, Truck, Star, Send, Upload, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

// --- มาตรฐานสถานะ (Status Badges) - ทึบ 100% ---
const getStatusStyle = (status) => {
    const base = "px-3 py-0.5 rounded-full text-lg font-medium border-2 whitespace-nowrap ";
    const styles = {
        'สำเร็จ': base + "bg-white text-green-700 border-green-700",
        'กำลังจัดส่ง': base + "bg-white text-blue-700 border-blue-700",
        'รอตรวจสอบชำระเงิน': base + "bg-white text-orange-700 border-orange-700",
        'รอแก้ไขสลิป': base + "bg-white text-red-700 border-red-700",
        'ยกเลิก': base + "bg-white text-gray-500 border-gray-500"
    };
    return styles[status] || base + "bg-white text-[#374151] border-slate-300";
};

// --- 1. Modal อัปโหลดสลิปใหม่ ---
const ResubmitSlipModal = ({ order, onClose, onRefresh }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return toast.error("กรุณาแนบสลิปโอนเงินใหม่");
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('slip', file);
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ORDERS}/${order.order_id}/reslip`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.success) { toast.success("ส่งหลักฐานใหม่สำเร็จ"); onRefresh(); onClose(); }
        } catch (err) { toast.error("อัปโหลดล้มเหลว"); } 
        finally { setUploading(false); }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-500/20 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#FDFCFB] rounded-[3rem] w-full max-w-lg shadow-2xl border-2 border-slate-300 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white text-[#000000] rounded-full border-2 border-slate-300 hover:bg-slate-50 transition-all"><X size={20} strokeWidth={3} /></button>
                <div className="p-8 space-y-6 text-left">
                    <h3 className="text-2xl font-medium text-[#000000] uppercase italic">Fix Payment</h3>
                    <div className="p-4 bg-white border-2 border-red-700 rounded-[2rem] flex gap-3 text-red-700 italic">
                        <FileWarning size={24}/> <p>{order.rejection_reason}</p>
                    </div>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-[2rem] p-6 flex flex-col items-center bg-white">
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
                        {preview ? <img src={preview} className="w-24 h-36 object-cover rounded-xl border-2 border-slate-300" alt="" /> : 
                        <div className="text-center text-[#374151]"><Upload size={32} className="mx-auto mb-2" /><p className="text-sm font-medium uppercase">Select Slip</p></div>}
                    </div>
                    <button onClick={handleUpload} disabled={uploading} className="w-full py-4 bg-white border-2 border-slate-300 text-[#000000] rounded-full font-medium uppercase italic shadow-sm hover:bg-slate-50">Confirm submission</button>
                </div>
            </div>
        </div>
    );
};

// --- 2. Modal รีวิวสินค้า (Golden Stars & Logic) ---
const ReviewModal = ({ order, onClose, onRefresh }) => {
    const [selectedProduct, setSelectedProduct] = useState(order.items?.[0] || null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedProduct) return toast.error("กรุณาเลือกสินค้า");
        setIsSubmitting(true);
        try {
            const res = await axiosInstance.post('/api/reviews', {
                product_id: selectedProduct.product_id,
                rating_score: rating,
                comment: comment,
                order_id: order.order_id // ส่ง Order ID ไปอัปเดตสถานะการรีวิว
            });
            if (res.success) { 
                toast.success("ขอบคุณสำหรับรีวิวครับ"); 
                onRefresh(); // รีเฟรชหน้าเพื่อล็อคปุ่มรีวิว
                onClose(); 
            }
        } catch (err) { toast.error("ไม่สามารถบันทึกรีวิวได้"); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-500/20 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#FDFCFB] rounded-[3rem] w-full max-w-xl shadow-2xl border-2 border-slate-300 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white text-[#000000] rounded-full border-2 border-slate-300 hover:bg-slate-50"><X size={20} strokeWidth={3} /></button>
                <div className="p-10 space-y-6 text-left">
                    <h3 className="text-3xl font-medium text-[#000000] uppercase italic">Product Review</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {order.items?.map((item) => (
                            <button key={item.product_id} onClick={() => setSelectedProduct(item)} className={`flex-shrink-0 p-1 rounded-2xl border-2 transition-all ${selectedProduct?.product_id === item.product_id ? 'border-[#000000]' : 'border-slate-100 opacity-50'}`}>
                                <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-14 h-14 rounded-xl object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                    {/* 🚀 เปลี่ยนดาวเป็นสีเหลืองทอง (#FACC15) */}
                    <div className="flex justify-center gap-3 py-4 border-y-2 border-slate-50">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setRating(star)} className="hover:scale-110 transition-transform">
                                <Star 
                                    size={40} 
                                    fill={star <= rating ? "#FACC15" : "none"} 
                                    className={star <= rating ? "text-[#EAB308]" : "text-slate-200"} 
                                />
                            </button>
                        ))}
                    </div>
                    <textarea className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl outline-none h-28 font-medium italic text-[#111827]" placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-white border-2 border-slate-300 text-[#000000] rounded-full font-medium uppercase italic shadow-md hover:bg-slate-50 flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Review</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. Main Component ---
const MyOrders = ({ userData }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isResubmitOpen, setIsResubmitOpen] = useState(false);
    const [orderForAction, setOrderForAction] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const ordersRes = await axiosInstance.get(`${API_ENDPOINTS.ORDERS}/my-orders`);
            if (ordersRes.success) setOrders(ordersRes.data);
        } catch (err) { toast.error("ดึงข้อมูลล้มเหลว"); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-[#000000]" size={48} /></div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] relative overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            <main className="max-w-[1400px] mx-auto pt-12 pb-10 px-8 text-left">
                <div className="mb-6 space-y-2 text-left">
                    <h1 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter text-[#000000] italic leading-none">Order Records</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-28">
                        <div className="bg-white p-5 rounded-[2.5rem] border-2 border-slate-300 text-center shadow-sm">
                            <div className="w-14 h-14 bg-[#FDFCFB] text-[#000000] border-2 border-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-3 font-medium text-2xl italic">
                                {userData?.first_name?.charAt(0)}
                            </div>
                            <h3 className="font-medium text-xl uppercase italic text-[#000000]">{userData?.first_name}</h3>
                            <nav className="mt-6 space-y-1.5 text-left">
                                <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-3.5 bg-white border-2 border-slate-100 rounded-xl transition-all hover:border-slate-300 font-medium text-xs uppercase italic text-[#111827]">
                                    <div className="flex items-center gap-3"><User size={16} /> Profile</div> <ChevronRight size={14}/>
                                </button>
                                <button className="w-full flex items-center justify-between p-3.5 bg-[#FDFCFB] border-2 border-[#000000] rounded-xl font-medium text-xs uppercase italic text-[#000000]">
                                    <div className="flex items-center gap-3"><Package size={16} /> My Orders</div> <ChevronRight size={14}/>
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="lg:col-span-9 space-y-3">
                        {paginatedOrders.map(order => (
                            <div key={order.order_id} className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-300 shadow-sm transition-all hover:bg-[#FDFCFB]">
                                <div className="flex flex-col xl:flex-row justify-between gap-4">
                                    <div className="flex-1 space-y-3 text-left">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="font-medium text-2xl uppercase tracking-tighter italic text-[#000000]">#{order.order_id}</span>
                                            <span className={getStatusStyle(order.status)}>{order.status}</span>
                                            <span className="text-base font-medium text-[#374151] flex items-center gap-2 italic"><Calendar size={16}/> {new Date(order.created_at).toLocaleDateString('th-TH')}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 border-t-2 border-slate-50 pt-3">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-200 bg-[#FDFCFB] p-0.5 shadow-sm">
                                                    <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover rounded-lg" alt="" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-row xl:flex-col justify-between items-end border-t xl:border-t-0 xl:border-l-2 border-slate-100 pt-3 xl:pt-0 xl:pl-6 min-w-full xl:min-w-[280px]">
                                        <div className="text-right">
                                            <p className="text-[10px] font-medium uppercase text-[#374151] mb-0.5 tracking-widest">Total Amount</p>
                                            <p className="text-3xl font-medium italic text-[#000000]">฿{Number(order.total_amount).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {order.status === 'รอแก้ไขสลิป' && (
                                                <button onClick={() => { setOrderForAction(order); setIsResubmitOpen(true); }} className="px-4 py-2 bg-white border-2 border-red-700 text-red-700 rounded-xl font-medium text-xs uppercase italic hover:bg-red-50 shadow-sm">Fix Payment</button>
                                            )}
                                            {/* 🚀 Logic ตรวจสอบการรีวิว: ถ้ามี order.is_reviewed เป็น true จะแสดง 'Reviewed' และกดไม่ได้ */}
                                            {order.status === 'สำเร็จ' && (
                                                order.is_reviewed ? (
                                                    <span className="px-4 py-2 bg-slate-50 text-slate-400 border-2 border-slate-100 rounded-xl font-medium text-xs uppercase italic flex items-center gap-2">
                                                        <CheckCircle2 size={14} /> Reviewed
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => { setOrderForAction(order); setIsReviewOpen(true); }} 
                                                        className="px-4 py-2 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 text-[#000000] font-medium text-xs uppercase italic shadow-sm flex items-center gap-2"
                                                    >
                                                        <Star size={14} className="fill-[#FACC15] text-[#EAB308]" /> Review
                                                    </button>
                                                )
                                            )}
                                            <button onClick={() => setSelectedOrder(order)} className="px-5 py-2 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all text-[#000000] font-medium text-xs uppercase italic shadow-sm">Details</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-6">
                                <button onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo(0, 0); }} disabled={currentPage === 1} className="p-2.5 bg-white border-2 border-slate-300 rounded-xl text-[#000000] disabled:bg-slate-50 shadow-sm"><ChevronLeft size={20} strokeWidth={3} /></button>
                                <span className="font-medium text-xl italic text-[#000000]">Page {currentPage} / {totalPages}</span>
                                <button onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo(0, 0); }} disabled={currentPage === totalPages} className="p-2.5 bg-white border-2 border-slate-300 rounded-xl text-[#000000] disabled:bg-slate-50 shadow-sm"><ChevronRight size={20} strokeWidth={3} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- Modals: Selected Order Details --- */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-slate-500/20 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-[#FDFCFB] rounded-[3rem] w-full max-w-5xl shadow-2xl border-2 border-slate-300 flex flex-col md:flex-row overflow-hidden max-h-[90vh] text-left relative" onClick={e => e.stopPropagation()}>
                        <div className="flex-1 p-8 overflow-y-auto border-r-2 border-slate-300 bg-white">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1"><h2 className="text-4xl font-medium uppercase italic text-[#000000]">Order Summary</h2><span className={getStatusStyle(selectedOrder.status)}>{selectedOrder.status}</span></div>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white text-[#000000] border-2 border-slate-300 rounded-full hover:bg-slate-50 shadow-sm"><X size={20} strokeWidth={3}/></button>
                            </div>
                            <div className="bg-[#FDFCFB] rounded-2xl p-5 border-2 border-slate-200 mb-6 shadow-inner">
                                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#374151] mb-1">Full Order ID</p>
                                <p className="text-xl font-medium italic text-[#000000] tracking-tight">{selectedOrder.order_id}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] border-b-2 border-slate-300 pb-1.5 text-[#000000]">Box Contents</h4>
                                {selectedOrder.items?.map(item => (
                                    <div key={item.item_id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl border-2 border-slate-300 overflow-hidden bg-[#FDFCFB] p-0.5"><img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt="" /></div>
                                            <div className="text-left"><p className="font-medium text-lg uppercase italic text-[#000000]">{item.product?.product_name}</p><p className="text-xs font-medium text-[#374151] uppercase italic">Qty: {item.quantity}</p></div>
                                        </div>
                                        <p className="font-medium text-xl text-[#000000] italic">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-[380px] bg-white flex flex-col p-8 overflow-y-auto border-l-2 border-slate-50 text-left">
                            <div className="space-y-4 mb-6">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-[#374151] border-b border-slate-300 pb-1">Logistics</p>
                                <div className="p-5 bg-[#FDFCFB] border-2 border-slate-300 rounded-2xl shadow-inner space-y-3">
                                    <div><p className="text-[9px] font-medium uppercase text-[#374151] mb-1">Provider</p><p className="text-xl font-medium italic text-[#000000] uppercase">{selectedOrder.shippings?.[0]?.provider?.provider_name || 'PENDING'}</p></div>
                                    <div className="pt-2 border-t border-slate-200"><p className="text-[9px] font-medium uppercase text-[#374151] mb-1">Tracking</p><p className="text-xl font-medium italic text-[#000000] uppercase tracking-wider">{selectedOrder.tracking_number || 'PENDING'}</p></div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="font-medium text-xl italic text-[#000000] uppercase tracking-tighter">{selectedOrder.address?.recipient_name}</p>
                                    <p className="text-sm text-[#111827] leading-relaxed italic">{selectedOrder.address?.address_detail}</p>
                                    <p className="text-sm font-medium text-[#000000] flex items-center gap-3 mt-4 bg-[#FDFCFB] p-2.5 rounded-xl border-2 border-slate-100"><Phone size={14} strokeWidth={3}/> {selectedOrder.address?.phone_number}</p>
                                </div>
                            </div>
                            <div className="mt-auto space-y-3 border-t-4 border-slate-300 pt-5 text-left">
                                <div className="flex justify-between font-medium text-base uppercase text-[#374151]"><span>Subtotal</span><span className="text-[#111827]">฿{(Number(selectedOrder.total_amount) - Number(selectedOrder.shipping_cost)).toLocaleString()}</span></div>
                                <div className="flex justify-between font-medium text-base uppercase text-[#374151]"><span>Delivery</span><span className="text-[#111827]">{Number(selectedOrder.shipping_cost) > 0 ? `฿${selectedOrder.shipping_cost}` : 'FREE'}</span></div>
                                <div className="flex justify-between items-end pt-4 border-t-4 border-[#000000]"><span className="text-xl font-medium italic text-[#000000]">TOTAL</span><span className="text-4xl font-medium italic text-[#000000] tracking-tighter">฿{Number(selectedOrder.total_amount).toLocaleString()}</span></div>
                                <button onClick={() => setSelectedOrder(null)} className="w-full mt-4 py-3 bg-white border-2 border-slate-300 text-[#000000] rounded-full font-medium uppercase tracking-widest hover:bg-slate-50 active:scale-95 shadow-sm italic">Close Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isResubmitOpen && <ResubmitSlipModal order={orderForAction} onClose={() => setIsResubmitOpen(false)} onRefresh={fetchData} />}
            {isReviewOpen && <ReviewModal order={orderForAction} onClose={() => setIsReviewOpen(false)} onRefresh={fetchData} />}

            <Footer userData={userData} />
        </div>
    );
};

export default MyOrders;