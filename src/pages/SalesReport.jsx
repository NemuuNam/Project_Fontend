import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, DollarSign, ShoppingBag, BarChart3, Loader2,
    RefreshCw, Download, ArrowUpRight, Layers, CreditCard,
    CheckCircle2, XCircle, Clock, Package, Menu, Zap,
    Target, Activity, ChevronRight, Calendar, Star, ArrowRight, Image as ImageIcon,
    Leaf, Cookie, Smile, Sparkles
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const COLORS = ['#2D241E', '#2D241E', '#8B7E66', '#2D241E', '#F3E9DC'];

const SalesReport = () => {
    const navigate = useNavigate();
    const [salesData, setSalesData] = useState({
        summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalUnits: 0 },
        chartData: [],
        topProducts: [],
        categoryData: [],
        statusSummary: { completed: 0, pending: 0, cancelled: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('monthly');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- 📦 Logic (คงเดิม 100%) ---
    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.REPORTS}?type=${filterType}`);
            if (res && res.success) {
                const rawData = res.data || {};
                setSalesData({
                    summary: rawData.summary || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalUnits: 0 },
                    chartData: Array.isArray(rawData.chartData) ? rawData.chartData : [],
                    topProducts: Array.isArray(rawData.topProducts) ? rawData.topProducts : [],
                    categoryData: Array.isArray(rawData.categoryData) ? rawData.categoryData : [],
                    statusSummary: rawData.statusSummary || { completed: 0, pending: 0, cancelled: 0 }
                });
            }
        } catch (err) {
            toast.error("ดึงข้อมูลจากระบบล้มเหลว");
        } finally {
            setLoading(false);
        }
    }, [filterType]);

    useEffect(() => { fetchSales(); }, [fetchSales]);

    if (loading && salesData.chartData.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative selection:bg-[#F3E9DC]">

            {/* ☁️ Global Cozy Patterns จางๆ (Opacity 0.02) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 text-[#2D241E] opacity-[0.02]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[5%] -rotate-12 text-[#2D241E] opacity-[0.02]" size={180} />
                <Smile className="absolute top-[40%] right-[20%] text-[#2D241E] opacity-[0.015]" size={300} />
                <Sparkles className="absolute top-[15%] left-[45%] text-[#2D241E] opacity-[0.02]" size={100} />
            </div>

            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="reports" />
            <main className={`flex-1 transition-all duration-500 ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[300px]'} p-4 md:p-10 lg:p-14 w-full relative z-10`}>

                {/* Header Section ปรับให้กดง่ายขึ้นใน Mobile */}
                <div className="mb-8 md:mb-1 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-2xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-95 transition-all"><Menu size={24} /></button>
                    <Header title="การวิเคราะห์ธุรกิจ" />
                </div>

                {/* 🏷️ Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 px-2">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 mb-2 animate-bounce-slow">
                            <Sparkles size={14} className="text-[#2D241E]" />
                            <span className="text-[20px] font-black uppercase tracking-[0.1em] text-[#2D241E]/60">บันทึกรายได้และประสิทธิภาพ</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">
                            Sales<span className="opacity-90">Report</span>
                        </h1>
                    </div>
                    <button onClick={fetchSales} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group active:scale-90">
                        <RefreshCw size={24} className={`text-[#2D241E]/40 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                    </button>
                </div>

                {/* 📊 Stat Cards (Pearl White Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 px-2">
                    <StatCard title="รายได้สุทธิ" value={`฿${(salesData.summary?.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign size={24} />} color="#2D241E" />
                    <StatCard title="ออเดอร์ทั้งหมด" value={salesData.summary?.totalOrders || 0} icon={<ShoppingBag size={24} />} color="#2D241E" />
                    <StatCard title="จำนวนที่ขายได้" value={`${(salesData.summary?.totalUnits || 0).toLocaleString()} ชิ้น`} icon={<Package size={24} />} color="#2D241E" />
                    <StatCard title="ยอดเฉลี่ย/บิล" value={`฿${Math.round(salesData.summary?.avgOrderValue || 0).toLocaleString()}`} icon={<Target size={24} />} color="#2D241E" />
                </div>

                {/* 📈 Main Performance Area (Pearl White Card) */}
                <div className="bg-white p-6 md:p-12 rounded-[3rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md mb-16">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.01] group-hover:rotate-12 transition-transform duration-700">
                        <TrendingUp size={200} />
                    </div>

                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-14 relative z-10 border-b border-slate-50 pb-10">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-4">
                                <Activity className="opacity-20" /> แนวโน้มรายได้
                            </h3>
                            <div className="flex gap-2 p-1.5 bg-slate-50/50 rounded-2xl border border-slate-100 w-fit">
                                {[
                                    { id: 'daily', label: 'รายวัน' },
                                    { id: 'monthly', label: 'รายเดือน' },
                                    { id: 'yearly', label: 'รายปี' }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setFilterType(t.id)}
                                        className={`px-8 py-2.5 rounded-xl text-[20px] font-black uppercase tracking-widest transition-all duration-300 ${filterType === t.id ? 'bg-white text-[#2D241E] shadow-sm scale-105' : 'text-[#2D241E] hover:text-[#2D241E]'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <StatusBadge label="สำเร็จ" value={salesData.statusSummary?.completed} color="emerald" icon={<CheckCircle2 size={20} />} />
                            <StatusBadge label="รอนุมัติ" value={salesData.statusSummary?.pending} color="amber" icon={<Clock size={20} />} />
                            <StatusBadge label="ยกเลิก" value={salesData.statusSummary?.cancelled} color="rose" icon={<XCircle size={20} />} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 relative z-10">
                        <div className="xl:col-span-8 h-[450px]">

                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData.chartData || []}>
                                    <defs>
                                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2D241E" stopOpacity={0.05} />
                                            <stop offset="95%" stopColor="#2D241E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#2D241E', fontSize: 10, fontWeight: 700 }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#2D241E', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: '20px', fontFamily: 'Kanit' }} />
                                    <Area type="monotone" dataKey="amount" stroke="#2D241E" strokeWidth={4} fill="url(#salesGradient)" animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="xl:col-span-4 flex flex-col justify-center bg-slate-50/30 rounded-[3.5rem] p-8 border border-slate-50 shadow-inner">
                            <h4 className="text-[20px] font-black uppercase tracking-widest text-[#2D241E]/50 mb-8 text-center">สัดส่วนตามหมวดหมู่</h4>

                            <div className="h-[280px]">

                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={salesData.categoryData?.length > 0 ? salesData.categoryData : [{ name: 'ว่าง', value: 1 }]}
                                            innerRadius={75} outerRadius={105} dataKey="value" stroke="none" paddingAngle={8}
                                        >
                                            {(salesData.categoryData || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🏆 Top Selling Section (Pearl White Card) */}
                <div className="bg-white p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-sm mb-10 group relative overflow-hidden transition-all duration-500 hover:shadow-md">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.01] group-hover:rotate-12 transition-transform duration-1000">
                        <Star size={220} />
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-14 relative z-10 gap-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] mb-2 italic">ตารางอันดับสินค้าขายดี</p>
                            <h3 className="text-4xl font-black uppercase tracking-tighter italic text-[#2D241E]">สินค้าที่ทำรายได้สูงสุด</h3>
                        </div>
                        <button onClick={() => navigate('/admin/products')} className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-full  text-[20px] font-black uppercase tracking-widest text-[#2D241E] hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                            จัดการคลังสินค้า <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {(salesData.topProducts || []).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-50 hover:border-[#2D241E]/10 hover:shadow-xl transition-all group/item rounded-[2.5rem] duration-500">
                                <div className="flex items-center gap-6">
                                    <span className="text-3xl font-black text-slate-800 italic group-hover/item:text-[#2D241E]/20 transition-colors w-10">0{i + 1}</span>

                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white border-2 border-slate-50 shadow-sm shrink-0">
                                        {p.image ? (
                                            <img src={p.image} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-1000" alt="product" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-100"><ImageIcon size={30} /></div>
                                        )}
                                    </div>

                                    <div className="flex flex-col text-left">
                                        <span className="font-black text-xl md:text-xl uppercase tracking-tighter text-[#2D241E] leading-tight mb-1 italic">{p.product_name}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[20px] font-black text-[#8B7E66] uppercase">
                                                ขายแล้ว: {(p.total_qty || 0).toLocaleString()} ชิ้น
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-[20px] font-black text-[#2D241E]/20 uppercase mb-1 tracking-widest italic">มูลค่ารวม</p>
                                    <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-[#2D241E]">
                                        ฿{(p.total_sales || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(!salesData.topProducts || salesData.topProducts.length === 0) && (
                        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                            <ImageIcon size={60} className="mx-auto text-slate-100 mb-6 opacity-20" />
                            <p className="text-[#2D241E] font-black uppercase tracking-widest text-[20px] italic">ยังไม่มีข้อมูลการขายในส่วนนี้</p>
                        </div>
                    )}
                </div>

            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 3s infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

// --- ส่วนประกอบย่อย (Pearl White Stat Cards) ---

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-8 rounded-[3rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1.5 duration-500 group relative overflow-hidden">
        <div className="flex-1 text-left min-w-0 relative z-10">
            <p className=" text-[20px] font-black text-[#2D241E]/30 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}></span>
                {title}
            </p>
            <h2 className="text-[#2D241E] text-4xl lg:text-5xl font-black italic tracking-tighter leading-none uppercase truncate">{value}</h2>
        </div>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-50 text-[#2D241E]/20 group-hover:scale-110 group-hover:text-[#2D241E] transition-all duration-500 relative z-10 shrink-0 ml-4">
            {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
        </div>
    </div>
);

const StatusBadge = ({ label, value, color, icon }) => {
    const variants = {
        emerald: "text-emerald-600 border-emerald-50",
        amber: "text-amber-600 border-amber-50",
        rose: "text-rose-600 border-rose-50"
    };
    return (
        <div className={`flex items-center gap-3 px-6 py-3 bg-white rounded-full border font-black  text-[20px] uppercase tracking-tighter shadow-sm transition-transform hover:scale-105 ${variants[color]}`}>
            <span className="opacity-40">{icon}</span>
            {label}: <span className="text-[20px] ml-1 text-[#2D241E]">{value || 0}</span>
        </div>
    );
};

export default SalesReport;