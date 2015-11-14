var express = require("express"),
		app = express(),
		server = require("http").createServer(app),
		io = require("socket.io").listen(server)
		server.listen(8000),
		lobbyBuffer = [],
		runningGames = new Map();

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + '/'));

io.sockets.on("connection", function (socket) {

	playerConnected(socket.id);

	socket.on("disconnect", function () {
		// TODO: Socketid aus dem LobbyBuffer entfernen
		// TODO: Wenn der Spieler noch in einem Spiel ist, soll dieses geschlossen werden
	});

});

function playerConnected (socketId) {
	if (lobbyBuffer.length === 0) {
		lobbyBuffer.push(socketId);
	} else {
		createNewGame(socketId, lobbyBuffer.pop());
	}
}

function createNewGame (playerOneId, playerTwoId) {
	runningGames.set(runningGames.size, 
		{ "players": {
				"playerOne": playerOneId,
				"playerTwo": playerTwoId
			}
		}
	);
	informPlayerAboutGameStart(playerOneId, playerTwoId);
	informPlayerAboutGameStart(playerTwoId, playerOneId);
}

function informPlayerAboutGameStart (playerId, opponentId) {
	io.sockets.to(playerId).emit("gameIsStarting", true);
}