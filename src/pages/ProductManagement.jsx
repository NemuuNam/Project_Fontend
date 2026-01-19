import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, Edit3, X, Tag, ImageIcon, ArrowRightLeft, Loader2, Search, 
    Menu, FolderPlus, RefreshCw, ChevronLeft, ChevronRight, Sparkles, Package
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
    const navigate = useNavigate();
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
        } catch (err) { toast.error("ดึงข้อมูลไม่สำเร็จ"); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories`, { category_name: categoryName });
            if (res.success) { toast.success("เพิ่มหมวดหมู่สำเร็จ"); setCategoryName(''); fetchData(true); }
        } catch (err) { toast.error("ล้มเหลว"); }
    };

    const handleDeleteCategory = async (id) => {
        const confirm = await Swal.fire({ 
            title: 'ลบหมวดหมู่?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#000000',
            customClass: { popup: 'rounded-[2rem] font-["Kanit"]' } 
        });
        if (confirm.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories/${id}`);
                if (res.success) { toast.success("ลบสำเร็จ"); fetchData(true); }
            } catch (err) { toast.error("ไม่สามารถลบหมวดหมู่ที่มีสินค้าอยู่ได้"); }
        }
    };

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
            title: 'ลบสินค้า?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#000000', confirmButtonText: 'ลบข้อมูล',
            customClass: { popup: 'rounded-[2.5rem] font-["Kanit"]' }
        });
        if (result.isConfirmed) {
            try { const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`); if (res.success) { toast.success('ลบเรียบร้อย'); fetchData(true); } } catch (err) { toast.error('ไม่สามารถลบได้'); }
        }
    };

    if (loading && products.length === 0) return <div className="h-screen flex items-center justify-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-slate-800" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] font-['Kanit'] text-[#111827] overflow-x-hidden relative max-w-full">
            <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="products" />

            {/* 🚀 ขยายกว้างเต็มที่และลด Margin ตาม Sidebar ความกว้าง 280px */}
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[280px]'} p-4 md:p-5 lg:p-6 lg:pr-4 w-full relative z-10`}>
                <div className="mb-4 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl text-[#111827] border border-slate-300 shadow-sm"><Menu size={24} /></button>
                    <Header title="คลังสินค้า" isCollapsed={isCollapsed} />
                </div>

                {/* 🚀 pt-24 หลบ Header ทึบ */}
                <div className="pt-24"> 
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-2">
                        <StatCardSmall title="สินค้าทั้งหมด" value={products.length} />
                        <StatCardSmall title="สินค้าหมดคลัง" value={products.filter(p => p.stock_quantity <= 0).length} />
                        <StatCardSmall title="สต็อกใกล้หมด" value={products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD).length} />
                        <StatCardSmall title="มูลค่ารวม" value={`฿${products.reduce((acc, p) => acc + (p.unit_price * p.stock_quantity), 0).toLocaleString()}`} />
                    </div>

                    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex gap-2 p-1 bg-slate-50 rounded-full border border-slate-200">
                                    {[{ id: 'all', label: 'ทั้งหมด' }, { id: 'low', label: 'ใกล้หมด' }, { id: 'out', label: 'หมดคลัง' }].map(status => (
                                        <button key={status.id} onClick={() => setFilterStatus(status.id)} 
                                            className={`px-4 py-1.5 rounded-full text-base font-medium uppercase transition-all ${filterStatus === status.id ? 'bg-white border border-[#111827] text-[#111827] shadow-sm' : 'text-[#374151] hover:bg-white'}`}>
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button onClick={() => setModalType('category')} className="bg-white border border-[#111827] px-6 py-1.5 rounded-full font-medium text-lg uppercase text-[#111827] shadow-sm active:scale-95 italic">Categories</button>
                                    <button onClick={() => { setIsEditing(false); setModalType('product'); setFormData({ name: '', unitPrice: '', stock: '', category_id: '', image: null, description: '' }); setImagePreview(null); }} 
                                        className="bg-white border border-[#111827] text-[#111827] px-6 py-1.5 rounded-full font-medium text-lg uppercase shadow-sm active:scale-95 italic">+ Add Product</button>
                                </div>
                            </div>
                            
                            <div className="relative w-full lg:max-w-md">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#374151]" />
                                <input className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border border-slate-200 outline-none text-xl font-medium text-[#111827] focus:bg-white" placeholder="ค้นหาชื่อสินค้า..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[#000000] bg-slate-50 uppercase text- font-medium tracking-widest border-b border-slate-300">
                                        <th className="px-6 py-4">Product Info</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-right">Price</th>
                                        <th className="px-6 py-4 text-center">Stock</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paginatedProducts.map(p => (
                                        <tr key={p.product_id} className="hover:bg-slate-50/50 transition-colors">
                                            {/* 📉 py-4 เพื่อความกระชับ */}
                                            <td className="py-4 px-6 text-left">
                                                <div className="flex items-center gap-5">
                                                    <img src={p.images?.[0]?.image_url || '/placeholder.png'} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                                                    <div className="flex flex-col min-w-0 text-left">
                                                        <span className="text-2xl font-medium text-[#000000] uppercase truncate max-w-[250px] italic leading-tight">{p.product_name}</span>
                                                        <span className="text-base text-[#374151] truncate max-w-[200px]">{p.description || 'No description'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-base font-medium uppercase px-4 py-1 bg-white rounded-lg border border-slate-300 text-[#111827] whitespace-nowrap">{p.category?.category_name}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-2xl text-[#000000] italic">฿{Number(p.unit_price).toLocaleString()}</td>
                                            <td className="py-4 px-6 text-center">
                                                {/* 📉 ปุ่มสต็อกขอบบาง 1px */}
                                                <button onClick={() => { setCurrentId(p.product_id); setStockAdjustData({ new_stock: p.stock_quantity, reason: '' }); setModalType('stock'); }}
                                                    className={`mx-auto px-5 py-1 border rounded-xl text-2xl font-medium flex items-center justify-center gap-2 bg-white ${p.stock_quantity <= 0 ? 'text-rose-600 border-rose-200' : 'text-[#111827] border-slate-300'}`}>
                                                    {p.stock_quantity} <ArrowRightLeft size={16} className="text-slate-400" />
                                                </button>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setIsEditing(true); setCurrentId(p.product_id); setFormData({ name: p.product_name, unitPrice: p.unit_price, stock: p.stock_quantity, category_id: p.category_id, description: p.description || '' }); setImagePreview(p.images?.[0]?.image_url); setModalType('product'); }} className="p-2.5 bg-white border border-slate-300 rounded-xl text-[#374151] hover:text-[#000000] transition-colors shadow-sm"><Edit3 size={24} /></button>
                                                    {canDelete && <button onClick={() => handleDeleteProduct(p.product_id)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-rose-300 hover:text-rose-600 transition-colors shadow-sm"><Trash2 size={24} /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-6">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === 1 ? 'opacity-30' : ''}`}><ChevronLeft size={28} /></button>
                                <div className="flex items-center gap-2"><span className="text-xl font-medium text-[#374151] uppercase">Page</span><div className="bg-white border border-[#111827] text-[#111827] px-6 py-1 rounded-lg text-3xl font-medium italic shadow-sm">{currentPage}</div><span className="text-xl font-medium text-[#374151]">/ {totalPages}</span></div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-3 rounded-xl border border-slate-300 text-[#111827] ${currentPage === totalPages ? 'opacity-30' : ''}`}><ChevronRight size={28} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- Modals (Thin Border 1px) --- */}
            {modalType === 'category' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 border border-slate-300 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-8 text-left"><h2 className="text-2xl font-medium uppercase italic text-[#000000]">Categories Hub</h2><button onClick={() => setModalType(null)} className="p-2 bg-slate-50 text-[#111827] border border-slate-300 rounded-full"><X size={24} /></button></div>
                        <form onSubmit={handleAddCategory} className="flex gap-4 mb-8">
                            <input className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none text-xl font-medium text-[#000000]" value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="Category name..." required />
                            <button type="submit" className="px-8 bg-white border border-[#111827] text-[#111827] rounded-xl font-medium text-xl uppercase italic shadow-sm">+ Add</button>
                        </form>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {categories.map(c => (
                                <div key={c.category_id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-left"><span className="font-medium text-xl text-[#111827] uppercase italic">{c.category_name}</span><button onClick={() => handleDeleteCategory(c.category_id)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors"><Trash2 size={24} /></button></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {modalType === 'product' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl p-8 overflow-hidden border border-slate-300 flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-4 text-left leading-none"><div className="p-3 bg-slate-50 rounded-xl text-[#111827] border border-slate-200"><Package size={28} /></div><h2 className="text-2xl font-medium uppercase italic text-[#000000] tracking-tight">{isEditing ? 'Edit Product' : 'New Product'}</h2></div>
                            <button onClick={() => setModalType(null)} className="p-2 bg-slate-50 text-[#111827] border border-slate-300 rounded-full"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto pr-4 custom-scrollbar text-left">
                            <div className="space-y-6">
                                <div className="space-y-2"><label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">Name</label><input className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none text-xl text-[#000000]" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">Price (฿)</label><input type="number" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-2xl text-[#000000] italic" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} required /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">Stock</label><input type="number" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-2xl text-[#000000] italic" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required /></div>
                                </div>
                                <div className="space-y-2"><label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">Category</label><select className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xl font-medium text-[#000000] outline-none" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required><option value="">Select Category...</option>{categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}</select></div>
                                <div className="space-y-2"><label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">Description</label><textarea className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 h-32 resize-none text-xl font-medium text-[#000000] italic" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="border border-dashed border-slate-300 rounded-[2.5rem] p-8 flex flex-col items-center justify-center flex-1 bg-slate-50 relative">
                                    <div className="w-48 h-48 bg-white rounded-2xl shadow-sm mb-6 overflow-hidden flex items-center justify-center border border-slate-200">{imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <ImageIcon size={60} className="text-slate-300" />}</div>
                                    <label className="bg-white border border-[#111827] text-[#111827] px-8 py-3 rounded-full font-medium text-xl cursor-pointer shadow-sm uppercase italic active:scale-95">Upload Photo<input type="file" className="hidden" accept="image/*" onChange={handleImageChange} /></label>
                                </div>
                                <button type="submit" disabled={isUploading} className="w-full py-4 bg-white border border-[#111827] text-[#111827] rounded-full font-medium text-2xl uppercase tracking-widest shadow-md active:scale-95 italic">{isUploading ? 'SAVING...' : 'FINISH & SAVE'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalType === 'stock' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 border border-slate-300 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-8 text-left"><h2 className="text-2xl font-medium uppercase italic text-[#000000]">Stock Adjust</h2><button onClick={() => setModalType(null)} className="p-2 bg-slate-50 text-[#111827] border border-slate-300 rounded-full"><X size={20} /></button></div>
                        <form onSubmit={handleStockAdjustment} className="space-y-8 text-left">
                            <div className="space-y-2"><label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">New Quantity</label><input type="number" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-5xl text-[#000000] text-center" value={stockAdjustData.new_stock} onChange={e => setStockAdjustData({ ...stockAdjustData, new_stock: e.target.value })} required /></div>
                            <div className="space-y-2"><label className="text-[10px] font-medium uppercase ml-2 text-[#374151] tracking-widest">Reason</label><textarea className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xl font-medium h-24 italic text-[#000000]" value={stockAdjustData.reason} onChange={e => setStockAdjustData({ ...stockAdjustData, reason: e.target.value })} placeholder="e.g. Inbound shipment" required /></div>
                            <button type="submit" className="w-full py-5 bg-white border border-[#111827] text-[#111827] rounded-full font-medium text-2xl uppercase italic shadow-md active:scale-95">Update Stock</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// 💎 StatCard: ปรับระยะ p-6 และขอบบาง 1px
const StatCardSmall = ({ title, value }) => (
    <div className="bg-white p-6 rounded-[3rem] border border-slate-300 shadow-sm flex flex-col gap-1 text-left">
        <p className="text-xl font-medium text-[#374151] uppercase tracking-widest italic leading-none">{title}</p>
        <h2 className="text-5xl font-medium italic tracking-tighter text-[#000000] leading-none mt-2 truncate">{value || 0}</h2>
    </div>
);

export default ProductManagement;