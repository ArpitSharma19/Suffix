const express = require('express');
const upload = require('../middleware/multer');
const { createImage, updateImage, deleteImage } = require('../controllers/imageController');
const router = express.Router();

router.post('/', upload.single('image'), createImage);
router.put('/:id', upload.single('image'), updateImage);
router.delete('/:id', deleteImage);

module.exports = router;

