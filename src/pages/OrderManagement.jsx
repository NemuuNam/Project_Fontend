import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Search, Eye, X, MapPin, CreditCard,
    Loader2, PackageCheck, Clock, Coins, Truck,
    RefreshCw, CheckCircle2, ImageIcon, Menu, AlertCircle,
    ExternalLink, Zap, Activity, ChevronRight, ChevronLeft, ArrowRight, Star,
    Leaf, Cookie, Smile, Sparkles, ClipboardList, Package, Trash2,
    FileWarning, RotateCcw, Filter, ChevronDown, MessageSquare, ListChecks
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Swal from 'sweetalert2';

const OrderManagement = () => {
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


    // --- ✨ Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const statusList = ['ทั้งหมด', 'รอตรวจสอบชำระเงิน', 'รอแก้ไขสลิป', 'กำลังดำเนินการ', 'กำลังจัดส่ง', 'สำเร็จ', 'ยกเลิก'];

    // --- 🎨 UI Theme Logic ---
    const getBadgeStyle = (status) => {
        const styles = {
            'สำเร็จ': "bg-white text-emerald-600 border-emerald-100 shadow-sm",
            'รอตรวจสอบชำระเงิน': "bg-white text-amber-600 border-amber-100 shadow-sm",
            'รอแก้ไขสลิป': "bg-white text-rose-600 border-rose-100 animate-pulse shadow-sm",
            'กำลังดำเนินการ': "bg-white text-blue-600 border-blue-100 shadow-sm",
            'กำลังจัดส่ง': "bg-white text-indigo-600 border-indigo-100 shadow-sm",
            'ยกเลิก': "bg-white text-slate-400 border-slate-200 shadow-sm"
        };
        return styles[status] || "bg-white text-slate-400 border-slate-100 shadow-sm";
    };

    // --- 📦 Logic ---


    const fetchShippingProviders = useCallback(async () => {
        try {
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SHIPPING_PROVIDERS);

            // 🚩 เพิ่ม Log เพื่อดูว่าบน Vercel ตัว 'res' มีค่าเป็นอะไร
            console.log("Response from Vercel API:", res);

            let providers = res.success ? res.data : (Array.isArray(res) ? res : []);

            // 🚩 ตรวจสอบว่าถ้าดึงมาแล้วได้ Array ว่าง ให้แจ้งเตือน
            if (providers.length === 0) {
                console.warn("API สำเร็จแต่ไม่มีข้อมูล Shipping Providers กลับมา");
            }

            if (providers.length > 0) {
                setShippingProviders(providers);
                setSelectedProviderId(providers[0].provider_id);
            }
        } catch (err) {
            console.error("API Error on Vercel:", err);
            const mockData = [
                { provider_id: 1, provider_name: 'Nim Express' },
                { provider_id: 2, provider_name: 'Flash' }
            ];
            setShippingProviders(mockData);
            setSelectedProviderId(mockData[0].provider_id);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS);
            if (res.success) setOrders(res.data || []);
        } catch (err) {
            toast.error("ดึงข้อมูลคำสั่งซื้อล้มเหลว");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); fetchShippingProviders(); }, [fetchOrders, fetchShippingProviders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (newStatus === 'ยกเลิก') {
            const confirm = await Swal.fire({
                title: 'ยืนยันการยกเลิกออเดอร์?',
                text: "คุณต้องการยกเลิกรายการสั่งซื้อนี้ใช่หรือไม่?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'ยืนยัน ยกเลิกออเดอร์',
                cancelButtonText: 'ปิดหน้าต่าง',
                background: '#fff',
                customClass: { popup: 'rounded-[3rem] font-["Kanit"]' }
            });
            if (!confirm.isConfirmed) return;
        }

        const load = toast.loading(`กำลังปรับปรุงสถานะ...`);
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${orderId}/status`, { status: newStatus });
            if (res.success) {
                toast.success(`อัปเดตสถานะสำเร็จ`, { id: load });
                setSelectedOrder(null);
                fetchOrders();
            }
        } catch (err) { toast.error("ล้มเหลว", { id: load }); }
    };

    const handleRejectSlip = async (id) => {
        const { value: reason, isConfirmed } = await Swal.fire({
            title: 'ระบุเหตุผลที่ปฏิเสธสลิป',
            input: 'textarea',
            inputPlaceholder: 'เช่น: ยอดเงินไม่ถูกต้อง หรือ สลิปไม่ชัดเจน...',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ยืนยันและแจ้งลูกค้า',
            cancelButtonText: 'ยกเลิก',
            background: '#ffffff',
            color: '#2D241E',
            customClass: { popup: 'rounded-[3rem] font-["Kanit"]', input: 'rounded-2xl border-slate-200 font-medium' },
            inputValidator: (value) => { if (!value) return 'โปรดระบุเหตุผล เพื่อให้ลูกค้าแก้ไขได้ถูกต้อง' }
        });

        if (isConfirmed && reason) {
            const load = toast.loading("กำลังดำเนินการ...");
            try {
                const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${id}/reject-slip`, { reason });
                if (res.success) {
                    toast.success("แจ้งแก้ไขสลิปเรียบร้อยแล้ว", { id: load });
                    setSelectedOrder(null);
                    fetchOrders();
                }
            } catch (err) { toast.error("เกิดข้อผิดพลาดในการดำเนินการ", { id: load }); }
        }
    };

