import React, { useEffect, useState } from 'react';
import API from '../../services/api';

const EnquiriesAdmin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ name: '', email: '', from: '', to: '' });
  const resetFilters = () => setFilters({ name: '', email: '', from: '', to: '', checked: '' });
  const [pendingDeletes, setPendingDeletes] = useState({});
  const [pendingChecks, setPendingChecks] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const formatDate = (d) => {
    try {
      const dt = new Date(d);
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const year = String(dt.getFullYear());
      const hours = String(dt.getHours()).padStart(2, '0');
      const mins = String(dt.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${mins}`;
    } catch {
      return '';
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.checked !== undefined && filters.checked !== '') params.checked = filters.checked;
      const res = await API.get('/enquiries', { params });
      const rows = Array.isArray(res.data) ? res.data : [];
      setItems(rows);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  // Initial load via user action to satisfy lint rules

  const deleteItem = (id) => {
    setPendingDeletes(p => ({ ...p, [Number(id)]: true }));
    setMessage({ type: '', text: '' });
  };

  const doExport = async () => {
    const url = new URL("http://localhost:5000/api/enquiries/export");
    if (filters.name) url.searchParams.append('name', filters.name);
    if (filters.email) url.searchParams.append('email', filters.email);
    if (filters.from) url.searchParams.append('from', filters.from);
    if (filters.to) url.searchParams.append('to', filters.to);
    if (filters.checked !== undefined && filters.checked !== '') url.searchParams.append('checked', filters.checked);
    window.location.href = url.toString();
  };
  const doExportAll = async () => {
    window.location.href = "http://localhost:5000/api/enquiries/export";
  };

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get('/enquiries');
        const rows = Array.isArray(res.data) ? res.data : [];
        setItems(rows);
      } catch {
        setItems([]);
      }
      setLoading(false);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const saveAll = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const deleteIds = Object.keys(pendingDeletes)
        .filter(k => pendingDeletes[k])
        .map(Number);

      const checkUpdates = Object.entries(pendingChecks)
        .filter(([id]) => !pendingDeletes[id])
        .map(([id, val]) => ({ id: Number(id), val }));

      let delOk = 0;
      let delFail = 0;
      let updOk = 0;
      let updFail = 0;

      // 🔴 DELETE FIRST
      for (const id of deleteIds) {
        try {
          const res = await API.delete(`/enquiries/${id}`);
          if (res.data.deleted === 1) delOk++;
          else delFail++;
        } catch {
          delFail++;
        }
      }

      // 🟢 UPDATE CHECKED
      for (const { id, val } of checkUpdates) {
        try {
          const res = await API.put(`/enquiries/${id}`, { checked: !!val });
          if (res.data.updated === 1) updOk++;
          else updFail++;
        } catch {
          updFail++;
        }
      }

      // 🟢 Only now clear pending
      setPendingDeletes({});
      setPendingChecks({});

      // 🟢 Reload from DB (true source of truth)
      await load();

      setMessage({
        type: 'success',
        text: `Saved. Deleted: ${delOk}${delFail ? `, Failed deletes: ${delFail}` : ''}. Updated: ${updOk}${updFail ? `, Failed updates: ${updFail}` : ''}.`
      });

    } catch {
      setMessage({ type: 'error', text: 'Save failed. Please try again.' });
    }

    setSaving(false);
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Enquiries</h3>
        <div className="btn-group">
          <button className="btn btn-outline-primary btn-sm" onClick={doExport}>Export Filtered CSV</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={doExportAll}>Export All CSV</button>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-2 mb-3 align-items-end">
          <div className="col-md-2">
            <input className="form-control" placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          </div>
          <div className="col-md-2">
            <input className="form-control" placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
          </div>
          <div className="col-md-2">
            <div className="d-flex flex-column">
              <span className="small">From</span>
              <input type="date" className="form-control" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            </div>
          </div>
          <div className="col-md-2">
            <div className="d-flex flex-column">
              <span className="small">To</span>
              <input type="date" className="form-control" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </div>
          </div>
          <div className="col-md-2">
            <div className="d-flex flex-column">
              <span className="small">Checked</span>
              <select className="form-control" value={filters.checked || ''} onChange={(e) => setFilters({ ...filters, checked: e.target.value })}>
                <option value="">All</option>
                <option value="true">Checked</option>
                <option value="false">Unchecked</option>
              </select>
            </div>
          </div>
          <div className="col-12 d-flex gap-2 align-items-center">
            <button className="btn btn-primary" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
            <button className="btn btn-outline-secondary" onClick={() => { resetFilters(); load(); }} disabled={loading}>Reset</button>
            <button className="btn btn-success" onClick={saveAll} disabled={saving}>Save</button>
            {message.text && <span className={`small ${message.type === 'error' ? 'text-danger' : 'text-success'}`}>{message.text}</span>}
          </div>
        </div>
        <div className="d-flex flex-column">
          <div className="row fw-semibold border-bottom py-2">
            <div className="col-2">Date/Time</div>
            <div className="col-2">Name</div>
            <div className="col-2">Mobile</div>
            <div className="col-2">Email</div>
            <div className="col-2">Message</div>
            <div className="col-1">Checked</div>
            <div className="col-1">Delete</div>
          </div>
          {items
            .filter(i => !pendingDeletes[Number(i.id)])
            .map((i) => (
              <div key={i.id} className="row align-items-center border-bottom py-2">
                <div className="col-2">{formatDate(i.createdAt)}</div>
                <div className="col-2">{i.name}</div>
                <div className="col-2">{i.mobile}</div>
                <div className="col-2">{i.email}</div>
                <div className="col-2" style={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{i.message}</div>
                <div className="col-1">
                  <input type="checkbox" checked={!!i.checked} onChange={(e) => {
                    const value = e.target.checked;
                    const updated = { ...i, checked: value };
                    setItems(prev => prev.map(x => x.id === i.id ? updated : x));
                    setPendingChecks(p => ({ ...p, [Number(i.id)]: value }));
                    setMessage({ type: '', text: '' });
                  }} />
                </div>
                <div className="col-1">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteItem(i.id)}>Delete</button>
                </div>
              </div>
            ))}
          {items.length === 0 && <div className="text-muted">No enquiries found.</div>}
        </div>
      </div>
    </div>
  );
};

export default EnquiriesAdmin;
