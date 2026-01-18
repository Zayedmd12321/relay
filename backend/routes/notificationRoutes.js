const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// Get all notifications for logged-in user
router.get('/', getNotifications);

// Mark a notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

module.exports = router;
