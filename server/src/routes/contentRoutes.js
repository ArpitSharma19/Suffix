const express = require("express");
const { getContent, getContentByKey, updateContent } = require("../controllers/contentController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", getContent);
router.get("/:key", getContentByKey);
router.put("/", protect, updateContent); // Protect update route

module.exports = router;
