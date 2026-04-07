const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const AIReport = require('../models/AIReport');
const Message = require('../models/Message');

// @desc    Get system stats hub
const getStats = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments({ role: 'user' });
  const providersCount = await Provider.countDocuments({ isApproved: true });
  const bookingsCount = await Booking.countDocuments();
  
  const allBookings = await Booking.find();
  const revenue = allBookings.reduce((acc, curr) => acc + curr.totalPrice, 0);

  res.json({ users: usersCount, providers: providersCount, bookings: bookingsCount, revenue });
});

// @desc    Get all providers for moderation hub
const getAllProviders = asyncHandler(async (req, res) => {
  const providers = await Provider.find().populate('user', 'name email');
  res.json(providers);
});

// @desc    Get all users (Admin view)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
});

// @desc    Update provider status hub
const updateProviderStatus = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Provider pulse node not found');
  }
  provider.isApproved = req.body.isApproved;
  await provider.save();
  res.json(provider);
});

// @desc    Update user role pulse
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User node not identified');
    }
    user.role = req.body.role;
    await user.save();
    res.json(user);
});

// @desc    Get system logs registry
const getLogs = asyncHandler(async (req, res) => {
  const logs = [
    { type: 'Registration', desc: 'New Expert Pulse identified from Central Hub', time: new Date() },
    { type: 'Booking', desc: 'Secure Service Request Synchronized', time: new Date() }
  ];
  res.json(logs);
});

// @desc    Get AI Moderation reports hub
const getAIReports = asyncHandler(async (req, res) => {
    const reports = await AIReport.find()
        .populate('relatedUser', 'name email')
        .populate('relatedProvider')
        .populate('relatedMessage')
        .sort('-createdAt');
    res.json(reports);
});

// @desc    Handle AI Moderation Action (Integrated Auto-Suspension Policy Hub)
const updateAIReport = asyncHandler(async (req, res) => {
    const { actionTaken, adminNotes, addAsPortfolio } = req.body;
    const report = await AIReport.findById(req.params.id).populate('relatedProvider');
    
    if (!report) {
        res.status(404);
        throw new Error('Audit Registry Node not found');
    }

    // 1. Forceful Data Scrubbing Pulse
    if ((actionTaken === 'resolved' || actionTaken === 'scrubbed') && report.relatedMessage) {
        await Message.findByIdAndDelete(report.relatedMessage);
        console.log(`[VIGILANTE PULSE]: Offensive message scrubbed: ${report.relatedMessage}`);
        
        // 2. Auto-Suspension Policy Pulse: Penalty on Critical Violation
        if (report.relatedProvider) {
            const provider = await Provider.findById(report.relatedProvider._id);
            if (provider) {
                provider.trustScore = Math.max(0, provider.trustScore - 25);
                if (provider.trustScore < 40) {
                    provider.isApproved = false; // Auto-Suspension node
                    provider.isAIVerified = false;
                    console.log(`[VIGILANTE PULSE]: AUTO-SUSPENSION triggered for expert: ${provider._id}`);
                }
                await provider.save();
            }
        }
    }

    // 3. Dynamic Portfolio Expansion Pulse: Convert evidence to portfolio
    if (addAsPortfolio && report.relatedMessage?.imageUrl && report.relatedProvider) {
        const provider = await Provider.findById(report.relatedProvider._id);
        if (provider) {
            provider.portfolioImages.push({
                url: report.relatedMessage.imageUrl,
                caption: adminNotes || 'Verified Evidence of Expert Capability Pulse',
                verifiedSource: true
            });
            await provider.save();
            console.log(`[VIGILANTE PULSE]: Gallery Evidence Hub synchronized for expert: ${provider._id}`);
        }
    }

    report.actionTaken = actionTaken;
    report.adminNotes = adminNotes;
    await report.save();

    res.json(report);
});

module.exports = {
  getStats,
  getAllProviders,
  getAllUsers,
  updateProviderStatus,
  updateUserRole,
  getLogs,
  getAIReports,
  updateAIReport
};
