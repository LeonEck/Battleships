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
	this.lobbyBuffer = [];
	this.leaversBuffer = [];
	this.runningMatches = new Map();
	/**
	 * Stores a players Socket.id and his gameId in the runningMatches Map
	 * @type {Map}
	 */
	this.perPlayerInformation = new Map();

	this.predefinedGameField = ["x1", "x1", "x1", "x1", "x1", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x2", "x2", "x2", "x3", "o", "o", "o", "o", "x5", "o", "o", "o", "o", "x3", "o", "x4", "x4", "o", "x5", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x9", "x9", "x9", "x6", "o", "o", "x7", "x7", "x7", "o", "o", "o", "o", "x6", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x0", "x0", "x0", "x0", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x8", "x8", "x8", "x8", "o", "o", "o", "o", "o", "o"];

}


GameHandler.prototype.playerJoined = function (socketId) {
	this.lobbyBuffer.push(socketId);
	console.log(socketId + " added to lobby");
};

GameHandler.prototype.checkLobby = function () {
	if (this.leaversBuffer.length > 0) {
		return;
	}
	if (this.lobbyBuffer.length >= 2) {
		let firstPlayer = this.lobbyBuffer.pop();
		let secondPlayer = this.lobbyBuffer.pop();
		let gameId = this._createNewGame(firstPlayer, secondPlayer);
		console.log("Creating game: " + gameId);
		this.perPlayerInformation.set(firstPlayer, gameId);
		this.perPlayerInformation.set(secondPlayer, gameId);
		console.log(firstPlayer + " + " + secondPlayer + " - game created");
	}
};

GameHandler.prototype.playerLeftGame = function (socketId) {
	this.leaversBuffer.push(socketId);
	console.log(socketId + " added to leaver buffer");
};

GameHandler.prototype.checkLeavers = function () {
	if (this.leaversBuffer.length > 0) {
		let leaverId = this.leaversBuffer.pop();
		let indexInLobbyBuffer = this.lobbyBuffer.indexOf(leaverId);
		if (indexInLobbyBuffer !== -1) {
			this.lobbyBuffer.splice(indexInLobbyBuffer, 1);
		} else {
			try {
				let gameId = this.perPlayerInformation.get(leaverId);
				let affectedMatch = this.runningMatches.get(gameId);
				let playerOne = affectedMatch.playerOne;
				let playerTwo = affectedMatch.playerTwo;
				affectedMatch.closeMatch(leaverId);
				this.perPlayerInformation.delete(playerOne);
				this.perPlayerInformation.delete(playerTwo);
				this.runningMatches.delete(gameId);
				console.log("Cleared game: " + gameId);
				if (affectedMatch.playerOne === leaverId) {
					this.playerJoined(playerTwo);
				} else {
					this.playerJoined(playerOne);
				}
			} catch (error) {
				console.log(error, "Disconnect - ERROR");
			}
		}
		console.log(leaverId + " leaving handled");
		if (this.leaversBuffer.length > 0) {
			this.checkLeavers();
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
