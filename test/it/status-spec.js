/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";
var requestify = require('requestify'),
    PORT = 7654, APP_URL = 'http://localhost:' + PORT,
    app = require('../../src/app')(true),
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
  app.set('startTime',startTime);

  server = app.listen(PORT, function (err) {
    if (err) {
      throw new Error('Unable to load server', err);
    }
    done();
  });
}

function makeRequest(done) {
  requestify.get(APP_URL + '/status/').
      then(function (res) {
        if (!res) {
          throw new Error('Got an empty response from server');
        }
        response = res;
        done();
      });
}

describe("app integration", function () {
  describe("status", function () {
    afterEach(killServer);
    beforeEach(loadServer);
    beforeEach(makeRequest);

    it("should return a 200 json response", function () {
      expect(response.getCode()).toBe(200);
      expect(response.getHeader('content-type')).toContain('application/json');
      expect(JSON.parse.bind(JSON, response.body)).not.toThrow();
    });

    it("should include the last commit hash", function (done) {
      getLastCommitFromCmd().then(function (revisionHash) {
        expect(response.getBody().revision).toEqual(revisionHash);
        done();
      });
    });

    it("should include the remote repo origin", function (done) {
      getRemoteOriginFromCmd().then(function (remoteOrigin) {
        expect(response.getBody().repo).toEqual(remoteOrigin);
        done();
      });
    });

    it("should include the current uptime", function(){
       expect(response.getBody().uptime).toBeGreaterThan(0);
       expect(response.getBody().uptime).toBeLessThan(1+Date.now() - startTime);
    });
  });
})
;