import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Plus, Trash2, Edit3, X, Tag,
    ImageIcon, ArrowRightLeft, Loader2, Search, Menu, FolderPlus,
    AlertTriangle, Octagon, Leaf, Cookie, Smile, Sparkles, Activity,
    TrendingUp, DollarSign, CheckCircle2, ChevronLeft, ChevronRight
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
    // --- 🏗️ States & Logic (คงเดิม 100%) ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [modalType, setModalType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const LOW_STOCK_THRESHOLD = 10;

    const [formData, setFormData] = useState({
        name: '', unitPrice: '', stock: '', category_id: '', image: null, description: ''
    });

    const [categoryName, setCategoryName] = useState('');
    const [stockAdjustData, setStockAdjustData] = useState({ new_stock: '', reason: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const token = localStorage.getItem('token');
    let userLevel = 0;
    try { if (token) userLevel = Number(jwtDecode(token).role_level) || 0; } catch (err) { }
    const canDelete = userLevel === 1;

    const fetchData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                axiosInstance.get(API_ENDPOINTS.ADMIN.PRODUCTS),
                axiosInstance.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories`)
            ]);
            if (prodRes.success) setProducts(prodRes.data || []);
            if (catRes.success) setCategories(catRes.data || []);
        } catch (err) { toast.error("ดึงข้อมูลไม่สำเร็จ"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase());
            if (filterStatus === 'low') return matchesSearch && p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD;
            if (filterStatus === 'out') return matchesSearch && p.stock_quantity <= 0;
            return matchesSearch;
        });
    }, [products, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredProducts, currentPage]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            setFormData({ ...formData, image: compressedFile });
            setImagePreview(URL.createObjectURL(compressedFile));
        } catch (error) { toast.error("บีบอัดรูปภาพล้มเหลว"); }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('product_name', formData.name);
        data.append('unit_price', formData.unitPrice);
        data.append('stock_quantity', formData.stock);
        data.append('category_id', formData.category_id);
        data.append('description', formData.description);
        if (formData.image) data.append('image', formData.image);
        data.append('reason', isEditing ? 'แก้ไขข้อมูลสินค้าทั่วไป' : 'เพิ่มสินค้าใหม่');

        setIsUploading(true);
        const loadToast = toast.loading("กำลังประมวลผล...");
        try {
            const url = isEditing ? `${API_ENDPOINTS.ADMIN.PRODUCTS}/${currentId}` : API_ENDPOINTS.ADMIN.PRODUCTS;
            const res = await axiosInstance({ method: isEditing ? 'PATCH' : 'POST', url, data, headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.success) { toast.success('สำเร็จ!', { id: loadToast }); setModalType(null); fetchData(true); }
        } catch (err) { toast.error('ล้มเหลว!', { id: loadToast }); } finally { setIsUploading(false); }
    };

    const handleStockAdjustment = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading("กำลังปรับสต็อก...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${currentId}/stock`, {
                new_stock: Number(stockAdjustData.new_stock),
                reason: stockAdjustData.reason
            });
            if (res.success) { toast.success('ปรับปรุงสต็อกสำเร็จ', { id: loadToast }); setModalType(null); fetchData(true); }
        } catch (err) { toast.error('ล้มเหลว', { id: loadToast }); }
    };

    const handleDeleteProduct = async (id) => {
        const result = await Swal.fire({
            title: 'ลบสินค้า?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#2D241E', confirmButtonText: 'ลบข้อมูล',
            customClass: { popup: 'rounded-[2rem] font-["Kanit"] border-4 border-[#2D241E]' }
        });
        if (result.isConfirmed) {
            try { const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`); if (res.success) { toast.success('ลบเรียบร้อย'); fetchData(true); } } catch (err) { toast.error('ไม่สามารถลบได้'); }
        }
    };

    if (loading && products.length === 0) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative max-w-[1920px] mx-auto shadow-2xl">
            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="products" />

            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-8 lg:p-10 w-full relative z-10`}>
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl text-[#2D241E] shadow-sm border-2 border-[#2D241E] active:scale-90 transition-all"><Menu size={24} /></button>
                    <Header title="จัดการคลังสินค้า" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 px-2">
                    <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D241E] rounded-full shadow-md animate-bounce-slow">
                            <Sparkles size={14} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Inventory control</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">Products</h1>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <button onClick={() => setModalType('category')} className="flex-1 lg:flex-none border-2 border-[#2D241E] px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest text-[#2D241E] hover:bg-[#2D241E] hover:text-white transition-all shadow-sm">หมวดหมู่</button>
                        <button onClick={() => { setIsEditing(false); setModalType('product'); setFormData({ name: '', unitPrice: '', stock: '', category_id: '', image: null, description: '' }); setImagePreview(null); }} className="flex-1 lg:flex-none bg-[#2D241E] text-white px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all">+ เพิ่มสินค้า</button>
                    </div>
                </div>

                {/* Stat Grid (เข้มจัด) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 px-2">
                    <StatCardSmall title="สินค้าทั้งหมด" value={products.length} icon={<Package />} color="#2D241E" />
                    <StatCardSmall title="สินค้าหมด" value={products.filter(p => p.stock_quantity <= 0).length} icon={<Octagon />} color="#E53E3E" />
                    <StatCardSmall title="ใกล้หมด" value={products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD).length} icon={<AlertTriangle />} color="#D97706" />
                    <StatCardSmall title="มูลค่ารวม" value={`฿${products.reduce((acc, p) => acc + (p.unit_price * p.stock_quantity), 0).toLocaleString()}`} icon={<DollarSign />} color="#05CD99" />
                </div>

                {/* Table Section (เข้มจัด High Contrast) */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
                        <div className="flex gap-2 p-1 bg-slate-50 rounded-full border-2 border-slate-100">
                            {[{ id: 'all', label: 'ทั้งหมด' }, { id: 'low', label: 'ใกล้หมด' }, { id: 'out', label: 'หมดคลัง' }].map(status => (
                                <button key={status.id} onClick={() => setFilterStatus(status.id)} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all ${filterStatus === status.id ? 'bg-[#2D241E] text-white shadow-md' : 'text-[#2D241E] hover:bg-white transition-colors'}`}>{status.label}</button>
                            ))}
                        </div>
                        <div className="relative w-full lg:max-w-md">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2D241E]" strokeWidth={3} />
                            <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border-2 border-slate-100 outline-none font-black text-sm text-[#2D241E] focus:border-[#2D241E] transition-all shadow-inner" placeholder="ค้นหาสินค้า..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[#2D241E] uppercase text-xs font-black tracking-widest px-6">
                                    <th className="px-6 pb-2">สินค้า</th>
                                    <th className="px-6 pb-2">หมวดหมู่</th>
                                    <th className="px-6 pb-2 text-right">ราคา</th>
                                    <th className="px-6 pb-2 text-center">สต็อก</th>
                                    <th className="px-6 pb-2 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map(p => (
                                    <tr key={p.product_id} className="group hover:translate-x-1 transition-all">
                                        <td className="py-4 px-6 rounded-l-2xl bg-white border-y border-l border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <img src={p.images?.[0]?.image_url || '/placeholder.png'} className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 shadow-sm" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-black text-sm uppercase text-[#2D241E] truncate max-w-[200px]">{p.product_name}</span>
                                                    <span className="text-[10px] font-black text-[#2D241E] truncate max-w-[150px] italic">{p.description || 'ไม่มีรายละเอียด'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100">
                                            <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-50 rounded-lg border-2 border-[#2D241E] text-[#2D241E]">{p.category?.category_name}</span>
                                        </td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100 text-right font-black text-base text-[#2D241E] italic">฿{Number(p.unit_price).toLocaleString()}</td>
                                        <td className="py-4 px-6 bg-white border-y border-slate-100 text-center">
                                            <button onClick={() => { setCurrentId(p.product_id); setStockAdjustData({ new_stock: p.stock_quantity, reason: '' }); setModalType('stock'); }}
                                                className={`mx-auto px-4 py-1.5 border-4 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-sm ${p.stock_quantity <= 0 ? 'border-red-600 text-red-600' : 'border-[#2D241E] text-[#2D241E]'}`}>
                                                {p.stock_quantity} <ArrowRightLeft size={12} strokeWidth={3} />
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 rounded-r-2xl bg-white border-y border-r border-slate-100 text-right">
                                            <div className="flex justify-end gap-2 text-[#2D241E]">
                                                <button onClick={() => { setIsEditing(true); setCurrentId(p.product_id); setFormData({ name: p.product_name, unitPrice: p.unit_price, stock: p.stock_quantity, category_id: p.category_id, description: p.description || '' }); setImagePreview(p.images?.[0]?.image_url); setModalType('product'); }} className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-[#2D241E] hover:text-white transition-all shadow-sm"><Edit3 size={16} strokeWidth={3} /></button>
                                                {canDelete && <button onClick={() => handleDeleteProduct(p.product_id)} className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={16} strokeWidth={3} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-center items-center gap-4">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 shadow-md"><ChevronLeft size={20} strokeWidth={3} /></button>
                        <span className="text-sm font-black text-[#2D241E] italic">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border-2 border-[#2D241E] rounded-xl text-[#2D241E] disabled:opacity-30 shadow-md"><ChevronRight size={20} strokeWidth={3} /></button>
                    </div>
                </div>
            </main>

            {/* --- Modals (เข้มจัด High Contrast) --- */}
            {modalType === 'product' && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#2D241E]/30 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-8 overflow-hidden border-4 border-[#2D241E] flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase italic text-[#2D241E]">{isEditing ? 'Edit Product' : 'New Product'}</h2>
                            <button onClick={() => setModalType(null)} className="p-2 bg-slate-50 text-[#2D241E] rounded-full hover:text-red-500 transition-all border-2 border-[#2D241E]"><X size={20} strokeWidth={3} /></button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pr-4 custom-scrollbar">
                            <div className="space-y-4 text-left">
                                <div className="space-y-1"><label className="text-xs font-black uppercase ml-2 text-[#2D241E]">Name</label><input className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-[#2D241E] outline-none font-black text-[#2D241E]" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-black uppercase ml-2 text-[#2D241E]">Price</label><input type="number" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-[#2D241E] font-black italic text-[#2D241E]" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} required /></div>
                                    <div className="space-y-1"><label className="text-xs font-black uppercase ml-2 text-[#2D241E]">Stock</label><input type="number" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-[#2D241E] font-black italic text-[#2D241E]" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required /></div>
                                </div>
                                <div className="space-y-1"><label className="text-xs font-black uppercase ml-2 text-[#2D241E]">Category</label><select className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-[#2D241E] font-black text-[#2D241E]" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required><option value="">Select...</option>{categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}</select></div>
                                <div className="space-y-1"><label className="text-xs font-black uppercase ml-2 text-[#2D241E]">Description</label><textarea className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-[#2D241E] h-24 resize-none font-black text-[#2D241E] italic" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="border-4 border-dashed border-[#2D241E]/20 rounded-[2rem] p-6 flex flex-col items-center justify-center flex-1">
                                    <div className="w-40 h-40 bg-white rounded-2xl shadow-xl mb-4 overflow-hidden flex items-center justify-center border-4 border-slate-50">
                                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-[#2D241E]/10" />}
                                    </div>
                                    <label className="bg-[#2D241E] text-white px-8 py-3 rounded-full font-black text-xs cursor-pointer shadow-lg hover:bg-black transition-all uppercase tracking-widest">Upload Image<input type="file" className="hidden" accept="image/*" onChange={handleImageChange} /></label>
                                </div>
                                <button type="submit" disabled={isUploading} className="w-full py-5 bg-[#2D241E] text-white rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95">{isUploading ? 'SAVING...' : 'SAVE PRODUCT'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 StatCard: เข้มชัด 100%
const StatCardSmall = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border-2 border-[#2D241E] shadow-lg flex items-center justify-between hover:-translate-y-1 transition-all duration-300">
        <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] font-black text-[#2D241E] uppercase tracking-widest mb-1">{title}</p>
            <h2 className="text-[#2D241E] text-2xl font-black italic leading-none">{value || 0}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#2D241E] border-2 border-[#2D241E] shadow-inner group-hover:bg-[#2D241E] group-hover:text-white transition-all duration-500">
            {React.cloneElement(icon, { size: 20, strokeWidth: 3 })}
        </div>
    </div>
);

export default ProductManagement;