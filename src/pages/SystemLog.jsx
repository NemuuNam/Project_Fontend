import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Activity, Search, Clock, User, ShieldAlert,
    Loader2, Trash2, Calendar, ArrowRightLeft, ShieldCheck,
    PlusCircle, Package, Menu, Filter, Info, ChevronRight,
    ChevronLeft, Sparkles, X, TrendingUp
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const SystemLog = () => {
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
            text: "ยืนยันการลบทิ้งถาวรหรือไม่? ข้อมูลนี้สำคัญต่อความปลอดภัย",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            confirmButtonText: 'ยืนยัน ลบทั้งหมด',
            customClass: { popup: 'rounded-[2.5rem] font-["Kanit"] border border-slate-300' }
        });
        if (!result.isConfirmed) return;
        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.SYSTEM_LOG}/clear`);
            if (res.success) { toast.success("ล้างประวัติเรียบร้อยแล้ว"); fetchLogs(true); }
        } catch (err) { toast.error("เกิดข้อผิดพลาดในการลบ"); }
    };

    const getActionStyle = (details) => {
        let config = { color: 'text-[#000000]', bg: 'bg-white', border: 'border-slate-300', Icon: Activity, label: 'กิจกรรมทั่วไป' };
        if (details.includes('Order') || details.includes('ออเดอร์')) {
            config = { color: 'text-[#000000]', bg: 'bg-white', border: 'border-slate-300', Icon: Package, label: 'คำสั่งซื้อ' };
        } else if (details.includes('ลบ')) {
            config = { color: 'text-red-700', bg: 'bg-white', border: 'border-red-300', Icon: ShieldAlert, label: 'การลบข้อมูล' };
        } else if (details.includes('แก้ไข')) {
            config = { color: 'text-[#000000]', bg: 'bg-white', border: 'border-slate-300', Icon: ArrowRightLeft, label: 'การอัปเดต' };
        } else if (details.includes('เพิ่ม') || details.includes('สร้าง')) {
            config = { color: 'text-[#000000]', bg: 'bg-white', border: 'border-slate-300', Icon: PlusCircle, label: 'การสร้างใหม่' };
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
            return matchesSearch;
        });
    }, [logs, searchTerm, activeFilter]);

    const currentLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, activeFilter]);

    if (loading && logs.length === 0) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-slate-800" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden relative max-w-full">
            <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="system_log" />

            {/* 🚀 ปรับ Margin Left ตาม Sidebar 280px และลด Padding ขวา */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[280px]'} p-4 md:p-5 lg:p-6 lg:pr-4 w-full relative z-10`}>
                <div className="mb-4 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl text-[#111827] border border-slate-300"><Menu size={24} /></button>
                    <Header title="ประวัติกิจกรรมระบบ" isCollapsed={isCollapsed} />
                </div>

                {/* 🚀 pt-24 หลบ Header ทึบ */}
                <div className="pt-24">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 px-2">
                        <StatCardSmall title="ประวัติทั้งหมด" value={logs.length} />
                        <StatCardSmall title="รายการวันนี้" value={logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length} />
                        <StatCardSmall title="การลบข้อมูล" value={logs.filter(l => l.action_details.includes('ลบ')).length} />
                        <StatCardSmall title="การอัปเดต" value={logs.filter(l => l.action_details.includes('แก้ไข')).length} />
                    </div>

                    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex gap-2 p-1 bg-slate-50 rounded-full border border-slate-200">
                                    {[{ id: 'all', label: 'ทั้งหมด' }, { id: 'create', label: 'สร้าง' }, { id: 'update', label: 'แก้ไข' }, { id: 'delete', label: 'ลบ' }].map(f => (
                                        <button key={f.id} onClick={() => setActiveFilter(f.id)}
                                            className={`px-4 py-1.5 rounded-full text-base font-medium uppercase transition-all ${activeFilter === f.id ? 'bg-[#000000] text-white shadow-sm' : 'text-[#374151] hover:bg-white'}`}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                                
                                {isSuperAdmin && (
                                    <button onClick={handleClearAll} className="bg-white border border-red-600 text-red-600 px-5 py-1.5 rounded-full font-medium text-base uppercase shadow-sm active:scale-95 flex items-center gap-2 italic transition-colors hover:bg-red-50">
                                        <Trash2 size={18} /> ล้างประวัติ
                                    </button>
                                )}
                            </div>

                            <div className="relative w-full lg:max-w-md">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#374151]" />
                                <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border border-slate-200 outline-none text-xl font-medium text-[#000000] focus:bg-white" placeholder="ค้นหาผู้ดำเนินการ หรือ กิจกรรม..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[#000000] bg-slate-50 uppercase text-xl font-medium tracking-widest border-b border-slate-300">
                                        <th className="px-6 py-4">วันและเวลา</th>
                                        <th className="px-6 py-4">ผู้ดำเนินการ</th>
                                        <th className="px-6 py-4">กิจกรรม</th>
                                        <th className="px-6 py-4 text-right">รายละเอียด</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {currentLogs.map(log => {
                                        const style = getActionStyle(log.action_details || "");
                                        return (
                                            <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                                                {/* 📉 py-4 เพื่อความกระชับ */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col text-left leading-none">
                                                        <span className="font-medium text-xl text-[#000000]">{new Date(log.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                        <span className="text-base font-medium text-[#374151] italic mt-1">{new Date(log.created_at).toLocaleTimeString('th-TH')} น.</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-100 border border-slate-300 text-[#000000] rounded-xl flex items-center justify-center font-medium text-lg uppercase shadow-sm">{log.user?.first_name?.charAt(0)}</div>
                                                        <span className="text-xl font-medium text-[#000000] uppercase truncate max-w-[150px] italic leading-tight">{log.user?.first_name} {log.user?.last_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-base font-medium border whitespace-nowrap shadow-sm ${style.border} ${style.color}`}>
                                                        <style.Icon size={16} /> {style.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button onClick={() => { setSelectedLog(log); setIsModalOpen(true); }} className="p-3 bg-white border border-slate-300 rounded-xl text-[#374151] hover:text-[#000000] transition-colors shadow-sm">
                                                        <ChevronRight size={22} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-6">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === 1 ? 'opacity-30' : ''}`}><ChevronLeft size={28} /></button>
                                <div className="flex items-center gap-2"><span className="text-xl font-medium text-[#374151] uppercase">Page</span><div className="bg-white border border-[#111827] text-[#111827] px-6 py-1 rounded-lg text-3xl font-medium italic shadow-sm">{currentPage}</div><span className="text-xl font-medium text-[#374151]">/ {totalPages}</span></div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === totalPages ? 'opacity-30' : ''}`}><ChevronRight size={28} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- ✨ Detail Modal: Compact & High Contrast (1px Border) --- */}
            {isModalOpen && selectedLog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-8 border border-slate-300 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8 text-left border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-4 text-left leading-none">
                                <div className="bg-slate-50 p-3 rounded-xl text-[#000000] border border-slate-200 shadow-sm"><Info size={28} /></div>
                                <h2 className="text-2xl font-medium uppercase italic text-[#000000] tracking-tight">Activity Info</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-[#111827] border border-slate-200 rounded-full hover:text-red-600"><X size={24} /></button>
                        </div>

                        <div className="space-y-6 text-left">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 shadow-inner">
                                <span className="text-[10px] font-medium uppercase text-[#374151] block mb-2 tracking-widest italic">Action Details</span>
                                <p className="text-xl font-medium leading-relaxed text-[#000000] italic">"{selectedLog.action_details}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                    <span className="text-[10px] font-medium uppercase text-[#374151] block mb-1">Administrator</span>
                                    <p className="text-lg font-medium text-[#000000] uppercase truncate">{selectedLog.user?.first_name} {selectedLog.user?.last_name}</p>
                                </div>
                                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                    <span className="text-[10px] font-medium uppercase text-[#374151] block mb-1">Log Timestamp</span>
                                    <p className="text-lg font-medium text-[#000000]">{new Date(selectedLog.created_at).toLocaleString('th-TH')}</p>
                                </div>
                            </div>

                            <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 py-5 bg-white border border-[#000000] text-[#000000] rounded-full font-medium text-xl uppercase tracking-widest shadow-md active:scale-95 italic">CLOSE DETAILS</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 StatCard: ปรับระยะ p-6 และขอบบาง 1px
const StatCardSmall = ({ title, value }) => (
    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm flex flex-col gap-1 text-left">
        <p className="text-xl font-medium text-[#374151] uppercase tracking-widest italic leading-none">{title}</p>
        <h2 className="text-5xl font-medium italic tracking-tighter text-[#000000] leading-none mt-2 truncate">{value || 0}</h2>
    </div>
);

export default SystemLog;