var express = require('express');
var http = require('http');
var hbs = require('hbs');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var app = express();
var server = http.createServer(app);

var io = require('socket.io').listen(server);

//Database
mongoose.connect('mongodb://localhost/VideoCloud');

//Passport config
require('./config/passport')(passport);

//Configuration
app.configure(function() {
	app.set('view engine', 'html');
	app.engine('html', hbs.__express);
	
	app.use(express.static('public'));
	app.use('/uploads',express.static('uploads'));
	
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());

	app.use(express.session({secret:'thisismysecretstring'}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
});

//Routes
require('./routes')(app, passport, io);

//Sockets
io.set('log level', 1);
io.sockets.on('connection', function(client) {
	console.log("Client connected...");
	client.emit('socketId', client.id);
});

//Server
server.listen(3000, function() {
	console.log('Listening on port %d', server.address().port);
});

