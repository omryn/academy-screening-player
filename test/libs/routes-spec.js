/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";
var Routes = require('../../src/libs/routes'),
    express = require('express'),
    request = require('requestify'),
    PORT = 7654,
    URL = 'http://localhost:' + PORT,
    routes, spies = {},
    reqHistory,
    app, server;


function createSpyMiddleware(name) {
  var spy = jasmine.createSpy(name);
  var middleware = function (req, res, next) {
    reqHistory.push({url: req.originalUrl, spy: name});
    spy();
    res.json({
      from: name
    });
  };
  middleware.spy = spy;
  return middleware;
}

function spy(name, verb) {
  name = name + (verb || '').toUpperCase();

  if (spies[name]) {
    throw new Error('There is already a spy named ' + name);
  } else {
    spies[name] = createSpyMiddleware(name);
    return spies[name];
  }
}

describe("Routes", function () {
  beforeEach(function () {
    spies = {};
    reqHistory = [];
  });

  describe("#wire", function () {
    beforeEach(function (done) {
      routes = new Routes({
        get: spy('root', 'get'),
        messages: {
          get: spy('messages', 'get'),
          post: spy('messages', 'post'),
          ':messageId': {
            get: spy('messages_id', 'get'),
            put: spy('messages_id', 'put'),
            delete: spy('messages_id', 'delete'),
            comments: {
              get: spy('comments', 'get'),
              post: spy('comments', 'post'),
              ':commentId': {
                get: spy('comments_id', 'get'),
                put: spy('comments_id', 'put'),
                delete: spy('comments_id', 'delete')
              }
            },
            likes: {
              get: spy('likes', 'get'),
              post: spy('likes', 'post'),
              delete: spy('likes', 'delete')
            }
          }
        },
        status: {
          get: spy('status', 'get')
        }

      });

      app = express();
      routes.wire(app);
      server = app.listen(PORT, done);
    });

    afterEach(function (done) {
      server.close(done);
    });

    it("should respond to the endpoints defined by route", function (done) {
      Promise.all([
        request.get(URL + '/'),
        request.get(URL + '/messages'),
        request.post(URL + '/messages'),
        request.get(URL + '/messages/1'),
        request.put(URL + '/messages/2'),
        request.delete(URL + '/messages/1'),
        request.get(URL + '/messages/1/comments'),
        request.post(URL + '/messages/2/comments'),
        request.get(URL + '/messages/1/comments/2'),
        request.put(URL + '/messages/2/comments/4'),
        request.delete(URL + '/messages/3/comments/2')
      ]).then(function () {
        expect(reqHistory).toContain({url: '/', spy: 'rootGET'});
        expect(reqHistory).toContain({url: '/messages', spy: 'messagesGET'});
        expect(reqHistory).toContain({url: '/messages', spy: 'messagesPOST'});
        expect(reqHistory).toContain({url: '/messages/1', spy: 'messages_idGET'});
        expect(reqHistory).toContain({url: '/messages/2', spy: 'messages_idPUT'});
        expect(reqHistory).toContain({url: '/messages/1/comments', spy: 'commentsGET'});
        expect(reqHistory).toContain({url: '/messages/2/comments', spy: 'commentsPOST'});
        expect(reqHistory).toContain({url: '/messages/1/comments/2', spy: 'comments_idGET'});
        expect(reqHistory).toContain({url: '/messages/2/comments/4', spy: 'comments_idPUT'});
        expect(reqHistory).toContain({url: '/messages/3/comments/2', spy: 'comments_idDELETE'});

        done();
      }).catch(function (err) {
        fail(err.body + ': ' + err.code);
        done();
      });
    });

    describe("_links", function () {
      it("should add root links to the response json", function (done) {
        request.get(URL + '/messages').then(function (res) {
          expect(res.getBody()).toEqual({
            from: 'messagesGET',
            _links: {
              'self': {href: '/messages'},
              'messages': {href: '/messages'},
              'status': {href: '/status'}
            }
          });
        }).
            catch(fail).
            finally(done);
      });

      it("should include a reference to self", function (done) {
        request.get(URL + '/messages').then(function (res) {
          expect(res.getBody()._links.self).toEqual({href: '/messages'});
        }).
            catch(fail).
            finally(done);
      });

      it("should include a link to internal nouns", function (done) {
        request.get(URL + '/messages/6').then(function (res) {
          expect(res.getBody()._links.comments).toEqual({href: '/messages/6/comments'});
          expect(res.getBody()._links.likes).toEqual({href: '/messages/6/likes'});
        }).
            catch(fail).
            finally(done);
      });
    });
  });

  describe("#getRoutingMap", function () {
    beforeEach(function () {
      routes = new Routes({
        noun: {
          get: spy('get'),
          post: spy('post'),
          delete: spy('delete'),
          put: spy('put')
        }
      });
    });

    it("should extract the basic verbs", function () {
      expect(routes.getRoutingMap()).toEqual({
        '/noun': {
          get: spies.get,
          post: spies.post,
          delete: spies.delete,
          put: spies.put
        }
      });
    });

    it("should extract verbs at root level", function () {
      routes = new Routes({get: spy('root', 'get')});
      expect(routes.getRoutingMap()).toEqual({
        '/': {
          get: spies.rootGET
        }
      });
    });

    it("should extract shallow internal routes with variables", function () {
      routes = routes.addRoute({
        noun: {
          ':input': {
            get: spy('input_get'),
            delete: spy('input_delete'),
            put: spy('input_put')
          }
        }
      });
      expect(routes.getRoutingMap()).toEqual({
        '/noun': {get: spies.get, post: spies.post, delete: spies.delete, put: spies.put},
        '/noun/:input': {
          get: spies.input_get,
          delete: spies.input_delete,
          put: spies.input_put
        }
      });
    });

    it("should extract deep internal routes with variables", function () {
      routes = new Routes().addRoute({
        noun: {
          ':input': {
            otherNoun: {
              get: spy('_get')
            }
          }
        }
      });
      expect(routes.getRoutingMap()).toEqual({
        '/noun/:input/otherNoun': {
          get: spies._get
        }
      });
    });
  });
});