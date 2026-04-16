/**
 * auth-service/seed.js — Seeds auth_db with roles + admin user
 *
 * For full cross-DB seeding (teachers, parents, students, demo data),
 * use the root-level scripts instead:
 *   node seed-all.js          → reference data + admin user
 *   node seed-test-users.js   → teachers, parents, students with matching IDs
 *   node seed-demo-full.js    → full dashboard demo data
 *
 * This file is a lightweight auth-only seed for quick local setup.
 */

require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

const SALT_ROUNDS = 10;
const SCHOOL_ID = 101;

const seed = async () => {
  try {
    console.log('auth_db seed — roles + admin user\n');

    // Roles
    for (const role of ['ADMIN', 'TEACHER', 'PARENT']) {
      await pool.query(
        'INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [role]
      );
    }
    console.log('  ✓ Roles: ADMIN, TEACHER, PARENT');

    // Admin user
    const roleRes = await pool.query(`SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1`);
    const adminRoleId = roleRes.rows[0].id;
    const adminHash = await bcrypt.hash('Admin@123', SALT_ROUNDS);

    await pool.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      ['ADM001', SCHOOL_ID, adminRoleId, 'Admin User', 'admin@schoolnest.com', adminHash]
    );
    console.log('  ✓ Admin: admin@schoolnest.com / Admin@123');

    console.log('\n  For teachers/parents, run from repo root:');
    console.log('    node seed-test-users.js');
    console.log('    node seed-demo-full.js\n');

  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();
