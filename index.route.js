const express = require('express');
const userRoutes = require('./server/user/user.route');
const authRoutes = require('./server/auth/auth.route');
const router = express.Router(); // eslint-disable-line new-cap
router.get('/health-check', (req, res) =>
  res.send('OK')
);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

module.exports = router;
