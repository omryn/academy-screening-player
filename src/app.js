"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/status/?', function (req, res, next) {
  res.json({
    "revision": "e8912f5b37280dd53412bd307f9056d769fc3b77",
    "repo": "git@bitbucket.org:omry_nachman/test.git",
    "uptime": 234523,
    "_links": {
      "get-move": {"href": "/get-move/"}
    }
  });
});

app.get('/get-move/:input/?', function (req, res, next) {
  res.json({
    "stdout": "output",
    "stderr": "",
    "exit-code": 0,
    "exceptions": "",
    "duration": 456
  });
});


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


module.exports = app;
