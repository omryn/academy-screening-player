/**
 * Created by Omry_Nachman on 12/25/14.
 */
"use strict";

var gitUtil = require('../libs/git-util'),
    spawnUtil = require('../libs/spawn-util'),
    config = require('config').player.cmd;

module.exports = function (model) {
  return {
    create: function (req, res, next) {
      if (!req.body || req.body.input === undefined) {
        res.status(403).json({expected: {input: '{move input}'}, actual: req.body});
      } else {
        model.create(function (id) {
          var process = spawnUtil.spawn(config, [req.body.input]);
          process.
              then(function(result){
                model.update(id, {
                  status: 'done',
                  result: result,
                  ended: new Date()
                });
              }).
              catch(function(result){
                model.update(id, {
                  status: 'error',
                  result: result,
                  ended: new Date()
                });
              });
          return {
            process: process,
            input: req.body.input,
            move_id: id,
            status: 'running',
            created: new Date(),
            _links: {
              'move_status': {href: '/moves/' + id}
            }
          };
        }).
            then(function (item) {
              res.status(201).
                  json(_.pick(item, ['move_id', 'status', 'created', '_links']));
            }).catch(function (err) {
              res.status(503).
                  json({'error': err});
            });
      }
    },
    list: function (req, res, next) {
      Promise.all([gitUtil.getRepoDetails(), model.list()]).
          spread(function (repo, list) {
            res.json(_.defaults(repo, {
              _embedded: {
                moves: _.map(list, function (item) {
                  return _.pick(item, ['move_id', 'status', '_links', 'created']);
                })
              }
            }));
          });
    },
    getDetails: function (req, res, next) {
      var moveId = req.params.move_id;
      model.getById(moveId).
          then(function (item) {
            if (item) {
              var response = _.pick(item, ['move_id', 'status', '_links', 'created', 'result']);
              response.duration = _.now() - item.created.getTime();
              res.json(response);
            } else {
              res.status(403).json({move_id: moveId});
            }
          });
    }
  };
};