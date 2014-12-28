/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";

module.exports = function (global) {
  if (global) {
    global.Promise = require('bluebird');
  }

  Promise.onPossiblyUnhandledRejection(function(error){
    //console.error(error);
  });

  Error.stackTraceLimit = 25;
  Promise.longStackTraces();


  beforeEach(function () {
    try {
      /**
       * finish a test spec when the promise is fulfilled
       * @lent Promise
       * @param {Function} done
       * @returns {Promise}
       */
      Promise.prototype.testDone = function (done) {
        return this.then(function () {
          done();
        }).catch(function (err) {
          fail(err || "Unknown uncaught exception");
          done();
        }).done();
      };

      /**
       * @lent Promise
       * @returns {Promise}
       */
      Promise.prototype.expectReject = function (done, expectReasonToContain) {
        return this.then(function (value) {
          fail('Expect promise to be rejected, but it was resolved with:\n\t\t' + value);
          done();
        }).catch(function (err) {
          if (expectReasonToContain) {
            if (err && err.message) {
              expect(err.message).toContain(expectReasonToContain);
            } else {
              expect(err).toContain(expectReasonToContain);
            }
          }
          return err;
        });
      };

      /**
       * @lent Promise
       * @param{Function} done called if rejected
       * @param{*?} expectValueToContain
       * @returns {Promise}
       */
      Promise.prototype.expectResolve = function (done, expectValueToContain) {
        var trace = getCurrentStack();

        return this.catch(function (err) {
          fail('Expect promise to be resolved, but it was rejected with:\n\t\t' + _.getValue(err,'message', err) + '\n' + trace);
          done();
          return Promise.reject(err);
        }).then(function (value) {
          if (expectValueToContain !== undefined) {
            expect(value).toContain(expectValueToContain);
          }
          return value;
        });
      };

    } catch (err) {
    }
  });
};
