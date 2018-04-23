const express = require('express');
const userRoutes = require('./server/user/user.route');
const authRoutes = require('./server/auth/auth.route');
const jwtAuthenticate = require('./server/middleware/index');
const router = express.Router(); // eslint-disable-line new-cap
router.get('/health-check', (req, res) =>
  res.send('OK')
);
router.use('/auth', authRoutes);
router.use(jwtAuthenticate({ secret: 'secret' }));
router.use('/users', userRoutes);

module.exports = router;
