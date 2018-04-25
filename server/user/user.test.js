const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');
const defaultUser = require('./defaultUser.json');

chai.config.includeStack = true;

/**
 * root level hooks
 */
after(done => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## User APIs', () => {
  const userToCreate = {
    email: defaultUser.email,
    password: defaultUser.password
  };
  let userId, token;

  var updatedUser = {
    "email": "email should not change",
    "password": "password should not change",
    "portfolio": {
      "holdings":[
        {
          "shares":[
            {
              "dateIn":"3000-01-01T00:00:00.000Z",
              "dateOut":null,
              "quantity":30000,
              "purchasePrice":200,
              "sellingPrice":null,
              "sellingCosts":null
            },
            {
              "dateIn":"2015-01-01T00:00:00.000Z",
              "dateOut":null,
              "quantity":1000,
              "purchasePrice":25,
              "sellingPrice":null,
              "sellingCosts":null
            },
            {
              "dateIn":"2016-01-01T00:00:00.000Z",
              "dateOut":null,
              "quantity":2000,
              "purchasePrice":30,
              "sellingPrice":null,
              "sellingCosts":null
            }
          ],
          "symbol":"fooCRH_I",
          "displayName":"fooCRH",
          "exchange":"fooise"
        }
      ],
      "stocksSold":[
        {
          "shares":[],
          "symbol":"foosymbol",
          "displayName":"foodisplayName",
          "exchange":"fooexchange"
        }
      ]
    }
  };

  describe('# POST /api/users', () => {
    it('should create a new user', done => {
      request(app)
        .post('/api/users')
        .send(userToCreate)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.token).to.be.not.undefined;
          expect(res.body._id).to.be.not.undefined;

          token = res.body.token;
          userId = res.body._id;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/:userId', () => {
    it('should get user details', done => {
      request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.email).to.equal('test@test.test');
          expect(res.body.password).to.equal('asdasd');
          expect(res.body.portfolio.holdings.length).to.equal(5);
          expect(res.body.portfolio.holdings[2].shares.length).to.equal(3);
          expect(res.body.portfolio.holdings[2].shares[0].dateIn).to.equal("2014-01-01T00:00:00.000Z");
          expect(res.body.portfolio.holdings[2].shares[0].dateOut).to.equal(null);
          expect(res.body.portfolio.holdings[2].shares[0].quantity).to.equal(3000);
          expect(res.body.portfolio.holdings[2].shares[0].purchasePrice).to.equal(20);
          expect(res.body.portfolio.holdings[2].shares[0].sellingPrice).to.equal(null);
          expect(res.body.portfolio.holdings[2].shares[0].sellingCosts).to.equal(null);
          expect(res.body.portfolio.holdings[2].symbol).to.equal("CRH_I");
          expect(res.body.portfolio.holdings[2].displayName).to.equal("CRH");
          expect(res.body.portfolio.holdings[2].exchange).to.equal("ise");

          expect(res.body.portfolio.stocksSold.length).to.equal(1);
          expect(res.body.portfolio.stocksSold[0].shares.length).to.equal(1);
          expect(res.body.portfolio.stocksSold[0].shares[0].dateIn).to.equal("2011-01-01T00:00:00.000Z");
          expect(res.body.portfolio.stocksSold[0].shares[0].dateOut).to.equal("2017-01-01T00:00:00.000Z");
          expect(res.body.portfolio.stocksSold[0].shares[0].quantity).to.equal(3000);
          expect(res.body.portfolio.stocksSold[0].shares[0].purchasePrice).to.equal(20);
          expect(res.body.portfolio.stocksSold[0].shares[0].sellingPrice).to.equal(30);
          expect(res.body.portfolio.stocksSold[0].shares[0].sellingCosts).to.equal(576.25);
          expect(res.body.portfolio.stocksSold[0].symbol).to.equal("CRH_I");
          expect(res.body.portfolio.stocksSold[0].displayName).to.equal("CRH");
          expect(res.body.portfolio.stocksSold[0].exchange).to.equal("ise");

          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when user does not exists', done => {
      request(app)
        .get('/api/users/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/users/:userId', () => {
    it('should update user details', done => {
      request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUser)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.email).to.equal('test@test.test');
          expect(res.body.password).to.equal('asdasd');
          expect(res.body.portfolio.holdings.length).to.equal(1);
          expect(res.body.portfolio.holdings[0].shares.length).to.equal(3);
          expect(res.body.portfolio.holdings[0].shares[0].dateIn).to.equal("3000-01-01T00:00:00.000Z");
          expect(res.body.portfolio.holdings[0].shares[0].dateOut).to.equal(null);
          expect(res.body.portfolio.holdings[0].shares[0].quantity).to.equal(30000);
          expect(res.body.portfolio.holdings[0].shares[0].purchasePrice).to.equal(200);
          expect(res.body.portfolio.holdings[0].shares[0].sellingPrice).to.equal(null);
          expect(res.body.portfolio.holdings[0].shares[0].sellingCosts).to.equal(null);
          expect(res.body.portfolio.holdings[0].symbol).to.equal("fooCRH_I");
          expect(res.body.portfolio.holdings[0].displayName).to.equal("fooCRH");
          expect(res.body.portfolio.holdings[0].exchange).to.equal("fooise");

          expect(res.body.portfolio.stocksSold.length).to.equal(1);
          expect(res.body.portfolio.stocksSold[0].shares.length).to.equal(0);
          expect(res.body.portfolio.stocksSold[0].symbol).to.equal("foosymbol");
          expect(res.body.portfolio.stocksSold[0].displayName).to.equal("foodisplayName");
          expect(res.body.portfolio.stocksSold[0].exchange).to.equal("fooexchange");
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/users/reset/:userId', () => {
    it('should update user details', done => {
      request(app)
        .put(`/api/users/reset/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUser)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.email).to.equal('test@test.test');
          expect(res.body.password).to.equal('asdasd');
          expect(res.body.portfolio.holdings.length).to.equal(5);
          expect(res.body.portfolio.holdings[2].shares.length).to.equal(3);
          expect(res.body.portfolio.holdings[2].shares[0].dateIn).to.equal("2014-01-01T00:00:00.000Z");
          expect(res.body.portfolio.holdings[2].shares[0].dateOut).to.equal(null);
          expect(res.body.portfolio.holdings[2].shares[0].quantity).to.equal(3000);
          expect(res.body.portfolio.holdings[2].shares[0].purchasePrice).to.equal(20);
          expect(res.body.portfolio.holdings[2].shares[0].sellingPrice).to.equal(null);
          expect(res.body.portfolio.holdings[2].shares[0].sellingCosts).to.equal(null);
          expect(res.body.portfolio.holdings[2].symbol).to.equal("CRH_I");
          expect(res.body.portfolio.holdings[2].displayName).to.equal("CRH");
          expect(res.body.portfolio.holdings[2].exchange).to.equal("ise");

          expect(res.body.portfolio.stocksSold.length).to.equal(1);
          expect(res.body.portfolio.stocksSold[0].shares.length).to.equal(1);
          expect(res.body.portfolio.stocksSold[0].shares[0].dateIn).to.equal("2011-01-01T00:00:00.000Z");
          expect(res.body.portfolio.stocksSold[0].shares[0].dateOut).to.equal("2017-01-01T00:00:00.000Z");
          expect(res.body.portfolio.stocksSold[0].shares[0].quantity).to.equal(3000);
          expect(res.body.portfolio.stocksSold[0].shares[0].purchasePrice).to.equal(20);
          expect(res.body.portfolio.stocksSold[0].shares[0].sellingPrice).to.equal(30);
          expect(res.body.portfolio.stocksSold[0].shares[0].sellingCosts).to.equal(576.25);
          expect(res.body.portfolio.stocksSold[0].symbol).to.equal("CRH_I");
          expect(res.body.portfolio.stocksSold[0].displayName).to.equal("CRH");
          expect(res.body.portfolio.stocksSold[0].exchange).to.equal("ise");
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/', () => {
    it('should get all users', done => {
      request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all users (with limit and skip)', done => {
      request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/users/', () => {
    it('should delete user', done => {
      request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.email).to.equal(defaultUser.email);
          done();
        })
        .catch(done);
    });
  });
});
