const sectionsRepository = require("./sections.repository");

/**
 * Validate admin role
 */
const assertAdminRole = (user) => {
  if (!user || user.role !== "ADMIN") {
    const error = new Error(
      "Forbidden: only administrators can access this resource"
    );
    error.statusCode = 403;
    error.code = "INSUFFICIENT_PERMISSIONS";
    throw error;
  }
};

const sectionsService = {
  // Get sections for a specific class
  getSectionsByClass: async (user, school_id, class_id) => {
    assertAdminRole(user);

    if (!school_id || !class_id) {
      const error = new Error(
        "Missing required fields: school_id, class_id"
      );
      error.statusCode = 400;
      throw error;
    }

    const sections = await sectionsRepository.getSectionsByClassAndSchool(
      school_id,
      class_id
    );

    return sections.map((row) => ({
      section_id: row.section_id,
      section_name: row.section_name,
    }));
  },

  // Get all sections for a school
  getAllSections: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    const sections = await sectionsRepository.getAllSectionsBySchool(school_id);

    return sections.map((row) => ({
      id: row.id,
      section_name: row.section_name,
    }));
  },

  // Get classes and sections mapping for a school
  getClassesSections: async (user, school_id) => {
    assertAdminRole(user);

    if (!school_id) {
      const error = new Error("Missing required field: school_id");
      error.statusCode = 400;
      throw error;
    }

    return await sectionsRepository.getClassesSectionsBySchool(school_id);
  },
};

module.exports = sectionsService;
