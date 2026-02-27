import React, { useEffect, useState } from 'react';
import { getContentByKey, updateContent } from '../../services/api';
import ImageUploader from './ImageUploader';
import { listPages } from '../../utils/pageRegistry';

const PageTemplateWizard = () => {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [sections, setSections] = useState({
        navbar: true,
        hero: true,
        about: true,
        products: true,
        solutions: true,
        imageGrid: true,
        contact: true,
        footer: true
    });
    const [addToNavbar, setAddToNavbar] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [heroOverride, setHeroOverride] = useState('');
    const [slugSuggestions, setSlugSuggestions] = useState([]);

    const toggleSection = (key) => {
        setSections({ ...sections, [key]: !sections[key] });
    };

    // replaced by inline Create Page handler
    useEffect(() => {
        const load = async () => {
            try {
                const pages = await listPages();
                setSlugSuggestions(pages.map(p => p.slug));
            } catch {
                setSlugSuggestions([]);
            }
        };
        load();
    }, []);

    return (
        <div className="card">
            <div className="card-header">
                <h3>Create Page From Home Template</h3>
            </div>
            <div className="card-body">
                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>{message.text}</div>
                )}
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Title</label>
                        <input className="form-control" value={title} onChange={(e) => {
                            const t = e.target.value;
                            setTitle(t);
                            if (!slug) {
                                setSlug(t.toLowerCase().trim().replace(/\s+/g, '-'));
                            }
                        }} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Slug</label>
                        <input
                            className="form-control"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            list="slug-suggest-list"
                        />
                        <datalist id="slug-suggest-list">
                            {slugSuggestions.map(s => (<option key={s} value={s} />))}
                        </datalist>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Sections</label>
                    <div className="row">
                        {Object.keys(sections).map((key) => (
                            <div className="col-6 col-md-3 mb-2" key={key}>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={sections[key]}
                                        onChange={() => toggleSection(key)}
                                        id={`sec-${key}`}
                                    />
                                    <label className="form-check-label" htmlFor={`sec-${key}`}>
                                        {key}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Optional Hero Image Override</label>
                    <ImageUploader currentImage={heroOverride} onUpload={(url) => setHeroOverride(url)} />
                </div>

                {sections.contact && (
                    <div className="card mb-3">
                        <div className="card-header">Contact Section Fields</div>
                        <div className="card-body">
                            <div className="row g-2">
                                <div className="col-md-6">
                                    <label className="form-label">H2 Heading</label>
                                    <input className="form-control" value={sections.contactHeading || ''} onChange={(e)=>setSections({...sections, contactHeading: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">H4 Title (Get in touch)</label>
                                    <input className="form-control" value={sections.contactGetInTouch || ''} onChange={(e)=>setSections({...sections, contactGetInTouch: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">H4 Title (Contact Information)</label>
                                    <input className="form-control" value={sections.contactInfoTitle || ''} onChange={(e)=>setSections({...sections, contactInfoTitle: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone</label>
                                    <input className="form-control" value={sections.contactPhone || ''} onChange={(e)=>setSections({...sections, contactPhone: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email</label>
                                    <input className="form-control" value={sections.contactEmail || ''} onChange={(e)=>setSections({...sections, contactEmail: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Office 1 Label</label>
                                    <input className="form-control" value={sections.contactOffice1Label || ''} onChange={(e)=>setSections({...sections, contactOffice1Label: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Office 1 Address</label>
                                    <input className="form-control" value={sections.contactOffice1Addr || ''} onChange={(e)=>setSections({...sections, contactOffice1Addr: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Office 2 Label</label>
                                    <input className="form-control" value={sections.contactOffice2Label || ''} onChange={(e)=>setSections({...sections, contactOffice2Label: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Office 2 Address</label>
                                    <input className="form-control" value={sections.contactOffice2Addr || ''} onChange={(e)=>setSections({...sections, contactOffice2Addr: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="add-navbar"
                        checked={addToNavbar}
                        onChange={(e) => setAddToNavbar(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="add-navbar">
                        Add to Navbar
                    </label>
                </div>

                <button className="btn btn-primary" onClick={async () => {
                    await (async () => {
                        if (!slug) {
                            setMessage({ type: 'error', text: 'Slug is required' });
                            return;
                        }
                        try {
                            const pagesRes = await getContentByKey('pages');
                            const current = (pagesRes.data && pagesRes.data.value) || [];
                            const exists = current.find(p => p.slug === slug);
                            const updatedPages = exists ? current : [...current, { id: slug, name: title || slug, slug }];

                            const overrides = {};
                            if (sections.contact) {
                                overrides.contact = {
                                    heading: sections.contactHeading || '',
                                    getInTouchTitle: sections.contactGetInTouch || '',
                                    contactInfoTitle: sections.contactInfoTitle || '',
                                    phone: sections.contactPhone || '',
                                    email: sections.contactEmail || '',
                                    offices: [
                                        { label: sections.contactOffice1Label || '', address: sections.contactOffice1Addr || '' },
                                        { label: sections.contactOffice2Label || '', address: sections.contactOffice2Addr || '' }
                                    ]
                                };
                            }
                            await updateContent({ key: 'page-' + slug, value: { title: title || slug, sections: Object.keys(sections).filter(k => sections[k] === true), overrides: { ...overrides, hero: heroOverride ? { title: heroOverride } : {} } } });
                            await updateContent({ key: 'pages', value: updatedPages });

                            if (addToNavbar) {
                                const navRes = await getContentByKey('navbar');
                                const nav = (navRes.data && navRes.data.value) || { logo: '', menuItems: [] };
                                const already = nav.menuItems.find(i => i.link === '/' + slug);
                                if (!already) {
                                    nav.menuItems = [...nav.menuItems, { text: title || slug, link: '/' + slug }];
                                    await updateContent({ key: 'navbar', value: nav });
                                }
                            }
                            setMessage({ type: 'success', text: 'Template page created successfully' });
                        } catch (err) {
                            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create page' });
                        }
                    })();
                }}>Create Page</button>
            </div>
        </div>
    );
};

export default PageTemplateWizard;
