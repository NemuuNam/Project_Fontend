import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  LogOut, FileText, ClipboardList, BarChart3,
  ChevronLeft, ChevronRight, Settings, X 
} from 'lucide-react';
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
        setShopName(res.data.shop_name === "EMPTY" ? 'SOOO GUICHAI' : res.data.shop_name);
      }
    } catch (error) { console.error("Error fetching shop name:", error); }
  }, []);

  useEffect(() => { fetchShopName(); }, [fetchShopName]);

  let userLevel = 0;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      userLevel = decoded.role_level || 0; 
    }
  } catch (error) {}

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณต้องการออกจากระบบจัดการใช่หรือไม่",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      cancelButtonColor: '#f4f7fe',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22}/>, path: '/admin/dashboard', allowedRoles: [1, 2, 3] },
    { id: 'orders', label: 'Order Management', icon: <ShoppingCart size={22}/>, path: '/admin/orders', allowedRoles: [1, 2, 3] },
    { id: 'products', label: 'Products Management', icon: <Package size={22}/>, path: '/admin/products', allowedRoles: [1, 2, 3] },
    { id: 'users', label: 'User Management', icon: <Users size={22}/>, path: '/admin/users', allowedRoles: [1, 2] },
    { id: 'system_log', label: 'System Log', icon: <FileText size={22}/>, path: '/admin/system-log', allowedRoles: [1, 2] },
    { id: 'invlog', label: 'Inventory Log', icon: <ClipboardList size={22}/>, path: '/admin/inv-log', allowedRoles: [1, 2] },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={22}/>, path: '/admin/reports', allowedRoles: [1, 2] },
    { id: 'shop-setting', label: 'Shop Settings', icon: <Settings size={22}/>, path: '/admin/shop-setting', allowedRoles: [1, 2] },
  ];

  const visibleNavItems = navItems.filter(item => item.allowedRoles.includes(userLevel));

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] lg:hidden transition-all duration-300" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`sidebar-main ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <style>{`
          .sidebar-main {
              width: 300px; height: 100vh; background: #ffffff; border-right: 1px solid #f1f5f9;
              display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 1000;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Kanit', sans-serif;
          }
          .sidebar-main.collapsed { width: 100px; }

          @media (max-width: 1023px) { /* แก้จาก 1024 เป็น 1023 เพื่อให้ iPad Pro 1024px แสดง Sidebar ปกติ */
              .sidebar-main { 
                  transform: translateX(-100%); 
                  width: 280px !important;
                  box-shadow: 25px 0 50px -12px rgba(0, 0, 0, 0.15);
                  border-right: none;
              }
              .sidebar-main.mobile-open { transform: translateX(0); }
              .toggle-btn-box { display: none !important; }
              .mobile-close-btn { display: flex !important; }
          }

          .mobile-close-btn { display: none; position: absolute; right: 15px; top: 15px; width: 35px; height: 35px; border-radius: 10px; align-items: center; justify-content: center; background: #f8fafc; color: #64748b; }
          .toggle-btn-box { position: absolute; right: -18px; top: 40px; width: 36px; height: 36px; background: #ffffff; color: #1e293b; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; z-index: 10; }
          .logo-area { padding: 40px 25px; display: flex; align-items: center; gap: 15px; cursor: pointer; }
          .logo-icon-box { min-width: 44px; min-height: 44px; background: #f4f7fe; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #4318ff; border: 1px solid #eef2f6; }
          .brand-text { font-size: 18px; font-weight: 900; color: #1b2559; letter-spacing: -0.5px; white-space: nowrap; transition: 0.3s; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; }
          .collapsed .brand-text { opacity: 0; width: 0; transform: translateX(-10px); }
          .menu-section { flex: 1; padding: 0 15px; overflow-y: auto; overflow-x: hidden; }
          .menu-category { font-size: 11px; text-transform: uppercase; color: #cbd5e1; font-weight: 800; margin: 20px 0 10px 15px; letter-spacing: 1.5px; }
          .collapsed .menu-category { visibility: hidden; opacity: 0; }
          .nav-link-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; margin-bottom: 4px; border-radius: 16px; color: #a3aed0; text-decoration: none; font-weight: 600; transition: all 0.2s ease; cursor: pointer; position: relative; }
          .nav-link-item:hover { color: #4318ff; background: #f8fafc; }
          .nav-link-item.active-menu { background: #f4f7fe; color: #4318ff; }
          .nav-link-item.active-menu::after { content: ''; position: absolute; right: -15px; top: 20%; height: 60%; width: 4px; background: #4318ff; border-radius: 4px 0 0 4px; }
          .collapsed .label-text { display: none; }
          .logout-section { padding: 20px 15px; border-top: 1px solid #f8fafc; }
          .btn-logout { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; font-family: 'Kanit'; text-transform: uppercase; font-size: 12px; justify-content: center; }
          .collapsed .logout-label { display: none; }
        `}</style>

        <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)}><X size={20} /></button>
        <button className="toggle-btn-box" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="logo-area" onClick={() => navigate('/admin/dashboard')}>
          <div className="logo-icon-box"><Package size={24} strokeWidth={2.5} /></div>
          <span className="brand-text">{shopName}</span>
        </div>
        
        <div className="menu-section">
          {!isCollapsed && <p className="menu-category">Main Console</p>}
          {visibleNavItems.map((item) => (
            <div key={item.id} className={`nav-link-item ${activePage === item.id ? 'active-menu' : ''}`}
              onClick={() => { navigate(item.path); if (window.innerWidth < 1024) setIsMobileOpen(false); }}>
              <div className="icon-wrapper">{item.icon}</div>
              <span className="label-text">{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="logout-section">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={20} strokeWidth={2.5}/> <span className="logout-label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;