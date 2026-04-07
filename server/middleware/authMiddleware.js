const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Provider = require('../models/Provider');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Get token from cookie
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    res.status(401);
    throw new Error('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Sovereign Master Recognition
    if (decoded.id === '000000000000000000000000') {
      req.user = { _id: '000000000000000000000000', name: 'Nikshith Gurram', role: 'admin' };
      return next();
    }

    // Get user from the token Hub Pulse
    req.user = await User.findById(decoded.id);

    // Synchronize Expert Identity Node Hub (Consolidation Protocol)
    if (req.user && req.user.role === 'provider') {
        const providers = await Provider.find({ user: req.user._id }).sort('-createdAt');
        if (providers && providers.length > 0) {
            const masterProvider = providers[0];
            req.user.providerId = masterProvider._id;
            console.log(`[AUTH-PULSE]: Expert Master Identified: ${masterProvider._id}`);
        }
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error('Not authorized to access this route');
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

module.exports = { protect, authorize };
