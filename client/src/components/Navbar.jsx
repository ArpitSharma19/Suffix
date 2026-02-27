import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/logo_suffix.png";
import "../App.css";
import { getContentByKey } from "../services/api";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [content, setContent] = useState({ logo: "", menuItems: [] });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await getContentByKey('navbar');
                if (data && data.value) setContent(data.value);
            } catch (error) {
                console.error("Error fetching navbar content:", error);
            }
        };
        fetchContent();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const normalizeSectionId = (s) => {
        const v = (s || '').toString().toLowerCase();
        if (v === 'hero') return 'home';
        if (v === 'imagegrid' || v === 'career' || v === 'careers') return 'imageGrid';
        return s;
    };

    const goHomeAndScroll = (sectionId) => {
        const id = sectionId ? normalizeSectionId(sectionId) : null;
        if (id) {
            navigate(`/home/${id}`);
        } else {
            navigate("/home");
        }
    };

    const handleMenuClick = (e, item) => {
        const text = (item.text || "").toLowerCase().trim();
        const linkRaw = (item.link || "").trim();
        const link = linkRaw.toLowerCase();
        e.preventDefault();

        // PRIORITIZE explicit path navigation if link starts with "/"
        if (link.startsWith("/")) {
            // Normalize /home/careers -> /home/imagegrid if needed
            if (link === "/home/careers" || link === "/home/imagegrid") {
                navigate("/home/imagegrid");
            } else {
                navigate(link);
            }
        } else if (link.includes("#")) {
            const section = link.split("#")[1] || "";
            if (section.toLowerCase() === "careers") {
                navigate("/home/imagegrid");
            } else {
                goHomeAndScroll(section || null);
            }
        } else if (text === "home" || link === "/" || link === "#home") {
            goHomeAndScroll(null);
        } else if (text === "about" || link === "/about") {
            navigate("/about");
        } else if (text === "products" || link.includes("#products")) {
            goHomeAndScroll("products");
        } else if (text === "solutions" || link.includes("#solutions")) {
            goHomeAndScroll("solutions");
        } else if (text === "careers" || link.includes("#careers")) {
            navigate("/home/imagegrid");
        } else if (link.includes("#contact") || link.includes("#footer")) {
            goHomeAndScroll("contact");
        } else if (text.includes("sales") || text.includes("enquire")) {
            navigate("/home/imagegrid");
        } else {
            const slug = getTargetSlug(item);
            if (slug === "home") {
                goHomeAndScroll(null);
            } else if (slug === "about") {
                navigate("/about");
            } else {
                navigate(`/${slug}`);
            }
        }
        setMenuOpen(false);
    };

    const getTargetSlug = (item) => {
        const link = (item.link || "").trim();
        const text = (item.text || "").toLowerCase().trim();
        if (link.startsWith("/")) {
            return link === "/" ? "home" : link.replace(/^\//, "").split("#")[0];
        }
        if (text === "home") return "home";
        if (text) return text.replace(/\s+/g, "-");
        return "home";
    };

    const handleSubmenuClick = (basePath, sectionId) => (e) => {
        e.preventDefault();
        const target = (sectionId || '').toString().trim();
        if (target.startsWith('/')) {
            navigate(target);
            setMenuOpen(false);
            return;
        }
        if (basePath === "/" || basePath === "" || basePath.toLowerCase() === "/home") {
            goHomeAndScroll(target === "home" ? null : target);
        } else {
            const norm = normalizeSectionId(target);
            const path = `${basePath.replace(/\/$/, '')}/${norm}`;
            navigate(path);
        }
        setMenuOpen(false);
    };

    return (
        <nav
            className="fixed-top bg-light shadow-sm navbar-slide"
            style={{
                transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
            }}
        >
            <div className="container py-4 position-relative">
                <div className="d-flex justify-content-between align-items-center">

                    {/* Logo */}
                    <a
                        className="position-relative d-inline-block"
                        href="/"
                        onClick={(e) => {
                            e.preventDefault();
                            goHomeAndScroll(null);
                        }}
                    >
                        <img src={content.logo || Logo} alt="Logo" className="navbar-logo" />
                        <FontAwesomeIcon
                            icon={faAngleUp}
                            className="icon-angle-up text-primary"
                        />
                    </a>

                    {/* Desktop Menu */}
                    <ul className="menu-desktop align-items-center list-unstyled mb-0">
                        {content.menuItems.length > 0 ? (
                            content.menuItems.map((item, index) => {
                                const slug = getTargetSlug(item);
                                const basePath = item.link?.startsWith("/") ? item.link : (slug === "home" ? "/" : `/${slug}`);
                                const submenu = Array.isArray(item.submenu) && item.submenu.length > 0
                                    ? item.submenu.map((s) => ({ id: s.target || s.sectionId || s.id || "", label: s.label || s.text || "" })).filter((s) => s.id && s.label)
                                    : [];
                                return (
                                    <li
                                        key={index}
                                        className="menu-item-with-submenu"
                                    >
                                        <a
                                            className={`${item.isPrimary ? "text-primary fw-semibold" : "text-dark"} text-decoration-none fs-20`}
                                            href={item.link}
                                            onClick={(e) => handleMenuClick(e, item)}
                                        >
                                            {item.text}
                                        </a>
                                        {submenu.length > 0 && (
                                            <ul className="submenu list-unstyled mb-0">
                                                {submenu.map((s) => (
                                                    <li key={s.id}>
                                                        <a
                                                            href={`${basePath}#${s.id}`}
                                                            onClick={handleSubmenuClick(basePath, s.id)}
                                                            className="text-decoration-none text-dark fs-14"
                                                        >
                                                            {s.label}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <>
                                <li>
                                    <a
                                        className="text-dark text-decoration-none fs-20"
                                        href="/home"
                                        onClick={(e) => { e.preventDefault(); goHomeAndScroll(null); }}
                                    >
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="text-dark text-decoration-none fs-20"
                                        href="/about"
                                        onClick={(e) => { e.preventDefault(); navigate('/about'); }}
                                    >
                                        About
                                    </a>
                                </li>
                                <li><a className="text-dark text-decoration-none fs-20" href="/home#products" onClick={(e)=>{ e.preventDefault(); goHomeAndScroll('products'); }}>Products</a></li>
                                <li><a className="text-dark text-decoration-none fs-20" href="/home#solutions" onClick={(e)=>{ e.preventDefault(); goHomeAndScroll('solutions'); }}>Solutions</a></li>
                                <li><a className="text-dark text-decoration-none fs-20" href="/home/imagegrid" onClick={(e)=>{ e.preventDefault(); navigate('/home/imagegrid'); }}>Careers</a></li>
                                <li><a className="text-dark text-decoration-none fs-20" href="/home#contact" onClick={(e)=>{ e.preventDefault(); goHomeAndScroll('contact'); }}>Contact</a></li>
                                <li><a className="text-primary text-decoration-none fs-20 fw-semibold" href="/home/imagegrid" onClick={(e)=>{ e.preventDefault(); navigate('/home/imagegrid'); }}>Sales Enquire</a></li>
                            </>
                        )}
                    </ul>

                    {/* Mobile Toggle */}
                    <button
                        className="btn navbar-toggle menu-mobile-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} size="lg" />
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="mobile-menu-overlay">
                        <ul className="list-unstyled mobile-menu mb-0">
                            {content.menuItems.length > 0 ? (
                                content.menuItems.map((item, index) => {
                                    const slug = getTargetSlug(item);
                                    const basePath = item.link?.startsWith("/") ? item.link : (slug === "home" ? "/" : `/${slug}`);
                                    const submenu = Array.isArray(item.submenu) && item.submenu.length > 0
                                        ? item.submenu.map((s) => ({ id: s.target || s.sectionId || s.id || "", label: s.label || s.text || "" })).filter((s) => s.id && s.label)
                                        : [];
                                    return (
                                        <li key={index} className={item.isPrimary ? "text-primary fw-semibold" : ""}>
                                            <a href={item.link} onClick={(e) => handleMenuClick(e, item)}>{item.text}</a>
                                            {submenu.length > 0 && (
                                                <ul className="submenu-mobile list-unstyled ps-3 mt-1">
                                                    {submenu.map((s) => (
                                                        <li key={s.id}>
                                                            <a
                                                                href={`${basePath}#${s.id}`}
                                                                onClick={handleSubmenuClick(basePath, s.id)}
                                                            >
                                                                {s.label}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })
                            ) : (
                                <>
                                    <li>
                                        <a href="/" onClick={(e)=>{ e.preventDefault(); goHomeAndScroll(null); }}>Home</a>
                                    </li>
                                    <li><a href="/about" onClick={(e)=>{ e.preventDefault(); navigate('/about'); setMenuOpen(false); }}>About</a></li>
                                    <li><a href="/#products" onClick={(e)=>{ e.preventDefault(); goHomeAndScroll('products'); }}>Products</a></li>
                                    <li><a href="/#solutions" onClick={(e)=>{ e.preventDefault(); goHomeAndScroll('solutions'); }}>Solutions</a></li>
                                    <li><a href="/home/imagegrid" onClick={(e)=>{ e.preventDefault(); navigate('/home/imagegrid'); setMenuOpen(false); }}>Careers</a></li>
                                    <li><a href="/#contact" onClick={(e)=>{ e.preventDefault(); goHomeAndScroll('contact'); }}>Contact</a></li>
                                    <li className="text-primary fw-semibold">
                                        <a href="/home/imagegrid" onClick={(e)=>{ e.preventDefault(); navigate('/home/imagegrid'); setMenuOpen(false); }}>Sales Enquire</a>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
