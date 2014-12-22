/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";
var requestify = require('requestify'),
    PORT = 7654, APP_URL = 'http://localhost:' + PORT,
    app = require('../../src/app'),
    response,
    server;

describe("app integration", function () {
  describe("status", function () {

    beforeEach(function (done) {
      server = app.listen(PORT, function () {
        requestify.get(APP_URL + '/status/').
            then(function (res) {
              response = res;
              server.close(done);
            });
      });
    });

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


  });
});