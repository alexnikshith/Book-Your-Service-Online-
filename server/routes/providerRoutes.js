const express = require('express');
const router = express.Router();
const { 
  registerProvider,
  updateProvider, 
  getProviders, 
  getProviderById, 
  getProviderMe,
  toggleFlagProvider
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getProviders);
router.get('/me', protect, getProviderMe);
router.get('/:id', getProviderById);

router.post('/register', protect, authorize('provider'), registerProvider);
router.put('/profile', protect, authorize('provider'), updateProvider);
router.post('/:id/flag', protect, toggleFlagProvider);

module.exports = router;
