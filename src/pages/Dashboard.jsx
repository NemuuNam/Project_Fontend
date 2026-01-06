import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Box, Users, Loader2, TrendingUp, RefreshCw, ArrowRight, Package, Menu } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, totalStock: 0, customerCount: 0, recentOrders: [], topProducts: [] });
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true); else setIsRefreshing(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD);
            if (res.success) setStats(res.data);
        } catch (err) { toast.error("ดึงข้อมูลสถิติล้มเหลว"); } finally { setLoading(false); setIsRefreshing(false); }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-900" size={65} />
            <p className="mt-6 font-black text-slate-400 tracking-widest uppercase text-sm">กำลังโหลดข้อมูล...</p>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-slate-900 overflow-x-hidden">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="dashboard" />

            <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[300px]'} p-4 md:p-8 lg:p-10 w-full`}>
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-600"><Menu size={24} /></button>
                    <Header title="Dashboard" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">WELCOME TO CONSOLE</p>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">Dashboard</h1>
                    </div>
                    <button onClick={() => fetchDashboardData(true)} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm hover:border-slate-900 group">
                        <RefreshCw size={24} className={`${isRefreshing ? 'animate-spin' : ''} text-slate-400 group-hover:text-slate-900`} />
                    </button>
                </div>

                {/* Grid Adjustment: iPad Pro (lg) will show 2 per row for better spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                    <StatCard title="ยอดขายรวม" value={`฿${(stats.totalSales || 0).toLocaleString()}`} icon={<DollarSign size={24} />} color="#4318ff" />
                    <StatCard title="ออเดอร์สำเร็จ" value={(stats.orderCount || 0).toLocaleString()} icon={<ShoppingBag size={24} />} color="#10b981" />
                    <StatCard title="จำนวนสต็อก" value={(stats.totalStock || 0).toLocaleString()} icon={<Box size={24} />} color="#f59e0b" />
                    <StatCard title="ลูกค้าทั้งหมด" value={(stats.customerCount || 0).toLocaleString()} icon={<Users size={24} />} color="#4318ff" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 bg-white p-5 md:p-8 lg:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl md:text-3xl font-black text-slate-900 flex items-center gap-3"><Package className="text-blue-600" /> คำสั่งซื้อล่าสุด</h3>
                            <button className="text-blue-600 font-black flex items-center gap-1 text-sm md:text-lg" onClick={() => navigate('/admin/orders')}>ดูทั้งหมด <ArrowRight size={20} /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px] text-left border-separate border-spacing-y-3 text-center">
                                <thead>
                                    <tr className="text-slate-400 uppercase text-xs font-black tracking-widest">
                                        <th className="px-4 pb-4">ID</th>
                                        <th className="px-4 pb-4 text-left">ลูกค้า</th>
                                        <th className="px-4 pb-4 text-right">ยอดรวม</th>
                                        <th className="px-4 pb-4">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders?.map(order => (
                                        <tr key={order.order_id} className="group hover:bg-slate-50 cursor-pointer">
                                            <td className="py-6 px-4 rounded-l-2xl font-black text-blue-600 text-lg border-y border-l border-slate-50">#{order.order_id.substring(0, 8).toUpperCase()}</td>
                                            <td className="py-6 px-4 font-bold text-slate-500 text-lg border-y border-slate-50 text-left whitespace-nowrap">{order.customer_name}</td>
                                            <td className="py-6 px-4 font-black text-2xl text-right text-slate-900 border-y border-slate-50">฿{order.total.toLocaleString()}</td>
                                            <td className="py-6 px-4 rounded-r-2xl border-y border-r border-slate-50">
                                                <span className="px-3 py-1.5 rounded-lg text-xs font-black" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>{order.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="xl:col-span-4 bg-white p-5 md:p-8 lg:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50">
                        <h3 className="text-xl md:text-3xl font-black mb-10 flex items-center gap-4 text-slate-900"><TrendingUp size={30} className="text-emerald-500" /> ยอดฮิต 5 อันดับ</h3>
                        <div className="space-y-6">
                            {stats.topProducts?.map(product => (
                                <div key={product.product_id} className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:border-slate-200 transition-all">
                                    <img src={product.image} className="w-12 h-12 md:w-20 md:h-20 rounded-2xl object-cover" alt={product.name} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm md:text-lg text-slate-900 truncate">{product.name}</p>
                                        <p className="text-slate-400 font-bold text-xs md:text-sm">฿{product.price.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right"><p className="text-emerald-500 text-xl md:text-2xl font-black italic">{product.total_sold}</p><p className="text-[10px] font-black text-slate-300 uppercase">Sold</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 md:p-8 rounded-[25px] md:rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-1">
        <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-3 truncate">{title}</p>
            <h2 className="text-slate-900 text-2xl md:text-4xl lg:text-5xl font-black italic tracking-tighter leading-none truncate">{value}</h2>
        </div>
        <div style={{ background: `${color}08`, color: color }} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[22px] flex items-center justify-center border-2 md:border-4 border-white shadow-lg shrink-0 ml-2">{icon}</div>
    </div>
);

export default Dashboard;