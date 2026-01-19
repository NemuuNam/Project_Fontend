import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Bell, LogOut, Home, ChevronDown, 
  Sparkles, ShieldCheck, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Header = ({ title = "แผงควบคุม", isCollapsed }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState({ first_name: '', last_name: '', email: '', role_name: '', role_level: 4 });
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingOrders = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS);
      if (res.success && res.data) {
        const count = res.data.filter(order => order.status === 'รอตรวจสอบชำระเงิน').length;
        setPendingCount(count);
      }
    } catch (err) { console.error(err); }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${API_ENDPOINTS.AUTH}/profile`);
      if (res.success) setUserData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchPendingOrders();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
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

  return (
    <header className={`
      fixed top-0 right-0 z-[100] /* 🚀 ปรับ z-index ให้เหมาะสม */
      transition-all duration-500 ease-in-out
      flex justify-between items-center 
      bg-[#FDFCFB] border-b border-slate-300
      py-4 px-6 md:px-10
      ${isCollapsed ? 'left-[110px]' : 'left-[280px]'}
      hidden lg:flex
    `}>
      {/* --- 🎨 Left: Page Title --- */}
      <div className="header-left text-left">
        <p className="text-sm font-medium text-[#374151] uppercase tracking-widest mb-1 italic">Dashboard /</p>
        <h1 className="text-3xl md:text-4xl font-medium text-[#000000] tracking-tighter uppercase italic flex items-center gap-4 leading-none">
          <div className="p-3 bg-white border border-slate-300 rounded-2xl text-[#000000] shadow-sm">
            <Sparkles size={26} strokeWidth={2} />
          </div>
          {title}
        </h1>
      </div>

      {/* --- 🎨 Right: Actions (White/Light Gray Theme) --- */}
      <div className="flex items-center gap-6" ref={dropdownRef}>
        
        {/* 🚀 Notification Bell: พื้นหลังขาว ขอบบาง */}
        <button 
          className="relative p-4 bg-white rounded-2xl border border-slate-300 shadow-sm hover:bg-slate-50 transition-all active:scale-90" 
          onClick={() => navigate('/admin/orders')}
        >
          <Bell size={26} strokeWidth={2} className="text-[#111827]" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white rounded-full w-7 h-7 text-xs flex items-center justify-center font-bold border-2 border-[#FDFCFB]">
              {pendingCount}
            </span>
          )}
        </button>

        {/* 🚀 User Profile Button: พื้นหลังขาว ขอบบาง */}
        <button 
          className="flex items-center gap-4 p-2 pr-6 bg-white rounded-2xl border border-slate-300 shadow-sm hover:bg-slate-50 hover:border-[#000000] transition-all group" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="w-12 h-12 bg-slate-100 text-[#000000] rounded-xl flex items-center justify-center font-medium text-2xl border border-slate-200 shadow-inner">
            {userData.first_name ? userData.first_name.charAt(0).toUpperCase() : <Loader2 className="animate-spin" size={18} />}
          </div>
          <div className="text-left leading-tight">
            <p className="text-xl font-medium text-[#000000] uppercase italic leading-none">{userData.first_name || '...'}</p>
            <p className="text-xs font-medium text-[#374151] uppercase tracking-widest mt-1.5">{userData.role_name}</p>
          </div>
          <ChevronDown size={20} strokeWidth={2.5} className={`text-[#374151] transition-transform duration-500 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* --- 📝 Dropdown Menu --- */}
        {showDropdown && (
          <div className="absolute top-24 right-0 w-80 bg-white rounded-[3rem] border border-slate-300 shadow-2xl z-[110] p-8 animate-in fade-in slide-in-from-top-6 duration-500">
            <div className="text-center pb-6 border-b border-slate-100">
              <div className="w-20 h-20 bg-slate-50 text-[#000000] rounded-3xl flex items-center justify-center font-medium text-4xl mx-auto mb-4 border border-slate-200 shadow-sm">
                {userData.first_name?.charAt(0)}
              </div>
              <h3 className="text-2xl font-medium text-[#000000] uppercase italic leading-none">{userData.first_name} {userData.last_name}</h3>
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white text-[#111827] rounded-full text-xs font-medium uppercase tracking-widest border border-slate-300">
                <ShieldCheck size={16} strokeWidth={2} /> {userData.role_name}
              </div>
            </div>
            
            <div className="py-5 text-[#374151] text-sm font-medium text-center italic border-b border-slate-100">{userData.email}</div>
            
            <div className="flex flex-col gap-4 mt-6">
              {/* 🚀 ปุ่มพื้นหลังขาว ขอบดำ */}
              <button 
                className="w-full py-4 bg-white text-[#111827] border border-slate-300 rounded-2xl font-medium text-base uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 italic" 
                onClick={() => navigate('/')}
              >
                <Home size={20} /> Visit Shop
              </button>
              {/* 🚀 ปุ่ม Sign Out พื้นหลังขาว ขอบแดง */}
              <button 
                className="w-full py-4 bg-white text-[#DC2626] border border-[#DC2626] rounded-2xl font-medium text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-sm hover:bg-red-50 transition-all active:scale-95 italic" 
                onClick={handleLogout}
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;