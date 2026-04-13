const templatesRepository = require("./templates.repository");

const templatesService = {
  // Create new template
  createTemplate: async (user, school_id, template_data) => {
    const { title, message } = template_data;

    // Validate required fields
    if (!title || !message) {
      const error = new Error("Title and message are required");
      error.statusCode = 400;
      throw error;
    }

    return await templatesRepository.createTemplate(school_id, { title, message });
  },

  // Get all templates for school
  getAllTemplates: async (user, school_id) => {
    return await templatesRepository.getAllTemplates(school_id);
  },

  // Get template by ID
  getTemplateById: async (user, school_id, template_id) => {
    const template = await templatesRepository.getTemplateById(school_id, template_id);

    if (!template) {
      const error = new Error("Template not found");
      error.statusCode = 404;
      throw error;
    }

    return template;
  },

  // Update template
  updateTemplate: async (user, school_id, template_id, template_data) => {
    const template = await templatesRepository.getTemplateById(school_id, template_id);

    if (!template) {
      const error = new Error("Template not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate at least one field is provided
    const { title, message } = template_data;
    if (!title && !message) {
      const error = new Error("At least one field (title or message) must be provided");
      error.statusCode = 400;
      throw error;
    }

    return await templatesRepository.updateTemplate(school_id, template_id, { title, message });
  },

  // Delete template
  deleteTemplate: async (user, school_id, template_id) => {
    const template = await templatesRepository.getTemplateById(school_id, template_id);

    if (!template) {
      const error = new Error("Template not found");
      error.statusCode = 404;
      throw error;
    }

    return await templatesRepository.deleteTemplate(school_id, template_id);
  },
};

module.exports = templatesService;
