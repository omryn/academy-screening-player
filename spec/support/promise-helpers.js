/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";

module.exports = function (global) {
  if (global) {
    global.Promise = require('bluebird');
  }

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
      Promise.prototype.expectReject = function (expectReasonToContain) {
        return this.then(function (value) {
          jasmine.getEnv().currentSpec.fail('Expect promise to be resolved, but it was rejected with:\n\t\t' + value);
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
       * @returns {Promise}
       */
      Promise.prototype.expectResolve = function (expectValueToContain) {
        return this.catch(function (err) {
          jasmine.getEnv().currentSpec.fail('Expect promise to be resolved, but it was rejected with:\n\t\t' + err);
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
