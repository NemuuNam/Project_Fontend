import React, { useEffect, useState, useCallback } from 'react';
import { 
    Activity, Search, Clock, User, ShieldAlert, 
    Loader2, Trash2, Calendar, ArrowRightLeft, ShieldCheck, 
    PlusCircle, Package, ShoppingCart
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode'; 
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// --- นำเข้า Config และ Instance ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const SystemLog = () => {
    // --- States ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const token = localStorage.getItem('token');

    // --- เช็คสิทธิ์ Owner (Level 1) ---
    const decoded = token ? jwtDecode(token) : {};
    const isOwner = decoded.role_level === 1;

    // --- 1. ดึงข้อมูลบันทึกกิจกรรม ---
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.SYSTEM_LOG);
            if (res.success) {
                setLogs(res.data);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
            toast.error("ไม่สามารถโหลดประวัติกิจกรรมได้");
        } finally {
            setLoading(false);
        }
    }, []);

    // --- 2. ฟังก์ชันล้างประวัติ ---
    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการล้างประวัติ?',
            text: "ข้อมูลกิจกรรมทั้งหมดจะถูกลบถาวรและไม่สามารถกู้คืนได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonColor: '#4318ff',
            confirmButtonText: 'ล้างข้อมูลทั้งหมด',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { popup: 'premium-popup' }
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

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // --- 3. ระบบกรองข้อมูล (รองรับการหา Order ID) ---
    const filteredLogs = logs.filter(log => {
        const search = searchTerm.toLowerCase();
        const adminName = `${log.user?.first_name} ${log.user?.last_name}`.toLowerCase();
        const details = (log.action_details || "").toLowerCase();
        return details.includes(search) || adminName.includes(search);
    });

    // --- 4. จัดรูปแบบสีและไอคอน Badge (เพิ่มเคสออเดอร์) ---
    const getActionStyle = (details) => {
        let color = '#64748b'; 
        let Icon = Activity;

        // เช็คกิจกรรมเกี่ยวกับออเดอร์และการเงิน
        if (details.includes('Order') || details.includes('ออเดอร์') || details.includes('Verified') || details.includes('ชำระเงิน')) {
            color = '#6366f1'; // Indigo สำหรับออเดอร์
            Icon = Package;
        } else if (details.includes('ลบ') || details.includes('Wiped')) {
            color = '#ef4444'; // แดงสำหรับลบ
            Icon = ShieldAlert;
        } else if (details.includes('แก้ไข') || details.includes('เปลี่ยน') || details.includes('➔') || details.includes('Status')) {
            color = '#f59e0b'; // ส้มสำหรับแก้ไข
            Icon = ArrowRightLeft;
        } else if (details.includes('เพิ่ม') || details.includes('สร้าง')) {
            color = '#10b981'; // เขียวสำหรับเพิ่มใหม่
            Icon = PlusCircle;
        } else if (details.includes('เข้าสู่ระบบ')) {
            color = '#4318ff'; // น้ำเงินสำหรับระบบ
            Icon = ShieldCheck;
        }

        return {
            style: {
                backgroundColor: `${color}10`,
                color: color,
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: `1px solid ${color}20`,
                lineHeight: '1.4'
            },
            Icon
        };
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f7fe' }}>
            <Loader2 className="animate-spin" color="#4318ff" size={45} />
        </div>
    );

    return (
        <div className="log-page-wrapper">
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                .log-page-wrapper { display: flex; min-height: 100vh; background-color: #f4f7fe; font-family: 'Kanit', sans-serif; color: #1b2559; }
                .main-panel { flex: 1; margin-left: ${isCollapsed ? '80px' : '260px'}; padding: 30px; transition: all 0.3s ease; width: 100%; box-sizing: border-box; }
                @media (max-width: 1024px) { .main-panel { margin-left: 0 !important; padding: 20px; } }
                .log-card { background: #fff; border-radius: 35px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
                .search-input { width: 100%; padding: 14px 20px 14px 52px; border-radius: 18px; border: 1.5px solid #eef2f6; background: #fcfdfe; outline: none; transition: 0.3s; font-size: 14px; }
                .search-input:focus { border-color: #4318ff; box-shadow: 0 10px 20px rgba(67, 24, 255, 0.05); }
                .log-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 850px; }
                .log-table th { text-align: left; padding: 12px 20px; color: #a3aed0; font-size: 12px; font-weight: 700; text-transform: uppercase; }
                .log-table td { padding: 18px 20px; background: #fff; border-top: 1px solid #f8fafc; border-bottom: 1px solid #f8fafc; font-size: 14px; }
                .log-table tr td:first-child { border-left: 1px solid #f8fafc; border-radius: 18px 0 0 18px; }
                .log-table tr td:last-child { border-right: 1px solid #f8fafc; border-radius: 0 18px 18px 0; }
                .admin-pill { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #1b2559; }
            `}</style>

            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} activePage="system_log" />

            <main className="main-panel">
                <Header title="บันทึกกิจกรรมระบบ" />

                <section className="log-card">
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <div>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>ประวัติกิจกรรมแอดมิน</h3>
                            <p style={{ color: '#a3aed0', fontSize: '13px', marginTop: '4px' }}>ติดตามการเปลี่ยนแปลงออเดอร์และระบบหลังบ้าน</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', flexGrow: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {isOwner && (
                                <button onClick={handleClearAll} className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-500 rounded-2xl font-bold border-none cursor-pointer hover:bg-red-100 transition-all text-sm">
                                    <Trash2 size={18} /> ล้างประวัติ
                                </button>
                            )}
                            <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#a3aed0' }} />
                                <input 
                                    className="search-input" 
                                    placeholder="ค้นหาชื่อแอดมิน, กิจกรรม หรือ Order ID..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="log-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '200px' }}>วัน-เวลา</th>
                                    <th style={{ width: '250px' }}>ผู้ดำเนินการ</th>
                                    <th>รายละเอียดกิจกรรม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                                    const { style, Icon } = getActionStyle(log.action_details || "");
                                    return (
                                        <tr key={log.log_id}>
                                            <td>
                                                <div style={{ color: '#a3aed0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                                                    <Calendar size={14} />
                                                    {new Date(log.created_at).toLocaleString('th-TH', { 
                                                        day: '2-digit', month: 'short', year: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="admin-pill">
                                                    <div style={{ padding: '8px', background: '#4318ff10', borderRadius: '12px' }}>
                                                        <User size={16} color="#4318ff" />
                                                    </div>
                                                    {log.user?.first_name} {log.user?.last_name}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={style}>
                                                    <Icon size={14} />
                                                    {log.action_details}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '80px 0', color: '#a3aed0' }}>
                                            <Activity size={40} style={{ marginBottom: '12px', opacity: 0.2, margin: '0 auto' }} />
                                            <p>ไม่พบข้อมูลประวัติกิจกรรม</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SystemLog;