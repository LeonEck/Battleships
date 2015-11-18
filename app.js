var express = require("express"),
		app = express(),
		server = require("http").createServer(app),
		io = require("socket.io").listen(server)
		server.listen(8000),
		lobbyBuffer = "",
		runningGames = new Map()
		perPlayerInformation = new Map(); // Stores a players Socket.id and his gameId in the runningGames Map

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + '/'));

io.sockets.on("connection", function (socket) {

	playerSearchingForGame(socket.id);

	socket.on("disconnect", function () {
		if(socket.id === lobbyBuffer) {
			// TODO: Wahrscheinlich doch wieder auf ein Array umsteigen
			lobbyBuffer = "";
		} else {
			var gameId = perPlayerInformation.get(socket.id);
			console.log("Clearing game: " + gameId);
			var gameJsonInfo = runningGames.get(gameId);
			console.log(gameJsonInfo);
			io.sockets.to(gameJsonInfo.players.playerOne).emit("gameIsAborted", true);
			io.sockets.to(gameJsonInfo.players.playerTwo).emit("gameIsAborted", true);
			if(gameJsonInfo.players.playerOne === socket.id) {
				playerSearchingForGame(gameJsonInfo.players.playerTwo);
			} else {
				playerSearchingForGame(gameJsonInfo.players.playerOne);
			}
			runningGames.delete(gameId);
		}
	});

});

function playerSearchingForGame (socketId) {
	if (lobbyBuffer === "") {
		lobbyBuffer = socketId;
	} else {
		var gameId = createNewGame(socketId, lobbyBuffer);
		console.log("Creating game: " + gameId);
		perPlayerInformation.set(socketId, gameId);
		perPlayerInformation.set(lobbyBuffer, gameId);
		lobbyBuffer = "";
	}
}

function createNewGame (playerOneId, playerTwoId) {
	runningGames.set(runningGames.size, 
		{ "players": {
				"playerOne": playerOneId,
				"playerTwo": playerTwoId
			},
			"gameFields": {
				"playerOne": predefinedGameFields.one,
				"playerTwo": predefinedGameFields.one
			}
		}
	);

	informPlayerAboutGameStart(playerOneId, playerTwoId);
	informPlayerAboutGameStart(playerTwoId, playerOneId);

	io.sockets.to(playerOneId).emit("gameField", runningGames.get(runningGames.size - 1).gameFields.playerOne);
	io.sockets.to(playerTwoId).emit("gameField", runningGames.get(runningGames.size - 1).gameFields.playerTwo);

	return runningGames.size - 1;
}

function informPlayerAboutGameStart (playerId, opponentId) {
	io.sockets.to(playerId).emit("gameIsStarting", true);
}

var predefinedGameFields = {
	"one": "x, x, x, x, x, o, o, o, o, o, o, o, o, o, o, o, o, x, x, x, x, o, o, o, o, x, o, o, o, o, x, o, x, x, o, x, o, o, o, o, o, o, o, o, o, o, o, x, x, x, x, o, o, x, x, x, o, o, o, o, x, o, o, o, o, o, o, o, o, o, o, o, o, x, x, x, x, o, o, o, o, o, o, o, o, o, o, o, o, o, x, x, x, x, o, o, o, o, o, o"
};









