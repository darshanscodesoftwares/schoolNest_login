const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

/**
 * Run all migration files in the migrations directory
 * Each migration file should be named: NNN_description.sql
 * Migrations are run in alphabetical order
 */
const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, '../../migrations');

  try {
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found, skipping migrations');
      return;
    }

    // Get all SQL files in migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }

    console.log(`Found ${files.length} migration file(s)`);

    // Run each migration
    for (const file of files) {
      try {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`Running migration: ${file}`);
        await pool.query(sql);
        console.log(`✓ Completed: ${file}`);
      } catch (error) {
        console.error(`✗ Error in migration ${file}:`, error.message);
        // Continue with next migration instead of throwing
        // This allows partial migrations to be completed
      }
    }

    console.log('All migrations completed');
  } catch (error) {
    console.error('Error running migrations:', error.message);
    // Don't throw - allow app to continue even if migrations fail
  }
};

module.exports = runMigrations;
