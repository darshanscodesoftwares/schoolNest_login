const express = require('express');
const announcementController = require('./parent.announcement.controller');

const router = express.Router();

// List messages (tab: all | important)
router.get('/announcements', announcementController.getAnnouncements);

// Get message detail (auto marks as read)
router.get('/announcements/:announcementId', announcementController.getAnnouncementDetail);

module.exports = router;
