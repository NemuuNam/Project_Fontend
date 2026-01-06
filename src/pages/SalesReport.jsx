import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, BarChart3, Loader2, RefreshCw, ImageIcon, Menu } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const SalesReport = () => {
    const [salesData, setSalesData] = useState({
        summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
        chartData: [], topProducts: []
    });
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('monthly');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.REPORTS}?type=${filterType}`);
            if (res && res.success) {
                const formattedChart = res.data.chartData?.map(item => ({ ...item, amount: Number(item.amount || 0) })) || [];
                setSalesData({ ...res.data, chartData: formattedChart });
            }
        } catch (err) { toast.error("ดึงข้อมูลล้มเหลว"); }
        finally { setLoading(false); }
    }, [filterType]);

    useEffect(() => { fetchSales(); }, [fetchSales]);

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-slate-900 overflow-x-hidden">
            <Toaster position="top-right" />
            
            <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                isMobileOpen={isSidebarOpen} 
                setIsMobileOpen={setIsSidebarOpen} 
                activePage="reports" 
            />

            <main className={`flex-1 p-4 md:p-8 lg:p-10 transition-all duration-300 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[300px]'} w-full`}>
                
                {/* Mobile Toggle & Header */}
                <div className="mb-6 md:mb-10 flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-600"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex-1">
                        <Header title="Reports" />
                    </div>
                </div>

                {/* Title Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                    <div>
                        <p className="text-sm md:text-lg font-bold text-slate-400 mb-1 uppercase tracking-widest">Analytics</p>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">
                            Reports
                        </h1>
                    </div>
                    <button 
                        onClick={fetchSales} 
                        className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-2 border-slate-100 flex items-center justify-center hover:border-slate-900 transition-all group"
                    >
                        <RefreshCw size={24} className={`${loading ? 'animate-spin' : ''} text-slate-400 group-hover:text-slate-900`} />
                    </button>
                </div>

                {/* KPI Section - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                    <StatCard title="รายได้รวม" value={`฿${salesData.summary.totalRevenue.toLocaleString()}`} icon={<DollarSign size={24}/>} color="#4318ff" />
                    <StatCard title="ออเดอร์สำเร็จ" value={salesData.summary.totalOrders} icon={<ShoppingBag size={24}/>} color="#10b981" />
                    <StatCard title="เฉลี่ย/บิล" value={`฿${Math.round(salesData.summary.avgOrderValue).toLocaleString()}`} icon={<BarChart3 size={24}/>} color="#ea580c" />
                </div>

                {/* Filter Buttons - Adjusted for Mobile */}
                <div className="flex gap-1 md:gap-2 mb-8 md:mb-10 bg-slate-50 p-1.5 md:p-2 rounded-2xl w-full sm:w-fit border border-slate-100">
                    {['daily', 'monthly', 'yearly'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setFilterType(t)} 
                            className={`flex-1 sm:flex-none px-4 md:px-10 py-2.5 md:py-3 rounded-xl font-black text-[11px] md:text-sm uppercase transition-all ${filterType === t ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                    {/* Chart Area */}
                    <div className="xl:col-span-2 bg-white p-6 md:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50">
                        <h3 className="text-xl md:text-2xl font-black mb-8 md:mb-10 flex items-center gap-3 text-slate-900">
                            <TrendingUp className="text-blue-600" /> Revenue Flow
                        </h3>
                        <div className="h-[300px] md:h-[400px] w-full">
                            {!loading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData.chartData}>
                                        <defs>
                                            <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4318ff" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#4318ff" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 11, fontWeight: 700}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 11, fontWeight: 700}} tickFormatter={v => `฿${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontWeight: 'bold'}} 
                                            formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#4318ff" strokeWidth={4} fill="url(#sales)" animationDuration={1500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="animate-spin text-slate-200" size={40} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Best Sellers */}
                    <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50">
                        <h3 className="text-xl md:text-2xl font-black mb-8 md:mb-10 uppercase tracking-tight text-slate-900">Best Sellers</h3>
                        <div className="space-y-4 md:space-y-6">
                            {salesData.topProducts.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border-2 border-slate-50 rounded-2xl md:rounded-[30px] hover:border-emerald-100 transition-all group">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                                        {p.product?.images?.[0]?.image_url ? (
                                            <img src={p.product.images[0].image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt="p" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={20}/></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm md:text-lg text-slate-900 truncate">{p.product_name}</p>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">{p.total_qty} Sold</p>
                                    </div>
                                    <p className="font-black text-emerald-500 text-sm md:text-lg whitespace-nowrap">฿{p.total_sales.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// StatCard Component - Pure White Style with Responsive Adjustments
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 md:p-8 rounded-[25px] md:rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-1 duration-300">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 truncate">{title}</p>
            <h2 className="text-slate-900 text-2xl md:text-4xl font-black italic tracking-tighter leading-none truncate">{value}</h2>
        </div>
        <div 
            style={{ background: `${color}08`, color: color }} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[22px] flex items-center justify-center border-2 md:border-4 border-white shadow-lg shrink-0 ml-2"
        >
            {icon}
        </div>
    </div>
);

export default SalesReport;