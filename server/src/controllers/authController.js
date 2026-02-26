const User = require('../models/User');
const admin = require('../config/firebase');
const { sendOtpEmail } = require('../config/email');
const { Op } = require('sequelize');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email: username }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username' });
        }

        // Ensure a Firebase user exists for this email. Do not update the password here.
        try {
            await admin.auth().getUserByEmail(user.email);
        } catch (err) {
            // Only create if the Firebase user does not exist
            if (String(err?.errorInfo?.code || err?.code || '').includes('auth/user-not-found')) {
                if (password) {
                    try {
                        await admin.auth().createUser({
                            email: user.email,
                            password,
                            displayName: user.username
                        });
                    } catch (createErr) {
                        // If creation fails, surface a clean error
                        return res.status(500).json({ message: 'Auth setup failed for this user' });
                    }
                }
            } else {
                return res.status(500).json({ message: 'Auth service error' });
            }
        }

        // Return email; client will authenticate with Firebase using email + provided password.
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendResetOtp = async (req, res) => {
    const { identifier } = req.body;
    console.log('sendResetOtp called with identifier:', identifier);
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        user.resetOtp = otp;
        user.resetOtpExpires = expires;
        await user.save();

        await sendOtpEmail(user.email, otp);

        res.json({ message: 'OTP sent to your registered email' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { identifier, otp } = req.body;
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: identifier },
                    { email: identifier }
                ],
                resetOtp: otp,
                resetOtpExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { identifier, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: identifier },
                    { email: identifier }
                ],
                resetOtp: otp,
                resetOtpExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        try {
            const firebaseUser = await admin.auth().getUserByEmail(user.email);
            await admin.auth().updateUser(firebaseUser.uid, {
                password: newPassword
            });
        } catch {
            await admin.auth().createUser({
                email: user.email,
                password: newPassword,
                displayName: user.username,
            });
        }

        user.password = newPassword;
        user.resetOtp = null;
        user.resetOtpExpires = null;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user in Firebase
        const firebaseUser = await admin.auth().createUser({
            email,
            password,
            displayName: username,
        });

        // Create user in local DB
        const user = await User.create({ username, email, password });
        
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            firebaseUid: firebaseUser.uid
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        // Map id to _id for frontend compatibility
        const mappedUsers = users.map(u => ({
            _id: u.id,
            username: u.username,
            email: u.email,
            createdAt: u.createdAt
        }));
        res.json(mappedUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            if (user.username === 'admin') {
                return res.status(400).json({ message: 'Cannot delete default admin' });
            }

            // Delete from Firebase first
            try {
                const firebaseUser = await admin.auth().getUserByEmail(user.email);
                await admin.auth().deleteUser(firebaseUser.uid);
            } catch (fbErr) {
                console.error('Firebase user deletion failed or user not found:', fbErr.message);
            }

            await user.destroy();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
