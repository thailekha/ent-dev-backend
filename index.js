const mongoose = require('mongoose');
const util = require('util');
const request = require('supertest-as-promised');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');
const debug = require('debug')('express-mongoose-es6-rest-api:index');
const defaultUser = require('./server/user/defaultUser.json');
mongoose.Promise = require('bluebird');

// connect to mongo db
const mongoUri = config.mongo.host;
mongoose.connect(mongoUri, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console

    request(app)
      .get('/api/users')
      .expect(200)
      .then(res => {
        expect(res.body).to.be.an('array');

        const users = res.body.filter(user => user.email === defaultUser.email && user.password === defaultUser.password);

        if (users.length === 0) {
          request(app)
            .post('/api/users')
            .send(defaultUser)
            .expect(200)
            .then(res => {
              expect(res.body.username).to.equal(defaultUser.username);
              expect(res.body.mobileNumber).to.equal(defaultUser.mobileNumber);
              expect(res.body.email).to.equal('test@test.test');
              expect(res.body.password).to.equal('$2a$10$yD0cSQAJCCXdrZdzIaKOaOh2Xs113BUDHqQ8VHQ0jhGipgFgT4YOW');
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

              console.log(res.body._id);
            })
            .catch(err => console.log('ERROR',err));
        } else {
          console.log(users[0]._id);
        }
      })
      .catch(err => console.log('ERROR',err));


  });
}

module.exports = app;
