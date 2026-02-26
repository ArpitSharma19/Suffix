const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');

const removeTemp = (p) => {
  if (p && fs.existsSync(p)) {
    try { fs.unlinkSync(p); } catch {}
  }
};

exports.createImage = async (req, res) => {
  const filePath = req.file ? req.file.path : null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    const result = await cloudinary.uploader.upload(filePath, { resource_type: 'image', folder: 'suffix_uploads' });
    const record = await Image.create({
      imageUrl: result.secure_url,
      imagePublicId: result.public_id
    });
    return res.status(201).json(record);
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  } finally {
    removeTemp(filePath);
  }
};

exports.updateImage = async (req, res) => {
  const { id } = req.params;
  const filePath = req.file ? req.file.path : null;
  try {
    const record = await Image.findByPk(id);
    if (!record) {
      removeTemp(filePath);
      return res.status(404).json({ message: 'Record not found' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'New image file is required' });
    }
    const result = await cloudinary.uploader.upload(filePath, { resource_type: 'image', folder: 'suffix_uploads' });
    const oldPublicId = record.imagePublicId;
    record.imageUrl = result.secure_url;
    record.imagePublicId = result.public_id;
    await record.save();
    if (oldPublicId) {
      try { await cloudinary.uploader.destroy(oldPublicId); } catch {}
    }
    return res.json(record);
  } catch (err) {
    return res.status(500).json({ message: 'Update failed', error: err.message });
  } finally {
    removeTemp(filePath);
  }
};

exports.deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await Image.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    const publicId = record.imagePublicId;
    await record.destroy();
    if (publicId) {
      try { await cloudinary.uploader.destroy(publicId); } catch {}
    }
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

