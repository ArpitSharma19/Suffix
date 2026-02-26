import React, { useEffect, useMemo, useState } from 'react';
import HeroEditor from '../../components/admin/HeroEditor';
import AboutEditor from '../../components/admin/AboutEditor';
import ProductsEditor from '../../components/admin/ProductsEditor';
import NavbarEditor from '../../components/admin/NavbarEditor';
import SuccessEditor from '../../components/admin/SuccessEditor';
import ImageGridEditor from '../../components/admin/ImageGridEditor';
import EnquiriesAdmin from '../../components/admin/EnquiriesAdmin';
import FooterEditor from '../../components/admin/FooterEditor';
import UserManagement from '../../components/admin/UserManagement';
import PagesManager from '../../components/admin/PagesManager';
import PageEditor from '../../components/admin/PageEditor';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHome, faLayerGroup, faUsers, faSignOut, faChevronDown, faChevronRight, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { getContentByKey } from '../../services/api';
import AboutPageEditor from '../../components/admin/AboutPageEditor';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pages, setPages] = useState([]);
    const [pagesOpen, setPagesOpen] = useState(true);
    const [addPagesOpen, setAddPagesOpen] = useState(false);
    const [homeComponentsOpen, setHomeComponentsOpen] = useState(true);
    const [aboutComponentsOpen, setAboutComponentsOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    useEffect(() => {
        const loadPages = async () => {
            try {
                const res = await getContentByKey('pages');
                const list = (res.data && res.data.value) || [];
                setPages(list);
            } catch {
                setPages([
                    { id: 'home', name: 'Home', slug: 'home' },
                    { id: 'about', name: 'About', slug: 'about' }
                ]);
            }
        };
        loadPages();
    }, []);

    const uniquePages = useMemo(() => {
        const map = new Map();
        pages.forEach(p => {
            if (!map.has(p.slug)) map.set(p.slug, p);
        });
        return Array.from(map.values());
    }, [pages]);

    const [pageSections, setPageSections] = useState({});
    useEffect(() => {
        const loadSections = async () => {
            const acc = {};
            for (const p of uniquePages) {
                if (p.slug === 'home' || p.slug === 'about') continue;
                try {
                    const res = await getContentByKey(`page-${p.slug}`);
                    const v = res.data?.value;
                    const list = Array.isArray(v?.sections) ? v.sections : [];
                    acc[p.slug] = list
                        .map((item) => (typeof item === 'string' ? item : item?.type))
                        .filter(Boolean)
                        .filter(t => t !== 'navbar' && t !== 'footer');
                } catch {
                    acc[p.slug] = [];
                }
            }
            setPageSections(acc);
        };
        loadSections();
    }, [uniquePages]);

    const [customPagesOpen, setCustomPagesOpen] = useState({});

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: faHome },
        { id: 'navbar', label: 'Navbar', icon: faLayerGroup },
        { id: 'enquiries', label: 'Enquiries', icon: faLayerGroup },
        { id: 'footer', label: 'Footer', icon: faLayerGroup },
        { id: 'users', label: 'User Management', icon: faUsers },
    ];

    const bars = useMemo(() => {
        return [40, 65, 30, 80, 55, 75, 45, 70, 60, 85, 50, 68];
    }, []);


    return (
        <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
            <aside className="admin-sidebar">
                <div className="brand">
                    <span>Admin</span>
                </div>
                <div className="d-flex flex-column gap-1">
                    {tabs.filter(t => !['footer','users'].includes(t.id)).map(t => (
                        <button
                            key={t.id}
                            className={`nav-link ${activeTab === t.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
                        >
                            <FontAwesomeIcon icon={t.icon} />
                            <span>{t.label}</span>
                        </button>
                    ))}
                    <div
                        className={`nav-link ${activeTab.startsWith('page:') ? 'active' : ''}`}
                        onClick={() => setPagesOpen(v => !v)}
                        role="button"
                        tabIndex={0}
                    >
                        <FontAwesomeIcon icon={pagesOpen ? faChevronDown : faChevronRight} />
                        <span>Pages</span>
                    </div>
                    {pagesOpen && (
                        <div className="nav-sub">
                            {uniquePages.map((p) => {
                                if (p.slug === 'home') {
                                    return (
                                        <div key={p.slug}>
                                            <div
                                                className={`nav-link small ${activeTab.startsWith('home:') ? 'active' : ''}`}
                                                onClick={() => setHomeComponentsOpen(v => !v)}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <FontAwesomeIcon icon={homeComponentsOpen ? faChevronDown : faChevronRight} />
                                                <span>Home</span>
                                            </div>
                                            {homeComponentsOpen && (
                                                <div className="nav-sub-2">
                                                    <div
                                                        className={`nav-link small ${activeTab === 'home:hero' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('home:hero'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ Hero</div>
                                                    <div
                                                        className={`nav-link small ${activeTab === 'home:about' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('home:about'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ About</div>
                                                    <div
                                                        className={`nav-link small ${activeTab === 'home:products' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('home:products'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ Products</div>
                                                    <div
                                                        className={`nav-link small ${activeTab === 'home:solutions' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('home:solutions'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ Solutions</div>
                                                    <div
                                                        className={`nav-link small ${activeTab === 'home:imageGrid' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('home:imageGrid'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ Image Grid</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                if (p.slug === 'about') {
                                    return (
                                        <div key={p.slug}>
                                            <div
                                                className={`nav-link small ${activeTab.startsWith('aboutPage:') ? 'active' : ''}`}
                                                onClick={() => setAboutComponentsOpen(v => !v)}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <FontAwesomeIcon icon={aboutComponentsOpen ? faChevronDown : faChevronRight} />
                                                <span>About</span>
                                            </div>
                                            {aboutComponentsOpen && (
                                                <div className="nav-sub-2">
                                                    <div
                                                        className={`nav-link small ${activeTab === 'aboutPage:hero' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('aboutPage:hero'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ About Hero</div>
                                                    <div
                                                        className={`nav-link small ${activeTab === 'aboutPage:overview' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('aboutPage:overview'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ About Overview</div>
                                                    <div
                                                        className={`nav-link small ${activeTab === 'aboutPage:mission' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('aboutPage:mission'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ About Mission</div>
                                                    <div
                                                        className={`nav-link small ${activeTab === 'aboutPage:started' ? 'active' : ''}`}
                                                        onClick={() => { setActiveTab('aboutPage:started'); setSidebarOpen(false); }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >↪ About Started</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div key={p.slug}>
                                        {(() => {
                                            const isOpen = !!customPagesOpen[p.slug];
                                            return (
                                                <>
                                                    <div
                                                        className={`nav-link small ${isOpen || activeTab === `page:${p.slug}` ? 'active' : ''}`}
                                                        onClick={() => setCustomPagesOpen(prev => ({ ...prev, [p.slug]: !prev[p.slug] }))}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
                                                        <span className="ms-2">{p.name}</span>
                                                    </div>
                                                    {isOpen && Array.isArray(pageSections[p.slug]) && pageSections[p.slug].length > 0 && (
                                                        <div className="nav-sub-2">
                                                            {pageSections[p.slug].map((sec, idx) => (
                                                                <div
                                                                    key={`${p.slug}-${sec}-${idx}`}
                                                                    className={`nav-link small ${activeTab === `page:${p.slug}:${sec}` ? 'active' : ''}`}
                                                                    onClick={() => { setActiveTab(`page:${p.slug}:${sec}`); setSidebarOpen(false); }}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                >
                                                                    ↪ {sec}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                );
                            })}
                            <div
                                className={`nav-link small ${activeTab === 'pagesManager' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('pagesManager'); setSidebarOpen(false); }}
                                role="button"
                                tabIndex={0}
                            >
                                <span className="me-2">↳</span>
                                <span>Manage Pages</span>
                            </div>
                        </div>
                    )}
                    <div
                        className={`nav-link ${activeTab.startsWith('addPage') ? 'active' : ''}`}
                        onClick={() => setAddPagesOpen(v => !v)}
                        role="button"
                        tabIndex={0}
                    >
                        <FontAwesomeIcon icon={addPagesOpen ? faChevronDown : faChevronRight} />
                        <span>Add Pages</span>
                    </div>
                    {addPagesOpen && (
                        <div className="nav-sub">
                            <div
                                className={`nav-link small ${activeTab === 'addPage:blank' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('addPage:blank'); setSidebarOpen(false); }}
                                role="button"
                                tabIndex={0}
                            >
                                <FontAwesomeIcon icon={faSquarePlus} />
                                <span>Blank Page</span>
                            </div>
                        </div>
                    )}
                    {tabs.filter(t => t.id === 'footer' || t.id === 'users').map(t => (
                        <button
                            key={t.id}
                            className={`nav-link ${activeTab === t.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
                        >
                            <FontAwesomeIcon icon={t.icon} />
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>
            </aside>
            <main className="admin-content">
                <div className="admin-topbar">
                    <button className="admin-hamburger" onClick={() => setSidebarOpen(v => !v)}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <div className="d-flex align-items-center gap-3">
                        <span>Overview</span>
                        <button className="btn btn-light" onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOut} />
                        </button>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        <div className="admin-grid">
                            <div className="kpi-card kpi-1 hover-scale">
                                <div className="kpi-title">Weekly Sales</div>
                                <div className="kpi-value">$ 15,0000</div>
                                <div className="kpi-sub">Increased by 60%</div>
                            </div>
                            <div className="kpi-card kpi-2 hover-scale">
                                <div className="kpi-title">Weekly Orders</div>
                                <div className="kpi-value">45,6334</div>
                                <div className="kpi-sub">Decreased by 10%</div>
                            </div>
                            <div className="kpi-card kpi-3 hover-scale">
                                <div className="kpi-title">Visitors Online</div>
                                <div className="kpi-value">95,5741</div>
                                <div className="kpi-sub">Increased by 5%</div>
                            </div>
                        </div>
                        <div className="widgets">
                            <div className="widget-card hover-scale">
                                <div className="widget-title">Visit And Sales Statistics</div>
                                <div className="bar-chart">
                                    {bars.map((h, i) => (
                                        <div key={i} className="bar" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                            <div className="widget-card hover-scale">
                                <div className="widget-title">Traffic Sources</div>
                                <div className="donut" />
                                <div className="legend">
                                    <div className="legend-item"><span className="legend-dot search" /> Search Engines</div>
                                    <div className="legend-item"><span className="legend-dot direct" /> Direct Click</div>
                                    <div className="legend-item"><span className="legend-dot bookmarks" /> Bookmarks Click</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'navbar' && <NavbarEditor />}
                {activeTab === 'hero' && <HeroEditor />}
                {activeTab === 'about' && <AboutEditor />}
                {activeTab === 'products' && <ProductsEditor />}
                {activeTab === 'success' && <SuccessEditor />}
                {activeTab === 'imageGrid' && <ImageGridEditor />}
                {activeTab === 'footer' && <FooterEditor />}
                {activeTab === 'enquiries' && <EnquiriesAdmin />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'pagesManager' && <PagesManager />}
                {(activeTab === 'home:hero') && <HeroEditor />}
                {(activeTab === 'home:about') && <AboutEditor />}
                {(activeTab === 'home:products') && <ProductsEditor />}
                {(activeTab === 'home:solutions') && <SuccessEditor />}
                {(activeTab === 'home:imageGrid') && <ImageGridEditor />}
                {activeTab.startsWith('aboutPage:') && (
                    <AboutPageEditor section={activeTab.split(':')[1]} />
                )}
                {activeTab.startsWith('page:') && (
                    <PageEditor
                        slug={activeTab.split(':')[1]}
                        name={(pages.find(p => p.slug === activeTab.split(':')[1]) || {}).name}
                        focusSection={activeTab.split(':')[2]}
                    />
                )}
                {activeTab === 'addPage:blank' && (
                    <PageEditor
                        createMode
                        slug=""
                        name=""
                        onCreated={(newSlug, newTitle) => {
                            setPages(prev => {
                                const exists = prev.find(p => p.slug === newSlug);
                                if (exists) return prev;
                                return [...prev, { id: newSlug, name: newTitle || newSlug, slug: newSlug }];
                            });
                            setActiveTab(`page:${newSlug}`);
                        }}
                    />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
