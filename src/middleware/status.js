/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";
var gitUtil = require('../libs/git-util');

module.exports = function (req, res, next) {
  Promise.join(gitUtil.getLastRevision(), gitUtil.getRemoteOrigin(), function(sha, origin){
    var uptime = Date.now() - req.app.get('startTime');
    res.json({
      "revision": sha,
      "repo": origin,
      "uptime": uptime,
      "_links": {
        "get-move": {"href": "/get-move/"}
      }});
  });
};