import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import DynamicPage from "./pages/DynamicPage";

const Layout = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    useEffect(() => {
        const nav = document.querySelector("nav.fixed-top");
        const navH = nav ? nav.getBoundingClientRect().height : 0;
        const hash = (location.hash || "").replace(/^#/, "");

        if (hash) {
            const scrollToHash = () => {
                const el = document.getElementById(hash);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const y = Math.max(0, rect.top + window.pageYOffset - navH);
                    window.scrollTo({ top: y, behavior: "smooth" });
                    return true;
                }
                return false;
            };
            if (!scrollToHash()) {
                setTimeout(scrollToHash, 60);
            }
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [location.pathname, location.hash]);

    return (
        <>
            {!isAdmin && <Navbar />}
            {children}
            {!isAdmin && <Footer />}
        </>
    );
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
                <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/:slug/:section" element={<DynamicPage />} />
          <Route path="/:slug" element={<DynamicPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
