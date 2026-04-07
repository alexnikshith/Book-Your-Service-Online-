const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Require models to register them
require('./models/User');
const Provider = require('./models/Provider');
const Message = require('./models/Message');

async function checkNicky() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User');
  const user = await User.findOne({ email: 'nikshithgurram2006@gmail.com' });
  
  if (!user) {
    console.log('USER NICKY NOT FOUND (nikshithgurram2006@gmail.com)');
    process.exit();
  }

  console.log('NICKY USER ID:', user._id);
  const providers = await Provider.find({ user: user._id });
  console.log('PROVIDER COUNT:', providers.length);
  
  providers.forEach((p, idx) => {
    console.log(`[PROFILE ${idx + 1}] ID: ${p._id} | Years: ${p.experience} | Age: ${p.age} | City: ${p.location?.city} | CreatedAt: ${p.createdAt}`);
  });

  const providerIds = providers.map(p => p._id);
  const expertMessages = await Message.find({
    $or: [
        { sender: { $in: providerIds } }, 
        { recipient: { $in: providerIds } },
        { sender: user._id },
        { recipient: user._id }
    ]
  });
  console.log('UNIFIED MESSAGES COUNT:', expertMessages.length);

  process.exit();
}

checkNicky().catch(err => {
  console.error(err);
  process.exit(1);
});
