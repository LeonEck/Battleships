/**
 * The GameHandler is responsible for matching players together in a new game
 * He creates new games(MatchHandler) and destroys them when they aren't necessary an more
 */

"use strict";

let MatchHandler = require("./MatchHandler");

module.exports = GameHandler;

function GameHandler (io) {
	this.io = io;

	/**
	 * Since this is a two player game, one player has to wait for another to connect
	 * 	the player waiting is stored in this buffer
	 * @type {String}
	 */
	this.lobbyBuffer = "";
	this.runningMatches = new Map();
	/**
	 * Stores a players Socket.id and his gameId in the runningMatches Map
	 * @type {Map}
	 */
	this.perPlayerInformation = new Map();

	this.predefinedGameField = ["x1", "x1", "x1", "x1", "x1", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x2", "x2", "x2", "x3", "o", "o", "o", "o", "x5", "o", "o", "o", "o", "x3", "o", "x4", "x4", "o", "x5", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x9", "x9", "x9", "x6", "o", "o", "x7", "x7", "x7", "o", "o", "o", "o", "x6", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x0", "x0", "x0", "x0", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x8", "x8", "x8", "x8", "o", "o", "o", "o", "o", "o"];
}


GameHandler.prototype.playerSearchingForGame = function (socketId) {
	if (this.lobbyBuffer === "") {
		this.lobbyBuffer = socketId;
	} else {
		let gameId = this._createNewGame(socketId, this.lobbyBuffer);
		console.log("Creating game: " + gameId);
		this.perPlayerInformation.set(socketId, gameId);
		this.perPlayerInformation.set(this.lobbyBuffer, gameId);
		this.lobbyBuffer = "";
	}
};

GameHandler.prototype.playerLeftGame = function (socketId) {
	if (socketId === this.lobbyBuffer) {
		this.lobbyBuffer = "";
	} else {
		try {
			let gameId = this.perPlayerInformation.get(socketId);
			/*if (gameId === undefined) {
				console.log(socketId);
				return;
			}*/
			let affectedMatch = this.runningMatches.get(gameId);
			console.log("Clearing game: " + gameId);
			affectedMatch.closeMatch(socketId);
			this.perPlayerInformation.delete(affectedMatch.playerOne);
			this.perPlayerInformation.delete(affectedMatch.playerTwo);
			if (affectedMatch.playerOne === socketId) {
				this.playerSearchingForGame(affectedMatch.playerTwo);
			} else {
				this.playerSearchingForGame(affectedMatch.playerOne);
			}
			this.runningMatches.delete(gameId);
		} catch (error) {
			console.log(error, "Disconnect - ERROR");
		}
	}
};

/**
 * Create new game with the two players it gets passed
 * @param  {String} playerOneId SocketId of player one
 * @param  {String} playerTwoId SocketId of player two
 * @return {Number}             Id of the created game
 */
GameHandler.prototype._createNewGame = function (playerOneId, playerTwoId) {
	this.runningMatches.set(this.runningMatches.size,	new MatchHandler(playerOneId, playerTwoId, this.predefinedGameField, this.predefinedGameField, this.io));

	return this.runningMatches.size - 1;
};

GameHandler.prototype.getMatch = function (socketIdOfAPlayer) {
	return this.runningMatches.get(this.perPlayerInformation.get(socketIdOfAPlayer));
};
