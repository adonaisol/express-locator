var express = require('express');
var mongoskin = require('mongoskin');
var bodyParser = require('body-parser');
var router = express.Router();

var jparser = bodyParser.json();
var parser = bodyParser.urlencoded({ extended: false });
/* GET home page. */
var db = mongoskin.db("mongodb://localhost:27017/mwaDB", { native_parser: true });
db.bind('locations');

router.get('/', function (req, res, next) {
  db.locations.findOne({}, { '_id': 0 }, function (err, item) {
    if (err) console.log(err);
    console.log("Item is " + JSON.stringify(item));
    res.render('index', { title: 'Locator App', item: item });
  });
});

router.post('/', parser, function (req, res, next) {
  var name = req.body.name;
  var option = req.body.optionsRadios;

  switch (option) {
    case 'upsert':
      var category = req.body.category;
      var latitude = req.body.latitude;
      var longitude = req.body.longitude;
      var query = { 'name': name };
      var operator = { 'name': name, 'category': category, 'coords': { 'longitude': longitude, 'latitude': latitude } };
      var options = { 'upsert': true }
      db.locations.update(query, operator, options, function (err, data) {
        if (err) console.log(err);
        db.locations.findOne(query, { '_id': 0 }, function (err, item) {
          res.render('index', { title: 'Locator App', item: item });
        });
      });
      break;
    case 'search':
      console.log("Search");
      var query = { 'name': name };
      db.locations.findOne(query, function (err, data) {
        if (err) console.log(err);
        //res.end("Thank you! <button href='/'>Go Back</button>");
        console.log("Item is " + data);
        res.render('index', { title: 'Locator App', item: data });
      });
      break;
    case 'delete':
      var query = { 'name': name };
      db.locations.remove(query, function(err, data){
        db.locations.findOne({}, { '_id': 0 }, function (err, item) {
          res.render('index', { title: 'Locator App', item: item });
        });
      }); 
      break;
  }
});

module.exports = router;
