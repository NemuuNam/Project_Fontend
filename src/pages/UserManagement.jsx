import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
    Users, ShieldCheck, UserCog, UserCheck, Search, 
    Trash2, Edit, Loader2, X, Save, Filter, RefreshCw, Menu, ShieldAlert,
    CheckCircle, Sparkles, Leaf, Cookie, Smile, ChevronRight, ChevronLeft
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode'; 
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'; 
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({ total: 0, systemAdmins: 0, owners: 0, managers: 0, customers: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // --- ✨ Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const token = localStorage.getItem('token');
    const decodedToken = token ? jwtDecode(token) : {};
    const currentUserId = decodedToken.id || decodedToken.user_id;

    // --- 📦 Logic (คงเดิม 100%) ---
    const calculateSummary = useCallback((userList) => {
        return {
            total: userList.length,
            systemAdmins: userList.filter(u => u.role_id === 1).length,
            owners: userList.filter(u => u.role_id === 2).length,
            managers: userList.filter(u => u.role_id === 3).length,
            customers: userList.filter(u => u.role_id === 4).length
        };
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS);
            if (res.success) {
                setUsers(res.data);
                setSummary(calculateSummary(res.data));
            }
        } catch (err) { 
            toast.error("ดึงข้อมูลผู้ใช้ไม่สำเร็จ"); 
        } finally { 
            setLoading(false); 
        }
    }, [calculateSummary]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleUpdateRole = async () => {
        if (!selectedUser) return;
        if (selectedUser.user_id === currentUserId) return toast.error("คุณไม่สามารถแก้ไขสิทธิ์ของตนเองได้");

        setIsUpdating(true);
        const loadingToast = toast.loading("กำลังอัปเดตสิทธิ์ผู้ใช้...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.USERS}/${selectedUser.user_id}/role`, { 
                role_id: parseInt(newRole) 
            });
            
            if (res.success) {
                toast.success(`เปลี่ยนสิทธิ์เรียบร้อยแล้ว`, { id: loadingToast });
                fetchUsers();
                setIsModalOpen(false);
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "อัปเดตสิทธิ์ล้มเหลว", { id: loadingToast }); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    const handleDelete = async (userId, name) => {
        if (userId === currentUserId) return toast.error("คุณไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้");

        const result = await Swal.fire({
            title: 'ยืนยันการลบผู้ใช้?',
            text: `ข้อมูลของคุณ ${name} จะถูกลบออกถาวร`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2D241E',
            confirmButtonText: 'ยืนยัน ลบข้อมูล',
            cancelButtonText: 'ยกเลิก',
            background: '#ffffff',
            color: '#2D241E',
            customClass: { popup: 'rounded-[3rem] font-["Kanit"]' }
        });

        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
                if (res.success) {
                    toast.success("ลบผู้ใช้งานเรียบร้อยแล้ว");
                    fetchUsers();
                }
            } catch (err) { 
                toast.error("ไม่สามารถลบผู้ใช้ได้ในขณะนี้"); 
            }
        }
    };

    const getRoleStyle = (roleId) => {
        const styles = {
            1: { bg: '#fff', text: '#E53E3E', label: 'System Admin', icon: <ShieldAlert size={12}/> },
            2: { bg: '#fff', text: '#2D241E', label: 'Owner', icon: <ShieldCheck size={12}/> },
            3: { bg: '#fff', text: '#05CD99', label: 'Manager', icon: <UserCheck size={12}/> },
            4: { bg: '#fff', text: '#2D241E', label: 'Customer', icon: <Users size={12}/> }
        };
        return styles[roleId] || { bg: '#fff', text: '#64748b', label: 'Unknown', icon: <Users size={12}/> };
    };

    // --- 🔍 Filtering & Pagination Logic ---
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesRole = roleFilter === 'all' || user.role_id === parseInt(roleFilter);
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const currentUsers = useMemo(() => {
        const start = (currentPage - 1) * usersPerPage;
        return filteredUsers.slice(start, start + usersPerPage);
    }, [filteredUsers, currentPage]);

    // รีเซ็ตหน้ากลับไปหน้า 1 เมื่อมีการค้นหาหรือกรอง
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    if (loading && users.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-['Kanit'] text-[#2D241E] overflow-x-hidden relative selection:bg-[#F3E9DC]">
            
            {/* ☁️ Global Cozy Patterns */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <Leaf className="absolute top-[10%] left-[5%] rotate-12 opacity-[0.02] text-[#2D241E]" size={200} />
                <Cookie className="absolute bottom-[20%] right-[10%] -rotate-12 opacity-[0.02] text-[#2D241E]" size={150} />
                <Smile className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] text-[#2D241E]" size={400} />
            </div>

            <Toaster position="top-right" />
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="users" />

            <main className={`flex-1 transition-all duration-500 ${isCollapsed ? 'lg:ml-[110px]' : 'lg:ml-[300px]'} p-4 md:p-10 lg:p-14 w-full relative z-10`}>
                
                <div className="mb-8 md:mb-1 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-2xl text-[#2D241E] shadow-sm border border-slate-100 active:scale-95 transition-all"><Menu size={24} /></button>
                    <Header title="การจัดการสิทธิ์เข้าถึง" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 px-2">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 mb-2 animate-bounce-slow">
                            <Sparkles size={14} className="text-[#2D241E]" />
                            <span className="text-[20px] font-black uppercase tracking-[0.1em] text-[#2D241E]">การจัดการตัวตนผู้ใช้งาน</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#2D241E] leading-none italic">
                            Users
                        </h1>
                    </div>
                    <button onClick={fetchUsers} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-90 group">
                        <RefreshCw size={24} className={`text-[#2D241E]/40 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                    </button>
                </div>

                {/* 📊 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-12 md:mb-16 px-2">
                    <StatCardPureWhite title="ทั้งหมด" value={summary.total} icon={<Users size={24} />} color="#2D241E" />
                    <StatCardPureWhite title="แอดมิน" value={summary.systemAdmins} icon={<ShieldAlert size={24} />} color="#E53E3E" />
                    <StatCardPureWhite title="เจ้าของ" value={summary.owners} icon={<ShieldCheck size={24} />} color="#2D241E" />
                    <StatCardPureWhite title="ผู้จัดการ" value={summary.managers} icon={<UserCheck size={24} />} color="#05CD99" />
                    <StatCardPureWhite title="ลูกค้า" value={summary.customers} icon={<Users size={24} />} color="#8B7E66" />
                </div>

                <div className="bg-white p-6 md:p-12 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-14 relative z-10">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic flex items-center gap-4">
                                <UserCog className="opacity-20" /> รายชื่อสมาชิก
                            </h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 w-full xl:max-w-3xl">
                            <div className="relative w-full md:w-64">
                                <select 
                                    className="w-full px-6 py-5 rounded-full bg-slate-50/50 border border-slate-100 outline-none font-bold text-xl appearance-none focus:bg-white focus:border-[#2D241E]/10 transition-all shadow-inner text-[#2D241E] uppercase tracking-widest cursor-pointer"
                                    value={roleFilter} 
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">ระดับสมาชิกทั้งหมด</option>
                                    <option value="1">System Admin</option>
                                    <option value="2">Owner</option>
                                    <option value="3">Manager</option>
                                    <option value="4">Customer</option>
                                </select>
                                <Filter size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#2D241E] pointer-events-none" />
                            </div>
                            <div className="relative flex-1 group">
                                <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2D241E] group-focus-within:text-[#2D241E] transition-colors" />
                                <input 
                                    className="w-full pl-16 pr-8 py-4 rounded-full bg-slate-50/50 border border-transparent focus:bg-white focus:border-slate-200 outline-none font-bold text-xl transition-all shadow-inner placeholder:text-[#2D241E]" 
                                    placeholder="ค้นหาด้วยชื่อหรืออีเมล..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto relative z-10 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
                            <thead>
                                <tr className="text-[#2D241E] uppercase text-[20px] font-black tracking-[0.1em] px-8">
                                    <th className="px-10 pb-2">ข้อมูลผู้ใช้งาน</th>
                                    <th className="px-10 pb-2">ช่องทางติดต่อ</th>
                                    <th className="px-10 pb-2">ระดับสิทธิ์</th>
                                    <th className="px-10 pb-2 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-0">
                                {currentUsers.length > 0 ? currentUsers.map(user => {
                                    const role = getRoleStyle(user.role_id);
                                    return (
                                        <tr key={user.user_id} className="group/row hover:translate-x-1 transition-all">
                                            <td className="py-7 px-10 rounded-l-[2.5rem] md:rounded-l-[3rem] bg-white border-y border-l border-slate-50 group-hover/row:bg-slate-50/50">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-[#2D241E] shadow-sm border border-slate-100 group-hover/row:scale-110 transition-transform">
                                                        {user.first_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-black text-[20px] text-[#2D241E] uppercase tracking-tighter italic leading-none">{user.first_name} {user.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-7 px-10 bg-white border-y border-slate-50 group-hover/row:bg-slate-50/50">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#2D241E] text-[20px] leading-none mb-1">{user.email}</span>
                                                    <span className="text-[20px] text-[#2D241E] font-light italic">ลงทะเบียนเมื่อ {new Date(user.created_at || Date.now()).toLocaleDateString('th-TH')}</span>
                                                </div>
                                            </td>
                                            <td className="py-7 px-10 bg-white border-y border-slate-50 group-hover/row:bg-slate-50/50">
                                                <span className="px-5 py-2 rounded-full text-[20px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit shadow-sm bg-white" style={{ color: role.text, borderColor: `${role.text}20` }}>
                                                    {role.icon} {role.label}
                                                </span>
                                            </td>
                                            <td className="py-7 px-10 rounded-r-[2.5rem] md:rounded-r-[3rem] bg-white border-y border-r border-slate-50 group-hover/row:bg-slate-50/50 text-right">
                                                <div className="flex justify-end gap-3 opacity-20 group-hover/row:opacity-100 transition-opacity">
                                                    <button className="p-3 bg-white text-[#2D241E] border border-slate-100 rounded-xl hover:shadow-md transition-all active:scale-90" onClick={() => { setSelectedUser(user); setNewRole(user.role_id.toString()); setIsModalOpen(true); }}><Edit size={18} /></button>
                                                    <button className="p-3 bg-white text-red-500 border border-slate-100 rounded-xl hover:shadow-md transition-all active:scale-90" onClick={() => handleDelete(user.user_id, user.first_name)}><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="4" className="py-32 text-center text-[#2D241E] font-black uppercase italic tracking-widest">ไม่พบข้อมูลสมาชิก</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- ✨ Pagination System (Only White) --- */}
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
                                    if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl font-black  text-xl transition-all ${currentPage === pageNum ? 'bg-[#2D241E] text-white shadow-xl scale-110' : 'text-[#2D241E] hover:text-[#2D241E]'}`}
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

            {/* 🛡️ Role Update Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-6 bg-[#2D241E]/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white" onClick={e => e.stopPropagation()}>
                        <div className="p-10 md:p-14 relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-50 text-[#2D241E] hover:text-red-500 rounded-full transition-all active:scale-90 shadow-sm border border-white"><X size={20}/></button>
                            <div className="mb-12 text-left">
                                <p className="text-[#2D241E] font-bold text-[20px] uppercase tracking-[0.1em] mb-2 italic">สิทธิ์การเข้าถึงข้อมูล</p>
                                <h3 className="text-3xl font-black text-[#2D241E] tracking-tighter uppercase italic leading-tight">แก้ไข <span className=" font-light">ระดับผู้ใช้งาน</span></h3>
                                <p className="text-[#2D241E] font-bold mt-2 text-[20px] italic">{selectedUser?.first_name} {selectedUser?.last_name}</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    {[
                                        { id: 1, label: 'System Admin', desc: 'สิทธิ์สูงสุดในการควบคุมโครงสร้างระบบ' },
                                        { id: 2, label: 'Owner', desc: 'สิทธิ์ในการวิเคราะห์และตรวจสอบร้านค้า' },
                                        { id: 3, label: 'Manager', desc: 'สิทธิ์จัดการสินค้าและรายการคำสั่งซื้อ' },
                                        { id: 4, label: 'Customer', desc: 'สิทธิ์ผู้ใช้งานทั่วไปสำหรับการสั่งซื้อ' }
                                    ].map(role => (
                                        <button 
                                            key={role.id}
                                            onClick={() => setNewRole(role.id.toString())}
                                            className={`w-full p-5 rounded-[2rem] text-left border-2 transition-all flex items-center justify-between group/btn ${newRole === role.id.toString() ? 'border-[#2D241E] bg-slate-50/50' : 'border-slate-50 hover:border-slate-100 bg-white'}`}
                                        >
                                            <div className="text-left">
                                                <p className={`font-black uppercase text-[20px] tracking-tight ${newRole === role.id.toString() ? 'text-[#2D241E]' : 'text-[#2D241E]'}`}>{role.label}</p>
                                                <p className="text-[20px] text-[#2D241E] font-light italic mt-1">{role.desc}</p>
                                            </div>
                                            {newRole === role.id.toString() ? (
                                                <div className="w-8 h-8 rounded-full bg-[#2D241E] flex items-center justify-center text-white shadow-md animate-in zoom-in">
                                                    <CheckCircle size={16} strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <ChevronRight size={16} className="text-slate-200 group-hover/btn:text-[#2D241E] transition-colors" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleUpdateRole} 
                                    disabled={isUpdating} 
                                    className="w-full py-6 bg-[#ffff] text-black rounded-full font-black text-[20px] border border-slate-100 hover:bg-slate-100 transition-all flex justify-center items-center gap-4 uppercase tracking-[0.1em] active:scale-95 disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> ยืนยันการเปลี่ยนสิทธิ์</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D241E10; border-radius: 10px; }
            `}} />
        </div>
    );
};

const StatCardPureWhite = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 md:p-6 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1.5 duration-500 group relative overflow-hidden">
        <div className="flex-1 text-left min-w-0 relative z-10">
            <p className="text-[20px] font-black text-[#2D241E] uppercase tracking-[0.1em] mb-3 md:mb-4 flex items-center gap-2 leading-none">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}></span>
                {title}
            </p>
            <h2 className="text-[#2D241E] text-xl md:text-2xl xl:text-3xl font-black italic tracking-tighter leading-none uppercase truncate">{value || 0}</h2>
        </div>
        <div style={{ color: color }} className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-50   text-[#2D241E] shrink-0 ml-4 group-hover:scale-110 group-hover:text-[#2D241E] transition-all duration-500 relative z-10">
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
    </div>
);

export default UserManagement;