/**
 * Created by Omry_Nachman on 12/24/14.
 */
"use strict";
module.exports = function (json) {
  return function (req, res, next) {
    res.json(_.isFunction(json) ? json() : json);
  };
};