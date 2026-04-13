const schoolProfileService = require("./school-profile.service");

const schoolProfileController = {
  // GET /api/v1/academic/admin/settings/school-profile
  // Get school profile
  getProfile: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const profile = await schoolProfileService.getProfile(user, school_id);

      return res.status(200).json({
        success: true,
        message: "School profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/academic/admin/settings/school-profile
  // Create school profile
  createProfile: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const {
        school_name,
        affiliation_number,
        principal_name,
        contact_email,
        phone_number,
        established_year,
        address,
      } = req.body;

      const profile = await schoolProfileService.createProfile(user, school_id, {
        school_name,
        affiliation_number,
        principal_name,
        contact_email,
        phone_number,
        established_year,
        address,
      });

      return res.status(201).json({
        success: true,
        message: "School profile created successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/academic/admin/settings/school-profile
  // Update school profile
  updateProfile: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;
      const {
        school_name,
        affiliation_number,
        principal_name,
        contact_email,
        phone_number,
        established_year,
        address,
      } = req.body;

      const profile = await schoolProfileService.updateProfile(user, school_id, {
        school_name,
        affiliation_number,
        principal_name,
        contact_email,
        phone_number,
        established_year,
        address,
      });

      return res.status(200).json({
        success: true,
        message: "School profile updated successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/academic/admin/settings/school-profile
  // Delete school profile
  deleteProfile: async (req, res, next) => {
    try {
      const school_id = req.user.school_id;
      const user = req.user;

      const deletedProfile = await schoolProfileService.deleteProfile(user, school_id);

      return res.status(200).json({
        success: true,
        message: "School profile deleted successfully",
        data: deletedProfile,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = schoolProfileController;
