const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Superadmin only routes
router.get('/users', protect, authorize('superadmin'), getAllUsers);
router.patch('/users/:id/role', protect, authorize('superadmin'), updateUserRole);
router.patch('/users/:id/status', protect, authorize('superadmin'), toggleUserStatus);

module.exports = router;