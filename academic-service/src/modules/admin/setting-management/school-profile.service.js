const schoolProfileRepository = require("./school-profile.repository");

const schoolProfileService = {
  // Validate admin role
  validateAdminRole: (user) => {
    if (!user || user.role !== "ADMIN") {
      const error = new Error("Access denied. Admin role required.");
      error.statusCode = 403;
      throw error;
    }
  },

  // Get school profile
  getProfile: async (user, school_id) => {
    schoolProfileService.validateAdminRole(user);

    const profile = await schoolProfileRepository.getProfileBySchoolId(school_id);

    if (!profile) {
      const error = new Error("School profile not found");
      error.statusCode = 404;
      throw error;
    }

    return profile;
  },

  // Create school profile
  createProfile: async (user, school_id, profileData) => {
    schoolProfileService.validateAdminRole(user);

    // Check if profile already exists
    const existing = await schoolProfileRepository.getProfileBySchoolId(school_id);
    if (existing) {
      const error = new Error("School profile already exists for this school");
      error.statusCode = 400;
      throw error;
    }

    // Validate email format
    if (profileData.contact_email && !isValidEmail(profileData.contact_email)) {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      throw error;
    }

    // Validate established year
    if (profileData.established_year && profileData.established_year > new Date().getFullYear()) {
      const error = new Error("Established year cannot be in the future");
      error.statusCode = 400;
      throw error;
    }

    return await schoolProfileRepository.createProfile(school_id, profileData);
  },

  // Update school profile
  updateProfile: async (user, school_id, profileData) => {
    schoolProfileService.validateAdminRole(user);

    // Check if profile exists
    const existing = await schoolProfileRepository.getProfileBySchoolId(school_id);
    if (!existing) {
      const error = new Error("School profile not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate email format if provided
    if (profileData.contact_email && !isValidEmail(profileData.contact_email)) {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      throw error;
    }

    // Validate established year if provided
    if (profileData.established_year && profileData.established_year > new Date().getFullYear()) {
      const error = new Error("Established year cannot be in the future");
      error.statusCode = 400;
      throw error;
    }

    return await schoolProfileRepository.updateProfile(school_id, profileData);
  },

  // Delete school profile
  deleteProfile: async (user, school_id) => {
    schoolProfileService.validateAdminRole(user);

    // Check if profile exists
    const existing = await schoolProfileRepository.getProfileBySchoolId(school_id);
    if (!existing) {
      const error = new Error("School profile not found");
      error.statusCode = 404;
      throw error;
    }

    return await schoolProfileRepository.deleteProfile(school_id);
  },
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = schoolProfileService;
