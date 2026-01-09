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
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- ✨ Pagination State ---
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

    // --- 📦 Logic (คงเดิม 100%) ---
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.INVENTORY_LOG);
            if (res.success) setLogs(res.data || []);
        } catch (err) {
            toast.error("ดึงข้อมูลประวัติไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ล้างประวัติทั้งหมด?',
            text: "ข้อมูลกิจกรรมสต็อกทั้งหมดจะถูกลบถาวรเพื่อเพิ่มพื้นที่ฐานข้อมูล!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ยืนยัน ลบทั้งหมด',
            cancelButtonText: 'ยกเลิก',
            background: '#ffffff',
            color: '#2D241E',
            customClass: { popup: 'rounded-[3rem] border border-slate-100 font-["Kanit"]' }
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.INVENTORY_LOG}/clear`);
            if (res.success) {
                toast.success("ล้างประวัติคลังสินค้าเรียบร้อยแล้ว");
                fetchLogs();
            }
        } catch (err) { toast.error("ลบข้อมูลไม่สำเร็จ"); }
    };

    // --- 🔍 Filtering Logic ---
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const fullName = `${log.user?.first_name || ''} ${log.user?.last_name || ''}`.toLowerCase();
            const matchesSearch =
                log.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fullName.includes(searchTerm.toLowerCase());

            const matchesType =
                filterType === 'all' ||
                (filterType === 'increase' && log.change_qty > 0) ||
                (filterType === 'decrease' && log.change_qty < 0);

            return matchesSearch && matchesType;
        });
    }, [logs, searchTerm, filterType]);

    // --- 📑 Pagination Logic ---
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const currentLogs = useMemo(() => {
        const start = (currentPage - 1) * logsPerPage;
        return filteredLogs.slice(start, start + logsPerPage);
    }, [filteredLogs, currentPage]);

    // รีเซ็ตหน้ากลับไปหน้า 1 เมื่อมีการค้นหาหรือกรอง
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

    if (loading && logs.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative selection:bg-[#F3E9DC]">

            {/* ☁️ Global Cozy Patterns (Opacity 0.02) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 opacity-[0.02] text-[#2D241E]" size={200} />
                <Cookie className="absolute bottom-[15%] right-[10%] -rotate-12 opacity-[0.02] text-[#2D241E]" size={180} />
                <Smile className="absolute top-[40%] right-[30%] opacity-[0.015] text-[#2D241E]" size={350} />
                <Sparkles className="absolute top-[15%] left-[45%] text-[#2D241E] opacity-[0.02]" size={100} />
            </div>

            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="invlog" />

            <main className={`flex-1 transition-all duration-500 ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[300px]'} p-4 md:p-10 lg:p-14 w-full relative z-10`}>

                {/* Header Section ปรับให้กดง่ายขึ้นใน Mobile */}
                <div className="mb-8 md:mb-1 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-2xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-95 transition-all"><Menu size={24} /></button>
                    <Header title="ตรวจสอบคลังสินค้า" />
                </div>

                {/* 🏷️ Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 px-2">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 mb-2 animate-bounce-slow">
                            <Sparkles size={14} className="text-[#2D241E]" />
                            <span className="text-[20px] font-black uppercase tracking-[0.1em] text-[#2D241E]/60">
                                ประวัติการเคลื่อนไหวสต็อก</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">
                            Stock<span className="opacity-10">Logs</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="hidden md:flex flex-col items-end px-6 border-r border-slate-100">
                            <span className=" text-[20px] font-black text-[#2D241E] uppercase tracking-widest">ประวัติทั้งหมด</span>
                            <span className="text-[20px] font-bold text-[#2D241E]">{filteredLogs.length} รายการ</span>
                        </div>
                        <button onClick={fetchLogs} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-90 group">
                            <RefreshCw size={24} className={`text-[#2D241E]/40 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        </button>
                    </div>
                </div>

                {/* 📊 Main Content Area */}
                <div className="bg-white p-6 md:p-12 rounded-[3rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <Smile className="absolute -bottom-10 -right-10 opacity-[0.01] text-[#2D241E]" size={250} />

                    {/* Toolbar */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-14 relative z-10">
                        <div className="flex flex-wrap gap-2 p-1 bg-slate-50/50 rounded-full border border-slate-100 w-fit">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'increase', label: 'นำเข้า' },
                                { id: 'decrease', label: 'เบิกออก' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterType(tab.id)}
                                    className={`px-8 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${filterType === tab.id ? 'bg-[#2D241E] text-white shadow-md scale-105' : 'text-[#2D241E] hover:text-[#2D241E]'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 w-full xl:max-w-2xl">
                            <div className="relative flex-1 group">
                                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2D241E]/20 transition-colors" />
                                <input
                                    className="w-full pl-14 pr-8 py-4 rounded-full bg-slate-50/50 border border-transparent focus:bg-white focus:border-slate-200 outline-none font-bold text-xl transition-all shadow-inner placeholder:text-[#2D241E]/20"
                                    placeholder="ค้นหาสินค้า, ผู้ดำเนินการ หรือ เหตุผล..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {canClearLogs && (
                                <button onClick={handleClearAll} className="px-8 py-4 bg-white text-red-400 border border-red-50 rounded-full font-black flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all uppercase  text-[20px] tracking-widest shadow-sm active:scale-95">
                                    <Trash2 size={18} /> ล้างข้อมูล
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto relative z-10 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[1000px]">
                            <thead>
                                <tr className="text-[#2D241E] uppercase text-[20px] font-black tracking-[0.1em] px-8">
                                    <th className="px-10 pb-2">วันและเวลา</th>
                                    <th className="px-10 pb-2">ข้อมูลสินค้า</th>
                                    <th className="px-10 pb-2 text-center">การเคลื่อนไหว</th>
                                    <th className="px-10 pb-2">ผู้ดำเนินการ</th>
                                    <th className="px-10 pb-2">เหตุผล / หมายเหตุ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-0">
                                {currentLogs.length > 0 ? currentLogs.map((log) => (
                                    <tr key={log.inv_log_id} className="group/row hover:translate-x-1 transition-all">

                                        <td className="px-10 py-7 rounded-l-[2.5rem] md:rounded-l-[3rem] bg-white border-y border-l border-slate-50 group-hover/row:bg-slate-50/50 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white text-[#2D241E]/20 rounded-2xl shadow-sm border border-slate-100 group-hover/row:text-[#2D241E] transition-colors">
                                                    <Calendar size={18} />
                                                </div>
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-[20px] font-black text-[#2D241E]">
                                                        {new Date(log.created_at).toLocaleDateString('th-TH', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className=" text-[20px] font-bold text-[#8B7E66] uppercase tracking-widest flex items-center gap-1 opacity-60">
                                                        <Clock size={10} />
                                                        {new Date(log.created_at).toLocaleTimeString('th-TH', {
                                                            hour: '2-digit', minute: '2-digit'
                                                        })} น.
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-10 py-7 bg-white border-y border-slate-50 group-hover/row:bg-slate-50/50">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#2D241E]/20 group-hover/row:text-[#2D241E] group-hover/row:border-[#2D241E]/20 transition-all shadow-sm shrink-0">
                                                    <Package size={22} />
                                                </div>
                                                <span className="font-black text-xl text-[#2D241E] truncate max-w-[220px] uppercase tracking-tighter italic leading-none">
                                                    {log.product?.product_name || 'ไม่พบข้อมูลสินค้า'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-10 py-7 bg-white border-y border-slate-50 group-hover/row:bg-slate-50/50 text-center">
                                            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[20px] font-black border tracking-tighter shadow-sm transition-transform group-hover/row:scale-110 ${log.change_qty > 0
                                                    ? 'bg-white text-emerald-600 border-emerald-100'
                                                    : 'bg-white text-red-600 border-red-100'
                                                }`}>
                                                {log.change_qty > 0 ? <ArrowUpCircle size={18} strokeWidth={3} /> : <ArrowDownCircle size={18} strokeWidth={3} />}
                                                {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty}
                                            </div>
                                        </td>

                                        <td className="px-10 py-7 bg-white border-y border-slate-50 group-hover/row:bg-slate-50/50 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white text-[#2D241E] flex items-center justify-center font-black  text-[20px] border-4 border-white shadow-sm overflow-hidden group-hover/row:scale-110 transition-transform">
                                                    {log.user?.first_name?.charAt(0) || <User size={14} />}
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-black text-[#2D241E] text-[20px] uppercase tracking-tighter leading-none">
                                                        {log.user ? `${log.user.first_name} ${log.user.last_name || ''}` : 'ระบบอัตโนมัติ'}
                                                    </span>
                                                    <span className=" text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] opacity-70 italic">Authorized Audit</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-10 py-7 rounded-r-[2.5rem] md:rounded-r-[3rem] bg-white border-y border-r border-slate-50 group-hover/row:bg-slate-50/50 text-left">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-bold text-[#2D241E]/60 text-[20px] italic group-hover/row:text-[#2D241E] transition-colors line-clamp-1">
                                                    {log.reason || 'ปรับปรุงสต็อกด้วยตนเอง'}
                                                </span>
                                                <div className="opacity-0 group-hover/row:opacity-100 transition-all pr-4">
                                                    <ChevronRight size={18} className="text-[#2D241E]/20" strokeWidth={3} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-40 bg-white">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="w-24 h-24 rounded-[3rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                                                    <ClipboardList size={48} className="text-[#2D241E]/10" strokeWidth={1} />
                                                </div>
                                                <div className="space-y-1 text-center">
                                                    <p className="text-2xl font-black uppercase tracking-tighter text-[#2D241E]/20">ไม่พบประวัติสต็อก</p>
                                                    <p className="text-[20px] font-light italic text-[#2D241E]">ยังไม่มีการเคลื่อนไหวของสินค้าในระบบ</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- ✨ Pagination System (Only White) --- */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-4 relative z-10 pb-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-3 bg-white border border-slate-100 rounded-2xl text-[#2D241E] disabled:opacity-20 hover:shadow-lg transition-all active:scale-90 shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100 shadow-inner">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // แสดงเฉพาะเลขใกล้เคียงปัจจุบันถ้าหน้าเยอะเกินไป
                                    if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl font-black  text-xl transition-all ${currentPage === pageNum ? 'bg-[#2D241E] text-white shadow-xl scale-110' : 'text-[#2D241E] hover:text-[#2D241E]'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-3 bg-white border border-slate-100 rounded-2xl text-[#2D241E] disabled:opacity-20 hover:shadow-lg transition-all active:scale-90 shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
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
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default InventoryLog;