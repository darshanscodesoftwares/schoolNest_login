const academicYearsRepository = require("./academic-years.repository");

// Auto-generate next academic year (called on Dec 30)
const autoGenerateNextYear = async (school_id, currentYear) => {
  try {
    // Parse current year (e.g., "2025-2026" -> 2025)
    const [startYear] = currentYear.split("-");
    const nextStartYear = parseInt(startYear) + 1;
    const nextEndYear = nextStartYear + 1;
    const nextYear = `${nextStartYear}-${nextEndYear}`;

    // Check if next year already exists
    const exists = await academicYearsRepository.yearExists(school_id, nextYear);
    if (exists) {
      console.log(`Academic year ${nextYear} already exists for school ${school_id}`);
      return null;
    }

    // Create next year (starts June 1, ends May 31)
    const nextStartDate = new Date(nextStartYear, 5, 1); // June 1
    const nextEndDate = new Date(nextEndYear, 4, 31); // May 31

    const newYear = await academicYearsRepository.createYear({
      school_id,
      year_name: nextYear,
      start_date: nextStartDate,
      end_date: nextEndDate,
    });

    console.log(`Auto-created academic year ${nextYear} for school ${school_id}`);
    return newYear;
  } catch (error) {
    console.error(`Error auto-generating academic year:`, error);
    throw error;
  }
};

const academicYearsService = {
  getAllYears: async (user, school_id) => {
    if (!user || user.role !== "ADMIN") {
      const error = new Error("Forbidden: admins only");
      error.statusCode = 403;
      throw error;
    }

    return academicYearsRepository.getAllYears(school_id);
  },

  getActiveYear: async (user, school_id) => {
    if (!user || user.role !== "ADMIN") {
      const error = new Error("Forbidden: admins only");
      error.statusCode = 403;
      throw error;
    }

    return academicYearsRepository.getActiveYear(school_id);
  },

  createYear: async (user, school_id, year_name, start_date, end_date) => {
    if (!user || user.role !== "ADMIN") {
      const error = new Error("Forbidden: admins only");
      error.statusCode = 403;
      throw error;
    }

    if (!year_name || !start_date || !end_date) {
      const error = new Error("Missing required fields: year_name, start_date, end_date");
      error.statusCode = 400;
      throw error;
    }

    return academicYearsRepository.createYear({
      school_id,
      year_name,
      start_date,
      end_date,
    });
  },

  // Transition to next year (keep old years, just activate new one)
  transitionYear: async (user, school_id, toYear) => {
    if (!user || user.role !== "ADMIN") {
      const error = new Error("Forbidden: admins only");
      error.statusCode = 403;
      throw error;
    }

    return academicYearsRepository.transitionYear(school_id, toYear);
  },

  // Auto-create next year if needed
  autoGenerateNextYear,
};

module.exports = academicYearsService;
