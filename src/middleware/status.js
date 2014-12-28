/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";
var gitUtil = require('../libs/git-util');

module.exports = function (req, res, next) {
  gitUtil.getRepoDetails().then(function (status) {
    var uptime = Date.now() - req.app.get('startTime');
    status.uptime = uptime;
    status._links = {
      "get-move": {"href": "/get-move/"}
    };
    res.json(status);
  }).catch(function(err){
    next(err);
  });
};