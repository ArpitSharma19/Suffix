import React, { useEffect, useMemo, useState } from 'react';
import { getContentByKey, updateContent } from '../../services/api';

const defaultPages = [
  { id: 'home', name: 'Home', slug: 'home' },
  { id: 'about', name: 'About', slug: 'about' }
];

const PagesManager = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newPage, setNewPage] = useState({ name: '', slug: '' });
  const [pageSections, setPageSections] = useState({});
  const [newSectionByPage, setNewSectionByPage] = useState({});
  const editableSections = useMemo(() => ([
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
  ]), []);
  const coreDefaults = useMemo(() => ({
    home: ['hero', 'about', 'products', 'solutions', 'imageGrid'],
    about: ['aboutHero', 'aboutOverview', 'aboutMission', 'aboutStarted']
  }), []);

  const fetchPages = async () => {
    try {
      const { data } = await getContentByKey('pages');
      if (data && data.value && Array.isArray(data.value)) {
        setPages(data.value);
      } else {
        setPages(defaultPages);
      }
    } catch {
      setPages(defaultPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    const loadSections = async () => {
      const acc = {};
      for (const p of pages) {
        try {
          const res = await getContentByKey(`page-${p.slug}`);
          const v = res.data?.value;
          const list = Array.isArray(v?.sections) ? v.sections : (coreDefaults[p.slug] || []);
          acc[p.slug] = list
            .map((item) => (typeof item === 'string' ? item : item?.type))
            .filter(Boolean)
            .filter(t => t !== 'navbar' && t !== 'footer');
        } catch {
          acc[p.slug] = coreDefaults[p.slug] || [];
        }
      }
      setPageSections(acc);
      const initSelect = {};
      pages.forEach(p => { initSelect[p.slug] = editableSections[0]; });
      setNewSectionByPage(initSelect);
    };
    if (pages.length) loadSections();
  }, [pages, coreDefaults, editableSections]);

  const handleAddPage = () => {
    if (!newPage.name.trim()) return;
    const slug = newPage.slug.trim() || newPage.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (pages.find(p => p.slug === slug)) {
      setMessage({ type: 'error', text: 'Slug already exists' });
      return;
    }
    const id = slug;
    const updated = [...pages, { id, name: newPage.name.trim(), slug }];
    setPages(updated);
    setNewPage({ name: '', slug: '' });
    setMessage({ type: '', text: '' });
  };

  const handleDelete = (index) => {
    const updated = pages.filter((_, i) => i !== index);
    setPages(updated);
  };

  const handleRename = (index, value) => {
    const updated = [...pages];
    updated[index] = { ...updated[index], name: value };
    setPages(updated);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pages.length) return;
    const updated = [...pages];
    const [item] = updated.splice(index, 1);
    updated.splice(newIndex, 0, item);
    setPages(updated);
  };

  const handleMoveSection = (slug, index, direction) => {
    const list = pageSections[slug] || [];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.length) return;
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(newIndex, 0, item);
    setPageSections({ ...pageSections, [slug]: next });
  };

  const handleDeleteSection = (slug, index) => {
    const list = pageSections[slug] || [];
    const next = list.filter((_, i) => i !== index);
    setPageSections({ ...pageSections, [slug]: next });
  };

  const handleAddSectionToPage = (slug) => {
    const type = newSectionByPage[slug] || editableSections[0];
    const list = pageSections[slug] || [];
    const next = [...list, type];
    setPageSections({ ...pageSections, [slug]: next });
  };

  const handleSave = async () => {
    try {
      await updateContent({ key: 'pages', value: pages });
      for (const p of pages) {
        try {
          const res = await getContentByKey(`page-${p.slug}`);
          const v = res.data?.value || {};
          const next = { ...v, sections: (pageSections[p.slug] || []) };
          await updateContent({ key: `page-${p.slug}`, value: next });
        } catch {
          const next = { title: p.name, sections: (pageSections[p.slug] || []) };
          await updateContent({ key: `page-${p.slug}`, value: next });
        }
      }
      setMessage({ type: 'success', text: 'Pages saved' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save pages' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Pages</h3>
      </div>
      <div className="card-body">
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-3 d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Page name"
            value={newPage.name}
            onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Custom slug (optional)"
            value={newPage.slug}
            onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
          />
          <button className="btn btn-primary" onClick={handleAddPage}>Add</button>
        </div>

        <ul className="list-group mb-3">
          {pages.map((p, index) => (
            <li className="list-group-item d-flex align-items-start justify-content-between flex-column" key={p.id}>
              <div className="w-100 d-flex align-items-center justify-content-between mb-2">
                <div className="flex-grow-1 me-3">
                  <input
                    type="text"
                    className="form-control"
                    value={p.name}
                    onChange={(e) => handleRename(index, e.target.value)}
                  />
                  <small className="text-muted">{p.slug}</small>
                </div>
                <div className="btn-group">
                  <button className="btn btn-outline-secondary" onClick={() => handleMove(index, -1)}>Up</button>
                  <button className="btn btn-outline-secondary" onClick={() => handleMove(index, 1)}>Down</button>
                  <button className="btn btn-outline-danger" onClick={() => handleDelete(index)}>Delete</button>
                </div>
              </div>
              <div className="w-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold">Sections</span>
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-select form-select-sm w-auto"
                      value={newSectionByPage[p.slug] || editableSections[0]}
                      onChange={(e) => setNewSectionByPage({ ...newSectionByPage, [p.slug]: e.target.value })}
                    >
                      {editableSections.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => handleAddSectionToPage(p.slug)}>Add</button>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {(pageSections[p.slug] || []).map((sec, idx) => (
                    <div key={`${p.slug}-${sec}-${idx}`} className="d-flex align-items-center gap-2 border rounded px-2 py-1">
                      <span>{sec}</span>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => handleMoveSection(p.slug, idx, -1)}>↑</button>
                        <button className="btn btn-outline-secondary" onClick={() => handleMoveSection(p.slug, idx, 1)}>↓</button>
                        <button className="btn btn-outline-danger" onClick={() => handleDeleteSection(p.slug, idx)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="d-flex justify-content-end">
          <button className="btn btn-success" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default PagesManager;
