import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Plus, Filter, Loader2, ShoppingCart, 
    X, SlidersHorizontal, PackageX, Check, Eye
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';

import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';

import HeaderHome from '../../components/HeaderHome';
import Footer from '../../components/Footer';

const CustomerProducts = ({ userData }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get('search') || '';

    // --- ข้อมูลสินค้าและระบบ ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    // --- ระบบ Modal และรายละเอียด ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // --- ระบบกรองและค้นหา ---
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [selectedCats, setSelectedCats] = useState([]);
    const [priceRange, setPriceRange] = useState([]); 
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
        if (product.stock_quantity <= 0) return toast.error("สินค้าหมดชั่วคราว");
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.product_id === product.product_id);
        const mainImg = product.images?.[0]?.image_url || '/placeholder.png';

        if (existing) {
            if (existing.quantity + 1 > product.stock_quantity) {
                return Swal.fire({ 
                    icon: 'warning', 
                    title: 'สินค้าไม่พอ', 
                    text: `เราเหลือสินค้าเพียง ${product.stock_quantity} ชิ้น`,
                    confirmButtonColor: '#0f172a' 
                });
            }
            existing.quantity += 1;
        } else {
            cart.push({ product_id: product.product_id, product_name: product.product_name, price: product.unit_price, image_url: mainImg, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        window.dispatchEvent(new Event('storage'));
        toast.success(`เพิ่ม ${product.product_name} แล้ว`);
    };

    const openProductDetail = (product) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };

    const FilterContent = () => (
        <div className="space-y-12">
            <div>
                <h3 className="font-bold text-xl uppercase tracking-widest text-slate-400 mb-8">หมวดหมู่สินค้า</h3>
                <div className="space-y-6">
                    {categories.map(cat => (
                        <label key={cat.category_id} className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input 
                                    type="checkbox" 
                                    className="peer h-7 w-7 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 transition-all checked:bg-slate-900 checked:border-slate-900" 
                                    checked={selectedCats.includes(cat.category_id)} 
                                    onChange={(e) => e.target.checked ? setSelectedCats([...selectedCats, cat.category_id]) : setSelectedCats(selectedCats.filter(id => id !== cat.category_id))} 
                                />
                                <Check className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-2xl font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{cat.category_name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-bold text-xl uppercase tracking-widest text-slate-400 mb-8">ช่วงราคา</h3>
                <div className="space-y-6">
                    {[{ label: 'ไม่เกิน ฿100', val: '0-100' }, { label: '฿101 - ฿200', val: '101-200' }, { label: '฿201 - ฿500', val: '201-500' }, { label: '฿501 ขึ้นไป', val: '501+' }].map((range) => (
                        <label key={range.val} className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input 
                                    type="checkbox" 
                                    className="peer h-7 w-7 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 transition-all checked:bg-slate-900 checked:border-slate-900" 
                                    checked={priceRange.includes(range.val)} 
                                    onChange={(e) => e.target.checked ? setPriceRange([...priceRange, range.val]) : setPriceRange(priceRange.filter(r => r !== range.val))} 
                                />
                                <Check className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-2xl font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900" size={60} /></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['Kanit'] text-slate-900 relative">
            <Toaster position="bottom-right" />
            <HeaderHome userData={userData} />

            {/* --- Hero Section (ลดพื้นที่ และ ตัวอักษรใหญ่ชัด) --- */}
            <section className="bg-white pt-12 pb-8 px-6 border-b border-slate-100 shadow-sm">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight uppercase">
                        เลือกดู <span className="text-slate-400">เมนูอาหาร</span>
                    </h1>
                    <div className="max-w-3xl mx-auto relative group">
                        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-900 group-focus-within:text-slate-900 transition-colors" size={32} />
                        <input 
                            type="text" 
                            placeholder="พิมพ์ชื่อเมนูที่ต้องการ..." 
                            className="w-full pl-20 pr-10 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-2xl text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-300" 
                            value={searchTerm} 
                            onChange={(e) => {setSearchTerm(e.target.value); setSearchParams({ search: e.target.value });}} 
                        />
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 md:px-8 py-16">
                <div className="flex flex-col lg:flex-row gap-16">
                    
                    {/* Sidebar Desktop */}
                    <aside className="hidden lg:block lg:w-80 flex-shrink-0">
                        <div className="sticky top-32 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-md">
                            <h2 className="font-black text-3xl mb-10 flex items-center gap-4 text-slate-900">
                                <Filter size={28} /> ตัวกรอง
                            </h2>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Mobile Header */}
                        <div className="lg:hidden mb-10 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <button onClick={() => setIsFilterOpen(true)} className="text-slate-900 font-black flex items-center gap-3 text-2xl">
                                <SlidersHorizontal size={28} /> เลือกหมวดหมู่
                            </button>
                            <p className="font-bold text-slate-400 text-lg uppercase tracking-widest">{filteredProducts.length} รายการ</p>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
                                {filteredProducts.map((product) => (
                                    <div key={product.product_id} className="group bg-white rounded-[3rem] p-6 border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                                        {/* Image Section */}
                                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 bg-slate-50">
                                            <img 
                                                src={product.images?.[0]?.image_url || '/placeholder.png'} 
                                                alt={product.product_name} 
                                                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ${product.stock_quantity <= 0 ? 'grayscale opacity-50' : ''}`} 
                                            />
                                            
                                            {/* Stock Badge - ขยายให้อ่านง่ายขึ้น */}
                                            <div className="absolute top-5 left-5">
                                                <span className={`px-5 py-2.5 rounded-2xl text-sm font-black border uppercase tracking-widest shadow-lg ${
                                                    product.stock_quantity > 10 ? 'bg-white text-slate-900 border-slate-100' :
                                                    product.stock_quantity > 0 ? 'bg-amber-500 text-white border-amber-400' : 
                                                    'bg-red-500 text-white border-red-400'
                                                }`}>
                                                    {product.stock_quantity > 0 ? `คงเหลือ: ${product.stock_quantity}` : 'สินค้าหมด'}
                                                </span>
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                                                <button onClick={() => openProductDetail(product)} className="bg-white text-slate-900 p-5 rounded-2xl shadow-2xl hover:bg-slate-900 hover:text-white transition-all transform translate-y-3 group-hover:translate-y-0"><Eye size={32} /></button>
                                                <button onClick={() => addToCart(product)} disabled={product.stock_quantity <= 0} className="bg-white text-slate-900 p-5 rounded-2xl shadow-2xl hover:bg-slate-900 hover:text-white transition-all transform translate-y-3 group-hover:translate-y-0 delay-75"><ShoppingCart size={32} /></button>
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="px-2 flex flex-col flex-grow">
                                            <h3 className="text-3xl font-black text-slate-900 leading-tight mb-4 group-hover:text-slate-600 transition-colors cursor-pointer" onClick={() => openProductDetail(product)}>
                                                {product.product_name}
                                            </h3>
                                            <div className="mt-auto flex justify-between items-center pt-8 border-t border-slate-100">
                                                <span className="text-4xl font-black text-slate-900">฿{product.unit_price}</span>
                                                <button 
                                                    onClick={() => addToCart(product)} 
                                                    disabled={product.stock_quantity <= 0} 
                                                    className={`p-5 rounded-2xl transition-all shadow-md active:scale-95 ${product.stock_quantity > 0 ? 'bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white' : 'bg-slate-50 text-slate-200'}`}
                                                >
                                                    <Plus size={32}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner">
                                <PackageX size={100} className="mx-auto text-slate-200 mb-8" />
                                <h3 className="text-4xl font-black text-slate-300 uppercase tracking-tighter">ไม่พบเมนูอาหาร</h3>
                                <button onClick={() => {setSearchTerm(''); setSelectedCats([]); setPriceRange([]);}} className="mt-8 text-slate-900 text-2xl font-bold border-b-4 border-slate-900 pb-1">ล้างการค้นหาทั้งหมด</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- Product Detail Modal (High Contrast & Large Text) --- */}
            {isDetailModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsDetailModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[4rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20">
                        <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-8 right-8 z-10 p-4 bg-slate-100 text-slate-900 rounded-3xl transition-colors shadow-sm"><X size={36} /></button>
                        
                        <div className="md:w-1/2 bg-slate-50 min-h-[400px]">
                            <img src={selectedProduct.images?.[0]?.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt={selectedProduct.product_name} />
                        </div>

                        <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center space-y-12">
                            <div className="space-y-4">
                                <span className="text-lg font-bold text-slate-400 uppercase tracking-[0.3em] block">{selectedProduct.category?.category_name}</span>
                                <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">{selectedProduct.product_name}</h2>
                            </div>

                            <div className="flex items-center gap-10">
                                <span className="text-7xl font-black text-slate-900">฿{selectedProduct.unit_price}</span>
                                <span className={`px-6 py-3 rounded-2xl text-lg font-black border-2 uppercase tracking-widest ${selectedProduct.stock_quantity > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {selectedProduct.stock_quantity > 0 ? `คงเหลือ: ${selectedProduct.stock_quantity}` : 'สินค้าหมด'}
                                </span>
                            </div>

                            <div className="space-y-6">
                                <h4 className="font-black text-slate-400 text-xl uppercase tracking-widest">รายละเอียดเมนู:</h4>
                                <p className="text-slate-600 text-3xl leading-[1.6] font-light">
                                    {selectedProduct.description || "เมนูกุยช่ายสูตรดั้งเดิม แป้งบางนุ่ม ไส้แน่น คัดสรรวัตถุดิบอย่างดีเพื่อรสชาติที่อร่อยกลมกล่อม"}
                                </p>
                            </div>

                            <div className="pt-6">
                                <button 
                                    onClick={() => { addToCart(selectedProduct); setIsDetailModalOpen(false); }}
                                    disabled={selectedProduct.stock_quantity <= 0}
                                    className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-3xl shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-6 disabled:bg-slate-100 disabled:text-slate-300"
                                >
                                    <ShoppingCart size={40} /> เพิ่มลงตะกร้าสินค้า
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 🛒 Floating Cart Button (พื้นหลังขาว เส้นไอคอนดำหนา) --- */}
            <div 
                onClick={() => navigate('/cart')} 
                className="fixed bottom-10 right-10 z-[100] bg-white text-slate-900 w-24 h-24 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] border-2 border-slate-100 cursor-pointer hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
            >
                <div className="relative">
                    <ShoppingCart size={48} strokeWidth={2.5} />
                    {cartCount > 0 && (
                        <span className="absolute -top-5 -right-5 bg-red-600 text-white text-xl font-black w-12 h-12 flex items-center justify-center rounded-full border-4 border-white shadow-xl animate-bounce">
                            {cartCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Mobile Filter Sidebar */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[200] lg:hidden animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-[85%] bg-white p-12 shadow-2xl overflow-y-auto rounded-r-[4rem]">
                        <div className="flex justify-between items-center mb-12 border-b-2 border-slate-50 pb-8">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">ตัวกรอง</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="p-4 text-slate-400 hover:text-slate-900 transition-colors"><X size={40}/></button>
                        </div>
                        <FilterContent />
                    </div>
                </div>
            )}

            <Footer userData={userData} />
        </div>
    );
};

export default CustomerProducts;