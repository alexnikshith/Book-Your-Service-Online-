const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllProviders,
  getAllUsers,
  updateProviderStatus,
  updateUserRole,
  getLogs,
  getAIReports,
  updateAIReport
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes to admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/providers', getAllProviders);
router.get('/users', getAllUsers);
router.get('/logs', getLogs);
router.get('/reports', getAIReports);
router.put('/reports/:id', updateAIReport);
router.put('/providers/:id/status', updateProviderStatus);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
