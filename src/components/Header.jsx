import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Bell, LogOut, Home, Settings, ChevronDown, 
  Sparkles, Leaf, Cookie, ShieldCheck, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const Header = ({ title = "แผงควบคุม" }) => {
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
<<<<<<< HEAD
    <header className="flex justify-between items-center mb-8 md:mb-12 font-['Kanit'] w-full relative z-[100] bg-[#fff] py-1">
      
      {/* ☁️ Cozy Background Patterns (Subtle Gimmick - Opacity 0.02) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02] z-0">
        <Leaf className="absolute top-2 left-[15%] rotate-12 text-[#2D241E]" size={40} />
        <Cookie className="absolute top-4 right-[30%] -rotate-12 text-[#2D241E]" size={35} />
        <Smile className="absolute bottom-0 left-[40%] text-[#2D241E]" size={30} />
      </div>

      {/* ส่วนหัวเรื่อง */}
      <div className="header-left relative z-20">
        <div className="flex flex-col text-left">
          <p className="text-[20px] font-black text-[#2D241E]/80 uppercase tracking-[0.4em] mb-1">หน้าปัจจุบัน</p>
          <h1 className="text-2xl md:text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-3">
            <Sparkles size={20} className="text-[#2D241E]/20" />
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 relative z-20" ref={dropdownRef}>
        
        {/* กระดิ่งแจ้งเตือน - Pearl Style White Button */}
        <button 
          className="relative p-5 bg-[#fff] rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 group overflow-hidden"
          onClick={() => navigate('/admin/orders')}
          title="รายการรอตรวจสอบ"
        >
          <Bell size={30} className="text-[#2D241E]" />
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2 bg-[#FF0000] text-white rounded-full w-6 h-6 text-[13px] flex items-center justify-center font-black animate-pulse border border-[#fff]">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Profile Trigger - Pearl White Soft Dimension */}
        <button 
          className="flex items-center gap-3 p-4 pr-4 bg-[#fff] rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="w-9 h-9 md:w-10 md:h-10 bg-[#fff] text-[#2D241E] rounded-xl flex items-center justify-center font-black text-lg shadow-inner">
            {userData.first_name ? userData.first_name.charAt(0).toUpperCase() : <Loader2 className="animate-spin" size={16} />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-black text-[#2D241E] leading-none uppercase tracking-tight">
              {userData.first_name || 'กำลังโหลด...'}
            </p>
            <p className="text-[12px] font-bold text-[#2D241E]/70 uppercase tracking-widest mt-1">
              {userData.role_name}
            </p>
=======
    <header className="flex justify-between items-center mb-6 md:mb-8 font-['Kanit'] w-full relative z-[100] bg-white py-2">
      <div className="header-left relative z-20 text-left">
        <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-0.5">CURRENT PAGE</p>
        <h1 className="text-2xl md:text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-2 leading-none">
          <Sparkles size={18} className="text-[#2D241E]" strokeWidth={3} />
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4 relative z-20" ref={dropdownRef}>
        <button className="relative p-3 bg-white rounded-xl border-2 border-[#2D241E] shadow-sm hover:shadow-md transition-all active:scale-90" onClick={() => navigate('/admin/orders')}>
          <Bell size={22} strokeWidth={3} className="text-[#2D241E]" />
          {pendingCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-black border-2 border-white animate-pulse">{pendingCount}</span>}
        </button>

        <button className="flex items-center gap-3 p-1.5 pr-4 bg-white rounded-xl border-2 border-[#2D241E] shadow-sm transition-all" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="w-9 h-9 bg-[#2D241E] text-white rounded-lg flex items-center justify-center font-black text-base shadow-sm">
            {userData.first_name ? userData.first_name.charAt(0).toUpperCase() : <Loader2 className="animate-spin text-white" size={14} />}
          </div>
          <div className="hidden sm:block text-left leading-none">
            <p className="text-sm font-black text-[#2D241E] uppercase italic mb-1">{userData.first_name || 'LOADING...'}</p>
            <p className="text-[9px] font-black text-[#2D241E] uppercase tracking-widest">{userData.role_name}</p>
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
          </div>
          <ChevronDown size={14} strokeWidth={3} className={`text-[#2D241E] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Compact Dropdown - เข้มชัด */}
        {showDropdown && (
          <div className="absolute top-16 right-0 w-64 bg-white rounded-[2rem] border-2 border-[#2D241E] shadow-2xl z-[1000] p-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="text-center pb-4 border-b-2 border-slate-100 relative z-10">
              <div className="w-14 h-14 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">{userData.first_name?.charAt(0)}</div>
              <h3 className="text-base font-black text-[#2D241E] uppercase italic">{userData.first_name} {userData.last_name}</h3>
              <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mt-2 flex items-center justify-center gap-1.5"><ShieldCheck size={12} strokeWidth={3} /> {userData.role_name}</p>
            </div>
            <div className="py-3 text-[#2D241E] text-[11px] font-black text-center border-b-2 border-slate-100 italic">{userData.email}</div>
            
<<<<<<< HEAD
            <div className="text-center py-6 border-b border-slate-50 relative z-10">
              <div className="w-16 h-16 bg-[#fff] border border-slate-100 text-[#2D241E] rounded-3xl flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-sm">
                {userData.first_name?.charAt(0)}
              </div>
              <h3 className="text-1xl font-black text-[#2D241E] uppercase tracking-tighter">
                {loading ? 'กำลังโหลด...' : `${userData.first_name} ${userData.last_name}`}
              </h3>
              <p className="text-[20px] font-black text-[#2D241E]/90 uppercase tracking-[0.3em] mt-1 flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-[#2D241E]/90" /> {userData.role_name}
              </p>
            </div>

            <div className="py-4 text-[#2D241E]/90 text-[13px] font-bold uppercase tracking-widest text-center border-b border-slate-50 relative z-10">
               {userData.email}
            </div>

            <div className="flex flex-col gap-2 mt-4 relative z-10">
              {canAccessSettings && (
                <button 
                  className="w-full py-4 bg-[#fff] text-[#2D241E] border border-slate-100 rounded-2xl font-black text-[15px] uppercase tracking-[0.1em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                  onClick={() => { setShowDropdown(false); navigate('/admin/shop-setting'); }}
                >
                  <Settings size={16} /> ตั้งค่าระบบ
                </button>
              )}
              <button 
                className="w-full py-4 bg-[#fff] text-[#2D241E] border border-slate-100 rounded-2xl font-black text-[15px] uppercase tracking-[0.1em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                onClick={() => { setShowDropdown(false); navigate('/'); }}
=======
            <div className="flex flex-col gap-2 mt-4 relative z-10">
              {/* 🏠 ปุ่มกลับหน้าหลัก (Home / Shop) */}
              <button 
                className="w-full py-2.5 bg-white text-[#2D241E] border-2 border-[#2D241E] rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95" 
                onClick={() => navigate('/')}
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
              >
                <Home size={14} strokeWidth={3} /> GO TO SHOP
              </button>

              <button 
<<<<<<< HEAD
                className="w-full py-4 bg-[#fff] text-red-500 border border-red-50 rounded-2xl font-black text-[15px] uppercase tracking-[0.1rem] flex items-center justify-center gap-3 hover:bg-red-50 transition-all active:scale-95 mt-2"
=======
                className="w-full py-2.5 bg-white text-[#2D241E] border-2 border-[#2D241E] rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95" 
                onClick={() => navigate('/admin/shop-setting')}
              >
                <Settings size={14} strokeWidth={3} /> SETTINGS
              </button>

              <button 
                className="w-full py-2.5 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 transition-all active:scale-95 mt-2" 
>>>>>>> 4234676bfa801f52282ea86ce6d7c8ba96cd69a7
                onClick={handleLogout}
              >
                <LogOut size={14} strokeWidth={3} /> SIGN OUT
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;