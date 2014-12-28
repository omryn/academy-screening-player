/**
 * Created by Omry_Nachman on 12/22/14.
 */
"use strict";
module.exports = Routes;
require('./lodash-object-plugins');

var VERBS = ['get', 'post', 'delete', 'put'];

function Routes(nouns) {
  if (!this) {
    return new Routes(nouns);
  }
  validateRoutes(nouns);
  this._routes = nouns || {};
}

Routes.prototype.addRoute = function (routes) {
  var newRoutes = _.defaultsDeep(routes, this._routes);
  return new Routes(newRoutes);
};

Routes.prototype.wire = function (app) {
  app.set('routes', this);
  validateRoutes(this._routes);
  var routes = this.getRoutingMap();
  var linksMiddleware = addLinksToJson(this);
  _.forEach(routes, function (verbs, route) {
    _.forEach(verbs, function (handler, verb) {
      app[verb](parsePath(route), linksMiddleware);
      app[verb](parsePath(route), handler);
    });
  });
};

Routes.prototype.getRoutingMap = function () {
  return flatten(this._routes);
};

Routes.prototype.getLinks = function (req) {
  var links = {"self": {href: req.originalUrl}},
      prefix = '', count = 0;

  function addValidLinks(val, keys) {
    count++;

    if (_.some(keys, isPathParameter)) {
      return _.traverse.SKIP_CHILDREN;
    }
    if (_.isPlainObject(val) && keys.length) {
      links[keys.join(':')] = {href: prefix + '/' + keys.join('/')};
    }
  }

  _.traverse(this._routes, addValidLinks);

  var route = _.without(req.route.path.split('/'), '?', '');
  var internalRoutes = _.getValue(this._routes, route);
  prefix = req.originalUrl;
  _.traverse(internalRoutes, addValidLinks);

  return links;
};

function addLinksToJson(self) {
  return function (req, res, next) {
    var original = res.json;
    res.json = function (json) {
      var args = _.rest(arguments);
      json = _.cloneDeep(json);
      json._links = _.defaults(self.getLinks(req), json._links);
      args.unshift(json);
      return original.apply(res, args);
    };
    next();
  };
}

function flatten(obj) {
  var ret = {};
  _.traverse(obj, function (val, keys) {
    if (_.isPlainObject(val)) {
      var verbs = _.pick(val, VERBS);
      if (_.size(verbs)) {
        ret['/' + keys.join('/')] = verbs;
      }
    }
  });
  return ret;
}

function parsePath(route) {
  return route + '/?';
}

function isPathParameter(key) {
  return /^:/.test(key);
}

function isVerb(keys) {
  return _.contains(VERBS, _.last(keys));
}

function validateRoutes(newRoutes) {
  _.traverse(newRoutes, function (val, keys) {
    var keysStr = '[' + keys.join('.') + ']';

    if (isVerb(keys) && !_.isFunction(val)) {
      throw new TypeError('Verbs [get, post, put, delete] must be functions ' + keysStr);
    }
    if (_.isPlainObject(val) && _.size(val) === 0) {
      throw new Error('Nouns without verbs make no sense ' + keysStr);
    }
    if (_.isFunction(val) && !isVerb(keys)) {
      throw new TypeError('Only verbs [get, post, put, delete] are accepted as functions ' + keysStr);
    }
    _.forEach(keys, function (key) {
      if (!/:?[\w][\w\d\._-]*/.test(key)) {
        throw new Error('invalid route part :"' + key + '" ' + keysStr);
      }
    });
  });
}