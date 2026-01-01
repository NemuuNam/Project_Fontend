import axios from 'axios';

// ✅ ใช้ Environment Variable ของ Vite แทนการ Hardcode URL
// เพื่อให้สลับระหว่าง localhost และ production บน Vercel ได้อัตโนมัติ
const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
    // ✅ จำเป็นสำหรับการทำ CORS ข้ามโดเมนระหว่าง Vercel Frontend และ Backend
    withCredentials: true, 
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
        // คืนค่าเฉพาะ data (เช่น { success: true, data: [...] })
        return response.data;
    },
    (error) => {
        // หากเจอ Error 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user'); // ล้างข้อมูล User ไปด้วย (ถ้ามี)
            
            // ✅ ใช้ replace เพื่อไม่ให้ผู้ใช้กด "Back" กลับมาหน้าเดิมที่ติด Error ได้
            window.location.replace('/login'); 
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;