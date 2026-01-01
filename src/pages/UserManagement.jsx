import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, ShieldCheck, UserCog, UserCheck, Search, 
  Trash2, Edit, Loader2, Mail, X, Save, Filter 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2'; // สำหรับ Popup ที่สวยงามเหมือนหน้าอื่นๆ
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// --- นำเข้า API Config และ Instance ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

const UserManagement = () => {
    // --- States ---
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({ total: 0, owners: 0, admins: 0, managers: 0, customers: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const calculateSummary = useCallback((userList) => {
        return {
            total: userList.length,
            owners: userList.filter(u => u.role_id === 1).length,
            admins: userList.filter(u => u.role_id === 2).length,
            managers: userList.filter(u => u.role_id === 3).length,
            customers: userList.filter(u => u.role_id === 4).length
        };
    }, []);

    // --- ฟังก์ชันดึงข้อมูลสมาชิก (ใช้ axiosInstance) ---
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            // ไม่ต้องส่ง Token และ Header แล้ว ระบบใส่ให้เองอัตโนมัติ
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

    // --- ฟังก์ชันอัปเดตสิทธิ์ (ใช้ axiosInstance) ---
    const handleUpdateRole = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        const loadingToast = toast.loading("กำลังอัปเดตสิทธิ์...");
        try {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.ADMIN.USERS}/${selectedUser.user_id}/role`, { 
                role_id: parseInt(newRole) 
            });
            
            if (res.success) {
                toast.success(`เปลี่ยนสิทธิ์ ${selectedUser.first_name} เรียบร้อย`, { id: loadingToast });
                fetchUsers();
                setIsModalOpen(false);
            }
        } catch (err) { 
            toast.error("อัปเดตล้มเหลว", { id: loadingToast }); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    // --- ฟังก์ชันลบผู้ใช้ (ใช้ axiosInstance + Swal) ---
    const handleDelete = async (userId, name) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบผู้ใช้?',
            text: `คุณกำลังจะลบคุณ ${name} ออกจากระบบ`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#f4f7fe',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const res = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
                if (res.success) {
                    toast.success("ลบผู้ใช้เรียบร้อยแล้ว");
                    fetchUsers();
                }
            } catch (err) { 
                toast.error("ไม่สามารถลบผู้ใช้ได้"); 
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'all' || user.role_id === parseInt(roleFilter);
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f7fe' }}>
            <Loader2 className="animate-spin" color="#4318ff" size={45} />
        </div>
    );

    return (
        <div className="user-mgmt-layout">
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                .user-mgmt-layout { display: flex; min-height: 100vh; background-color: #f4f7fe; font-family: 'Kanit', sans-serif; color: #1b2559; }
                .main-content { flex: 1; margin-left: ${isCollapsed ? '80px' : '260px'}; padding: 30px; transition: all 0.3s ease; width: 100%; box-sizing: border-box; }
                @media (max-width: 1024px) { .main-content { margin-left: 0 !important; padding: 20px; } }
                .table-section { background: #fff; border-radius: 35px; padding: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
                .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 30px; }
                @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
                .search-input-premium { width: 100%; padding: 12px 20px 12px 52px; border-radius: 16px; border: 1.5px solid #eef2f6; background: #fcfdfe; outline: none; transition: 0.3s; font-family: 'Kanit'; color: #1b2559; font-size: 14px; }
                .search-input-premium:focus { border-color: #4318ff; box-shadow: 0 10px 20px rgba(67, 24, 255, 0.05); }
                .role-badge { padding: 6px 12px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
                .role-1 { background: #fff1f2; color: #ef4444; } 
                .role-2 { background: #fff9eb; color: #f59e0b; } 
                .role-3 { background: #f0fdf4; color: #10b981; } 
                .role-4 { background: #f4f7fe; color: #4318ff; }
                .action-btn { border: none; background: #f4f7fe; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; color: #a3aed0; }
                .action-btn:hover { background: #4318ff15; color: #4318ff; transform: translateY(-1px); }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 2000; padding: 15px; }
                .modal-box { background: #fff; width: 100%; max-width: 450px; border-radius: 35px; padding: 35px; position: relative; animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} activePage="users" />

            <main className="main-content">
                <Header title="จัดการผู้ใช้งาน" />

                <div className="stats-grid">
                    <SummaryStatCard title="ทั้งหมด" value={summary.total} icon={<Users size={18}/>} color="#4318ff" />
                    <SummaryStatCard title="Owner" value={summary.owners} icon={<ShieldCheck size={18}/>} color="#ef4444" />
                    <SummaryStatCard title="Admin" value={summary.admins} icon={<UserCog size={18}/>} color="#f59e0b" />
                    <SummaryStatCard title="Manager" value={summary.managers} icon={<UserCheck size={18}/>} color="#10b981" />
                    <SummaryStatCard title="ลูกค้า" value={summary.customers} icon={<Users size={18}/>} color="#64748b" />
                </div>

                <section className="table-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>รายชื่อผู้ใช้งาน</h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flexGrow: 1, justifyContent: 'flex-end' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={16} color="#a3aed0" />
                                <select style={{ padding: '10px 15px', borderRadius: '15px', border: 'none', background: '#f4f7fe', fontFamily: 'Kanit' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="all">ทุกระดับ</option>
                                    <option value="1">Owner</option>
                                    <option value="2">Admin</option>
                                    <option value="3">Manager</option>
                                    <option value="4">Customer</option>
                                </select>
                            </div>
                            <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
                                <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#a3aed0' }} />
                                <input className="search-input-premium" placeholder="ค้นหาชื่อ หรือ อีเมล..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '15px', color: '#a3aed0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>ชื่อ-นามสกุล</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: '#a3aed0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>ช่องทางติดต่อ</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: '#a3aed0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>สิทธิ์ (Role)</th>
                                    <th style={{ textAlign: 'center', padding: '15px', color: '#a3aed0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td style={{ padding: '18px 15px', fontWeight: '700', borderBottom: '1px solid #f8fafc' }}>{user.first_name} {user.last_name}</td>
                                        <td style={{ padding: '18px 15px', color: '#a3aed0', borderBottom: '1px solid #f8fafc' }}>{user.email}</td>
                                        <td style={{ padding: '18px 15px', borderBottom: '1px solid #f8fafc' }}>
                                            <span className={`role-badge role-${user.role_id}`}>
                                                {user.role_id === 1 ? 'Owner' : user.role_id === 2 ? 'Admin' : user.role_id === 3 ? 'Manager' : 'Customer'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 15px', borderBottom: '1px solid #f8fafc', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button className="action-btn" onClick={() => { setSelectedUser(user); setNewRole(user.role_id.toString()); setIsModalOpen(true); }}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(user.user_id, user.first_name)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* --- Modal แก้ไขสิทธิ์ (Animation Slide Up) --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} color="#a3aed0"/></button>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '800' }}>แก้ไขระดับสมาชิก</h3>
                        <p style={{ fontSize: '14px', color: '#a3aed0', marginBottom: '20px' }}>สมาชิก: <strong style={{ color: '#1b2559' }}>{selectedUser?.first_name} {selectedUser?.last_name}</strong></p>
                        
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '12px', color: '#a3aed0', textTransform: 'uppercase' }}>เลือกบทบาทใหม่</label>
                        <select style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1.5px solid #eef2f6', background: '#fcfdfe', fontFamily: 'Kanit', marginBottom: '25px' }} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                            <option value="1">Owner (เจ้าของร้าน)</option>
                            <option value="2">Admin (ผู้ดูแลระบบ)</option>
                            <option value="3">Manager (ผู้จัดการร้าน)</option>
                            <option value="4">Customer (ลูกค้าสมาชิก)</option>
                        </select>
                        <button onClick={handleUpdateRole} disabled={isUpdating} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: 'none', background: '#4318ff', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(67, 24, 255, 0.15)' }}>
                            {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> บันทึกสิทธิ์ใหม่</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SummaryStatCard = ({ title, value, icon, color }) => (
    <div style={{ background: '#fff', padding: '15px 20px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <div>
            <p style={{ color: '#a3aed0', fontSize: '11px', margin: 0, fontWeight: '700', textTransform: 'uppercase' }}>{title}</p>
            <h2 style={{ color: '#1b2559', fontSize: '20px', margin: '2px 0', fontWeight: '800' }}>{value || 0}</h2>
        </div>
        <div style={{ padding: '10px', background: `${color}10`, color: color, borderRadius: '12px', display: 'flex' }}>{icon}</div>
    </div>
);

export default UserManagement;