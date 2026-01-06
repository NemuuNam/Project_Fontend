import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShoppingCart, Search, ChevronDown, LogOut, 
  User, Mail, Menu, X, LayoutDashboard, History, Package 
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
  const [shopName, setShopName] = useState('SOOO GUICHAI');

  const menuItems = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'เมนู', path: '/products' },
    { name: 'เกี่ยวกับเรา', path: '/about' },
    { name: 'ติดต่อเรา', path: '/contact' }
  ];

  const fetchShopName = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
      if (res.success) {
        const data = res.data;
        if (Array.isArray(data)) {
          const nameSetting = data.find(s => s.config_key === 'shop_name');
          if (nameSetting) setShopName(nameSetting.config_value);
        } else if (data && typeof data === 'object') {
          setShopName(data.shop_name || 'SOOO GUICHAI');
        }
      }
    } catch (err) { console.error("Fetch shop name error:", err); }
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.USERS}/profile`);
      if (res.success) {
        setUserData(res.data);
      }
    } catch (err) {
      setUserData(null);
    }
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
        setIsMobileMenuOpen(false); // ปิดเมนูเมื่อกดค้นหา
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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 font-['Kanit']">
      <div className="container mx-auto px-6 py-5 flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden text-slate-900 focus:outline-none" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <div 
            className="text-2xl md:text-3xl font-black text-slate-900 cursor-pointer tracking-tighter hover:opacity-70 transition-opacity"
            onClick={() => navigate('/')}
          >
            {shopName.toUpperCase()}
          </div>
        </div>

        {/* Desktop Menu Navigation */}
        <div className="hidden lg:flex gap-10">
          {menuItems.map((item) => (
            <span 
              key={item.name}
              className={`text-lg font-bold cursor-pointer transition-all relative group ${
                location.pathname === item.path ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.name}
              <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 bg-slate-900 rounded-full transition-all ${
                location.pathname === item.path ? 'w-5' : 'w-0 group-hover:w-5'
              }`}></span>
            </span>
          ))}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Desktop Search */}
          <div className="hidden md:flex relative items-center">
            <Search size={20} className="absolute left-4 text-slate-400 cursor-pointer" onClick={handleSearch} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-12 pr-4 py-3 w-56 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 focus:w-72 focus:outline-none transition-all text-base font-medium" 
              placeholder="ค้นหาเมนู..." 
            />
          </div>
          
          {/* Cart Icon */}
          <div className="relative cursor-pointer group" onClick={() => navigate('/cart')}>
            <ShoppingCart size={26} className="text-slate-900 group-hover:opacity-60 transition-opacity" />
            {cartCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black shadow-lg animate-bounce">
                {cartCount}
              </span>
            )}
          </div>

          {/* User Profile Section */}
          {userData ? (
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold shadow-xl group-hover:scale-105 transition-transform uppercase text-base">
                  {userData.first_name?.charAt(0)}
                </div>
                <ChevronDown size={16} className={`hidden md:block text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showDropdown && (
                <div className="absolute top-16 right-0 w-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 p-3 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-5 py-4 border-b border-slate-50 mb-2">
                    <p className="font-bold text-slate-900 text-lg">{userData.first_name} {userData.last_name}</p>
                    <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium italic">
                      <Mail size={14} /> {userData.email}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <button onClick={() => {navigate('/profile'); setShowDropdown(false);}} className="w-full flex items-center gap-3 px-4 py-3.5 text-base font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all"><User size={20} className="opacity-50" /> ตั้งค่าโปรไฟล์</button>
                    <button onClick={() => {navigate('/my-orders'); setShowDropdown(false);}} className="w-full flex items-center gap-3 px-4 py-3.5 text-base font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all"><History size={20} className="opacity-50" /> ประวัติการสั่งซื้อ</button>
                    
                    {isStaff && (
                      <div className="pt-2 mt-2 border-t border-slate-50">
                        <button 
                          onClick={() => {navigate('/admin/dashboard'); setShowDropdown(false);}} 
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-base font-bold text-slate-900 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all"
                        >
                          <LayoutDashboard size={20} /> แผงควบคุมผู้ดูแล
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"><LogOut size={20} /> ออกจากระบบ</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="hidden md:block px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold text-base shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-50 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container mx-auto px-6 py-6 space-y-6">
          {/* Mobile Search */}
          <div className="relative flex items-center">
            <Search size={20} className="absolute left-4 text-slate-400" onClick={handleSearch} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:outline-none transition-all text-base" 
              placeholder="ค้นหาเมนู..." 
            />
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <div 
                key={item.name}
                className={`text-xl font-bold p-2 ${location.pathname === item.path ? 'text-slate-900' : 'text-slate-400'}`}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.name}
              </div>
            ))}
          </div>

          {/* Login Button for Mobile (if not logged in) */}
          {!userData && (
            <button 
              onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HeaderHome;