const checkinRepository = require('./teacher.checkin.repository');

const assertTeacherRole = (user) => {
  if (!user || user.role !== 'TEACHER') {
    const error = new Error('Forbidden: only teachers can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

// Haversine formula — returns distance between two GPS points in meters
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Returns today's date as YYYY-MM-DD in IST
const getTodayIST = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

// Compares current IST time against school's check-in deadline
// checkinTimeStr is "09:30:00" from DB
const resolveCheckinStatus = (checkinTimeStr) => {
  const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const [hours, minutes] = checkinTimeStr.split(':').map(Number);
  const deadline = new Date(nowIST);
  deadline.setHours(hours, minutes, 0, 0);
  return nowIST <= deadline ? 'ON_TIME' : 'LATE';
};

const getTodayCheckinStatus = async ({ user }) => {
  assertTeacherRole(user);

  const today = getTodayIST();
  const existing = await checkinRepository.getTodayCheckin({
    schoolId: user.school_id,
    teacherId: user.user_id,
    date: today
  });

  if (!existing) {
    return { success: true, checked_in: false, check_in_time: null, status: null };
  }

  return {
    success: true,
    checked_in: true,
    check_in_time: existing.check_in_time,
    status: existing.status,
    date: existing.date
  };
};

const markCheckin = async ({ user, latitude, longitude }) => {
  assertTeacherRole(user);

  if (latitude == null || longitude == null) {
    const error = new Error('latitude and longitude are required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    const error = new Error('Invalid coordinates');
    error.statusCode = 400;
    error.code = 'INVALID_COORDINATES';
    throw error;
  }

  // Get school campus config
  const campus = await checkinRepository.getSchoolCampusConfig({ schoolId: user.school_id });

  if (!campus || campus.campus_latitude == null || campus.campus_longitude == null) {
    const error = new Error('School campus location is not configured');
    error.statusCode = 503;
    error.code = 'CAMPUS_NOT_CONFIGURED';
    throw error;
  }

  // Geofence check
  const distance = getDistanceInMeters(lat, lon, campus.campus_latitude, campus.campus_longitude);
  if (distance > campus.campus_radius_meters) {
    const error = new Error('You must be within the school campus to check in');
    error.statusCode = 403;
    error.code = 'OUTSIDE_CAMPUS';
    throw error;
  }

  // Prevent duplicate check-in
  const today = getTodayIST();
  const existing = await checkinRepository.getTodayCheckin({
    schoolId: user.school_id,
    teacherId: user.user_id,
    date: today
  });

  if (existing) {
    const error = new Error('You have already checked in today');
    error.statusCode = 409;
    error.code = 'ALREADY_CHECKED_IN';
    throw error;
  }

  // Determine ON_TIME or LATE
  const status = resolveCheckinStatus(campus.checkin_time);

  const record = await checkinRepository.insertCheckin({
    schoolId: user.school_id,
    teacherId: user.user_id,
    latitude: lat,
    longitude: lon,
    status,
    date: today
  });

  return {
    success: true,
    message: status === 'ON_TIME' ? 'Checked in on time!' : 'Checked in late',
    check_in_time: record.check_in_time,
    status: record.status,
    date: record.date
  };
};

module.exports = { getTodayCheckinStatus, markCheckin };
