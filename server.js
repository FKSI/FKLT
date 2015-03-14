var http = require('http'),
	express = require('express'),
	chatServer = require('./lib/clientsHandler'),
	fs = require("fs"),
	mongoose = require('mongoose'),
	JSZip = require('jszip'),
	db = require('./lib/databaseHandler');

var app = express();
app.use(app.router);
app.use(express.static(__dirname + '/public'));


var server = http.createServer(app).listen('3000', '192.168.1.20');
chatServer.listen(server);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/views/index.html');
});

app.get('/master', function (req, res) {
	res.sendfile(__dirname + '/views/master.html');
});

app.get('/explorer', function (req, res) {
	res.sendfile(__dirname + '/views/explorer.html');
});

app.get('/allPictures', function (req, res) {
	console.log(req.param('_category'))
	db.getImageMsgs(req.param('_category'), function (err, docs) {
		if (!err) {
			res.status(200).send(docs);
		} else {
			res.status(404).send("Oh uh, something went wrong");
		}

	})
});

/**
 * Get pictures from MongoDB
 * Each picture is convert from their storage base64 representation
 * into a file represenation and then directly injected to the
 * response ZIP file
 * Generate the response ZIP file in a base64 representation
 * Send back the ZIP base64 representation to the client
 * and therefore makes it directly downloadable.
 **/
app.get('/userRequestedPictures', function (req, res) {
	// Get requested pictures' String id
	var dl_cart = JSON.parse(req.param('download_cart'));
	// Create response ZIP file
	var zip = new JSZip();

	// Convert String ids to ObjectId ids
	var dl_cart_objectId = dl_cart.map(function (foo) {
		return mongoose.Types.ObjectId(foo);
	});


	var picFiles = [];

	// Root folder in the response ZIP file
	var img = zip.folder("images");


	db.getRawPic(dl_cart_objectId, function (err, docs) {
		if (err != null) {
			console.error("Error while retrieving image from database");
		} else {
			picFiles = docs;

			for (picFileIndex in picFiles) {
				// Buffering picture base64 representation
				var buff = new Buffer(picFiles[picFileIndex].imgContent.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

				// Converting buffer to file and injection in the response ZIP file
				img.file(dl_cart[picFileIndex] + '.jpg', buff, {
					base64: true
				});
			}

			// Generate the response ZIP file in  a base64 representation
			var content = zip.generate({
				type: "base64"
			});


			link = "data:application/zip;base64," + content;
			res.send(link);
		}

	});

});