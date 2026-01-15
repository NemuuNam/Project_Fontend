import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, ShoppingBag, Box, Users, Loader2,
    RefreshCw, ArrowRight, Package, Menu, ChevronRight,
    Sparkles, PieChart, TrendingUp, Star
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, totalStock: 0, customerCount: 0, recentOrders: [], topProducts: [] });
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- 📦 Logic (คงเดิม 100%) ---
    const fetchDashboardData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true); else setIsRefreshing(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD);
            if (res.success) setStats(res.data);
        } catch (err) { toast.error("ดึงข้อมูลไม่สำเร็จ"); } finally { setLoading(false); setIsRefreshing(false); }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="dashboard" />

<<<<<<< HEAD
            {/* ปรับปรุง Responsive Margin และ Padding ของ Main */}
            <main className={`flex-1 transition-all duration-500 ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[300px]'} p-4 md:p-10 lg:p-14 w-full relative z-10`}>
                
                {/* Header Section ปรับให้กดง่ายขึ้นใน Mobile */}
                <div className="mb-8 md:mb-1 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3.5 bg-white rounded-2xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-95 transition-all"><Menu size={24} /></button>
                    <Header title="แผงควบคุมหลัก" />
                </div>

                {/* 🏷️ Hero Header Section - ปรับขนาด Text ตามขนาดหน้าจอ */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12 md:mb-16 px-2 text-left">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 animate-bounce-slow">
                            <Sparkles size={14} className="text-[#D97706]" />
                            <span className="text-[20px] font-black uppercase tracking-[0.3em] text-[#2D241E]/60">ภาพรวมการดำเนินงาน</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">
                            แดช<span className="opacity-80">บอร์ด</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <button onClick={() => fetchDashboardData(true)} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-90 group shrink-0">
                            <RefreshCw size={20} className={`text-[#2D241E] ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        </button>
=======
            {/* 🚀 Main Layout - Scale มาตรฐาน Product */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-8 lg:p-10 w-full relative z-10`}>
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] shadow-sm border-2 border-[#2D241E] active:scale-95"><Menu size={24} /></button>
                    <Header title="แผงควบคุมหลัก" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 px-2 text-left">
                    <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                            <Sparkles size={14} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">System Overview</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">Dashboard</h1>
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                    </div>
                    <button onClick={() => fetchDashboardData(true)} className="p-4 rounded-2xl bg-white border-2 border-[#2D241E] shadow-lg hover:rotate-180 transition-all active:scale-90 group shrink-0">
                        <RefreshCw size={24} className={`text-[#2D241E] ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={3} />
                    </button>
                </div>

                {/* 📊 Stat Cards - ตัวหนังสือเข้มชัด 100% */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 px-2">
                    <StatCardSmall title="รายรับทั้งหมด" value={`฿${(stats.totalSales || 0).toLocaleString()}`} icon={<DollarSign />} color="#2D241E" />
                    <StatCardSmall title="ออเดอร์สำเร็จ" value={(stats.orderCount || 0).toLocaleString()} icon={<ShoppingBag />} color="#2D241E" />
                    <StatCardSmall title="สินค้าในคลัง" value={(stats.totalStock || 0).toLocaleString()} icon={<Box />} color="#2D241E" />
                    <StatCardSmall title="ลูกค้าทั้งหมด" value={(stats.customerCount || 0).toLocaleString()} icon={<Users />} color="#2D241E" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Recent Orders Table - High Contrast */}
                    <div className="xl:col-span-8">
<<<<<<< HEAD
                        <div className="bg-white p-5 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md">
                            <Activity className="absolute -bottom-6 -right-6 text-[#2D241E] opacity-[0.01] group-hover:scale-110 transition-transform duration-700" size={200} />
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 relative z-10 text-left">
                                <div className="space-y-1">
                                    <h3 className="text-2xl md:text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic">คำสั่งซื้อ</h3>
                                    <p className="text-[20px] font-bold text-[#2D241E]/80 uppercase tracking-widest">รายการคำสั่งซื้อล่าสุด</p>
                                </div>
                                <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#2D241E] border border-slate-100 rounded-full font-black flex items-center justify-center gap-3 hover:gap-5 transition-all uppercase text-[15px] tracking-widest shadow-sm active:scale-95" onClick={() => navigate('/admin/orders')}>
                                    ดูทั้งหมด <ArrowRight size={14} className="text-[#D97706]" />
                                </button>
=======
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl 2xl:text-2xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-2">
                                    <TrendingUp size={20} strokeWidth={3} /> คำสั่งซื้อล่าสุด
                                </h3>
                                <button className="text-xs font-black uppercase border-b-2 border-[#2D241E] pb-1 text-[#2D241E] hover:opacity-50 transition-all" onClick={() => navigate('/admin/orders')}>ดูทั้งหมด</button>
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
<<<<<<< HEAD
                                        <tr className="text-[#2D241E]/80 uppercase text-[20px] font-black tracking-[0.2em] text-left px-6">
                                            <th className="px-8 pb-2">หมายเลขคำสั่งซื้อ</th>
                                            <th className="px-8 pb-2">ชื่อผู้สั่ง</th>
                                            <th className="px-8 pb-2 text-right">มูลค่า</th>
                                            <th className="px-8 pb-2 text-center">สถานะ</th>
=======
                                        <tr className="text-[#2D241E] uppercase text-[10px] font-black tracking-widest px-6">
                                            <th className="px-6 pb-2">ID</th>
                                            <th className="px-6 pb-2">Customer</th>
                                            <th className="px-6 pb-2 text-right">Total</th>
                                            <th className="px-6 pb-2 text-center">Status</th>
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentOrders?.map(order => (
<<<<<<< HEAD
                                            <tr key={order.order_id} className="group/row hover:translate-x-1 transition-all cursor-pointer" onClick={() => navigate(`/admin/orders`)}>
                                                <td className="py-6 px-8 rounded-l-[1.5rem] md:rounded-l-[2rem] bg-white border border-slate-50 font-black text-[#2D241E] uppercase tracking-tighter text-xl">#{order.order_id?.substring(0, 8)}</td>
                                                <td className="py-6 px-8 bg-white border-y border-slate-50 font-bold text-xl text-[#2D241E]">{order.customer_name.substring(0, 5)}</td>
                                                <td className="py-6 px-8 bg-white border-y border-slate-50 font-black text-xl text-right text-[#2D241E]">฿{(order.total || 0).toLocaleString()}</td>
                                                <td className="py-6 px-8 rounded-r-[1.5rem] md:rounded-r-[2rem] bg-white border border-slate-50 text-center">
                                                    <span className="px-4 py-1.5 rounded-full text-[18px] font-black uppercase tracking-widest bg-white text-[#D97706] border border-slate-100 shadow-sm group-hover/row:bg-[#D97706] group-hover/row:text-white transition-all whitespace-nowrap">
                                                        {order.status}
                                                    </span>
=======
                                            <tr key={order.order_id} className="group hover:translate-x-1 transition-all cursor-pointer" onClick={() => navigate(`/admin/orders`)}>
                                                <td className="py-4 px-6 rounded-l-2xl bg-white border-y border-l border-slate-100 font-black text-sm text-[#2D241E]">#{order.order_id?.substring(0, 8)}</td>
                                                <td className="py-4 px-6 bg-white border-y border-slate-100 text-sm font-black text-[#2D241E]">{order.customer_name}</td>
                                                <td className="py-4 px-6 bg-white border-y border-slate-100 text-right font-black text-base text-[#2D241E]">฿{(order.total || 0).toLocaleString()}</td>
                                                <td className="py-4 px-6 rounded-r-2xl bg-white border-y border-r border-slate-100 text-center">
                                                    <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#2D241E] bg-slate-50 border-2 border-[#2D241E]/10">{order.status}</span>
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Best Selling List - Bold & Compact */}
                    <div className="xl:col-span-4">
<<<<<<< HEAD
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md h-full text-left">
                            <Star className="absolute top-[-40px] right-[-40px] text-[#2D241E] opacity-[0.015] group-hover:rotate-12 transition-transform duration-1000" size={250} />
                            
                            <div className="space-y-1 mb-10 relative z-10">
                                <h3 className="text-3xl font-black text-[#2D241E] uppercase tracking-tighter italic">สินค้าขายดี</h3>
                                <p className="text-[20px] font-bold text-[#2D241E]/80 uppercase tracking-widest">รายการที่มียอดขายสูงสุด</p>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {stats.topProducts?.map((product) => (
                                    <div key={product.product_id} className="flex items-center justify-between p-3.5 bg-white rounded-[1.5rem] border border-slate-50 hover:border-[#D97706]/30 shadow-sm transition-all group/item hover:-translate-y-1">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-inner shrink-0">
                                                <img src={product.image || '/placeholder.png'} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-xl uppercase text-[#2D241E] tracking-tighter truncate leading-none mb-1">{product.name}</span>
                                                <span className="text-[20px] font-black text-[#D97706] uppercase tracking-widest">{product.total_sold} ชิ้น</span>
=======
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl h-full">
                            <h3 className="text-xl 2xl:text-2xl font-black text-[#2D241E] uppercase tracking-tighter italic mb-8 flex items-center gap-2">
                                <Star size={20} strokeWidth={3} /> สินค้าขายดี
                            </h3>
                            <div className="space-y-4">
                                {stats.topProducts?.map((product) => (
                                    <div key={product.product_id} className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-slate-50 hover:border-[#2D241E] transition-all shadow-sm group/item">
                                        <div className="flex items-center gap-3">
                                            <img src={product.image || '/placeholder.png'} className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 shadow-sm group-hover/item:scale-105 transition-transform" alt={product.name} />
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm uppercase text-[#2D241E] truncate max-w-[120px] italic">{product.name}</span>
                                                <span className="text-[10px] font-black text-[#8B7E66] italic">ขายแล้ว {(product.total_sold || 0).toLocaleString()} ชิ้น</span>
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                                            </div>
                                        </div>
                                        <p className="font-black text-base italic text-[#2D241E]">฿{product.price?.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

<<<<<<< HEAD
// --- Stat Card Component (Pearl Style - Only White) ---
const StatCardSmall = ({ title, value, icon, accent, gimmick }) => (
    <div className="bg-white p-6 md:p-6 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1.5 duration-500 group relative overflow-hidden">
        {/* Sub Gimmick Background Icon */}
        <div className="absolute -right-4 -bottom-4 text-[#2D241E] opacity-[0.015] group-hover:scale-110 transition-transform duration-700">
            {gimmick}
        </div>
        
        <div className="flex-1 text-left min-w-0 relative z-10">
            <p className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] mb-3 md:mb-4 flex items-center gap-2 leading-none">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }}></span>
                {title}
            </p>
            <h2 className="text-[#2D241E] text-xl md:text-2xl xl:text-3xl font-black italic tracking-tighter leading-none uppercase truncate">{value}</h2>
        </div>
        
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-50 text-[#2D241E]/20 shrink-0 ml-4 group-hover:scale-110 group-hover:text-[#D97706] transition-all duration-500 relative z-10">
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
=======
// 💎 StatCard Component (ฉบับเข้มจัด)
const StatCardSmall = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-2xl border-2 border-[#2D241E] shadow-lg flex items-center justify-between hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <div className="flex-1 text-left min-w-0">
            {/* สีเข้มจัด 100% ไม่มีความจาง */}
            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1 leading-none">{title}</p>
            <h2 className="text-[#2D241E] text-2xl font-black italic leading-none">{value || 0}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#2D241E] border-2 border-[#2D241E] shadow-inner group-hover:bg-[#2D241E] group-hover:text-white transition-all duration-500">
            {React.cloneElement(icon, { size: 20, strokeWidth: 3 })}
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
        </div>
    </div>
);

export default Dashboard;