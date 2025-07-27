const cron = require('node-cron');
const { sendFeeReminders } = require('../services/reminderService');

// This schedule runs the job every day at 9:00 AM.
const scheduleFeeReminders = () => {
    cron.schedule('0 9 * * *', () => {
        // cron.schedule('* * * * *', () => { 

        console.log('Running scheduled job: Send Fee Reminders...');
        sendFeeReminders();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set to your timezone
    });
};

module.exports = scheduleFeeReminders;