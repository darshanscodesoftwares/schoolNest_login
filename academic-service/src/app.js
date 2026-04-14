const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authMiddleware = require('./middleware/auth.middleware');

// ── Swagger ──────────────────────────────────────────────────────────────────
const swaggerUi  = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// ── Teacher routes (yours — complete set) ────────────────────────────────────
const attendanceRoutes       = require('./modules/teacher/attendance/teacher.attendance.routes');
const teacherHomeworkRoutes  = require('./modules/teacher/homework/teacher.homework.routes');
const teacherTimetableRoutes = require('./modules/teacher/timetable/teacher.timetable.routes');
const teacherAnnouncementRoutes = require('./modules/teacher/announcement/teacher.announcement.routes');
const teacherLeaveRoutes     = require('./modules/teacher/leave/teacher.leave.routes');
const teacherExamRoutes      = require('./modules/teacher/exam/teacher.exam.routes');
const teacherCheckinRoutes   = require('./modules/teacher/checkin/teacher.checkin.routes');
// New teacher modules from jerin
const teacherWorkDetailsRoutes  = require('./modules/teacher/work-details/teacher.work-details.routes');
const teacherEditRequestsRoutes = require('./modules/teacher/edit-requests/teacher.edit-requests.routes');

// ── Parent routes (yours — complete set) ─────────────────────────────────────
const parentRoutes            = require('./modules/parent/attendance/parent.attendance.routes');
const parentTimetableRoutes   = require('./modules/parent/timetable/parent.timetable.routes');
const parentHomeworkRoutes    = require('./modules/parent/homework/parent.homework.routes');
const parentAnnouncementRoutes = require('./modules/parent/announcement/parent.announcement.routes');
const parentLeaveRoutes       = require('./modules/parent/leave/parent.leave.routes');
const parentResultsRoutes     = require('./modules/parent/results/parent.results.routes');
const parentFeesRoutes        = require('./modules/parent/fees/parent.fees.routes');

// ── Admin routes (from jerin) ─────────────────────────────────────────────────
const enquiriesRoutes            = require('./modules/admin/student-admission/enquiries/admin.enquiries.routes');
const admissionsRoutes           = require('./modules/admin/student-admission/admissions/admissions.routes');
const staffStudentsRoutes        = require('./modules/admin/staff-students/staff-students.routes');
const teacherRecordsRoutes       = require('./modules/admin/staff-students/teacher/teacher-records.routes');
const driverRecordsRoutes        = require('./modules/admin/staff-students/driver/driver-records.routes');
const otherStaffRoutes           = require('./modules/admin/staff-students/other-staff/other-staff.routes');
const classesAssignRoutes        = require('./modules/admin/classes-assign/classes-assign.routes');
const subjectAssignRoutes        = require('./modules/admin/subject-assign/subject-assign.routes');
const sectionsRoutes             = require('./modules/admin/Exams&Results/sections.routes');
const examsRoutes                = require('./modules/admin/Exams&Results/exams.routes');
const announcementsRoutes        = require('./modules/admin/announcements/announcements.routes');
const schoolProfileRoutes        = require('./modules/admin/setting-management/school-profile.routes');
const adminTeacherEditRequestsRoutes = require('./modules/admin/teacher-edit-requests/admin.teacher-edit-requests.routes');
const masterDataRoutes               = require('./modules/admin/master-data/master-data.routes');

// ─────────────────────────────────────────────────────────────────────────────
const app = express();

// CORS
app.use(cors());

// Serve uploaded files statically BEFORE auth middleware
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// JSON parsing — skip for multipart/form-data (multer handles those)
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) return next();
  express.json({ limit: '1mb' })(req, res, next);
});

// Swagger docs — persistAuthorization keeps tokens across reloads
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { persistAuthorization: true },
}));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'academic-service' });
});

// ── Teacher routes ────────────────────────────────────────────────────────────
app.use('/api/v1/academic', authMiddleware, attendanceRoutes);
app.use('/api/v1/academic', authMiddleware, teacherHomeworkRoutes);
app.use('/api/v1/academic', authMiddleware, teacherTimetableRoutes);
app.use('/api/v1/academic', authMiddleware, teacherAnnouncementRoutes);
app.use('/api/v1/academic', authMiddleware, teacherLeaveRoutes);
app.use('/api/v1/academic', authMiddleware, teacherExamRoutes);
app.use('/api/v1/academic', authMiddleware, teacherCheckinRoutes);
app.use('/api/v1/academic/teacher', authMiddleware, teacherWorkDetailsRoutes);
app.use('/api/v1/academic/teacher', authMiddleware, teacherEditRequestsRoutes);

// ── Parent routes ─────────────────────────────────────────────────────────────
app.use('/api/v1/parent', authMiddleware, parentRoutes);
app.use('/api/v1/parent', authMiddleware, parentTimetableRoutes);
app.use('/api/v1/parent', authMiddleware, parentHomeworkRoutes);
app.use('/api/v1/parent', authMiddleware, parentAnnouncementRoutes);
app.use('/api/v1/parent', authMiddleware, parentLeaveRoutes);
app.use('/api/v1/parent', authMiddleware, parentResultsRoutes);
app.use('/api/v1/parent', authMiddleware, parentFeesRoutes);

// ── Admin routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/academic', authMiddleware, enquiriesRoutes);
app.use('/api/v1/academic', authMiddleware, admissionsRoutes);
app.use('/api/v1/academic', authMiddleware, staffStudentsRoutes);
app.use('/api/v1/academic/admin/teachers', authMiddleware, teacherRecordsRoutes);
app.use('/api/v1/academic/admin/drivers', authMiddleware, driverRecordsRoutes);
app.use('/api/v1/academic/admin/other-staff', authMiddleware, otherStaffRoutes);
app.use('/api/v1/academic/admin', authMiddleware, classesAssignRoutes);
app.use('/api/v1/academic/admin', authMiddleware, subjectAssignRoutes);
app.use('/api/v1/academic/admin', authMiddleware, sectionsRoutes);
app.use('/api/v1/academic/admin', authMiddleware, examsRoutes);
app.use('/api/v1/academic/admin/announcements', authMiddleware, announcementsRoutes);
app.use('/api/v1/academic/admin/settings', authMiddleware, schoolProfileRoutes);
app.use('/api/v1/academic/admin', authMiddleware, adminTeacherEditRequestsRoutes);
app.use('/api/v1/academic', masterDataRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isSuccess = statusCode < 400;

  res.status(statusCode).json({
    success: isSuccess,
    message: error.message || 'Internal server error',
    code: error.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'UNKNOWN_ERROR'),
    details: error.details || null,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
