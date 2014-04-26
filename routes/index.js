var multiparty = require('multiparty');
var fs = require('fs');

var process = require('../process');

var Video = require('../models/video');

module.exports = function(app, passport, io) {

	// LOGIN

	app.get('/', function(req, res){
		if(req.user)
			res.redirect('/videos');
		else
			res.render('index', {user : req.user, message: req.flash('loginMessage') });
	});

	app.get('/register', function(req, res){
		if(req.user)
			res.redirect('/videos');
		else
			res.render('register', {user : req.user, message: req.flash('registerMessage') });
	});

	app.get('/upload', isLoggedIn, function(req, res) {
		res.render('upload', {user : req.user, message: req.flash('uploadMessage') });
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {scope:'email'}));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
			successRedirect : '/videos',
			failureRedirect : '/',
	}));

	app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/videos',
			failureRedirect : '/',
			failureFlash : true
	}));

	app.post('/register', passport.authenticate('local-register', {
			successRedirect : '/videos',
			failureRedirect : '/register',
			failureFlash : true
	}));

	//VIDEOS

	app.get('/videos', isLoggedIn, function(req, res) {

		var user = req.user;

		Video.find({owner: user.id}, function(err, videos) {
			if(err) throw err;
			res.render('videos', {user: user, videos: videos, message: req.flash('uploadMessage')});
		});
	});

	app.get('/video/:id', isLoggedIn, function(req, res) {
		var user = req.user;
		var videoId = req.params.id;

		Video.findById(videoId, function(err, video) {
			res.render('video', {user : req.user, video: video});
		});
	});

	app.delete('/video/:id', isLoggedIn, function (req, res) {
		var videoId = req.params.id;

		Video.findById(videoId, function(err, video) {
			fs.unlinkSync("./" + video.path);
			fs.unlinkSync("./" + video.thumb);
		});

		Video.remove({_id : videoId}, function(err) {
			if(err) throw err;
			req.flash('uploadMessage', 'Video deleted successfuly!');
			res.redirect('/videos');
		});

	});

	app.post('/upload', isLoggedIn, existFolder, function(req, res) {

		var user = req.user;
		var path = './uploads/' + user.id;
		var socket = null;

		var form = new multiparty.Form({
			autoFiles: true,
			uploadDir: path
		});

		form.on('field', function(name, value) {
			if(name == "socketId")
				socket = io.sockets.sockets[value];
		});

		form.on('progress', function(bytesReceived, bytesExpected) {
			if(socket)
				socket.emit('upload-progress', {value: parseInt((bytesReceived/bytesExpected) * 100)});
		});

		form.on('close', function() {
			console.log("Upload Success!");
		});

		form.on('error', function(err) {
			console.log("Error uploading.");
			console.log(err);
			req.flash('uploadMessage', 'There was an error while uploading. Please try again.');
			res.redirect('/videos');
		});

		form.parse(req, function(err, fields, files) {
			
			var file = files.video[0];

			process(file, user, function() {
				req.flash('uploadMessage', 'Video uploaded successfuly!');
				res.redirect('/videos');
			});
		});
	});

};


function isLoggedIn(req, res, next) {

	console.log("is logged in?");

	if(req.isAuthenticated()) {
		console.log("Yes!");
		return next();
	}

	console.log("No.");
	res.redirect('/');
}

function existFolder(req, res, next) {

	var user = req.user;
	var path = './uploads/' + user.id;

	fs.exists(path, function(exists) {
		if(!exists)
			fs.mkdir(path, function(){
				return next();
			});
		else
			return next();
	});
}