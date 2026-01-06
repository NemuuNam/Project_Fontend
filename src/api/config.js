// 1. กำหนด BASE_URL ก่อน
const BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-vercel-url.vercel.app';

// 2. ประกาศตัวแปร API_ENDPOINTS
export const API_ENDPOINTS = {
    // --- กลุ่มทั่วไปและลูกค้า ---
    AUTH: `${BASE_URL}/api/auth`,
    PAYMENTS: `${BASE_URL}/api/payments`,
    PRODUCTS: `${BASE_URL}/api/products`,
    ADDRESSES: `${BASE_URL}/api/addresses`,
    ORDERS: `${BASE_URL}/api/orders`,
    REVIEWS: `${BASE_URL}/api/products/reviews/public`,

    // --- กลุ่มจัดการหลังบ้าน (Admin & Staff) ---
    ADMIN: {
        DASHBOARD: `${BASE_URL}/api/admin/dashboard/stats`,
        PRODUCTS: `${BASE_URL}/api/admin/products`,
        SHIPPING_PROVIDERS: `${BASE_URL}/api/admin/shipping-providers`,
        ORDERS: `${BASE_URL}/api/admin/orders`,
        USERS: `${BASE_URL}/api/admin/users`,
        SHOP_SETTINGS: `${BASE_URL}/api/admin/shop-settings`,
        SYSTEM_LOG: `${BASE_URL}/api/admin/system-log`,
        INVENTORY_LOG: `${BASE_URL}/api/admin/inv-log`,
        REPORTS: `${BASE_URL}/api/admin/reports/sales`,
    }
};


export default BASE_URL;