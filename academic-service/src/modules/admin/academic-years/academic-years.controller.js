const svc = require("./academic-years.service");

const academicYearsController = {
  // Get all academic years
  getAllYears: async (req, res, next) => {
    try {
      const data = await svc.getAllYears(req.user, req.user.school_id);
      return res.status(200).json({
        success: true,
        message: "Academic years retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get active academic year
  getActiveYear: async (req, res, next) => {
    try {
      const data = await svc.getActiveYear(req.user, req.user.school_id);
      return res.status(200).json({
        success: true,
        message: "Active academic year retrieved",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new academic year
  createYear: async (req, res, next) => {
    try {
      const { year_name, start_date, end_date } = req.body;
      const data = await svc.createYear(
        req.user,
        req.user.school_id,
        year_name,
        start_date,
        end_date
      );
      return res.status(201).json({
        success: true,
        message: "Academic year created successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Auto-create next academic year
  autoGenerateNextYear: async (req, res, next) => {
    try {
      const { currentYear } = req.body;
      if (!currentYear) {
        const error = new Error("currentYear is required");
        error.statusCode = 400;
        throw error;
      }

      const data = await svc.autoGenerateNextYear(req.user.school_id, currentYear);
      return res.status(201).json({
        success: true,
        message: "Next academic year auto-generated",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Transition to next year (activate new, keep old for historical access)
  transitionYear: async (req, res, next) => {
    try {
      const { toYear } = req.body;
      if (!toYear) {
        const error = new Error("toYear is required");
        error.statusCode = 400;
        throw error;
      }

      const data = await svc.transitionYear(req.user, req.user.school_id, toYear);
      return res.status(200).json({
        success: true,
        message: "Academic year activated successfully. Old years kept for historical access.",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = academicYearsController;
