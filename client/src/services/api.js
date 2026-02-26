import axios from "axios";
import { auth } from "../firebase";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use(async (req) => {
    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            req.headers.Authorization = `Bearer ${token}`;
            return req;
        }
    } catch {
        console.warn("Auth token retrieval failed");
    }
    const stored = localStorage.getItem("token");
    if (stored) req.headers.Authorization = `Bearer ${stored}`;
    return req;
});

API.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config || {};
        const status = error?.response?.status;
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const user = auth.currentUser;
                if (user) {
                    const fresh = await user.getIdToken(true);
                    originalRequest.headers = {
                        ...(originalRequest.headers || {}),
                        Authorization: `Bearer ${fresh}`,
                    };
                    return API(originalRequest);
                }
            } catch {
                try { await auth.signOut(); } catch {
                    console.warn("Sign out failed");
                }
                localStorage.removeItem("token");
                console.warn("Removed stale token from storage");
            }
        }
        return Promise.reject(error);
    }
);

export const login = (formData) => API.post("/auth/login", formData);
export const register = (formData) => API.post("/auth/register", formData);
export const getUsers = () => API.get("/auth/users");
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);

// Password Reset
export const forgotPassword = (identifier) => API.post("/auth/forgot-password", { identifier });
export const verifyOtp = (identifier, otp) => API.post("/auth/verify-otp", { identifier, otp });
export const resetPassword = (identifier, otp, newPassword) => API.post("/auth/reset-password", { identifier, otp, newPassword });

export const getContent = () => API.get("/content");
export const getContentByKey = (key) => API.get(`/content/${key}`);
export const updateContent = (data) => API.put("/content", data);
export const createImage = (formData) =>
    API.post("/images", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateImage = (id, formData) =>
    API.put(`/images/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteImage = (id) => API.delete(`/images/${id}`);

// Enquiries
export const postEnquiry = (data) => API.post("/enquiries", data);
export const getEnquiries = (params) => API.get("/enquiries", { params });
export const updateEnquiryItem = (id, data) => API.put(`/enquiries/${id}`, data);
export const deleteEnquiryItem = (id) => API.delete(`/enquiries/${id}`);
 
export default API;
