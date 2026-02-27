import React, { useState, useEffect } from 'react';
import { getContentByKey, updateContent } from '../../services/api';
import { listPages, listSectionsForPage } from '../../utils/pageRegistry';

const FooterEditor = () => {
    const [content, setContent] = useState({ products: [], solutions: [], company: [] });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [linkSuggestionsMap, setLinkSuggestionsMap] = useState({});

    const fetchContent = async () => {
        try {
            const { data } = await getContentByKey('footer');
            if (data) setContent(data.value);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching footer content:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            fetchContent();
        }, 0);
    }, []);

    useEffect(() => {
        const build = async () => {
            try {
                const pages = await listPages();
                const pagesList = pages.map(p => `/${p.slug}`);
                const map = {};
                const allItems = [];
                ['products', 'solutions', 'company'].forEach(section => {
                    (content[section] || []).forEach((item, idx) => {
                        allItems.push({ section, idx, link: (item.link || '').trim() });
                    });
                });
                for (const it of allItems) {
                    const key = `${it.section}-${it.idx}`;
                    const link = it.link;
                    if (!link || link === '/' || !link.startsWith('/')) {
                        map[key] = pagesList;
                    } else {
                        const slug = link.replace(/^\//, '').split('/')[0];
                        try {
                            const secs = await listSectionsForPage(slug);
                            map[key] = secs.map(s => `/${slug}/${s}`);
                        } catch {
                            map[key] = [];
                        }
                    }
                }
                setLinkSuggestionsMap(map);
            } catch {
                setLinkSuggestionsMap({});
            }
        };
        build();
    }, [content]);

    const handleSave = async () => {
        try {
            await updateContent({ key: 'footer', value: content });
            setMessage({ type: 'success', text: 'Footer updated successfully' });
        } catch (error) {
            console.error('Error updating footer:', error);
            setMessage({ type: 'error', text: 'Error updating footer' });
        }
    };

    const updateItem = (section, index, field, value) => {
        const newSection = [...content[section]];
        newSection[index][field] = value;
        setContent({ ...content, [section]: newSection });
    };

    const addItem = (section) => {
        setContent({
            ...content,
            [section]: [...content[section], { text: '', link: '' }]
        });
    };

    const removeItem = (section, index) => {
        const newSection = content[section].filter((_, i) => i !== index);
        setContent({ ...content, [section]: newSection });
    };

    if (loading) return <div>Loading...</div>;

    const sections = [
        { key: 'products', label: 'Products' },
        { key: 'solutions', label: 'Solutions' },
        { key: 'company', label: 'Company' }
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h3>Footer Editor</h3>
            </div>
            <div className="card-body">
                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                        {message.text}
                    </div>
                )}

                <div className="row">
                    {sections.map((section) => (
                        <div key={section.key} className="col-md-4 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5>{section.label}</h5>
                                </div>
                                <div className="card-body">
                                    {content[section.key].map((item, index) => (
                                        <div key={index} className="mb-3 border p-2 rounded">
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm mb-1"
                                                    placeholder="Text"
                                                    value={item.text}
                                                    onChange={(e) => updateItem(section.key, index, 'text', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Link"
                                                    value={item.link}
                                                    onChange={(e) => updateItem(section.key, index, 'link', e.target.value)}
                                                    list={`footer-link-suggest-${section.key}-${index}`}
                                                />
                                                <datalist id={`footer-link-suggest-${section.key}-${index}`}>
                                                    {(linkSuggestionsMap[`${section.key}-${index}`] || []).map(s => (
                                                        <option key={s} value={s} />
                                                    ))}
                                                </datalist>
                                            </div>
                                            <button 
                                                className="btn btn-danger btn-sm w-100"
                                                onClick={() => removeItem(section.key, index)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        className="btn btn-secondary btn-sm w-100"
                                        onClick={() => addItem(section.key)}
                                    >
                                        Add Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default FooterEditor;
