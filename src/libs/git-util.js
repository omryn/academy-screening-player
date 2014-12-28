"use strict";
var nodegit = require('nodegit'),
    Repository = nodegit.Repository,
    path = require('path');

/**
 * @returns {Promise} last master commit's SHA
 */
module.exports.getLastRevision = function getLastRevision() {
  return Repository.open(path.resolve() + '/.git').
      then(function (repo) {
        return repo.getMasterCommit();
      }).then(function (firstCommit) {
        return firstCommit.sha();
      });
};

/**
 * @returns {Promise} remote fetch origin
 */
module.exports.getRemoteOrigin = function () {
  return Repository.open(path.resolve() + '/.git').
      then(function (repo) {
        return nodegit.Remote.load(repo, "origin");
      }).
      then(function (origin) {
        return origin.url();
      });
};

/**
 *
 * @returns {Object} an obejct containing {repo:.., revision:...}
 */
module.exports.getRepoDetails = function () {
  return Promise.all([module.exports.getRemoteOrigin(), module.exports.getLastRevision()]).
      spread(function (origin, sha) {
        return {
          "revision": sha,
          "repo": origin
        };
      });
};