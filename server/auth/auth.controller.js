const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const User = require('../user/user.model.js');

function login(req, res, next) {
  User.find({ 'email': req.body.email }, function(err, docs) {
    if (err) {
      return res.status(500).json({err});
    }

    if (docs.length === 0) {
      return res.status(500).json({message: 'Cannot find email'});
    }

    const user = docs[0];

    if (user.password !== req.body.password) {
      return res.status(401).json({message: 'Wrong password'});
    }

    return res.json({
      token: jwt.sign({email: user.email}, config.jwtSecret),
      _id: user._id
    });
  });
}

module.exports = { login };
