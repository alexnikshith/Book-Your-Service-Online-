const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

require('./models/User');
const Provider = require('./models/Provider');

async function restoreNicky() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User');
  const user = await User.findOne({ email: 'nikshithgurram2006@gmail.com' });
  
  if (!user) {
    console.log('UNABLE TO RESTORE: NICKY USER NODE NOT FOUND');
    process.exit();
  }

  // Emergency Expert Pulse Handshake
  const newProvider = await Provider.create({
    user: user._id,
    categories: ['Cleaning', 'AC Mechanic', 'Other'],
    experience: 3,
    age: 24, // High-Fidelity Placeholder
    description: 'Master Expert | Verified Professional Service Node',
    isApproved: true,
    isAIVerified: true,
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3850],
      city: 'Hyderabad'
    },
    upiId: '7569778915@axl'
  });

  console.log('MASTER REGISTRY RESTORED SUCCESS HUB');
  console.log('NEW PROVIDER ID:', newProvider._id);
  process.exit();
}

restoreNicky().catch(err => {
  console.error(err);
  process.exit(1);
});
