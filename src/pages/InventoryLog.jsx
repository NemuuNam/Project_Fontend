import React, { useEffect, useState, useCallback } from 'react';
import { 
    ClipboardList, Search, ArrowUpCircle, ArrowDownCircle, 
    Package, Loader2, User, Clock, Trash2, Calendar 
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode'; 
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const InventoryLog = () => {
    // --- States ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const token = localStorage.getItem('token');

    // --- เช็คสิทธิ์ Owner (Level 1) ---
    const decoded = token ? jwtDecode(token) : {};
    const isOwner = decoded.role_level === 1;

    // --- 1. ดึงข้อมูลประวัติสต็อก (ใช้ axiosInstance) ---
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.INVENTORY_LOG);
            if (res.success) {
                setLogs(res.data || []);
            }
        } catch (err) {
            console.error("Fetch Logs Error:", err);
            toast.error("ไม่สามารถโหลดข้อมูลประวัติได้");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // --- 2. ฟังก์ชันล้างประวัติ (ใช้ axiosInstance + Swal) ---
    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการล้างประวัติสต็อก?',
            text: "ข้อมูลการบันทึกจะหายไปถาวรและไม่สามารถกู้คืนได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#f4f7fe',
            confirmButtonText: 'ล้างข้อมูลทั้งหมด',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { popup: 'premium-popup' }
        });

        if (!result.isConfirmed) return;

        const loadToast = toast.loading("กำลังล้างข้อมูล...");
        try {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.INVENTORY_LOG}/clear`);
            if (res.success) {
                toast.success("ล้างประวัติสต็อกเรียบร้อยแล้ว", { id: loadToast });
                fetchLogs(); 
            }
        } catch (err) {
            toast.error("ไม่สามารถล้างข้อมูลได้", { id: loadToast });
        }
    };

    // --- 3. ระบบค้นหา ---
    const filteredLogs = logs.filter(log => 
        log.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f7fe' }}>
            <Loader2 className="animate-spin" color="#10b981" size={45} />
        </div>
    );

    return (
        <div className="inv-log-page">
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                .inv-log-page { display: flex; min-height: 100vh; background-color: #f4f7fe; font-family: 'Kanit', sans-serif; color: #1b2559; }
                
                .main-content { 
                    flex: 1; 
                    margin-left: ${isCollapsed ? '80px' : '260px'}; 
                    padding: 30px; 
                    transition: all 0.3s ease; 
                    width: 100%;
                    box-sizing: border-box;
                }

                @media (max-width: 1024px) {
                    .main-content { margin-left: 0 !important; padding: 20px; }
                }

                .content-card { background: #fff; border-radius: 35px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
                
                .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
                
                .search-container { position: relative; width: 100%; max-width: 400px; }
                @media (max-width: 768px) { .search-container { max-width: 100%; order: 2; } }

                .search-input { 
                    width: 100%; padding: 14px 20px 14px 52px; border-radius: 18px; border: 1.5px solid #eef2f6; 
                    background: #fcfdfe; outline: none; transition: 0.3s; font-family: 'Kanit'; font-size: 14px;
                }
                .search-input:focus { border-color: #10b981; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.05); }

                .btn-clear { 
                    display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 15px; 
                    border: none; background: #ef4444; color: #fff; font-weight: 700; cursor: pointer; 
                    transition: 0.2s; font-family: 'Kanit'; font-size: 14px;
                }
                .btn-clear:hover { background: #dc2626; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2); }

                .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 10px; }
                .data-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 850px; }
                .data-table th { text-align: left; padding: 12px 20px; color: #a3aed0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                .data-table td { padding: 18px 20px; background: #fff; border-top: 1px solid #f8fafc; border-bottom: 1px solid #f8fafc; font-size: 14px; }
                
                .data-table tr td:first-child { border-left: 1px solid #f8fafc; border-radius: 18px 0 0 18px; }
                .data-table tr td:last-child { border-right: 1px solid #f8fafc; border-radius: 0 18px 18px 0; }

                .qty-badge { padding: 8px 16px; border-radius: 12px; font-size: 14px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; }
                .qty-up { background: #ecfdf5; color: #10b981; }
                .qty-down { background: #fef2f2; color: #ef4444; }
                .qty-none { background: #f8fafc; color: #94a3b8; }
                
                .product-cell { font-weight: 700; color: #1b2559; display: flex; align-items: center; gap: 10px; }
                .staff-pill { display: flex; align-items: center; gap: 10px; font-weight: 600; color: #1b2559; }
                .premium-popup { border-radius: 30px !important; font-family: 'Kanit', sans-serif !important; }
            `}</style>

            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} activePage="invlog" />

            <main className="main-content">
                <Header title="ความเคลื่อนไหวคลังสินค้า" />

                <section className="content-card">
                    <div className="header-flex">
                        <div>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ClipboardList color="#10b981" size={24} /> ประวัติสต็อกสินค้า
                            </h3>
                            <p style={{ color: '#a3aed0', fontSize: '13px', marginTop: '4px' }}>ตรวจสอบการเพิ่ม-ลดจำนวนสินค้าในระบบ</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', flexGrow: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {isOwner && (
                                <button onClick={handleClearAll} className="btn-clear">
                                    <Trash2 size={18} /> ล้างประวัติ
                                </button>
                            )}
                            <div className="search-container">
                                <Search size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#a3aed0' }} />
                                <input 
                                    className="search-input" 
                                    placeholder="ค้นชื่อสินค้า หรือ เหตุผล..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>วัน-เวลา</th>
                                    <th>สินค้า</th>
                                    <th>จำนวนที่เปลี่ยน</th>
                                    <th>ผู้ทำรายการ</th>
                                    <th>เหตุผล</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                    <tr key={log.inv_log_id}>
                                        <td style={{ width: '180px' }}>
                                            <div style={{ color: '#a3aed0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                                                <Calendar size={14} />
                                                {new Date(log.created_at).toLocaleString('th-TH', { 
                                                    day: '2-digit', month: 'short', year: '2-digit',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="product-cell">
                                                <Package size={16} color="#a3aed0" />
                                                {log.product?.product_name || 'สินค้าถูกลบ'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`qty-badge ${log.change_qty > 0 ? 'qty-up' : log.change_qty < 0 ? 'qty-down' : 'qty-none'}`}>
                                                {log.change_qty > 0 ? <ArrowUpCircle size={16} /> : log.change_qty < 0 ? <ArrowDownCircle size={16} /> : <Clock size={16} />}
                                                {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="staff-pill">
                                                <div style={{ padding: '6px', background: '#f4f7fe', borderRadius: '10px' }}>
                                                    <User size={14} color="#4318ff" />
                                                </div>
                                                {log.user?.first_name} {log.user?.last_name}
                                            </div>
                                        </td>
                                        <td style={{ color: '#8b94a5', maxWidth: '250px' }}>
                                            {log.reason || 'ไม่มีการระบุ'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '80px 0', color: '#a3aed0', background: 'transparent' }}>
                                            <ClipboardList size={40} style={{ marginBottom: '12px', opacity: 0.2, display: 'block', margin: '0 auto' }} />
                                            <p style={{ fontWeight: '500' }}>ไม่พบประวัติความเคลื่อนไหว</p>
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

export default InventoryLog;