const handleUpdateTracking = async (id) => {
    if (!trackingNumber) return toast.error("กรุณาระบุเลขพัสดุ");

    const load = toast.loading("บันทึกข้อมูลการจัดส่ง...");
    try {
        // ค้นหาชื่อบริษัทขนส่งจาก ID ที่เลือก เพื่อส่งไปให้ Backend บันทึก Log
        const selectedProvider = shippingProviders.find(p => p.provider_id === selectedProviderId);
        const providerName = selectedProvider ? selectedProvider.provider_name : 'ไม่ระบุขนส่ง';

        const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${id}/tracking`, {
            tracking_number: trackingNumber,
            provider_id: selectedProviderId,
            provider_name: providerName, // ✅ เพิ่มการส่งชื่อไปเพื่อให้ Backend ใช้ใน createLog
            status: 'กำลังจัดส่ง'
        });

        if (res.success) {
            toast.success("บันทึกสำเร็จ", { id: load });
            setSelectedOrder(null);
            setTrackingNumber('');
            fetchOrders();
        }
    } catch (err) {
        console.error("Tracking Update Error:", err);
        toast.error("ล้มเหลวในการบันทึก", { id: load });
    }
};

    // --- 🔍 Filtering & Pagination Logic ---
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = (o.order_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (o.address?.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesFilter = filterStatus === 'ทั้งหมด' || o.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [orders, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    if (loading && orders.length === 0) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={64} /></div>;

    return (
        <div className="flex min-h-screen bg-[#ffffff] font-['Kanit'] text-[#2D241E] overflow-x-hidden relative selection:bg-[#F3E9DC]">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="orders" />

            {/* ☁️ Global Cozy Patterns */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12" size={200} />
                <Cookie className="absolute bottom-[10%] right-[10%] -rotate-12" size={180} />
                <Smile className="absolute top-[40%] right-[40%]" size={150} />
                <Sparkles className="absolute top-[20%] left-[40%]" size={100} />
            </div>

            <main className={`flex-1 transition-all duration-500 ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[300px]'} p-4 md:p-10 lg:p-14 w-full relative z-10`}>

                <div className="mb-8 md:mb-1 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-2xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-95 transition-all"><Menu size={24} /></button>
                    <Header title="ศูนย์จัดการคำสั่งซื้อ" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 px-2">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 mb-4 animate-bounce-slow">
                            <Sparkles size={14} className="text-[#2D241E]/40" />
                            <span className="text-[20px] font-black uppercase tracking-[0.1em] text-[#2D241E]/60">ประวัติการสั่งซื้อ</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">Orders</h1>
                    </div>
                    <button onClick={fetchOrders} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group active:scale-90">
                        <RefreshCw size={24} className={`text-[#2D241E]/40 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                    </button>
                </div>

                {/* 📊 Stat Cards*/}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 px-2">
                    <StatCardSmall title="ออเดอร์ทั้งหมด" value={orders.length} icon={<ShoppingBag size={14} />} color="#2D241E" />
                    <StatCardSmall title="รอตรวจสลิป" value={orders.filter(o => o.status === 'รอตรวจสอบชำระเงิน').length} icon={<Clock size={14} />} color="#D97706" />
                    <StatCardSmall title="รอแก้ไขสลิป" value={orders.filter(o => o.status === 'รอแก้ไขสลิป').length} icon={<FileWarning size={14} />} color="#ef4444" />
                    <StatCardSmall title="กำลังเตรียมของ" value={orders.filter(o => o.status === 'กำลังดำเนินการ').length} icon={<ListChecks size={14} />} color="#3b82f6" />
                    <StatCardSmall title="กำลังจัดส่ง" value={orders.filter(o => o.status === 'กำลังจัดส่ง').length} icon={<Truck size={14} />} color="#6366f1" />
                    <StatCardSmall title="สำเร็จแล้ว" value={orders.filter(o => o.status === 'สำเร็จ').length} icon={<CheckCircle2 size={14} />} color="#10b981" />
                </div>

                <div className="bg-white p-6 md:p-12 rounded-[3rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col gap-8 mb-12 relative z-10">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                            <h3 className="text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-4">
                                <Activity className=" " /> รายการคำสั่งซื้อที่เข้ามา
                            </h3>
                            <div className="relative w-full max-w-md group">
                                <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2D241E]/20 transition-colors" />
                                <input className="w-full pl-16 pr-8 py-5 rounded-full bg-slate-50/50 border border-slate-50 focus:bg-white focus:border-[#2D241E]/10 outline-none font-bold text-xl transition-all shadow-inner placeholder:text-[#2D241E]/40" placeholder="ค้นหารหัส หรือ ชื่อลูกค้า..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar whitespace-nowrap border border-slate-100 rounded-full px-4 py-3">
                            {statusList.map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-8 py-3 rounded-full text-[20px] font-black uppercase transition-all duration-300 ${filterStatus === status ? 'bg-[#2D241E] text-white shadow-md scale-105' : 'bg-white text-[#2D241E]  hover:border-slate-300'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto relative z-10 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[#2D241E] uppercase text-[20px] font-black tracking-[0.1em] px-8">
                                    <th className="px-10 pb-2">รหัสออเดอร์</th>
                                    <th className="px-10 pb-2">ชื่อผู้รับ</th>
                                    <th className="px-10 pb-2 text-right">ยอดชำระ</th>
                                    <th className="px-10 pb-2 text-center">สถานะ</th>
                                    <th className="px-10 pb-2 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.length > 0 ? paginatedOrders.map(order => (
                                    <tr key={order.order_id} className="group/row hover:translate-x-1 transition-all cursor-pointer animate-in fade-in" onClick={() => setSelectedOrder(order)}>
                                        <td className="py-7 px-10 rounded-l-[2.5rem] bg-white font-black text-[#2D241E] uppercase tracking-tighter text-xl">#{order.order_id}</td>
                                        <td className="py-7 px-10 bg-white border-y border-slate-50 font-bold text-[#2D241E] text-xl">{order.address?.recipient_name || 'ผู้เยี่ยมชม'}</td>
                                        <td className="py-7 px-10 bg-white border-y border-slate-50 font-black text-[20px] text-right text-[#2D241E] italic">฿{order.total_amount?.toLocaleString()}</td>
                                        <td className="py-7 px-10 bg-white border-y border-slate-50 text-center">
                                            <span className={`px-5 py-2 rounded-full text-[20px] font-black uppercase tracking-widest border ${getBadgeStyle(order.status)}`}>{order.status}</span>
                                        </td>
                                        <td className="py-7 px-10 rounded-r-[2.5rem] bg-white border border-slate-50 text-right">
                                            <div className="w-10 h-10 bg-white rounded-full inline-flex items-center justify-center shadow-sm border border-slate-100 group-hover/row:border-[#2D241E]/30 transition-all"><Eye size={18} /></div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="py-32 text-center text-[#2D241E]/20 font-black uppercase italic tracking-widest">ไม่พบรายการสั่งซื้อ</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✨ Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-4 relative z-10 pb-4">
                            <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }} disabled={currentPage === 1} className="p-3 bg-white border border-slate-100 rounded-2xl text-[#2D241E] disabled:  hover:shadow-lg transition-all active:scale-90 shadow-sm"><ChevronLeft size={20} /></button>
                            <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100 shadow-inner">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;
                                    return (
                                        <button key={pageNum} onClick={(e) => { e.stopPropagation(); setCurrentPage(pageNum); }} className={`w-10 h-10 rounded-xl font-black  text-xl transition-all ${currentPage === pageNum ? 'bg-[#2D241E] text-white shadow-xl scale-110' : 'text-[#2D241E] hover:text-[#2D241E]'}`}>{pageNum}</button>
                                    );
                                })}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} disabled={currentPage === totalPages} className="p-3 bg-white border border-slate-100 rounded-2xl text-[#2D241E] disabled:  hover:shadow-lg transition-all active:scale-90 shadow-sm"><ChevronRight size={20} /></button>
                        </div>
                    )}
                </div>
            </main>

            {/* --- 📝 Detail Modal --- */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 lg:p-10 bg-[#2D241E]/10 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white w-full max-w-7xl rounded-[3rem] md:rounded-[4.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 border border-slate-100" onClick={e => e.stopPropagation()}>

                        <div className="p-8 md:p-10 flex justify-between items-center border-b border-slate-50 bg-white relative">
                            <Sparkles className="absolute top-0 left-1/4 opacity-[0.02] text-[#2D241E]" size={100} />
                            <div className="flex items-center gap-6 relative z-10 text-left">
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-[#2D241E]"><PackageCheck size={32} /></div>
                                <div>
                                    <p className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] mb-1">บันทึกการตรวจสอบออเดอร์</p>
                                    <h2 className="text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic">รายการ<span className="  font-light">คำสั่งซื้อ</span></h2>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-4 bg-white text-[#2D241E] hover:text-red-500 rounded-full border border-slate-50 shadow-sm transition-all active:scale-90 relative z-10"><X size={24} /></button>
                        </div>

                        <div className="overflow-y-auto p-8 lg:p-14 flex-1 custom-scrollbar bg-white text-left">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-7 space-y-12">
                                    <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <MapPin size={150} className="absolute -right-10 -bottom-10 opacity-[0.01] rotate-12" />
                                        <h3 className="text-xl font-black text-[#2D241E] mb-10 uppercase tracking-tighter italic border-b border-slate-50 pb-5">ข้อมูลการจัดส่งสินค้า</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                            <div className="space-y-2"><label className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] ml-1">ชื่อผู้รับ</label><p className="text-2xl font-bold text-[#2D241E] tracking-tight">{selectedOrder.address?.recipient_name}</p></div>
                                            <div className="space-y-2"><label className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] ml-1">เบอร์โทรศัพท์</label><p className="text-2xl font-bold text-[#2D241E] tracking-tight">{selectedOrder.address?.phone_number}</p></div>
                                            <div className="md:col-span-2 space-y-2"><label className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] ml-1">ที่อยู่จัดส่ง</label><p className="text-[20px] font-bold text-[#2D241E]italic leading-relaxed">"{selectedOrder.address?.address_detail}"</p></div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <h3 className="text-xl font-black text-[#2D241E] px-8 uppercase tracking-tighter italic flex items-center gap-3"><ClipboardList size={22} className=" " /> รายการสินค้า</h3>
                                        <div className="space-y-4">
                                            {selectedOrder.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-6 md:gap-8 p-6 bg-white rounded-[2.5rem] border border-slate-50 hover:shadow-md transition-all duration-500 group">
                                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.8rem] overflow-hidden bg-white border border-slate-100 shrink-0 shadow-inner">
                                                        <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-xl md:text-2xl text-[#2D241E] truncate uppercase tracking-tighter">{item.product?.product_name}</p>
                                                        <p className="text-[#2D241E] text-[20px] font-black uppercase mt-1 tracking-widest">จำนวน: {item.quantity} ชิ้น</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-[#2D241E] italic tracking-tighter leading-none">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-5 space-y-12">
                                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
                                        <h3 className="text-xl font-black text-[#2D241E] mb-8 uppercase tracking-tighter italic">หลักฐานการชำระเงิน</h3>
                                        {selectedOrder.payments?.[0]?.slip_url ? (
                                            <div className="relative h-[400px] w-full overflow-hidden rounded-[2.5rem] border-8 border-slate-50 bg-slate-50 shadow-inner flex items-center justify-center">
                                                <img src={selectedOrder.payments[0].slip_url} className="h-full w-full object-contain" alt="Slip" />
                                                <button onClick={() => window.open(selectedOrder.payments[0].slip_url)} className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl text-[#2D241E] hover:bg-[#2D241E] hover:text-white transition-all"><ExternalLink size={20} /></button>
                                            </div>
                                        ) : (
                                            <div className="h-[400px] border-4 border-dashed border-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center text-[#2D241E]/10 font-black uppercase tracking-[0.1em] italic space-y-4">
                                                <ImageIcon size={60} /><span className=" text-xl">ไม่พบสลิป</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative text-left">
                                        <div className="relative z-10 space-y-10">
                                            <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                                                <h3 className="text-xl font-black uppercase tracking-tighter italic text-[#2D241E]">จัดการสถานะ</h3>
                                                <span className={`px-5 py-1.5 rounded-full text-[20px] font-black uppercase tracking-widest border ${getBadgeStyle(selectedOrder.status)}`}>{selectedOrder.status}</span>
                                            </div>

                                            <div className="space-y-6">
                                                {selectedOrder.status !== 'สำเร็จ' && selectedOrder.status !== 'ยกเลิก' && (
                                                    <div className="space-y-4">
                                                        {selectedOrder.status === 'รอตรวจสอบชำระเงิน' && (
                                                            <>
                                                                <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'กำลังดำเนินการ')} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black text-xl transition-all shadow-md flex items-center justify-center gap-4 active:scale-95 uppercase tracking-widest">อนุมัติการชำระเงิน <CheckCircle2 size={24} /></button>
                                                                <button onClick={() => handleRejectSlip(selectedOrder.order_id)} className="w-full py-4 bg-white text-red-500 rounded-full font-black text-xl transition-all border border-red-50 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest">แจ้งสลิปไม่ถูกต้อง <RotateCcw size={18} /></button>
                                                            </>
                                                        )}
                                                        {selectedOrder.status === 'กำลังดำเนินการ' && (
                                                            <div className="space-y-8 animate-in fade-in">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {shippingProviders.map(p => (
                                                                        <button key={p.provider_id} onClick={() => setSelectedProviderId(p.provider_id)} className={`py-4 rounded-2xl text-[20px] font-black transition-all border ${selectedProviderId === p.provider_id ? 'bg-[#2D241E] text-white border-[#2D241E] shadow-md' : 'bg-white text-[#2D241E] border-slate-100'}`}>{p.provider_name}</button>
                                                                    ))}
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] ml-6">เลขพัสดุจัดส่ง</label>
                                                                    <input className="w-full p-5 rounded-full bg-slate-50/50 border border-slate-100 focus:bg-white outline-none font-black text-xl text-[#2D241E] transition-all tracking-[0.1em] uppercase italic text-center shadow-inner" placeholder="TRACKING-ID" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                                                                </div>
                                                                <button onClick={() => handleUpdateTracking(selectedOrder.order_id)} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black text-xl hover:bg-black transition-all shadow-md flex items-center justify-center gap-4 active:scale-95 uppercase tracking-widest">บันทึกการจัดส่ง <Truck size={24} /></button>
                                                            </div>
                                                        )}
                                                        {selectedOrder.status === 'กำลังจัดส่ง' && (
                                                            <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'สำเร็จ')} className="w-full py-5 bg-emerald-500 text-white rounded-full font-black text-xl shadow-md transition-all flex items-center justify-center gap-4 active:scale-95 uppercase tracking-widest">ทำรายการสำเร็จ <Package size={24} /></button>
                                                        )}
                                                        <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ยกเลิก')} className="w-full py-2 text-[#2D241E] hover:text-red-500 font-black uppercase tracking-[0.1em] text-[20px] transition-colors mt-4">ยกเลิกรายการสั่งซื้อนี้</button>
                                                    </div>
                                                )}

                                                {selectedOrder.status === 'รอแก้ไขสลิป' && (
                                                    <div className="p-8 bg-slate-50/50 rounded-[2.5rem] text-center border border-slate-100 shadow-inner">
                                                        <Clock size={40} className="mx-auto text-[#2D241E]/10 mb-6" />
                                                        <p className="text-[#2D241E]/40 font-bold text-xl uppercase tracking-[0.1em]">รออัปเดตสลิปจากลูกค้า</p>
                                                        <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ยกเลิก')} className="text-red-400 font-black text-[20px] uppercase tracking-widest mt-6 hover:text-red-600 transition-colors">ยกเลิกออเดอร์เลย</button>
                                                    </div>
                                                )}

                                                {selectedOrder.status === 'สำเร็จ' && (
                                                    <div className="text-center py-10 space-y-4 animate-in zoom-in">
                                                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-sm animate-bounce-slow"><Star size={32} fill="currentColor" /></div>
                                                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-[#2D241E]">ทำรายการสำเร็จแล้ว</h4>
                                                    </div>
                                                )}

                                                {selectedOrder.status === 'ยกเลิก' && (
                                                    <div className="text-center py-10 space-y-4 animate-in zoom-in">
                                                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border-2 border-rose-100 shadow-sm"><X size={32} /></div>
                                                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-[#2D241E]">รายการนี้ถูกยกเลิก</h4>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 bg-white border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-end gap-10">
                                <div className="space-y-1 text-left">
                                    <p className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em]">ยอดรวมสุทธิ</p>
                                    <p className="text-4xl md:text-5xl font-black text-[#2D241E] italic tracking-tighter leading-none">฿{selectedOrder.total_amount?.toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="w-full md:w-auto px-12 py-5 bg-white text-[#2D241E] border border-slate-100 rounded-full font-black uppercase tracking-widest text-[20px] shadow-sm hover:bg-slate-50 transition-all">ปิดหน้าต่างนี้</button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

const StatCardSmall = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1.5 duration-500 group relative overflow-hidden">

        <div className="absolute -right-4 -bottom-4 text-[#2D241E] opacity-[0.015] group-hover:scale-110 transition-transform duration-700">
        </div>

        <div className="flex-1 text-left min-w-0 relative z-10">
            <p className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] mb-3 md:mb-4 flex items-center gap-2 leading-none">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}></span>
                {title}
            </p>
            <h2 className="text-[#2D241E] text-xl md:text-2xl xl:text-3xl font-black italic tracking-tighter leading-none uppercase truncate">{value}</h2>
        </div>
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-50 text-[#2D241E]/70 shrink-0 ml-4 group-hover:scale-110 group-hover:text-[#2D241E] transition-all duration-500 relative z-10">
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
    </div>
);

export default OrderManagement;