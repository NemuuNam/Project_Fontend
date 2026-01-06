import React, { useEffect, useState, useCallback } from 'react';
import {
    Package, Plus, Trash2, Edit3, Upload, X, Tag,
    ImageIcon, Check, AlertCircle, Coins, 
    Loader2, Search, RefreshCw, Menu
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression'; 
import { jwtDecode } from 'jwt-decode'; 
import Swal from 'sweetalert2'; 

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalType, setModalType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: '', unitPrice: '', stock: '', category_id: '', image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [newCatName, setNewCatName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const token = localStorage.getItem('token');
    let userLevel = 0;
    try { if (token) { const decoded = jwtDecode(token); userLevel = decoded.role_level || 0; } } catch (err) {}
    const isAdminManager = [1, 2].includes(userLevel);

    const fetchData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                axiosInstance.get(API_ENDPOINTS.ADMIN.PRODUCTS),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories`)
            ]);
            if (prodRes.success) setProducts(prodRes.data || []);
            if (catRes.success) setCategories(catRes.data || []);
        } catch (err) { toast.error("ดึงข้อมูลไม่สำเร็จ!"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getStockStatus = (qty) => {
        if (qty <= 0) return { label: 'หมดสต็อก', color: 'bg-rose-50 text-rose-500 border-rose-100' };
        if (qty <= 10) return { label: 'ใกล้หมด', color: 'bg-amber-50 text-amber-600 border-amber-100' };
        return { label: 'พร้อมขาย', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const finalFile = new File([compressedFile], file.name, { type: file.type });
            setFormData(prev => ({ ...prev, image: finalFile }));
            setImagePreview(URL.createObjectURL(finalFile)); 
        } catch (error) { toast.error('ประมวลผลรูปล้มเหลว'); }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('product_name', formData.name);
        data.append('unit_price', formData.unitPrice);
        data.append('stock_quantity', formData.stock);
        data.append('category_id', formData.category_id);
        if (formData.image) data.append('image', formData.image);

        setIsUploading(true);
        const loadToast = toast.loading(isEditing ? "กำลังอัปเดต..." : "กำลังเพิ่มสินค้า...");
        try {
            const url = isEditing ? `${API_ENDPOINTS.ADMIN.PRODUCTS}/${currentId}` : API_ENDPOINTS.ADMIN.PRODUCTS;
            const res = await axiosInstance({
                method: isEditing ? 'PATCH' : 'POST',
                url: url,
                data: data,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.success) {
                toast.success('บันทึกเรียบร้อย', { id: loadToast });
                setModalType(null);
                fetchData(true);
            }
        } catch (err) { toast.error('บันทึกล้มเหลว!', { id: loadToast }); } 
        finally { setIsUploading(false); }
    };

    const handleDeleteProduct = async (id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
        });
        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
                if (res.success) { toast.success('ลบสินค้าสำเร็จ'); fetchData(true); }
            } catch (err) { toast.error('ลบไม่สำเร็จ!'); }
        }
    };

    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: products.length,
        low: products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length,
        out: products.filter(p => p.stock_quantity <= 0).length,
        val: products.reduce((acc, p) => acc + (p.unit_price * p.stock_quantity), 0)
    };

    if (loading && products.length === 0) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-900" size={65} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-slate-900 overflow-x-hidden">
            <Toaster position="top-right" />
            <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                isMobileOpen={isSidebarOpen} 
                setIsMobileOpen={setIsSidebarOpen} 
                activePage="products" 
            />

            <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[300px]'} p-4 md:p-8 lg:p-10 w-full`}>
                
                {/* Mobile Header Toggle */}
                <div className="mb-6 md:mb-10 flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-600"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex-1">
                        <Header title="Products Management" />
                    </div>
                </div>

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                    <div className="flex-1">
                        <p className="text-xs md:text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">INVENTORY STOCK</p>
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">Products</h1>
                    </div>
                    <button onClick={() => fetchData()} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm hover:border-slate-900 transition-all text-slate-400 hover:text-slate-900">
                        <RefreshCw size={24} />
                    </button>
                </div>

                {/* Stats Grid - Responsive Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    <StatCardWhite title="สินค้าทั้งหมด" value={stats.total} icon={<Package size={24} />} color="#4318ff" />
                    <StatCardWhite title="ใกล้หมด" value={stats.low} icon={<AlertCircle size={24} />} color="#ea580c" />
                    <StatCardWhite title="หมดสต็อก" value={stats.out} icon={<X size={24} />} color="#ef4444" />
                    <StatCardWhite title="มูลค่ารวม" value={`฿${stats.val.toLocaleString()}`} icon={<Coins size={24} />} color="#10b981" />
                </div>

                {/* Main Content Area */}
                <div className="bg-white p-5 md:p-8 lg:p-10 rounded-[30px] md:rounded-[45px] border border-slate-100 shadow-xl shadow-slate-50/50">
                    
                    {/* Search and Buttons Bar */}
                    <div className="flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mb-8 md:mb-12">
                        <div className="relative w-full max-w-2xl">
                            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                className="w-full pl-14 pr-6 py-4 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg focus:ring-2 focus:ring-slate-100 transition-all" 
                                placeholder="ค้นหาชื่อสินค้า หรือหมวดหมู่..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="flex gap-3 md:gap-4 w-full xl:w-auto">
                            <button onClick={() => setModalType('category')} className="flex-1 xl:flex-none px-4 md:px-8 py-3 md:py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 hover:border-slate-900 transition-all uppercase text-[10px] md:text-xs tracking-widest">
                                <Tag size={16}/> <span className="hidden sm:inline">Categories</span>
                            </button>
                            <button 
                                onClick={() => { setIsEditing(false); setModalType('product'); setFormData({ name: '', unitPrice: '', stock: '', category_id: '', image: null }); setImagePreview(null); }} 
                                className="flex-1 xl:flex-none px-4 md:px-8 py-3 md:py-5 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase text-[10px] md:text-xs tracking-widest"
                            >
                                <Plus size={16}/> Add Product
                            </button>
                        </div>
                    </div>

                    {/* Table with Responsive Scroll */}
                    <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
                            <thead>
                                <tr className="text-slate-400 uppercase text-[10px] md:text-xs font-black tracking-widest text-center">
                                    <th className="px-4 pb-4 text-left">Product</th>
                                    <th className="px-4 pb-4">Category</th>
                                    <th className="px-4 pb-4 text-right">Price</th>
                                    <th className="px-4 pb-4">Stock</th>
                                    <th className="px-4 pb-4">Status</th>
                                    <th className="px-4 pb-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(p => {
                                    const stockStatus = getStockStatus(p.stock_quantity);
                                    const imageUrl = p.Product_Images?.[0]?.image_url || p.images?.[0]?.image_url;
                                    return (
                                        <tr key={p.product_id} className="group hover:bg-slate-50 transition-all text-center">
                                            <td className="px-4 py-4 md:py-6 rounded-l-2xl md:rounded-l-3xl border-y border-l border-slate-50 group-hover:border-slate-100 text-left">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border border-slate-50 shadow-sm bg-slate-50 shrink-0">
                                                        {imageUrl ? (
                                                            <img src={imageUrl} className="w-full h-full object-cover" alt="prod" />
                                                        ) : <ImageIcon className="w-full h-full p-3 text-slate-200" />}
                                                    </div>
                                                    <span className="font-black text-base md:text-xl text-slate-900 truncate max-w-[150px] md:max-w-[200px]">{p.product_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 md:py-6 border-y border-slate-50 group-hover:border-slate-100">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg font-black text-[9px] md:text-[10px] uppercase tracking-wider whitespace-nowrap">{p.category?.category_name}</span>
                                            </td>
                                            <td className="px-4 py-4 md:py-6 text-right font-black text-lg md:text-2xl text-slate-900 border-y border-slate-50 group-hover:border-slate-100 whitespace-nowrap">฿{p.unit_price.toLocaleString()}</td>
                                            <td className="px-4 py-4 md:py-6 font-black text-lg md:text-2xl text-slate-500 border-y border-slate-50 group-hover:border-slate-100">{p.stock_quantity}</td>
                                            <td className="px-4 py-4 md:py-6 border-y border-slate-50 group-hover:border-slate-100">
                                                <span className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase border whitespace-nowrap ${stockStatus.color}`}>
                                                    {stockStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 md:py-6 rounded-r-2xl md:rounded-r-3xl border-y border-r border-slate-50 group-hover:border-slate-100">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => { setIsEditing(true); setCurrentId(p.product_id); setFormData({ name: p.product_name, unitPrice: p.unit_price, stock: p.stock_quantity, category_id: p.category_id }); setImagePreview(imageUrl); setModalType('product'); }} 
                                                        className="p-2 md:p-3 text-blue-600 bg-white border border-slate-100 rounded-lg md:rounded-xl hover:border-blue-600 transition-all shadow-sm"
                                                    >
                                                        <Edit3 size={18}/>
                                                    </button>
                                                    {isAdminManager && (
                                                        <button onClick={() => handleDeleteProduct(p.product_id)} className="p-2 md:p-3 text-rose-400 bg-white border border-slate-100 rounded-lg md:rounded-xl hover:border-rose-500 hover:text-rose-500 transition-all shadow-sm">
                                                            <Trash2 size={18}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* ✅ Optimized Modal - Responsive for All Screens */}
            {modalType && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-slate-900/40 backdrop-blur-md" onClick={() => setModalType(null)}>
                    <div className={`bg-white w-full ${modalType === 'product' ? 'max-w-5xl' : 'max-w-2xl'} rounded-[30px] md:rounded-[45px] shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-300`} onClick={e => e.stopPropagation()}>
                        
                        <div className="p-6 md:p-10 flex justify-between items-center border-b border-slate-50">
                            <h2 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
                                {modalType === 'product' ? (isEditing ? 'Edit Item' : 'New Item') : 'Categories'}
                            </h2>
                            <button onClick={() => setModalType(null)} className="p-2 md:p-4 bg-slate-50 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all text-slate-400"><X size={20}/></button>
                        </div>

                        <div className="overflow-y-auto p-6 md:p-10 flex-1 hide-scrollbar">
                            {modalType === 'product' ? (
                                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                                    <div className="space-y-4 md:space-y-6 text-left">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Product Name</label>
                                            <input className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Category</label>
                                            <select className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg appearance-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Price (฿)</label>
                                                <input type="number" className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Stock</label>
                                                <input type="number" className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-base md:text-lg" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photo Upload Area */}
                                    <div className="flex flex-col items-center justify-center bg-white rounded-[25px] md:rounded-[35px] p-6 md:p-8 border-2 border-slate-50">
                                        <div className="w-full aspect-square max-w-[200px] md:max-w-[280px] bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-100 flex items-center justify-center">
                                            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="prev" /> : <ImageIcon size={40} className="text-slate-200 md:w-16 md:h-16" />}
                                        </div>
                                        <label className="w-full sm:w-auto px-6 md:px-10 py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black cursor-pointer hover:bg-slate-800 transition-all text-[10px] md:text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                                            <Upload size={16}/> Upload Photo
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isUploading} 
                                        className="lg:col-span-2 py-4 md:py-6 bg-blue-600 text-white rounded-xl md:rounded-[25px] font-black text-base md:text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex justify-center items-center gap-4 uppercase"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin" /> : <Check />} 
                                        {isEditing ? 'Save Changes' : 'Confirm Add'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6 md:space-y-8">
                                    <div className="flex gap-3">
                                        <input 
                                            className="flex-1 p-4 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm md:text-lg" 
                                            placeholder="New Category Name..." 
                                            value={newCatName} 
                                            onChange={e => setNewCatName(e.target.value)} 
                                        />
                                        <button className="px-5 md:px-8 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black hover:bg-black transition-all uppercase text-[10px] md:text-xs">Add</button>
                                    </div>
                                    <div className="space-y-3 max-h-[300px] md:max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {categories.map(c => (
                                            <div key={c.category_id} className="flex justify-between items-center p-4 md:p-5 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm hover:border-slate-300 transition-all">
                                                <span className="font-black text-sm md:text-lg text-slate-700 uppercase tracking-widest">{c.category_name}</span>
                                                <button className="p-2 md:p-3 text-rose-500 hover:bg-rose-50 rounded-lg md:rounded-xl transition-all"><Trash2 size={18}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Adjusted StatCard component for Product Management
const StatCardWhite = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 md:p-8 rounded-[25px] md:rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-1 duration-300">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-3 truncate">{title}</p>
            <h2 className="text-slate-900 text-2xl md:text-4xl lg:text-5xl font-black italic tracking-tighter leading-none truncate">{typeof value === 'number' ? value.toLocaleString() : value}</h2>
        </div>
        <div style={{ background: `${color}08`, color: color }} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[22px] flex items-center justify-center border-2 md:border-4 border-white shadow-lg shadow-slate-50 shrink-0 ml-2">
            {icon}
        </div>
    </div>
);

export default ProductManagement;