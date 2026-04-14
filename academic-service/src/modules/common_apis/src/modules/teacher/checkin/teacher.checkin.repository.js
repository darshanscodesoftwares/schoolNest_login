const pool = require('../../../config/db');

const getSchoolCampusConfig = async ({ schoolId }) => {
  const query = {
    text: `
      SELECT campus_latitude, campus_longitude, campus_radius_meters, checkin_time
      FROM school_config
      WHERE school_id = $1
    `,
    values: [schoolId]
  };
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const getTodayCheckin = async ({ schoolId, teacherId, date }) => {
  const query = {
    text: `
      SELECT id, check_in_time, status, latitude, longitude, date
      FROM teacher_checkins
      WHERE school_id = $1
        AND teacher_id = $2
        AND date = $3
    `,
    values: [schoolId, teacherId, date]
  };
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const insertCheckin = async ({ schoolId, teacherId, latitude, longitude, status, date }) => {
  const query = {
    text: `
      INSERT INTO teacher_checkins (school_id, teacher_id, check_in_time, latitude, longitude, status, date)
      VALUES ($1, $2, NOW(), $3, $4, $5, $6)
      RETURNING id, check_in_time, status, date
    `,
    values: [schoolId, teacherId, parseFloat(latitude), parseFloat(longitude), status, date]
  };
  const { rows } = await pool.query(query);
  return rows[0];
};

module.exports = { getSchoolCampusConfig, getTodayCheckin, insertCheckin };
