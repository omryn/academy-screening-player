/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";

module.exports = function(global) {
  return copyToGlobal(global, {
    spawn: spawn,
    getLastCommitFromCmd: getLastCommitFromCmd,
    getRemoteRepoFromCmd: getRemoteRepoFromCmd
  });
};


function spawn(command, args) {
  return new Promise(function (resolve, reject) {
    var spawn = require('child_process').spawn;
    var stdout = '';
    var cmd = spawn(command, args);
    cmd.stdout.on('data', function (data) {
      stdout = stdout + (''+data).replace(/\n$/gm, '');
    });
    cmd.on('exit', function () {
      resolve(stdout);
    }).on('error', reject);
  });
}


function getLastCommitFromCmd() {
  return spawn('git', ['rev-list', '-1', 'master']);
}

function getRemoteRepoFromCmd() {
  return spawn('git', ['remote', '-v']);
}