// backend/services/reminderService.js

const FeeRecord = require('../models/FeeRecord');
const sendEmail = require('../utils/sendEmail');

const sendFeeReminders = async () => {
    console.log('Starting fee reminder process...');
    try {
        const today = new Date();
        // Find fees that are unpaid or partially paid
        const feesToRemind = await FeeRecord.find({
            status: { $in: ['unpaid', 'partially_paid', 'overdue'] },
            dueDate: { $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) }
        }).populate({
            path: 'enrollment',
            // --- THIS IS THE CORRECTED POPULATE LOGIC ---
            populate: [
                {
                    path: 'student',
                    select: 'name parentInfo' // Get student's name and parent info
                },
                {
                    path: 'class',
                    select: 'name' // Get the class name directly from the enrollment
                }
            ]
        });

        let emailsSent = 0;

        for (const fee of feesToRemind) {
            // Correctly access the populated data
            const parentInfo = fee.enrollment?.student?.parentInfo;
            const studentName = fee.enrollment?.student?.name;
            const className = fee.enrollment?.class?.name;

            if (!parentInfo || !parentInfo.email || !studentName || !className) {
                continue; // Skip if we don't have the necessary details
            }

            // Logic to prevent spamming
            const lastReminder = fee.remindersSent[fee.remindersSent.length - 1];
            if (lastReminder) {
                const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
                if (lastReminder.date > threeDaysAgo) {
                    continue;
                }
            }

            const amountDue = fee.amount - fee.amountPaid;
            const dueDate = fee.dueDate.toLocaleDateString();

            const message = `
        Dear ${parentInfo.name},

        This is a friendly reminder regarding the fee for ${studentName}'s enrollment in the class "${className}".

        Amount Due: INR ${amountDue}
        Due Date: ${dueDate}

        Thank you for your prompt attention to this matter.

        Sincerely,
        FeeFlow
      `;

            try {
                await sendEmail({
                    email: parentInfo.email,
                    subject: `Fee Reminder for ${studentName}`,
                    message
                });

                fee.remindersSent.push({ status: 'sent' });
                await fee.save();
                emailsSent++;
            } catch (emailError) {
                console.error(`Failed to send email to ${parentInfo.email}`, emailError);
                fee.remindersSent.push({ status: 'failed' });
                await fee.save();
            }
        }
        console.log(`Fee reminder process complete. Emails sent: ${emailsSent}.`);
    } catch (error) {
        console.error('Error during fee reminder process:', error);
    }
};

module.exports = { sendFeeReminders };