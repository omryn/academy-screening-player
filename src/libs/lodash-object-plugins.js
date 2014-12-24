/**
 * Created by Omry_Nachman on 12/23/14.
 */
"use strict";

global._ = require('lodash');
_.mixin({
  /**
   * @lent _
   * @param {Object} object and object to traverse
   * @param {Function} callback will be called for each node with (value, keysAsArray)
   * @param {Array} [keys=[]] added prefix keys
   */
  traverse: function traverse(object, callback, keys) {
    keys = keys || [];
    callback(object, keys);
    _.forEach(object, function (val, key) {
      var withCurrentKey = _.flatten([keys, key]);
      if(_.isString(val)) {
        callback(val, withCurrentKey);
      } else {
        traverse(val, callback, withCurrentKey);
      }
    });
  },
  /**
   * @lent _
   * @param {Object} object an object to
   * @param {Array|String} keys if a string is provided, it will be converted using split('.')
   * @param {*} value
   * @param {Boolean} [noOverride=false]
   */
  setValue: function setValue(object, keys, value, noOverride) {
    if (!_.isArray(keys)) {
      keys = keys.split('.');
    }
    var lastKey = _.last(keys);
    _(keys).first(keys.length - 1).forEach(function (key, index) {
      if (!_.isObject(object[key])) {
        if (noOverride && key in object) {
          throw new Error('Override error: {object}.' + _.first(keys, index + 1).join('.') + ' = ' + value);
        }
        object[key] = {};
      }
      object = object[key];
    });
    object[lastKey] = value;
  },
  /**
   * @lent _
   * @param{Object} object to traverse
   * @param {Array|String} keys if a string is provided, it will be converted using split('.')
   * @returns {*}
   */
  getValue: function getValue(object, keys) {
    if (_.isObject(object)) {
      if (!_.isArray(keys)) {
        keys = _.compact(keys.split('.'));
      }
      _.every(keys, function (key) {
        if (key in object) {
          object = object[key];
          return true;
        } else {
          object = undefined;
        }
      });
    }

    return object;
  }
});

module.exports = _;
