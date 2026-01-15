import React, { useEffect, useState, useCallback } from 'react';
import { 
    LayoutDashboard, ShoppingCart, Package, Users, 
    LogOut, FileText, ClipboardList, BarChart3,
    ChevronLeft, ChevronRight, Settings, X, Sparkles,
    Leaf, Cookie, Smile
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, activePage }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [shopName, setShopName] = useState('SOOO GUICHAI');

    const fetchShopName = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
            if (res.success && res.data.shop_name) {
                setShopName(res.data.shop_name !== "EMPTY" ? res.data.shop_name : 'SOOO GUICHAI');
            }
        } catch (error) { console.error("Error fetching shop name:", error); }
    }, []);

    useEffect(() => { fetchShopName(); }, [fetchShopName]);

    let userLevel = 0;
    try {
        if (token) {
            const decoded = jwtDecode(token);
            userLevel = Number(decoded.role_level) || 0; 
        }
    } catch (error) { console.error("Invalid Token"); }

    const handleLogout = () => {
        Swal.fire({
            title: 'ยืนยันการออกจากระบบ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ออกจากระบบ',
            cancelButtonText: 'ยกเลิก',
            background: '#fff',
            color: '#2D241E',
            customClass: { 
                popup: 'rounded-[2rem] shadow-xl border-2 border-slate-100 font-["Kanit"]',
                confirmButton: 'rounded-full px-8 py-3 text-sm font-black uppercase italic',
                cancelButton: 'rounded-full px-8 py-3 text-sm text-[#2D241E] font-bold border border-slate-100'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = '/login';
            }
        });
    };

    const navItems = [
        { id: 'dashboard', label: 'แผงควบคุมหลัก', icon: <LayoutDashboard size={20}/>, path: '/admin/dashboard', allowedRoles: [1, 2, 3] },
        { id: 'orders', label: 'จัดการคำสั่งซื้อ', icon: <ShoppingCart size={20}/>, path: '/admin/orders', allowedRoles: [1, 3] },
        { id: 'products', label: 'คลังสินค้า', icon: <Package size={20}/>, path: '/admin/products', allowedRoles: [1, 3] },
        { id: 'users', label: 'ข้อมูลผู้ใช้งาน', icon: <Users size={20}/>, path: '/admin/users', allowedRoles: [1] },
        { id: 'system_log', label: 'ประวัติการทำงาน', icon: <FileText size={20}/>, path: '/admin/system-log', allowedRoles: [1] },
        { id: 'invlog', label: 'รายงานสต็อก', icon: <ClipboardList size={20}/>, path: '/admin/inv-log', allowedRoles: [1, 2] },
        { id: 'reports', label: 'สถิติยอดขาย', icon: <BarChart3 size={20}/>, path: '/admin/reports', allowedRoles: [1, 2] },
        { id: 'shop-setting', label: 'ตั้งค่าร้านค้า', icon: <Settings size={20}/>, path: '/admin/shop-setting', allowedRoles: [1, 3] },
    ];

    const visibleNavItems = navItems.filter(item => item.allowedRoles.includes(userLevel));

    return (
        <>
            {isMobileOpen && (
                <div className="fixed inset-0 bg-[#2D241E]/20 backdrop-blur-md z-[999] lg:hidden transition-all" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                <style>{`
                    .sidebar-container {
                        width: 280px; height: 100vh; background: #fff; border-right: 4px solid #2D241E;
                        display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 1000;
                        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Kanit', sans-serif;
                    }
                    .sidebar-container.collapsed { width: 100px; }

                    @media (max-width: 1023px) { 
                        .sidebar-container { transform: translateX(-100%); width: 280px !important; }
                        .sidebar-container.mobile-open { transform: translateX(0); box-shadow: 10px 0 40px rgba(0,0,0,0.1); }
                    }

                    /* ✨ ปรับปรุงปุ่ม Toggle ให้เป็นวงกลมและอยู่บนขอบ */
                    .toggle-handle { 
                        position: absolute; 
                        right: -14px; /* วางกึ่งกลางบนเส้นขอบพอดี */
                        top: 40px; 
                        width: 28px; height: 28px; 
                        background: #2D241E; color: #fff; 
                        border-radius: 50%; /* วงกลม */
                        border: 2px solid #fff; /* เส้นขอบขาวให้ลอยเด่น */
                        display: flex; align-items: center; justify-content: center; 
                        cursor: pointer; z-index: 50; 
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    }
                    .toggle-handle:hover { transform: scale(1.1); background: #000; }
                    
                    .brand-section { padding: 32px 24px; display: flex; align-items: center; gap: 14px; cursor: pointer; position: relative; z-index: 10; }
                    .logo-box { 
                        min-width: 44px; min-height: 44px; background: #2D241E; border-radius: 12px; 
                        display: flex; align-items: center; justify-content: center; color: #fff;
                        box-shadow: 0 4px 12px rgba(45, 36, 30, 0.15);
                    }
                    
                    .brand-name { font-size: 18px; font-weight: 900; color: #2D241E; text-transform: uppercase; letter-spacing: -0.5px; white-space: nowrap; transition: 0.3s; font-style: italic; }
                    .collapsed .brand-name { opacity: 0; width: 0; overflow: hidden; }

                    .nav-body { flex: 1; padding: 0 16px; overflow-y: auto; scrollbar-width: none; }
                    .nav-body::-webkit-scrollbar { display: none; }
                    
                    .nav-category { font-size: 10px; text-transform: uppercase; color: #2D241E; font-weight: 900; margin: 20px 0 10px 12px; letter-spacing: 2px; opacity: 0.4; }
                    .collapsed .nav-category { opacity: 0; }

                    .nav-item { 
                        display: flex; align-items: center; gap: 16px; padding: 14px 18px; margin-bottom: 6px; 
                        border-radius: 16px; color: #2D241E; font-weight: 700; transition: all 0.3s ease; 
                        cursor: pointer; position: relative;
                    }
                    .nav-item .label { font-size: 14px; text-transform: uppercase; }
                    
                    .nav-item:hover { background: #f8f8f8; }
                    .nav-item.active { background: #2D241E; color: #fff; box-shadow: 0 8px 20px rgba(45, 36, 30, 0.1); }
                    .nav-item.active .label { font-weight: 900; font-style: italic; }

                    .collapsed .label { display: none; }
                    .collapsed .nav-item { justify-content: center; padding: 14px 0; width: 60px; margin: 0 auto 8px; }

                    .footer-section { padding: 24px 16px; border-top: 1px solid #f0f0f0; background: #fff; }
                    .btn-signout { 
                        width: 100%; display: flex; align-items: center; gap: 10px; padding: 14px; 
                        background: #fff; color: #ef4444; border: 2px solid #fee2e2; border-radius: 16px; 
                        font-weight: 800; cursor: pointer; transition: 0.3s; justify-content: center;
                        font-size: 13px; text-transform: uppercase; font-style: italic;
                    }
                    .btn-signout:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
                    .collapsed .btn-signout { padding: 14px 0; border: none; }
                    .collapsed .logout-text { display: none; }

                    .gimmick-pattern { position: absolute; pointer-events: none; opacity: 0.02; z-index: 0; color: #2D241E; }
                `}</style>

                {/* ✅ ปุ่ม Toggle ใหม่: สวยงามและไม่ทับซ้อนเนื้อหา */}
                {!isMobileOpen && (
                    <button className="hidden lg:flex toggle-handle" onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
                    </button>
                )}

                <button 
                    className="lg:hidden absolute right-4 top-6 w-10 h-10 bg-[#2D241E] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all z-[1100]" 
                    onClick={() => setIsMobileOpen(false)}
                >
                    <X size={24} strokeWidth={3} />
                </button>

                <div className="brand-section" onClick={() => navigate('/admin/dashboard')}>
                    <div className="logo-box">
                        <Sparkles size={22} strokeWidth={2.5} />
                    </div>
                    <span className="brand-name">{shopName}</span>
                </div>
                
                <div className="nav-body relative">
                    <Leaf className="gimmick-pattern top-5 right-2 rotate-12" size={80} />
                    <Smile className="gimmick-pattern bottom-10 left-2" size={90} />
                    
                    {!isCollapsed && <p className="nav-category relative z-10">Management</p>}
                    
                    <div className="relative z-10">
                        {visibleNavItems.map((item) => (
                            <div 
                                key={item.id} 
                                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                                onClick={() => { 
                                    navigate(item.path); 
                                    if (window.innerWidth < 1024) setIsMobileOpen(false); 
                                }}
                            >
                                <div className="icon-box">
                                    {React.cloneElement(item.icon, { strokeWidth: activePage === item.id ? 3 : 2.5 })}
                                </div>
                                <span className="label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="footer-section">
                    <button onClick={handleLogout} className="btn-signout active:scale-95">
                        <LogOut size={18} strokeWidth={3}/> 
                        <span className="logout-text">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;