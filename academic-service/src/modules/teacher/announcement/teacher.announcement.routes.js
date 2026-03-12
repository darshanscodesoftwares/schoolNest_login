const express = require('express');
const announcementController = require('./teacher.announcement.controller');

const router = express.Router();

// List announcements (tab: inbox | sent)
router.get('/announcements', announcementController.getAnnouncements);

// Send new announcement to parents
router.post('/announcements', announcementController.sendAnnouncement);

// Get announcement detail (auto marks as read if recipient)
router.get('/announcements/:announcementId', announcementController.getAnnouncementDetail);

module.exports = router;
