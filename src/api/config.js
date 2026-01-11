// 1. กำหนด BASE_URL (รองรับทั้ง Local และ Production บน Vercel)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. ประกาศตัวแปร API_ENDPOINTS ให้ครอบคลุมทุกฟังก์ชัน
export const API_ENDPOINTS = {
    // --- กลุ่มทั่วไปและลูกค้า (Public & Customer) ---
    AUTH: `${BASE_URL}/api/auth`,           // สำหรับ Login, Register
    PROFILE: `${BASE_URL}/api/auth/profile`, // สำหรับดึงและแก้ไขโปรไฟล์
    PRODUCTS: `${BASE_URL}/api/products`,   // รายการสินค้าและการค้นหา
    ADDRESSES: `${BASE_URL}/api/addresses`, // จัดการที่อยู่จัดส่ง
    ORDERS: `${BASE_URL}/api/orders`,       // สั่งซื้อสินค้าและดูประวัติ (My Orders)
    PAYMENTS: `${BASE_URL}/api/payments`,   // ข้อมูลการชำระเงิน
    REVIEWS: `${BASE_URL}/api/products/reviews/public`, // ดูรีวิวสินค้า

    // --- กลุ่มจัดการหลังบ้าน (Admin & Staff) ---
    ADMIN: {
        DASHBOARD: `${BASE_URL}/api/admin/dashboard/stats`, // สถิติหน้า Dashboard
        PRODUCTS: `${BASE_URL}/api/admin/products`,         // จัดการสต็อกและเพิ่มสินค้า
        ORDERS: `${BASE_URL}/api/admin/orders`,             // จัดการออเดอร์และเลขพัสดุ
        USERS: `${BASE_URL}/api/admin/users`,               // จัดการสิทธิ์ผู้ใช้งาน
        
        // ✅ ใช้สำหรับหน้า "เกี่ยวกับเรา" และ "ตั้งชื่อร้าน"
        SHOP_SETTINGS: `${BASE_URL}/api/admin/shop-settings`, 

        SHIPPING_PROVIDERS: `${BASE_URL}/api/admin/orders/shipping-providers`, // บริษัทขนส่ง
        SYSTEM_LOG: `${BASE_URL}/api/admin/system-log`,     // ประวัติการทำงานในระบบ
        INVENTORY_LOG: `${BASE_URL}/api/admin/inv-log`,     // ประวัติการเข้า-ออกของสินค้า
        REPORTS: `${BASE_URL}/api/admin/reports/sales`,     // รายงานยอดขาย
    }
};

export default BASE_URL;