import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShoppingCart, Search, ChevronDown, LogOut, 
  User, Mail, Menu, X, LayoutDashboard, History, Package 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const HeaderHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  // --- States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [shopName, setShopName] = useState('SOOO GUICHAI');

  // 1. ดึงข้อมูลชื่อร้านค้า (ใช้ axiosInstance)
  const fetchShopName = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/public`);
      if (res.success) {
        const data = res.data;
        // รองรับทั้งแบบ Array (Legacy) และ Object (New)
        if (Array.isArray(data)) {
          const nameSetting = data.find(s => s.config_key === 'shop_name');
          if (nameSetting) setShopName(nameSetting.config_value);
        } else if (data && typeof data === 'object') {
          setShopName(data.shop_name || 'SOOO GUICHAI');
        }
      }
    } catch (err) { console.error("Fetch shop name error:", err); }
  }, []);

  // 2. ดึงข้อมูลโปรไฟล์ (ไม่ต้องใส่ Header เองแล้ว)
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.USERS}/profile`);
      if (res.success) {
        setUserData(res.data);
      }
    } catch (err) {
      // หาก Token หมดอายุ axiosInstance จะจัดการเตะไปหน้า Login ให้เอง
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

  // --- Functions ---
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
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
    <nav className="sticky top-0 z-50 bg-[#fdfbf2]/90 backdrop-blur-md border-b border-gray-100 font-['Kanit']">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-[#1b2559]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div 
            className="text-2xl lg:text-3xl font-black text-[#1b2559] cursor-pointer tracking-tighter hover:text-[#e8c4a0] transition-colors"
            onClick={() => navigate('/')}
          >
            {shopName.toUpperCase()}
          </div>
        </div>

        {/* Menu Navigation */}
        <div className="hidden lg:flex gap-10">
          {['หน้าแรก', 'เมนู', 'เกี่ยวกับเรา', 'ติดต่อเรา'].map((item) => (
            <span 
              key={item}
              className={`text-[#1b2559] font-medium cursor-pointer hover:text-[#e8c4a0] transition-colors relative group ${
                (item === 'เมนู' && location.pathname === '/products') || (item === 'หน้าแรก' && location.pathname === '/') ? 'text-[#e8c4a0]' : ''
              }`}
              onClick={() => item === 'เมนู' ? navigate('/products') : navigate('/')}
            >
              {item}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#e8c4a0] transition-all group-hover:w-full ${
                (item === 'เมนู' && location.pathname === '/products') || (item === 'หน้าแรก' && location.pathname === '/') ? 'w-full' : 'w-0'
              }`}></span>
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden md:flex relative items-center">
            <Search size={18} className="absolute left-3 text-gray-400 cursor-pointer" onClick={handleSearch} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-10 pr-4 py-2 w-40 rounded-full border border-gray-200 bg-white/50 focus:w-56 focus:outline-none focus:border-[#e8c4a0] transition-all text-sm" 
              placeholder="ค้นหาเมนู..." 
            />
          </div>
          
          <div className="relative cursor-pointer group" onClick={() => navigate('/cart')}>
            <ShoppingCart size={22} className="text-[#1b2559] group-hover:text-[#e8c4a0]" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#e8c4a0] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm animate-bounce">
                {cartCount}
              </span>
            )}
          </div>

          {/* User Section */}
          {userData ? (
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="w-9 h-9 bg-[#1b2559] text-white rounded-xl flex items-center justify-center font-bold shadow-lg group-hover:bg-[#e8c4a0] transition-colors uppercase">
                  {userData.first_name?.charAt(0)}
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showDropdown && (
                <div className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1 text-[#1b2559]">
                    <p className="font-bold truncate">{userData.first_name} {userData.last_name}</p>
                    <p className="text-[11px] text-gray-400 lowercase italic"><Mail size={10} className="inline mr-1"/> {userData.email}</p>
                  </div>
                  
                  <div className="flex flex-col">
                    <button onClick={() => {navigate('/profile'); setShowDropdown(false);}} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#fdfbf2] rounded-xl text-left"><User size={16} /> หน้าโปรไฟล์</button>
                    <button onClick={() => {navigate('/my-orders'); setShowDropdown(false);}} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#fdfbf2] rounded-xl text-left"><History size={16} /> ประวัติการสั่งซื้อ</button>
                    <button onClick={() => {navigate('/cart'); setShowDropdown(false);}} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#fdfbf2] rounded-xl text-left"><Package size={16} /> ตะกร้าสินค้า</button>

                    {isStaff && (
                      <>
                        <div className="my-1 border-t border-gray-100"></div>
                        <button 
                          onClick={() => {navigate('/admin/dashboard'); setShowDropdown(false);}} 
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#4318ff] font-bold hover:bg-blue-50 rounded-xl text-left"
                        >
                          <LayoutDashboard size={16} /> แผงควบคุมผู้ดูแล
                        </button>
                      </>
                    )}
                  </div>

                  <div className="mt-1 border-t border-gray-50 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 font-bold hover:bg-red-50 rounded-xl text-left"><LogOut size={16} /> ออกจากระบบ</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="px-6 py-2 bg-[#e8c4a0] text-white rounded-full font-bold text-sm shadow-lg hover:bg-[#d4b08c] transition-all">เข้าสู่ระบบ</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HeaderHome;