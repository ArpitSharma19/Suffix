import React, { useState, useEffect } from 'react';
import { getContentByKey, updateContent } from '../../services/api';
import ImageUploader from './ImageUploader';

const NavbarEditor = () => {
    const [content, setContent] = useState({ logo: '', logoId: '', menuItems: [] });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [sectionOptions, setSectionOptions] = useState({});

    const fetchContent = async () => {
        try {
            const { data } = await getContentByKey('navbar');
            if (data) setContent(data.value);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching navbar content:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            fetchContent();
        }, 0);
    }, []);

    useEffect(() => {
        const load = async () => {
            const acc = {};
            for (let i = 0; i < (content.menuItems || []).length; i += 1) {
                const item = content.menuItems[i] || {};
                const link = (item.link || '').trim();
                try {
                    if (link === '/' || link === '') {
                        acc[i] = ['home', 'about', 'products', 'solutions', 'careers', 'contact'];
                    } else if (link.toLowerCase() === '/about') {
                        acc[i] = ['aboutHero', 'aboutOverview', 'aboutMission', 'aboutStarted', 'contact'];
                    } else if (link.startsWith('/')) {
                        const slug = link.replace(/^\//, '');
                        const res = await getContentByKey('page-' + slug);
                        const v = res.data?.value;
                        const list = Array.isArray(v?.sections) ? v.sections : [];
                        const secs = list
                            .map((s) => (typeof s === 'string' ? s : s?.type))
                            .filter(Boolean)
                            .filter((t) => t !== 'navbar' && t !== 'footer');
                        acc[i] = [...secs, 'contact'];
                    } else {
                        acc[i] = [];
                    }
                } catch {
                    acc[i] = ['contact'];
                }
            }
            setSectionOptions(acc);
        };
        load();
    }, [content.menuItems]);

    const handleSave = async () => {
        try {
            await updateContent({ key: 'navbar', value: content });
            setMessage({ type: 'success', text: 'Navbar updated successfully' });
        } catch (error) {
            console.error('Error updating navbar:', error);
            setMessage({ type: 'error', text: 'Error updating navbar' });
        }
    };

    const handleImageUpload = (url, id) => {
        setContent({ ...content, logo: url, logoId: id });
    };
    const persistLogo = async (url, id) => {
        const next = { ...content, logo: url, logoId: id };
        setContent(next);
        await updateContent({ key: 'navbar', value: next });
        setMessage({ type: 'success', text: 'Logo saved' });
    };

    const updateMenuItem = (index, field, value) => {
        const newItems = [...content.menuItems];
        newItems[index][field] = value;
        setContent({ ...content, menuItems: newItems });
    };

    const addMenuItem = () => {
        setContent({
            ...content,
            menuItems: [...content.menuItems, { text: '', link: '', isPrimary: false, submenu: [] }]
        });
    };

    const removeMenuItem = (index) => {
        const newItems = content.menuItems.filter((_, i) => i !== index);
        setContent({ ...content, menuItems: newItems });
    };

    const moveMenuItem = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= content.menuItems.length) return;
        const next = [...content.menuItems];
        const [item] = next.splice(index, 1);
        next.splice(newIndex, 0, item);
        setContent({ ...content, menuItems: next });
    };

    const addSubmenuItem = (menuIndex) => {
        const newItems = [...content.menuItems];
        const list = Array.isArray(newItems[menuIndex].submenu) ? newItems[menuIndex].submenu : [];
        newItems[menuIndex].submenu = [...list, { label: '', target: '' }];
        setContent({ ...content, menuItems: newItems });
    };

    const updateSubmenuItem = (menuIndex, index, field, value) => {
        const newItems = [...content.menuItems];
        const list = Array.isArray(newItems[menuIndex].submenu) ? [...newItems[menuIndex].submenu] : [];
        list[index] = { ...(list[index] || {}), [field]: value };
        newItems[menuIndex].submenu = list;
        setContent({ ...content, menuItems: newItems });
    };

    const removeSubmenuItem = (menuIndex, index) => {
        const newItems = [...content.menuItems];
        const list = Array.isArray(newItems[menuIndex].submenu) ? [...newItems[menuIndex].submenu] : [];
        newItems[menuIndex].submenu = list.filter((_, i) => i !== index);
        setContent({ ...content, menuItems: newItems });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card">
            <div className="card-header">
                <h3>Navbar Editor</h3>
            </div>
            <div className="card-body">
                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                        {message.text}
                    </div>
                )}

                <div className="mb-4">
                    <label className="form-label">Logo</label>
                        <ImageUploader onUpload={handleImageUpload} onPersist={persistLogo} currentImage={content.logo} currentImageId={content.logoId} />
                </div>

                <h4>Menu Items</h4>
                {content.menuItems.map((item, index) => (
                    <div key={index} className="card mb-3">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-5">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Text"
                                        value={item.text}
                                        onChange={(e) => updateMenuItem(index, 'text', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-5">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Base Link (e.g. /, /about, /products)"
                                        value={item.link}
                                        onChange={(e) => updateMenuItem(index, 'link', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <div className="btn-group d-flex">
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => moveMenuItem(index, -1)}
                                            title="Move Up"
                                        >
                                            ↑
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => moveMenuItem(index, 1)}
                                            title="Move Down"
                                        >
                                            ↓
                                        </button>
                                        <button 
                                            className="btn btn-danger"
                                            onClick={() => removeMenuItem(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={item.isPrimary || false}
                                    onChange={(e) => updateMenuItem(index, 'isPrimary', e.target.checked)}
                                />
                                <label className="form-check-label">Is Primary Button?</label>
                            </div>
                            <div className="mt-3">
                                <h6 className="mb-2">Submenu (optional)</h6>
                                <p className="text-muted mb-2">Add section links for this menu item (target is section id on the page).</p>
                                {(item.submenu || []).map((sm, smIndex) => (
                                    <div className="row g-2 align-items-center mb-2" key={smIndex}>
                                        <div className="col-md-5">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Label (e.g. Products)"
                                                value={sm.label || ''}
                                                onChange={(e) => updateSubmenuItem(index, smIndex, 'label', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-5">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Target Section Id (e.g. products)"
                                                value={sm.target || ''}
                                                onChange={(e) => updateSubmenuItem(index, smIndex, 'target', e.target.value)}
                                                list={`sections-${index}`}
                                            />
                                            <datalist id={`sections-${index}`}>
                                                {(sectionOptions[index] || []).map((sec) => (
                                                    <option key={sec} value={sec} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="col-md-2">
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={() => removeSubmenuItem(index, smIndex)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => addSubmenuItem(index)}
                                >
                                    Add Submenu Item
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                <button className="btn btn-secondary mb-3" onClick={addMenuItem}>Add Menu Item</button>

                <div>
                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default NavbarEditor;
