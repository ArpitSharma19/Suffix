import React, { useEffect, useState } from 'react';
import { getContentByKey, updateContent } from '../../services/api';
import ImageUploader from './ImageUploader';

const defaultSections = [
    'navbar',
    'hero',
    'about',
    'products',
    'solutions',
    'imageGrid',
    'contact',
    // About page style sections for reuse in dynamic pages
    'aboutHero',
    'aboutOverview',
    'aboutMission',
    'aboutStarted'
];
const editableSections = [
    'hero',
    'about',
    'products',
    'solutions',
    'imageGrid',
    'contact',
    'aboutHero',
    'aboutOverview',
    'aboutMission',
    'aboutStarted'
];

const PageEditor = ({ slug: initialSlug, name: initialName, createMode = false, onCreated, focusSection }) => {
    const [slug, setSlug] = useState(initialSlug || '');
    const [title, setTitle] = useState(initialName || '');
    const [sections, setSections] = useState(createMode ? [] : defaultSections);
    const [overrides, setOverrides] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(!createMode);
    const [overviewParagraphDrafts, setOverviewParagraphDrafts] = useState([]);
    const [newSectionType, setNewSectionType] = useState(editableSections[0]);

    useEffect(() => {
        if (!createMode && initialSlug) {
            const load = async () => {
                try {
                    const res = await getContentByKey(`page-${initialSlug}`);
                    if (res.data && res.data.value) {
                        const v = res.data.value;
                        setTitle(v.title || initialName || '');
                        const incoming = Array.isArray(v.sections) ? v.sections : [];
                        const base = (initialSlug === 'home' || initialSlug === 'about')
                            ? (incoming.length ? incoming : defaultSections)
                            : incoming;
                        const sanitized = base.filter(s => (typeof s === 'string' ? s !== 'footer' : s.type !== 'footer'));
                        setSections(sanitized);
                        setOverrides(v.overrides || {});
                    } else {
                        setSections((initialSlug === 'home' || initialSlug === 'about') ? defaultSections : []);
                        setOverrides({});
                    }
                } catch {
                    /* no-op */
                } finally {
                    setLoading(false);
                }
            };
            load();
        }
    }, [createMode, initialSlug, initialName]);

    const persist = async (next) => {
        await updateContent({
            key: `page-${slug}`,
            value: { title, sections, overrides, ...next }
        });
    };

    const save = async () => {
        if (!slug.trim()) {
            setMessage({ type: 'error', text: 'Slug is required' });
            return;
        }
        try {
            await persist();

            if (createMode) {
                const pagesRes = await getContentByKey('pages');
                const current = (pagesRes.data && pagesRes.data.value) || [];
                const exists = current.find(p => p.slug === slug);
                if (!exists) {
                    const updated = [...current, { id: slug, name: title || slug, slug }];
                    await updateContent({ key: 'pages', value: updated });
                }
                if (onCreated) {
                    onCreated(slug, title || slug);
                }
            }

            setMessage({ type: 'success', text: 'Page saved successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save page' });
        }
    };

    const moveSection = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= sections.length) return;
        const next = [...sections];
        const [item] = next.splice(index, 1);
        next.splice(newIndex, 0, item);
        setSections(next);
    };

    const toggleSection = (sec) => {
        const exists = sections.some(s => (typeof s === 'string' ? s === sec : s.type === sec));
        if (exists) {
            setSections(sections.filter(s => (typeof s === 'string' ? s !== sec : s.type !== sec)));
        } else {
            setSections([...sections, sec]);
        }
    };

    const updateOverrideField = (sec, field, value) => {
        const next = { ...overrides, [sec]: { ...(overrides[sec] || {}), [field]: value } };
        setOverrides(next);
    };

    const persistOverrideImage = (sec) => async (url, id) => {
        const nextOverrides = { ...overrides, [sec]: { ...(overrides[sec] || {}), image: url, imageId: id } };
        setOverrides(nextOverrides);
        await persist({ overrides: nextOverrides });
        setMessage({ type: 'success', text: `${sec} image saved` });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card">
            <div className="card-header">
                <h3>{createMode ? 'Create Page' : `Edit Page: ${title || initialName}`}</h3>
            </div>
            <div className="card-body">
                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                        {message.text}
                    </div>
                )}
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Title</label>
                        <input
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Slug</label>
                        <input
                            className="form-control"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            disabled={!createMode}
                        />
                    </div>
                </div>
                {createMode ? (
                    <div className="mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <select className="form-select w-auto" value={newSectionType} onChange={(e) => setNewSectionType(e.target.value)}>
                                {editableSections.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button className="btn btn-outline-primary" onClick={() => {
                                setSections([...sections, { type: newSectionType, overrides: {} }]);
                            }}>Add Section</button>
                        </div>
                    </div>
                ) : (
                    (initialSlug === 'home' || initialSlug === 'about') && (
                        <div className="mb-3">
                            <label className="form-label">Sections Order</label>
                            <div className="d-flex flex-wrap gap-2">
                                {sections.map((sec, idx) => {
                                    const label = typeof sec === 'string' ? sec : sec.type;
                                    return (
                                        <div key={idx} className="d-flex align-items-center gap-2 border rounded px-2 py-1">
                                            <span>{label}</span>
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-2">
                                <select className="form-select w-auto" value={newSectionType} onChange={(e) => setNewSectionType(e.target.value)}>
                                    {editableSections.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button className="btn btn-outline-primary" onClick={() => {
                                    setSections([...sections, { type: newSectionType, overrides: {} }]);
                                }}>Add Section</button>
                            </div>
                        </div>
                    )
                )}

                {!createMode && !focusSection && (
                    <div className="mb-3">
                        <label className="form-label">Enable/Disable Sections</label>
                        <div className="d-flex flex-wrap gap-3">
                            {defaultSections.map((sec) => (
                                <div key={sec} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`chk-${sec}`}
                                        checked={sections.some(s => (typeof s === 'string' ? s === sec : s.type === sec))}
                                        onChange={() => toggleSection(sec)}
                                    />
                                    <label className="form-check-label" htmlFor={`chk-${sec}`}>{sec}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <hr />

                {(!createMode && !focusSection && (initialSlug === 'home' || initialSlug === 'about')) && (
                <>
                <h5>Section Content Overrides</h5>
                <p className="text-muted">Override fields to match each section’s component format.</p>
                {editableSections.map((sec) => {
                    const o = overrides[sec] || {};
                    if (sec === 'hero') {
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input className="form-control" value={o.title || ''} onChange={(e) => updateOverrideField(sec, 'title', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subtitle</label>
                                        <textarea className="form-control" value={o.subtitle || ''} onChange={(e) => updateOverrideField(sec, 'subtitle', e.target.value)} />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Button Text</label>
                                            <input className="form-control" value={o.buttonText || ''} onChange={(e) => updateOverrideField(sec, 'buttonText', e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Button Link</label>
                                            <input className="form-control" value={o.buttonLink || ''} onChange={(e) => updateOverrideField(sec, 'buttonLink', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <ImageUploader
                                                label="Main Image 1"
                                                currentImage={o.main1 || ''}
                                                currentImageId={o.main1Id || ''}
                                                onUpload={(url, id) => { updateOverrideField(sec, 'main1', url); updateOverrideField(sec, 'main1Id', id); }}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <ImageUploader
                                                label="Main Image 2"
                                                currentImage={o.main2 || ''}
                                                currentImageId={o.main2Id || ''}
                                                onUpload={(url, id) => { updateOverrideField(sec, 'main2', url); updateOverrideField(sec, 'main2Id', id); }}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <ImageUploader
                                                label="Main Image 3"
                                                currentImage={o.main3 || ''}
                                                currentImageId={o.main3Id || ''}
                                                onUpload={(url, id) => { updateOverrideField(sec, 'main3', url); updateOverrideField(sec, 'main3Id', id); }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 mt-4">
                                        <label className="form-label">Partner Text</label>
                                        <input className="form-control" value={o.partnerText || ''} onChange={(e) => updateOverrideField(sec, 'partnerText', e.target.value)} />
                                    </div>
                                    <h5>Partner Logos</h5>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {(o.partnerLogos || []).map((logo, index) => (
                                            <div key={index} className="position-relative">
                                                <img src={logo} alt="Partner" style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid #ddd' }} />
                                                <button
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                    onClick={() => {
                                                        const next = (o.partnerLogos || []).filter((_, i) => i !== index);
                                                        updateOverrideField(sec, 'partnerLogos', next);
                                                    }}
                                                >x</button>
                                            </div>
                                        ))}
                                    </div>
                                    <ImageUploader label="Add Partner Logo" onUpload={(url) => {
                                        const next = [...(o.partnerLogos || []), url];
                                        updateOverrideField(sec, 'partnerLogos', next);
                                    }} />
                                </div>
                            </div>
                        );
                    }
                    if (sec === 'about') {
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Heading</label>
                                        <input className="form-control" value={o.heading || ''} onChange={(e) => updateOverrideField(sec, 'heading', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subheading</label>
                                        <textarea className="form-control" value={o.subheading || ''} onChange={(e) => updateOverrideField(sec, 'subheading', e.target.value)} />
                                    </div>
                                    {(o.cards || []).map((card, index) => (
                                        <div key={index} className="card mb-3 p-3">
                                            <div className="d-flex justify-content-between">
                                                <h5>Card {index + 1}</h5>
                                                <button className="btn btn-danger btn-sm" onClick={() => {
                                                    const next = (o.cards || []).filter((_, i) => i !== index);
                                                    updateOverrideField(sec, 'cards', next);
                                                }}>Delete</button>
                                            </div>
                                            <div className="mb-2">
                                                <label>Title</label>
                                                <input className="form-control" value={card.title || ''} onChange={(e) => {
                                                    const next = [...(o.cards || [])];
                                                    next[index] = { ...(next[index] || {}), title: e.target.value };
                                                    updateOverrideField(sec, 'cards', next);
                                                }} />
                                            </div>
                                            <div className="mb-2">
                                                <label>Description</label>
                                                <textarea className="form-control" value={card.description || ''} onChange={(e) => {
                                                    const next = [...(o.cards || [])];
                                                    next[index] = { ...(next[index] || {}), description: e.target.value };
                                                    updateOverrideField(sec, 'cards', next);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button className="btn btn-primary" onClick={() => {
                                        const next = [...(o.cards || []), { title: '', description: '' }];
                                        updateOverrideField(sec, 'cards', next);
                                    }}>Add Card</button>
                                </div>
                            </div>
                        );
                    }
                    if (sec === 'products') {
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Heading</label>
                                        <input className="form-control" value={o.heading || ''} onChange={(e) => updateOverrideField(sec, 'heading', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subheading</label>
                                        <textarea className="form-control" value={o.subheading || ''} onChange={(e) => updateOverrideField(sec, 'subheading', e.target.value)} />
                                    </div>
                                    {(o.cards || []).map((card, index) => (
                                        <div key={index} className="card mb-3 p-3">
                                            <div className="d-flex justify-content-between">
                                                <h5>Product {index + 1}</h5>
                                                <button className="btn btn-danger btn-sm" onClick={() => {
                                                    const next = (o.cards || []).filter((_, i) => i !== index);
                                                    updateOverrideField(sec, 'cards', next);
                                                }}>Delete</button>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-2">
                                                        <label>Title</label>
                                                        <input className="form-control" value={card.title || ''} onChange={(e) => {
                                                            const next = [...(o.cards || [])];
                                                            next[index] = { ...(next[index] || {}), title: e.target.value };
                                                            updateOverrideField(sec, 'cards', next);
                                                        }} />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label>Subtitle</label>
                                                        <input className="form-control" value={card.subtitle || ''} onChange={(e) => {
                                                            const next = [...(o.cards || [])];
                                                            next[index] = { ...(next[index] || {}), subtitle: e.target.value };
                                                            updateOverrideField(sec, 'cards', next);
                                                        }} />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label>Background Class</label>
                                                        <select className="form-control" value={card.bg || 'bg-1'} onChange={(e) => {
                                                            const next = [...(o.cards || [])];
                                                            next[index] = { ...(next[index] || {}), bg: e.target.value };
                                                            updateOverrideField(sec, 'cards', next);
                                                        }}>
                                                            <option value="bg-1">bg-1</option>
                                                            <option value="bg-2">bg-2</option>
                                                            <option value="bg-3">bg-3</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <ImageUploader
                                                        label="Product Image"
                                                        currentImage={card.images || ''}
                                                        currentImageId={card.imageId || ''}
                                                        onUpload={(url, id) => {
                                                            const next = [...(o.cards || [])];
                                                            next[index] = { ...(next[index] || {}), images: url, imageId: id };
                                                            updateOverrideField(sec, 'cards', next);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <label>Description</label>
                                                <textarea className="form-control" value={card.description || ''} onChange={(e) => {
                                                    const next = [...(o.cards || [])];
                                                    next[index] = { ...(next[index] || {}), description: e.target.value };
                                                    updateOverrideField(sec, 'cards', next);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button className="btn btn-primary" onClick={() => {
                                        const next = [...(o.cards || []), { title: '', subtitle: '', description: '', bg: 'bg-1', images: '', imageId: '' }];
                                        updateOverrideField(sec, 'cards', next);
                                    }}>Add Product</button>
                                </div>
                            </div>
                        );
                    }
                    if (sec === 'solutions') {
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Heading</label>
                                        <input className="form-control" value={o.heading || ''} onChange={(e) => updateOverrideField(sec, 'heading', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subheading</label>
                                        <textarea className="form-control" value={o.subheading || ''} onChange={(e) => updateOverrideField(sec, 'subheading', e.target.value)} />
                                    </div>
                                    <h5>Slides</h5>
                                    {(o.slides || []).map((slide, index) => (
                                        <div key={index} className="card mb-3 p-3">
                                            <div className="mb-3">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" value={slide.title || ''} onChange={(e) => {
                                                    const next = [...(o.slides || [])];
                                                    next[index] = { ...(next[index] || {}), title: e.target.value };
                                                    updateOverrideField(sec, 'slides', next);
                                                }} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea className="form-control" value={slide.description || ''} onChange={(e) => {
                                                    const next = [...(o.slides || [])];
                                                    next[index] = { ...(next[index] || {}), description: e.target.value };
                                                    updateOverrideField(sec, 'slides', next);
                                                }} />
                                            </div>
                                            <button className="btn btn-danger" onClick={() => {
                                                const next = (o.slides || []).filter((_, i) => i !== index);
                                                updateOverrideField(sec, 'slides', next);
                                            }}>Remove Slide</button>
                                        </div>
                                    ))}
                                    <button className="btn btn-secondary" onClick={() => {
                                        const next = [...(o.slides || []), { title: '', description: '' }];
                                        updateOverrideField(sec, 'slides', next);
                                    }}>Add Slide</button>
                                </div>
                            </div>
                        );
                    }
                    if (sec === 'imageGrid') {
                        const keys = ['experience','insight','innovate','accelerate','assure'];
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {keys.map((k) => {
                                            const item = (o[k]) || {};
                                            return (
                                                <div key={k} className="col-md-6 mb-4">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h5>{item.label || k.charAt(0).toUpperCase() + k.slice(1)}</h5>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="mb-3">
                                                                <label className="form-label">Image</label>
                                                                <ImageUploader
                                                                    onUpload={(url, id) => {
                                                                        const next = { ...(o[k] || {}), image: url, imageId: id };
                                                                        updateOverrideField(sec, k, next);
                                                                    }}
                                                                    currentImage={item.image || ''}
                                                                    currentImageId={item.imageId || ''}
                                                                />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="form-label">Title</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={item.label || ''}
                                                                    onChange={(e) => {
                                                                        const next = { ...(o[k] || {}), label: e.target.value };
                                                                        updateOverrideField(sec, k, next);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="form-label">Link</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={item.link || ''}
                                                                    onChange={(e) => {
                                                                        const next = { ...(o[k] || {}), link: e.target.value };
                                                                        updateOverrideField(sec, k, next);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (sec === 'aboutHero') {
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Line 1</label>
                                                <input className="form-control" value={o.line1 || ''} onChange={(e) => updateOverrideField(sec, 'line1', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Line 2</label>
                                                <input className="form-control" value={o.line2 || ''} onChange={(e) => updateOverrideField(sec, 'line2', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <ImageUploader
                                                label="Image"
                                                currentImage={o.image || ''}
                                                currentImageId={o.imageId || ''}
                                                onUpload={(url, id) => { updateOverrideField(sec, 'image', url); updateOverrideField(sec, 'imageId', id); }}
                                                onPersist={persistOverrideImage(sec)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (sec === 'aboutOverview') {
                        const paragraphs = o.paragraphs || overviewParagraphDrafts;
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" value={o.title || ''} onChange={(e) => updateOverrideField(sec, 'title', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Paragraphs</label>
                                                {(paragraphs || []).map((p, i) => (
                                                    <div className="d-flex gap-2 mb-2" key={i}>
                                                        <textarea
                                                            className="form-control"
                                                            value={p}
                                                            onChange={(e) => {
                                                                const next = [...(paragraphs || [])];
                                                                next[i] = e.target.value;
                                                                setOverviewParagraphDrafts(next);
                                                                updateOverrideField(sec, 'paragraphs', next);
                                                            }}
                                                        />
                                                        <button className="btn btn-outline-danger" onClick={() => {
                                                            const next = (paragraphs || []).filter((_, idx) => idx !== i);
                                                            setOverviewParagraphDrafts(next);
                                                            updateOverrideField(sec, 'paragraphs', next);
                                                        }}>Delete</button>
                                                    </div>
                                                ))}
                                                <button className="btn btn-outline-primary" onClick={() => {
                                                    const next = [...(paragraphs || []), ''];
                                                    setOverviewParagraphDrafts(next);
                                                    updateOverrideField(sec, 'paragraphs', next);
                                                }}>Add Paragraph</button>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <ImageUploader
                                                label="Image"
                                                currentImage={o.image || ''}
                                                currentImageId={o.imageId || ''}
                                                onUpload={(url, id) => { updateOverrideField(sec, 'image', url); updateOverrideField(sec, 'imageId', id); }}
                                                onPersist={persistOverrideImage(sec)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (sec === 'aboutMission') {
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" value={o.title || ''} onChange={(e) => updateOverrideField(sec, 'title', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Text</label>
                                                <textarea className="form-control" value={o.text || ''} onChange={(e) => updateOverrideField(sec, 'text', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <ImageUploader
                                                label="Image"
                                                currentImage={o.image || ''}
                                                currentImageId={o.imageId || ''}
                                                onUpload={(url, id) => { updateOverrideField(sec, 'image', url); updateOverrideField(sec, 'imageId', id); }}
                                                onPersist={persistOverrideImage(sec)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (sec === 'aboutStarted') {
                        return (
                            <div className="card mb-3" key={sec}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{sec}</span>
                                    <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" value={o.title || ''} onChange={(e) => updateOverrideField(sec, 'title', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Lead</label>
                                                <input className="form-control" value={o.lead || ''} onChange={(e) => updateOverrideField(sec, 'lead', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Text</label>
                                                <textarea className="form-control" value={o.text || ''} onChange={(e) => updateOverrideField(sec, 'text', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <ImageUploader
                                                label="Image"
                                                currentImage={o.image || ''}
                                                currentImageId={o.imageId || ''}
                                                onUpload={(url, id) => { updateOverrideField(sec, 'image', url); updateOverrideField(sec, 'imageId', id); }}
                                                onPersist={persistOverrideImage(sec)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div className="card mb-3" key={sec}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span>{sec}</span>
                                <span className="badge bg-light text-dark">{sections.includes(sec) ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <label className="form-label">Title</label>
                                            <input className="form-control" value={o.title || ''} onChange={(e) => updateOverrideField(sec, 'title', e.target.value)} />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label">Subtitle</label>
                                            <input className="form-control" value={o.subtitle || ''} onChange={(e) => updateOverrideField(sec, 'subtitle', e.target.value)} />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label">Body</label>
                                            <textarea className="form-control" value={o.body || ''} onChange={(e) => updateOverrideField(sec, 'body', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <ImageUploader
                                            label="Image"
                                            currentImage={o.image || ''}
                                            currentImageId={o.imageId || ''}
                                            onUpload={(url, id) => { updateOverrideField(sec, 'image', url); updateOverrideField(sec, 'imageId', id); }}
                                            onPersist={persistOverrideImage(sec)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                </>
                )}

                <hr />
                <h5>{focusSection ? `Edit Section: ${focusSection}` : 'Edit All Instances'}</h5>
                <p className="text-muted">
                    {focusSection ? 'Edit only the selected section’s content.' : 'Manage order and content for multiple instances of sections.'}
                </p>
                {(
                    focusSection
                        ? (() => {
                            const filtered = sections.filter((secItem) => {
                                const type = typeof secItem === 'string' ? secItem : secItem.type;
                                return type === focusSection;
                            });
                            return filtered.length ? filtered : [{ type: focusSection, overrides: {}, __virtual: true }];
                        })()
                        : sections
                ).map((secItem, idx) => {
                    const type = typeof secItem === 'string' ? secItem : secItem.type;
                    const o = typeof secItem === 'string' ? (overrides[type] || {}) : (secItem.overrides || {});
                    const setField = (field, value) => {
                        if (typeof secItem === 'string') {
                            updateOverrideField(type, field, value);
                        } else {
                            if (secItem.__virtual) {
                                const next = [...sections, { type, overrides: { [field]: value } }];
                                setSections(next);
                                persist({ sections: next });
                            } else {
                                const next = [...sections];
                                next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), [field]: value } };
                                setSections(next);
                            }
                        }
                    };
                    const persistImage = async (url, id) => {
                        if (typeof secItem === 'string') {
                            await persistOverrideImage(type)(url, id);
                        } else {
                            if (secItem.__virtual) {
                                const next = [...sections, { type, overrides: { image: url, imageId: id } }];
                                setSections(next);
                                await persist({ sections: next });
                                setMessage({ type: 'success', text: `${type} image saved` });
                            } else {
                                const next = [...sections];
                                next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), image: url, imageId: id } };
                                setSections(next);
                                await persist({ sections: next });
                                setMessage({ type: 'success', text: `${type} image saved` });
                            }
                        }
                    };
                    if (type === 'hero') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <span className="badge bg-light text-dark">#{idx + 1}</span>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input className="form-control" value={o.title || ''} onChange={(e) => setField('title', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subtitle</label>
                                        <textarea className="form-control" value={o.subtitle || ''} onChange={(e) => setField('subtitle', e.target.value)} />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Button Text</label>
                                            <input className="form-control" value={o.buttonText || ''} onChange={(e) => setField('buttonText', e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Button Link</label>
                                            <input className="form-control" value={o.buttonLink || ''} onChange={(e) => setField('buttonLink', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <ImageUploader
                                                label="Main Image 1"
                                                currentImage={o.main1 || ''}
                                                currentImageId={o.main1Id || ''}
                                                onUpload={(url, id) => { setField('main1', url); setField('main1Id', id); }}
                                                onPersist={persistImage}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <ImageUploader
                                                label="Main Image 2"
                                                currentImage={o.main2 || ''}
                                                currentImageId={o.main2Id || ''}
                                                onUpload={(url, id) => { setField('main2', url); setField('main2Id', id); }}
                                                onPersist={persistImage}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <ImageUploader
                                                label="Main Image 3"
                                                currentImage={o.main3 || ''}
                                                currentImageId={o.main3Id || ''}
                                                onUpload={(url, id) => { setField('main3', url); setField('main3Id', id); }}
                                                onPersist={persistImage}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 mt-4">
                                        <label className="form-label">Partner Text</label>
                                        <input className="form-control" value={o.partnerText || ''} onChange={(e) => setField('partnerText', e.target.value)} />
                                    </div>
                                    <h5>Partner Logos</h5>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {(o.partnerLogos || []).map((logo, index) => (
                                            <div key={index} className="position-relative">
                                                <img src={logo} alt="Partner" style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid #ddd' }} />
                                                <button
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                    onClick={() => {
                                                        const nextLogos = (o.partnerLogos || []).filter((_, i) => i !== index);
                                                        const next = [...sections];
                                                        next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), partnerLogos: nextLogos } };
                                                        setSections(next);
                                                    }}
                                                >x</button>
                                            </div>
                                        ))}
                                    </div>
                                    <ImageUploader label="Add Partner Logo" onUpload={(url) => {
                                        const nextLogos = [...(o.partnerLogos || []), url];
                                        const next = [...sections];
                                        next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), partnerLogos: nextLogos } };
                                        setSections(next);
                                    }} />
                                </div>
                            </div>
                        );
                    }
                    if (type === 'about') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Heading</label>
                                        <input className="form-control" value={o.heading || ''} onChange={(e) => setField('heading', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subheading</label>
                                        <textarea className="form-control" value={o.subheading || ''} onChange={(e) => setField('subheading', e.target.value)} />
                                    </div>
                                    {(o.cards || []).map((card, index) => (
                                        <div key={index} className="card mb-3 p-3">
                                            <div className="d-flex justify-content-between">
                                                <h5>Card {index + 1}</h5>
                                                <button className="btn btn-danger btn-sm" onClick={() => {
                                                    const next = (o.cards || []).filter((_, i) => i !== index);
                                                    const nextSections = [...sections];
                                                    nextSections[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: next } };
                                                    setSections(nextSections);
                                                }}>Delete</button>
                                            </div>
                                            <div className="mb-2">
                                                <label>Title</label>
                                                <input className="form-control" value={card.title || ''} onChange={(e) => {
                                                    const next = [...(o.cards || [])];
                                                    next[index] = { ...(next[index] || {}), title: e.target.value };
                                                    const nextSections = [...sections];
                                                    nextSections[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: next } };
                                                    setSections(nextSections);
                                                }} />
                                            </div>
                                            <div className="mb-2">
                                                <label>Description</label>
                                                <textarea className="form-control" value={card.description || ''} onChange={(e) => {
                                                    const next = [...(o.cards || [])];
                                                    next[index] = { ...(next[index] || {}), description: e.target.value };
                                                    const nextSections = [...sections];
                                                    nextSections[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: next } };
                                                    setSections(nextSections);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button className="btn btn-primary" onClick={() => {
                                        const next = [...(o.cards || []), { title: '', description: '' }];
                                        const nextSections = [...sections];
                                        nextSections[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: next } };
                                        setSections(nextSections);
                                    }}>Add Card</button>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'products') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Heading</label>
                                        <input className="form-control" value={o.heading || ''} onChange={(e) => setField('heading', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subheading</label>
                                        <textarea className="form-control" value={o.subheading || ''} onChange={(e) => setField('subheading', e.target.value)} />
                                    </div>
                                    {(o.cards || []).map((card, index) => (
                                        <div key={index} className="card mb-3 p-3">
                                            <div className="d-flex justify-content-between">
                                                <h5>Product {index + 1}</h5>
                                                <button className="btn btn-danger btn-sm" onClick={() => {
                                                    const nextCards = (o.cards || []).filter((_, i) => i !== index);
                                                    const next = [...sections];
                                                    next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: nextCards } };
                                                    setSections(next);
                                                }}>Delete</button>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-2">
                                                        <label>Title</label>
                                                        <input className="form-control" value={card.title || ''} onChange={(e) => {
                                                            const nextCards = [...(o.cards || [])];
                                                            nextCards[index] = { ...(nextCards[index] || {}), title: e.target.value };
                                                            const next = [...sections];
                                                            next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: nextCards } };
                                                            setSections(next);
                                                        }} />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label>Subtitle</label>
                                                        <input className="form-control" value={card.subtitle || ''} onChange={(e) => {
                                                            const nextCards = [...(o.cards || [])];
                                                            nextCards[index] = { ...(nextCards[index] || {}), subtitle: e.target.value };
                                                            const next = [...sections];
                                                            next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: nextCards } };
                                                            setSections(next);
                                                        }} />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label>Background Class</label>
                                                        <select className="form-control" value={card.bg || 'bg-1'} onChange={(e) => {
                                                            const nextCards = [...(o.cards || [])];
                                                            nextCards[index] = { ...(nextCards[index] || {}), bg: e.target.value };
                                                            const next = [...sections];
                                                            next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: nextCards } };
                                                            setSections(next);
                                                        }}>
                                                            <option value="bg-1">bg-1</option>
                                                            <option value="bg-2">bg-2</option>
                                                            <option value="bg-3">bg-3</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <ImageUploader
                                                        label="Product Image"
                                                        currentImage={card.images || ''}
                                                        currentImageId={card.imageId || ''}
                                                        onUpload={(url, id) => {
                                                            const nextCards = [...(o.cards || [])];
                                                            nextCards[index] = { ...(nextCards[index] || {}), images: url, imageId: id };
                                                            const next = [...sections];
                                                            next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: nextCards } };
                                                            setSections(next);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <label>Description</label>
                                                <textarea className="form-control" value={card.description || ''} onChange={(e) => {
                                                    const nextCards = [...(o.cards || [])];
                                                    nextCards[index] = { ...(nextCards[index] || {}), description: e.target.value };
                                                    const next = [...sections];
                                                    next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: nextCards } };
                                                    setSections(next);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button className="btn btn-primary" onClick={() => {
                                        const nextCards = [...(o.cards || []), { title: '', subtitle: '', description: '', bg: 'bg-1', images: '', imageId: '' }];
                                        const next = [...sections];
                                        next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), cards: nextCards } };
                                        setSections(next);
                                    }}>Add Product</button>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'solutions') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Heading</label>
                                        <input className="form-control" value={o.heading || ''} onChange={(e) => setField('heading', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subheading</label>
                                        <textarea className="form-control" value={o.subheading || ''} onChange={(e) => setField('subheading', e.target.value)} />
                                    </div>
                                    <h5>Slides</h5>
                                    {(o.slides || []).map((slide, index) => (
                                        <div key={index} className="card mb-3 p-3">
                                            <div className="mb-3">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" value={slide.title || ''} onChange={(e) => {
                                                    const nextSlides = [...(o.slides || [])];
                                                    nextSlides[index] = { ...(nextSlides[index] || {}), title: e.target.value };
                                                    const next = [...sections];
                                                    next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), slides: nextSlides } };
                                                    setSections(next);
                                                }} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea className="form-control" value={slide.description || ''} onChange={(e) => {
                                                    const nextSlides = [...(o.slides || [])];
                                                    nextSlides[index] = { ...(nextSlides[index] || {}), description: e.target.value };
                                                    const next = [...sections];
                                                    next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), slides: nextSlides } };
                                                    setSections(next);
                                                }} />
                                            </div>
                                            <button className="btn btn-danger" onClick={() => {
                                                const nextSlides = (o.slides || []).filter((_, i) => i !== index);
                                                const next = [...sections];
                                                next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), slides: nextSlides } };
                                                setSections(next);
                                            }}>Remove Slide</button>
                                        </div>
                                    ))}
                                    <button className="btn btn-secondary" onClick={() => {
                                        const nextSlides = [...(o.slides || []), { title: '', description: '' }];
                                        const next = [...sections];
                                        next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), slides: nextSlides } };
                                        setSections(next);
                                    }}>Add Slide</button>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'imageGrid') {
                        const keys = ['experience','insight','innovate','accelerate','assure'];
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {keys.map((k) => {
                                            const item = (o[k]) || {};
                                            return (
                                                <div key={k} className="col-md-6 mb-4">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h5>{item.label || k.charAt(0).toUpperCase() + k.slice(1)}</h5>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="mb-3">
                                                                <label className="form-label">Image</label>
                                                                <ImageUploader
                                                                    onUpload={(url, id) => {
                                                                        const nextItem = { ...(o[k] || {}), image: url, imageId: id };
                                                                        const next = [...sections];
                                                                        next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), [k]: nextItem } };
                                                                        setSections(next);
                                                                    }}
                                                                    currentImage={item.image || ''}
                                                                    currentImageId={item.imageId || ''}
                                                                    onPersist={persistImage}
                                                                />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="form-label">Title</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={item.label || ''}
                                                                    onChange={(e) => {
                                                                        const nextItem = { ...(o[k] || {}), label: e.target.value };
                                                                        const next = [...sections];
                                                                        next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), [k]: nextItem } };
                                                                        setSections(next);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="form-label">Link</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={item.link || ''}
                                                                    onChange={(e) => {
                                                                        const nextItem = { ...(o[k] || {}), link: e.target.value };
                                                                        const next = [...sections];
                                                                        next[idx] = { ...secItem, overrides: { ...(secItem.overrides || {}), [k]: nextItem } };
                                                                        setSections(next);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'about') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="mb-2">
                                        <label className="form-label">Title</label>
                                        <input className="form-control" value={o.title || ''} onChange={(e) => setField('title', e.target.value)} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Subtitle</label>
                                        <input className="form-control" value={o.subtitle || ''} onChange={(e) => setField('subtitle', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'aboutHero') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Line 1</label>
                                                <input className="form-control" value={o.line1 || ''} onChange={(e) => setField('line1', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Line 2</label>
                                                <input className="form-control" value={o.line2 || ''} onChange={(e) => setField('line2', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <ImageUploader
                                                label="Image"
                                                currentImage={o.image || ''}
                                                currentImageId={o.imageId || ''}
                                                onUpload={(url, id) => { setField('image', url); setField('imageId', id); }}
                                                onPersist={persistImage}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'contact') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">H2 Heading</label>
                                                <input className="form-control" value={o.heading || ''} onChange={(e)=>setField('heading', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">H4 Title (Contact Information)</label>
                                                <input className="form-control" value={o.contactInfoTitle || ''} onChange={(e)=>setField('contactInfoTitle', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">H4 Title (Get in touch)</label>
                                                <input className="form-control" value={o.getInTouchTitle || ''} onChange={(e)=>setField('getInTouchTitle', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Phone</label>
                                                <input className="form-control" value={o.phone || ''} onChange={(e)=>setField('phone', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-control" value={o.email || ''} onChange={(e)=>setField('email', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Office 1 Label</label>
                                                <input className="form-control" value={(o.offices?.[0]?.label) || ''} onChange={(e)=> {
                                                    const list = Array.isArray(o.offices) ? [...o.offices] : [{}, {}];
                                                    list[0] = { ...(list[0]||{}), label: e.target.value };
                                                    setField('offices', list);
                                                }} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Office 1 Address</label>
                                                <input className="form-control" value={(o.offices?.[0]?.address) || ''} onChange={(e)=> {
                                                    const list = Array.isArray(o.offices) ? [...o.offices] : [{}, {}];
                                                    list[0] = { ...(list[0]||{}), address: e.target.value };
                                                    setField('offices', list);
                                                }} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Office 2 Label</label>
                                                <input className="form-control" value={(o.offices?.[1]?.label) || ''} onChange={(e)=> {
                                                    const list = Array.isArray(o.offices) ? [...o.offices] : [{}, {}];
                                                    list[1] = { ...(list[1]||{}), label: e.target.value };
                                                    setField('offices', list);
                                                }} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Office 2 Address</label>
                                                <input className="form-control" value={(o.offices?.[1]?.address) || ''} onChange={(e)=> {
                                                    const list = Array.isArray(o.offices) ? [...o.offices] : [{}, {}];
                                                    list[1] = { ...(list[1]||{}), address: e.target.value };
                                                    setField('offices', list);
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'aboutOverview') {
                        const paragraphs = o.paragraphs || overviewParagraphDrafts;
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" value={o.title || ''} onChange={(e) => setField('title', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Paragraphs</label>
                                                {(paragraphs || []).map((p, i) => (
                                                    <div className="d-flex gap-2 mb-2" key={i}>
                                                        <textarea
                                                            className="form-control"
                                                            value={p}
                                                            onChange={(e) => {
                                                                const next = [...(paragraphs || [])];
                                                                next[i] = e.target.value;
                                                                setOverviewParagraphDrafts(next);
                                                                setField('paragraphs', next);
                                                            }}
                                                        />
                                                        <button className="btn btn-outline-danger" onClick={() => {
                                                            const next = (paragraphs || []).filter((_, idx2) => idx2 !== i);
                                                            setOverviewParagraphDrafts(next);
                                                            setField('paragraphs', next);
                                                        }}>Delete</button>
                                                    </div>
                                                ))}
                                                <button className="btn btn-outline-primary" onClick={() => {
                                                    const next = [...(paragraphs || []), ''];
                                                    setOverviewParagraphDrafts(next);
                                                    setField('paragraphs', next);
                                                }}>Add Paragraph</button>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <ImageUploader
                                                label="Image"
                                                currentImage={o.image || ''}
                                                currentImageId={o.imageId || ''}
                                                onUpload={(url, id) => { setField('image', url); setField('imageId', id); }}
                                                onPersist={persistImage}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'aboutMission') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-dark">#{idx + 1}</span>
                                        {createMode && (
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                                <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                                <button className="btn btn-outline-danger" onClick={() => {
                                                    const next = sections.filter((_, i) => i !== idx);
                                                    setSections(next);
                                                }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" value={o.title || ''} onChange={(e) => setField('title', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Text</label>
                                                <textarea className="form-control" value={o.text || ''} onChange={(e) => setField('text', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <ImageUploader
                                                label="Image"
                                                currentImage={o.image || ''}
                                                currentImageId={o.imageId || ''}
                                                onUpload={(url, id) => { setField('image', url); setField('imageId', id); }}
                                                onPersist={persistImage}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (type === 'aboutStarted') {
                        return (
                            <div className="card mb-3" key={`${type}-${idx}`}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>{type}</span>
                                    <span className="badge bg-light text-dark">#{idx + 1}</span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" value={o.title || ''} onChange={(e) => setField('title', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Lead</label>
                                                <input className="form-control" value={o.lead || ''} onChange={(e) => setField('lead', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Text</label>
                                                <textarea className="form-control" value={o.text || ''} onChange={(e) => setField('text', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <ImageUploader
                                                label="Image"
                                                currentImage={o.image || ''}
                                                currentImageId={o.imageId || ''}
                                                onUpload={(url, id) => { setField('image', url); setField('imageId', id); }}
                                                onPersist={persistImage}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div className="card mb-3" key={`${type}-${idx}`}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span>{type}</span>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-light text-dark">#{idx + 1}</span>
                                    {createMode && (
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, -1)}>↑</button>
                                            <button className="btn btn-outline-secondary" onClick={() => moveSection(idx, 1)}>↓</button>
                                            <button className="btn btn-outline-danger" onClick={() => {
                                                const next = sections.filter((_, i) => i !== idx);
                                                setSections(next);
                                            }}>✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <label className="form-label">Title</label>
                                            <input className="form-control" value={o.title || ''} onChange={(e) => setField('title', e.target.value)} />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label">Subtitle</label>
                                            <input className="form-control" value={o.subtitle || ''} onChange={(e) => setField('subtitle', e.target.value)} />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label">Body</label>
                                            <textarea className="form-control" value={o.body || ''} onChange={(e) => setField('body', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <ImageUploader
                                            label="Image"
                                            currentImage={o.image || ''}
                                            currentImageId={o.imageId || ''}
                                            onUpload={(url, id) => { setField('image', url); setField('imageId', id); }}
                                            onPersist={persistImage}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={save}>
                        Save Page
                    </button>
                    {createMode && (
                        <button className="btn btn-outline-secondary" onClick={async () => {
                            try {
                                const navRes = await getContentByKey('navbar');
                                const current = (navRes.data && navRes.data.value) || {};
                                const items = Array.isArray(current.menuItems) ? current.menuItems : [];
                                const text = title || slug || 'Page';
                                const link = `/${slug || text.toLowerCase()}`;
                                const exists = items.some(i => i.text === text || i.link === link);
                                const next = exists ? items : [...items, { text, link }];
                                await updateContent({ key: 'navbar', value: { ...current, menuItems: next } });
                                setMessage({ type: 'success', text: 'Added to navbar' });
                            } catch (err) {
                                setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add to navbar' });
                            }
                        }}>
                            Add to Navbar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageEditor;
