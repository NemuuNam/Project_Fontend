import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Bell, LogOut, Home, Settings, Mail, ChevronDown, 
  Sparkles, Leaf, Cookie, Smile, ShieldCheck,
  Loader2, User, ShoppingBag
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

  // --- 🔄 Logic (คงเดิม 100% ตามคำสั่ง) ---
  const fetchPendingOrders = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.ORDERS);
      if (res.success && res.data) {
        const count = res.data.filter(order => order.status === 'รอตรวจสอบชำระเงิน').length;
        setPendingCount(count);
      }
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${API_ENDPOINTS.AUTH}/profile`);
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
    fetchPendingOrders();

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

  const canAccessSettings = [1, 3].includes(userData.role_level);

  return (
    <header className="flex justify-between items-center mb-8 md:mb-12 font-['Kanit'] w-full relative z-[100] bg-[#fff] py-4">
      
      {/* ☁️ Cozy Background Patterns (Subtle Gimmick - Opacity 0.02) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02] z-0">
        <Leaf className="absolute top-2 left-[15%] rotate-12 text-[#2D241E]" size={40} />
        <Cookie className="absolute top-4 right-[30%] -rotate-12 text-[#2D241E]" size={35} />
        <Smile className="absolute bottom-0 left-[40%] text-[#2D241E]" size={30} />
      </div>

      {/* ส่วนหัวเรื่อง */}
      <div className="header-left relative z-20">
        <div className="flex flex-col text-left">
          <p className="text-[15px] font-black text-[#2D241E]/40 uppercase tracking-[0.4em] mb-1">หน้าปัจจุบัน</p>
          <h1 className="text-2xl md:text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-3">
            <Sparkles size={20} className="text-[#2D241E]/20" />
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 relative z-20" ref={dropdownRef}>
        
        {/* กระดิ่งแจ้งเตือน - Pearl Style White Button */}
        <button 
          className="relative p-3 bg-[#fff] rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 group overflow-hidden"
          onClick={() => navigate('/admin/orders')}
          title="รายการรอตรวจสอบ"
        >
          <Bell size={20} className="text-[#2D241E]" />
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2 bg-[#FF0000] text-white rounded-full w-4 h-4 text-[12px] flex items-center justify-center font-black animate-pulse border border-[#fff]">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Profile Trigger - Pearl White Soft Dimension */}
        <button 
          className="flex items-center gap-3 p-1.5 pr-4 bg-[#fff] rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="w-9 h-9 md:w-10 md:h-10 bg-[#2D241E] text-[#fff] rounded-xl flex items-center justify-center font-black text-lg shadow-inner">
            {userData.first_name ? userData.first_name.charAt(0).toUpperCase() : <Loader2 className="animate-spin" size={16} />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-black text-[#2D241E] leading-none uppercase tracking-tight">
              {userData.first_name || 'กำลังโหลด...'}
            </p>
            <p className="text-[12px] font-bold text-[#2D241E]/40 uppercase tracking-widest mt-1">
              {userData.role_name}
            </p>
          </div>
          <ChevronDown 
            size={14} 
            className={`text-[#2D241E]/30 transition-transform duration-500 ${showDropdown ? 'rotate-180 text-[#2D241E]' : ''}`} 
          />
        </button>

        {/* Profile Dropdown - All White Modal Style */}
        {showDropdown && (
          <div className="absolute top-16 right-0 w-72 md:w-80 bg-[#fff] rounded-[2.5rem] border border-slate-100 shadow-2xl z-[1000] p-5 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Smile Pattern in Dropdown (Cozy Gimmick) */}
            <Smile className="absolute -bottom-6 -right-6 opacity-[0.03] text-[#2D241E] -rotate-12" size={140} />
            
            <div className="text-center py-6 border-b border-slate-50 relative z-10">
              <div className="w-16 h-16 bg-[#fff] border border-slate-100 text-[#2D241E] rounded-3xl flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-sm">
                {userData.first_name?.charAt(0)}
              </div>
              <h3 className="text-xl font-black text-[#2D241E] uppercase tracking-tighter">
                {loading ? 'กำลังโหลด...' : `${userData.first_name} ${userData.last_name}`}
              </h3>
              <p className="text-[15px] font-black text-[#2D241E]/60 uppercase tracking-[0.3em] mt-1 flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-[#2D241E]/20" /> {userData.role_name}
              </p>
            </div>

            <div className="py-4 text-[#2D241E]/60 text-[12px] font-bold uppercase tracking-widest text-center border-b border-slate-50 relative z-10">
               {userData.email}
            </div>

            <div className="flex flex-col gap-2 mt-4 relative z-10">
              {canAccessSettings && (
                <button 
                  className="w-full py-4 bg-[#fff] text-[#2D241E] border border-slate-100 rounded-2xl font-black text-[15px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                  onClick={() => { setShowDropdown(false); navigate('/admin/shop-setting'); }}
                >
                  <Settings size={16} /> ตั้งค่าระบบ
                </button>
              )}
              <button 
                className="w-full py-4 bg-[#fff] text-[#2D241E] border border-slate-100 rounded-2xl font-black text-[15px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                onClick={() => { setShowDropdown(false); navigate('/'); }}
              >
                <Home size={16} /> กลับสู่หน้าร้าน
              </button>
              <button 
                className="w-full py-4 bg-[#fff] text-red-500 border border-red-50 rounded-2xl font-black text-[15px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-50 transition-all active:scale-95 mt-2"
                onClick={handleLogout}
              >
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