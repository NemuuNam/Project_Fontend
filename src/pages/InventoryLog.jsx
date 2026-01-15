import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    ClipboardList, Search, ArrowUpCircle, ArrowDownCircle,
    Package, Loader2, User, Trash2, Calendar, RefreshCw, Menu, Clock,
    Filter, ChevronRight, ChevronLeft, Activity, Sparkles, Leaf, Cookie, Smile
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const InventoryLog = () => {
    // --- 🏗️ States (Logic เดิมครบถ้วน) ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    const token = localStorage.getItem('token');
    let userRole = 0;
    try {
        if (token) {
            const decoded = jwtDecode(token);
            userRole = Number(decoded.role_level) || 0;
        }
    } catch (err) { console.error("Token decode error:", err); }

    const canClearLogs = userRole === 1;

    // --- 📦 Logic Functions ---
    const fetchLogs = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.INVENTORY_LOG);
            if (res.success) setLogs(res.data || []);
        } catch (err) { toast.error("ดึงข้อมูลประวัติไม่สำเร็จ"); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ล้างประวัติทั้งหมด?',
            text: "ข้อมูลกิจกรรมสต็อกจะถูกลบถาวร!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ยืนยัน ลบทั้งหมด',
            customClass: { popup: 'rounded-[2rem] font-["Kanit"] border-4 border-[#2D241E]' }
        });
        if (!result.isConfirmed) return;
        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.INVENTORY_LOG}/clear`);
            if (res.success) { toast.success("ล้างประวัติเรียบร้อยแล้ว"); fetchLogs(true); }
        } catch (err) { toast.error("ลบข้อมูลไม่สำเร็จ"); }
    };

    // --- 🔍 Filtering & Pagination ---
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const fullName = `${log.user?.first_name || ''} ${log.user?.last_name || ''}`.toLowerCase();
            const matchesSearch = log.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                fullName.includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || 
                               (filterType === 'increase' && log.change_qty > 0) || 
                               (filterType === 'decrease' && log.change_qty < 0);
            return matchesSearch && matchesType;
        });
    }, [logs, searchTerm, filterType]);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const currentLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType]);

    if (loading && logs.length === 0) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="invlog" />

            {/* 🚀 Main: Scale มาตรฐาน (เท่าหน้า Product) */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-8 lg:p-10 w-full relative z-10`}>
                
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] shadow-sm border-2 border-[#2D241E] active:scale-90 transition-all"><Menu size={24} /></button>
                    <Header title="ตรวจสอบคลังสินค้า" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 px-2 text-left">
                    <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                            <Sparkles size={14} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Inventory Movement</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">StockLogs</h1>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        {canClearLogs && (
                            <button onClick={handleClearAll} className="flex-1 lg:flex-none border-2 border-red-600 text-red-600 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Trash2 size={16} strokeWidth={3} /> ล้างประวัติ
                            </button>
                        )}
                        <button onClick={() => fetchLogs()} className="p-3.5 rounded-2xl bg-white border-2 border-[#2D241E] shadow-lg hover:rotate-180 transition-all active:scale-90 group">
                            <RefreshCw size={24} className={`text-[#2D241E] ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* 📊 Stat Cards (เข้มจัด + Scale matched) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 px-2">
                    <StatCardSmall title="รายการวันนี้" value={logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length} icon={<Activity />} />
                    <StatCardSmall title="นำเข้าสต็อก" value={logs.filter(l => l.change_qty > 0).length} icon={<ArrowUpCircle />} />
                    <StatCardSmall title="เบิกออกสต็อก" value={logs.filter(l => l.change_qty < 0).length} icon={<ArrowDownCircle />} />
                    <StatCardSmall title="รวมทั้งหมด" value={logs.length} icon={<ClipboardList />} />
                </div>

                {/* Table Section - High Contrast */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
                        <div className="flex gap-2 p-1 bg-slate-50 rounded-full border-2 border-slate-100">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'increase', label: 'นำเข้า' },
                                { id: 'decrease', label: 'เบิกออก' }
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setFilterType(tab.id)} className={`px-5 py-1.5 rounded-full text-xs font-black uppercase transition-all ${filterType === tab.id ? 'bg-[#2D241E] text-white shadow-md' : 'text-[#2D241E] hover:bg-white transition-colors'}`}>{tab.label}</button>
                            ))}
                        </div>
                        <div className="relative w-full lg:max-w-md">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2D241E]" strokeWidth={3} />
                            <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border-2 border-slate-100 outline-none font-black text-sm text-[#2D241E] focus:border-[#2D241E] transition-all shadow-inner placeholder:text-[#2D241E]" placeholder="ค้นหาสินค้า หรือ ผู้ดูแล..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[#2D241E] uppercase text-xs font-black tracking-widest px-6">
                                    <th className="px-6 pb-2">วันและเวลา</th>
                                    <th className="px-6 pb-2">ข้อมูลสินค้า</th>
                                    <th className="px-6 pb-2 text-center">จำนวน</th>
                                    <th className="px-6 pb-2 text-center">ผู้ดำเนินการ</th>
                                    <th className="px-6 pb-2">เหตุผล</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLogs.map(log => (
                                    <tr key={log.inv_log_id} className="group hover:translate-x-1 transition-all">
                                        <td className="py-4 px-6 rounded-l-2xl bg-white border-y border-l border-slate-100">
                                            <div className="flex flex-col leading-tight text-left">
                                                <span className="font-black text-sm text-[#2D241E]">{new Date(log.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="text-[10px] font-black text-[#2D241E] italic">{new Date(log.created_at).toLocaleTimeString('th-TH')} น.</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#2D241E] border-2 border-[#2D241E]/10 group-hover:scale-110 transition-transform"><Package size={18} strokeWidth={3} /></div>
                                                <span className="font-black text-sm uppercase truncate max-w-[200px] text-[#2D241E] italic">{log.product?.product_name || 'ไม่พบสินค้า'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100 text-center">
                                            <span className={`inline-flex items-center gap-1 px-4 py-1 rounded-full text-xs font-black border-2 shadow-sm ${log.change_qty > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'bg-red-50 text-red-600 border-red-600'}`}>
                                                {log.change_qty > 0 ? <ArrowUpCircle size={12} strokeWidth={3} /> : <ArrowDownCircle size={12} strokeWidth={3} />}
                                                {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-8 h-8 bg-[#2D241E] text-white rounded-lg flex items-center justify-center font-black text-[10px] uppercase shadow-md">{log.user?.first_name?.charAt(0)}</div>
                                                <span className="font-black text-xs uppercase truncate max-w-[150px] text-[#2D241E]">{log.user?.first_name || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 rounded-r-2xl bg-white border-y border-r border-slate-100 text-left">
                                            <span className="text-xs font-black text-[#2D241E] italic line-clamp-1">"{log.reason || 'ปรับปรุงคลังสินค้า'}"</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 active:scale-90 transition-all shadow-md"><ChevronLeft size={20} strokeWidth={3}/></button>
                            <span className="text-xs font-black text-[#2D241E] italic">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 active:scale-90 transition-all shadow-md"><ChevronRight size={20} strokeWidth={3}/></button>
                        </div>
                    )}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 4s infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
            `}} />
        </div>
    );
};

// 💎 StatCard: เข้มจัด High Contrast (มาตรฐาน Product)
const StatCardSmall = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-2xl border-2 border-[#2D241E] shadow-lg flex items-center justify-between hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1 leading-none">{title}</p>
            <h2 className="text-[#2D241E] text-2xl font-black italic leading-none">{value || 0}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#2D241E] flex items-center justify-center text-white border-2 border-white shadow-md transition-all">
            {React.cloneElement(icon, { size: 18, strokeWidth: 3 })}
        </div>
    </div>
);

export default InventoryLog;