const templatesService = require("./templates.service");

const templatesController = {
  // POST /api/v1/academic/admin/announcements/templates
  // Create new announcement template
  createTemplate: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { title, message } = req.body;

      const template = await templatesService.createTemplate(user, school_id, {
        title,
        message,
      });

      return res.status(201).json({
        success: true,
        message: "Template created successfully",
        data: template,
      });
    } catch (error) {
      // Handle unique constraint violation (duplicate title)
      if (error.code === '23505' && error.constraint === 'unique_template_per_school') {
        return res.status(400).json({
          success: false,
          message: "Already used. Please use a different title.",
        });
      }
      next(error);
    }
  },

  // GET /api/v1/academic/admin/announcements/templates
  // Get all templates for school
  getAllTemplates: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const templates = await templatesService.getAllTemplates(user, school_id);

      return res.status(200).json({
        success: true,
        message: "Templates retrieved successfully",
        data: {
          total_templates: templates.length,
          templates: templates,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/academic/admin/announcements/templates/:templateId
  // Get template by ID
  getTemplateById: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { templateId } = req.params;

      const template = await templatesService.getTemplateById(user, school_id, templateId);

      return res.status(200).json({
        success: true,
        message: "Template retrieved successfully",
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/academic/admin/announcements/templates/:templateId
  // Update template
  updateTemplate: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { templateId } = req.params;
      const { title, message } = req.body;

      const template = await templatesService.updateTemplate(user, school_id, templateId, {
        title,
        message,
      });

      return res.status(200).json({
        success: true,
        message: "Template updated successfully",
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/academic/admin/announcements/templates/:templateId
  // Delete template
  deleteTemplate: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const { templateId } = req.params;

      const template = await templatesService.deleteTemplate(user, school_id, templateId);

      return res.status(200).json({
        success: true,
        message: "Template deleted successfully",
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = templatesController;
