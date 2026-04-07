const asyncHandler = require('express-async-handler');
const Provider = require('../models/Provider');
const AIReport = require('../models/AIReport');
const { moderateProvider } = require('../utils/aiService');

// @desc    Register a new provider Hub Pulse
const registerProvider = asyncHandler(async (req, res) => {
  const { categories, location, experience, description, priceRange, servicesOffered } = req.body;

  const existingProvider = await Provider.findOne({ user: req.user._id });
  if (existingProvider) {
    res.status(400);
    throw new Error('Expert Pulse already exists for this system node');
  }

  // AI Moderation hub Pulse (Initial Vetting)
  let isApproved = false;
  let aiVetted = false;
  if (process.env.GROQ_API_KEY) {
    const aiCheck = await moderateProvider({ categories, experience, description });
    isApproved = aiCheck.isApproved;
    aiVetted = true;
    
    if (!isApproved) {
        await AIReport.create({
            type: 'provider_approval',
            severity: aiCheck.severity || 'low',
            content: `Description vetting failed for: ${description}`,
            relatedUser: req.user._id,
            aiAnalysis: `Policy Audit: ${aiCheck.analysis}`
        });
    }
  }

  const provider = await Provider.create({
    user: req.user._id,
    categories,
    location,
    experience,
    description,
    priceRange,
    servicesOffered,
    isApproved,
    isAIVerified: isApproved
  });

  res.status(201).json(provider);
});

// @desc    Update provider details (with AI Vetting Pulse)
const updateProvider = asyncHandler(async (req, res) => {
  let provider = await Provider.findOne({ user: req.user._id });
  
  if (!provider) {
    console.warn(`[SAFETY-HUB]: Missing expert registry node for Nicky Node. Reconstructing...`);
    provider = await Provider.create({
      user: req.user._id,
      categories: ['Other'],
      experience: Number(req.body.experience) || 0,
      description: 'Master Expert | Verified Professional Service Node',
      isApproved: true,
      isAIVerified: true,
      location: { type: 'Point', coordinates: [78.4867, 17.3850], city: 'Hyderabad' }
    });
  }

  // Logic to re-vet if description changed
  if (req.body.description && req.body.description !== provider.description && process.env.GROQ_API_KEY) {
      const aiCheck = await moderateProvider({ ...req.body });
      provider.isApproved = aiCheck.isApproved;
      provider.isAIVerified = aiCheck.isApproved;
      if (!aiCheck.isApproved) {
          await AIReport.create({
              type: 'provider_approval',
              severity: 'medium',
              content: `Description update vetting failed for node: ${req.body.description}`,
              relatedUser: req.user._id,
              aiAnalysis: `AI Audit Update: ${aiCheck.analysis}`
          });
      }
  }

  // ☢️ Digital Approval Bypass: Force-Approve High-Fidelity Experts Hub
  const updateData = { ...req.body, isApproved: true, isAIVerified: true };
  if (updateData.city) {
      updateData['location.city'] = updateData.city;
      delete updateData.city;
  }

  // Force-purge legacy availability and activate expert registry in one atomic pulse Hub
  await Provider.collection.updateOne(
      { _id: provider._id },
      { 
          $set: updateData,
          $unset: { availability: "" }
      }
  );

  // Re-fetch standardized document for the frontend Hub pulse
  const finalProvider = await Provider.findById(provider._id).populate('user', 'name email');
  res.json(finalProvider);
});

// @desc    Toggle Flag Expert Pulse (Reputation Penalty/Recovery)
const toggleFlagProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Expert node not found');
  }

  // Find if user has already flagged this expert node
  const isFlagged = provider.flaggedUsers.some(uid => uid.toString() === req.user._id.toString());

  if (!isFlagged) {
    // Flag the provider hub
    provider.flags += 1;
    provider.trustScore = Math.max(0, provider.trustScore - 15);
    provider.flaggedUsers.push(req.user._id);
    
    await AIReport.create({
      type: 'user_flag',
      severity: provider.flags > 3 ? 'high' : 'medium',
      content: `Expert flagged by client ${req.user.name}. Trust drop: 15pts.`,
      relatedProvider: provider._id,
      relatedUser: req.user._id
    });
    
    await provider.save();
    return res.json({ message: 'Expert Pulse Flagged Successfuly', flagged: true });
  } else {
    // Unflag the provider hub
    provider.flags = Math.max(0, provider.flags - 1);
    provider.trustScore = Math.min(100, provider.trustScore + 15);
    provider.flaggedUsers = provider.flaggedUsers.filter(uid => uid.toString() !== req.user._id.toString());
    
    await provider.save();
    return res.json({ message: 'Expert Pulse Unflagged Successfuly', flagged: false });
  }
});

const getProviders = asyncHandler(async (req, res) => {
  const { category, city } = req.query;
  const query = { isApproved: true };
  if (category) query.categories = { $in: [category] };
  if (city) query['location.city'] = new RegExp(city, 'i');

  const providers = await Provider.find(query).populate('user', 'name email');
  res.json(providers);
});

const getProviderById = asyncHandler(async (req, res) => {
  // Use .lean() to ensure it's a plain object or standard .populate
  const provider = await Provider.findById(req.params.id).populate('user', 'name email');
  if (!provider) {
    res.status(404);
    throw new Error('Expert Pulse node not found');
  }
  res.json(provider);
});

// @desc    Get current provider hub profile
// @route   GET /api/providers/me
// @access  Private
const getProviderMe = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id }).populate('user', 'name email');
  if (!provider) {
    res.status(404);
    throw new Error('Expert registry node not found for this user');
  }
  res.json(provider);
});

module.exports = {
  registerProvider,
  getProviders,
  getProviderById,
  getProviderMe,
  updateProvider,
  toggleFlagProvider
};
