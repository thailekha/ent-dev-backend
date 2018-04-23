const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');
const config = require('../../config/config');
const defaultUser = require('../user/defaultUser.json');

chai.config.includeStack = true;

describe('## Auth APIs', () => {
  const validUserCredentials = defaultUser;

  const invalidEmail = {
    email: 'react',
    password: 'IDontKnow'
  };

  const invalidPassword = {
    email: defaultUser.email,
    password: 'huhuhuhhuh'
  };

  describe('# POST /api/auth/login', () => {
    it('invalid email', done => {
      request(app)
        .post('/api/auth/login')
        .send(invalidEmail)
        .expect(500)
        .then(res => {
          expect(res.body.message).to.equal('Cannot find email');
          done();
        })
        .catch(done);
    });

    it('invalid password', done => {
      request(app)
        .post('/api/auth/login')
        .send(invalidPassword)
        .expect(401)
        .then(res => {
          expect(res.body.message).to.equal('Wrong password');
          done();
        })
        .catch(done);
    });

    it('should get valid JWT token', done => {
      request(app)
        .post('/api/auth/login')
        .send(validUserCredentials)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.have.property('token');
          jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
            expect(err).to.not.be.ok; // eslint-disable-line no-unused-expressions
            expect(decoded.username).to.equal(validUserCredentials.username);
            done();
          });
        })
        .catch(done);
    });
  });
});
