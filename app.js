var express = require("express"),
		app = express(),
		server = require("http").createServer(app),
		io = require("socket.io").listen(server)
		server.listen(8000);

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + '/'));