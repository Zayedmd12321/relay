const express = require('express');
const router = express.Router();
const { register, login, getMe, getTeamHeads, getTeamHeadStats, verifyOtp, createUser, getAllUsers, deleteUser } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/roleCheck');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

// Protected routes
router.get('/me', protect, getMe);
router.get('/team-heads', protect, isAdmin, getTeamHeads);
router.get('/team-heads/stats', protect, isAdmin, getTeamHeadStats);

// Admin user management routes
router.post('/users', protect, isAdmin, createUser);
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);

module.exports = router;
