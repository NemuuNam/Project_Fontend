import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Package, ChevronRight, ChevronLeft, Loader2, MapPin, Calendar, CreditCard, 
    Truck, X, ClipboardList, Clock, CheckCircle, Info, ArrowLeft, 
    ShoppingBag, Phone, Star, MessageSquare, Sparkles, Leaf, Cookie, Smile,
    RotateCcw, Upload, Heart, Eye, AlertCircle, FileWarning, User, ExternalLink,
    Copy, Landmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';
import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

// --- 1. ส่วนประกอบย่อย: Modal อัปโหลดสลิปใหม่ (สไตล์ Pearl White) ---
const ResubmitSlipModal = ({ order, paymentMethods, onClose, onRefresh }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const selectedMethod = useMemo(() => {
        return paymentMethods.find(m => m.method_id === order.payment_method_id) || paymentMethods[0];
    }, [paymentMethods, order.payment_method_id]);

    const formatBankNumber = (num) => {
        if (!num) return '';
        const cleaned = num.toString().replace(/\D/g, '');
        return cleaned.length === 10 
            ? `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
            : cleaned.replace(/(.{4})/g, '$1 ').trim();
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("คัดลอกเลขบัญชีแล้ว", { style: { borderRadius: '15px', background: '#2D241E', color: '#fff' } });
    };

    const handleUpload = async () => {
        if (!file) return toast.error("กรุณาแนบสลิปโอนเงินใหม่");
        setUploading(true);
        const load = toast.loading("กำลังอัปเดตข้อมูลการชำระเงิน...");
        try {
            const formData = new FormData();
            formData.append('slip', file);
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ORDERS}/${order.order_id}/reslip`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.success) {
                toast.success("ส่งหลักฐานใหม่เรียบร้อยแล้ว", { id: load });
                onRefresh();
                onClose();
            }
        } catch (err) {
            toast.error("อัปโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง", { id: load });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/10 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#fff] rounded-[2.5rem] w-full max-w-2xl shadow-xl border border-slate-100 animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-[#fff]">
                    <div className="text-left">
                        <h3 className="text-2xl font-black text-[#2D241E]">แก้ไขหลักฐานการโอน</h3>
                        <p className="text-[10px] font-bold text-[#2D241E]/40 uppercase tracking-widest mt-1">รายการสั่งซื้อ: #{order.order_id}</p>
                    </div>
                    <button onClick={onClose} className="p-3 text-[#2D241E] hover:bg-slate-50 rounded-full transition-all border border-slate-100 shadow-sm"><X size={20}/></button>
                </div>
                <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-10 text-left bg-[#fff] relative">
                    {/* Cozy Pattern */}
                    <Landmark className="absolute top-10 right-10 opacity-[0.03] text-[#2D241E]" size={120} />
                    
                    {order.rejection_reason && (
                        <div className="p-6 bg-[#fff] rounded-[2rem] border border-red-100 flex items-center gap-5">
                            <div className="p-4 bg-red-50 text-red-500 rounded-2xl shrink-0"><FileWarning size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">เหตุผลที่ต้องแก้ไข</p>
                                <p className="text-md font-bold text-[#2D241E]">"{order.rejection_reason}"</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.4em] ml-2">บัญชีปลายทาง</label>
                        <div className="bg-[#fff] p-8 md:p-10 rounded-[2.5rem] text-[#2D241E] border border-slate-100 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 text-center md:text-left">
                                <div>
                                    <p className="text-[9px] font-black text-[#2D241E]/30 uppercase tracking-[0.4em] mb-2">{selectedMethod?.bank_name}</p>
                                    <p className="text-xl font-bold italic">{selectedMethod?.account_name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-2xl md:text-3xl font-black tracking-widest text-[#2D241E]">{formatBankNumber(selectedMethod?.account_number)}</p>
                                    <button onClick={() => copyToClipboard(selectedMethod?.account_number)} className="p-3 bg-[#fff] border border-slate-100 hover:bg-slate-50 rounded-xl transition-all text-[#2D241E]"><Copy size={18}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.4em] ml-2">อัปโหลดสลิปใหม่</label>
                        <div className={`relative border-2 border-dashed rounded-[3rem] p-10 flex flex-col items-center justify-center transition-all duration-500 group ${preview ? 'border-green-200 bg-white' : 'border-slate-100 bg-[#fff] hover:border-[#2D241E]/20'}`}>
                            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={(e) => { const f = e.target.files[0]; if(f){ setFile(f); setPreview(URL.createObjectURL(f)); }}} />
                            {preview ? (
                                <div className="relative z-30 text-center">
                                    <img src={preview} className="w-52 h-72 object-cover rounded-[2rem] shadow-lg border-4 border-white mx-auto" alt="สลิปใหม่" />
                                    <button onClick={(e) => {e.stopPropagation(); setFile(null); setPreview(null);}} className="absolute -top-4 -right-4 bg-white text-red-500 rounded-full p-4 shadow-md border border-slate-50 hover:scale-110 transition-all"><X size={18}/></button>
                                </div>
                            ) : (
                                <div className="text-center pointer-events-none py-10">
                                    <div className="w-20 h-20 bg-[#fff] border border-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-[#2D241E]/20"><Upload size={32} /></div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[#2D241E]">เลือกไฟล์รูปภาพหลักฐานใหม่</p>
                                    <p className="text-[#2D241E]/30 text-[9px] font-bold italic tracking-widest mt-2">รองรับไฟล์ JPG, PNG</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-[#fff] border-t border-slate-50">
                    <button onClick={handleUpload} disabled={uploading || !file} className="w-full py-6 bg-[#fff] text-[#2D241E] border border-[#2D241E] rounded-full font-black uppercase tracking-[0.4em] text-xs shadow-sm hover:bg-[#2D241E] hover:text-[#fff] transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#2D241E]">
                        {uploading ? <Loader2 className="animate-spin mx-auto" /> : "ยืนยันการส่งหลักฐานใหม่"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 2. ส่วนประกอบย่อย: Modal รีวิวสินค้า (สไตล์ Pearl White) ---
const ReviewModal = ({ order, onClose, onSubmit, isSubmitting }) => {
    const [selectedProduct, setSelectedProduct] = useState(order.items?.[0] || null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/10 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#fff] rounded-[2.5rem] w-full max-w-2xl p-10 md:p-14 shadow-xl relative animate-in zoom-in-95 border border-slate-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-10 right-10 p-3 bg-[#fff] text-[#2D241E]/30 hover:text-[#2D241E] rounded-full transition-all border border-slate-100 shadow-sm"><X size={20} /></button>
                
                {/* Cozy Pattern */}
                <Smile className="absolute -bottom-10 -right-10 opacity-[0.03] text-[#2D241E]" size={200} />

                <div className="mb-10 text-left">
                    <p className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.5em] mb-2">บอกความรู้สึกของคุณ</p>
                    <h2 className="text-4xl font-black text-[#2D241E] uppercase tracking-tighter italic">เขียนรีวิว <span className="text-[#2D241E]/30 font-light">สินค้า</span></h2>
                </div>
                <div className="space-y-8 text-left relative z-10">
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {order.items?.map((item) => (
                            <button key={item.product_id} onClick={() => setSelectedProduct(item)} 
                                className={`flex-shrink-0 p-3 rounded-2xl border transition-all flex items-center gap-3 ${selectedProduct?.product_id === item.product_id ? 'border-[#2D241E] bg-slate-50' : 'border-slate-100 bg-white'}`}
                            >
                                <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm" alt="" />
                                <span className="font-bold text-[10px] uppercase text-[#2D241E]">{item.product?.product_name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="text-center py-10 bg-[#fff] rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90 hover:scale-110">
                                    <Star size={44} fill={star <= rating ? "#2D241E" : "none"} className={star <= rating ? "text-[#2D241E]" : "text-slate-100"} strokeWidth={star <= rating ? 0 : 2} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea className="w-full p-8 bg-[#fff] border border-slate-100 rounded-[2rem] outline-none h-32 resize-none shadow-sm transition-all font-light italic text-[#2D241E] focus:border-[#2D241E] placeholder:text-[#2D241E]/20" placeholder="ประทับใจส่วนไหนเป็นพิเศษไหมคะ..." value={comment} onChange={(e) => setComment(e.target.value)} />
                    <button onClick={() => onSubmit(selectedProduct.product_id, rating, comment)} disabled={isSubmitting || !selectedProduct} className="w-full py-6 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-30">
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "ส่งรีวิวความพึงพอใจ"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. ส่วนประกอบหลัก (Main Component) ---
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
    const itemsPerPage = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [ordersRes, paymentsRes] = await Promise.all([
                axiosInstance.get(`${API_ENDPOINTS.ORDERS}/my-orders`),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/payments`)
            ]);
            if (ordersRes.success) setOrders(ordersRes.data);
            if (paymentsRes.success) setPaymentMethods(paymentsRes.data);
        } catch (err) {
            toast.error("ไม่สามารถดึงข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const { currentOrders, totalPages } = useMemo(() => {
        const lastIndex = currentPage * itemsPerPage;
        const firstIndex = lastIndex - itemsPerPage;
        return {
            currentOrders: orders.slice(firstIndex, lastIndex),
            totalPages: Math.ceil(orders.length / itemsPerPage) || 1
        };
    }, [orders, currentPage]);

    const getStatusStyle = (status) => {
        const styles = {
            'สำเร็จ': "bg-green-50 text-green-600 border-green-100",
            'กำลังจัดส่ง': "bg-blue-50 text-blue-600 border-blue-100",
            'รอตรวจสอบชำระเงิน': "bg-orange-50 text-orange-600 border-orange-100",
            'รอแก้ไขสลิป': "bg-red-50 text-red-600 border-red-100 animate-pulse",
            'ยกเลิก': "bg-slate-50 text-slate-400 border-slate-200"
        };
        return styles[status] || 'bg-gray-50 text-gray-600 border-gray-100';
    };

    const handleOpenReview = (order) => { setSelectedOrderForAction(order); setIsReviewOpen(true); };
    const handleOpenResubmit = (order) => { setSelectedOrderForAction(order); setIsResubmitOpen(true); };

    const handleSubmitReview = async (productId, score, comment) => {
        setReviewSubmitting(true);
        try {
            const res = await axiosInstance.post('/api/reviews', { product_id: productId, rating_score: score, comment: comment });
            if (res.success) {
                toast.success("ส่งรีวิวสำเร็จ ขอบคุณค่ะ!");
                setIsReviewOpen(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "ส่งรีวิวไม่สำเร็จ");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="min-h-screen bg-[#fff] font-['Kanit'] text-[#2D241E] selection:bg-[#F3E9DC] relative overflow-x-hidden">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- Cozy Gimmick Patterns --- */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0 overflow-hidden">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12" size={200} />
                <Cookie className="absolute bottom-[20%] right-[10%] -rotate-12" size={150} />
                <Smile className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={400} />
                <Sparkles className="absolute top-[15%] right-[20%]" size={80} />
                <Heart className="absolute bottom-[10%] left-[15%] rotate-[30deg]" size={100} />
            </div>
            
            <main className="max-w-[1400px] mx-auto pt-32 md:pt-44 pb-24 px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#fff] p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm sticky top-44 transition-all">
                            <div className="text-center mb-10 pb-8 border-b border-slate-50">
                                <div className="w-20 h-20 bg-[#fff] border border-[#2D241E] text-[#2D241E] rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-6 font-black text-3xl italic">
                                    {userData?.first_name?.charAt(0)}
                                </div>
                                <h3 className="font-black text-xl text-[#2D241E] truncate">{userData?.first_name} {userData?.last_name}</h3>
                                <p className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.4em] mt-1">ผู้ใช้ระบบ</p>
                            </div>
                            <nav className="space-y-3">
                                <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group text-[#2D241E]">
                                    <User size={18} className="opacity-40 group-hover:opacity-100" />
                                    <span className="font-bold text-sm">ข้อมูลส่วนตัว</span>
                                </button>
                                <button className="w-full flex items-center gap-4 p-4 bg-slate-50 text-[#2D241E] rounded-2xl font-black text-sm border border-slate-100">
                                    <Package size={18} /> ประวัติการสั่งซื้อ
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="lg:col-span-9 space-y-8 md:space-y-12">
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 text-left">
                            <div className="space-y-2">
                                <div className="w-10 h-1.5 bg-[#2D241E] rounded-full mb-4"></div>
                                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">ประวัติการสั่งซื้อ</h1>
                                <p className="text-[#2D241E]/40 font-bold uppercase text-[10px] tracking-[0.4em] italic leading-none mt-4 ml-1">รายการสะสมความอร่อยทั้งหมดของคุณ</p>
                            </div>
                        </header>

                        <div className="space-y-6">
                            {currentOrders.map(order => (
                                <div key={order.order_id} className="bg-[#fff] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2D241E]/5 group-hover:bg-[#2D241E] transition-colors duration-500"></div>
                                    <div className="flex flex-col xl:flex-row justify-between gap-10 relative z-10">
                                        <div className="flex-1 space-y-8 text-left">
                                            <div className="flex flex-wrap items-center gap-5">
                                                <span className="font-black text-2xl uppercase tracking-tighter text-[#2D241E] italic">#{order.order_id}</span>
                                                <div className={`px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.2em] border ${getStatusStyle(order.status)}`}>{order.status}</div>
                                                <span className="text-[#2D241E]/40 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> {new Date(order.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>

                                            {order.status === 'รอแก้ไขสลิป' && order.rejection_reason && (
                                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                                                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mb-2">หมายเหตุการแจ้งแก้ไข:</p>
                                                        <p className="text-sm text-[#2D241E] font-medium leading-tight italic">"{order.rejection_reason}"</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-4">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] overflow-hidden border-2 border-slate-50 shadow-sm bg-white transition-transform group-hover:scale-105">
                                                        <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row xl:flex-col items-center justify-between gap-8 xl:min-w-[240px] border-t sm:border-t-0 xl:border-l border-slate-50 pt-8 sm:pt-0 xl:pl-12">
                                            <div className="text-center xl:text-right w-full">
                                                <p className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[0.4em] mb-2">ยอดชำระสุทธิ</p>
                                                <p className="text-4xl md:text-5xl font-black text-[#2D241E] italic tracking-tighter leading-none">฿{Number(order.total_amount).toLocaleString()}</p>
                                                <p className="text-[9px] font-bold text-[#2D241E]/30 mt-3 uppercase tracking-widest">
                                                    (รวมค่าส่ง: {Number(order.shipping_cost) > 0 ? `฿${Number(order.shipping_cost).toLocaleString()}` : 'ฟรี'})
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-3 w-full">
                                                <button onClick={() => setSelectedOrder(order)} className="flex-1 px-6 py-4 bg-[#fff] text-[#2D241E] border border-slate-200 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">ข้อมูลพัสดุ</button>
                                                {order.status === 'รอแก้ไขสลิป' && (
                                                    <button onClick={() => handleOpenResubmit(order)} className="flex-1 px-6 py-4 bg-[#fff] text-red-500 border border-red-100 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm">แก้สลิป</button>
                                                )}
                                                {order.status === 'สำเร็จ' && (
                                                    <button onClick={() => handleOpenReview(order)} className="flex-1 px-6 py-4 bg-[#2D241E] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-md hover:opacity-90 transition-all">รีวิวสินค้า</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {orders.length === 0 && (
                                <div className="text-center py-44 bg-[#fff] rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                    <ShoppingBag size={80} className="mx-auto text-slate-100 mb-10" />
                                    <h2 className="text-3xl font-black text-[#2D241E]/20 uppercase italic">คุณยังไม่เคยสั่งซื้อสินค้า</h2>
                                    <button onClick={() => navigate('/shop')} className="mt-8 px-10 py-4 bg-[#2D241E] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg">ไปเลือกซื้อขนม</button>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 md:gap-6 pt-12">
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-4 md:p-5 bg-[#fff] rounded-full shadow-sm border border-slate-100 text-[#2D241E] disabled:opacity-20 transition-all active:scale-90"><ChevronLeft size={24} /></button>
                                <div className="flex gap-2 md:gap-3 bg-[#fff] p-2 rounded-full border border-slate-100 shadow-sm">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full font-black text-sm transition-all ${currentPage === i + 1 ? 'bg-[#2D241E] text-white' : 'text-[#2D241E]/30 hover:bg-slate-50'}`}>{i + 1}</button>
                                    ))}
                                </div>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-4 md:p-5 bg-[#fff] rounded-full shadow-sm border border-slate-100 text-[#2D241E] disabled:opacity-20 transition-all active:scale-90"><ChevronRight size={24} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- Order Detail Modal --- */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 lg:p-10 bg-[#2D241E]/10 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-[#fff] rounded-[3rem] md:rounded-[4rem] w-full max-w-6xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 border border-slate-100 max-h-[90vh] text-left" onClick={e => e.stopPropagation()}>
                        {/* Cozy Pattern */}
                        <Cookie className="absolute -left-10 -bottom-10 opacity-[0.03] text-[#2D241E]" size={300} />
                        
                        <div className="flex-1 p-8 lg:p-16 overflow-y-auto border-r border-slate-50 custom-scrollbar relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#2D241E] italic">รายละเอียดออเดอร์</h2>
                                <button onClick={() => setSelectedOrder(null)} className="p-4 bg-white text-[#2D241E]/30 hover:text-[#2D241E] rounded-full transition-all border border-slate-100"><X size={24}/></button>
                            </div>
                            <div className="bg-slate-50/50 rounded-[3rem] p-10 mb-12 border border-white">
                                <p className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.4em] mb-4">สถานะการจัดส่ง / เลขพัสดุ</p>
                                <p className="text-3xl md:text-4xl font-black italic text-[#2D241E] uppercase leading-tight">{selectedOrder.tracking_number || 'กำลังจัดเตรียมพัสดุของคุณ'}</p>
                            </div>
                            <div className="space-y-10">
                                <h4 className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.5em] border-b border-slate-50 pb-6 ml-2">รายการสินค้าในกล่อง</h4>
                                {selectedOrder.items?.map(item => (
                                    <div key={item.item_id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-6 md:gap-8">
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] overflow-hidden border-2 border-slate-50 shadow-sm bg-white">
                                                <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <p className="font-black text-[#2D241E] text-xl md:text-2xl tracking-tighter uppercase leading-none italic">{item.product?.product_name}</p>
                                                <p className="text-[#2D241E]/40 font-bold uppercase text-[10px] tracking-widest mt-3">จำนวน: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-[#2D241E] text-xl md:text-2xl tracking-tighter">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-[420px] bg-white p-8 lg:p-16 flex flex-col justify-between border-l border-slate-50 relative z-10">
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.4em] ml-2">ที่อยู่จัดส่ง</p>
                                    <div className="bg-[#fff] p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <MapPin className="absolute -right-4 -bottom-4 opacity-[0.03] text-[#2D241E] rotate-12 transition-transform group-hover:scale-110" size={100}/>
                                        <p className="font-black text-[#2D241E] text-xl mb-3 italic leading-none">{selectedOrder.address?.recipient_name}</p>
                                        <p className="text-[#2D241E]/60 leading-relaxed font-light text-xs mb-8 italic">"{selectedOrder.address?.address_detail}"</p>
                                        <div className="flex items-center gap-3 text-[#2D241E] font-black text-sm bg-slate-50/50 px-5 py-3 rounded-2xl w-fit border border-white"><Phone size={14}/> {selectedOrder.address?.phone_number}</div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-slate-50 space-y-4">
                                    <div className="flex justify-between font-black text-[#2D241E]/30 text-[10px] uppercase tracking-widest"><span>ยอดรวมสินค้า</span><span className="text-[#2D241E]">฿{(Number(selectedOrder.total_amount) - Number(selectedOrder.shipping_cost)).toLocaleString()}</span></div>
                                    <div className="flex justify-between font-black text-[#2D241E]/30 text-[10px] uppercase tracking-widest">
                                        <span>ค่าจัดส่ง</span>
                                        {Number(selectedOrder.shipping_cost) > 0 ? (
                                            <span className="text-[#2D241E]">฿{Number(selectedOrder.shipping_cost).toLocaleString()}</span>
                                        ) : (
                                            <span className="text-green-500 italic">ฟรี</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end pt-8">
                                        <span className="text-6xl font-black text-[#2D241E] tracking-tighter italic leading-none">สุทธิ.</span>
                                        <span className="text-4xl font-black text-[#2D241E] tracking-tighter">฿{Number(selectedOrder.total_amount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="w-full py-6 bg-[#fff] border border-[#2D241E] text-[#2D241E] rounded-full font-black uppercase tracking-widest text-[11px] shadow-sm hover:bg-[#2D241E] hover:text-[#fff] transition-all mt-10">กลับไปหน้ารวม</button>
                        </div>
                    </div>
                </div>
            )}

            {isReviewOpen && selectedOrderForAction && <ReviewModal order={selectedOrderForAction} onClose={() => setIsReviewOpen(false)} onSubmit={handleSubmitReview} isSubmitting={reviewSubmitting} />}
            {isResubmitOpen && selectedOrderForAction && <ResubmitSlipModal order={selectedOrderForAction} paymentMethods={paymentMethods} onClose={() => setIsResubmitOpen(false)} onRefresh={fetchData} />}
            
            <Footer userData={userData} />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-bounce-slow { animation: bounce-slow 5s ease-in-out infinite; }
            `}} />
        </div>
    );
};

export default MyOrders;