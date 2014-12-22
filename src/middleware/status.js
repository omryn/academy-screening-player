/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";
var gitUtil = require('../libs/git-util');

module.exports = function (req, res, next) {
  gitUtil.getLastRevision().then(function (sha) {
    res.json({
      "revision": sha,
      "repo": "git@bitbucket.org:omry_nachman/test.git",
      "uptime": 234523,
      "_links": {
        "get-move": {"href": "/get-move/"}
      }});
  });
};