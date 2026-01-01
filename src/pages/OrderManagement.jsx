import React, { useEffect, useState, useCallback } from 'react';
import { 
    ShoppingBag, Search, Eye, X, MapPin, CreditCard, 
    Loader2, PackageCheck, Clock, Coins, Truck, 
    Copy
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 

// --- API Config & Instance ---
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
    const [isEditing, setIsEditing] = useState(false); 

    // ✅ State สำหรับจัดการรายชื่อขนส่งจากตาราง D15
    const [shippingProviders, setShippingProviders] = useState([]); 
    const [selectedProvider, setSelectedProvider] = useState('');

    const statusOptions = ['รอตรวจสอบชำระเงิน', 'กำลังดำเนินการ', 'กำลังจัดส่ง', 'สำเร็จ', 'ยกเลิก'];

    /**
     * ✅ ดึงรายชื่อขนส่งจากตาราง Shipping_Providers (D15)
     */
    const fetchShippingProviders = useCallback(async () => {
        try {
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SHIPPING_PROVIDERS);
            // ตรวจสอบโครงสร้างข้อมูลที่ส่งมาจาก Backend
            const providers = res.data || res; 
            if (Array.isArray(providers)) {
                setShippingProviders(providers);
                if (providers.length > 0) setSelectedProvider(providers[0].provider_name);
            }
        } catch (err) {
            console.error("Fetch shipping providers failed:", err);
        }
    }, []);

    /**
     * ✅ ดึงรายการออเดอร์ทั้งหมด
     */
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

    useEffect(() => { 
        fetchOrders(); 
        fetchShippingProviders(); 
    }, [fetchOrders, fetchShippingProviders]);

    /**
     * ✅ อัปเดตสถานะทั่วไป (เช่น ยืนยันสลิป หรือ ยกเลิกเพื่อคืนสต็อก)
     */
    const handleUpdateStatus = async (orderId, newStatus) => {
        const load = toast.loading(`กำลังเปลี่ยนสถานะเป็น ${newStatus}...`);
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${orderId}/status`, { status: newStatus });
            if (res.success) {
                toast.success(`อัปเดตสถานะสำเร็จ`, { id: load });
                setSelectedOrder(null); 
                fetchOrders();
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "อัปเดตไม่สำเร็จ", { id: load }); 
        }
    };

    /**
     * ✅ อัปเดตข้อมูลจัดส่ง (Tracking + Provider Tags)
     */
    const handleUpdateTracking = async (orderId) => {
        if (!trackingNumber) return toast.error("กรุณาระบุเลขพัสดุ");
        if (!selectedProvider) return toast.error("กรุณาเลือกบริษัทขนส่ง");
        
        const load = toast.loading("กำลังบันทึกข้อมูลจัดส่ง...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.ORDERS}/${orderId}/tracking`, { 
                tracking_number: trackingNumber, 
                shipping_provider: selectedProvider,
                status: 'สำเร็จ' 
            });
            if (res.success) {
                toast.success("บันทึกข้อมูลจัดส่งเรียบร้อยแล้ว", { id: load });
                setIsEditing(false); setSelectedOrder(null); fetchOrders();
            }
        } catch (err) { 
            toast.error("บันทึกล้มเหลว", { id: load }); 
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("คัดลอกรหัสออเดอร์แล้ว");
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'รอตรวจสอบชำระเงิน').length,
        processing: orders.filter(o => ['กำลังดำเนินการ', 'กำลังจัดส่ง'].includes(o.status)).length,
        revenue: orders.reduce((acc, o) => acc + (o.total_amount || 0), 0)
    };

    const filteredOrders = orders.filter(order => {
        const search = searchTerm.toLowerCase().trim();
        return (
            order.order_id?.toLowerCase().includes(search) || 
            order.address?.recipient_name?.toLowerCase().includes(search)
        );
    });

    const getStatusStyle = (status) => {
        const colors = {
            'สำเร็จ': { bg: '#dcfce7', text: '#15803d' },
            'รอตรวจสอบชำระเงิน': { bg: '#fff7ed', text: '#f97316' },
            'กำลังดำเนินการ': { bg: '#e0f2fe', text: '#0369a1' },
            'กำลังจัดส่ง': { bg: '#e0e7ff', text: '#4338ca' },
            'ยกเลิก': { bg: '#fee2e2', text: '#b91c1c' }
        };
        const s = colors[status] || { bg: '#f1f5f9', text: '#64748b' };
        return {
            backgroundColor: s.bg, color: s.text,
            padding: '6px 14px', borderRadius: '10px',
            fontSize: '11px', fontWeight: '800'
        };
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#f4f7fe]">
            <Loader2 className="animate-spin text-[#4318ff]" size={45} />
        </div>
    );

    return (
        <div className="order-page-layout text-[#1b2559]">
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap');
                .order-page-layout { display: flex; min-height: 100vh; background-color: #f4f7fe; font-family: 'Kanit', sans-serif; }
                .main-panel { flex: 1; margin-left: ${isCollapsed ? '85px' : '285px'}; padding: 30px; transition: all 0.3s ease; width: 100%; box-sizing: border-box; }
                @media (max-width: 1024px) { .main-panel { margin-left: 0 !important; padding: 20px; } }

                .table-main-card { background: #fff; border-radius: 40px; padding: 35px; border: 1px solid #f1f5f9; box-shadow: 0 15px 35px rgba(0,0,0,0.02); }
                .order-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
                .order-table th { color: #a3aed0; font-size: 12px; font-weight: 800; text-transform: uppercase; padding: 0 15px 20px 15px; letter-spacing: 1px; }
                .order-table td { padding: 20px 15px; border-top: 1px solid #f8fafc; font-size: 14px; font-weight: 600; vertical-align: middle; }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 3000; padding: 20px; }
                .modal-box { background: white; width: 100%; max-width: 850px; border-radius: 45px; padding: 45px; position: relative; max-height: 90vh; overflow-y: auto; overflow-x: hidden; box-shadow: 0 30px 60px -12px rgba(27, 37, 89, 0.2); }
                .modal-box::-webkit-scrollbar { width: 6px; }
                .modal-box::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="orders" />

            <main className="main-panel">
                <Header title="จัดการรายการสั่งซื้อ" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="ออเดอร์ทั้งหมด" value={stats.total} icon={<ShoppingBag size={20}/>} color="#4318ff" />
                    <StatCard title="รอเช็กสลิป" value={stats.pending} icon={<Clock size={20}/>} color="#f97316" />
                    <StatCard title="ดำเนินการอยู่" value={stats.processing} icon={<Truck size={20}/>} color="#4318ff" />
                    <StatCard title="รายได้สุทธิ" value={`฿${stats.revenue.toLocaleString()}`} icon={<Coins size={20}/>} color="#05cd99" />
                </div>

                <div className="table-main-card">
                    <div className="relative max-w-md mb-8">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-[#4318ff] transition-all font-medium" placeholder="ค้นหาออเดอร์ หรือ ชื่อลูกค้า..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="order-table text-center">
                            <thead>
                                <tr>
                                    <th>ID ออเดอร์</th>
                                    <th>ลูกค้า</th>
                                    <th>ยอดชำระ</th>
                                    <th>สถานะ</th>
                                    <th>การจัดส่ง</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.order_id}>
                                        <td>
                                            <div className="flex items-center gap-2 justify-center">
                                                <span className="text-[#4318ff] font-extrabold font-mono">{order.order_id}</span>
                                                <Copy size={12} className="text-gray-300 cursor-pointer hover:text-[#4318ff]" onClick={() => copyToClipboard(order.order_id)} />
                                            </div>
                                        </td>
                                        <td>{order.address?.recipient_name || 'ทั่วไป'}</td>
                                        <td className="font-extrabold text-[#1b2559]">฿{order.total_amount?.toLocaleString()}</td>
                                        <td>
                                            <select 
                                                style={getStatusStyle(order.status)} 
                                                value={order.status} 
                                                onChange={(e) => handleUpdateStatus(order.order_id, e.target.value)}
                                                className="cursor-pointer border-none outline-none"
                                            >
                                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            {order.tracking_number ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase">
                                                        {order.shippings?.[0]?.provider?.provider_name || 'ขนส่ง'}
                                                    </span>
                                                    <code className="bg-blue-50 px-2 py-0.5 rounded text-[#4318ff] text-[11px] font-bold">{order.tracking_number}</code>
                                                </div>
                                            ) : <span className="text-gray-300 text-xs italic">รอดำเนินการ</span>}
                                        </td>
                                        <td>
                                            <button className="bg-[#f4f7fe] text-[#4318ff] px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 mx-auto hover:bg-[#eef2ff]" onClick={() => { setSelectedOrder(order); setTrackingNumber(order.tracking_number || ''); setIsEditing(false); }}>
                                                <Eye size={14} /> ดูข้อมูล
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedOrder(null)} className="absolute right-8 top-8 p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#4318ff]"><X size={20}/></button>
                        
                        <div className="text-center mb-10">
                            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"><PackageCheck size={38} className="text-[#4318ff]" /></div>
                            <h2 className="text-2xl font-extrabold">ออเดอร์ {selectedOrder.order_id}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm leading-relaxed">
                            <div className="bg-[#f8fafc] p-6 rounded-[30px] border border-blue-50">
                                <h4 className="flex items-center gap-2 text-[#4318ff] font-bold mb-3"><MapPin size={18}/> ที่อยู่จัดส่ง</h4>
                                <p><strong>ผู้รับ:</strong> {selectedOrder.address?.recipient_name}</p>
                                <p><strong>โทร:</strong> {selectedOrder.address?.phone_number}</p>
                                <p className="text-gray-500 mt-2">{selectedOrder.address?.address_detail}</p>
                            </div>

                            <div className="bg-[#f8fafc] p-6 rounded-[30px] border border-blue-50 flex flex-col items-center justify-center text-center">
                                <h4 className="flex items-center gap-2 text-[#4318ff] font-bold mb-3"><CreditCard size={18}/> หลักฐานการชำระเงิน</h4>
                                {selectedOrder.payments?.[0]?.slip_url ? (
                                    <img src={selectedOrder.payments[0].slip_url} className="max-h-40 rounded-xl shadow-md cursor-pointer" alt="Slip" onClick={() => window.open(selectedOrder.payments[0].slip_url)} />
                                ) : <p className="text-gray-400 italic">ยังไม่แจ้งชำระ</p>}
                            </div>
                        </div>

                        <div className="border-2 border-[#f8fafc] rounded-[35px] p-8 mb-8">
                            <h4 className="font-bold text-base mb-4">รายการสินค้า</h4>
                            {selectedOrder.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <div>
                                        <p className="font-bold text-sm">{item.product?.product_name}</p>
                                        <p className="text-xs text-gray-400">฿{item.price_at_order?.toLocaleString()} x {item.quantity}</p>
                                    </div>
                                    <p className="font-extrabold text-[#4318ff]">฿{(item.price_at_order * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                            <div className="flex justify-between mt-6 pt-6 border-t-2 border-gray-50 items-center">
                                <span className="font-bold text-lg">ยอดรวมสุทธิ</span>
                                <span className="text-3xl font-black text-[#4318ff]">฿{selectedOrder.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* ✅ จัดการ Tracking (D14 & D15) */}
                        <div>
                            {(selectedOrder.status === 'กำลังดำเนินการ' || isEditing) ? (
                                <div className="p-8 bg-[#f0f9ff]/50 rounded-[40px] border border-blue-100 shadow-inner">
                                    <h4 className="text-sm font-extrabold mb-5 flex items-center gap-2 text-[#0369a1]"><Truck size={20}/> บันทึกการจัดส่ง (D15 Tags)</h4>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {shippingProviders.map(provider => (
                                            <button 
                                                key={provider.provider_id} 
                                                onClick={() => setSelectedProvider(provider.provider_name)}
                                                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${selectedProvider === provider.provider_name ? 'bg-[#4318ff] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                            >
                                                {provider.provider_name}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <input className="flex-1 p-4 rounded-2xl bg-white outline-none shadow-sm font-bold" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="ระบุเลขพัสดุ..." />
                                        <button onClick={() => handleUpdateTracking(selectedOrder.order_id)} className="bg-[#05cd99] text-white px-10 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-transform">ยืนยันส่งของ</button>
                                    </div>
                                </div>
                            ) : selectedOrder.status === 'รอตรวจสอบชำระเงิน' && (
                                <div className="flex gap-4">
                                    <button className="flex-1 bg-[#4318ff] text-white h-14 rounded-2xl font-bold text-base shadow-lg" onClick={() => handleUpdateStatus(selectedOrder.order_id, 'กำลังดำเนินการ')}>ยืนยันสลิปเงินโอน</button>
                                    <button className="w-32 bg-red-50 text-red-500 font-bold rounded-2xl" onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ยกเลิก')}>ยกเลิกออเดอร์</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-[30px] flex justify-between items-center border border-gray-50 shadow-sm">
        <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{title}</p>
            <h2 className="text-xl font-black">{typeof value === 'number' ? value.toLocaleString() : value}</h2>
        </div>
        <div style={{ backgroundColor: `${color}15`, color: color }} className="p-3 rounded-2xl">{icon}</div>
    </div>
);

export default OrderManagement;