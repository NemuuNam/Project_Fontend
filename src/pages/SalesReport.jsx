import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, BarChart3, Loader2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const SalesReport = () => {
    const [salesData, setSalesData] = useState({
        summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
        chartData: [],
        topProducts: []
    });
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30');

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.REPORTS}?range=${range}`);
            if (res && res.success && res.data) {
                setSalesData(res.data);
            }
        } catch (err) {
            toast.error("ดึงข้อมูลรายงานล้มเหลว");
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => { fetchSales(); }, [fetchSales]);

    return (
        <div className="flex min-h-screen bg-[#f4f7fe] font-['Kanit'] text-[#1b2559]">
            <Toaster />
            <Sidebar activePage="reports" />
            <main className="flex-1 p-8 ml-[260px]">
                <Header title="รายงานวิเคราะห์ยอดขาย" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
                    <KPICard title="รายได้รวม" value={`฿${salesData.summary.totalRevenue.toLocaleString()}`} icon={<DollarSign/>} color="#4318ff" />
                    <KPICard title="ออเดอร์สำเร็จ" value={salesData.summary.totalOrders} icon={<ShoppingBag/>} color="#05cd99" />
                    <KPICard title="เฉลี่ย/บิล" value={`฿${Math.round(salesData.summary.avgOrderValue).toLocaleString()}`} icon={<BarChart3/>} color="#ffb547" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-white p-8 rounded-[32px] border border-[#f1f5f9] shadow-sm">
                        <h3 className="text-lg font-bold mb-8 flex items-center gap-3"><TrendingUp color="#4318ff"/> แนวโน้มรายได้</h3>
                        <div style={{ height: '350px', width: '100%' }}>
                            {/* ✅ แก้ปัญหา Width/Height -1 โดยเช็ค loading และข้อมูลก่อนวาดกราฟ */}
                            {!loading && salesData.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData.chartData}>
                                        <defs>
                                            <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4318ff" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#4318ff" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 11}} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 11}} tickFormatter={(v) => `฿${v.toLocaleString()}`} />
                                        <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
                                        <Area type="monotone" dataKey="amount" stroke="#4318ff" strokeWidth={3} fill="url(#sales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300">
                                    {loading ? <Loader2 className="animate-spin" /> : "ยังไม่มีข้อมูลสำหรับการวาดกราฟ"}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-[#f1f5f9]">
                        <h3 className="text-lg font-bold mb-6">สินค้าขายดี</h3>
                        <div className="flex flex-col gap-4">
                            {salesData.topProducts.map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-sm m-0">{p.product_name}</p>
                                        <p className="text-xs text-slate-400 m-0">{p.total_qty} ชิ้น</p>
                                    </div>
                                    <p className="font-black text-[#05cd99]">฿{p.total_sales.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const KPICard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-[28px] border border-[#f1f5f9] flex justify-between items-center shadow-sm">
        <div>
            <p className="text-[11px] font-bold text-[#a3aed0] uppercase mb-1">{title}</p>
            <h2 className="text-2xl font-black m-0">{typeof value === 'number' ? value.toLocaleString() : value}</h2>
        </div>
        <div style={{ background: `${color}10`, color }} className="p-4 rounded-2xl">{icon}</div>
    </div>
);

export default SalesReport;