import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Plus, Trash2, Edit3, X, Tag,
    ImageIcon, Check, ArrowRightLeft, 
    Loader2, Search, Menu, FolderPlus,
    AlertTriangle, Info, Octagon, AlignLeft,
    Leaf, Cookie, Smile, Sparkles, ClipboardList, Undo2,
    CheckCircle2, ChevronLeft, ChevronRight
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
    // --- States สำหรับข้อมูล (Logic คงเดิม 100%) ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [modalType, setModalType] = useState(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    // --- ✨ Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const LOW_STOCK_THRESHOLD = 10;

    const [formData, setFormData] = useState({ 
        name: '', 
        unitPrice: '', 
        stock: '', 
        category_id: '', 
        image: null,
        description: '' 
    });
    
    const [categoryName, setCategoryName] = useState('');
    const [stockAdjustData, setStockAdjustData] = useState({ new_stock: '', reason: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const token = localStorage.getItem('token');
    let userLevel = 0;
    try { if (token) { const decoded = jwtDecode(token); userLevel = Number(decoded.role_level) || 0; } } catch (err) {}
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
        } catch (err) { 
            toast.error("ดึงข้อมูลไม่สำเร็จ"); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const outOfStockCount = products.filter(p => p.stock_quantity <= 0).length;
    const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD).length;

    // --- 🔍 Filtering Logic ---
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                p.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase());
            if (filterStatus === 'low') return matchesSearch && p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD;
            if (filterStatus === 'out') return matchesSearch && p.stock_quantity <= 0;
            return matchesSearch;
        });
    }, [products, searchTerm, filterStatus]);

    // --- 📑 Pagination Logic ---
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage]);

    // รีเซ็ตไปหน้า 1 เมื่อมีการค้นหาหรือกรอง
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            setFormData({ ...formData, image: compressedFile });
            setImagePreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            toast.error("บีบอัดรูปภาพล้มเหลว");
        }
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
        data.append('reason', isEditing ? 'แก้ไขข้อมูลสินค้าทั่วไป' : 'เพิ่มสินค้าใหม่เข้าสู่ระบบ');

        setIsUploading(true);
        const loadToast = toast.loading("กำลังประมวลผลข้อมูล...");
        try {
            const url = isEditing ? `${API_ENDPOINTS.ADMIN.PRODUCTS}/${currentId}` : API_ENDPOINTS.ADMIN.PRODUCTS;
            const res = await axiosInstance({
                method: isEditing ? 'PATCH' : 'POST',
                url: url,
                data: data,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.success) {
                toast.success('บันทึกข้อมูลเรียบร้อย', { id: loadToast });
                setModalType(null);
                fetchData(true);
            }
        } catch (err) { 
            toast.error('เกิดข้อผิดพลาดในการบันทึก!', { id: loadToast }); 
        } finally { 
            setIsUploading(false); 
        }
    };

    const handleStockAdjustment = async (e) => {
        e.preventDefault();
        if (!stockAdjustData.reason) return toast.error("กรุณาระบุเหตุผลการปรับสต็อก");
        const loadToast = toast.loading("กำลังอัปเดตสต็อก...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${currentId}/stock`, {
                new_stock: Number(stockAdjustData.new_stock),
                reason: stockAdjustData.reason
            });
            if (res.success) {
                toast.success('อัปเดตสต็อกเรียบร้อย', { id: loadToast });
                setModalType(null);
                fetchData(true);
            }
        } catch (err) { toast.error('ไม่สามารถอัปเดตได้', { id: loadToast }); }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories`, { category_name: categoryName });
            if (res.success) {
                toast.success("เพิ่มหมวดหมู่สำเร็จ");
                setCategoryName('');
                fetchData(true);
            }
        } catch (err) { toast.error("ชื่อหมวดหมู่ซ้ำหรือเกิดข้อผิดพลาด"); }
    };

    const handleDeleteCategory = async (id) => {
        const result = await Swal.fire({ 
            title: 'ลบหมวดหมู่?', 
            text: "หากมีสินค้าในหมวดหมู่นี้ จะไม่สามารถลบได้", 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#2D241E', 
            confirmButtonText: 'ยืนยันลบ',
            cancelButtonText: 'ยกเลิก',
            background: '#ffffff',
            color: '#2D241E',
            customClass: { popup: 'rounded-[3rem] font-["Kanit"]' }
        });
        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/categories/${id}`);
                if (res.success) { toast.success("ลบสำเร็จ"); fetchData(true); }
            } catch (err) { toast.error(err.response?.data?.message || "ไม่สามารถลบได้"); }
        }
    };

    const handleDeleteProduct = async (id) => {
        const result = await Swal.fire({ 
            title: 'ยืนยันการลบสินค้า?', 
            text: "ข้อมูลจะหายไปจากหน้าร้านทันที", 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#2D241E', 
            confirmButtonText: 'ลบสินค้า',
            cancelButtonText: 'ยกเลิก',
            background: '#ffffff',
            color: '#2D241E',
            customClass: { popup: 'rounded-[3rem] font-["Kanit"]' }
        });
        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
                if (res.success) { toast.success('ลบสินค้าสำเร็จ'); fetchData(true); }
            } catch (err) { toast.error('ลบไม่สำเร็จ! สินค้าอาจมีการขายไปแล้ว'); }
        }
    };

    if (loading && products.length === 0) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative selection:bg-[#F3E9DC]">
            
            {/* ☁️ Global Cozy Patterns จางๆ (Opacity 0.02) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 text-[#2D241E] opacity-[0.02]" size={200} />
                <Cookie className="absolute bottom-[10%] right-[10%] -rotate-12 text-[#2D241E] opacity-[0.02]" size={180} />
                <Smile className="absolute top-[40%] right-[40%] text-[#2D241E] opacity-[0.015]" size={300} />
            </div>

            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="products" />

            <main className={`flex-1 transition-all duration-500 ${isCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[280px]'} p-4 md:p-10 lg:p-14 w-full relative z-10 text-left`}>
                
                <div className="mb-12 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-2xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-90 transition-all"><Menu size={24} /></button>
                    <Header title="จัดการสินค้าและคลัง" />
                </div>

                {/* 🏷️ Page Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 px-2">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 mb-2 animate-bounce-slow">
                            <Sparkles size={14} className="text-[#D97706]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B7E66]">ศูนย์ควบคุมคลังสินค้า</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">
                            Products<span className="opacity-10">.</span>
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-4 relative z-20 w-full md:w-auto">
                        <button onClick={() => setModalType('category')} className="flex-1 md:flex-none bg-white text-[#2D241E] border border-slate-200 px-6 py-4 rounded-full font-black text-[15px] uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95">
                            <FolderPlus size={16} className="text-[#D97706]"/> หมวดหมู่สินค้า
                        </button>
                        <button onClick={() => { setIsEditing(false); setModalType('product'); setFormData({ name: '', unitPrice: '', stock: '', category_id: '', image: null, description: '' }); setImagePreview(null); }} className="flex-1 md:flex-none bg-[#2D241E] text-white px-8 py-4 rounded-full font-black text-[15px] uppercase tracking-widest shadow-xl hover:bg-black hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3">
                            <Plus size={16}/> เพิ่มสินค้าใหม่
                        </button>
                    </div>
                </div>

                {/* ⚠️ Stock Alerts (Pearl Style) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 relative z-10 px-2">
                    {outOfStockCount > 0 && (
                        <div className="bg-white border border-red-50 p-8 rounded-[3rem] shadow-sm flex items-center gap-6 group animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="bg-red-500 text-white p-4 rounded-3xl shadow-lg shadow-red-100 group-hover:rotate-12 transition-transform"><Octagon size={28} /></div>
                            <div>
                                <h4 className="font-black text-[#2D241E] text-xl uppercase tracking-tighter leading-none mb-1">สินค้าหมดแล้ว</h4>
                                <p className="text-[#8B7E66] text-xs font-light italic">พบ {outOfStockCount} รายการที่ต้องเติมสินค้า</p>
                            </div>
                        </div>
                    )}
                    {lowStockCount > 0 && (
                        <div className="bg-white border border-amber-50 p-8 rounded-[3rem] shadow-sm flex items-center gap-6 group animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="bg-amber-500 text-white p-4 rounded-3xl shadow-lg shadow-amber-100 group-hover:-rotate-12 transition-transform"><AlertTriangle size={28} /></div>
                            <div>
                                <h4 className="font-black text-[#2D241E] text-xl uppercase tracking-tighter leading-none mb-1">สินค้าใกล้หมด</h4>
                                <p className="text-[#8B7E66] text-xs font-light italic">พบ {lowStockCount} รายการที่สต็อกต่ำกว่า {LOW_STOCK_THRESHOLD} ชิ้น</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 📦 Main Grid Table Area (Pearl White) */}
                <div className="bg-white p-6 md:p-12 rounded-[3.5rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-10 mb-14 relative z-10">
                        <div className="space-y-3 w-full lg:w-auto">
                            <h3 className="text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-4">
                                <Package className="text-[#D97706]" /> Inventory Hub
                            </h3>
                            <div className="flex gap-2 p-1 bg-slate-50/50 rounded-full border border-slate-100 w-fit">
                                {[
                                    {id: 'all', label: 'ทั้งหมด'},
                                    {id: 'low', label: 'ใกล้หมด'},
                                    {id: 'out', label: 'หมดคลัง'}
                                ].map(status => (
                                    <button key={status.id} onClick={() => setFilterStatus(status.id)} className={`px-5 py-1.5 rounded-full text-[15px] font-black uppercase tracking-widest transition-all ${filterStatus === status.id ? 'bg-white text-[#2D241E] shadow-sm' : 'text-[#C2B8A3] hover:text-[#2D241E]'}`}>{status.label}</button>
                                ))}
                            </div>
                        </div>
                        <div className="relative w-full max-w-xl group">
                            <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C2B8A3] group-focus-within:text-[#2D241E] transition-colors" />
                            <input className="w-full pl-16 pr-8 py-5 rounded-full bg-slate-50/50 border border-transparent focus:bg-white focus:border-slate-200 outline-none font-bold text-lg transition-all shadow-inner placeholder:text-[#C2B8A3]" placeholder="ค้นหาชื่อสินค้า หรือ หมวดหมู่..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="overflow-x-auto relative z-10 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[#C2B8A3] uppercase text-[15px] font-black tracking-[0.3em] px-8">
                                    <th className="px-10 pb-2">ข้อมูลสินค้า</th>
                                    <th className="px-10 pb-2">หมวดหมู่</th>
                                    <th className="px-10 pb-2 text-right">ราคา/หน่วย</th>
                                    <th className="px-10 pb-2 text-center">คงเหลือ</th>
                                    <th className="px-10 pb-2 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-0">
                                {paginatedProducts.map(p => {
                                    const isOut = p.stock_quantity <= 0;
                                    const isLow = p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD;
                                    return (
                                        <tr key={p.product_id} className="group/row hover:translate-x-1 transition-all">
                                            <td className="py-6 px-10 rounded-l-[2.5rem] md:rounded-l-[3rem] bg-slate-50/30 group-hover/row:bg-slate-50 border-y border-l border-white">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-sm shrink-0 relative bg-white">
                                                        <img src={p.images?.[0]?.image_url || '/placeholder.png'} className={`w-full h-full object-cover transition-transform duration-1000 group-hover/row:scale-110 ${isOut ? 'grayscale opacity-30' : ''}`} alt="" />
                                                        {isOut && <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center text-[10px] text-red-600 font-black uppercase">Nil</div>}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-black text-xl text-[#2D241E] uppercase tracking-tighter truncate leading-none mb-2">{p.product_name}</span>
                                                        <span className="text-[15px] text-[#8B7E66] font-light italic truncate max-w-[200px]">{p.description || 'ไม่มีบันทึกข้อมูลรายละเอียด'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-10 bg-slate-50/30 group-hover/row:bg-slate-50 border-y border-white">
                                                <span className="px-4 py-1.5 bg-white border border-slate-100 text-[#8B7E66] rounded-xl font-black text-[15px] uppercase tracking-widest shadow-sm">{p.category?.category_name}</span>
                                            </td>
                                            <td className="py-6 px-10 bg-slate-50/30 group-hover/row:bg-slate-50 border-y border-white text-right font-black text-2xl text-[#2D241E] italic leading-none">฿{Number(p.unit_price).toLocaleString()}</td>
                                            <td className="py-6 px-10 bg-slate-50/30 group-hover/row:bg-slate-50 border-y border-white text-center">
                                                <button onClick={() => { setCurrentId(p.product_id); setStockAdjustData({ new_stock: p.stock_quantity, reason: '' }); setModalType('stock'); }} 
                                                        className={`group/btn flex items-center gap-3 mx-auto px-5 py-2.5 bg-white border-2 rounded-2xl transition-all shadow-sm ${isOut ? 'border-red-100 text-red-500' : isLow ? 'border-amber-100 text-amber-500' : 'border-white text-[#2D241E] hover:border-[#2D241E]/10'}`}>
                                                    <span className="font-black text-2xl leading-none">{p.stock_quantity}</span>
                                                    <ArrowRightLeft size={16} className="opacity-20 group-hover/btn:opacity-100 transition-opacity" />
                                                </button>
                                            </td>
                                            <td className="py-6 px-10 rounded-r-[2.5rem] md:rounded-r-[3rem] bg-slate-50/30 group-hover/row:bg-slate-50 border-y border-r border-white text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setIsEditing(true); setCurrentId(p.product_id); setFormData({ name: p.product_name, unitPrice: p.unit_price, stock: p.stock_quantity, category_id: p.category_id, description: p.description || '' }); setImagePreview(p.images?.[0]?.image_url); setModalType('product'); }} className="p-3 bg-white text-[#C2B8A3] border border-slate-100 rounded-xl hover:text-[#2D241E] transition-all active:scale-90"><Edit3 size={18}/></button>
                                                    {canDelete && <button onClick={() => handleDeleteProduct(p.product_id)} className="p-3 bg-white text-[#C2B8A3] border border-slate-100 rounded-xl hover:text-red-500 transition-all active:scale-90"><Trash2 size={18}/></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ✨ Pagination Controls (Only White Style) */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-4 relative z-10 pb-4">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-3 bg-white border border-slate-100 rounded-2xl text-[#2D241E] disabled:opacity-20 hover:shadow-lg transition-all active:scale-90 shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100 shadow-inner">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // แสดงเฉพาะเลขที่อยู่ใกล้หน้าปัจจุบัน
                                    if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === pageNum ? 'bg-[#2D241E] text-white shadow-xl scale-110' : 'text-[#C2B8A3] hover:text-[#2D241E]'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-3 bg-white border border-slate-100 rounded-2xl text-[#2D241E] disabled:opacity-20 hover:shadow-lg transition-all active:scale-90 shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* --- Modals (Pearl White) --- */}

            {/* Modal Product */}
            {modalType === 'product' && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 lg:p-10 bg-[#2D241E]/10 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-6xl rounded-[3rem] md:rounded-[4rem] shadow-2xl p-8 lg:p-16 overflow-hidden max-h-[95vh] flex flex-col relative animate-in zoom-in-95 border border-white">
                        <button onClick={() => setModalType(null)} className="absolute top-8 right-8 md:top-12 md:right-12 p-3 bg-slate-50 text-[#C2B8A3] hover:text-red-500 rounded-full transition-all border border-white shadow-sm"><X size={24}/></button>
                        
                        <div className="mb-10 text-left">
                             <p className="text-[#D97706] font-bold text-[15px] uppercase tracking-[0.5em] mb-2 italic">สร้างข้อมูลสินค้า</p>
                             <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter text-[#2D241E] italic">จัดการ <span className="opacity-20 font-light">ข้อมูลสินค้า</span></h2>
                        </div>
                        
                        <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 overflow-y-auto pr-2 custom-scrollbar text-left">
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-widest ml-4">ชื่อเรียกสินค้า</label>
                                    <input className="w-full p-6 rounded-full bg-slate-50/50 border border-slate-100 outline-none font-bold text-xl focus:bg-white focus:border-[#2D241E]/10 transition-all shadow-inner text-[#2D241E]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="ระบุชื่อสินค้า..." />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-widest ml-4">ราคาสินค้า (฿)</label>
                                        <input type="number" className="w-full p-6 rounded-full bg-slate-50/50 border border-slate-100 outline-none font-black text-2xl shadow-inner text-[#D97706] focus:bg-white transition-all italic" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-widest ml-4">สต็อกเริ่มต้น</label>
                                        <input type="number" className="w-full p-6 rounded-full bg-slate-50/50 border border-slate-100 outline-none font-black text-2xl shadow-inner text-[#2D241E] focus:bg-white transition-all italic" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-widest ml-4">หมวดหมู่สินค้า</label>
                                    <select className="w-full p-6 rounded-full bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg appearance-none focus:bg-white transition-all shadow-inner text-[#2D241E]" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                        <option value="">เลือกหมวดหมู่สินค้า</option>
                                        {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-widest ml-4">รายละเอียดสินค้า</label>
                                    <textarea className="w-full p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 outline-none font-medium text-lg h-40 resize-none transition-all shadow-inner focus:bg-white text-[#2D241E] italic" placeholder="ข้อมูลวัตถุดิบ หรือ ข้อมูลอื่นๆ..." value={formData.description} maxLength={255} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-10">
                                <div className="flex flex-col items-center justify-center bg-slate-50/30 rounded-[3rem] border-4 border-dashed border-slate-50 p-8 flex-1 min-h-[350px] relative overflow-hidden group/upload">
                                    <Sparkles className="absolute top-10 right-10 text-[#2D241E] opacity-[0.02]" size={150} />
                                    <div className="w-full aspect-square max-w-[280px] bg-white rounded-[3rem] overflow-hidden mb-8 shadow-sm flex items-center justify-center border-[8px] border-white relative z-10">
                                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={60} className="text-[#2D241E]/10" />}
                                    </div>
                                    <label className="px-10 py-4 bg-white text-[#2D241E] border border-slate-200 rounded-full font-black uppercase text-[10px] tracking-[0.4em] cursor-pointer hover:shadow-lg transition-all active:scale-95 relative z-10">
                                        เลือกรูปภาพ
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <button type="submit" disabled={isUploading} className="py-6 bg-[#2D241E] text-white rounded-full font-black text-sm shadow-xl hover:bg-black transition-all flex justify-center items-center gap-4 active:scale-95 uppercase tracking-[0.4em]">
                                    {isUploading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24}/>} {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้าใหม่'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal ปรับสต็อก */}
            {modalType === 'stock' && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#2D241E]/10 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] md:rounded-[4rem] shadow-2xl p-10 md:p-12 relative animate-in zoom-in-95 border border-white text-center">
                        <button onClick={() => setModalType(null)} className="absolute top-10 right-10 p-3 bg-slate-50 text-[#C2B8A3] hover:text-red-500 rounded-full transition-all border border-white shadow-sm"><X size={20}/></button>
                        <div className="w-20 h-20 bg-slate-50 text-[#D97706] rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 border border-white shadow-inner"><ArrowRightLeft size={36} /></div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic text-[#2D241E]">ปรับสต็อก <span className="opacity-20">สินค้า</span></h2>
                        
                        <form onSubmit={handleStockAdjustment} className="space-y-8 mt-10">
                            <div className="relative">
                                <input type="number" className="w-full p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 text-6xl text-center font-black focus:bg-white outline-none text-[#2D241E] shadow-inner italic" value={stockAdjustData.new_stock} onChange={e => setStockAdjustData({...stockAdjustData, new_stock: e.target.value})} required />
                                <span className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-[#C2B8A3]">จำนวนหน่วยใหม่</span>
                            </div>
                            <textarea className="w-full p-6 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 font-medium text-lg h-32 resize-none shadow-inner focus:bg-white outline-none text-[#2D241E] italic" placeholder="เหตุผลในการปรับปรุง..." value={stockAdjustData.reason} onChange={e => setStockAdjustData({...stockAdjustData, reason: e.target.value})} required />
                            <button type="submit" className="w-full py-6 bg-[#2D241E] text-white rounded-full font-black text-sm hover:opacity-90 transition-all uppercase tracking-[0.4em] shadow-xl active:scale-95">ยืนยันการปรับปรุง</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal หมวดหมู่ */}
            {modalType === 'category' && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#2D241E]/10 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] md:rounded-[4rem] shadow-2xl p-10 md:p-12 relative max-h-[85vh] flex flex-col animate-in zoom-in-95 border border-white">
                        <button onClick={() => setModalType(null)} className="absolute top-10 right-10 p-3 bg-slate-50 text-[#C2B8A3] hover:text-red-500 rounded-full transition-all border border-white shadow-sm"><X size={20}/></button>
                        
                        <div className="mb-10 text-left">
                            <p className="text-[#D97706] font-bold text-[10px] uppercase tracking-[0.5em] mb-2 italic">สร้างหมวดหมู่สินค้า</p>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#2D241E] italic leading-none">หมวดหมู่ <span className="opacity-20 font-light">สินค้า</span></h2>
                        </div>

                        <form onSubmit={handleCategorySubmit} className="space-y-6 mb-8 pb-8 border-b border-slate-50">
                            <div className="flex gap-4">
                                <input className="flex-1 p-5 rounded-full bg-slate-50/50 border border-slate-100 font-bold text-lg focus:bg-white outline-none text-[#2D241E] shadow-inner placeholder:text-[#2D241E]/20" value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่..." required />
                                <button type="submit" className="bg-[#2D241E] text-white p-5 rounded-full hover:bg-black transition-all shadow-xl active:scale-90 flex items-center justify-center shrink-0">
                                    <Plus size={24}/>
                                </button>
                            </div>
                        </form>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-3">
                                {categories.map(c => (
                                    <div key={c.category_id} className="flex justify-between items-center bg-white p-6 rounded-[2rem] group border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-1 h-6 bg-[#D97706] rounded-full opacity-30"></div>
                                            <span className="font-black text-[#2D241E] text-xl uppercase tracking-tighter italic leading-none">{c.category_name}</span>
                                        </div>
                                        <button onClick={() => handleDeleteCategory(c.category_id)} className="text-[#C2B8A3] hover:text-red-500 transition-all p-2 rounded-xl active:scale-90">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setModalType(null)} className="mt-8 w-full py-4 bg-slate-50 text-[#8B7E66] rounded-full font-black uppercase text-[10px] tracking-[0.4em] hover:text-[#2D241E] transition-all">ปิดหน้าต่าง</button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default ProductManagement;