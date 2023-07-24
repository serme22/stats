var express = require('express');
var router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/firebase', function(req, res, next){
  res.redirect('/firebase.html');
});

router.get('/export', function(req, res, next){
  res.redirect('/exports.html');
});

router.get('/stats', function(req, res, next){
  res.redirect('/stats.html');
});

router.get('/manage', function(req, res, next){
  res.redirect('/manage.html');
});

router.get('/dpa', function(req, res, next){
  res.redirect('/dpa.html');
});


module.exports = router;
