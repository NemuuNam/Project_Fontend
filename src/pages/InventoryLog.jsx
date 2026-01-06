import React, { useEffect, useState, useCallback } from 'react';
import { 
    ClipboardList, Search, ArrowUpCircle, ArrowDownCircle, 
    Package, Loader2, User, Clock, Trash2, Calendar, RefreshCw, Menu
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const token = localStorage.getItem('token');
    const decoded = token ? jwtDecode(token) : {};
    const isOwner = decoded.role_level === 1;

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.INVENTORY_LOG);
            if (res.success) setLogs(res.data || []);
        } catch (err) {
            toast.error("ไม่สามารถโหลดข้อมูลประวัติได้");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการล้างประวัติสต็อก?',
            text: "ข้อมูลกิจกรรมจะหายไปถาวร ไม่สามารถกู้คืนได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e293b',
            confirmButtonText: 'ล้างข้อมูลทั้งหมด',
            cancelButtonText: 'ยกเลิก',
            borderRadius: '25px'
        });

        if (!result.isConfirmed) return;

        const loadToast = toast.loading("กำลังล้างข้อมูล...");
        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.INVENTORY_LOG}/clear`);
            if (res.success) {
                toast.success("ล้างประวัติเรียบร้อยแล้ว", { id: loadToast });
                fetchLogs(); 
            }
        } catch (err) {
            toast.error("ไม่สามารถล้างข้อมูลได้", { id: loadToast });
        }
    };

    const filteredLogs = logs.filter(log => 
        log.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && logs.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-white text-slate-900">
            <Loader2 className="animate-spin" size={65} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-slate-900 overflow-x-hidden">
            <Toaster position="top-right" />
            
            <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                isMobileOpen={isSidebarOpen} 
                setIsMobileOpen={setIsSidebarOpen} 
                activePage="invlog" 
            />

            <main className={`flex-1 p-4 md:p-8 lg:p-10 transition-all duration-300 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[300px]'} w-full`}>
                
                {/* Mobile Menu Toggle & Header */}
                <div className="mb-6 md:mb-10 flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-600"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex-1">
                        <Header title="Inventory Tracking" />
                    </div>
                </div>

                {/* Welcome & Refresh Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                    <div className="flex-1">
                        <p className="text-sm md:text-lg font-bold text-slate-400 mb-1 uppercase tracking-widest">INVENTORY REPORT</p>
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">
                            Inventory Logs
                        </h1>
                    </div>
                    <button 
                        onClick={fetchLogs} 
                        className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm hover:border-slate-900 transition-all group"
                    >
                        <RefreshCw size={24} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                {/* Table Card (Pure White Theme) */}
                <div className="bg-white p-5 md:p-8 lg:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50/50">
                    
                    {/* Action Bar */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                            <ClipboardList className="text-emerald-500 w-6 h-6 md:w-8 md:h-8" /> บันทึกประวัติสต็อก
                        </h3>
                        
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:max-w-3xl">
                            <div className="relative flex-1">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all" 
                                    placeholder="ค้นหาชื่อสินค้า หรือเหตุผล..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            {isOwner && (
                                <button onClick={handleClearAll} className="px-6 py-4 bg-white border-2 border-rose-100 text-rose-500 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-50 transition-all uppercase text-[10px] md:text-xs tracking-widest whitespace-nowrap">
                                    <Trash2 size={18} /> ล้างประวัติ
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Responsive Table Scroll */}
                    <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
                            <thead>
                                <tr className="text-slate-400 uppercase text-[10px] md:text-xs font-black tracking-widest">
                                    <th className="px-4 md:px-6 pb-4">วัน-เวลา</th>
                                    <th className="px-4 md:px-6 pb-4">สินค้า</th>
                                    <th className="px-4 md:px-6 pb-4 text-center">จำนวนที่เปลี่ยน</th>
                                    <th className="px-4 md:px-6 pb-4">ผู้ทำรายการ</th>
                                    <th className="px-4 md:px-6 pb-4">เหตุผล</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                    <tr key={log.inv_log_id} className="group hover:bg-slate-50 transition-all">
                                        <td className="px-4 md:px-6 py-6 rounded-l-2xl md:rounded-l-3xl border-y border-l border-slate-50 group-hover:border-slate-100 whitespace-nowrap">
                                            <div className="flex items-center gap-3 text-slate-400 font-bold">
                                                <Calendar size={16} />
                                                <span className="text-sm md:text-md">
                                                    {new Date(log.created_at).toLocaleString('th-TH', { 
                                                        day: '2-digit', month: 'short', year: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-6 border-y border-slate-50 group-hover:border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                                                    <Package size={18} />
                                                </div>
                                                <span className="font-black text-base md:text-lg text-slate-900 truncate max-w-[150px] md:max-w-[250px]">
                                                    {log.product?.product_name || 'สินค้าถูกลบ'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-6 border-y border-slate-50 group-hover:border-slate-100 text-center">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-black border ${
                                                log.change_qty > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                log.change_qty < 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                                {log.change_qty > 0 ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                                                {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-6 border-y border-slate-50 group-hover:border-slate-100 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-bold text-slate-600 text-sm md:text-md">
                                                    {log.user?.first_name} {log.user?.last_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-6 rounded-r-2xl md:rounded-r-3xl border-y border-r border-slate-50 group-hover:border-slate-100 font-medium text-slate-400 text-sm md:text-md">
                                            {log.reason || 'ไม่มีการระบุ'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20 md:py-32">
                                            <Package size={48} className="mx-auto text-slate-100 mb-4" />
                                            <p className="text-slate-300 font-bold italic text-lg">ไม่พบข้อมูลความเคลื่อนไหว</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InventoryLog;