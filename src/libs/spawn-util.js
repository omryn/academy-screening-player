/**
 * Created by Omry_Nachman on 12/28/14.
 */
"use strict";

module.exports.spawn = spawn;

function spawn(command, args) {
  return new Promise(function (resolve, reject) {
    args = args || [];
    var spawn = require('child_process').spawn;
    var result = {
      stdout: '',
      stderr: '',
      error: undefined,
      exit_code: undefined
    };

    var cmd = spawn(command, args, {stdio: 'pipe'});
    cmd.stdout.on('data', function (data) {
      result.stdout = result.stdout + data;
    });
    cmd.stderr.on('data', function (data) {
      result.stderr = result.stderr + data;
    });

    cmd.on('close', function (code) {
      result.exit_code = code;
      resolve(result);
    }).on('error', function (err) {
      result.error = err;
      reject(result);
    }).on('disconnect', function () {
      result.error = 'disconnected';
      reject(result);
    });
  });
}