require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

const SALT_ROUNDS = 10;
const SCHOOL_ID = 101;

const seedData = [
  { id: 'ADM001', role: 'ADMIN', name: 'Admin User', email: 'admin@schoolnest.com', password: 'Admin@123' },
  { id: 'TCH001', role: 'TEACHER', name: 'John Doe', email: 'john@schoolnest.com', password: 'Teacher@123' },
  { id: 'TCH002', role: 'TEACHER', name: 'Jane Smith', email: 'jane@schoolnest.com', password: 'Teacher@123' },
  { id: 'PAR001', role: 'PARENT', name: 'Alice Johnson', email: 'alice@schoolnest.com', password: 'Parent@123' },
  { id: 'PAR002', role: 'PARENT', name: 'Bob Wilson', email: 'bob@schoolnest.com', password: 'Parent@123' },
];

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Insert roles (ADMIN, TEACHER, PARENT)
    const roleNames = ['ADMIN', 'TEACHER', 'PARENT'];
    for (const roleName of roleNames) {
      await pool.query(
        'INSERT INTO roles (name) VALUES ($1) ON CONFLICT DO NOTHING',
        [roleName]
      );
    }
    console.log('✓ Roles inserted');

    // Insert users
    for (const user of seedData) {
      const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

      // Get role_id
      const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [user.role]);
      const roleId = roleResult.rows[0].id;

      await pool.query(
        `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [user.id, SCHOOL_ID, roleId, user.name, user.email, passwordHash]
      );
    }
    console.log(`✓ ${seedData.length} users inserted`);

    console.log('\n📋 Seed Summary:');
    console.log(`   School ID: ${SCHOOL_ID}`);
    console.log(`   Users: ${seedData.map(u => `${u.email} (${u.role})`).join(', ')}`);
    console.log('\n🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();
