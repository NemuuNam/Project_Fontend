import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
    Activity, Search, Clock, User, ShieldAlert, 
    Loader2, Trash2, Calendar, ArrowRightLeft, ShieldCheck, 
    PlusCircle, Package, RefreshCw, Menu, Filter, Info, ChevronRight,
    ChevronLeft, Sparkles, Leaf, Cookie, Smile
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

    // --- ✨ Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;
    
    const token = localStorage.getItem('token');
    const userRole = token ? jwtDecode(token).role_level : 0;
    const isSuperAdmin = Number(userRole) === 1;

    // --- 📦 Logic (คงเดิม 100%) ---
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SYSTEM_LOG);
            if (res.success) setLogs(res.data || []);
        } catch (err) {
            toast.error("ดึงข้อมูลกิจกรรมไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ล้างประวัติกิจกรรมทั้งหมด?',
            text: "ข้อมูลนี้มีความสำคัญต่อการตรวจสอบความปลอดภัย ยืนยันการลบทิ้งถาวรหรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ยืนยัน ลบทั้งหมด',
            cancelButtonText: 'ยกเลิก',
            background: '#ffffff',
            color: '#2D241E',
            customClass: { popup: 'rounded-[3rem] font-["Kanit"]' }
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.SYSTEM_LOG}/clear`);
            if (res.success) {
                toast.success("ล้างประวัติระบบเรียบร้อยแล้ว");
                fetchLogs(); 
            }
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการลบ");
        }
    };

    const getActionStyle = (details) => {
        let config = { color: 'text-[#2D241E]', bg: 'bg-white', border: 'border-slate-100', Icon: Activity, label: 'กิจกรรมทั่วไป' };
        if (details.includes('Order') || details.includes('ออเดอร์') || details.includes('ชำระเงิน')) {
            config = { color: 'text-[#2D241E]', bg: 'bg-white', border: 'border-slate-200', Icon: Package, label: 'คำสั่งซื้อ' };
        } else if (details.includes('ลบ')) {
            config = { color: 'text-red-500', bg: 'bg-white', border: 'border-red-100', Icon: ShieldAlert, label: 'การลบข้อมูล' };
        } else if (details.includes('แก้ไข') || details.includes('เปลี่ยน')) {
            config = { color: 'text-[#D97706]', bg: 'bg-white', border: 'border-amber-100', Icon: ArrowRightLeft, label: 'การอัปเดต' };
        } else if (details.includes('เพิ่ม') || details.includes('สร้าง')) {
            config = { color: 'text-emerald-600', bg: 'bg-white', border: 'border-emerald-100', Icon: PlusCircle, label: 'การสร้างใหม่' };
        } else if (details.includes('เข้าสู่ระบบ')) {
            config = { color: 'text-blue-600', bg: 'bg-white', border: 'border-blue-100', Icon: ShieldCheck, label: 'ระบบความปลอดภัย' };
        }
        return config;
    };

    // --- 🔍 Filtering & Pagination Logic ---
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

    // คำนวณข้อมูลสำหรับแสดงในหน้าปัจจุบัน
    const currentLogs = useMemo(() => {
        const lastIndex = currentPage * logsPerPage;
        const firstIndex = lastIndex - logsPerPage;
        return filteredLogs.slice(firstIndex, lastIndex);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    // รีเซ็ตหน้ากลับไปหน้า 1 เมื่อมีการค้นหาหรือกรอง
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

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
                <Cookie className="absolute bottom-[20%] right-[10%] -rotate-12 opacity-[0.02] text-[#2D241E]" size={150} />
                <Smile className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.01] text-[#2D241E]" size={400} />
            </div>

            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="system_log" />

            <main className={`flex-1 p-4 md:p-10 lg:p-14 transition-all duration-500 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} w-full relative z-10 text-left`}>
                
                <div className="mb-12 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-2xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-95 transition-all"><Menu size={24} /></button>
                    <Header title="ประวัติกิจกรรมระบบ" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 px-2">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 mb-2 animate-bounce-slow">
                            <Sparkles size={14} className="text-[#D97706]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B7E66]">เส้นทางตรวจสอบผู้ดูแลระบบ</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">
                            Audit<span className="opacity-10">Logs.</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="hidden md:flex flex-col items-end px-6 border-r border-slate-100">
                            <span className="text-[10px] font-black text-[#C2B8A3] uppercase tracking-widest">ประวัติทั้งหมด</span>
                            <span className="text-sm font-bold text-[#2D241E]">{filteredLogs.length} รายการ</span>
                        </div>
                        <button onClick={fetchLogs} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-90 group">
                            <RefreshCw size={24} className={`text-[#2D241E]/40 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-12 rounded-[3rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <Smile className="absolute -bottom-10 -right-10 opacity-[0.01] text-[#2D241E]" size={200} />
                    
                    {/* Toolbar */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-14 relative z-10">
                        <div className="flex flex-wrap gap-2 p-1 bg-slate-50/50 rounded-full border border-slate-100 w-fit">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'create', label: 'สร้าง/เพิ่ม' },
                                { id: 'update', label: 'แก้ไข' },
                                { id: 'delete', label: 'ลบข้อมูล' },
                                { id: 'auth', label: 'ความปลอดภัย' }
                            ].map((f) => (
                                <button 
                                    key={f.id} 
                                    onClick={() => setActiveFilter(f.id)}
                                    className={`px-4 py-2 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${activeFilter === f.id ? 'bg-[#2D241E] text-white shadow-md' : 'text-[#2D241E] hover:text-[#2D241E]'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:max-w-2xl">
                            <div className="relative flex-1 group">
                                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2D241E]/20 transition-colors" />
                                <input 
                                    className="w-full pl-16 pr-8 py-4 rounded-full bg-slate-50/50 border border-transparent focus:bg-white focus:border-slate-200 outline-none font-bold text-lg transition-all shadow-inner placeholder:text-[#2D241E]/20" 
                                    placeholder="ค้นหาชื่อผู้ดูแล หรือ กิจกรรม..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            {isSuperAdmin && (
                                <button onClick={handleClearAll} className="px-8 py-4 bg-white text-red-500 border border-red-50 rounded-full font-black flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all uppercase text-[10px] tracking-widest shadow-sm active:scale-95">
                                    <Trash2 size={18} /> ล้างข้อมูล
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto relative z-10 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
                            <thead>
                                <tr className="text-[#C2B8A3] uppercase text-[15px] font-black tracking-[0.2em] px-8">
                                    <th className="px-10 pb-2">วันและเวลา</th>
                                    <th className="px-10 pb-2">ผู้ดำเนินการ</th>
                                    <th className="px-10 pb-2">รายละเอียดกิจกรรม</th>
                                    <th className="px-10 pb-2 text-right">ผลลัพธ์</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-0">
                                {currentLogs.length > 0 ? currentLogs.map((log) => {
                                    const style = getActionStyle(log.action_details || "");
                                    return (
                                        <tr key={log.log_id} className="group/row hover:translate-x-1 transition-all">
                                            <td className="px-10 py-7 rounded-l-[2.5rem] md:rounded-l-[3rem] bg-white border-y border-l border-slate-50 group-hover/row:bg-slate-50/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white text-[#2D241E]/20 rounded-2xl shadow-sm border border-slate-100 group-hover/row:text-[#2D241E] transition-colors">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-sm font-black text-[#2D241E]">
                                                            {new Date(log.created_at).toLocaleDateString('th-TH', { 
                                                                day: '2-digit', month: 'short', year: 'numeric' 
                                                            })}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-[#8B7E66] uppercase tracking-widest flex items-center gap-1 opacity-60">
                                                            <Clock size={10} />
                                                            {new Date(log.created_at).toLocaleTimeString('th-TH', { 
                                                                hour: '2-digit', minute: '2-digit'
                                                            })} น.
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 bg-white border-y border-slate-50 group-hover/row:bg-slate-50/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white text-[#2D241E] flex items-center justify-center font-black text-sm border border-slate-100 shadow-sm overflow-hidden group-hover/row:scale-110 transition-transform">
                                                        {log.user?.first_name?.charAt(0) || <User size={16}/>}
                                                    </div>
                                                    <span className="font-black text-[#2D241E] text-base tracking-tighter uppercase italic">{log.user?.first_name} {log.user?.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 bg-white border-y border-slate-50 group-hover/row:bg-slate-50/50">
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.color} ${style.border} shrink-0 shadow-sm`}>
                                                        <style.Icon size={12} strokeWidth={3} />
                                                        {style.label}
                                                    </div>
                                                    <span className="font-bold text-[#2D241E]/70 text-sm italic group-hover/row:text-[#2D241E] line-clamp-1">{log.action_details}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 rounded-r-[2.5rem] md:rounded-r-[3rem] bg-white border-y border-r border-slate-50 group-hover/row:bg-slate-50/50 text-right">
                                                <div className="w-10 h-10 bg-white rounded-full inline-flex items-center justify-center shadow-sm border border-slate-100 text-[#2D241E]/20 group-hover/row:text-[#2D241E] transition-all">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-40 bg-white">
                                            <p className="text-2xl font-black uppercase tracking-tighter text-[#2D241E]/20 italic">ไม่พบข้อมูลประวัติ</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✨ Pagination Controls (Only White Style) */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-4 relative z-10 pb-4">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-3 bg-white border border-slate-100 rounded-2xl text-[#2D241E] disabled:opacity-20 hover:shadow-lg transition-all active:scale-90"
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
                                            className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === pageNum ? 'bg-[#2D241E] text-white shadow-xl scale-110' : 'text-[#C2B8A3] hover:text-[#2D241E]'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-3 bg-white border border-slate-100 rounded-2xl text-[#2D241E] disabled:opacity-20 hover:shadow-lg transition-all active:scale-90"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default SystemLog;