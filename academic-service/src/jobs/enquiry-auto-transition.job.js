const cron = require("node-cron");
const enquiriesService = require("../modules/admin/student-admission/enquiries/admin.enquiries.service");

/**
 * Schedule auto-transition job
 * Runs every hour to check and update old "New" enquiries to "Follow-up"
 *
 * Cron syntax: minute hour day month day-of-week
 * '0 * * * *' means run at minute 0 of every hour
 */
const startAutoTransitionJob = () => {
  // Run every hour at minute 0
  const job = cron.schedule("0 * * * *", async () => {
    console.log(`[${new Date().toISOString()}] Running auto-transition job...`);
    const result = await enquiriesService.autoTransitionNewEnquiries();
    console.log(`[${new Date().toISOString()}] Job result:`, result);
  });

  console.log("✓ Auto-transition job scheduled (runs every hour)");
  return job;
};

//check
/**
 * Stop the auto-transition job
 */
const stopAutoTransitionJob = (job) => {
  if (job) {
    job.stop();
    console.log("Auto-transition job stopped");
  }
};

module.exports = {
  startAutoTransitionJob,
  stopAutoTransitionJob,
};
