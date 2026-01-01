import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Plus, Filter, Loader2, ShoppingCart, 
    X, SlidersHorizontal, PackageX, Check
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';

import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const CustomerProducts = ({ userData }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get('search') || '';

    // --- States ข้อมูล ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    // --- States ระบบ Filter & Search ---
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [selectedCats, setSelectedCats] = useState([]);
    const [priceRange, setPriceRange] = useState([]); 
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 1. ดึงข้อมูลจากฐานข้อมูล
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.allSettled([
                axiosInstance.get(API_ENDPOINTS.PRODUCTS),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.SHOP_SETTINGS}/categories/public`)
            ]);
            
            if (prodRes.status === 'fulfilled' && prodRes.value.success) {
                const data = prodRes.value.data || prodRes.value;
                setProducts(Array.isArray(data) ? data : []);
            }
            
            if (catRes.status === 'fulfilled' && catRes.value.success) {
                const catData = catRes.value.data || catRes.value;
                setCategories(Array.isArray(catData) ? catData : []);
            }
        } catch (err) {
            console.error("Fetch API Error:", err);
            toast.error("ดึงข้อมูลเมนูไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        updateCartCount();
    }, [fetchData]);

    useEffect(() => { setSearchTerm(urlSearch); }, [urlSearch]);

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    // 2. Logic การกรองข้อมูล (หมวดหมู่และช่วงราคา)
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCats.length === 0 || selectedCats.includes(product.category_id);
        const matchesPrice = priceRange.length === 0 || priceRange.some(range => {
            const price = product.unit_price;
            if (range === '0-100') return price <= 100;
            if (range === '101-200') return price > 100 && price <= 200;
            if (range === '201-500') return price > 200 && price <= 500;
            if (range === '501+') return price > 500;
            return true;
        });
        return matchesSearch && matchesCat && matchesPrice;
    });

    const addToCart = (product) => {
        if (product.stock_quantity <= 0) return toast.error("สินค้าหมด");
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.product_id === product.product_id);
        const mainImg = product.images?.[0]?.image_url || '/placeholder.png';

        if (existing) {
            if (existing.quantity + 1 > product.stock_quantity) return Swal.fire({ icon: 'warning', title: 'สินค้าไม่พอ', confirmButtonColor: '#1b2559' });
            existing.quantity += 1;
        } else {
            cart.push({ product_id: product.product_id, product_name: product.product_name, price: product.unit_price, image_url: mainImg, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        window.dispatchEvent(new Event('storage'));
        toast.success(`เพิ่ม ${product.product_name} แล้ว`);
    };

    // --- 📌 คอมโพเนนต์ตัวกรองแบบเดิม (ดึงมาใช้ทั้ง Desktop และ Mobile) ---
    const FilterContent = () => (
        <div className="space-y-10">
            {/* หมวดหมู่สินค้า */}
            <div>
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-5">หมวดหมู่</h3>
                <div className="space-y-4">
                    {categories.length > 0 ? categories.map(cat => (
                        <label key={cat.category_id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input 
                                    type="checkbox" 
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-200 transition-all checked:bg-[#1b2559]" 
                                    checked={selectedCats.includes(cat.category_id)} 
                                    onChange={(e) => e.target.checked ? setSelectedCats([...selectedCats, cat.category_id]) : setSelectedCats(selectedCats.filter(id => id !== cat.category_id))} 
                                />
                                <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm font-bold text-gray-500 group-hover:text-[#1b2559] transition-colors">{cat.category_name}</span>
                        </label>
                    )) : <p className="text-xs text-gray-300 italic tracking-tight">กำลังโหลดหมวดหมู่...</p>}
                </div>
            </div>

            {/* ช่วงราคา */}
            <div>
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-5">ช่วงราคา</h3>
                <div className="space-y-4">
                    {[
                        { label: 'ไม่เกิน ฿100', val: '0-100' },
                        { label: '฿101 - ฿200', val: '101-200' },
                        { label: '฿201 - ฿500', val: '201-500' },
                        { label: '฿501 ขึ้นไป', val: '501+' }
                    ].map((range) => (
                        <label key={range.val} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input 
                                    type="checkbox" 
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-200 transition-all checked:bg-[#1b2559]" 
                                    checked={priceRange.includes(range.val)} 
                                    onChange={(e) => e.target.checked ? setPriceRange([...priceRange, range.val]) : setPriceRange(priceRange.filter(r => r !== range.val))} 
                                />
                                <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm font-bold text-gray-500 group-hover:text-[#1b2559] transition-colors">{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#fdfbf2]"><Loader2 className="animate-spin text-[#1b2559]" size={50} /></div>;

    return (
        <div className="min-h-screen bg-[#fdfbf2]/40 font-['Kanit'] text-[#1b2559] relative">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- Hero Section --- */}
            <section className="bg-[#1b2559] pt-24 pb-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#e8c4a0]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="container mx-auto text-center relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase">
                        เมนู <span className="text-[#e8c4a0]">กุยช่ายพรีเมียม</span>
                    </h1>
                    <div className="max-w-2xl mx-auto relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#e8c4a0] transition-colors" size={20} />
                        <input type="text" placeholder="ค้นหาเมนูที่คุณต้องการ..." className="w-full pl-14 pr-6 py-4 bg-white rounded-full shadow-2xl outline-none focus:ring-4 ring-[#e8c4a0]/20 transition-all" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setSearchParams({ search: e.target.value });}} />
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 md:px-8 py-12 mb-10">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Sidebar Desktop (ตัวกรองเดิมครบชุด) */}
                    <aside className="hidden lg:block lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 sticky top-28">
                            <h2 className="font-black text-xl mb-8 flex items-center gap-2 border-b pb-4">
                                <Filter size={18} className="text-[#e8c4a0]" /> ตัวกรองเมนู
                            </h2>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden mb-6 flex justify-between items-center px-2">
                        <button onClick={() => setIsFilterOpen(true)} className="bg-[#1b2559] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg text-sm active:scale-95 transition-transform">
                            <SlidersHorizontal size={16} /> กรองเมนู
                        </button>
                        <p className="font-bold text-gray-400 text-xs italic uppercase">Found {filteredProducts.length} Items</p>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 px-2 md:px-0">
                                {filteredProducts.map((product) => (
                                    <div key={product.product_id} className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full border border-gray-50 relative">
                                        <div className="relative aspect-square overflow-hidden rounded-[2rem] mb-6 bg-gray-50">
                                            <img src={product.images?.[0]?.image_url || '/placeholder.png'} alt={product.product_name} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ${product.stock_quantity <= 0 ? 'grayscale opacity-40' : ''}`} />
                                            {product.stock_quantity <= 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-black text-white text-xs">OUT OF STOCK</div>}
                                        </div>
                                        <div className="px-1 flex flex-col flex-grow">
                                            <span className="text-[9px] font-black text-[#1b2559] bg-[#e8c4a0] px-3 py-1 rounded-lg w-fit uppercase mb-2">{product.category?.category_name || 'Recommended'}</span>
                                            <h3 className="text-lg font-bold mb-4 line-clamp-1">{product.product_name}</h3>
                                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                                                <span className="text-2xl font-black text-[#1b2559]">฿{product.unit_price}</span>
                                                <button onClick={() => addToCart(product)} disabled={product.stock_quantity <= 0} className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 ${product.stock_quantity > 0 ? 'bg-[#1b2559] text-white hover:bg-[#e8c4a0]' : 'bg-gray-100 text-gray-300'}`}><Plus size={20}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-100 shadow-inner mx-2">
                                <PackageX size={64} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">ไม่พบเมนูที่คุณต้องการ</h3>
                                <button onClick={() => {setSearchTerm(''); setSelectedCats([]); setPriceRange([]);}} className="mt-4 text-[#1b2559] font-bold border-b border-[#1b2559]">ล้างตัวกรองทั้งหมด</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer userData={userData} />

            {/* --- 🛒 Fixed Floating Cart Button (แก้ไขดีไซน์ใหม่ให้สมดุล) --- */}
            <div 
                onClick={() => navigate('/cart')} 
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] bg-[#1b2559] text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_15px_35px_rgba(27,37,89,0.4)] cursor-pointer hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white group"
            >
                <div className="relative">
                    <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
                    {cartCount > 0 && (
                        <span className="absolute -top-3.5 -right-3.5 bg-red-500 text-white text-[10px] font-black min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-lg">
                            {cartCount}
                        </span>
                    )}
                </div>
            </div>

            {/* --- 📱 Mobile Sidebar Overlay --- */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[200] lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-xs bg-[#fdfbf2] p-8 shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto">
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">ตัวกรองเมนู</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-white rounded-full shadow-sm active:bg-gray-100 transition-colors"><X size={20}/></button>
                        </div>
                        <FilterContent />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerProducts;