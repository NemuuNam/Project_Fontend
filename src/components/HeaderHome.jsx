import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingCart, Search, ChevronDown, LogOut,
  User, Mail, Menu, X, LayoutDashboard, History, Package, ShieldCheck, Sparkles,
  Cookie, Smile, Leaf, Heart, ChevronRight, Home // เพิ่ม Home สำหรับปุ่มกลับหน้าแรก
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const HeaderHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [shopName, setShopName] = useState('THE BAKERY');

  const menuItems = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'เมนูสินค้า', path: '/products' },
    { name: 'เกี่ยวกับเรา', path: '/about' },
    { name: 'ติดต่อเรา', path: '/contact' }
  ];

  const fetchShopName = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
      if (res.success && res.data) {
        const settings = Array.isArray(res.data) 
          ? res.data.reduce((acc, curr) => ({ ...acc, [curr.config_key]: curr.config_value }), {})
          : res.data;
        setShopName(settings.shop_name || 'THE BAKERY');
      }
    } catch (err) { console.error("Fetch shop name error:", err); }
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.PROFILE}`);
      if (res.success) { setUserData(res.data); }
    } catch (err) { setUserData(null); }
  }, []);

  const updateCart = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
  }, []);

  useEffect(() => {
    fetchShopName();
    fetchProfile();
    updateCart();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
    };
    window.addEventListener('storage', updateCart);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', updateCart);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchShopName, fetchProfile, updateCart]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        setIsMobileMenuOpen(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    setShowDropdown(false);
    navigate('/');
    window.location.reload();
  };

  const isStaff = userData && [1, 2, 3].includes(Number(userData.role_level));

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b-2 border-slate-100 font-['Kanit'] transition-all duration-500">

      {/* ☁️ Decorative Patterns - Keep very light for aesthetic only */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Leaf className="absolute top-2 left-[10%] rotate-12 text-[#2D241E] opacity-[0.03]" size={40} />
        <Smile className="absolute top-3 right-[15%] text-[#2D241E] opacity-[0.03]" size={35} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-3 md:py-4 flex justify-between items-center relative z-10">

        {/* 🍪 Logo Section */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden bg-white text-[#2D241E] p-2 rounded-xl shadow-sm border-2 border-slate-100 active:scale-90 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
          </button>

          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-[#2D241E] text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
              <Sparkles size={18} fill="currentColor" />
            </div>
            <span className="hidden sm:block text-xl md:text-2xl font-black text-[#2D241E] tracking-tighter uppercase italic">{shopName}</span>
          </div>
        </div>

        {/* ☕ Desktop Menu (Darker Text) */}
        <div className="hidden lg:flex items-center gap-8">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                className={`text-sm md:text-base font-black cursor-pointer transition-all relative py-1 outline-none uppercase tracking-widest ${
                  // แก้จาก text-[#2D241E]/50 (จาง) เป็น text-[#2D241E] (เข้ม)
                  isActive ? 'text-[#2D241E]' : 'text-[#2D241E] hover:underline decoration-2 underline-offset-4'
                } group`}
                onClick={() => navigate(item.path)}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D241E] rounded-full transition-all duration-300 transform ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </button>
            );
          })}
        </div>

        {/* 🍯 Actions Section */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Cart Icon */}
          <div
            className="relative cursor-pointer bg-white p-2.5 rounded-xl shadow-sm border-2 border-slate-100 hover:border-[#2D241E] hover:shadow-md transition-all active:scale-90"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart size={20} strokeWidth={3} className="text-[#2D241E]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF0000] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-lg ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>

          {/* User Section */}
          {userData ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer bg-slate-50 p-1 pr-3 rounded-xl border-2 border-slate-100 hover:bg-white hover:border-[#2D241E] transition-all"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-8 h-8 bg-[#2D241E] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-md uppercase">
                  {userData.first_name?.charAt(0)}
                </div>
                <ChevronDown size={14} strokeWidth={3} className={`hidden sm:block text-[#2D241E] transition-transform duration-500 ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu (High Contrast) */}
              {showDropdown && (
                <div className="absolute top-12 right-0 w-64 bg-white rounded-3xl shadow-2xl border-2 border-[#2D241E]/10 p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="px-5 py-4 border-b-2 border-slate-50 mb-1 text-left">
                    <p className="font-black text-[#2D241E] text-base truncate uppercase italic">{userData.first_name} {userData.last_name}</p>
                    {/* แก้จาก text-[#2D241E]/50 (จาง) เป็น text-[#2D241E] (เข้ม) */}
                    <p className="text-[11px] text-[#2D241E] truncate font-bold uppercase tracking-wider mt-0.5 italic">{userData.email}</p>
                  </div>

                  <div className="space-y-0.5 text-left">
                    {/* ปุ่มหน้าแรกใน Dropdown */}
                    <button onClick={() => { navigate('/'); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#2D241E] hover:bg-slate-50 rounded-xl transition-all">
                      <Home size={16} strokeWidth={2.5} /> กลับหน้าหลัก
                    </button>
                    <button onClick={() => { navigate('/profile'); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#2D241E] hover:bg-slate-50 rounded-xl transition-all">
                      <User size={16} strokeWidth={2.5} /> โปรไฟล์ส่วนตัว
                    </button>
                    <button onClick={() => { navigate('/my-orders'); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#2D241E] hover:bg-slate-50 rounded-xl transition-all">
                      <Package size={16} strokeWidth={2.5} /> คำสั่งซื้อของฉัน
                    </button>

                    {isStaff && (
                      <button onClick={() => { navigate('/admin/dashboard'); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-black text-[#2D241E] bg-amber-50 hover:bg-amber-100 rounded-xl transition-all border border-amber-200 mt-1">
                        <ShieldCheck size={16} strokeWidth={2.5} className="text-amber-700" /> ระบบจัดการร้าน
                      </button>
                    )}
                  </div>

                  <div className="mt-1 pt-1 border-t-2 border-slate-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 font-black hover:bg-red-50 rounded-xl transition-all">
                      <LogOut size={16} strokeWidth={2.5} /> ลงชื่อออก
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-[#2D241E] text-white rounded-full font-black text-xs md:text-sm uppercase tracking-widest shadow-md hover:bg-black active:scale-95 transition-all italic"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* 🍂 Mobile Menu (High Contrast) */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 bg-white ${isMobileMenuOpen ? 'max-h-[500px] border-t-2 border-slate-100 shadow-inner' : 'max-h-0'}`}>
        <div className="px-6 py-8 space-y-6 text-left">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2D241E]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              // แก้สีตัวอักษรใน Input
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#2D241E] text-sm font-bold text-[#2D241E] transition-all outline-none placeholder:text-[#2D241E]"
              placeholder="ค้นหาเมนู..."
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                className={`text-base font-black p-4 rounded-2xl transition-all text-left flex justify-between items-center border-2 ${
                  location.pathname === item.path ? 'bg-[#2D241E] border-[#2D241E] text-white shadow-lg' : 'bg-white border-slate-100 text-[#2D241E]'
                }`}
                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
              >
                {item.name}
                {location.pathname === item.path ? <Sparkles size={16} /> : <ChevronRight size={16} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderHome;