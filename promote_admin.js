const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./server/models/User');

const promote = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to Database Hub...');

    const email = 'nikshithgurram2006@gmail.com';
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`SUCCESS: User ${email} has been promoted to ADMIN.`);
    } else {
      console.log(`ERROR: User ${email} not found in the database.`);
    }

    process.exit();
  } catch (error) {
    console.error('PROMOTION FAILED:', error);
    process.exit(1);
  }
};

promote();
