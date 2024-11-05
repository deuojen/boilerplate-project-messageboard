const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let to_be_deleted = '';
  let to_be_deleted_reply_thread = '';
  let to_be_deleted_reply_id = '';
  // #1
  test('Creating a new thread: POST request to /api/threads/{board}', function (done) {
    chai
      .request(server)
      .post('/api/threads/ftest')
      .send({
        text: 'delete_me',
        delete_password: 'delete_me',
      })
      .end(function (err, res) {
        to_be_deleted = res.body._id;
        assert.equal(res.status, 200);
        assert.property(res.body, 'text', 'delete_me');
        done();
      });
  });
  // #2
  test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function (done) {
    chai
      .request(server)
      .get('/api/threads/ftest')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body[0], 'text', 'delete_me');
        done();
      });
  });
  // #3
  test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/threads/ftest')
      .send({
        thread_id: to_be_deleted,
        delete_password: 'delete_me_wrong',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });
  // #4
  test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/threads/ftest')
      .send({
        thread_id: to_be_deleted,
        delete_password: 'delete_me',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });
  // #5
  test('Reporting a thread: PUT request to /api/threads/{board}', function (done) {
    let to_be_put = '';
    chai
      .request(server)
      .post('/api/threads/ftest')
      .send({
        text: 'ftest_put',
        delete_password: 'ftest_put',
      })
      .end(function (err, res) {
        to_be_put = res.body._id;
        chai
          .request(server)
          .put('/api/threads/ftest')
          .send({
            thread_id: to_be_put,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          });
      });
  });
  // #6
  test('Creating a new reply: POST request to /api/replies/{board}', function (done) {
    chai
      .request(server)
      .post('/api/threads/ftest')
      .send({
        text: 'ftest_put',
        delete_password: 'ftest_put',
      })
      .end(function (err, res) {
        to_be_deleted_reply_thread = res.body._id;
        chai
          .request(server)
          .post('/api/replies/ftest')
          .send({
            thread_id: to_be_deleted_reply_thread,
            text: 'delete_me',
            delete_password: 'delete_me',
          })
          .end(function (err, res) {
            to_be_deleted_reply_id = res.body._id;
            assert.equal(res.status, 200);
            assert.property(res.body, 'text', 'delete_me');
            done();
          });
      });
  });
  // #7
  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function (done) {
    chai
      .request(server)
      .get('/api/replies/ftest?thread_id=' + to_be_deleted_reply_thread)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body.replies[0], 'text', 'delete_me');
        done();
      });
  });
  // #8
  test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/replies/ftest?thread_id=' + to_be_deleted_reply_thread)
      .send({
        thread_id: to_be_deleted_reply_thread,
        reply_id: to_be_deleted_reply_id,
        delete_password: 'delete_me_wrong',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });
  // #9
  test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/replies/ftest?thread_id=' + to_be_deleted_reply_thread)
      .send({
        thread_id: to_be_deleted_reply_thread,
        reply_id: to_be_deleted_reply_id,
        delete_password: 'delete_me',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });
  // #10
  test('Reporting a reply: PUT request to /api/replies/{board}', function (done) {
    chai
      .request(server)
      .put('/api/replies/ftest?thread_id=' + to_be_deleted_reply_thread)
      .send({
        thread_id: to_be_deleted_reply_thread,
        reply_id: to_be_deleted_reply_id,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });
});
