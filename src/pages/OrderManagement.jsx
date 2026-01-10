import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Search, Eye, X, MapPin, Loader2, PackageCheck, Clock, Truck,
    RefreshCw, CheckCircle2, ImageIcon, Menu, ExternalLink, Activity, ChevronLeft, 
    ChevronRight, ArrowRight, Star, Leaf, Cookie, Smile, Sparkles, ClipboardList, Package, 
    Trash2, FileWarning, RotateCcw, Filter, ListChecks, TrendingUp
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Swal from 'sweetalert2';

const OrderManagement = () => {
    // --- 🏗️ States & Logic (คงเดิม 100%) ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingProviders, setShippingProviders] = useState([]);
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const statusList = ['ทั้งหมด', 'รอตรวจสอบชำระเงิน', 'รอแก้ไขสลิป', 'กำลังดำเนินการ', 'กำลังจัดส่ง', 'สำเร็จ', 'ยกเลิก'];

    const fetchShippingProviders = useCallback(async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.SHIPPING_PROVIDERS);
            let providers = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setShippingProviders(providers);
            if (providers.length > 0) setSelectedProviderId(providers[0].provider_id);
        } catch (err) {
            setShippingProviders([{ provider_id: 1, provider_name: 'Flash' }]);
        }
    }, []);

    const fetchOrders = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS);
            if (res.success) setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) { toast.error("ดึงข้อมูลล้มเหลว"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchOrders(); fetchShippingProviders(); }, [fetchOrders, fetchShippingProviders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (newStatus === 'ยกเลิก') {
            const confirm = await Swal.fire({
                title: 'ยืนยันยกเลิกออเดอร์?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#2D241E', 
                confirmButtonText: 'ยืนยัน', cancelButtonText: 'ปิด',
                customClass: { popup: 'rounded-[2.5rem] font-["Kanit"] border-4 border-[#2D241E]' }
            });
            if (!confirm.isConfirmed) return;
        }
        const load = toast.loading(`กำลังอัปเดต...`);
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${orderId}/status`, { status: newStatus });
            if (res.success) {
                toast.success(`สำเร็จ`, { id: load });
                setSelectedOrder(null);
                fetchOrders(true);
            }
        } catch (err) { toast.error("ล้มเหลว", { id: load }); }
    };

    const handleRejectSlip = async (id) => {
        const { value: reason, isConfirmed } = await Swal.fire({
            title: 'ระบุเหตุผลที่ปฏิเสธสลิป', input: 'textarea', inputPlaceholder: 'เช่น ยอดเงินไม่ถูกต้อง...',
            showCancelButton: true, confirmButtonColor: '#2D241E', confirmButtonText: 'ส่งเรื่อง',
            customClass: { popup: 'rounded-[2.5rem] font-["Kanit"] border-4 border-[#2D241E]' },
            inputValidator: (value) => { if (!value) return 'โปรดระบุเหตุผลเพื่อให้ลูกค้าแก้ไข' }
        });
        if (isConfirmed && reason) {
            const load = toast.loading("กำลังดำเนินการ...");
            try {
                const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${id}/reject-slip`, { reason });
                if (res.success) {
                    toast.success("แจ้งแก้ไขเรียบร้อย", { id: load });
                    setSelectedOrder(null);
                    fetchOrders(true);
                }
            } catch (err) { toast.error("ล้มเหลว", { id: load }); }
        }
    };

    const handleUpdateTracking = async (id) => {
        if (!trackingNumber || !selectedProviderId) return toast.error("ระบุเลขพัสดุและบริษัทขนส่ง");
        const load = toast.loading("กำลังบันทึก...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${id}/tracking`, {
                tracking_number: trackingNumber, provider_id: selectedProviderId, status: 'กำลังจัดส่ง'
            });
            if (res.success) {
                toast.success("บันทึกสำเร็จ", { id: load });
                setSelectedOrder(null);
                setTrackingNumber('');
                fetchOrders(true);
            }
        } catch (err) { toast.error("ล้มเหลว", { id: load }); }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => 
            (o.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) || o.address?.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterStatus === 'ทั้งหมด' || o.status === filterStatus)
        );
    }, [orders, searchTerm, filterStatus]);

    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    if (loading && orders.length === 0) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="orders" />

            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-8 lg:p-10 w-full relative z-10`}>
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-90 transition-all"><Menu size={24} /></button>
                    <Header title="จัดการคำสั่งซื้อ" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 px-2 text-left">
                    <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                            <Sparkles size={14} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Orders Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">Orders</h1>
                    </div>
                    <button onClick={() => fetchOrders()} className="p-4 rounded-2xl bg-white border-2 border-[#2D241E] shadow-lg hover:rotate-180 transition-all active:scale-90 group shrink-0">
                        <RefreshCw size={24} className={`text-[#2D241E] ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* 📊 Stat Cards - ตัวหนังสือเข้มจัด */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-10 px-2">
                    <StatCardSmall title="ออเดอร์" value={orders.length} icon={<ShoppingBag />} color="#2D241E" />
                    <StatCardSmall title="รอสลิป" value={orders.filter(o => o?.status === 'รอตรวจสอบชำระเงิน').length} icon={<Clock />} color="#D97706" />
                    <StatCardSmall title="ให้แก้" value={orders.filter(o => o?.status === 'รอแก้ไขสลิป').length} icon={<FileWarning />} color="#ef4444" />
                    <StatCardSmall title="เตรียมของ" value={orders.filter(o => o?.status === 'กำลังดำเนินการ').length} icon={<ListChecks />} color="#3b82f6" />
                    <StatCardSmall title="จัดส่ง" value={orders.filter(o => o?.status === 'กำลังจัดส่ง').length} icon={<Truck />} color="#6366f1" />
                    <StatCardSmall title="สำเร็จ" value={orders.filter(o => o?.status === 'สำเร็จ').length} icon={<CheckCircle2 />} color="#10b981" />
                </div>

                {/* Table Section - สีเข้ม High Contrast */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {statusList.map(s => (
                                <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${filterStatus === s ? 'bg-[#2D241E] text-white shadow-md' : 'bg-slate-50 text-[#2D241E] border-2 border-slate-100'}`}>{s}</button>
                            ))}
                        </div>
                        <div className="relative w-full lg:max-w-md">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2D241E]" strokeWidth={3} />
                            <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border-2 border-slate-100 outline-none font-black text-sm text-[#2D241E] focus:border-[#2D241E]" placeholder="ค้นหารหัส หรือ ชื่อ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[#2D241E] uppercase text-xs font-black tracking-widest px-6">
                                    <th className="px-6 pb-2">Order ID</th>
                                    <th className="px-6 pb-2">Customer</th>
                                    <th className="px-6 pb-2 text-right">ยอดชำระ</th>
                                    <th className="px-6 pb-2 text-center">Status</th>
                                    <th className="px-6 pb-2 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map(order => (
                                    <tr key={order?.order_id} className="group hover:translate-x-1 transition-all cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                        <td className="py-4 px-6 rounded-l-2xl bg-white border-y border-l border-slate-100 font-black text-sm text-[#2D241E]">#{order?.order_id?.substring(0, 8)}</td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100 text-sm font-black text-[#2D241E]">{order?.address?.recipient_name || 'GUEST'}</td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100 text-right font-black text-base text-[#2D241E] italic">฿{order?.total_amount?.toLocaleString()}</td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100 text-center">
                                            <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase text-[#2D241E] bg-slate-50 border-2 border-[#2D241E]/10">{order?.status}</span>
                                        </td>
                                        <td className="py-4 px-6 rounded-r-2xl bg-white border-y border-r border-slate-100 text-right">
                                            <div className="p-2 bg-slate-50 rounded-lg inline-flex hover:bg-[#2D241E] hover:text-white transition-all text-[#2D241E]"><Eye size={16} strokeWidth={3}/></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }} disabled={currentPage === 1} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 active:scale-90 transition-all"><ChevronLeft size={20} strokeWidth={3}/></button>
                            <span className="text-xs font-black text-[#2D241E] italic">Page {currentPage} of {totalPages}</span>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} disabled={currentPage === totalPages} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 active:scale-90 transition-all"><ChevronRight size={20} strokeWidth={3}/></button>
                        </div>
                    )}
                </div>
            </main>

            {/* --- 📝 Detail Modal (ตัวหนังสือเข้มจัด) --- */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/20 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border-4 border-[#2D241E]" onClick={e => e.stopPropagation()}>
                        <div className="p-6 flex justify-between items-center border-b-2 border-slate-100 bg-white">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#2D241E] p-3 rounded-xl text-white shadow-lg"><PackageCheck size={24} strokeWidth={3} /></div>
                                <h2 className="text-xl font-black uppercase italic text-[#2D241E]">Order #{selectedOrder.order_id?.substring(0, 8)}</h2>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-50 text-[#2D241E] rounded-full hover:text-red-500 transition-all"><X size={20} strokeWidth={3}/></button>
                        </div>

                        <div className="overflow-y-auto p-8 custom-scrollbar text-left grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                                    <h3 className="font-black text-xs uppercase mb-3 text-[#2D241E] italic">Shipping Information</h3>
                                    <p className="font-black text-lg text-[#2D241E]">{selectedOrder.address?.recipient_name}</p>
                                    <p className="text-sm font-black text-[#2D241E] mb-2">{selectedOrder.address?.phone_number}</p>
                                    <p className="text-sm font-black italic text-[#2D241E] leading-relaxed">"{selectedOrder.address?.address_detail}"</p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-black text-xs uppercase px-2 text-[#2D241E]">Items Summary</h3>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-white border-2 border-slate-100 rounded-2xl items-center hover:border-[#2D241E] transition-all">
                                            <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-14 h-14 rounded-xl object-cover border-2 border-slate-50 shadow-sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm uppercase text-[#2D241E] truncate">{item.product?.product_name}</p>
                                                <p className="text-[10px] font-black text-[#2D241E]">จำนวน: {item.quantity} ชิ้น</p>
                                            </div>
                                            <p className="font-black italic text-base text-[#2D241E]">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white border-4 border-[#2D241E] p-4 rounded-3xl text-center shadow-xl">
                                    <h3 className="font-black text-xs uppercase mb-4 text-[#2D241E]">Payment Slip</h3>
                                    {selectedOrder?.payments?.[0]?.slip_url ? (
                                        <div className="relative group">
                                            <img src={selectedOrder.payments[0].slip_url} className="w-full h-64 object-contain rounded-xl bg-slate-50" alt="Slip" />
                                            <button onClick={() => window.open(selectedOrder.payments[0].slip_url)} className="absolute bottom-2 right-2 bg-[#2D241E] text-white p-2 rounded-lg shadow-xl hover:scale-110 transition-transform"><ExternalLink size={16} strokeWidth={3} /></button>
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-[#2D241E] italic text-xs space-y-2 border-2 border-dashed border-slate-200"><ImageIcon size={32} /><span>ไม่พบหลักฐานการโอน</span></div>
                                    )}
                                </div>

                                <div className="bg-[#2D241E] text-white p-6 rounded-[2rem] shadow-2xl space-y-5">
                                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                                        <span className="text-[10px] uppercase font-black text-white">Management Status</span>
                                        <span className="px-3 py-1 bg-white text-[#2D241E] rounded-full text-[10px] font-black uppercase shadow-lg">{selectedOrder.status}</span>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedOrder.status === 'รอตรวจสอบชำระเงิน' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'กำลังดำเนินการ')} className="w-full py-4 bg-emerald-500 rounded-full font-black text-xs uppercase shadow-xl hover:bg-emerald-600 active:scale-95 transition-all italic">อนุมัติการชำระเงิน</button>
                                                <button onClick={() => handleRejectSlip(selectedOrder.order_id)} className="w-full py-3 bg-white text-red-600 rounded-full font-black text-xs uppercase shadow-md active:scale-95 transition-all">แจ้งสลิปไม่ถูกต้อง</button>
                                            </>
                                        )}
                                        {selectedOrder.status === 'กำลังดำเนินการ' && (
                                            <div className="space-y-3">
                                                <select className="w-full p-3 rounded-xl bg-white text-[#2D241E] font-black text-xs border-2 border-white shadow-inner" value={selectedProviderId} onChange={e => setSelectedProviderId(e.target.value)}>
                                                    {shippingProviders.map(p => <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>)}
                                                </select>
                                                <input className="w-full p-3 rounded-xl bg-white text-[#2D241E] font-black text-xs uppercase placeholder:text-slate-300 shadow-inner" placeholder="เลขพัสดุ (Tracking ID)" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                                                <button onClick={() => handleUpdateTracking(selectedOrder.order_id)} className="w-full py-4 bg-blue-500 rounded-full font-black text-xs uppercase shadow-xl hover:bg-blue-600 active:scale-95 transition-all italic">บันทึกเลขพัสดุ</button>
                                            </div>
                                        )}
                                        {selectedOrder.status === 'กำลังจัดส่ง' && (
                                            <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'สำเร็จ')} className="w-full py-4 bg-emerald-500 rounded-full font-black text-xs uppercase shadow-xl transition-all italic">ยืนยันรายการสำเร็จ</button>
                                        )}
                                        <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ยกเลิก')} className="w-full text-[10px] uppercase font-black text-white hover:text-red-400 transition-all mt-2 italic">Cancel this order</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t-4 border-[#2D241E] flex justify-between items-center shadow-inner">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest">Grand Total</p>
                                <p className="text-4xl font-black text-[#2D241E] italic leading-none">฿{selectedOrder.total_amount?.toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="px-10 py-4 bg-white border-2 border-[#2D241E] rounded-full font-black uppercase text-xs text-[#2D241E] hover:bg-[#2D241E] hover:text-white transition-all shadow-xl">ปิดหน้าต่าง</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 StatCard: เข้มชัดจัดเต็ม
const StatCardSmall = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border-2 border-[#2D241E] shadow-lg flex items-center justify-between hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1">{title}</p>
            <h2 className="text-[#2D241E] text-2xl font-black italic leading-none">{value || 0}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#2D241E] border-2 border-[#2D241E] shadow-inner group-hover:bg-[#2D241E] group-hover:text-white transition-all duration-500">
            {React.cloneElement(icon, { size: 20, strokeWidth: 3 })}
        </div>
    </div>
);

export default OrderManagement;