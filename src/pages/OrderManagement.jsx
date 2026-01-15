import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
<<<<<<< HEAD
    ShoppingBag, Search, Eye, X, MapPin, CreditCard,
    Loader2, PackageCheck, Clock, Coins, Truck,
    RefreshCw, CheckCircle2, ImageIcon, Menu, AlertCircle,
    ExternalLink, Zap, Activity, ChevronRight, ChevronLeft, ArrowRight, Star,
    Leaf, Cookie, Smile, Sparkles, ClipboardList, Package, Trash2,
    FileWarning, RotateCcw, Filter, ChevronDown, MessageSquare, ListChecks
=======
    ShoppingBag, Search, Eye, X, MapPin, Loader2, PackageCheck, Clock, Truck,
    RefreshCw, CheckCircle2, ImageIcon, Menu, ExternalLink, Activity, ChevronLeft,
    ChevronRight, ArrowRight, Star, Leaf, Cookie, Smile, Sparkles, ClipboardList, Package,
    Trash2, FileWarning, RotateCcw, Filter, ListChecks, TrendingUp
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
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
<<<<<<< HEAD
    const [selectedProvider, setSelectedProvider] = useState('');

    // --- ✨ Pagination State ---
=======
    const [selectedProviderId, setSelectedProviderId] = useState('');
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const statusList = ['ทั้งหมด', 'รอตรวจสอบชำระเงิน', 'รอแก้ไขสลิป', 'กำลังดำเนินการ', 'กำลังจัดส่ง', 'สำเร็จ', 'ยกเลิก'];

    const fetchShippingProviders = useCallback(async () => {
        try {
<<<<<<< HEAD
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SHIPPING_PROVIDERS);
            let providers = res.success ? res.data : (Array.isArray(res) ? res : []);
            if (providers.length > 0) {
                setShippingProviders(providers);
                setSelectedProvider(providers[0].provider_name);
            }
        } catch (err) {
            setShippingProviders([{ provider_id: 1, provider_name: 'Nim Express' }, { provider_id: 2, provider_name: 'Flash' }]);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS);
            if (res.success) setOrders(res.data || []);
        } catch (err) {
            toast.error("ดึงข้อมูลคำสั่งซื้อล้มเหลว");
=======
            const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.SHIPPING_PROVIDERS);

            // เพิ่ม Log เพื่อดูว่าข้อมูลขนส่งที่ส่งมาหน้าตาเป็นอย่างไร
            console.log("🚚 ข้อมูลขนส่งที่ได้รับ:", response.data);

            let providers = [];

            // เช็คว่าข้อมูลเป็น Array ตรงๆ หรืออยู่ใน property data
            if (Array.isArray(response.data)) {
                providers = response.data;
            } else if (response.data?.success && Array.isArray(response.data.data)) {
                providers = response.data.data;
            }

            if (providers.length > 0) {
                setShippingProviders(providers);
                // ตั้งค่าเริ่มต้นให้เป็น ID ของตัวแรกในลิสต์
                setSelectedProviderId(providers[0].provider_id);
            }
        } catch (err) {
            console.error("Failed to fetch providers:", err);
            setShippingProviders([]);
        }
    }, []);

    const fetchOrders = useCallback(async (isSilent = false) => {
        console.log("🔍 เริ่มดึงข้อมูลออเดอร์...");
        if (!isSilent) setLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS);

            // ปรับการเช็คให้ยืดหยุ่นขึ้น
            if (Array.isArray(response.data)) {
                // กรณี Backend ส่งมาเป็น Array ตรงๆ
                setOrders(response.data);
            } else if (response.data?.success && Array.isArray(response.data.data)) {
                // กรณี Backend ส่งมาเป็น { success: true, data: [...] }
                setOrders(response.data.data);
            }

        } catch (err) {
            console.error("❌ Fetch Error:", err);
            toast.error("ไม่สามารถดึงข้อมูลได้");
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
        } finally {
            setLoading(false);
        }
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
<<<<<<< HEAD
                toast.success(`อัปเดตสถานะสำเร็จ`, { id: load });
                setSelectedOrder(null);
                fetchOrders();
