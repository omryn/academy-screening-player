/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";
module.exports = function(global){
  return copyToGlobal(global, {
    fail: fail,
    helper: helper,
    reportWithStack: reportWithStack,
    getCurrentStack: getCurrentStack,
    copyToGlobal: copyToGlobal
  });
};
/**
 * Copies content of obj onto global
 * @param {Object} global
 * @param {Object} obj
 * @returns {Object} obj
 */
function copyToGlobal(global, obj) {
  if (global && obj) {
    Object.keys(obj).forEach(function(key){
      global[key] = obj[key];
    });
  }
  return obj;
}

/**
 * fails the running jasmine spec
 * @param err
 */
function fail(err){
  jasmine.getEnv().fail(err.message || err);
}

/**
 * Changes the stack trace of a helper function to current stack
 * @param callback
 * @returns {Function}
 */
function helper(callback) {
  return reportWithStack(callback, getCurrentStack());
}

/**
 * Changes the stack trace of a helper function to <i>stack</i>
 * @param func
 * @param stack
 * @returns {Function}
 */
function reportWithStack(func, stack) {
  var original = jasmine.Spec.prototype.addMatcherResult;
  return function () {
    jasmine.Spec.prototype.addMatcherResult = function (result) {
      result.trace.stack = stack;
      return original.call(this, result);
    };
    var result = func.apply(this, arguments);
    jasmine.Spec.prototype.addMatcherResult = original;
    return result;
  };
}

/**
 *
 * @returns {string} the current stack trace
 */
function getCurrentStack() {
  var stack = new Error().stack;
  return stack.replace(new RegExp('.*' + __filename + '.*$\n', 'gm'), '');
}