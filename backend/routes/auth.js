const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authRequired } = require('../middleware/authMiddleware');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.put('/profile', authRequired, controller.updateProfile);

module.exports = router;
