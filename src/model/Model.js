/**
 * Created by Omry_Nachman on 12/28/14.
 */
"use strict";

module.exports = Model;

function Model(name) {
  if (!this) {
    return new Model(name);
  }
  this._name = name || _.uniqueId('model');
  this._data = {};
}


Model.prototype.create = function (data) {
  var id = _.uniqueId(this._name);
  if (_.isFunction(data)) {
    data = data(id);
  }

  if ('_id' in data) {
    throw new Error('Invalid data: "_id" is a reserved field');
  }

  data = _.defaults({_id: id}, data);

  this._data[id] = data;
  return Promise.resolve(this._data[id]);
};

Model.prototype.update = function (id, delta) {
  if (!this._data[id]) {
    return Promise.reject(new Error('No data with id: ' + id));
  }
  this._data[id] = _.defaultsDeep(delta, this._data[id]);
  return Promise.resolve(this._data[id]);
};

Model.prototype.getById = function (id) {
  return Promise.resolve(this._data[id]);
};

Model.prototype.list = function () {
  return Promise.resolve(_.values(this._data));
};