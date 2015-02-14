var http = require('http'),
	express = require('express'),
	chatServer = require('./lib/clientsHandler');

var app = express();
app.use(app.router);
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app).listen('3000', '192.168.1.20'); 
chatServer.listen(server);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/views/index.html');
});

app.get('/master', function(req, res){
	res.sendfile(__dirname + '/views/master.html');
});
