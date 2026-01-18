const Notification = require('../models/Notification');

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('query', 'title status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to create notification
const createNotification = async (userId, message, type, queryId) => {
  try {
    const notification = new Notification({
      user: userId,
      message,
      type,
      query: queryId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
