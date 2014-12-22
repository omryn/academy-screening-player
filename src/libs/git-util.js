"use strict";
var nodegit = require('nodegit'),
    Repository = nodegit.Repository,
    path = require('path');

/**
 * @returns {Promise} a Promise of the last commit's SHA
 */
module.exports.getLastRevision = function getLastRevision() {
  return Repository.open(path.resolve() + '/.git').
      then(function (repo) {
        repo.getReferences('origin').then(function(remotes){
          remotes.snapshot().then(function(s){
            console.log(s);
          });
          console.log(remotes);
        });
        return repo.getMasterCommit();
      }).then(function (firstCommit) {
        return firstCommit.sha();
      });
};
