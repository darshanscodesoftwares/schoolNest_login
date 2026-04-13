const sectionsService = require("./sections.service");
const { commonApiGet } = require("../../../utils/common-api.client");

// Helper to get class name from common API
const getClassName = async (classId) => {
  try {
    const response = await commonApiGet(`/api/v1/classes/${classId}`, null);
    if (response && response.success && response.data) {
      return response.data.class_name || null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const sectionsController = {
  // Get sections for a specific class
  // GET /api/v1/academic/admin/sections/class/:classId
  getSectionsByClass: async (req, res, next) => {
    try {
      const { classId } = req.params;
      const school_id = req.user.school_id;
      const user = req.user;

      const sections = await sectionsService.getSectionsByClass(
        user,
        school_id,
        classId
      );

      // Enrich with class name
      const className = await getClassName(classId);

      // Map section_id field for consistency
      const mappedSections = sections.map((section) => ({
        section_id: section.section_id,
        section_name: section.section_name,
      }));

      return res.status(200).json({
        success: true,
        message: "Sections retrieved successfully",
        data: {
          class_id: classId,
          class_name: className,
          total_sections: mappedSections.length,
          sections: mappedSections,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all sections for a school
  // GET /api/v1/academic/admin/sections/all
  getAllSections: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const sections = await sectionsService.getAllSections(user, school_id);

      // Map id field to section_id for consistency
      const mappedSections = sections.map((section) => ({
        section_id: section.id,
        section_name: section.section_name,
      }));

      return res.status(200).json({
        success: true,
        message: "All sections retrieved successfully",
        data: {
          total_sections: mappedSections.length,
          sections: mappedSections,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get classes and sections mapping for dropdown
  // GET /api/v1/academic/admin/sections/classes-sections
  getClassesSections: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const classesWithSections = await sectionsService.getClassesSections(
        user,
        school_id
      );

      // Get all classes from common API for enrichment
      let classOrderMap = {};
      try {
        const response = await commonApiGet(`/api/v1/classes`, null);
        if (response && response.success && Array.isArray(response.data)) {
          response.data.forEach((cls) => {
            classOrderMap[cls.id] = {
              class_name: cls.class_name,
              order_number: cls.order_number,
            };
          });
        }
      } catch (error) {
        // Continue without enrichment if common API fails
      }

      // Group by class
      const groupedByClass = {};
      classesWithSections.forEach((row) => {
        if (!groupedByClass[row.class_id]) {
          groupedByClass[row.class_id] = {
            class_id: row.class_id,
            class_name: (classOrderMap[row.class_id] && classOrderMap[row.class_id].class_name) || row.class_id,
            order_number: (classOrderMap[row.class_id] && classOrderMap[row.class_id].order_number) || 999,
            sections: [],
          };
        }
        groupedByClass[row.class_id].sections.push({
          section_id: row.section_id,
          section_name: row.section_name,
        });
      });

      // Convert to array and sort by order number
      let classes = Object.values(groupedByClass);
      classes = classes.sort((a, b) => a.order_number - b.order_number);

      return res.status(200).json({
        success: true,
        message: "Classes and sections retrieved successfully",
        data: {
          total_classes: classes.length,
          classes: classes,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = sectionsController;
