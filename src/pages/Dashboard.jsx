import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    DollarSign, ShoppingBag, Box, Users, Loader2, 
    RefreshCw, ArrowRight, Package, Menu, ChevronRight,
    Zap, Activity, Star, ArrowUpRight, Image as ImageIcon,
    Leaf, Cookie, Smile, Sparkles, PieChart, TrendingUp
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ 
        totalSales: 0, 
        orderCount: 0, 
        totalStock: 0, 
        customerCount: 0, 
        recentOrders: [], 
        topProducts: [] 
    });
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('month'); 
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- 📦 Logic (คงเดิม 100%) ---
    const fetchDashboardData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true); else setIsRefreshing(true);
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.DASHBOARD}?range=${timeRange}`);
            if (res.success) {
                setStats(res.data);
            }
        } catch (err) { 
            toast.error("ดึงข้อมูลไม่สำเร็จ"); 
        } finally { 
            setLoading(false); 
            setIsRefreshing(false); 
        }
    }, [timeRange]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative selection:bg-[#F3E9DC]">
            
            {/* ☁️ Global Cozy Patterns (Opacity 0.02) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 opacity-[0.02]" size={200} />
                <Cookie className="absolute bottom-[15%] right-[10%] -rotate-12 opacity-[0.02]" size={180} />
                <Smile className="absolute top-[40%] right-[30%] opacity-[0.015]" size={350} />
                <Sparkles className="absolute top-[20%] right-[5%] opacity-[0.02]" size={120} />
            </div>

            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="dashboard" />

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
                            <Sparkles size={14} className="text-[#2D241E]" />
                            <span className="text-[20px] font-black uppercase tracking-[0.1em] text-[#2D241E]/60">ภาพรวมการดำเนินงาน</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">
                            แดช<span className="opacity-80">บอร์ด</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <button onClick={() => fetchDashboardData(true)} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-90 group shrink-0">
                            <RefreshCw size={20} className={`text-[#2D241E] ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        </button>
                    </div>
                </div>

                {/* 📊 Stat Cards (Pearl White Style) - ปรับ Grid สำหรับ Tablet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16 px-2">
                    <StatCardSmall title="รายรับทั้งหมด" value={`฿${(stats.totalSales || 0).toLocaleString()}`} icon={<DollarSign size={24} />} accent="#2D241E" gimmick={<TrendingUp size={60}/>} />
                    <StatCardSmall title="ออเดอร์สำเร็จ" value={(stats.orderCount || 0).toLocaleString()} icon={<ShoppingBag size={24} />} accent="#2D241E" gimmick={<PieChart size={60}/>} />
                    <StatCardSmall title="สินค้าคงคลัง" value={(stats.totalStock || 0).toLocaleString()} icon={<Box size={24} />} accent="#2D241E" gimmick={<Package size={60}/>} />
                    <StatCardSmall title="ลูกค้าทั้งหมด" value={(stats.customerCount || 0).toLocaleString()} icon={<Users size={24} />} accent="#2D241E" gimmick={<Users size={60}/>} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12">
                    
                    {/* 📦 Recent Orders Panel (Pearl White Card) */}
                    <div className="xl:col-span-8">
                        <div className="bg-white p-5 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md">
                            <Activity className="absolute -bottom-6 -right-6 text-[#2D241E] opacity-[0.01] group-hover:scale-110 transition-transform duration-700" size={200} />
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 relative z-10 text-left">
                                <div className="space-y-1">
                                    <h3 className="text-2xl md:text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic">คำสั่งซื้อ</h3>
                                    <p className="text-[20px] font-bold   text-[#2D241E] uppercase tracking-widest">รายการคำสั่งซื้อล่าสุด</p>
                                </div>
                                <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#2D241E] border border-slate-100 rounded-full font-black flex items-center justify-center gap-3 hover:gap-5 transition-all uppercase text-[20px] tracking-widest shadow-sm active:scale-95" onClick={() => navigate('/admin/orders')}>
                                    ดูทั้งหมด <ArrowRight size={14} className="text-[#2D241E]" />
                                </button>
                            </div>

                            {/* ปรับปรุงตารางให้ Slide ได้ในมือถือ */}
                            <div className="overflow-x-auto relative z-10 custom-scrollbar">
                                <table className="w-full border-separate border-spacing-y-3 min-w-[600px]">
                                    <thead>
                                        <tr className="text-[#2D241E] uppercase text-[20px] font-black tracking-[0.1em] text-left px-6">
                                            <th className="px-8 pb-2">หมายเลขคำสั่งซื้อ</th>
                                            <th className="px-8 pb-2">ชื่อผู้สั่ง</th>
                                            <th className="px-8 pb-2 text-right">มูลค่า</th>
                                            <th className="px-8 pb-2 text-center">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-0 text-left">
                                        {stats.recentOrders?.map(order => (
                                            <tr key={order.order_id} className="group/row hover:translate-x-1 transition-all cursor-pointer" onClick={() => navigate(`/admin/orders`)}>
                                                <td className="py-6 px-8 rounded-l-[1.5rem] md:rounded-l-[2rem] bg-white border border-slate-50 font-black text-[#2D241E] uppercase tracking-tighter text-xl">#{order.order_id?.substring(0, 8)}</td>
                                                <td className="py-6 px-8 bg-white border-y border-slate-50 font-bold text-xl text-[#2D241E]">{order.customer_name.substring(0, 5)}</td>
                                                <td className="py-6 px-8 bg-white border-y border-slate-50 font-black text-xl text-right text-[#2D241E]">฿{(order.total || 0).toLocaleString()}</td>
                                                <td className="py-6 px-8 rounded-r-[1.5rem] md:rounded-r-[2rem] bg-white border border-slate-50 text-center">
                                                    <span className="px-4 py-1.5 rounded-full text-[18px] font-black uppercase tracking-widest bg-white text-[#2D241E] border border-slate-100 shadow-sm group-hover/row:bg-[#ffffc] group-hover/row:text-[#2D241E] transition-all whitespace-nowrap">
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 🏆 Best Sellers Panel (Pearl White Card) */}
                    <div className="xl:col-span-4">
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md h-full text-left">
                            <Star className="absolute top-[-40px] right-[-40px] text-[#2D241E] opacity-[0.015] group-hover:rotate-12 transition-transform duration-1000" size={250} />
                            
                            <div className="space-y-1 mb-10 relative z-10">
                                <h3 className="text-3xl font-black text-[#2D241E] uppercase tracking-tighter italic">สินค้าขายดี</h3>
                                <p className="text-[20px] font-bold   text-[#2D241E] uppercase tracking-widest">รายการที่มียอดขายสูงสุด</p>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {stats.topProducts?.map((product) => (
                                    <div key={product.product_id} className="flex items-center justify-between p-3.5 bg-white rounded-[1.5rem] border border-slate-50 hover:border-[#2D241E]/30 shadow-sm transition-all group/item hover:-translate-y-1">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-inner shrink-0">
                                                <img src={product.image || '/placeholder.png'} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-xl uppercase text-[#2D241E] tracking-tighter truncate leading-none mb-1">{product.name}</span>
                                                <span className="text-[20px] font-black text-[#2D241E] uppercase tracking-widest">{product.total_sold} ชิ้น</span>
                                            </div>
                                        </div>
                                        <p className="font-black text-base text-[#2D241E] tracking-tighter italic leading-none shrink-0 ml-2">฿{product.price?.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => navigate('/admin/products')} className="w-full mt-10 py-5 bg-[#fff] text-#2D241E rounded-full font-black text-[14px] uppercase tracking-[0.1em] hover:gap-5 transition-all uppercase shadow-md active:scale-95 flex items-center justify-center gap-3 relative z-10">
                                ตรวจสอบคลังสินค้า <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 3s infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

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
        
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-50   text-[#2D241E] shrink-0 ml-4 group-hover:scale-110 group-hover:text-[#2D241E] transition-all duration-500 relative z-10">
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
    </div>
);

export default Dashboard;