var express = require('express');
var app = express();

var port = process.env.PORT || 3000;
var access_token = process.env.ACCESS_TOKEN;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
     res.send('Hello World!');
});

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === access_token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});

app.listen(port, function() {
    console.log('Our app is running on port ' + port);
});
