import React, { useEffect, useState, useCallback } from 'react';
import { 
    Activity, Search, Clock, User, ShieldAlert, 
    Loader2, Trash2, Calendar, ArrowRightLeft, ShieldCheck, 
    PlusCircle, Package, RefreshCw, Menu
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const token = localStorage.getItem('token');
    const decoded = token ? jwtDecode(token) : {};
    const isOwner = decoded.role_level === 1;

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SYSTEM_LOG);
            if (res.success) setLogs(res.data || []);
        } catch (err) {
            toast.error("ไม่สามารถโหลดประวัติกิจกรรมได้");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการล้างประวัติ?',
            text: "ข้อมูลกิจกรรมจะถูกลบถาวร ไม่สามารถกู้คืนได้!",
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
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.SYSTEM_LOG}/clear`);
            if (res.success) {
                toast.success("ล้างประวัติเรียบร้อยแล้ว", { id: loadToast });
                fetchLogs(); 
            }
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการล้างข้อมูล", { id: loadToast });
        }
    };

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const filteredLogs = logs.filter(log => {
        const search = searchTerm.toLowerCase();
        const adminName = `${log.user?.first_name} ${log.user?.last_name}`.toLowerCase();
        const details = (log.action_details || "").toLowerCase();
        return details.includes(search) || adminName.includes(search);
    });

    const getActionStyle = (details) => {
        let color = '#64748b'; 
        let Icon = Activity;

        if (details.includes('Order') || details.includes('ออเดอร์') || details.includes('Verified') || details.includes('ชำระเงิน')) {
            color = '#6366f1'; Icon = Package;
        } else if (details.includes('ลบ') || details.includes('Wiped')) {
            color = '#ef4444'; Icon = ShieldAlert;
        } else if (details.includes('แก้ไข') || details.includes('เปลี่ยน') || details.includes('สถานะ')) {
            color = '#f59e0b'; Icon = ArrowRightLeft;
        } else if (details.includes('เพิ่ม') || details.includes('สร้าง')) {
            color = '#10b981'; Icon = PlusCircle;
        } else if (details.includes('เข้าสู่ระบบ')) {
            color = '#4318ff'; Icon = ShieldCheck;
        }

        return {
            className: `flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold border whitespace-normal leading-tight`,
            style: { backgroundColor: `${color}05`, color: color, borderColor: `${color}15` },
            Icon
        };
    };

    if (loading && logs.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-900" size={65} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-slate-900 overflow-x-hidden">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="system_log" />

            <main className={`flex-1 p-4 md:p-8 lg:p-10 transition-all duration-300 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[300px]'} w-full`}>
                
                {/* Mobile Header Menu Toggle */}
                <div className="mb-6 md:mb-10 flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-600"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex-1">
                        <Header title="System Activity" />
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                    <div className="flex-1">
                        <p className="text-sm md:text-lg font-bold text-slate-400 mb-1 uppercase tracking-widest">Audit Trail</p>
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">System Logs</h1>
                    </div>
                    <button onClick={fetchLogs} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm hover:border-slate-900 transition-all group">
                        <RefreshCw size={24} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                {/* Table Card (Pure White) */}
                <div className="bg-white p-5 md:p-8 lg:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50/50">
                    
                    {/* Action Bar: Search & Clear Button */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900">📑 บันทึกประวัติ</h3>
                            <p className="text-slate-400 font-bold text-xs md:text-sm">ตรวจสอบความเคลื่อนไหวของแอดมินทุกคน</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:max-w-2xl">
                            <div className="relative flex-1">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all" 
                                    placeholder="ค้นหาแอดมิน, กิจกรรม..." 
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

                    {/* Table with Horizontal Scroll Support */}
                    <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[800px]">
                            <thead>
                                <tr className="text-slate-400 uppercase text-[10px] md:text-xs font-black tracking-widest">
                                    <th className="px-6 pb-4">วัน-เวลา</th>
                                    <th className="px-6 pb-4">ผู้ดำเนินการ</th>
                                    <th className="px-6 pb-4">รายละเอียดกิจกรรม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                                    const { className, style, Icon } = getActionStyle(log.action_details || "");
                                    return (
                                        <tr key={log.log_id} className="group hover:bg-slate-50 transition-all">
                                            <td className="px-6 py-6 rounded-l-2xl md:rounded-l-3xl border-y border-l border-slate-50 group-hover:border-slate-100 whitespace-nowrap">
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
                                            <td className="px-6 py-6 border-y border-slate-50 group-hover:border-slate-100 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="font-black text-base md:text-lg text-slate-900 truncate max-w-[150px]">
                                                        {log.user?.first_name} {log.user?.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 rounded-r-2xl md:rounded-r-3xl border-y border-r border-slate-50 group-hover:border-slate-100">
                                                <div className={className} style={style}>
                                                    <Icon size={16} className="shrink-0" />
                                                    {log.action_details}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-20 md:py-32">
                                            <Activity size={48} className="mx-auto text-slate-100 mb-4" />
                                            <p className="text-slate-300 font-bold italic text-lg">ไม่พบข้อมูลประวัติกิจกรรม</p>
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

export default SystemLog;