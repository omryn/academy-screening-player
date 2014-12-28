"use strict";
module.exports = function (silent) {

  var express = require('express');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');

  var model = require('./model/model')('MOVES'),
      moves = require('./middleware/moves')(model);

  var Routes = require('./libs/routes');
  var json = require('./middleware/json-response');

  var app = express();
  app.set('startTime',Date.now());

  global.Promise = global.Promise || require('bluebird');

  if (!silent) {
    app.use(logger('dev'));
  }
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());

  new Routes({
    get: json({}),
    status: {
      get: require('./middleware/status')
    },
    moves: {
      get: moves.list,
      post: moves.create,
      ':move_id': {
        get: moves.getDetails,
        delete: json({})
      }
    }
  }).wire(app);



// catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

// error handlers

// development error handler
// will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: err,
        stack: err.stack
      });
    });
  }

// production error handler
// no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.end();
  });


  return app;
};