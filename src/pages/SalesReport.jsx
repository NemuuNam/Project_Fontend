import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Loader2, Menu, ChevronRight, Star, ArrowRight, Package, TrendingUp
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

// 🎨 PASTEL COLORS: เปลี่ยนเฉพาะสีที่ใช้ในกราฟ (Pie Chart)
const PASTEL_COLORS = ['#A5D8FF', '#B2F2BB', '#D0EBFF', '#FFD8A8', '#FFDEEB'];
const PRIMARY_PASTEL = '#74C0FC'; // สีฟ้าพาสเทลสำหรับ Area Chart

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
        <div className="flex h-screen items-center justify-center bg-[#FDFCFB]">
            <Loader2 className="animate-spin text-slate-800" size={40} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden relative max-w-full">
            <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="reports" />

            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[280px]'} p-4 md:p-5 lg:p-6 lg:pr-4 w-full relative z-10`}>

                <div className="mb-4 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl text-[#111827] border border-slate-300 shadow-sm"><Menu size={24} /></button>
                    <Header title="การวิเคราะห์ธุรกิจ" isCollapsed={isCollapsed} />
                </div>

                <div className="pt-24">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 px-2">
                        {/* 📝 ตัวอักษรสีดำเข้มคมชัดตามเดิม */}
                        <StatCardSmall title="รายได้สุทธิ" value={`฿${(salesData.summary?.totalRevenue || 0).toLocaleString()}`} />
                        <StatCardSmall title="ออเดอร์ทั้งหมด" value={(salesData.summary?.totalOrders || 0).toLocaleString()} />
                        <StatCardSmall title="จำนวนที่ขายได้" value={`${(salesData.summary?.totalUnits || 0).toLocaleString()} ชิ้น`} />
                        <StatCardSmall title="ยอดเฉลี่ย/บิล" value={`฿${Math.round(salesData.summary?.avgOrderValue || 0).toLocaleString()}`} />
                    </div>

                    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm mb-6 overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8 text-left">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-medium uppercase italic text-[#000000] flex items-center gap-2">
                                    <Activity size={24} /> Revenue Trends
                                </h3>
                                <div className="flex gap-2 p-1 bg-slate-50 rounded-full border border-slate-200 w-fit">
                                    {[{ id: 'daily', label: 'รายวัน' }, { id: 'monthly', label: 'รายเดือน' }, { id: 'yearly', label: 'รายปี' }].map(t => (
                                        <button key={t.id} onClick={() => setFilterType(t.id)} 
                                            // 🚀 ตัวอักษรยังคงเป็นสีเข้ม/ขาวตามสถานะ แต่พื้นหลังล้อตามโทนพาสเทล
                                            className={`px-5 py-1.5 rounded-full text-base font-medium uppercase transition-all ${filterType === t.id ? 'bg-[#74C0FC] text-white shadow-sm' : 'text-[#374151] hover:bg-white'}`}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <StatusBadgeMini label="สำเร็จ" value={salesData.statusSummary?.completed} />
                                <StatusBadgeMini label="รออนุมัติ" value={salesData.statusSummary?.pending} />
                                <StatusBadgeMini label="ยกเลิก" value={salesData.statusSummary?.cancelled} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div className="xl:col-span-8 h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData.chartData || []}>
                                        <defs>
                                            {/* ✅ Gradient เปลี่ยนเป็นสีพาสเทลฟ้า */}
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={PRIMARY_PASTEL} stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor={PRIMARY_PASTEL} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        {/* 📝 ตัวอักษรแกน X-Y เป็นสีเข้มตามเดิม */}
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#000000', fontSize: 12, fontWeight: 500 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#000000', fontSize: 12, fontWeight: 500 }} />
                                        <Tooltip contentStyle={{ borderRadius: '15px', border: '1px solid #000000', fontFamily: 'Kanit', fontSize: '14px', color: '#000000' }} />
                                        {/* ✅ กราฟเส้นเปลี่ยนเป็นสีพาสเทลฟ้าเพื่อความนุ่มนวล */}
                                        <Area type="monotone" dataKey="amount" stroke={PRIMARY_PASTEL} strokeWidth={3} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="xl:col-span-4 bg-slate-50 rounded-[2.5rem] p-6 border border-slate-200 flex flex-col items-center justify-center">
                                <p className="text-lg font-medium uppercase tracking-widest text-[#000000] mb-6 italic">Market Share</p>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            {/* ✅ Pie Chart ใช้ชุดสีพาสเทล แต่ตัวอักษร Tooltip ยังเป็นสีดำ */}
                                            <Pie data={salesData.categoryData?.length > 0 ? salesData.categoryData : [{ name: 'EMPTY', value: 1 }]} innerRadius={60} outerRadius={90} dataKey="value" stroke="#ffffff" strokeWidth={3} paddingAngle={5}>
                                                {salesData.categoryData?.map((_, i) => <Cell key={i} fill={PASTEL_COLORS[i % PASTEL_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-medium uppercase italic text-[#000000] flex items-center gap-2 text-left">
                                <Star size={24} className="text-[#000000]" /> High Performers
                            </h3>
                            <button onClick={() => navigate('/admin/products')} className="text-base font-medium text-[#374151] border-b border-slate-200 pb-1 italic uppercase hover:text-[#000000]">Manage Stock</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(salesData.topProducts || []).map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm">
                                    <div className="flex items-center gap-5 text-left">
                                        <span className="text-2xl font-medium italic text-[#000000] w-8">0{i + 1}</span>
                                        <img src={p.image || '/placeholder.png'} className="w-14 h-14 rounded-xl object-cover border border-slate-200" alt="" />
                                        <div className="flex flex-col min-w-0">
                                            {/* 📝 ตัวอักษรสีดำเข้มคมชัดตามเดิม */}
                                            <span className="text-xl font-medium text-[#000000] uppercase truncate max-w-[150px] italic leading-tight">{p.product_name}</span>
                                            <span className="text-base font-medium text-[#374151] italic">Sold: {(p.total_qty || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-medium uppercase text-[#374151] leading-none">Revenue</p>
                                        <p className="text-2xl font-medium italic text-[#000000]">฿{(p.total_sales || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// 💎 StatCard: ตัวอักษรดำสนิท `#000000` ตามเดิม
const StatCardSmall = ({ title, value }) => (
    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm flex flex-col gap-1 text-left">
        <p className="text-xl font-medium text-[#374151] uppercase tracking-widest italic leading-none">{title}</p>
        <h2 className="text-5xl font-medium italic tracking-tighter text-[#000000] leading-none mt-1 truncate">{value || 0}</h2>
    </div>
);

// 💎 StatusBadge: ตัวอักษรดำสนิท `#000000` ตามเดิม
const StatusBadgeMini = ({ label, value }) => (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 text-base font-medium shadow-sm">
        <span className="text-[#374151] uppercase text-xs tracking-widest">{label}:</span>
        <span className="text-[#000000] font-bold">{value || 0}</span>
    </div>
);

export default SalesReport;