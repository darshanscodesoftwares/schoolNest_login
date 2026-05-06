const cron = require("node-cron");
const pool = require("../config/db");
const academicYearsService = require("../modules/admin/academic-years/academic-years.service");

// Run every December 30 at 00:00 (midnight)
// Cron expression: "0 0 30 12 *" (minute hour day month dayOfWeek)
const scheduleAcademicYearGeneration = () => {
  cron.schedule("0 0 30 12 *", async () => {
    console.log("[CRON] Running academic year auto-generation job...");

    try {
      // Get all schools
      const result = await pool.query(`SELECT DISTINCT school_id FROM academic_years`);
      const schools = result.rows;

      if (schools.length === 0) {
        console.log("[CRON] No schools found with academic years");
        return;
      }

      // For each school, generate next year
      for (const { school_id } of schools) {
        try {
          // Get current active year
          const activeYearResult = await pool.query(
            `SELECT year_name FROM academic_years WHERE school_id = $1 AND is_active = true LIMIT 1`,
            [school_id]
          );

          if (activeYearResult.rows.length === 0) {
            console.log(`[CRON] No active year found for school ${school_id}`);
            continue;
          }

          const currentYear = activeYearResult.rows[0].year_name;
          await academicYearsService.autoGenerateNextYear(school_id, currentYear);
        } catch (error) {
          console.error(`[CRON] Error processing school ${school_id}:`, error.message);
        }
      }

      console.log("[CRON] Academic year auto-generation job completed");
    } catch (error) {
      console.error("[CRON] Error in academic year auto-generation job:", error);
    }
  });

  console.log("[INIT] Academic year auto-generation scheduled for Dec 30 at 00:00");
};

module.exports = { scheduleAcademicYearGeneration };
