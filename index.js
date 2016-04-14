var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cons = require('consolidate');
var app = express();
var page_token = process.env.PAGE_TOKEN;


// instruct the app to use the `bodyParser()` middleware for all routes
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

function sendMessage(sender, messageData) {
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: page_token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending message: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		}
	});
}

app.get('/privacy-policy', function(request, response) {
	response.render('privacy');
});

app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_very_own_token') {
		res.send(req.query['hub.challenge']);
	}
	res.send('Error, wrong validation token');
});

app.post('/webhook/', function (req, res) {
  
	messaging_events = req.body.entry[0].messaging;
	for (i = 0; i < messaging_events.length; i++) {
		event = req.body.entry[0].messaging[i];
		sender = event.sender.id;
		if (event.message && event.message.text) {
			var text = event.message.text;
			var response = {
					text: "This you say" + text
				};
			// Handle a text message from this sender
			sendMessage(sender, response);
			
		}
		else if (event.postback) {
			var postback_text = event.postback.payload;
			if (postback_text == "USER_REQUEST_SHIPPING_PRICE") {
				var message = {
					text: "Am on it...What state are you shipping from?"
				};
				sendMessage(sender, message);
				continue;
			}
		}
		res.sendStatus(200);
	}
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


