import React, { useEffect, useState, useCallback } from 'react';
import { 
    LayoutDashboard, ShoppingCart, Package, Users, 
    LogOut, FileText, ClipboardList, BarChart3,
    ChevronLeft, ChevronRight, Settings, X, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, activePage }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [shopName, setShopName] = useState('COOKIE SHOP');

    const fetchShopName = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
            if (res.success && res.data.shop_name) {
                setShopName(res.data.shop_name !== "EMPTY" ? res.data.shop_name : 'COOKIE SHOP');
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
            confirmButtonColor: '#000000',
            confirmButtonText: 'ออกจากระบบ',
            cancelButtonText: 'ยกเลิก',
            customClass: { 
                popup: 'rounded-[3rem] shadow-2xl border-2 border-slate-300 font-["Kanit"]',
                confirmButton: 'rounded-full px-10 py-3 text-sm font-medium uppercase tracking-widest border-2 border-black bg-black text-white',
                cancelButton: 'rounded-full px-10 py-3 text-sm text-[#374151] font-medium underline'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = '/login';
            }
        });
    };

    const navItems = [
        { id: 'dashboard', label: 'แผงควบคุมหลัก', icon: <LayoutDashboard />, path: '/admin/dashboard', allowedRoles: [1, 2, 3] },
        { id: 'orders', label: 'จัดการคำสั่งซื้อ', icon: <ShoppingCart />, path: '/admin/orders', allowedRoles: [1, 3] },
        { id: 'products', label: 'คลังสินค้า', icon: <Package />, path: '/admin/products', allowedRoles: [1, 3] },
        { id: 'users', label: 'ข้อมูลผู้ใช้งาน', icon: <Users />, path: '/admin/users', allowedRoles: [1] },
        { id: 'system_log', label: 'ประวัติการทำงาน', icon: <FileText />, path: '/admin/system-log', allowedRoles: [1] },
        { id: 'invlog', label: 'รายงานสต็อก', icon: <ClipboardList />, path: '/admin/inv-log', allowedRoles: [1, 2] },
        { id: 'reports', label: 'สถิติยอดขาย', icon: <BarChart3 />, path: '/admin/reports', allowedRoles: [1, 2] },
        { id: 'shop-setting', label: 'ตั้งค่าร้านค้า', icon: <Settings />, path: '/admin/shop-setting', allowedRoles: [1, 3] },
    ];

    const visibleNavItems = navItems.filter(item => item.allowedRoles.includes(userLevel));

    return (
        <>
            {isMobileOpen && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[999] lg:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                <style>{`
                    .sidebar-container {
                        width: 280px; height: 100vh; background: #FDFCFB; border-right: 2px solid #CBD5E1;
                        display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 1000;
                        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Kanit', sans-serif;
                    }
                    .sidebar-container.collapsed { width: 110px; }

                    @media (max-width: 1023px) { 
                        .sidebar-container { transform: translateX(-100%); width: 280px !important; }
                        .sidebar-container.mobile-open { transform: translateX(0); box-shadow: 25px 0 60px rgba(0,0,0,0.1); border-right: none; }
                    }

                    .toggle-handle { 
                        position: absolute; right: -18px; top: 35px; 
                        width: 36px; height: 36px; 
                        background: #fff; color: #111827; 
                        border-radius: 50%; border: 2px solid #CBD5E1; 
                        display: flex; align-items: center; justify-content: center; 
                        cursor: pointer; z-index: 50; transition: all 0.3s;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    }
                    
                    /* 🚀 เพิ่มพื้นที่บนล่าง Brand: 40px Top, 30px Bottom */
                    .brand-section { padding: 40px 8px 30px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
                    .collapsed .brand-section { padding: 40px 0 30px; justify-content: center; gap: 0; }

                    .logo-box { 
                        min-width: 48px; min-height: 48px; background: #fff; border-radius: 12px; 
                        display: flex; align-items: center; justify-content: center; color: #000000;
                        border: 2px solid #CBD5E1;
                    }
                    .brand-name { font-size: 32px; font-weight: 500; color: #000000; text-transform: uppercase; letter-spacing: -2px; white-space: nowrap; transition: 0.3s; font-style: italic; }
                    .collapsed .brand-name { display: none; }

                    .nav-body { flex: 1; padding: 10px 4px 0 10px; overflow-y: auto; }
                    .collapsed .nav-body { padding: 10px 0 0; }
                    
                    .nav-category { font-size: 11px; text-transform: uppercase; color: #94A3B8; font-weight: 600; margin: 0 0 15px 14px; letter-spacing: 0.25em; }
                    .collapsed .nav-category { display: none; }

                    /* 🚀 เพิ่มพื้นที่บนล่าง Nav Item: 18px Vertical Padding, 12px Margin Bottom */
                    .nav-item { 
                        display: flex; align-items: center; gap: 12px; 
                        padding: 18px 2px 18px 16px; 
                        margin-bottom: 12px; 
                        border-radius: 16px; color: #64748B; font-weight: 500; transition: all 0.3s ease; 
                        cursor: pointer;
                    }
                    .collapsed .nav-item { padding: 18px 0; justify-content: center; gap: 0; margin: 0 auto 12px; width: 60px; }

                    .nav-item .label { font-size: 26px; letter-spacing: -0.5px; white-space: nowrap; line-height: 1; }
                    .nav-item:hover { background: #F8FAFC; color: #000000; }
                    
                    .nav-item.active { background: #F1F5F9; color: #000000; }
                    .nav-item.active .label { font-weight: 500; font-style: italic; }

                    .collapsed .label { display: none; }

                    /* 🚀 เพิ่มพื้นที่บนล่าง Footer: 30px Vertical Padding */
                    .footer-section { padding: 30px 8px; border-top: 2px solid #F1F5F9; }
                    .collapsed .footer-section { padding: 30px 0; display: flex; justify-content: center; }
                    
                    .btn-signout { 
                        width: 100%; display: flex; align-items: center; gap: 10px; padding: 14px 12px; 
                        background: #fff; color: #DC2626; border: 2px solid #FECDD3; border-radius: 16px; 
                        font-weight: 500; cursor: pointer; transition: 0.3s; justify-content: center;
                        font-size: 22px; text-transform: uppercase; font-style: italic; line-height: 1;
                    }
                    .btn-signout:hover { background: #FEF2F2; transform: translateY(-2px); border-color: #DC2626; }
                    
                    .collapsed .btn-signout { padding: 14px 0; width: 50px; border: none; background: transparent; }
                    .collapsed .logout-text { display: none; }

                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                `}</style>

                <button className="hidden lg:flex toggle-handle" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronRight size={20} strokeWidth={2.5} /> : <ChevronLeft size={20} strokeWidth={2.5} />}
                </button>

                <div className="brand-section" onClick={() => navigate('/admin/dashboard')}>
                    <div className="logo-box shadow-sm">
                        <Sparkles size={28} strokeWidth={2} />
                    </div>
                    <span className="brand-name">{shopName}</span>
                </div>
                
                <div className="nav-body custom-scrollbar">
                    {!isCollapsed && <p className="nav-category">Control Panel</p>}
                    
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
                                <div className="icon-box shrink-0">
                                    {React.cloneElement(item.icon, { size: 28, strokeWidth: 2 })}
                                </div>
                                <span className="label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="footer-section">
                    <button onClick={handleLogout} className="btn-signout active:scale-95 shadow-sm">
                        <LogOut size={26} strokeWidth={2.5}/> 
                        <span className="logout-text">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;