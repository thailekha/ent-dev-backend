// const _ = require('lodash');
const jwt = require('jsonwebtoken');

/**
 * Middleware for authenticating requests based on JSON Web Tokens.
 *
 * @param {object} options - Options for the middleware.
 * @param {string} options.secret - Secret key to use for verifying JSON web token.
 * @param {string} [options.payloadPath=user] - Decoded JSON web token payload will be attached to request[payloadPath].
 *                                              Uses 'lodash.set' syntax. Defaults to 'user'.
 */
module.exports = function(options={}) {
  if (!options.secret) {
    throw new Error('Authentication module options.secret parameter is required');
  }

  function middleware(req, res, next) {
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).json({message: 'Authorisation header has not been set'});
    }

    const [schema='', token=''] = req.headers.authorization.split(' ');
    if (schema !== 'Bearer' || !token) {
      return res.status(401).json({message: 'Authorisation header should use "Bearer <token>" schema'});
    }

    jwt.verify(token, options.secret, (err, payload) => {
      if (err) {
        return res.status(401).json({message: err.name});
      }

      // _.set(req, options.payloadPath || 'user', payload);

      next(null);
    });
  }

  return middleware;
};