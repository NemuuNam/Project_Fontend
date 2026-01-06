import React, { useEffect, useState, useCallback } from 'react';
import { 
    ShoppingBag, Search, Eye, X, MapPin, CreditCard, 
    Loader2, PackageCheck, Clock, Coins, Truck, 
    RefreshCw, CheckCircle2, ImageIcon, Menu 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingProviders, setShippingProviders] = useState([]); 
    const [selectedProvider, setSelectedProvider] = useState('');

    // --- 1. ฟังก์ชันกำหนดสีสถานะ (จุดที่แก้ไข) ---
    const getBadgeStyle = (status) => {
        const colors = {
            'สำเร็จ': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' },
            'รอตรวจสอบชำระเงิน': { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' },
            'กำลังดำเนินการ': { bg: '#f0f9ff', text: '#0284c7', border: '#e0f2fe' },
            'กำลังจัดส่ง': { bg: '#eef2ff', text: '#4f46e5', border: '#e0e7ff' },
            'ยกเลิก': { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2' }
        };
        const s = colors[status] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
        return { 
            backgroundColor: s.bg, 
            color: s.text, 
            border: `1px solid ${s.border}`,
            whiteSpace: 'nowrap'
        };
    };

    const fetchShippingProviders = useCallback(async () => {
        try {
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SHIPPING_PROVIDERS);
            let providers = res.success ? res.data : (Array.isArray(res) ? res : []);
            if (providers.length > 0) { 
                setShippingProviders(providers); 
                setSelectedProvider(providers[0].provider_name); 
            }
        } catch (err) { 
            setShippingProviders([{ provider_id: 3, provider_name: 'Nim Express' }, { provider_id: 4, provider_name: 'Flash Express' }]); 
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try { 
            setLoading(true); 
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS); 
            if (res.success) setOrders(res.data || []); 
        }
        catch (err) { toast.error("ดึงข้อมูลคำสั่งซื้อล้มเหลว"); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchOrders(); fetchShippingProviders(); }, [fetchOrders, fetchShippingProviders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        const load = toast.loading(`กำลังปรับปรุงสถานะ...`);
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${orderId}/status`, { status: newStatus });
            if (res.success) { 
                toast.success(`เปลี่ยนเป็นสถานะ ${newStatus} แล้ว`, { id: load }); 
                setSelectedOrder(null); 
                fetchOrders(); 
            }
        } catch (err) { toast.error("ไม่สำเร็จ", { id: load }); }
    };

    const handleUpdateTracking = async (orderId) => {
        if (!trackingNumber) return toast.error("กรุณาระบุเลขพัสดุ");
        const load = toast.loading("กำลังบันทึกข้อมูล...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${orderId}/tracking`, { 
                tracking_number: trackingNumber, 
                shipping_provider: selectedProvider, 
                status: 'กำลังจัดส่ง' 
            });
            if (res.success) { 
                toast.success("บันทึกสำเร็จ", { id: load }); 
                setSelectedOrder(null); 
                fetchOrders(); 
            }
        } catch (err) { toast.error("ล้มเหลว", { id: load }); }
    };

    const filteredOrders = orders.filter(o => 
        (o.order_id?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (o.address?.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-900" size={65} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-slate-900 overflow-x-hidden">
            <Toaster position="top-right" />
            <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                isMobileOpen={isSidebarOpen} 
                setIsMobileOpen={setIsSidebarOpen} 
                activePage="orders" 
            />

            <main className={`flex-1 p-4 md:p-8 lg:p-10 transition-all duration-300 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[300px]'} w-full`}>
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-600">
                        <Menu size={24} />
                    </button>
                    <Header title="Order Management" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">ORDERS HISTORY</p>
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">Orders</h1>
                    </div>
                    <button onClick={fetchOrders} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-2 border-slate-100 flex items-center justify-center hover:border-slate-900 transition-all group">
                        <RefreshCw size={24} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-12 text-center">
                    <StatCardWhite title="ออเดอร์ทั้งหมด" value={orders.length} icon={<ShoppingBag size={24} />} color="#4318ff" />
                    <StatCardWhite title="รอเช็กสลิป" value={orders.filter(o => o.status === 'รอตรวจสอบชำระเงิน').length} icon={<Clock size={24} />} color="#ea580c" />
                    <StatCardWhite title="กำลังจัดส่ง" value={orders.filter(o => o.status === 'กำลังจัดส่ง').length} icon={<Truck size={24} />} color="#4f46e5" />
                    <StatCardWhite title="ยอดขายรวม" value={`฿${orders.reduce((acc, o) => acc + (o.total_amount || 0), 0).toLocaleString()}`} icon={<Coins size={24} />} color="#10b981" />
                </div>

                <div className="bg-white p-5 md:p-8 lg:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-10">
                        <h3 className="text-xl md:text-3xl font-black text-slate-900">📦 รายการคำสั่งซื้อ</h3>
                        <div className="relative w-full max-w-md">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                className="w-full pl-12 pr-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all" 
                                placeholder="ค้นหาออเดอร์..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full min-w-[800px] text-left border-separate border-spacing-y-3 text-center">
                            <thead>
                                <tr className="text-slate-400 uppercase text-[10px] md:text-xs font-black tracking-widest">
                                    <th className="px-4 pb-4">ID</th>
                                    <th className="px-4 pb-4 text-left">Customer</th>
                                    <th className="px-4 pb-4 text-right">Amount</th>
                                    <th className="px-4 pb-4">Status</th>
                                    <th className="px-4 pb-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.order_id} className="group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                        <td className="px-4 py-6 rounded-l-2xl md:rounded-l-3xl font-black text-blue-600 text-sm md:text-lg">#{order.order_id.substring(0, 10).toUpperCase()}</td>
                                        <td className="px-4 py-6 font-bold text-slate-600 text-sm md:text-lg text-left whitespace-nowrap">{order.address?.recipient_name || 'ลูกค้าทั่วไป'}</td>
                                        <td className="px-4 py-6 font-black text-lg md:text-2xl text-right text-slate-900">฿{order.total_amount?.toLocaleString()}</td>
                                        <td className="px-4 py-6">
                                            {/* ✅ แก้ไขสีสถานะในตาราง */}
                                            <span className="px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase" style={getBadgeStyle(order.status)}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-6 rounded-r-2xl md:rounded-r-3xl">
                                            <button className="p-2 md:p-3 bg-white text-slate-400 border border-slate-100 rounded-xl hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"><Eye size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* ✅ Modal แก้ไขขนาดและสีสถานะ */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white w-full max-w-6xl rounded-[30px] md:rounded-[50px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in fade-in zoom-in" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-5 md:p-10 flex justify-between items-center border-b border-slate-50">
                            <div className="flex items-center gap-3 md:gap-6">
                                <div className="bg-slate-50 p-2 md:p-5 rounded-xl md:rounded-[25px] border border-slate-100"><PackageCheck size={20} md:size={35} /></div>
                                <div className="min-w-0">
                                    <h2 className="text-lg md:text-4xl font-black text-slate-900 tracking-tight leading-tight">Order Detail</h2>
                                    <p className="text-slate-400 font-bold text-[10px] md:text-lg uppercase tracking-widest truncate">#{selectedOrder.order_id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 md:p-4 bg-slate-50 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all text-slate-400"><X size={20}/></button>
                        </div>

                        <div className="overflow-y-auto p-5 md:p-10 flex-1 hide-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                                
                                <div className="lg:col-span-7 space-y-6 md:space-y-8">
                                    <div className="bg-white p-6 md:p-8 rounded-[30px] border border-slate-100 shadow-sm">
                                        <h3 className="text-slate-900 font-black text-base md:text-xl mb-6 flex items-center gap-3"><MapPin size={20} className="text-blue-600" /> ที่อยู่จัดส่ง</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-sm md:text-lg font-bold">
                                            <div><p className="text-slate-400 text-[10px] font-black uppercase mb-1">ผู้รับ</p>{selectedOrder.address?.recipient_name}</div>
                                            <div><p className="text-slate-400 text-[10px] font-black uppercase mb-1">โทรศัพท์</p>{selectedOrder.address?.phone_number}</div>
                                            <div className="sm:col-span-2"><p className="text-slate-400 text-[10px] font-black uppercase mb-1">ที่อยู่</p><p className="font-medium text-slate-600 text-xs md:text-md leading-relaxed">{selectedOrder.address?.address_detail}</p></div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 md:p-8 rounded-[30px] border border-slate-100 shadow-sm">
                                        <h3 className="text-slate-900 font-black text-base md:text-xl mb-6 flex items-center gap-3"><ShoppingBag size={20} className="text-blue-600" /> รายการสินค้า</h3>
                                        <div className="space-y-4 md:space-y-6">
                                            {selectedOrder.items?.map((item, idx) => {
                                                const product = item.product;
                                                const imageUrl = product?.images?.[0]?.image_url || product?.Product_Images?.[0]?.image_url;
                                                return (
                                                    <div key={idx} className="flex items-center gap-3 md:gap-6 pb-4 md:pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                                        <div className="w-12 h-12 md:w-24 md:h-24 rounded-xl md:rounded-3xl overflow-hidden border border-slate-50 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                                                            {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" alt="product" /> : <ImageIcon size={20} className="text-slate-200" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-sm md:text-2xl text-slate-900 truncate">{product?.product_name}</p>
                                                            <p className="text-[10px] md:text-md font-bold text-slate-400 uppercase tracking-wide">฿{item.price_at_order?.toLocaleString()} × {item.quantity}</p>
                                                        </div>
                                                        <p className="font-black text-base md:text-3xl text-slate-900">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-8 pt-6 md:pt-8 border-t-2 border-slate-50 flex justify-between items-center">
                                            <span className="text-slate-400 font-black uppercase text-[10px] md:text-xs tracking-widest">ยอดสุทธิรวม</span>
                                            <span className="text-2xl md:text-5xl font-black italic tracking-tighter text-slate-900">฿{selectedOrder.total_amount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-5 space-y-6 md:space-y-8">
                                    <div className="bg-white p-6 md:p-8 rounded-[30px] border border-slate-100 text-center shadow-sm">
                                        <h3 className="text-slate-900 font-black text-base md:text-xl mb-6 flex items-center gap-3 justify-center"><CreditCard size={20} className="text-blue-600" /> หลักฐานการชำระ</h3>
                                        {selectedOrder.payments?.[0]?.slip_url ? (
                                            <img src={selectedOrder.payments[0].slip_url} className="w-full max-h-48 md:max-h-80 object-contain rounded-[20px] shadow-sm border border-slate-100 cursor-pointer" alt="Slip" onClick={() => window.open(selectedOrder.payments[0].slip_url)} />
                                        ) : (
                                            <div className="py-10 md:py-20 border-2 border-dashed border-slate-100 rounded-[30px] text-slate-300 font-black italic text-xs md:text-sm">ยังไม่มีสลิป</div>
                                        )}
                                    </div>

                                    <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[45px] border-2 border-blue-50 shadow-xl shadow-blue-100/20">
                                        <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-slate-50">
                                            <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 text-slate-900"><Clock size={16} className="text-blue-600" /> STATUS FLOW</h3>
                                            {/* ✅ แก้ไขสีสถานะใน Modal */}
                                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase" style={getBadgeStyle(selectedOrder.status)}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>

                                        {selectedOrder.status === 'รอตรวจสอบชำระเงิน' && (
                                            <div className="space-y-3">
                                                <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'กำลังดำเนินการ')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm md:text-lg transition-all shadow-lg shadow-blue-100">ยืนยันสลิปเงินโอน</button>
                                                <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ยกเลิก')} className="w-full py-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-xl font-bold text-xs transition-all">ยกเลิกออเดอร์</button>
                                            </div>
                                        )}

                                        {selectedOrder.status === 'กำลังดำเนินการ' && (
                                            <div className="space-y-4 md:space-y-6">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {shippingProviders.map(p => (
                                                        <button key={p.provider_id} onClick={() => setSelectedProvider(p.provider_name)} className={`py-2 px-2 rounded-lg text-[9px] md:text-[11px] font-black transition-all border-2 ${selectedProvider === p.provider_name ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                                                            {p.provider_name}
                                                        </button>
                                                    ))}
                                                </div>
                                                <input className="w-full p-4 md:p-5 rounded-xl bg-slate-50 border-none outline-none font-bold text-sm md:text-lg text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all" placeholder="กรอกเลขพัสดุที่นี่..." value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                                                <button onClick={() => handleUpdateTracking(selectedOrder.order_id)} disabled={!selectedProvider || !trackingNumber} className={`w-full py-4 md:py-5 rounded-xl font-black text-sm md:text-lg transition-all ${selectedProvider && trackingNumber ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>บันทึกและจัดส่ง</button>
                                            </div>
                                        )}

                                        {selectedOrder.status === 'กำลังจัดส่ง' && (
                                            <div className="space-y-4 md:space-y-6 text-center">
                                                <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
                                                    <p className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase mb-1 md:mb-2 tracking-widest">Tracking Number</p>
                                                    <p className="text-xl md:text-3xl font-black italic text-slate-900 truncate">{selectedOrder.tracking_number}</p>
                                                </div>
                                                <button onClick={() => handleUpdateStatus(selectedOrder.order_id, 'สำเร็จ')} className="w-full py-4 md:py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-lg shadow-emerald-100 transition-all">ยืนยันสินค้าถึงมือลูกค้า</button>
                                            </div>
                                        )}

                                        {selectedOrder.status === 'สำเร็จ' && (
                                            <div className="text-center py-6 md:py-10">
                                                <div className="bg-emerald-50 text-emerald-500 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm"><CheckCircle2 size={32} md:size={40} /></div>
                                                <p className="text-xl md:text-2xl font-black italic text-slate-900 uppercase tracking-tighter">ORDER COMPLETE</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCardWhite = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 md:p-8 rounded-[25px] md:rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-1 duration-300">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-3 truncate">{title}</p>
            <h2 className="text-slate-900 text-2xl md:text-4xl lg:text-5xl font-black italic tracking-tighter leading-none truncate">{value}</h2>
        </div>
        <div style={{ background: `${color}08`, color: color }} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[22px] flex items-center justify-center border-2 md:border-4 border-white shadow-lg shadow-slate-50 shrink-0 ml-2">
            {icon}
        </div>
    </div>
);

export default OrderManagement;