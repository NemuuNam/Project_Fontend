import axios from 'axios';

// ✅ ใช้ Environment Variable ของ Vite แทนการ Hardcode URL
// เพื่อให้สลับระหว่าง localhost และ production บน Vercel ได้อัตโนมัติ
const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
    // ✅ จำเป็นสำหรับการทำ CORS ข้ามโดเมนระหว่าง Vercel Frontend และ Backend
    //withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ จุดสำคัญ: หากส่งข้อมูลเป็น FormData (เช่น การแนบสลิป)
        // ต้องให้ Axios จัดการ Content-Type เอง ห้ามบังคับเป็น application/json
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// --- Response Interceptor ---
axiosInstance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // 1. ล้างข้อมูลที่หมดอายุ
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // 2. เช็คว่า "หน้าปัจจุบัน" เป็นหน้าหวงห้ามหรือไม่
            // รายชื่อหน้าที่ "อนุญาต" ให้ดูได้แม้ไม่มีสิทธิ์ (Public Pages)
            const publicPages = ['/', '/home', '/products', '/about', '/contact', '/login', '/register'];
            const isPublicPage = publicPages.includes(window.location.pathname);

            // 3. ถ้าไม่ใช่หน้า Public (เช่น อยู่หน้า Checkout หรือ Admin) ถึงค่อยส่งไป Login
            if (!isPublicPage) {
                window.location.replace('/login'); 
            } else {
                // ถ้าเป็นหน้า Public แค่แจ้งเตือนเบาๆ หรือไม่ต้องทำอะไรเลย
                console.warn("Unauthorized on public page - staying here.");
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;