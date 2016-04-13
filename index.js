var express = require('express');
var app = express();
var cons = require("consolidate");
var bodyParser = require("body-parser");
var request = require('request');

var port = process.env.PORT || 3000;
var access_token = process.env.ACCESS_TOKEN;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

function sendTextMessage(sender, text) {
	messageData = {
		text:text
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { 
			access_token: access_token
		},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending message: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		}
	});
};

app.get('/', function(req, res) {
     res.send('Hello World!');
});

app.get('/privacy-policy', function(req, res) {
     res.render('privacy');
});

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === access_token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      // Handle a text message from this sender
    }
	
	if (event.postback) {
		text = JSON.stringify(event.postback);
		sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
		continue;
	}
  }
  res.sendStatus(200);
});

app.listen(port, function() {
    console.log('Our app is running on port ' + port);
});
