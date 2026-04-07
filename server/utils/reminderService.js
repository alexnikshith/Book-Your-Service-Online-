const cron = require('node-cron');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

const initReminders = (io) => {
  // Run every 15 minutes to check for upcoming booking pulses
  cron.schedule('*/15 * * * *', async () => {
    const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const threeHoursFifteenMinutesFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000 + 15 * 60 * 1000);

    try {
      const upcomingBookings = await Booking.find({
        status: 'accepted',
        date: { $gte: threeHoursFromNow, $lt: threeHoursFifteenMinutesFromNow },
        reminderSent: { $ne: true }
      }).populate('user provider');

      for (const booking of upcomingBookings) {
        const message = `Pulse Check: Your service "${booking.serviceName}" is scheduled in 3 hours at ${booking.time}.`;

        // Send Popup to Customer
        io.to(booking.user?._id.toString()).emit('booking_reminder', {
          title: 'Upcoming Service Alert',
          message,
          bookingId: booking._id
        });

        // Send Popup to Provider
        if (booking.provider?.user) {
          io.to(booking.provider.user.toString()).emit('booking_reminder', {
            title: 'Job Start Warning',
            message: `Expert Pulse: Prepare for "${booking.serviceName}" at ${booking.address} in 3 hours.`,
            bookingId: booking._id
          });
        }

        // Create persistent notifications
        await Notification.create([
            { user: booking.user?._id, type: 'info', title: 'Service Reminder', message },
            { user: booking.provider?.user, type: 'info', title: 'Job Reminder', message: `Expert Pulse: Prepare for "${booking.serviceName}" in 3 hours.` }
        ]);

        // Mark as sent
        booking.reminderSent = true;
        await booking.save();
      }
    } catch (err) {
      console.error('[REMINDER-PULSE ERROR]: Cron check failed:', err.message);
    }
  });

  console.log('[SYSTEM]: Scheduler Pulse Initialized - Checking upcoming service windows.');
};

module.exports = { initReminders };
