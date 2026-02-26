const express = require('express');
const router = express.Router();
const { createEnquiry, listEnquiries, updateEnquiry, deleteEnquiry, exportEnquiries } = require('../controllers/enquiryController');

router.get('/export', exportEnquiries);
router.post('/', createEnquiry);
router.get('/', listEnquiries);
router.put('/:id', updateEnquiry);
router.delete('/:id', deleteEnquiry);

module.exports = router;
