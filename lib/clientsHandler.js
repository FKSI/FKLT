var socketio = require('socket.io');
var db = require('./databaseHandler');
var io;
// maps socket.id to user's nickname
var nicknames = {};
// list of socket ids
var clients = [];
var namesUsed = [];



/**
 * Initialize the chat server
 *
 * @param server
 *
 */
exports.listen = function (server) {
    io = socketio.listen(server);
    io.set('log level', 2);
    io.sockets.on('connection', function (socket) {
        initializeConnection(socket);
        handleChoosingNicknames(socket);
        handleClientDisconnections(socket);
        handleMessageBroadcasting(socket);
        handlePrivateMessaging(socket);
    });
}


/**
 * Initialize the chat service
 *
 * @param socket
 *
 */
function initializeConnection(socket) {
    showActiveUsers(socket);
    showOldMsgs(socket);
}


/**
 * Show chat active users
 *
 * @param socket
 *
 */
function showActiveUsers(socket) {
    var activeNames = [];
    var usersInRoom = io.sockets.clients();

    for (var index in usersInRoom) {
        var userSocketId = usersInRoom[index].id;
        if (userSocketId !== socket.id && nicknames[userSocketId]) {
            var name = nicknames[userSocketId];
            activeNames.push({
                id: namesUsed.indexOf(name),
                nick: name
            });
        }
    }
    // Broadcast active users list to clients 
    socket.emit('names', activeNames);
}


/**
 * Get the 5 latest messages
 *
 * @param socket
 *
 */
function showOldMsgs(socket) {
    db.getOldMsgs(5, function (err, docs) {
        // Broadcast old messages to clients
        socket.emit('load old msgs', docs);
    });
}


/**
 * Nickname choice handler
 *
 * @param socket
 *
 * TODO Force upper case comparison to avoid case issues
 */
function handleChoosingNicknames(socket) {
    socket.on('choose nickname', function (nick, cb) {
        if (namesUsed.indexOf(nick) !== -1) {
            cb('That name is already taken!  Please choose another one.');
            return;
        }
        var ind = namesUsed.push(nick) - 1;
        clients[ind] = socket;
        nicknames[socket.id] = nick;
        cb(null);
        io.sockets.emit('new user', {
            id: ind,
            nick: nick
        });
    });
}

/**
 * Broadcast message handler
 *
 * @param socket
 *
 */
function handleMessageBroadcasting(socket) {
    socket.on('message', function (msg) {
        var nick = nicknames[socket.id];
        // Save message to database
        db.saveMsg({
            nick: nick,
			category: msg._category,
			type: msg._type,
            txtContent: msg._txtContent,
			imgContent : msg._imgContent
        }, function (err) {
            if (err) throw err;
            //TODO Change protocol name for sending message to clients
            io.sockets.emit('message', {
                nick: nick,
				category: msg._category,
				type: msg._type,
				txtContent: msg._txtContent,
				imgContent : msg._imgContent
            });
        });
    });
}





/**
 * TODO Delete this functionality
 * Private message handler
 *
 * @param socket
 *
 */
function handlePrivateMessaging(socket) {
    socket.on('private message', function (data) {
        var from = nicknames[socket.id];
        clients[data.userToPM].emit('private message', {
            from: from,
            msg: data.msg
        });
    });
}

/**
 * Handle client disconnections
 *
 * @param socket
 *
 */
function handleClientDisconnections(socket) {
    socket.on('disconnect', function () {
        var ind = namesUsed.indexOf(nicknames[socket.id]);
        delete namesUsed[ind];
        delete clients[ind];
        delete nicknames[socket.id];
        io.sockets.emit('user disconnect', ind);
    });
}