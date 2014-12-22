/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";

module.exports = function(global) {
  return copyToGlobal(global, {
    spawn: spawn,
    getLastCommitFromCmd: getLastCommitFromCmd,
    getRemoteOriginFromCmd: getRemoteOriginFromCmd
  });
};


function spawn(command, args) {
  return new Promise(function (resolve, reject) {
    var spawn = require('child_process').spawn;
    var stdout = '';
    var cmd = spawn(command, args, {stdio:'pipe'});
    cmd.stdout.on('data', function (data) {
      stdout = stdout + (''+data).replace(/\n/gm, '');
    });
    cmd.on('close', function () {
      resolve(stdout);
    }).on('error', reject);
  });
}


function getLastCommitFromCmd() {
  return spawn('git', ['rev-list', '-1', 'master']);
}

function getRemoteOriginFromCmd() {
  return spawn('git', ['remote', '-v']).then(function (output){
    return output.match(/(origin)\s*([\w\d\/\-\.:@_]+)\s*\(fetch\)/)[2];
  });
}