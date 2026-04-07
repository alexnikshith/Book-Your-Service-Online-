const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Provider = require('../models/Provider');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  let { name, email, password, role, categories, experience, description, upiId } = req.body;
  email = email?.trim().toLowerCase();
  role = role?.trim();
  
  console.log(`[AUTH] Register Attempt: email="${email}", role="${role}", upi="${upiId}"`);

  // Check if role specifically exists with this email
  const userExists = await User.findOne({ email, role });
  if (userExists) {
    console.log('Registration blocked: User already exists with this role.');
    res.status(400);
    throw new Error('User already exists');
  }

  // [SOVEREIGN GUARD]: Strictly forbid admin registration via public Hub nodes
  let finalRole = 'user';
  if (role === 'provider') {
      finalRole = 'provider';
  } else if (role === 'admin') {
      // Logic: Deny direct admin creation. Admin nodes must be promoted via the registry dashboard.
      res.status(403);
      throw new Error('Sovereign Security: Administrative nodes cannot be created via public registration protocols.');
  }

  try {
    // Create user with guarded finalRole
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole
    });

    if (user) {
      if (role === 'provider') {
        try {
          await Provider.create({
            user: user._id,
            categories: categories || ['Other'], 
            experience: Number(experience) || 0,
            isApproved: true,
            location: {
              type: 'Point',
              coordinates: [78.4867, 17.3850],
              city: 'Hyderabad'
            },
            description: description || 'Professional Service Provider',
            upiId: upiId || ''
          });
        } catch (providerErr) {
          console.error('[PROV-ERROR]: Provider Record Creation Failed:', providerErr.message);
        }
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (createErr) {
    console.error('[AUTH-ERROR]: Registration/Creation Failed:', createErr.message);
    res.status(400);
    throw new Error(`Registration Failed: ${createErr.message}`);
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  let { email, password, role } = req.body;
  
  // Normalize
  email = email?.trim().toLowerCase();
  role = role?.trim();

  process.stdout.write(`\x1b[33m [AUTH-TRY]: email="${email}", role="${role}" \x1b[0m \n`);

  // MASTER GATEWAY BYPASS
  if (email === 'nikshithgurram2006@gmail.com' && password === 'master123' && role === 'admin') {
    const masterId = '000000000000000000000000';
    return res.json({
      _id: masterId,
      name: 'Nikshith Gurram',
      email: email,
      role: 'admin',
      token: generateToken(masterId)
    });
  }

  // 1. Check if ANY user exists with this email
  const existingEmailUser = await User.findOne({ email });
  if (!existingEmailUser) {
    process.stdout.write(`\x1b[31m [AUTH-FAILED]: No account found for email="${email}" \x1b[0m \n`);
    res.status(401);
    throw new Error('No account found with this email');
  }

  // 2. Check for specific user by email and role
  const user = await User.findOne({ email, role }).select('+password');

  if (!user) {
    process.stdout.write(`\x1b[31m [AUTH-ROLE-MISMATCH]: Account exists but role "${role}" is incorrect \x1b[0m \n`);
    res.status(401);
    throw new Error(`This account is registered as a ${existingEmailUser.role}, not a ${role}. Please switch roles.`);
  }

  if (await user.matchPassword(password)) {
    process.stdout.write(`\x1b[32m [AUTH-SUCCESS]: User "${user.name}" logged in. \x1b[0m \n`);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    process.stdout.write(`\x1b[31m [AUTH-FAILED]: Invalid password for email="${email}" \x1b[0m \n`);
    res.status(401);
    throw new Error('Invalid password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`[RECOVERY-START]: Identifying user for email="${email}"`);
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.warn(`[RECOVERY-FAIL]: No user found for ${email}`);
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    console.log(`[RECOVERY-PULSE]: Generating cryptographic token for ${user.name}`);
    const resetToken = user.getResetPasswordToken();
    
    console.log(`[RECOVERY-PULSE]: Syncing token to database...`);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please go to: \n\n ${resetUrl}`;

    console.log(`[RECOVERY-PULSE]: Dispatching real-world email via SMTP...`);
    try {
      await sendEmail({
        email: user.email,
        subject: 'ServiceFinder Password reset token',
        message
      });
      console.log(`[RECOVERY-SUCCESS]: Email dispatched to ${user.email}`);
      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (emailErr) {
      console.error('[EMAIL-ERROR]: Dispatch Failed:', emailErr.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent. Check your SMTP settings.' });
    }
  } catch (err) {
    console.error('[AUTH-ERROR]: CRITICAL FAILURE IN RECOVERY FLOW:');
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error', debug: err.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error('[RESET-ERROR]:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
};
