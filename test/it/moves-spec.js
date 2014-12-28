/**
 * Created by Omry_Nachman on 12/25/14.
 */
"use strict";

var requestify = require('requestify'),
    PORT = 7654, APP_URL = 'http://localhost:' + PORT,
    App = require('../../src/app'), app,
    response, startTime,
    server;


function killServer(done) {
  if (server) {
    server.close(function (err) {
      if (err) {
        throw new Error('Unable to kill server', err);
      } else {
        server = null;
        done();
      }
    });
  } else {
    done();
  }
}

function loadServer(done) {
  startTime = Date.now();
  app = new App(true);
  app.set('startTime', startTime);

  server = app.listen(PORT, function (err) {
    if (err) {
      throw new Error('Unable to load server', err);
    }
    done();
  });
}

describe("app integration", function () {
  /**
   *
   * @returns {Promise}
   */
  function post(uri, body) {
    return Promise.resolve(requestify.post(APP_URL + uri, body));
  }

  function get(uri) {
    return Promise.resolve(requestify.get(APP_URL + uri));
  }


  afterEach(killServer);
  beforeEach(loadServer);

  describe("moves", function () {
    describe("post", function () {
      it("should return 403 if the input is missing from the body", function (done) {
        post('/moves', {}).
            expectReject(done).
            then(function (res) {
              expect(res.getCode()).toBe(403);
              expect(res.getBody()).toEqual(jasmine.objectContaining(
                  {
                    expected: {
                      input: '{move input}'
                    },
                    actual: {}
                  }
              ));
              done();
            });
      });
      it("should respond with a new move-id", function (done) {
        post('/moves', {input: 'some input'}).
            expectResolve(done).
            then(function (res) {
              expect(res.getCode()).toBe(201);
              expect(res.getBody()['move-id']).toMatch(/^[\w\d\-\._]+$/i);
              done();
            });
      });
      it("should respond with a a link to the new move's status", function (done) {
        post('/moves', {input: 'some input'}).
            expectResolve(done).
            then(function (res) {
              expect(res.getCode()).toBe(201);
              expect(res.getBody()._links.move_status.href).toEqual(jasmine.any(String));
              done();
            });
      });
    });

    describe("before first post", function () {
      describe("GET", function () {
        it("should return an empty list", function (done) {
          get('/moves').expectResolve(done).
              then(function (res) {
                expect(res.getBody()._embedded).toEqual(jasmine.objectContaining({
                  moves: []
                }));
                done();
              });
        });
      });
    });

    describe("after multiple POSTs", function () {
      var ids;
      beforeEach(function (done) {
        Promise.all([
          post('/moves', {input: 'some input'}),
          post('/moves', {input: 'some input'}),
          post('/moves', {input: 'some input'})
        ]).
            expectResolve(done).
            then(function (res) {
              ids = _.map(res, function (val) {
                return val.getBody().move_id;
              });
              done();
            });
      });
      describe("GET", function () {
        it("should embed the created moves", function (done) {
          get('/moves').expectResolve(done).
              then(function (res) {
                var moves = res.getBody()._embedded.moves;
                expect(moves.length).toBe(3);
                expect(moves).toContain({
                  move_id: jasmine.any(String),
                  created: jasmine.any(String),
                  status: jasmine.any(String),
                  _links: {move_status: {href: jasmine.any(String)}}
                });
                done();
              });
        });
      });
    });

    describe("after post", function () {
      describe("the move_status link", function () {
        it("should return the execution status", function (done) {
          var id, time = _.now();
          post('/moves', {input: 'some input'}).expectResolve(done).
              then(function (postRes) {
                id = postRes.getBody().move_id;
                get(postRes.getBody()._links.move_status.href).expectResolve(done).
                    then(function (getRes) {
                      expect(getRes.getBody().move_id).toBe(id);
                      expect(getRes.getBody().status).toMatch(/(pending|running|error|done)/);
                      expect(Date.parse(getRes.getBody().created)).toBeLessThan(_.now());
                      expect(getRes.getBody().duration).toBeGreaterThan(0);
                      expect(getRes.getBody().duration).toBeLessThan(_.now() - time + 1);
                      done();
                    });
              });
        });

        it("should eventually return the execution results", function (done) {
          var statuses = [];
          var id;

          function logStatusUntilDone(postRes) {
            id = postRes.getBody().move_id;
            return get(postRes.getBody()._links.move_status.href).expectResolve(done).
                then(function (getRes) {
                  var status = getRes.getBody().status;
                  statuses.push(status);
                  if (status === 'done') {
                    return getRes;
                  } else {
                    return Promise.delay(postRes, 100).then(logStatusUntilDone);
                  }
                });
          }

          var start = _.now();
          post('/moves', {input: 'some input'}).expectResolve(done).
              then(logStatusUntilDone).then(function (res) {
                res = res.getBody();

                expect(statuses).toContain('running');
                expect(statuses).toContain('done');
                expect(res.move_id).toBe(id);
                expect(res.status).toBe('done');
                expect(res.result.stdout).toBe('ECHO: some input\n');
                expect(res.result.stderr).toBe('');
                expect(res.duration).toBeLessThan(_.now() - start);
                done();
              });
        });
      });
    });

  });
});