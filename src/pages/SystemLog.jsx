import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Activity, Search, Clock, User, ShieldAlert,
    Loader2, Trash2, Calendar, ArrowRightLeft, ShieldCheck,
    PlusCircle, Package, RefreshCw, Menu, Filter, Info, ChevronRight,
    ChevronLeft, Sparkles, Leaf, Cookie, Smile, X, TrendingUp
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const SystemLog = () => {
    // --- 🏗️ States (Logic ครบถ้วน) ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    const token = localStorage.getItem('token');
    const userRole = token ? jwtDecode(token).role_level : 0;
    const isSuperAdmin = Number(userRole) === 1;

    // --- 📦 Logic Functions ---
    const fetchLogs = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SYSTEM_LOG);
            if (res.success) setLogs(res.data || []);
        } catch (err) { toast.error("ดึงข้อมูลกิจกรรมไม่สำเร็จ"); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ล้างประวัติกิจกรรมทั้งหมด?',
            text: "ข้อมูลนี้สำคัญต่อความปลอดภัย ยืนยันการลบทิ้งถาวรหรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ยืนยัน ลบทั้งหมด',
            customClass: { popup: 'rounded-[2rem] font-["Kanit"] border-4 border-[#2D241E]' }
        });
        if (!result.isConfirmed) return;
        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.SYSTEM_LOG}/clear`);
            if (res.success) { toast.success("ล้างประวัติเรียบร้อยแล้ว"); fetchLogs(true); }
        } catch (err) { toast.error("เกิดข้อผิดพลาดในการลบ"); }
    };

    // --- 🎨 Action Style Mapping (เข้มจัด) ---
    const getActionStyle = (details) => {
        let config = { color: 'text-[#2D241E]', bg: 'bg-white', border: 'border-[#2D241E]', Icon: Activity, label: 'กิจกรรมทั่วไป' };
        if (details.includes('Order') || details.includes('ออเดอร์') || details.includes('ชำระเงิน')) {
            config = { color: 'text-[#2D241E]', bg: 'bg-slate-50', border: 'border-[#2D241E]/20', Icon: Package, label: 'คำสั่งซื้อ' };
        } else if (details.includes('ลบ')) {
            config = { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-600', Icon: ShieldAlert, label: 'การลบข้อมูล' };
        } else if (details.includes('แก้ไข') || details.includes('เปลี่ยน')) {
            config = { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-600', Icon: ArrowRightLeft, label: 'การอัปเดต' };
        } else if (details.includes('เพิ่ม') || details.includes('สร้าง')) {
            config = { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-600', Icon: PlusCircle, label: 'การสร้างใหม่' };
        } else if (details.includes('เข้าสู่ระบบ')) {
            config = { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600', Icon: ShieldCheck, label: 'ความปลอดภัย' };
        }
        return config;
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const search = searchTerm.toLowerCase();
            const adminName = `${log.user?.first_name} ${log.user?.last_name}`.toLowerCase();
            const details = (log.action_details || "").toLowerCase();
            const matchesSearch = details.includes(search) || adminName.includes(search);
            if (activeFilter === 'all') return matchesSearch;
            if (activeFilter === 'create') return matchesSearch && (details.includes('เพิ่ม') || details.includes('สร้าง'));
            if (activeFilter === 'update') return matchesSearch && (details.includes('แก้ไข') || details.includes('เปลี่ยน'));
            if (activeFilter === 'delete') return matchesSearch && details.includes('ลบ');
            if (activeFilter === 'auth') return matchesSearch && details.includes('เข้าสู่ระบบ');
            return matchesSearch;
        });
    }, [logs, searchTerm, activeFilter]);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const currentLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, activeFilter]);

    if (loading && logs.length === 0) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="system_log" />

            {/* 🚀 Main: Scale มาตรฐาน Product */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-8 lg:p-10 w-full relative z-10`}>
                
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] shadow-sm border-2 border-[#2D241E] active:scale-90"><Menu size={24} /></button>
                    <Header title="ประวัติกิจกรรมระบบ" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 px-2 text-left">
                    <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                            <Sparkles size={14} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">System Audit Trail</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">AuditLogs</h1>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        {isSuperAdmin && (
                            <button onClick={handleClearAll} className="flex-1 lg:flex-none border-2 border-red-600 text-red-600 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Trash2 size={16} strokeWidth={3} /> ล้างประวัติ
                            </button>
                        )}
                        <button onClick={() => fetchLogs()} className="p-4 rounded-2xl bg-white border-2 border-[#2D241E] shadow-lg hover:rotate-180 transition-all active:scale-90 group shrink-0">
                            <RefreshCw size={24} className={`text-[#2D241E] ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* 📊 Stat Cards - เข้มชัด */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 px-2">
                    <StatCardSmall title="ประวัติทั้งหมด" value={logs.length} icon={<Activity />} />
                    <StatCardSmall title="รายการวันนี้" value={logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length} icon={<Calendar />} />
                    <StatCardSmall title="การลบข้อมูล" value={logs.filter(l => l.action_details.includes('ลบ')).length} icon={<ShieldAlert />} />
                    <StatCardSmall title="การอัปเดต" value={logs.filter(l => l.action_details.includes('แก้ไข')).length} icon={<ArrowRightLeft />} />
                </div>

                {/* Table Section - High Contrast */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full lg:w-auto">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'create', label: 'สร้าง/เพิ่ม' },
                                { id: 'update', label: 'แก้ไข' },
                                { id: 'delete', label: 'ลบ' },
                                { id: 'auth', label: 'ความปลอดภัย' }
                            ].map(f => (
                                <button key={f.id} onClick={() => setActiveFilter(f.id)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeFilter === f.id ? 'bg-[#2D241E] text-white shadow-md' : 'bg-slate-50 text-[#2D241E] border-2 border-slate-100'}`}>{f.label}</button>
                            ))}
                        </div>
                        <div className="relative w-full lg:max-w-md">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2D241E]" strokeWidth={3} />
                            <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border-2 border-slate-100 outline-none font-black text-sm text-[#2D241E] focus:border-[#2D241E] transition-all" placeholder="ค้นหาผู้ดูแล หรือ กิจกรรม..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[#2D241E] uppercase text-xs font-black tracking-widest px-6">
                                    <th className="px-6 pb-2">วันและเวลา</th>
                                    <th className="px-6 pb-2">ผู้ดำเนินการ</th>
                                    <th className="px-6 pb-2">กิจกรรม</th>
                                    <th className="px-6 pb-2 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLogs.map(log => {
                                    const style = getActionStyle(log.action_details || "");
                                    return (
                                        <tr key={log.log_id} className="group hover:translate-x-1 transition-all">
                                            <td className="py-4 px-6 rounded-l-2xl bg-white border-y border-l border-slate-100">
                                                <div className="flex flex-col text-left">
                                                    <span className="font-black text-sm text-[#2D241E]">{new Date(log.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-[10px] font-black text-[#2D241E] italic">{new Date(log.created_at).toLocaleTimeString('th-TH')} น.</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 bg-white border-y border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-[#2D241E] text-white rounded-lg flex items-center justify-center font-black text-xs uppercase shadow-md">{log.user?.first_name?.charAt(0)}</div>
                                                    <span className="font-black text-sm uppercase truncate max-w-[150px] text-[#2D241E]">{log.user?.first_name} {log.user?.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 bg-white border-y border-slate-100">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${style.bg} ${style.color} ${style.border} shadow-sm`}>
                                                    <style.Icon size={10} strokeWidth={3} /> {style.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 rounded-r-2xl bg-white border-y border-r border-slate-100 text-right">
                                                <button onClick={() => { setSelectedLog(log); setIsModalOpen(true); }} className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-[#2D241E] hover:text-white transition-all shadow-sm text-[#2D241E]">
                                                    <ChevronRight size={16} strokeWidth={3} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
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

            {/* ✨ Detail Modal: เข้มจัด */}
            {isModalOpen && selectedLog && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/30 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 border-4 border-[#2D241E] flex flex-col relative animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#2D241E] p-2.5 rounded-xl text-white shadow-lg"><Info size={24} strokeWidth={3} /></div>
                                <h2 className="text-xl font-black uppercase italic text-[#2D241E]">Log Detail</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-[#2D241E] rounded-full border-2 border-[#2D241E] hover:text-red-500 transition-all"><X size={20} strokeWidth={3}/></button>
                        </div>
                        
                        <div className="space-y-4 text-left">
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-[#2D241E]/10 shadow-inner">
                                <span className="text-[10px] font-black uppercase text-[#2D241E] block mb-2 tracking-widest">Activity Detail</span>
                                <p className="text-base font-black leading-relaxed text-[#2D241E] italic">"{selectedLog.action_details}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white border-2 border-[#2D241E] rounded-2xl">
                                    <span className="text-[10px] font-black uppercase text-[#2D241E] block mb-1">Admin User</span>
                                    <p className="text-sm font-black uppercase text-[#2D241E] truncate">{selectedLog.user?.first_name} {selectedLog.user?.last_name}</p>
                                </div>
                                <div className="p-4 bg-white border-2 border-[#2D241E] rounded-2xl">
                                    <span className="text-[10px] font-black uppercase text-[#2D241E] block mb-1">Timestamp</span>
                                    <p className="text-sm font-black text-[#2D241E]">{new Date(selectedLog.created_at).toLocaleString('th-TH')}</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setIsModalOpen(false)} className="mt-6 w-full py-4 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] shadow-xl italic">Close Window</button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 4s infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}} />
        </div>
    );
};

// 💎 StatCard Component (High Contrast)
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

export default SystemLog;