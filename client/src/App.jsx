import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

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
        document.documentElement.style.setProperty("--nav-gap", `${navH}px`);
        const hash = (location.hash || "").replace(/^#/, "");
        const segments = location.pathname.split("/").filter(Boolean);

        const smoothToTopAfterNav = () => {
            window.scrollTo({ top: navH, behavior: "smooth" });
        };

        if (hash) {
            const scrollToHash = () => {
                const el = document.getElementById(hash);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const y = Math.max(0, rect.top + window.pageYOffset);
                    window.scrollTo({ top: y, behavior: "smooth" });
                    return true;
                }
                return false;
            };
            if (!scrollToHash()) {
                setTimeout(scrollToHash, 60);
            }
        } else if (!isAdmin && segments.length <= 1) {
            smoothToTopAfterNav();
        }
    }, [location.pathname, location.hash, isAdmin]);

    return (
        <>
            {!isAdmin && <Navbar />}
            <div className="site">
                <div className="site-content content-spacing">{children}</div>
                {!isAdmin && <Footer />}
            </div>
        </>
    );
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/home/:section" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/about/:section" element={<AboutPage />} />
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
