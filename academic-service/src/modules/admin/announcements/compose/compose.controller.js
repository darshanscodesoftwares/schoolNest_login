const composeService = require("./compose.service");

// Helper function to format sent_to_status
const formatSentToStatus = (audienceType) => {
  // Map audience_type to display name
  const audienceMap = {
    'all_teachers': 'Teachers',
    'parent': 'Parents',
    'all_both': 'Both'
  };

  return audienceMap[audienceType] || 'Unknown';
};

const composeController = {
  // POST /api/v1/academic/admin/announcements/compose
  // Send announcement based on audience and scope
  sendAnnouncement: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { audience, scope, title, message, is_important, class_id, teacher_ids, parent_ids } = req.body;

      // Validate required fields
      if (!audience || !scope || !message) {
        return res.status(400).json({
          success: false,
          message: "Audience, scope, and message are required",
        });
      }

      // If scope is "By Class", class_id is required
      if (scope === "By Class" && !class_id) {
        return res.status(400).json({
          success: false,
          message: "class_id is required for 'By Class' scope",
        });
      }

      // Validate audience and scope values
      const validAudiences = ["Teachers", "Parents", "Both"];
      const validScopes = ["Whole School", "By Class", "Specific Users"];

      if (!validAudiences.includes(audience) || !validScopes.includes(scope)) {
        return res.status(400).json({
          success: false,
          message: "Invalid audience or scope",
        });
      }

      let result;

      // Map audience to audience_type
      const audienceTypeMap = {
        "Teachers": "all_teachers",
        "Parents": "parent",
        "Both": "all_both"
      };
      const audience_type = audienceTypeMap[audience];

      // Build announcement_data object
      // Only include class_id if scope is "By Class"
      const baseAnnouncementData = {
        sender_id: user.user_id,
        sender_name: user.name || "Admin",
        sender_role: user.role || "ADMIN",
        audience_type,
        scope,
        title,
        message,
        is_important,
      };

      const announcementData = scope === "By Class"
        ? { ...baseAnnouncementData, class_id }
        : baseAnnouncementData;

      // Handle "Whole School" scope
      if (scope === "Whole School") {
        if (audience === "Teachers") {
          result = await composeService.sendAnnouncementToTeachersWholeSchool(
            school_id,
            user.user_id,
            announcementData
          );
        } else if (audience === "Parents") {
          result = await composeService.sendAnnouncementToParentsWholeSchool(
            school_id,
            user.user_id,
            announcementData
          );
        } else if (audience === "Both") {
          result = await composeService.sendAnnouncementToBothWholeSchool(
            school_id,
            user.user_id,
            announcementData
          );
        }
      } else if (scope === "By Class") {
        if (audience === "Teachers") {
          result = await composeService.sendAnnouncementToTeachersByClass(
            school_id,
            user.user_id,
            class_id,
            announcementData
          );
        } else if (audience === "Parents") {
          result = await composeService.sendAnnouncementToParentsByClass(
            school_id,
            user.user_id,
            class_id,
            announcementData
          );
        } else if (audience === "Both") {
          result = await composeService.sendAnnouncementToBothByClass(
            school_id,
            user.user_id,
            class_id,
            announcementData
          );
        }
      } else if (scope === "Specific Users") {
        // Validate specific user IDs based on audience
        if (audience === "Teachers") {
          if (!teacher_ids || !Array.isArray(teacher_ids) || teacher_ids.length === 0) {
            return res.status(400).json({
              success: false,
              message: "teacher_ids array with at least one ID is required for Teachers with Specific Users scope",
            });
          }

          result = await composeService.sendAnnouncementToTeachersSpecificUsers(
            school_id,
            user.user_id,
            teacher_ids,
            announcementData
          );
        } else if (audience === "Parents") {
          if (!parent_ids || !Array.isArray(parent_ids) || parent_ids.length === 0) {
            return res.status(400).json({
              success: false,
              message: "parent_ids array with at least one ID is required for Parents with Specific Users scope",
            });
          }

          result = await composeService.sendAnnouncementToParentsSpecificUsers(
            school_id,
            user.user_id,
            parent_ids,
            announcementData
          );
        } else if (audience === "Both") {
          if ((!teacher_ids || !Array.isArray(teacher_ids) || teacher_ids.length === 0) &&
              (!parent_ids || !Array.isArray(parent_ids) || parent_ids.length === 0)) {
            return res.status(400).json({
              success: false,
              message: "At least one teacher_id or parent_id is required for Both with Specific Users scope",
            });
          }

          result = await composeService.sendAnnouncementToBothSpecificUsers(
            school_id,
            user.user_id,
            teacher_ids || [],
            parent_ids || [],
            announcementData
          );
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid scope provided",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Announcement sent successfully",
        data: {
          announcement_id: result.announcement.id,
          status: result.announcement.status,
          total_recipients: result.total_recipients,
          teachers_count: result.teachers_count || null,
          parents_count: result.parents_count || null,
          created_at: result.announcement.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/academic/admin/announcements/compose/save-draft
  // Save announcement as draft
  saveDraft: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { audience, scope, title, message, is_important, class_id, teacher_ids, parent_ids } = req.body;

      // Validate required fields
      if (!audience || !scope || !message) {
        return res.status(400).json({
          success: false,
          message: "Audience, scope, and message are required",
        });
      }

      // Validate audience and scope values
      const validAudiences = ["Teachers", "Parents", "Both"];
      const validScopes = ["Whole School", "By Class", "Specific Users"];

      if (!validAudiences.includes(audience) || !validScopes.includes(scope)) {
        return res.status(400).json({
          success: false,
          message: "Invalid audience or scope",
        });
      }

      // Validate class_id is provided when scope is "By Class"
      if (scope === "By Class" && !class_id) {
        return res.status(400).json({
          success: false,
          message: "class_id is required when scope is 'By Class'",
        });
      }

      // Map audience to audience_type
      const audienceTypeMap = {
        "Teachers": "all_teachers",
        "Parents": "parent",
        "Both": "all_both"
      };
      const audience_type = audienceTypeMap[audience];

      const composeRepository = require("./compose.repository");

      // Build announcement_data object
      // Only include class_id if scope is "By Class"
      const baseSaveDraftData = {
        sender_id: user.user_id,
        sender_name: user.name || "Admin",
        sender_role: user.role || "ADMIN",
        audience_type,
        scope,
        teacher_ids: teacher_ids || [],
        parent_ids: parent_ids || [],
        title,
        message,
        is_important,
      };

      const saveDraftData = scope === "By Class"
        ? { ...baseSaveDraftData, class_id }
        : baseSaveDraftData;

      const announcement = await composeRepository.createAnnouncement(
        school_id,
        saveDraftData,
        'Draft'
      );

      return res.status(201).json({
        success: true,
        message: "Draft saved successfully",
        data: {
          announcement_id: announcement.id,
          status: announcement.status,
          scope: announcement.scope,
          class_id: announcement.class_id,
          created_at: announcement.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/announcements/compose/classes/all
  // Get all classes for dropdown
  getAllClasses: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const composeRepository = require("./compose.repository");

      const classes = await composeRepository.getAllClasses(school_id);

      return res.status(200).json({
        success: true,
        message: "Classes retrieved successfully",
        data: {
          total_classes: classes.length,
          classes: classes,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/announcements/compose
  // Get all announcements for the school
  getAllAnnouncements: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const composeRepository = require("./compose.repository");

      const announcements = await composeRepository.getAllAnnouncements(school_id);

      // Format announcements with sent_to_status
      const formattedAnnouncements = announcements.map(announcement => ({
        ...announcement,
        sent_to_status: formatSentToStatus(announcement.audience_type)
      }));

      return res.status(200).json({
        success: true,
        message: "Announcements retrieved successfully",
        data: {
          total_announcements: formattedAnnouncements.length,
          announcements: formattedAnnouncements,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/announcements/compose/:id
  // Get announcement by ID with recipients
  getAnnouncementById: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const { id } = req.params;
      const composeRepository = require("./compose.repository");

      const announcement = await composeRepository.getAnnouncementById(id, school_id);

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found",
        });
      }

      const recipients = await composeRepository.getAnnouncementRecipients(id, school_id);

      const sent_to_status = formatSentToStatus(announcement.audience_type);

      return res.status(200).json({
        success: true,
        message: "Announcement retrieved successfully",
        data: {
          ...announcement,
          sent_to_status,
          total_recipients: recipients.length,
          recipients,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/academic/admin/announcements/compose/:id
  // Delete announcement by ID
  deleteAnnouncement: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const { id } = req.params;
      const composeRepository = require("./compose.repository");

      const announcement = await composeRepository.getAnnouncementById(id, school_id);

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found",
        });
      }

      // Delete announcement (and recipients via CASCADE)
      await composeRepository.deleteAnnouncement(id, school_id);

      return res.status(200).json({
        success: true,
        message: "Announcement deleted successfully",
        data: {
          deleted_announcement_id: id,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/academic/admin/announcements/compose
  // Delete all announcements for the school
  deleteAllAnnouncements: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const composeRepository = require("./compose.repository");

      const result = await composeRepository.deleteAllAnnouncements(school_id);

      return res.status(200).json({
        success: true,
        message: "All announcements deleted successfully",
        data: {
          deleted_count: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/v1/academic/admin/announcements/compose/:id
  // Update announcement (only if status is Draft)
  updateAnnouncement: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { id } = req.params;
      const { audience, scope, title, message, is_important, class_id } = req.body;

      // Validate required fields
      if (!audience || !scope || !message) {
        return res.status(400).json({
          success: false,
          message: "Audience, scope, and message are required",
        });
      }

      // If scope is "By Class", class_id is required
      if (scope === "By Class" && !class_id) {
        return res.status(400).json({
          success: false,
          message: "class_id is required for 'By Class' scope",
        });
      }

      // Validate audience and scope values
      const validAudiences = ["Teachers", "Parents", "Both"];
      const validScopes = ["Whole School", "By Class", "Specific Users"];

      if (!validAudiences.includes(audience) || !validScopes.includes(scope)) {
        return res.status(400).json({
          success: false,
          message: "Invalid audience or scope",
        });
      }

      const composeRepository = require("./compose.repository");

      // Check if announcement exists and belongs to this school
      const announcement = await composeRepository.getAnnouncementById(id, school_id);

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found",
        });
      }

      // Map audience to audience_type
      const audienceTypeMap = {
        "Teachers": "all_teachers",
        "Parents": "parent",
        "Both": "all_both"
      };
      const audience_type = audienceTypeMap[audience];

      // Update the announcement
      const updated = await composeRepository.updateAnnouncement(
        school_id,
        id,
        { audience_type, title, message, is_important }
      );

      return res.status(200).json({
        success: true,
        message: "Announcement updated successfully",
        data: {
          announcement_id: updated.id,
          status: updated.status,
          audience_type: updated.audience_type,
          title: updated.title,
          message: updated.message,
          is_important: updated.is_important,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = composeController;
