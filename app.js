var handler = require("./includes/MatchHandler");

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

io.sockets.on("connection", function (socket) {

	playerSearchingForGame(socket.id);

	socket.on("disconnect", function () {
		if (socket.id === lobbyBuffer) {
			// TODO: Wahrscheinlich doch wieder auf ein Array umsteigen
			lobbyBuffer = "";
		} else {
			var gameId = perPlayerInformation.get(socket.id);
			console.log("Clearing game: " + gameId);
			io.sockets.to(runningGames.get(gameId).playerOne).emit("gameIsAborted", true);
			io.sockets.to(runningGames.get(gameId).playerTwo).emit("gameIsAborted", true);
			perPlayerInformation.delete(runningGames.get(gameId).playerOne);
			perPlayerInformation.delete(runningGames.get(gameId).playerTwo);
			if (runningGames.get(gameId).playerOne === socket.id) {
				playerSearchingForGame(runningGames.get(gameId).playerTwo);
			} else {
				playerSearchingForGame(runningGames.get(gameId).playerOne);
			}
			runningGames.delete(gameId);
		}
	});

	socket.on("clickOnOpponentGameField", function (data) {
		var gameIdForPlayer = perPlayerInformation.get(socket.id);
		var affectedGameField;
		// Check if the player has the right to move
		if (socket.id !== runningGames.get(gameIdForPlayer).playerWhosMoveItIs) {
			return;
		}
		// Get a reference for the oppent game field 
		if (socket.id === runningGames.get(gameIdForPlayer).playerOne) {
			affectedGameField = runningGames.get(gameIdForPlayer).gameFieldTwo;
		} else {
			affectedGameField = runningGames.get(gameIdForPlayer).gameFieldOne;
		}
		
		// Filter out clicks on 'disabled' fields
		if (affectedGameField[data] === "d" || affectedGameField[data] === "z" || affectedGameField[data] === "k") {
			return;
		}
		
		// Check if the player clicked on a ship or water
		if (affectedGameField[data] === "x") {
			affectedGameField[data] = "d";
		} else {
			affectedGameField[data] = "z";
			runningGames.get(gameIdForPlayer).passTurnOn();
		}

		sendRunningGameItsInformations(gameIdForPlayer);
	});

});

function playerSearchingForGame(socketId) {
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

function createNewGame(playerOneId, playerTwoId) {
	runningGames.set(runningGames.size,
		new handler.MatchHandler(playerOneId, playerTwoId, predefinedGameField, predefinedGameField)
		);

	io.sockets.to(playerOneId).emit("gameIsStarting", true);
	io.sockets.to(playerTwoId).emit("gameIsStarting", true);

	sendRunningGameItsInformations(runningGames.size - 1);

	return runningGames.size - 1;
}

function sendRunningGameItsInformations(gameId) {
	var playerOneId = runningGames.get(gameId).playerOne;
	var playerTwoId = runningGames.get(gameId).playerTwo;

	io.sockets.to(playerOneId).emit("gameField", runningGames.get(gameId).gameFieldOne);
	io.sockets.to(playerTwoId).emit("gameField", runningGames.get(gameId).gameFieldTwo);
	
	// Send the player the opponent game fields but with all ships displayed as water
	var playerOneGameField = runningGames.get(gameId).gameFieldOne.slice();
	var playerTwoGameField = runningGames.get(gameId).gameFieldTwo.slice();
	for(var i = 0; i < playerOneGameField.length; i++) {
		if (playerOneGameField[i] === "x") {
			playerOneGameField[i] = "o";
		}
	}
	for(var i = 0; i < playerTwoGameField.length; i++) {
		if (playerTwoGameField[i] === "x") {
			playerTwoGameField[i] = "o";
		}
	}
	
	io.sockets.to(playerOneId).emit("opponentGameField", playerTwoGameField);
	io.sockets.to(playerTwoId).emit("opponentGameField", playerOneGameField);

	if (playerOneId === runningGames.get(gameId).playerWhosMoveItIs) {
		io.sockets.to(playerOneId).emit("isItMyTurn", true);
		io.sockets.to(playerTwoId).emit("isItMyTurn", false);
	} else {
		io.sockets.to(playerOneId).emit("isItMyTurn", false);
		io.sockets.to(playerTwoId).emit("isItMyTurn", true);
	}
}

var predefinedGameField = ["x", "x", "x", "x", "x", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x", "x", "x", "x", "o", "o", "o", "o", "x", "o", "o", "o", "o", "x", "o", "x", "x", "o", "x", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x", "x", "x", "x", "o", "o", "x", "x", "x", "o", "o", "o", "o", "x", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x", "x", "x", "x", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x", "x", "x", "x", "o", "o", "o", "o", "o", "o"];






