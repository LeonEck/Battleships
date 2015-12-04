/**
 * The GameHandler is responsible for matching players together in a new game
 * He creates new games(MatchHandler) and destroys them when they aren't necessary an more
 */

"use strict";

var handler = require("./includes/MatchHandler");

module.exports = {
	GameHandler: function () {
		var lobbyBuffer = "";
		var runningGames = new Map();
		/**
		 * Stores a players Socket.id and his gameId in the runningGames Map
		 * @type {Map}
		 */
		var perPlayerInformation = new Map();

		this.playerSearchingForGame = function (socketId) {
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
	}
};
