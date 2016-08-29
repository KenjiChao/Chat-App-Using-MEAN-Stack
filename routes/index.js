var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Message = mongoose.model('Message');

router.param('username', function(req, res, next, name) {
  User.findOne({'name': name}, 'name date', function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('can\'t find user by name'));
    req.user = user;
    return next();
  });
});

router.param('user', function(req, res, next, id) {
  var query = User.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find user')); }

    req.user = comment;
    return next();
  });
});

router.get('/users', function(req, res, next) {
  User.find(function(err, users){
    if(err) { return next(err); }

    res.json(users);
  });
});

router.get('/users/:user', function(req, res, next) {
  res.json(req.user);
});

router.post('/users', function(req, res, next) {
  var user = new User(req.body);

  user.save(function(err, user){
    if(err){ return next(err); }

    res.json(user);
  });
});

router.get('/users/name/:username', function(req, res, next) {
  res.json(req.user);
});

router.get('/messages', function(req, res, next) {
  Message.find().populate('user').exec(function(err, messages){
    if(err) { return next(err); }
    res.json(messages);
  });
});

router.post('/messages', function(req, res, next) {
  var message = new Message(req.body);
  message.user = req.body.user;
  message.save(function(err, message){
    if(err){ return next(message); }

    User.findById(message.user).exec(function(err, data){
      if(err) { return next(err); }
      message.user = data;
      res.json(message);
    });
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
