var express = require("express"),
		app = express(),
		server = require("http").createServer(app),
		io = require("socket.io").listen(server)
		server.listen(8000);
var lobbyBuffer = "";
var runningGames = new Map();
var perPlayerInformation = new Map(); // Stores a players Socket.id and his gameId in the runningGames Map

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + '/'));

function MatchHandler (playerOne, playerTwo, gameFieldOne, gameFieldTwo) {
	this.playerOne = playerOne;
	this.playerTwo = playerTwo;
	this.gameFieldOne = gameFieldOne.slice();
	this.gameFieldTwo = gameFieldTwo.slice();
	this.playerWhosMoveItIs = playerOne;
}

io.sockets.on("connection", function (socket) {

	playerSearchingForGame(socket.id);

	socket.on("disconnect", function () {
		if(socket.id === lobbyBuffer) {
			// TODO: Wahrscheinlich doch wieder auf ein Array umsteigen
			lobbyBuffer = "";
		} else {
			var gameId = perPlayerInformation.get(socket.id);
			console.log("Clearing game: " + gameId);
			io.sockets.to(runningGames.get(gameId).playerOne).emit("gameIsAborted", true);
			io.sockets.to(runningGames.get(gameId).playerTwo).emit("gameIsAborted", true);
			perPlayerInformation.delete(runningGames.get(gameId).playerOne);
			perPlayerInformation.delete(runningGames.get(gameId).playerTwo);
			if(runningGames.get(gameId).playerOne === socket.id) {
				playerSearchingForGame(runningGames.get(gameId).playerTwo);
			} else {
				playerSearchingForGame(runningGames.get(gameId).playerOne);
			}
			runningGames.delete(gameId);
		}
	});
	
	socket.on("clickOnOpponentGameField", function (data) {
		var gameIdForPlayer = perPlayerInformation.get(socket.id);
		if (socket.id !== runningGames.get(gameIdForPlayer).playerWhosMoveItIs) {
			return;
		}
		if (socket.id === runningGames.get(gameIdForPlayer).playerOne) {
			if (runningGames.get(gameIdForPlayer).gameFieldTwo[data] === "x") {
				runningGames.get(gameIdForPlayer).gameFieldTwo[data] = "d";
			} else {
				runningGames.get(gameIdForPlayer).playerWhosMoveItIs = runningGames.get(gameIdForPlayer).playerTwo;
			}
		} else {
			if (runningGames.get(gameIdForPlayer).gameFieldOne[data] === "x") {
				runningGames.get(gameIdForPlayer).gameFieldOne[data] = "d";
			} else {
				runningGames.get(gameIdForPlayer).playerWhosMoveItIs = runningGames.get(gameIdForPlayer).playerOne;
			}
		}
		sendRunningGameItsInformations(gameIdForPlayer);
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
		new MatchHandler(playerOneId, playerTwoId, predefinedGameField, predefinedGameField)
	);

	io.sockets.to(playerOneId).emit("gameIsStarting", true);
	io.sockets.to(playerTwoId).emit("gameIsStarting", true);

	sendRunningGameItsInformations(runningGames.size - 1);

	return runningGames.size - 1;
}

function sendRunningGameItsInformations (gameId) {
	var playerOneId = runningGames.get(gameId).playerOne;
	var playerTwoId = runningGames.get(gameId).playerTwo;
	
	io.sockets.to(playerOneId).emit("gameField", runningGames.get(gameId).gameFieldOne);
	io.sockets.to(playerTwoId).emit("gameField", runningGames.get(gameId).gameFieldTwo);
	
	if(playerOneId === runningGames.get(gameId).playerWhosMoveItIs) {
		io.sockets.to(playerOneId).emit("isItMyTurn", true);
		io.sockets.to(playerTwoId).emit("isItMyTurn", false);
	} else {
		io.sockets.to(playerOneId).emit("isItMyTurn", false);
		io.sockets.to(playerTwoId).emit("isItMyTurn", true);
	}
}

var predefinedGameField = ["x", "x", "x", "x", "x", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x", "x", "x", "x", "o", "o", "o", "o", "x", "o", "o", "o", "o", "x", "o", "x", "x", "o", "x", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x", "x", "x", "x", "o", "o", "x", "x", "x", "o", "o", "o", "o", "x", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x", "x", "x", "x", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x", "x", "x", "x", "o", "o", "o", "o", "o", "o"];





