var spawn = require('child_process').spawn;
var path = require('path');

var async = require('async');

var Video = require('./models/video');

var generateThumbnail = function(filePath, next) {

	var directory = path.dirname(filePath);
	var name = path.basename(filePath, path.extname(filePath)) + '.jpg';
	var thumb = directory + '/' + name;

	var command_str = "C:/ffmpeg/bin/ffmpeg -i " + filePath + " -ss 00:10 -r 1 -an -vframes 1 -f mjpeg " + thumb + " -y";

	console.log("Executing " + command_str);

	var args = command_str.split(" ");
	var command = args.shift();

	var child = spawn(command, args);

	child.stdout.on('data', function(data) {
		console.log(data.toString('utf8'));
	});

	child.stderr.on('data', function(data) {
		console.log(data.toString('utf8'));
	});

	child.on('close', function (code) {
		next();
	});

	return thumb;
};


var convertVideo = function(filePath, next) {

	var directory = path.dirname(filePath);
	var extension = path.extname(filePath);

	if(extension == ".mp4") {
		next();
		return filePath;
	}

	var name = path.basename(filePath, extension) + '.mp4';
	var proxy = directory + '/' + name;

	var command_str = "C:/ffmpeg/bin/ffmpeg -i " + filePath + " -vcodec libx264 -profile:v baseline -preset ultrafast " + proxy + " -y";

	console.log("Executing " + command_str);

	var args = command_str.split(" ");
	var command = args.shift();

	var child = spawn(command, args);


	child.stdout.on('data', function(data) {
		console.log(data.toString('utf8'));
	});

	child.stderr.on('data', function(data) {
		console.log(data.toString('utf8'));
	});

	child.on('close', function (code) {
		
		next();
	});

	return proxy;
};

module.exports = function(file, user, done) {

	console.log("File: " + file.originalFilename);
	console.log("Path: " + file.path);
	console.log("Size: " + file.size);

	var newVideo = new Video();

	newVideo.name = path.basename(file.originalFilename, path.extname(file.originalFilename));
	newVideo.owner = user.id;

	async.parallel([
		function(next) {
			newVideo.path = convertVideo(file.path, function() {
				next();
			});
		},
		function(next){
			newVideo.thumb = './' + generateThumbnail(file.path, function() {
				next();
			});

			newVideo.save(function(err) {
				if(err) throw err;
			});
		}
	], done);

}