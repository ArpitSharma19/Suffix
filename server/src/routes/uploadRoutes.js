const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/multer');

router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const localPath = req.file.path;

        cloudinary.uploader.upload(localPath, { folder: 'suffix_uploads', resource_type: 'image' })
            .then((result) => {
                try { fs.unlinkSync(localPath); } catch {}

                const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const logLine = JSON.stringify({
                    time: Date.now(),
                    originalname: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    url: result.secure_url,
                    public_id: result.public_id,
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                }) + '\n';
                fs.appendFile(path.join(uploadsDir, 'upload.log'), logLine, () => {});

                res.json({ url: result.secure_url, public_id: result.public_id });
            })
            .catch((err) => {
                try { fs.unlinkSync(localPath); } catch {}
                res.status(500).json({ error: err.message || 'Upload failed' });
            });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
