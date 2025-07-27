const cron = require('node-cron');
const { generateFeesForMonth } = require('../services/feeService');

// This schedule runs the job at 1:00 AM on the first day of every month.
// You can adjust the schedule as needed. E.g., '0 1 * * *' runs it daily at 1 AM.
const scheduleFeeGeneration = () => {
    cron.schedule('0 1 1 * *', () => {
        // cron.schedule('* * * * *', () => {


        console.log('Running scheduled job: Generate Monthly Fees...');
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        generateFeesForMonth(month, year);
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set to your timezone
    });
};

module.exports = scheduleFeeGeneration;