const composeRepository = require("./compose.repository");

const composeService = {
  // Send announcement to Teachers with Whole School scope
  sendAnnouncementToTeachersWholeSchool: async (school_id, user_id, announcement_data) => {
    try {
      // 1. Create announcement (extract scope from announcement_data)
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get all active teachers
      const teachers = await composeRepository.getAllTeachers(school_id);

      if (teachers.length === 0) {
        throw new Error("No active teachers found in this school");
      }

      // 3. Prepare recipients data
      const recipients = teachers.map(teacher => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Teacher",
        recipient_id: teacher.teacher_id,
        teacher_id: teacher.teacher_id,
        parent_id: null,
        class_id: null,
      }));

      // 4. Insert all recipients
      await composeRepository.insertRecipients(recipients);

      // 5. Update recipient count in announcement
      await composeRepository.updateRecipientCount(announcement.id, teachers.length);

      // 6. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        teachers.length
      );

      // 7. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: teachers.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },

  // Send announcement to Parents with Whole School scope
  sendAnnouncementToParentsWholeSchool: async (school_id, user_id, announcement_data) => {
    try {
      // 1. Create announcement (extract scope from announcement_data)
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get all parents
      const parents = await composeRepository.getAllParents(school_id);

      if (parents.length === 0) {
        throw new Error("No parents found in this school");
      }

      // 3. Prepare recipients data
      const recipients = parents.map(parent => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Parent",
        recipient_id: parent.parent_id,
        teacher_id: null,
        parent_id: parent.parent_id,
        class_id: null,
      }));

      // 4. Insert all recipients
      await composeRepository.insertRecipients(recipients);

      // 5. Update recipient count in announcement
      await composeRepository.updateRecipientCount(announcement.id, parents.length);

      // 6. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        parents.length
      );

      // 7. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: parents.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },

  // Send announcement to Teachers with By Class scope
  sendAnnouncementToTeachersByClass: async (school_id, user_id, class_id, announcement_data) => {
    try {
      // 1. Create announcement
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get teachers assigned to the class
      const teachers = await composeRepository.getTeachersByClass(school_id, class_id);

      if (teachers.length === 0) {
        throw new Error("No teachers assigned to this class");
      }

      // 3. Prepare recipients data
      const recipients = teachers.map(teacher => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Teacher",
        recipient_id: teacher.teacher_id,
        teacher_id: teacher.teacher_id,
        parent_id: null,
        class_id,
      }));

      // 4. Insert all recipients
      await composeRepository.insertRecipients(recipients);

      // 5. Update recipient count in announcement
      await composeRepository.updateRecipientCount(announcement.id, teachers.length);

      // 6. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        teachers.length
      );

      // 7. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: teachers.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },

  // Send announcement to Parents with By Class scope
  sendAnnouncementToParentsByClass: async (school_id, user_id, class_id, announcement_data) => {
    try {
      // 1. Create announcement
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get parents of students in the class
      const parents = await composeRepository.getParentsByClass(school_id, class_id);

      // Allow empty classes - announcement is created but with 0 recipients
      if (parents.length === 0) {
        // 3. Update recipient count to 0
        await composeRepository.updateRecipientCount(announcement.id, 0);

        // 4. Create history entry with 0 recipients
        const history = await composeRepository.createHistory(
          school_id,
          announcement.id,
          0
        );

        // 5. Fetch updated announcement
        const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

        return {
          announcement: updatedAnnouncement,
          total_recipients: 0,
          history,
        };
      }

      // 3. Prepare recipients data
      const recipients = parents.map(parent => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Parent",
        recipient_id: parent.parent_id,
        teacher_id: null,
        parent_id: parent.parent_id,
        class_id,
      }));

      // 4. Insert all recipients
      await composeRepository.insertRecipients(recipients);

      // 5. Update recipient count in announcement
      await composeRepository.updateRecipientCount(announcement.id, parents.length);

      // 6. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        parents.length
      );

      // 7. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: parents.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },

  // Send announcement to Both Teachers and Parents with By Class scope
  sendAnnouncementToBothByClass: async (school_id, user_id, class_id, announcement_data) => {
    try {
      // 1. Create announcement
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get teachers and parents for the class
      const teachers = await composeRepository.getTeachersByClass(school_id, class_id);
      const parents = await composeRepository.getParentsByClass(school_id, class_id);

      // Allow if at least one of them exists
      const totalRecipients = teachers.length + parents.length;

      // 3. Prepare recipients data for teachers
      const teacherRecipients = teachers.map(teacher => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Teacher",
        recipient_id: teacher.teacher_id,
        teacher_id: teacher.teacher_id,
        parent_id: null,
        class_id,
      }));

      // 4. Prepare recipients data for parents
      const parentRecipients = parents.map(parent => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Parent",
        recipient_id: parent.parent_id,
        teacher_id: null,
        parent_id: parent.parent_id,
        class_id,
      }));

      // 5. Combine all recipients
      const allRecipients = [...teacherRecipients, ...parentRecipients];

      // 6. Insert all recipients if any exist
      if (allRecipients.length > 0) {
        await composeRepository.insertRecipients(allRecipients);
      }

      // 7. Update recipient count in announcement
      await composeRepository.updateRecipientCount(announcement.id, totalRecipients);

      // 8. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        totalRecipients
      );

      // 9. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: totalRecipients,
        teachers_count: teachers.length,
        parents_count: parents.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },

  // Send announcement to Teachers with Specific Users scope
  sendAnnouncementToTeachersSpecificUsers: async (school_id, user_id, teacher_ids, announcement_data) => {
    try {
      // 1. Create announcement
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get specific teachers (validates and filters by active status)
      const teachers = await composeRepository.getSpecificTeachers(school_id, teacher_ids);

      if (teachers.length === 0) {
        throw new Error("No valid active teachers found with provided teacher_ids");
      }

      // 3. Prepare recipients data
      const recipients = teachers.map(teacher => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Teacher",
        recipient_id: teacher.teacher_id,
        teacher_id: teacher.teacher_id,
        parent_id: null,
        class_id: null,
      }));

      // 4. Insert all recipients
      await composeRepository.insertRecipients(recipients);

      // 5. Update recipient count in announcement
      await composeRepository.updateRecipientCount(announcement.id, teachers.length);

      // 6. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        teachers.length
      );

      // 7. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: teachers.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },

  // Send announcement to Parents with Specific Users scope
  sendAnnouncementToParentsSpecificUsers: async (school_id, user_id, parent_ids, announcement_data) => {
    try {
      // 1. Create announcement
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get specific parents
      const parents = await composeRepository.getSpecificParents(school_id, parent_ids);

      if (parents.length === 0) {
        throw new Error("No valid parents found with provided parent_ids");
      }

      // 3. Prepare recipients data
      const recipients = parents.map(parent => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Parent",
        recipient_id: parent.parent_id,
        teacher_id: null,
        parent_id: parent.parent_id,
        class_id: null,
      }));

      // 4. Insert all recipients
      await composeRepository.insertRecipients(recipients);

      // 5. Update recipient count in announcement
      await composeRepository.updateRecipientCount(announcement.id, parents.length);

      // 6. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        parents.length
      );

      // 7. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: parents.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },

  // Send announcement to Both Teachers and Parents with Whole School scope
  sendAnnouncementToBothWholeSchool: async (school_id, user_id, announcement_data) => {
    try {
      // 1. Create announcement
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get all teachers and parents
      const teachers = await composeRepository.getAllTeachers(school_id);
      const parents = await composeRepository.getAllParents(school_id);

      if (teachers.length === 0 && parents.length === 0) {
        throw new Error("No teachers or parents found in this school");
      }

      // 3. Prepare recipients data
      const recipients = [
        ...teachers.map(teacher => ({
          school_id,
          announcement_id: announcement.id,
          recipient_type: "Teacher",
          recipient_id: teacher.teacher_id,
          teacher_id: teacher.teacher_id,
          parent_id: null,
          class_id: null,
        })),
        ...parents.map(parent => ({
          school_id,
          announcement_id: announcement.id,
          recipient_type: "Parent",
          recipient_id: parent.parent_id,
          teacher_id: null,
          parent_id: parent.parent_id,
          class_id: null,
        })),
      ];

      // 4. Insert all recipients
      await composeRepository.insertRecipients(recipients);

      // 5. Update recipient count in announcement
      await composeRepository.updateRecipientCount(announcement.id, recipients.length);

      // 6. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        recipients.length
      );

      // 7. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: recipients.length,
        teachers_count: teachers.length,
        parents_count: parents.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },

  // Send announcement to Both Teachers and Parents with Specific Users scope
  sendAnnouncementToBothSpecificUsers: async (school_id, user_id, teacher_ids, parent_ids, announcement_data) => {
    try {
      // 1. Create announcement
      const announcement = await composeRepository.createAnnouncement(
        school_id,
        announcement_data,
        'Sent'
      );

      // 2. Get specific teachers (if provided)
      let teachers = [];
      if (teacher_ids && teacher_ids.length > 0) {
        teachers = await composeRepository.getSpecificTeachers(school_id, teacher_ids);
      }

      // 3. Get specific parents (if provided)
      let parents = [];
      if (parent_ids && parent_ids.length > 0) {
        parents = await composeRepository.getSpecificParents(school_id, parent_ids);
      }

      // At least one recipient must exist
      if (teachers.length === 0 && parents.length === 0) {
        throw new Error("No valid teachers or parents found with provided IDs");
      }

      // 4. Prepare recipients data for teachers
      const teacherRecipients = teachers.map(teacher => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Teacher",
        recipient_id: teacher.teacher_id,
        teacher_id: teacher.teacher_id,
        parent_id: null,
        class_id: null,
      }));

      // 5. Prepare recipients data for parents
      const parentRecipients = parents.map(parent => ({
        school_id,
        announcement_id: announcement.id,
        recipient_type: "Parent",
        recipient_id: parent.parent_id,
        teacher_id: null,
        parent_id: parent.parent_id,
        class_id: null,
      }));

      // 6. Combine all recipients
      const allRecipients = [...teacherRecipients, ...parentRecipients];

      // 7. Insert all recipients if any exist
      if (allRecipients.length > 0) {
        await composeRepository.insertRecipients(allRecipients);
      }

      // 8. Update recipient count in announcement
      const totalRecipients = teachers.length + parents.length;
      await composeRepository.updateRecipientCount(announcement.id, totalRecipients);

      // 9. Create history entry
      const history = await composeRepository.createHistory(
        school_id,
        announcement.id,
        totalRecipients
      );

      // 10. Fetch updated announcement with correct recipient_count
      const updatedAnnouncement = await composeRepository.getAnnouncementById(announcement.id, school_id);

      return {
        announcement: updatedAnnouncement,
        total_recipients: totalRecipients,
        teachers_count: teachers.length,
        parents_count: parents.length,
        history,
      };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = composeService;
