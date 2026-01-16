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
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl 2xl:text-2xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-2">
                                    <TrendingUp size={20} strokeWidth={3} /> คำสั่งซื้อล่าสุด
                                </h3>
                                <button className="text-xs font-black uppercase border-b-2 border-[#2D241E] pb-1 text-[#2D241E] hover:opacity-50 transition-all" onClick={() => navigate('/admin/orders')}>ดูทั้งหมด</button>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-[#2D241E] uppercase text-[10px] font-black tracking-widest px-6">
                                            <th className="px-6 pb-2">ID</th>
                                            <th className="px-6 pb-2">Customer</th>
                                            <th className="px-6 pb-2 text-right">Total</th>
                                            <th className="px-6 pb-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentOrders?.map(order => (
                                            <tr key={order.order_id} className="group hover:translate-x-1 transition-all cursor-pointer" onClick={() => navigate(`/admin/orders`)}>
                                                <td className="py-4 px-6 rounded-l-2xl bg-white border-y border-l border-slate-100 font-black text-sm text-[#2D241E]">#{order.order_id?.substring(0, 8)}</td>
                                                <td className="py-4 px-6 bg-white border-y border-slate-100 text-sm font-black text-[#2D241E]">{order.customer_name}</td>
                                                <td className="py-4 px-6 bg-white border-y border-slate-100 text-right font-black text-base text-[#2D241E]">฿{(order.total || 0).toLocaleString()}</td>
                                                <td className="py-4 px-6 rounded-r-2xl bg-white border-y border-r border-slate-100 text-center">
                                                    <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#2D241E] bg-slate-50 border-2 border-[#2D241E]/10">{order.status}</span>
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
        </div>
    </div>
);

export default Dashboard;