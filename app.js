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

	gameHandler.playerSearchingForGame(socket.id);

	socket.on("disconnect", function () {
		gameHandler.playerLeftGame(socket.id);
	});

	socket.on("clickOnOpponentGameField", function (data) {
		let affectedMatch = gameHandler.getMatch(socket.id);
		affectedMatch.clickOnOpponentGameField(socket.id, data);
		affectedMatch.sendGameItsInformations();
	});

});
