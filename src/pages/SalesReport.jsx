import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const COLORS = ['#2D241E', '#8B7E66', '#5C4D42', '#E53E3E', '#05CD99'];

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
    const fetchSales = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
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
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="reports" />

            {/* 🚀 Main: Scale มาตรฐาน Product */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-8 lg:p-10 w-full relative z-10`}>

                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] shadow-sm border-2 border-[#2D241E] active:scale-90"><Menu size={24} /></button>
                    <Header title="การวิเคราะห์ธุรกิจ" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 px-2 text-left">
                    <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                            <Sparkles size={14} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Financial Analysis</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">SalesReport</h1>
                    </div>
                    <button onClick={() => fetchSales(true)} className="p-4 rounded-2xl bg-white border-2 border-[#2D241E] shadow-lg hover:rotate-180 transition-all active:scale-90 group shrink-0">
                        <RefreshCw size={24} className={`text-[#2D241E] ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
                    </button>
                </div>

                {/* 📊 Stat Cards - เข้มชัด 100% */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 px-2">
                    <StatCardSmall title="รายได้สุทธิ" value={`฿${(salesData.summary?.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign />} />
                    <StatCardSmall title="ออเดอร์ทั้งหมด" value={(salesData.summary?.totalOrders || 0).toLocaleString()} icon={<ShoppingBag />} />
                    <StatCardSmall title="จำนวนที่ขายได้" value={`${(salesData.summary?.totalUnits || 0).toLocaleString()} ชิ้น`} icon={<Package />} />
                    <StatCardSmall title="ยอดเฉลี่ย/บิล" value={`฿${Math.round(salesData.summary?.avgOrderValue || 0).toLocaleString()}`} icon={<Target />} />
                </div>

                {/* 📈 Chart Area - High Contrast กราฟเข้มจัด */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl mb-10">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8 text-left">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-black uppercase italic text-[#2D241E] flex items-center gap-2">
                                <Activity size={20} strokeWidth={3} className="text-[#2D241E]" /> Revenue Trends
                            </h3>
                            <div className="flex gap-2 p-1 bg-slate-50 rounded-full border-2 border-[#2D241E]/10 w-fit mt-2">
                                {[{ id: 'daily', label: 'รายวัน' }, { id: 'monthly', label: 'รายเดือน' }, { id: 'yearly', label: 'รายปี' }].map(t => (
                                    <button key={t.id} onClick={() => setFilterType(t.id)} className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === t.id ? 'bg-[#2D241E] text-white shadow-md' : 'text-[#2D241E] hover:bg-white'}`}>{t.label}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <StatusBadgeMini label="สำเร็จ" value={salesData.statusSummary?.completed} color="text-emerald-600" />
                            <StatusBadgeMini label="รออนุมัติ" value={salesData.statusSummary?.pending} color="text-amber-600" />
                            <StatusBadgeMini label="ยกเลิก" value={salesData.statusSummary?.cancelled} color="text-red-600" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-8 h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData.chartData || []}>
                                    <defs>
                                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2D241E" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#2D241E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#2D241E', fontSize: 10, fontWeight: 900 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#2D241E', fontSize: 10, fontWeight: 900 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: '2px solid #2D241E', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', fontFamily: 'Kanit', fontSize: '12px', color: '#2D241E', fontWeight: 900 }} />
                                    <Area type="monotone" dataKey="amount" stroke="#2D241E" strokeWidth={4} fill="url(#salesGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="xl:col-span-4 bg-slate-50 rounded-3xl p-6 border-2 border-[#2D241E]/10 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[#2D241E] mb-6 italic">Market Share</p>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={salesData.categoryData?.length > 0 ? salesData.categoryData : [{ name: 'EMPTY', value: 1 }]} innerRadius={60} outerRadius={85} dataKey="value" stroke="#fff" strokeWidth={2} paddingAngle={5}>
                                            {salesData.categoryData?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🏆 Top Products - รายการสินค้าเข้มจัด */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black uppercase italic text-[#2D241E] flex items-center gap-2 text-left">
                            <Star size={20} strokeWidth={3} className="text-[#2D241E]" /> High Performers
                        </h3>
                        <button onClick={() => navigate('/admin/products')} className="text-[10px] font-black uppercase border-b-2 border-[#2D241E] pb-0.5 text-[#2D241E] hover:opacity-50 transition-all">Manage Stock</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(salesData.topProducts || []).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white border-2 border-slate-50 rounded-2xl hover:border-[#2D241E] transition-all group shadow-sm">
                                <div className="flex items-center gap-4 text-left">
                                    <span className="text-xl font-black italic text-[#2D241E] w-6">0{i + 1}</span>
                                    <img src={p.image || '/placeholder.png'} className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 shadow-sm" alt="" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-sm uppercase truncate max-w-[150px] italic text-[#2D241E]">{p.product_name}</span>
                                        <span className="text-[11px] font-black text-[#8B7E66] uppercase tracking-tighter italic">Sold: {(p.total_qty || 0).toLocaleString()} units</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase text-[#2D241E]">Revenue</p>
                                    <p className="font-black text-base italic text-[#2D241E]">฿{(p.total_sales || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 4s infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
            `}} />
        </div>
    );
};

// 💎 StatCardSmall: เข้มจัด High Contrast
const StatCardSmall = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-2xl border-2 border-[#2D241E] shadow-lg flex items-center justify-between hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1 leading-none">{title}</p>
            <h2 className="text-[#2D241E] text-2xl font-black italic leading-none">{value || 0}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#2D241E] border-2 border-[#2D241E] shadow-inner group-hover:bg-[#2D241E] group-hover:text-white transition-all duration-500">
            {React.cloneElement(icon, { size: 20, strokeWidth: 3 })}
        </div>
    </div>
);

// 💎 Status Badge: สีเข้มจัดอ่านง่าย
const StatusBadgeMini = ({ label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1 bg-white rounded-lg border-2 border-[#2D241E] text-[10px] font-black uppercase ${color} shadow-sm`}>
        {label}: <span className="text-[#2D241E]">{value || 0}</span>
    </div>
);

export default SalesReport;