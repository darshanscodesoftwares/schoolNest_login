const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const attendanceRoutes = require('./modules/teacher/attendance/teacher.attendance.routes');
const teacherHomeworkRoutes = require('./modules/teacher/homework/teacher.homework.routes');
const teacherTimetableRoutes = require('./modules/teacher/timetable/teacher.timetable.routes');
const teacherAnnouncementRoutes = require('./modules/teacher/announcement/teacher.announcement.routes');
const teacherLeaveRoutes = require('./modules/teacher/leave/teacher.leave.routes');
const teacherExamRoutes = require('./modules/teacher/exam/teacher.exam.routes');
const teacherCheckinRoutes = require('./modules/teacher/checkin/teacher.checkin.routes');
const parentResultsRoutes = require('./modules/parent/results/parent.results.routes');
const parentAttendanceRoutes = require('./modules/parent/attendance/parent.attendance.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'academic-service' });
});

app.use('/api/v1/academic', authMiddleware, attendanceRoutes);
app.use('/api/v1/academic', authMiddleware, teacherHomeworkRoutes);
app.use('/api/v1/academic', authMiddleware, teacherTimetableRoutes);
app.use('/api/v1/academic', authMiddleware, teacherAnnouncementRoutes);
app.use('/api/v1/academic', authMiddleware, teacherLeaveRoutes);
app.use('/api/v1/academic', authMiddleware, teacherExamRoutes);
app.use('/api/v1/academic', authMiddleware, teacherCheckinRoutes);
app.use('/api/v1/parent', authMiddleware, parentResultsRoutes);
app.use('/api/v1/parent', authMiddleware, parentAttendanceRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Global error handler (Frontend-friendly)
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
