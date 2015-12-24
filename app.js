"use strict";
let GameHandler = require("./includes/GameHandler");

let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io = require("socket.io").listen(server);

server.listen(8000);

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + '/'));

let gameHandler = new GameHandler(io);

io.sockets.on("connection", function (socket) {

	gameHandler.playerConnected(socket.id);

	socket.on("disconnect", function () {
		gameHandler.playerDisconnected(socket.id);
	});

	socket.on("clickOnOpponentGameField", function (data) {
		gameHandler.getMatch(socket.id).clickOnOpponentGameField(socket.id, data);
	});

});
