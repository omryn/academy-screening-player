/**
 * Created by Omry_Nachman on 12/19/14.
 */
"use strict";
var gitUtil = require('../../src/libs/git-util');


describe("gitUtil", function () {
  describe("#getLastRevision", function () {
    it("should return the lastest git commit hash", function (done) {
      Promise.all([getLastCommitFromCmd(), gitUtil.getLastRevision()]).
          spread(function (cmdLastCommitHash, gitUtilLastCommitHash) {
            expect(gitUtilLastCommitHash).toEqual(cmdLastCommitHash);
          }).testDone(done);
    });
  });

});