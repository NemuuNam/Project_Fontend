import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Loader2, TrendingUp, Star, Menu
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchDashboardData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD);
            if (res.success) setStats(res.data);
        } catch (err) { toast.error("ดึงข้อมูลไม่สำเร็จ"); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-slate-800" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden relative max-w-full">
            <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
            
            <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                isMobileOpen={isSidebarOpen} 
                setIsMobileOpen={setIsSidebarOpen} 
                activePage="dashboard" 
            />

            {/* 🚀 ปรับ Margin Left ให้ตรงกับความกว้าง Sidebar 280px และลด Padding ขวา */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[280px]'} p-4 md:p-5 lg:p-6 lg:pr-4 w-full relative z-10`}>
                
                {/* 🚀 Header จะลอยทับอยู่ด้านบนเนื่องจากเป็น fixed */}
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl text-[#111827] border border-slate-300 shadow-sm"><Menu size={24} /></button>
                    <Header title="ภาพรวมระบบ" isCollapsed={isCollapsed} />
                </div>

                {/* 🚀 เพิ่ม pt-24 เพื่อหลบ Header ที่เป็น fixed ไม่ให้ทับเนื้อหา */}
                <div className="pt-24"> 
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 px-2">
                        <StatCardSmall title="รายรับทั้งหมด" value={`฿${(stats.totalSales || 0).toLocaleString()}`} />
                        <StatCardSmall title="ออเดอร์สำเร็จ" value={(stats.orderCount || 0).toLocaleString()} />
                        <StatCardSmall title="สินค้าในคลัง" value={(stats.totalStock || 0).toLocaleString()} />
                        <StatCardSmall title="ลูกค้าทั้งหมด" value={(stats.customerCount || 0).toLocaleString()} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 px-2">
                        {/* ส่วนรายการสั่งซื้อล่าสุด */}
                        <div className="xl:col-span-8">
                            <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm h-full overflow-hidden">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-3xl font-medium text-[#000000] tracking-tight italic uppercase">Recent Orders</h3>
                                    <button className="text-lg font-medium text-[#111827] underline uppercase italic hover:text-black" onClick={() => navigate('/admin/orders')}>View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[#000000] bg-slate-50 uppercase text-xl font-medium tracking-widest border-b border-slate-300">
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4 text-right">Total</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {stats.recentOrders?.map(order => (
                                                <tr key={order.order_id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                                                    <td className="py-4 px-6 font-medium text-2xl text-[#000000]">#{order.order_id}</td>
                                                    <td className="py-4 px-6 text-2xl font-medium text-[#111827] truncate max-w-[200px]">{order.customer_name}</td>
                                                    <td className="py-4 px-6 text-right font-medium text-3xl text-[#000000] italic">฿{(order.total || 0).toLocaleString()}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className="px-5 py-1.5 rounded-full text-lg font-medium border border-slate-300 text-[#000000] whitespace-nowrap inline-block shadow-sm">
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

                        {/* ส่วนสินค้าขายดี */}
                        <div className="xl:col-span-4">
                            <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm h-full overflow-hidden">
                                <h3 className="text-3xl font-medium text-[#000000] italic mb-8 uppercase">Best Sellers</h3>
                                <div className="space-y-4">
                                    {stats.topProducts?.map((product) => (
                                        <div key={product.product_id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 group">
                                            <div className="flex items-center gap-4">
                                                <img src={product.image || '/placeholder.png'} className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm" alt={product.name} />
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium text-xl text-[#111827] uppercase italic leading-tight truncate max-w-[120px]">{product.name}</span>
                                                    <span className="text-base font-medium text-[#374151] italic">Sold: {product.total_sold}</span>
                                                </div>
                                            </div>
                                            <p className="font-medium text-2xl text-[#000000] italic">฿{product.price?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// 💎 StatCard: ปรับให้กระชับและสีเข้มชัดเจน
const StatCardSmall = ({ title, value }) => (
    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm flex flex-col gap-1 text-left">
        <p className="text-xl font-medium text-[#374151] uppercase tracking-widest italic leading-none">{title}</p>
        <h2 className="text-5xl font-medium italic tracking-tighter text-[#000000] leading-none mt-2 truncate">{value || 0}</h2>
    </div>
);

export default Dashboard;