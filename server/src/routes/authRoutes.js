const express = require('express');
const { 
    login, 
    register, 
    getUsers, 
    deleteUser, 
    sendResetOtp, 
    verifyOtp, 
    resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', login);
router.post('/register', protect, register); // Only logged in admins can create new users
router.get('/users', protect, getUsers);
router.delete('/users/:id', protect, deleteUser);

// Password Reset Routes
router.post('/forgot-password', sendResetOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
