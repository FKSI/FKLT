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

// PROD
// var server = http.createServer(app).listen('3000', '0.0.0.0');

// DEV
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

app.get('/timeline', function (req, res) {
	res.sendfile(__dirname + '/views/timeline.html');
});

app.get('/allPictures', function (req, res) {
	console.log(req.param('_category'));
	db.getImageMsgs("", function (err, docs) {
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
	var req_pictures = JSON.parse(req.param('download_cart'));
	// Create response ZIP archive
	var zip = new JSZip();

	// FS ZIP archive path
	var users_archivesPath = "public/users_archives/"


	// Root folder in the response ZIP archive
	var img = zip.folder("Photos Mariage - Jerome et Lina - 250715");
	
	// Add pictures to ZIP archive
	for (var i = 0; i < req_pictures.length; i++) {
		var picturesPath = "public/pictures/" + req_pictures[i].CAT + "/";
		var fileName = req_pictures[i].ID + '.jpg';
		var filePathName = picturesPath + fileName;
		var data = fs.readFileSync(filePathName);
		img.file(fileName, data, {
			createFolders: false,
			compression: "DEFLATE"
		});
	}

	// Generate the response ZIP archive
	var content = zip.generate({
		type: "nodebuffer"
	});

	// Save the response ZIP archive in FS
	var archiveName = users_archivesPath + Date.now() + ".zip";
	fs.writeFile(archiveName, content, function (err) {
		// Send the respons ZIP archive path for download
		var link = archiveName;
		res.send(link);
	});

});