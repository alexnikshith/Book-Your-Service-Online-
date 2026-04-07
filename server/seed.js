const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Provider = require('./models/Provider');
const Booking = require('./models/Booking');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('STARTING SEED...');

  // 1. Keep the admin, wipe the rest for clean test
  await User.deleteMany({ email: { $ne: 'nikshithgurram2006@gmail.com' } });
  await Provider.deleteMany({});
  await Booking.deleteMany({});

  // 2. Create Clients
  const u1 = await User.create({ name: 'Rahul Sharma', email: 'rahul@example.com', password: 'password123', role: 'user' });
  const u2 = await User.create({ name: 'Priya Singh', email: 'priya@example.com', password: 'password123', role: 'user' });

  // 3. Create Service Providers
  const p1u = await User.create({ name: 'Amit Plumber', email: 'amit@service.com', password: 'password123', role: 'provider' });
  const p1 = await Provider.create({ 
    user: p1u._id, 
    categories: ['Plumber', 'Other'], 
    isApproved: true, 
    location: { type: 'Point', coordinates: [78, 17], city: 'Hyderabad' }, 
    experience: 5,
    averageRating: 5,
    description: 'Expert in fixing all kinds of pipe leaks'
  });

  const p2u = await User.create({ name: 'Suresh Mechanic', email: 'suresh@service.com', password: 'password123', role: 'provider' });
  const p2 = await Provider.create({ 
    user: p2u._id, 
    categories: ['AC Mechanic', 'Electrician'], 
    isApproved: false, 
    location: { type: 'Point', coordinates: [78.1, 17.1], city: 'Hyderabad' }, 
    experience: 8,
    averageRating: 4.5,
    description: 'Expert in AC repair and electrical wiring'
  });

  // 4. Create Bookings
  await Booking.create({ 
    user: u1._id, 
    provider: p1._id, 
    serviceName: 'Pipe Leakage Fix', 
    totalPrice: 499, 
    status: 'completed',
    date: new Date(),
    time: '10:00 AM',
    address: 'Flat 402, Green Apartments, Hyderabad'
  });
  
  await Booking.create({ 
    user: u2._id, 
    provider: p2._id, 
    serviceName: 'AC Maintenance', 
    totalPrice: 2500, 
    status: 'pending',
    date: new Date(),
    time: '02:30 PM',
    address: 'Villa 12, Jubilee Hills, Hyderabad'
  });

  console.log('PLATFORM SEEDED SUCCESSFULLY');
  process.exit();
};

seed();
