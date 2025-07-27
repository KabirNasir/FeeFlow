const Enrollment = require('../models/Enrollment');
const FeeRecord = require('../models/FeeRecord');
const Class = require('../models/Class');

const generateFeesForMonth = async (month, year) => {
    console.log(`Starting fee generation for ${month}/${year}...`);
    try {
        // We only care about enrollments that are currently active
        const enrollments = await Enrollment.find({ status: 'active' }).populate('class');
        const newFees = [];
        let skippedCount = 0;

        // Helper function to check if fees should be generated for a given frequency
        const shouldGenerate = (classFrequency, currentMonth) => {
            if (classFrequency === 'monthly') return true;
            if (classFrequency === 'quarterly') return [1, 4, 7, 10].includes(currentMonth);
            if (classFrequency === 'yearly') return currentMonth === 1;
            return false;
        };

        for (const enr of enrollments) {
            // Skip if the class is missing fee details
            if (!enr.class || !enr.class.fees) {
                skippedCount++;
                continue;
            }

            const classFrequency = enr.class.fees.frequency || 'monthly';

            // Skip if this class is not due for a fee this month
            if (!shouldGenerate(classFrequency, month)) {
                skippedCount++;
                continue;
            }

            // Check if a fee record for this enrollment and period already exists
            const existing = await FeeRecord.findOne({
                enrollment: enr._id,
                'period.month': month,
                'period.year': year
            });

            if (!existing) {
                const dueDate = new Date(year, month - 1, enr.class.fees.dueDay || 1);

                const record = new FeeRecord({
                    enrollment: enr._id,
                    amount: enr.class.fees.amount,
                    currency: enr.class.fees.currency,
                    dueDate,
                    period: { month, year }
                });

                await record.save();
                newFees.push(record);
            } else {
                skippedCount++;
            }
        }

        console.log(`Fee generation complete. New fees created: ${newFees.length}. Enrollments skipped: ${skippedCount}.`);
        return { success: true, count: newFees.length, data: newFees };

    } catch (error) {
        console.error('Error during scheduled fee generation:', error.message);
        return { success: false, message: 'Failed to generate fee records' };
    }
};

module.exports = { generateFeesForMonth };