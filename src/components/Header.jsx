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
            
            <div className="flex flex-col gap-2 mt-4 relative z-10">
              {/* 🏠 ปุ่มกลับหน้าหลัก (Home / Shop) */}
              <button 
                className="w-full py-2.5 bg-white text-[#2D241E] border-2 border-[#2D241E] rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95" 
                onClick={() => navigate('/')}
              >
                <Home size={14} strokeWidth={3} /> GO TO SHOP
              </button>

              <button 
                className="w-full py-2.5 bg-white text-[#2D241E] border-2 border-[#2D241E] rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95" 
                onClick={() => navigate('/admin/shop-setting')}
              >
                <Settings size={14} strokeWidth={3} /> SETTINGS
              </button>

              <button 
                className="w-full py-2.5 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 transition-all active:scale-95 mt-2" 
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