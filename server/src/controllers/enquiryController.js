const { Op } = require('sequelize');
const Enquiry = require('../models/Enquiry');
console.log("NEW CLEAN ENQUIRY CONTROLLER ACTIVE");

exports.createEnquiry = async (req, res) => {
  try {
    const { name, mobile, email, message, checked } = req.body || {};
    const created = await Enquiry.create({ name, mobile, email, message, checked: !!checked });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create enquiry' });
  }
};

exports.listEnquiries = async (req, res) => {
  try {
    const { name, email, from, to } = req.query || {};
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (typeof req.query?.checked !== 'undefined') {
      where.checked = String(req.query.checked) === 'true';
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    const items = await Enquiry.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to list enquiries' });
  }
};

exports.updateEnquiry = async (req, res) => {
  try {
    const rawId = req.params?.id;
    if (!rawId) return res.status(400).json({ message: 'Invalid id' });
    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'Invalid id' });
    const { checked } = req.body || {};
    const [updated] = await Enquiry.update({ checked: !!checked }, { where: { id } });
    console.log('[AUDIT] update', { id, checked: !!checked, ts: Date.now(), affected: updated });
    return res.json({ updated });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to update enquiry' });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const rawId = req.params?.id;
    if (!rawId) return res.status(400).json({ message: 'Invalid id' });
    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'Invalid id' });
    const deleted = await Enquiry.destroy({ where: { id } });
    console.log('[AUDIT] delete', { id, ts: Date.now(), affected: deleted });
    return res.json({ deleted });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to delete enquiry' });
  }
};

// removed alternate by-data delete

// removed alternate by-data update
exports.exportEnquiries = async (req, res) => {
  try {
    const { name, email, from, to } = req.query || {};
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (typeof req.query?.checked !== 'undefined') {
      where.checked = String(req.query.checked) === 'true';
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    const rows = await Enquiry.findAll({ where, order: [['createdAt', 'DESC']] });
    const header = ['Date/Time', 'Name', 'Mobile', 'Email', 'Message'];
    const csvRows = rows.map((row) => {
      const d = new Date(row.createdAt);
      const pad = (n) => String(n).padStart(2, '0');
      const formatted = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const safe = (v) => v == null ? '' : String(v);
      const esc = (v) => {
        const s = safe(v);
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      return [formatted, safe(row.name), safe(row.mobile), safe(row.email), safe(row.message)].map(esc).join(',');
    });
    const csv = [header.join(','), ...csvRows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="enquiries.csv"');
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to export enquiries' });
  }
};
