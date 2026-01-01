import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, ShieldCheck, ChevronDown, LogOut, Home, Settings, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Header = ({ title = "แดชบอร์ด" }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState({ first_name: '', last_name: '', email: '', role_name: '', role_level: 4 });
  const [loading, setLoading] = useState(true);
  
  // --- New State สำหรับกระดิ่งแจ้งเตือน ---
  const [pendingCount, setPendingCount] = useState(0);

  // 1. ฟังก์ชันดึงจำนวนออเดอร์ที่รอตรวจสอบ (รอตรวจสอบชำระเงิน)
  const fetchPendingOrders = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS);
      if (res.success && res.data) {
        // กรองนับจำนวนเฉพาะออเดอร์ที่มีสถานะ "รอตรวจสอบชำระเงิน"
        const count = res.data.filter(order => order.status === 'รอตรวจสอบชำระเงิน').length;
        setPendingCount(count);
      }
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    }
  }, []);

  // 2. ฟังก์ชันดึงข้อมูล Profile (ใช้ axiosInstance)
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.USERS}/profile`);
      if (res.success) {
        setUserData(res.data);
      }
    } catch (err) {
      console.error("Fetch Profile Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchPendingOrders(); // ดึงข้อมูลแจ้งเตือนเมื่อโหลดหน้า

    // ปิด dropdown เมื่อคลิกข้างนอก
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchUserProfile, fetchPendingOrders]);

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const isAdminManager = [1, 2].includes(userData.role_level);

  return (
    <header className="premium-header">
      <style>{`
        .premium-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; font-family: 'Kanit', sans-serif; width: 100%; position: relative; }
        .header-left h1 { font-size: 22px; font-weight: 800; color: #1b2559; margin: 0; letter-spacing: -0.5px; }
        .header-right { display: flex; align-items: center; gap: 15px; }
        
        .notification-bell { 
          position: relative; cursor: pointer; padding: 12px; background: white; border-radius: 16px; 
          border: 1.5px solid #f1f5f9; display: flex; box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: 0.3s; 
        }
        .notification-bell:hover { background: #f4f7fe; transform: translateY(-2px); }
        .notification-badge { 
          position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; 
          border-radius: 50%; width: 20px; height: 20px; font-size: 10px; display: flex; 
          align-items: center; justify-content: center; border: 2px solid white; font-weight: 900;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
          100% { transform: scale(1); }
        }

        .profile-trigger { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px; border-radius: 20px; transition: 0.3s; border: 1.5px solid transparent; }
        .profile-trigger:hover { background: white; border-color: #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        
        .avatar { width: 42px; height: 42px; background: linear-gradient(135deg, #4318ff 0%, #3311cc 100%); color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; text-transform: uppercase; }

        .profile-dropdown {
          position: absolute; top: 70px; right: 0; width: 280px; 
          background: white; border-radius: 30px; border: 1px solid #f1f5f9; 
          box-shadow: 0 25px 60px rgba(0,0,0,0.1); z-index: 1000; padding: 25px; 
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

        .dd-role { font-size: 11px; color: #05cd99; background: #05cd9915; padding: 4px 10px; border-radius: 50px; font-weight: 800; text-transform: uppercase; display: inline-block; margin-top: 5px; }
        .btn-group button { width: 100%; padding: 12px; border: none; border-radius: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; font-family: 'Kanit'; font-size: 14px; }
        .btn-logout { background: #fff1f2; color: #ef4444; margin-top: 5px; }
        .btn-logout:hover { background: #ffe4e6; }
      `}</style>

      <div className="header-left">
        <h1>{title}</h1>
      </div>

      <div className="header-right" ref={dropdownRef}>
        {/* กระดิ่งแจ้งเตือน - คลิกแล้วไปหน้าจัดการออเดอร์ */}
        <div className="notification-bell" onClick={() => navigate('/admin/orders')}>
          <Bell size={20} color="#a3aed0" />
          {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
        </div>

        {/* Profile Trigger */}
        <div className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="avatar">
            {userData.first_name ? userData.first_name.charAt(0) : '?'}
          </div>
          <div className="desktop-header-hide" style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1b2559', lineHeight: 1 }}>{userData.first_name || 'Loading...'}</p>
            <span style={{ fontSize: '11px', color: '#a3aed0' }}>{userData.role_name}</span>
          </div>
          <ChevronDown size={14} color="#a3aed0" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </div>

        {/* Profile Dropdown */}
        {showDropdown && (
          <div className="profile-dropdown">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '17px', fontWeight: '800', color: '#1b2559', margin: 0 }}>
                {loading ? 'กำลังโหลด...' : `${userData.first_name} ${userData.last_name}`}
              </p>
              <span className="dd-role">{userData.role_name}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '15px 0', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a3aed0', fontSize: '13px' }}>
                <Mail size={14} /> <span style={{ color: '#1b2559' }}>{userData.email}</span>
              </div>
            </div>

            <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isAdminManager && (
                <button style={{ background: '#f0fdf4', color: '#05cd99' }} onClick={() => navigate('/admin/shop-setting')}>
                  <Settings size={16} /> ตั้งค่าร้านค้า
                </button>
              )}
              <button style={{ background: '#f4f7fe', color: '#4318ff' }} onClick={() => navigate('/')}>
                <Home size={16} /> หน้าร้านหลัก
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;