import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Box, Users,
  Loader2, Menu, TrendingUp, RefreshCw, ArrowRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- API Config & Instance ---
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0, orderCount: 0, totalStock: 0, customerCount: 0,
    recentOrders: [], topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);

      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD);
      if (res.success) setStats(res.data);
    } catch (err) {
      toast.error("ดึงข้อมูลสถิติล้มเหลว");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const getBadgeStyle = (status) => {
    const colors = {
      'สำเร็จ': { bg: '#dcfce7', text: '#15803d' },
      'รอตรวจสอบ': { bg: '#fff7ed', text: '#f97316' }, // สีส้มตามต้องการ
      'รอจัดส่ง': { bg: '#e0f2fe', text: '#0369a1' },
      'กำลังจัดส่ง': { bg: '#e0e7ff', text: '#4338ca' },
      'ยกเลิก': { bg: '#fee2e2', text: '#b91c1c' },
      'คืนเงิน': { bg: '#f3e8ff', text: '#7e22ce' }
    };
    const s = colors[status] || { bg: '#f1f5f9', text: '#64748b' };
    return {
      backgroundColor: s.bg, color: s.text,
      padding: '4px 12px', borderRadius: '10px',
      fontSize: '11px', fontWeight: '800'
    };
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#f4f7fe]">
      <Loader2 className="animate-spin text-[#4318ff]" size={45} />
      <p className="mt-4 font-bold text-[#a3aed0] tracking-tight uppercase text-xs">กำลังซิงค์ข้อมูลร้านค้า...</p>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Toaster position="top-right" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap');
        .dashboard-layout { display: flex; min-height: 100vh; background-color: #f4f7fe; font-family: 'Kanit', sans-serif; color: #1b2559; }
        
        .main-content { 
          flex: 1; margin-left: ${isCollapsed ? '85px' : '285px'}; 
          padding: 30px; transition: all 0.3s ease; box-sizing: border-box;
        }

        @media (max-width: 1024px) {
          .main-content { margin-left: 0 !important; padding: 15px; }
          .mobile-header { display: flex !important; }
          .desktop-header-wrap { display: none !important; }
        }

        .mobile-header { 
          display: none; align-items: center; justify-content: space-between; 
          margin-bottom: 15px; background: #fff; padding: 12px 20px; 
          border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); 
        }

        /* Stats Mini Header */
        .section-mini-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .refresh-icon-btn { 
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid #eef2f6;
          background: white; color: #a3aed0; cursor: pointer; transition: all 0.2s;
        }
        .refresh-icon-btn:hover { color: #4318ff; border-color: #4318ff; background: #f0f3ff; }

        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
        @media (min-width: 1200px) { .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
        
        .stat-card { 
          background: #fff; padding: 22px; border-radius: 28px; 
          display: flex; justify-content: space-between; align-items: center; 
          border: 1px solid rgba(241, 245, 249, 0.8); box-shadow: 0 10px 30px -5px rgba(0,0,0,0.02);
        }

        .dashboard-grid-content { display: grid; grid-template-columns: 1fr; gap: 25px; }
        @media (min-width: 1280px) { .dashboard-grid-content { grid-template-columns: 1.8fr 1fr; } }

        .white-box { 
          background: #fff; padding: 25px; border-radius: 32px; 
          border: 1px solid #f1f5f9; box-shadow: 0 15px 35px -10px rgba(0,0,0,0.03);
        }
        
        .table-container { width: 100%; overflow-x: auto; margin-top: 15px; }
        .recent-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .recent-table th { text-align: left; color: #a3aed0; font-size: 11px; font-weight: 800; text-transform: uppercase; padding-bottom: 12px; border-bottom: 2px solid #f8fafc; }
        .recent-table td { padding: 15px 0; border-bottom: 1px solid #f8fafc; font-size: 14px; font-weight: 600; }

        .rank-img { width: 48px; height: 48px; border-radius: 12px; overflow: hidden; background: #f4f7fe; border: 1.5px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.04); }
        .view-all-link { color: #4318ff; font-weight: 800; font-size: 13px; display: flex; align-items: center; gap: 4px; cursor: pointer; opacity: 0.8; }
        .view-all-link:hover { opacity: 1; text-decoration: underline; }
      `}</style>

      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} activePage="dashboard" />

      <main className="main-content">
        <div className="mobile-header">
          <button onClick={() => setIsSidebarOpen(true)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Menu size={24} color="#4318ff" /></button>
          <h2 style={{ fontSize: '16px', fontWeight: '800' }}>Admin Dashboard</h2>
          <button onClick={() => fetchDashboardData(true)} className="refresh-icon-btn">
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="desktop-header-wrap"><Header title="สรุปภาพรวมธุรกิจ" /></div>

        {/* --- ส่วนหัวข้อสถิติและปุ่มรีเฟรชขนาดเล็ก --- */}
        <div className="section-mini-header">
          <p style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '600', margin: 0 }}>สรุปข้อมูลประจำวัน</p>
          <button 
            onClick={() => fetchDashboardData(true)} 
            className="refresh-icon-btn" 
            title="รีเฟรชข้อมูล"
            style={{ display: window.innerWidth > 1024 ? 'flex' : 'none' }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* --- KPI Stats Grid --- */}
        <div className="stats-grid">
          <StatCard title="ยอดขายรวม" value={`฿${(stats.totalSales || 0).toLocaleString()}`} icon={<DollarSign size={20} />} color="#4318ff" />
          <StatCard title="ออเดอร์สำเร็จ" value={(stats.orderCount || 0).toLocaleString()} icon={<ShoppingBag size={20} />} color="#05cd99" />
          <StatCard title="จำนวนสต็อก" value={(stats.totalStock || 0).toLocaleString()} icon={<Box size={20} />} color="#ffb547" />
          <StatCard title="ลูกค้าทั้งหมด" value={(stats.customerCount || 0).toLocaleString()} icon={<Users size={20} />} color="#4318ff" />
        </div>

        <div className="dashboard-grid-content">
          {/* --- Recent Orders --- */}
          <div className="white-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>🛒 คำสั่งซื้อล่าสุด</h3>
              <div className="view-all-link" onClick={() => navigate('/admin/orders')}>ดูทั้งหมด <ArrowRight size={14} /></div>
            </div>
            <div className="table-container">
              <table className="recent-table">
                <thead>
                  <tr><th>ID ออเดอร์</th><th>ลูกค้า</th><th>ยอดรวม</th><th>สถานะ</th></tr>
                </thead>
                <tbody>
                  {stats.recentOrders?.length > 0 ? stats.recentOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td style={{ color: '#4318ff', fontWeight: '800' }}>#{order.order_id.substring(0, 8).toUpperCase()}</td>
                      <td style={{ color: '#64748b' }}>{order.customer_name}</td>
                      <td style={{ fontWeight: '800' }}>฿{(order.total || 0).toLocaleString()}</td>
                      <td><span style={getBadgeStyle(order.status)}>{order.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#a3aed0' }}>ยังไม่มีคำสั่งซื้อใหม่</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Top Products Ranking --- */}
          <div className="white-box">
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#05cd99" /> 5 อันดับยอดฮิต
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.topProducts?.length > 0 ? stats.topProducts.map((product) => (
                <div key={product.product_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '18px', border: '1px solid #f8fafc' }}>
                  <div className="rank-img">
                    <img src={product.image || 'https://via.placeholder.com/50'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <span style={{ color: '#a3aed0', fontSize: '11px', fontWeight: '700' }}>฿{product.price?.toLocaleString()}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#05cd99', fontSize: '13px', fontWeight: '800' }}>{product.total_sold} <span style={{ fontSize: '10px', opacity: 0.6 }}>ชิ้น</span></div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#a3aed0' }}>ยังไม่มีข้อมูล</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// StatCard Sub-component
const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card">
    <div style={{ flex: 1 }}>
      <p style={{ color: '#a3aed0', fontSize: '11px', fontWeight: '800', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
      <h2 style={{ color: '#1b2559', fontSize: '22px', fontWeight: '800', margin: 0 }}>{value}</h2>
    </div>
    <div style={{ background: `${color}10`, color: color, width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
  </div>
);

export default Dashboard;