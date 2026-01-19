import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Eye, X, Loader2, PackageCheck, Clock, Truck,
    RefreshCw, CheckCircle2, ImageIcon, Menu, ExternalLink, ChevronLeft,
    ChevronRight, Sparkles, ListChecks, TrendingUp, Star, FileWarning, ArrowRightLeft
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Swal from 'sweetalert2';

const OrderManagement = () => {
    const navigate = useNavigate();
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

    const fetchOrders = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS);
            if (response.success) setOrders(response.data);
        } catch (err) { toast.error("ไม่สามารถดึงข้อมูลได้"); }
        finally { setLoading(false); }
    }, []);

    const fetchShippingProviders = useCallback(async () => {
        try {
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SHIPPING_PROVIDERS);
            const providers = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            if (providers.length > 0) {
                setShippingProviders(providers);
                setSelectedProviderId(providers[0].provider_id);
            }
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { 
        fetchOrders(); 
        fetchShippingProviders(); 
    }, [fetchOrders, fetchShippingProviders]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    const handleUpdateStatus = async (orderId, newStatus) => {
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
            title: 'ระบุเหตุผลที่ปฏิเสธสลิป',
            input: 'textarea',
            inputPlaceholder: 'ระบุเหตุผล...',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            customClass: { popup: 'rounded-[2rem] font-["Kanit"]' }
        });
        if (isConfirmed && reason) {
            const load = toast.loading("ดำเนินการ...");
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
        if (!trackingNumber || !selectedProviderId) return toast.error("ระบุข้อมูลให้ครบ");
        const load = toast.loading("บันทึก...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${id}/tracking`, {
                tracking_number: trackingNumber, provider_id: selectedProviderId, status: 'กำลังจัดส่ง'
            });
            if (res.success) {
                toast.success("สำเร็จ", { id: load });
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

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading && orders.length === 0) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-slate-800" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden relative max-w-full">
            <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="orders" />

            {/* 🚀 ปรับ Margin Left ตามความกว้าง 280px และลด Padding ขวา */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[280px]'} p-4 md:p-5 lg:p-6 lg:pr-4 w-full relative z-10`}>
                <div className="mb-4 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl text-[#111827] border border-slate-300 shadow-sm"><Menu size={24} /></button>
                    <Header title="จัดการคำสั่งซื้อ" isCollapsed={isCollapsed} />
                </div>

                {/* 🚀 ปรับ pt-24 เพื่อไม่ให้ Header บังข้อมูล */}
                <div className="pt-24">
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6 px-2">
                        <StatCardSmall title="ออเดอร์" value={orders.length} />
                        <StatCardSmall title="รอสลิป" value={orders.filter(o => o?.status === 'รอตรวจสอบชำระเงิน').length} />
                        <StatCardSmall title="ให้แก้" value={orders.filter(o => o?.status === 'รอแก้ไขสลิป').length} />
                        <StatCardSmall title="เตรียมของ" value={orders.filter(o => o?.status === 'กำลังดำเนินการ').length} />
                        <StatCardSmall title="จัดส่ง" value={orders.filter(o => o?.status === 'กำลังจัดส่ง').length} />
                        <StatCardSmall title="สำเร็จ" value={orders.filter(o => o?.status === 'สำเร็จ').length} />
                    </div>

                    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
                            <div className="flex flex-wrap gap-2 p-1 bg-slate-50 rounded-full border border-slate-200">
                                {statusList.map(s => (
                                    <button key={s} onClick={() => setFilterStatus(s)} 
                                        className={`px-4 py-1.5 rounded-full text-base font-medium uppercase transition-all ${filterStatus === s ? 'bg-white border border-[#111827] text-[#111827] shadow-sm' : 'text-[#374151] hover:bg-white'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full lg:max-w-md">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#374151]" />
                                <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border border-slate-200 outline-none text-xl font-medium text-[#111827] focus:bg-white" placeholder="ค้นหา Order ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[#000000] bg-slate-50 uppercase text-xl font-medium tracking-widest border-b border-slate-300">
                                        <th className="px-6 py-4">Full Order ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4 text-right">Grand Total</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paginatedOrders.map(order => (
                                        <tr key={order?.order_id} className="hover:bg-slate-50/50 transition-colors">
                                            {/* 📉 ปรับ py-4 เพื่อความกระชับ */}
                                            <td className="py-4 px-6 font-medium text-2xl text-[#000000] tracking-tighter">#{order?.order_id}</td>
                                            <td className="py-4 px-6 text-2xl font-medium text-[#111827] truncate max-w-[200px]">{order?.address?.recipient_name || 'GUEST'}</td>
                                            <td className="py-4 px-6 text-right font-medium text-3xl text-[#000000] italic">฿{order?.total_amount?.toLocaleString()}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="px-5 py-1 rounded-full text-lg font-medium border border-slate-300 text-[#000000] whitespace-nowrap inline-block uppercase tracking-widest shadow-sm">
                                                    {order?.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {/* 📉 ปุ่มแก้ไขขอบบาง 1px */}
                                                <button onClick={() => setSelectedOrder(order)} className="p-3 bg-white border border-slate-300 rounded-xl text-[#374151] hover:text-[#000000] transition-colors shadow-sm"><Eye size={24} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-6">
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === 1 ? 'opacity-30' : ''}`}><ChevronLeft size={28} /></button>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-medium text-[#374151] uppercase">Page</span>
                                    <div className="bg-white border border-[#111827] text-[#111827] px-6 py-1 rounded-lg text-3xl font-medium italic shadow-sm">{currentPage}</div>
                                    <span className="text-xl font-medium text-[#374151]">/ {totalPages}</span>
                                </div>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === totalPages ? 'opacity-30' : ''}`}><ChevronRight size={28} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- 📝 Detail Modal (Compact & High Contrast) --- */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-300 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-6 flex justify-between items-center border-b border-slate-200 bg-[#FDFDFE]">
                            <div className="flex items-center gap-4 text-left leading-none">
                                <div className="bg-slate-50 p-3 rounded-xl text-[#111827] border border-slate-200 shadow-sm"><PackageCheck size={28} /></div>
                                <div><p className="text-[10px] font-medium text-[#374151] uppercase tracking-widest leading-none mb-1">Details /</p><h2 className="text-2xl font-medium uppercase text-[#000000] tracking-tighter">{selectedOrder.order_id}</h2></div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-50 text-[#111827] border border-slate-200 rounded-full hover:text-red-600 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar text-left grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white">
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                                    <h3 className="font-medium text-[10px] uppercase mb-3 text-[#374151] tracking-widest italic border-b border-slate-200 pb-2">Customer Info</h3>
                                    <p className="font-medium text-2xl text-[#000000] mb-1">{selectedOrder.address?.recipient_name}</p>
                                    <p className="text-lg font-medium text-[#111827] mb-3">{selectedOrder.address?.phone_number}</p>
                                    <p className="text-lg italic text-[#111827] bg-white p-4 rounded-xl border border-slate-100">"{selectedOrder.address?.address_detail}"</p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-medium text-[10px] uppercase px-2 text-[#374151] tracking-widest">Purchased Items</h3>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl items-center shadow-sm">
                                            <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                                            <div className="flex-1 min-w-0"><p className="font-medium text-xl uppercase text-[#111827] truncate">{item.product?.product_name}</p><p className="text-base text-[#374151]">จำนวน {item.quantity} ชิ้น</p></div>
                                            <p className="font-medium italic text-2xl text-[#000000]">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 border border-slate-200 p-5 rounded-[2rem] text-center shadow-sm">
                                    <h3 className="font-medium text-[10px] uppercase mb-4 text-[#374151] tracking-widest italic border-b border-slate-200 pb-2">Payment Evidence</h3>
                                    {selectedOrder?.payments?.[0]?.slip_url ? (
                                        <div className="relative inline-block w-full">
                                            <img src={selectedOrder.payments[0].slip_url} className="w-full h-[350px] object-contain rounded-xl bg-white border border-slate-200" alt="Slip" />
                                            <button onClick={() => window.open(selectedOrder.payments[0].slip_url)} className="absolute bottom-3 right-3 bg-white text-[#111827] p-2.5 rounded-xl shadow-lg border border-slate-200"><ExternalLink size={20} /></button>
                                        </div>
                                    ) : (
                                        <div className="h-40 bg-white rounded-xl flex flex-col items-center justify-center text-[#374151] font-medium italic text-lg border border-dashed border-slate-200"><span>ไม่พบหลักฐานการโอน</span></div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                        <span className="text-[10px] uppercase font-medium text-[#374151] italic">Management</span>
                                        <span className="px-4 py-1 bg-white text-[#000000] border border-slate-300 rounded-full text-xs font-medium uppercase">{selectedOrder.status}</span>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedOrder.status === 'รอตรวจสอบชำระเงิน' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'กำลังดำเนินการ')} className="w-full py-4 bg-white border border-[#059669] text-[#059669] rounded-xl font-medium text-xl uppercase shadow-sm hover:bg-emerald-50 transition-all italic">อนุมัติการชำระเงิน</button>
                                                <button onClick={() => handleRejectSlip(selectedOrder.order_id)} className="w-full py-4 bg-white border border-[#DC2626] text-[#DC2626] rounded-xl font-medium text-xl uppercase shadow-sm hover:bg-red-50 transition-all italic">แจ้งสลิปไม่ถูกต้อง</button>
                                            </>
                                        )}
                                        {selectedOrder.status === 'กำลังดำเนินการ' && (
                                            <div className="space-y-4">
                                                <select className="w-full p-4 rounded-xl bg-white text-[#000000] font-medium text-xl border border-slate-300 outline-none shadow-inner" value={selectedProviderId} onChange={e => setSelectedProviderId(e.target.value)}>
                                                    {shippingProviders.map(p => <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>)}
                                                </select>
                                                <input className="w-full p-4 rounded-xl bg-white text-[#000000] font-medium text-xl uppercase border border-slate-300 shadow-inner outline-none" placeholder="กรอกเลขพัสดุ..." value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                                                <button onClick={() => handleUpdateTracking(selectedOrder.order_id)} className="w-full py-4 bg-white border border-[#2563EB] text-[#2563EB] rounded-xl font-medium text-xl uppercase shadow-sm hover:bg-blue-50 transition-all italic">บันทึกข้อมูลจัดส่ง</button>
                                            </div>
                                        )}
                                        {selectedOrder.status === 'กำลังจัดส่ง' && (
                                            <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'สำเร็จ')} className="w-full py-5 bg-white border border-[#059669] text-[#059669] rounded-xl font-medium text-2xl uppercase shadow-sm hover:bg-emerald-50 transition-all italic">ยืนยันรายการสำเร็จ</button>
                                        )}
                                        <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ยกเลิก')} className="w-full text-base uppercase font-medium text-[#374151] hover:text-red-600 transition-all mt-2 italic underline underline-offset-4 decoration-1">ยกเลิกรายการนี้</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner">
                            <div className="text-left w-full sm:w-auto leading-none"><p className="text-[10px] font-medium text-[#374151] uppercase tracking-widest mb-1 italic leading-none">Total Amount</p><p className="text-5xl font-medium text-[#000000] italic tracking-tighter leading-none">฿{selectedOrder.total_amount?.toLocaleString()}</p></div>
                            <button onClick={() => setSelectedOrder(null)} className="w-full sm:w-auto px-12 py-5 bg-white border border-[#000000] rounded-full font-medium uppercase text-xl text-[#000000] hover:bg-slate-50 transition-all shadow-sm active:scale-95">CLOSE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 StatCard: ปรับระยะ p-6 และขอบบาง 1px
const StatCardSmall = ({ title, value }) => (
    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm flex flex-col gap-1 text-left">
        <p className="text-xl font-medium text-[#374151] uppercase tracking-widest italic leading-none">{title}</p>
        <h2 className="text-5xl font-medium italic tracking-tighter text-[#000000] leading-none mt-2 truncate">{value || 0}</h2>
    </div>
);

export default OrderManagement;