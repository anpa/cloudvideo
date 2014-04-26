CloudVideo
==========

A node.js project to get familiar with its awesome features and libraries. A personal video-on-demand application to upload your videos and play them anywere. It uses express.js, mongodb, handlebars.js, socket.io, passport.js, ffmpeg, among others.

It lets you upload your video files and converts them to .mp4 so that you can play them using HTML5 video tag.

Installation
--------

In the main folder, run:

`npm install`

This will install all dependencies.

You also need to change the following files:

* 	`app.js` - change mongodb url accordingly, in order to have data persistence;
*	`process.js` - change ffmpeg path accordingly, in order to generate thumbnails and convert video files;
*   `config/auth.js` - include your facebook app credentials, in order to login via facebook;

TO-DO List
--------

*	File upload verifications (handle empty files, unsuported extensions, ...);
*	Encrypt passwords;
*	User authentication when acessing videos;
*	Video processing progress bar;
*	Unitary tests;