=======
                toast.success(`สำเร็จ`, { id: load });
                setSelectedOrder(null);
                fetchOrders(true);
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
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
<<<<<<< HEAD
                tracking_number: trackingNumber,
                shipping_provider: selectedProvider,
                status: 'กำลังจัดส่ง'
            });
            if (res.success) {
                toast.success("บันทึกเลขพัสดุเรียบร้อย", { id: load });
                setSelectedOrder(null);
                setTrackingNumber('');
                fetchOrders();
=======
                tracking_number: trackingNumber, provider_id: selectedProviderId, status: 'กำลังจัดส่ง'
            });
            if (res.success) {
                toast.success("บันทึกสำเร็จ", { id: load });
                setSelectedOrder(null);
                setTrackingNumber('');
                fetchOrders(true);
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
            }
        } catch (err) { toast.error("ล้มเหลว", { id: load }); }
    };

    const filteredOrders = useMemo(() => {
<<<<<<< HEAD
        return orders.filter(o => {
            const matchesSearch = (o.order_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (o.address?.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesFilter = filterStatus === 'ทั้งหมด' || o.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
=======
        return orders.filter(o =>
            (o.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) || o.address?.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterStatus === 'ทั้งหมด' || o.status === filterStatus)
        );
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
    }, [orders, searchTerm, filterStatus]);

    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    if (loading && orders.length === 0) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="orders" />

<<<<<<< HEAD
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
                            <span className="text-[20px] font-black uppercase tracking-[0.3em] text-[#2D241E]/60">ประวัติการสั่งซื้อ</span>
=======
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
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">Orders</h1>
                    </div>
                    <button onClick={() => fetchOrders()} className="p-4 rounded-2xl bg-white border-2 border-[#2D241E] shadow-lg hover:rotate-180 transition-all active:scale-90 group shrink-0">
                        <RefreshCw size={24} className={`text-[#2D241E] ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

<<<<<<< HEAD
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
                                <Activity className="opacity-20" /> รายการคำสั่งซื้อที่เข้ามา
                            </h3>
                            <div className="relative w-full max-w-md group">
                                <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2D241E]/20 transition-colors" />
                                <input className="w-full pl-16 pr-8 py-5 rounded-full bg-slate-50/50 border border-slate-50 focus:bg-white focus:border-[#2D241E]/10 outline-none font-bold text-lg transition-all shadow-inner placeholder:text-[#2D241E]/40" placeholder="ค้นหารหัส หรือ ชื่อลูกค้า..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar whitespace-nowrap">
                            {statusList.map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-8 py-3 rounded-full text-[15px] font-black uppercase transition-all duration-300 ${filterStatus === status ? 'bg-[#2D241E] text-white shadow-md scale-105' : 'bg-white text-[#2D241E]  hover:border-slate-300'}`}
                                >
                                    {status}
                                </button>
=======
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
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
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
<<<<<<< HEAD
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
                                        <td className="py-7 px-10 bg-white border-y border-slate-50 font-bold text-[#2D241E]/80 text-xl">{order.address?.recipient_name || 'ผู้เยี่ยมชม'}</td>
                                        <td className="py-7 px-10 bg-white border-y border-slate-50 font-black text-2xl text-right text-[#2D241E] italic">฿{order.total_amount?.toLocaleString()}</td>
                                        <td className="py-7 px-10 bg-white border-y border-slate-50 text-center">
                                            <span className={`px-5 py-2 rounded-full text-[13px] font-black uppercase tracking-widest border ${getBadgeStyle(order.status)}`}>{order.status}</span>
=======
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
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                                        </td>
                                        <td className="py-4 px-6 rounded-r-2xl bg-white border-y border-r border-slate-100 text-right">
                                            <div className="p-2 bg-slate-50 rounded-lg inline-flex hover:bg-[#2D241E] hover:text-white transition-all text-[#2D241E]"><Eye size={16} strokeWidth={3} /></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }} disabled={currentPage === 1} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 active:scale-90 transition-all"><ChevronLeft size={20} strokeWidth={3} /></button>
                            <span className="text-xs font-black text-[#2D241E] italic">Page {currentPage} of {totalPages}</span>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} disabled={currentPage === totalPages} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 active:scale-90 transition-all"><ChevronRight size={20} strokeWidth={3} /></button>
                        </div>
                    )}
                </div>
            </main>

            {/* --- 📝 Detail Modal (ตัวหนังสือเข้มจัด) --- */}
            {selectedOrder && (
<<<<<<< HEAD
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 lg:p-10 bg-[#2D241E]/10 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white w-full max-w-7xl rounded-[3rem] md:rounded-[4.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 border border-slate-100" onClick={e => e.stopPropagation()}>

                        <div className="p-8 md:p-10 flex justify-between items-center border-b border-slate-50 bg-white relative">
                            <Sparkles className="absolute top-0 left-1/4 opacity-[0.02] text-[#2D241E]" size={100} />
                            <div className="flex items-center gap-6 relative z-10 text-left">
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-[#2D241E]"><PackageCheck size={32} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[0.5em] mb-1">บันทึกการตรวจสอบออเดอร์</p>
                                    <h2 className="text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic">วิเคราะห์ <span className="opacity-20 font-light">รายการสั่งซื้อ</span></h2>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-4 bg-white text-[#2D241E]/30 hover:text-red-500 rounded-full border border-slate-50 shadow-sm transition-all active:scale-90 relative z-10"><X size={24} /></button>
=======
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/20 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border-4 border-[#2D241E]" onClick={e => e.stopPropagation()}>
                        <div className="p-6 flex justify-between items-center border-b-2 border-slate-100 bg-white">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#2D241E] p-3 rounded-xl text-white shadow-lg"><PackageCheck size={24} strokeWidth={3} /></div>
                                <h2 className="text-xl font-black uppercase italic text-[#2D241E]">Order #{selectedOrder.order_id?.substring(0, 8)}</h2>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-50 text-[#2D241E] rounded-full hover:text-red-500 transition-all"><X size={20} strokeWidth={3} /></button>
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
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

<<<<<<< HEAD
                                    <div className="space-y-8">
                                        <h3 className="text-xl font-black text-[#2D241E] px-8 uppercase tracking-tighter italic flex items-center gap-3"><ClipboardList size={22} className="opacity-20" /> รายการสินค้า</h3>
                                        <div className="space-y-4">
                                            {selectedOrder.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-6 md:gap-8 p-6 bg-white rounded-[2.5rem] border border-slate-50 hover:shadow-md transition-all duration-500 group">
                                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.8rem] overflow-hidden bg-white border border-slate-100 shrink-0 shadow-inner">
                                                        <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-xl md:text-2xl text-[#2D241E] truncate uppercase tracking-tighter">{item.product?.product_name}</p>
                                                        <p className="text-[#2D241E]/30 text-[11px] font-black uppercase mt-1 tracking-widest">จำนวน: {item.quantity} ชิ้น</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-[#2D241E] italic tracking-tighter leading-none">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
=======
                            <div className="space-y-6">
                                <div className="bg-white border-4 border-[#2D241E] p-4 rounded-3xl text-center shadow-xl">
                                    <h3 className="font-black text-xs uppercase mb-4 text-[#2D241E]">Payment Slip</h3>
                                    {selectedOrder?.payments?.[0]?.slip_url ? (
                                        <div className="relative group">
                                            <img src={selectedOrder.payments[0].slip_url} className="w-full h-64 object-contain rounded-xl bg-slate-50" alt="Slip" />
                                            <button onClick={() => window.open(selectedOrder.payments[0].slip_url)} className="absolute bottom-2 right-2 bg-[#2D241E] text-white p-2 rounded-lg shadow-xl hover:scale-110 transition-transform"><ExternalLink size={16} strokeWidth={3} /></button>
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-[#2D241E] italic text-xs space-y-2 border-2 border-dashed border-slate-200"><ImageIcon size={32} /><span>ไม่พบหลักฐานการโอน</span></div>
                                    )}
                                </div>

<<<<<<< HEAD
                                <div className="lg:col-span-5 space-y-12">
                                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
                                        <h3 className="text-xl font-black text-[#2D241E] mb-8 uppercase tracking-tighter italic">หลักฐานการชำระเงิน</h3>
                                        {selectedOrder.payments?.[0]?.slip_url ? (
                                            <div className="relative h-[400px] w-full overflow-hidden rounded-[2.5rem] border-8 border-slate-50 bg-slate-50 shadow-inner flex items-center justify-center">
                                                <img src={selectedOrder.payments[0].slip_url} className="h-full w-full object-contain" alt="Slip" />
                                                <button onClick={() => window.open(selectedOrder.payments[0].slip_url)} className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl text-[#2D241E] hover:bg-[#2D241E] hover:text-white transition-all"><ExternalLink size={20} /></button>
                                            </div>
                                        ) : (
                                            <div className="h-[400px] border-4 border-dashed border-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center text-[#2D241E]/10 font-black uppercase tracking-[0.2em] italic space-y-4">
                                                <ImageIcon size={60} /><span className="text-xs">ไม่พบสลิป</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative text-left">
                                        <div className="relative z-10 space-y-10">
                                            <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                                                <h3 className="text-xl font-black uppercase tracking-tighter italic text-[#2D241E]">จัดการสถานะ</h3>
                                                <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getBadgeStyle(selectedOrder.status)}`}>{selectedOrder.status}</span>
                                            </div>

                                            <div className="space-y-6">
                                                {selectedOrder.status !== 'สำเร็จ' && selectedOrder.status !== 'ยกเลิก' && (
                                                    <div className="space-y-4">
                                                        {selectedOrder.status === 'รอตรวจสอบชำระเงิน' && (
                                                            <>
                                                                <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'กำลังดำเนินการ')} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black text-lg transition-all shadow-md flex items-center justify-center gap-4 active:scale-95 uppercase tracking-widest">อนุมัติการชำระเงิน <CheckCircle2 size={24} /></button>
                                                                <button onClick={() => handleRejectSlip(selectedOrder.order_id)} className="w-full py-4 bg-white text-red-500 rounded-full font-black text-sm transition-all border border-red-50 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest">แจ้งสลิปไม่ถูกต้อง <RotateCcw size={18} /></button>
                                                            </>
                                                        )}
                                                        {selectedOrder.status === 'กำลังดำเนินการ' && (
                                                            <div className="space-y-8 animate-in fade-in">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {shippingProviders.map(p => (
                                                                        <button key={p.provider_id} onClick={() => setSelectedProvider(p.provider_name)} className={`py-4 rounded-2xl text-[10px] font-black transition-all border ${selectedProvider === p.provider_name ? 'bg-[#2D241E] text-white border-[#2D241E] shadow-md' : 'bg-white text-[#2D241E]/30 border-slate-100'}`}>{p.provider_name}</button>
                                                                    ))}
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[0.4em] ml-6">เลขพัสดุจัดส่ง</label>
                                                                    <input className="w-full p-5 rounded-full bg-slate-50/50 border border-slate-100 focus:bg-white outline-none font-black text-xl text-[#2D241E] transition-all tracking-[0.2em] uppercase italic text-center shadow-inner" placeholder="TRACKING-ID" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                                                                </div>
                                                                <button onClick={() => handleUpdateTracking(selectedOrder.order_id)} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black text-lg hover:bg-black transition-all shadow-md flex items-center justify-center gap-4 active:scale-95 uppercase tracking-widest">บันทึกการจัดส่ง <Truck size={24} /></button>
                                                            </div>
                                                        )}
                                                        {selectedOrder.status === 'กำลังจัดส่ง' && (
                                                            <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'สำเร็จ')} className="w-full py-5 bg-emerald-500 text-white rounded-full font-black text-lg shadow-md transition-all flex items-center justify-center gap-4 active:scale-95 uppercase tracking-widest">ทำรายการสำเร็จ <Package size={24} /></button>
                                                        )}
                                                        <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ยกเลิก')} className="w-full py-2 text-[#2D241E]/30 hover:text-red-500 font-black uppercase tracking-[0.4em] text-[10px] transition-colors mt-4">ยกเลิกรายการสั่งซื้อนี้</button>
                                                    </div>
                                                )}

                                                {selectedOrder.status === 'รอแก้ไขสลิป' && (
                                                    <div className="p-8 bg-slate-50/50 rounded-[2.5rem] text-center border border-slate-100 shadow-inner">
                                                        <Clock size={40} className="mx-auto text-[#2D241E]/10 mb-6" />
                                                        <p className="text-[#2D241E]/40 font-bold text-sm uppercase tracking-[0.2em]">รออัปเดตสลิปจากลูกค้า</p>
                                                        <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ยกเลิก')} className="text-red-400 font-black text-[9px] uppercase tracking-widest mt-6 hover:text-red-600 transition-colors">ยกเลิกออเดอร์เลย</button>
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
=======
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
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
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
<<<<<<< HEAD

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
=======
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
        </div>
    );
};

<<<<<<< HEAD
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
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-50 text-[#2D241E]/70 shrink-0 ml-4 group-hover:scale-110 group-hover:text-[#D97706] transition-all duration-500 relative z-10">
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
=======
// 💎 StatCard: เข้มชัดจัดเต็ม
const StatCardSmall = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border-2 border-[#2D241E] shadow-lg flex items-center justify-between hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1">{title}</p>
            <h2 className="text-[#2D241E] text-2xl font-black italic leading-none">{value || 0}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#2D241E] border-2 border-[#2D241E] shadow-inner group-hover:bg-[#2D241E] group-hover:text-white transition-all duration-500">
            {React.cloneElement(icon, { size: 20, strokeWidth: 3 })}
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
        </div>
    </div>
);

export default OrderManagement;