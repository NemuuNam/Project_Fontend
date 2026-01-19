import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    ClipboardList, Search, ArrowUpCircle, ArrowDownCircle,
    Package, Loader2, User, Trash2, Calendar, RefreshCw, Menu, Clock,
    Filter, ChevronRight, ChevronLeft, Activity, Sparkles, X
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
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    const token = localStorage.getItem('token');
    const userRole = token ? jwtDecode(token).role_level : 0;
    const isSuperAdmin = Number(userRole) === 1;

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
            title: 'ล้างประวัติสต็อกทั้งหมด?',
            text: "ข้อมูลกิจกรรมจะถูกลบถาวร! ยืนยันการลบหรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            confirmButtonText: 'ยืนยัน ลบทั้งหมด',
            customClass: { popup: 'rounded-[2.5rem] font-["Kanit"] border border-slate-300' }
        });
        if (!result.isConfirmed) return;
        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.INVENTORY_LOG}/clear`);
            if (res.success) { toast.success("ล้างประวัติเรียบร้อยแล้ว"); fetchLogs(true); }
        } catch (err) { toast.error("ลบข้อมูลไม่สำเร็จ"); }
    };

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

    if (loading && logs.length === 0) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-slate-800" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden relative max-w-full">
            <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="invlog" />

            {/* 🚀 ปรับ Margin Left ตาม Sidebar 280px และลด Padding ขวา */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[280px]'} p-4 md:p-5 lg:p-6 lg:pr-4 w-full relative z-10`}>
                <div className="mb-4 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl text-[#111827] border border-slate-300 shadow-sm"><Menu size={24} /></button>
                    <Header title="ตรวจสอบคลังสินค้า" isCollapsed={isCollapsed} />
                </div>

                {/* 🚀 pt-24 หลบ Header ทึบ */}
                <div className="pt-24">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 px-2">
                        <StatCardSmall title="รายการวันนี้" value={logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length} />
                        <StatCardSmall title="นำเข้าสต็อก" value={logs.filter(l => l.change_qty > 0).length} />
                        <StatCardSmall title="เบิกออกสต็อก" value={logs.filter(l => l.change_qty < 0).length} />
                        <StatCardSmall title="รวมทั้งหมด" value={logs.length} />
                    </div>

                    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex gap-2 p-1 bg-slate-50 rounded-full border border-slate-200">
                                    {[{ id: 'all', label: 'ทั้งหมด' }, { id: 'increase', label: 'นำเข้า' }, { id: 'decrease', label: 'เบิกออก' }].map(tab => (
                                        <button key={tab.id} onClick={() => setFilterType(tab.id)} 
                                            className={`px-4 py-1.5 rounded-full text-base font-medium uppercase transition-all ${filterType === tab.id ? 'bg-[#000000] text-white shadow-sm' : 'text-[#374151] hover:bg-white'}`}>
                                            {tab.label}
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
                                <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border border-slate-200 outline-none text-xl font-medium text-[#000000] focus:bg-white shadow-inner" placeholder="ค้นหาสินค้า หรือ ผู้ดำเนินการ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[#000000] bg-slate-50 uppercase text-xl font-medium tracking-widest border-b border-slate-300">
                                        <th className="px-6 py-4">วันและเวลา</th>
                                        <th className="px-6 py-4">ข้อมูลสินค้า</th>
                                        <th className="px-6 py-4 text-center">จำนวน</th>
                                        <th className="px-6 py-4 text-center">ผู้ดำเนินการ</th>
                                        <th className="px-6 py-4">เหตุผล</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {currentLogs.map(log => (
                                        <tr key={log.inv_log_id} className="hover:bg-slate-50/50 transition-colors">
                                            {/* 📉 py-4 เพื่อความกระชับ */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col text-left leading-none">
                                                    <span className="font-medium text-xl text-[#000000]">{new Date(log.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-base font-medium text-[#374151] italic mt-1">{new Date(log.created_at).toLocaleTimeString('th-TH')} น.</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 border border-slate-300 text-[#000000] rounded-xl flex items-center justify-center font-medium text-lg shadow-sm"><Package size={20} /></div>
                                                    <span className="text-xl font-medium text-[#000000] uppercase truncate max-w-[200px] italic leading-tight">{log.product?.product_name || 'ไม่พบสินค้า'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xl font-medium border whitespace-nowrap shadow-sm ${log.change_qty > 0 ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-white text-red-700 border-red-200'}`}>
                                                    {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 border border-slate-300 text-[#000000] rounded-lg flex items-center justify-center font-medium text-xs uppercase">{log.user?.first_name?.charAt(0)}</div>
                                                    <span className="text-lg font-medium text-[#000000] truncate max-w-[120px]">{log.user?.first_name || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-left">
                                                <span className="text-lg font-medium text-[#374151] italic leading-tight truncate block max-w-[250px]">"{log.reason || 'ปรับปรุงคลังสินค้า'}"</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-6">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === 1 ? 'opacity-30' : ''}`}><ChevronLeft size={28} /></button>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-medium text-[#374151] uppercase">Page</span>
                                    <div className="bg-white border border-[#111827] text-[#111827] px-6 py-1 rounded-lg text-3xl font-medium italic shadow-sm">{currentPage}</div>
                                    <span className="text-xl font-medium text-[#374151]">/ {totalPages}</span>
                                </div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === totalPages ? 'opacity-30' : ''}`}><ChevronRight size={28} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// 💎 StatCard: ปรับระยะ p-6 และขอบบาง 1px เพื่อความมินิมอล
const StatCardSmall = ({ title, value }) => (
    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm flex flex-col gap-1 text-left">
        <p className="text-xl font-medium text-[#374151] uppercase tracking-widest italic leading-none">{title}</p>
        <h2 className="text-5xl font-medium italic tracking-tighter text-[#000000] leading-none mt-1 truncate">{value || 0}</h2>
    </div>
);

export default InventoryLog;