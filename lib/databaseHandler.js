// Mongoose instantiation
var mongoose = require('mongoose'),
	fs = require("fs");

var MSG_TYPE = {
	0: "image",
	1: "medias",
	2: "text"
};
var MSG_CAT = {
	0: "normal",
	1: "photoHunt"
};


function decodeBase64Image(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}

	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');

	return response;
}

// MongoDB connection
mongoose.connect('mongodb://localhost/chat', function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log('Connected to mongodb!');
	}
});


// Chat message structure
var chatSchema = mongoose.Schema({
	nick: String,
	category: {
		type: [String],
		index: true
	},
	type: String,
	txtContent: String,
	imgContent: String,
	created: {
		type: Date,
		default: Date.now
	}
});

// Use chatSchema as model (Message)
var Chat = mongoose.model('Message', chatSchema);

/**
 * Get old messages from model (Message)
 *
 * @param limit             Number of results
 * @param cb                Callback function
 *
 */
exports.getOldMsgs = function (limit, cb) {
	var query = Chat.find({});
	query.sort('-created').limit(limit).exec(function (err, docs) {
		cb(err, docs);
	});
}

/**
 *
 * Get messages containing images
 *
 *
 **/
exports.getImageMsgs = function (category, cb) {
	var allGetByResults = [];
	var query = Chat.find({
		'imgContent': {
			$exists: true,
			$ne: ""
		}
	},{imgContent:false}).stream();

	query.on('data', function (doc) {
		// do something with the mongoose document
		//console.log("on data", doc);
		allGetByResults.push(doc);
	}).on('error', function (err) {
		// handle the error
		console.log("on error", err);
	}).on('close', function () {
		// the stream is closed
		console.log("on close");
		cb(null, allGetByResults);
		query.destroy();
	});
}


/**
 * Save message to MongoDB
 *
 * @param limit             Number of results
 * @param cb                Callback function
 *
 */
exports.saveMsg = function (data, cb) {
	var newMsg = new Chat({
		imgOrientation: data.imgOrientation,
		imgContent: data.imgContent,
		txtContent: data.txtContent,
		type: data.type,
		category: data.category,
		nick: data.nick
	});
	newMsg.save(function (err) {
		cb(err);
	});
	if (data.type !== MSG_TYPE[2]) {
		var imageBuffer = decodeBase64Image(data.imgContent);
		
		var picturesPath = "public/pictures/" + data.category + "/";	
		
		console.log("WRITING :",picturesPath + newMsg._id + '.jpg' );
		fs.writeFile(picturesPath + newMsg._id + '.jpg', imageBuffer.data, function (err) {
			console.log("WRITE ERROR : ", err);
		});

	}
};


/**
 *
 * Get the given picture's raw (base64) representation
 *
 **/
exports.getRawPic = function (picID, cb) {
	var query = Chat.find({
		'_id': {
			$in: picID
		}
	}, 'imgContent');
	query.exec(function (err, docs) {
		cb(err, docs);
	});
}