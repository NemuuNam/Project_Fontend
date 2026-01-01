import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  LogOut, FileText, ClipboardList, BarChart3,
  ChevronLeft, ChevronRight, Settings, X 
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsSidebarOpen, activePage }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [shopName, setShopName] = useState('กรุณาตั้งชื่อร้านค้า');

  // 1. ดึงชื่อร้านค้า (ใช้ axiosInstance)
  const fetchShopName = useCallback(async () => {
    try {
      // ใช้ Endpoint สาธารณะ (ต้องเพิ่มใน config.js ด้วยนะครับ)
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
      if (res.success && res.data.shop_name) {
        const name = res.data.shop_name;
        setShopName(name === "EMPTY" ? 'กรุณาตั้งชื่อร้านค้า' : name);
      }
    } catch (error) {
      console.error("Error fetching shop name:", error);
    }
  }, []);

  useEffect(() => {
    fetchShopName();
  }, [fetchShopName]);

  // ดึงระดับสิทธิ์ผู้ใช้
  let userLevel = 0;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      userLevel = decoded.role_level || 0; 
    }
  } catch (error) {}

  // 2. ออกจากระบบ (ใช้ SweetAlert2)
  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณต้องการออกจากเซสชันปัจจุบันใช่หรือไม่",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#f4f7fe',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      customClass: { popup: 'premium-popup' }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: <LayoutDashboard size={20}/>, path: '/admin/dashboard', allowedRoles: [1, 2, 3] },
    { id: 'orders', label: 'จัดการคำสั่งซื้อ', icon: <ShoppingCart size={20}/>, path: '/admin/orders', allowedRoles: [1, 2, 3] },
    { id: 'products', label: 'จัดการสินค้า', icon: <Package size={20}/>, path: '/admin/products', allowedRoles: [1, 2, 3] },
    { id: 'users', label: 'จัดการผู้ใช้', icon: <Users size={20}/>, path: '/admin/users', allowedRoles: [1, 2] },
    { id: 'system_log', label: 'System Log', icon: <FileText size={20}/>, path: '/admin/system-log', allowedRoles: [1, 2] },
    { id: 'invlog', label: 'Inventory Log', icon: <ClipboardList size={20}/>, path: '/admin/inv-log', allowedRoles: [1, 2] },
    { id: 'reports', label: 'รายงานยอดขาย', icon: <BarChart3 size={20}/>, path: '/admin/reports', allowedRoles: [1, 2] },
    { id: 'shop-setting', label: 'ตั้งค่าร้านค้า', icon: <Settings size={20}/>, path: '/admin/shop-setting', allowedRoles: [1, 2] },
  ];

  const visibleNavItems = navItems.filter(item => item.allowedRoles.includes(userLevel));

  return (
    <>
      {/* Overlay สำหรับมือถือ */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999, backdropFilter: 'blur(4px)' }}
        />
      )}

      <aside className={`sidebar-main ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <style>{`
          .sidebar-main {
              width: 280px; height: 100vh; background: #fff; border-right: 1px solid #f1f5f9;
              display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 1000;
              transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); font-family: 'Kanit', sans-serif;
          }

          .sidebar-main.collapsed { width: 85px; }

          /* Mobile Logic */
          @media (max-width: 1024px) {
              .sidebar-main { transform: translateX(-100%); width: 280px !important; }
              .sidebar-main.mobile-open { transform: translateX(0); box-shadow: 20px 0 50px rgba(0,0,0,0.1); }
              .toggle-btn-box { display: none !important; }
          }

          .toggle-btn-box {
              position: absolute; right: -15px; top: 45px; width: 30px; height: 30px;
              background: #4318ff; color: white; border-radius: 50%; display: flex;
              align-items: center; justify-content: center; cursor: pointer;
              box-shadow: 0 4px 10px rgba(67, 24, 255, 0.3); border: none; z-index: 10;
          }

          .logo-area { padding: 40px 25px; display: flex; align-items: center; gap: 15px; cursor: pointer; }
          .logo-icon-box { min-width: 40px; height: 40px; background: linear-gradient(135deg, #4318ff 0%, #3311db 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
          
          .brand-text { font-size: 16px; font-weight: 800; color: #1b2559; letter-spacing: 0.5px; white-space: nowrap; transition: opacity 0.3s; text-transform: uppercase; }
          .collapsed .brand-text { opacity: 0; pointer-events: none; }

          .menu-section { flex: 1; padding: 0 15px; overflow-y: auto; }
          .menu-category { font-size: 11px; text-transform: uppercase; color: #a3aed0; font-weight: 700; margin: 20px 0 15px 15px; letter-spacing: 1px; }
          .collapsed .menu-category { visibility: hidden; }

          .nav-link-item {
              display: flex; align-items: center; gap: 15px; padding: 14px 18px; margin-bottom: 8px;
              border-radius: 15px; color: #a3aed0; text-decoration: none; font-weight: 500;
              transition: all 0.3s; cursor: pointer; position: relative;
          }
          .nav-link-item:hover { background: #f4f7fe; color: #1b2559; }
          .nav-link-item.active-menu { background: #f4f7fe; color: #4318ff; }
          .nav-link-item.active-menu::after { content: ''; position: absolute; right: 0; top: 20%; height: 60%; width: 4px; background: #4318ff; border-radius: 4px 0 0 4px; }

          .collapsed .label-text { display: none; }
          .logout-section { padding: 25px 20px; border-top: 1px solid #f1f5f9; }
          
          .btn-logout {
              width: 100%; display: flex; align-items: center; gap: 15px; padding: 14px 18px;
              background: #fff1f2; color: #ef4444; border: none; border-radius: 15px;
              font-weight: 700; cursor: pointer; transition: 0.3s;
          }
          .btn-logout:hover { background: #ffe4e6; transform: translateY(-2px); }
          .collapsed .btn-logout { justify-content: center; padding: 14px 0; }
          .collapsed .logout-label { display: none; }
          .premium-popup { border-radius: 30px !important; font-family: 'Kanit', sans-serif !important; }
        `}</style>

        {/* ปุ่มยุบ-ขยาย Sidebar (ซ่อนเมื่ออยู่บนมือถือ) */}
        <button className="toggle-btn-box" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* ปุ่มปิดสำหรับมือถือ */}
        {isMobileOpen && (
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#f4f7fe', padding: '8px', borderRadius: '10px' }}
          >
            <X size={20} color="#a3aed0" />
          </button>
        )}

        <div className="logo-area" onClick={() => navigate('/admin/dashboard')}>
          <div className="logo-icon-box">
            <Package size={22} />
          </div>
          <span className="brand-text">{shopName}</span>
        </div>
        
        <div className="menu-section">
          {!isCollapsed && <p className="menu-category">ระบบจัดการหลังบ้าน</p>}
          {visibleNavItems.map((item) => (
            <div 
              key={item.id} 
              className={`nav-link-item ${activePage === item.id ? 'active-menu' : ''}`}
              onClick={() => {
                navigate(item.path);
                if (setIsSidebarOpen) setIsSidebarOpen(false); // ปิด Sidebar เมื่อเปลี่ยนหน้าบนมือถือ
              }}
              title={isCollapsed ? item.label : ""}
            >
              <div className="icon-wrapper">{item.icon}</div>
              <span className="label-text">{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="logout-section">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={20}/> 
            <span className="logout-label">ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;