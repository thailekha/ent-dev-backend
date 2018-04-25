const request = require('supertest-as-promised');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const defaultUser = require('./server/user/defaultUser.json');

module.exports = function(app, cb) {
  request(app)
    .get('/api/users')
    .expect(200)
    .then(res => {
      expect(res.body).to.be.an('array');
      const users = res.body.filter(user => user.email === defaultUser.email && user.password === defaultUser.password);
      if (users.length === 0) {
        console.log('SEEDING DB WITH defaultUser');
        request(app)
          .post('/api/users')
          .send(defaultUser)
          .expect(200)
          .then(res => {
            expect(res.body._id).to.not.be.undefined;
            expect(res.body.token).to.not.be.undefined;
            cb(null);
          })
          .catch(err => cb(err));
      } else {
        cb(null);
      }
    })
    .catch(err => cb(err));
};