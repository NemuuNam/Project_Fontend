import React, { useState, useEffect, useCallback } from 'react';
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
    const [shopName, setShopName] = useState('THE BAKERY');

    // --- 🔄 Logic (คงเดิม 100%) ---
    const fetchShopName = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
            if (res.success && res.data.shop_name) {
                setShopName(res.data.shop_name !== "EMPTY" ? res.data.shop_name : 'THE BAKERY');
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
            text: "คุณต้องการลงชื่อออกจากการเป็นผู้ดูแลหรือไม่",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ออกจากระบบ',
            cancelButtonText: 'ยกเลิก',
            background: '#fff',
            color: '#2D241E',
            customClass: { 
                popup: 'rounded-[3rem] shadow-xl border border-slate-50 font-["Kanit"]',
                confirmButton: 'rounded-full px-10 py-4 text-lg',
                cancelButton: 'rounded-full px-10 py-4 text-lg text-[#2D241E] border border-slate-100'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = '/login';
            }
        });
    };

    const navItems = [
        { id: 'dashboard', label: 'แผงควบคุมหลัก', icon: <LayoutDashboard size={24}/>, path: '/admin/dashboard', allowedRoles: [1, 2, 3] },
        { id: 'orders', label: 'จัดการคำสั่งซื้อ', icon: <ShoppingCart size={24}/>, path: '/admin/orders', allowedRoles: [1, 3] },
        { id: 'products', label: 'คลังสินค้า', icon: <Package size={24}/>, path: '/admin/products', allowedRoles: [1, 3] },
        { id: 'users', label: 'ข้อมูลผู้ใช้งาน', icon: <Users size={24}/>, path: '/admin/users', allowedRoles: [1] },
        { id: 'system_log', label: 'ประวัติการทำงาน', icon: <FileText size={24}/>, path: '/admin/system-log', allowedRoles: [1] },
        { id: 'invlog', label: 'รายงานสต็อก', icon: <ClipboardList size={24}/>, path: '/admin/inv-log', allowedRoles: [1, 2] },
        { id: 'reports', label: 'สถิติยอดขาย', icon: <BarChart3 size={24}/>, path: '/admin/reports', allowedRoles: [1, 2] },
        { id: 'shop-setting', label: 'ตั้งค่าร้านค้า', icon: <Settings size={24}/>, path: '/admin/shop-setting', allowedRoles: [1, 3] },
    ];

    const visibleNavItems = navItems.filter(item => item.allowedRoles.includes(userLevel));

    return (
        <>
            {/* Backdrop สำหรับ Mobile */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-[#2D241E]/15 backdrop-blur-md z-[999] lg:hidden transition-all duration-500" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                <style>{`
                    .sidebar-container {
                        width: 300px; height: 100vh; background: #fff; border-right: 1px solid #f0f0f0;
                        display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 1000;
                        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Kanit', sans-serif;
                    }
                    .sidebar-container.collapsed { width: 110px; }

                    @media (max-width: 1023px) { 
                        .sidebar-container { transform: translateX(-100%); width: 300px !important; box-shadow: 20px 0 50px rgba(0, 0, 0, 0.05); }
                        .sidebar-container.mobile-open { transform: translateX(0); }
                    }

                    .toggle-handle { 
                        position: absolute; right: -20px; top: 50px; width: 40px; height: 40px; 
                        background: #fff; border: 1px solid #eee; border-radius: 14px; 
                        display: flex; align-items: center; justify-content: center; cursor: pointer; 
                        box-shadow: 0 4px 15px rgba(0,0,0,0.05); z-index: 20; color: #2D241E;
                        transition: 0.3s;
                    }
                    
                    .brand-section { padding: 45px 30px; display: flex; align-items: center; gap: 18px; cursor: pointer; position: relative; z-index: 10; }
                    .logo-box { 
                        min-width: 50px; min-height: 50px; background: #fff; border-radius: 16px; 
                        display: flex; align-items: center; justify-content: center; color: #2D241E;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.02); border: 1px solid #f0f0f0;
                        transition: 0.5s;
                    }
                    
                    .brand-name { font-size: 20px; font-weight: 900; color: #2D241E; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; transition: 0.3s; opacity: 1; font-style: italic; }
                    .collapsed .brand-name { opacity: 0; pointer-events: none; width: 0; }

                    .nav-body { flex: 1; padding: 0 18px; overflow-y: auto; scrollbar-width: none; position: relative; z-index: 10; }
                    .nav-body::-webkit-scrollbar { display: none; }
                    
                    .nav-category { font-size: 11px; text-transform: uppercase; color: #2D241E; opacity: 0.4; font-weight: 800; margin: 25px 0 15px 20px; letter-spacing: 4px; }
                    .collapsed .nav-category { opacity: 0; }

                    .nav-item { 
                        display: flex; align-items: center; gap: 18px; padding: 18px 22px; margin-bottom: 8px; 
                        border-radius: 22px; color: #2D241E; opacity: 0.5; font-weight: 600; transition: all 0.3s ease; 
                        cursor: pointer; position: relative; border: 1px solid transparent;
                    }
                    .nav-item:hover { opacity: 1; background: #fdfdfd; border-color: #f0f0f0; }
                    .nav-item.active { background: #fff; opacity: 1; border-color: #eee; box-shadow: 0 10px 25px rgba(0,0,0,0.03); }
                    .nav-item.active .label { font-weight: 900; }
                    .nav-item.active::after { 
                        content: ''; position: absolute; left: 0; top: 25%; height: 50%; width: 5px; 
                        background: #2D241E; border-radius: 0 10px 10px 0; 
                    }

                    .collapsed .label { display: none; }
                    .collapsed .nav-item { justify-content: center; padding: 18px 0; width: 70px; margin: 0 auto 10px; }

                    .footer-section { padding: 30px 20px; border-top: 1px solid #f9f9f9; background: #fff; position: relative; z-index: 10; }
                    .btn-signout { 
                        width: 100%; display: flex; align-items: center; gap: 12px; padding: 18px; 
                        background: #fff; color: #ef4444; border: 1px solid #fee2e2; border-radius: 20px; 
                        font-weight: 800; cursor: pointer; transition: 0.3s; justify-content: center;
                        font-size: 13px; text-transform: uppercase; letter-spacing: 1px;
                    }
                    .btn-signout:hover { background: #fef2f2; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(239, 68, 68, 0.05); }
                    .collapsed .btn-signout { padding: 18px 0; border: none; background: transparent; }
                    .collapsed .logout-text { display: none; }

                    .gimmick-pattern {
                        position: absolute; pointer-events: none; opacity: 0.025; z-index: 0; color: #2D241E;
                    }
                    .label { font-size: 15px; }
                `}</style>

                {/* Desktop Toggle Button (ซ่อนบนมือถือ) */}
                {!isMobileOpen && (
                    <button className="hidden lg:flex toggle-handle" onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                )}

                {/* ✨ Mobile Close Button (ปรับปรุงใหม่ให้กดได้แน่นอน) */}
                <button 
                    className="lg:hidden absolute right-6 top-8 w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#2D241E] shadow-lg active:scale-90 transition-all z-[1100]" 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileOpen(false);
                    }}
                >
                    <X size={28} />
                </button>

                {/* Brand Identity */}
                <div className="brand-section" onClick={() => navigate('/admin/dashboard')}>
                    <div className="logo-box">
                        <Sparkles size={26} />
                    </div>
                    <span className="brand-name">{shopName}</span>
                </div>
                
                {/* Navigation Menu */}
                <div className="nav-body">
                    {/* Cozy Gimmicks ลายเส้นจางๆ (Pointer-events: none) */}
                    <Leaf className="gimmick-pattern top-10 right-4 rotate-12" size={90} />
                    <Smile className="gimmick-pattern bottom-20 left-4 -rotate-12" size={110} />
                    <Cookie className="gimmick-pattern top-1/2 right-2 opacity-[0.015]" size={70} />
                    
                    {!isCollapsed && <p className="nav-category relative z-10">เมนูการจัดการ</p>}
                    
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
                                <div className={`icon-box transition-transform duration-300 ${activePage === item.id ? 'scale-110' : ''}`}>
                                    {item.icon}
                                </div>
                                <span className="label uppercase tracking-wide">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Footer Area - Logout */}
                <div className="footer-section">
                    <button onClick={handleLogout} className="btn-signout active:scale-95">
                        <LogOut size={20} strokeWidth={2.5}/> 
                        <span className="logout-text">ออกจากระบบผู้ดูแล</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;