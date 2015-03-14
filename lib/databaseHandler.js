// Mongoose instantiation
var mongoose = require('mongoose');

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
	category: String,
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
	var query = Chat.find({
		'imgContent': {
			$exists: true,
			$ne: ""
		},
		'category': category
	});
	query.exec(function (err, docs) {
		cb(err, docs);
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
		imgContent: data.imgContent,
		txtContent: data.txtContent,
		type: data.type,
		category: data.category,
		nick: data.nick
	});
	newMsg.save(function (err) {
		cb(err);
	});
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