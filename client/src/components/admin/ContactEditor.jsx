import React, { useEffect, useState } from 'react';
import { getContentByKey, updateContent } from '../../services/api';

const ContactEditor = () => {
  const [data, setData] = useState({
    heading: 'Contact us',
    description: '',
    offices: [{ label: 'Corporate Office', address: '' }, { label: 'Registered Office', address: '' }],
    phone: '',
    email: '',
    emailjs: { serviceId: '', templateId: '', publicKey: '' }
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getContentByKey('contact');
        if (res.data && res.data.value) setData(res.data.value);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    await updateContent({ key: 'contact', value: data });
    setMsg('Saved');
    setTimeout(()=>setMsg(''), 1200);
  };

  const setOffice = (i, field, value) => {
    const next = [...data.offices];
    next[i] = { ...(next[i] || {}), [field]: value };
    setData({ ...data, offices: next });
  };
  const addOffice = () => setData({ ...data, offices: [...(data.offices||[]), { label: '', address: '' }] });
  const removeOffice = (i) => setData({ ...data, offices: (data.offices||[]).filter((_, idx)=>idx!==i) });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <div className="card-header"><h3>Contact Section Settings</h3></div>
      <div className="card-body">
        {msg && <div className="alert alert-success">{msg}</div>}
        <div className="mb-3">
          <label className="form-label">Heading</label>
          <input className="form-control" value={data.heading} onChange={(e)=>setData({...data, heading: e.target.value})} />
        </div>
        <div className="mb-3">
          <label className="form-label">Intro Text</label>
          <textarea className="form-control" value={data.description} onChange={(e)=>setData({...data, description: e.target.value})} />
        </div>
        <h5>Offices</h5>
        {(data.offices || []).map((o, i) => (
          <div key={i} className="card p-3 mb-2">
            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label">Label</label>
                <input className="form-control" value={o.label} onChange={(e)=>setOffice(i, 'label', e.target.value)} />
              </div>
              <div className="col-md-7">
                <label className="form-label">Address</label>
                <input className="form-control" value={o.address} onChange={(e)=>setOffice(i, 'address', e.target.value)} />
              </div>
              <div className="col-md-1 d-flex align-items-end">
                <button className="btn btn-outline-danger" onClick={()=>removeOffice(i)}>✕</button>
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn-outline-secondary mb-3" onClick={addOffice}>Add Office</button>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input className="form-control" value={data.phone} onChange={(e)=>setData({...data, phone: e.target.value})} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email (recipient)</label>
          <input type="email" className="form-control" value={data.email} onChange={(e)=>setData({...data, email: e.target.value})} />
        </div>

        <h5 className="mt-4">EmailJS Configuration</h5>
        <div className="row">
          <div className="col-md-4">
            <label className="form-label">Service ID</label>
            <input className="form-control" value={data.emailjs?.serviceId || ''} onChange={(e)=>setData({...data, emailjs: {...(data.emailjs||{}), serviceId: e.target.value}})} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Template ID</label>
            <input className="form-control" value={data.emailjs?.templateId || ''} onChange={(e)=>setData({...data, emailjs: {...(data.emailjs||{}), templateId: e.target.value}})} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Public Key</label>
            <input className="form-control" value={data.emailjs?.publicKey || ''} onChange={(e)=>setData({...data, emailjs: {...(data.emailjs||{}), publicKey: e.target.value}})} />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ContactEditor;

