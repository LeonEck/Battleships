'use strict';

module.exports = MatchHandler;

/**
 * MatchHandler constructor
 * @param {String} playerOne socketId of the first player in the match
 * @param {Object} io        io io object to connect to clients
 */
function MatchHandler (playerOne, io) {
	this.io = io;

	this.playerOne = playerOne;
	this.playerTwo = '';
	this.gameFieldOne = ["x1", "x1", "x1", "x1", "x1", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x2", "x2", "x2", "x3", "o", "o", "o", "o", "x5", "o", "o", "o", "o", "x3", "o", "x4", "x4", "o", "x5", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x9", "x9", "x9", "x6", "o", "o", "x7", "x7", "x7", "o", "o", "o", "o", "x6", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x0", "x0", "x0", "x0", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x8", "x8", "x8", "x8", "o", "o", "o", "o", "o", "o"];
	this.gameFieldTwo = [];
	this.playerWhosMoveItIs = playerOne;
	this.playerWhoWon = 'none';
}

/**
 * Check if the match already has two players in it
 * @return {Boolean} True if there are two players in the game
 */
MatchHandler.prototype.isFull = function () {
	return (this.playerOne !== '' && this.playerTwo !== '');
};

/**
 * Check if a given socketId is one of the players in the game
 * @param  {String}  possiblePlayerId socketId of a player to check
 * @return {Boolean}                  True if the given player is in this match
 */
MatchHandler.prototype.isAPlayerOfThisMatch = function (possiblePlayerId) {
	return (this.playerOne === possiblePlayerId || this.playerTwo === possiblePlayerId);
};

/**
 * Add a new player to this game and start the game
 * @param {String} socketId socketId of the player to add
 */
MatchHandler.prototype.addPlayer = function (socketId) {
	this.playerTwo = socketId;
	this.gameFieldTwo = ["x1", "x1", "x1", "x1", "x1", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x2", "x2", "x2", "x3", "o", "o", "o", "o", "x5", "o", "o", "o", "o", "x3", "o", "x4", "x4", "o", "x5", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x9", "x9", "x9", "x6", "o", "o", "x7", "x7", "x7", "o", "o", "o", "o", "x6", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x0", "x0", "x0", "x0", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x8", "x8", "x8", "x8", "o", "o", "o", "o", "o", "o"];
	this.io.sockets.to(this.playerOne).emit('gameIsStarting', true);
	this.io.sockets.to(this.playerTwo).emit('gameIsStarting', true);
	this.sendGameItsInformations();
};

/**
 * Handles when a player clicks on his opponents game field
 * @param {Number} socketId socketId
 * @param  {Number} fieldId Index of the game field array where the player clicked
 */
MatchHandler.prototype.clickOnOpponentGameField = function (socketId, fieldId) {
	try {
		if (!this._isItThisPlayersTurn(socketId)) {
			return;
		}
		// Get a reference for the opponent game field
		let affectedGameField = this.getOpponentGameField(socketId);

		// Filter out clicks on 'disabled' fields
		if (affectedGameField[fieldId] === 'd' || affectedGameField[fieldId] === 'z' || affectedGameField[fieldId] === 'k') {
			return;
		}

		// Check if the player clicked on a ship or water
		if (affectedGameField[fieldId].substring(0, 1) === 'x') {
			let shipId = affectedGameField[fieldId].substring(1, 2);
			affectedGameField[fieldId] = 'd' + shipId;
			// Check if all ship parts of this ship have been destroyed
			let allDestroyed = true;
			for (let i = 0; i < affectedGameField.length; i++) {
				if (affectedGameField[i].substring(0, 1) === 'x' && affectedGameField[i].substring(1, 2) === shipId) {
					allDestroyed = false;
				}
			}
			if (allDestroyed) {
				for (let i = 0; i < affectedGameField.length; i++) {
					if (affectedGameField[i].substring(0, 1) === 'd' && affectedGameField[i].substring(1, 2) === shipId) {
						affectedGameField[i] = 'k';
					}
				}
			}
		} else {
			affectedGameField[fieldId] = 'z';
			this.passTurnOn();
		}

		// Check if the affected game field has no more ship parts
		let noMoreShipParts = true;
		for (let i = 0; i < affectedGameField.length; i++) {
			if (affectedGameField[i].substring(0, 1) === 'd' || affectedGameField[i].substring(0, 1) === 'x') {
				noMoreShipParts = false;
			}
		}

		if (noMoreShipParts) {
			this.playerWhoWon = socketId;
		}
	} catch (error) {
		console.log(error, 'ClickOnOpponentGameField - ERROR');
	}
};

MatchHandler.prototype.passTurnOn = function () {
	if (this.playerWhosMoveItIs === this.playerOne) {
		this.playerWhosMoveItIs = this.playerTwo;
	} else {
		this.playerWhosMoveItIs = this.playerOne;
	}
};

/**
 * Return the game field of the opposite player that was passed in
 * @param  {Number} socketId socketId
 * @return {Array}          Opponent game field
 */
 MatchHandler.prototype.getOpponentGameField = function (socketId) {
	if (socketId === this.playerOne) {
		return this.gameFieldTwo;
	} else {
		return this.gameFieldOne;
	}
};

MatchHandler.prototype.sendGameItsInformations = function () {
	this.io.sockets.to(this.playerOne).emit('gameField', this.gameFieldOne);
	this.io.sockets.to(this.playerTwo).emit('gameField', this.gameFieldTwo);

	// Send the player the opponent game fields but with all ships displayed as water
	// and all id references removed
	let playerOneGameField = this.gameFieldOne.slice();
	let playerTwoGameField = this.gameFieldTwo.slice();
	for (let i = 0; i < playerOneGameField.length; i++) {
		if (playerOneGameField[i].substring(0, 1) === 'x') {
			playerOneGameField[i] = 'o';
		}
		if (playerOneGameField[i].substring(0, 1) === 'd') {
			playerOneGameField[i] = 'd';
		}
	}
	for (let i = 0; i < playerTwoGameField.length; i++) {
		if (playerTwoGameField[i].substring(0, 1) === 'x') {
			playerTwoGameField[i] = 'o';
		}
		if (playerTwoGameField[i].substring(0, 1) === 'd') {
			playerTwoGameField[i] = 'd';
		}
	}

	this.io.sockets.to(this.playerOne).emit('opponentGameField', playerTwoGameField);
	this.io.sockets.to(this.playerTwo).emit('opponentGameField', playerOneGameField);

	if (this.playerWhoWon === 'none') {
		if (this.playerOne === this.playerWhosMoveItIs) {
			this.io.sockets.to(this.playerOne).emit('isItMyTurn', true);
			this.io.sockets.to(this.playerTwo).emit('isItMyTurn', false);
		} else {
			this.io.sockets.to(this.playerOne).emit('isItMyTurn', false);
			this.io.sockets.to(this.playerTwo).emit('isItMyTurn', true);
		}
	} else {
		// Send out winning/loosing infos
		this.io.sockets.to(this.playerWhoWon).emit('won', true);
		if (this.playerWhoWon === this.playerOne) {
			this.io.sockets.to(this.playerTwo).emit('won', false);
		} else {
			this.io.sockets.to(this.playerOne).emit('won', false);
		}
	}
};

MatchHandler.prototype.closeMatch = function () {
	this.io.sockets.to(this.playerTwo).emit("gameIsAborted", true);
	this.io.sockets.to(this.playerOne).emit("gameIsAborted", true);
};

/**
 * Check if the given player has the right to move
 * @param  {String}  socketId SocketId of the player to check
 * @return {Boolean}          True if the given player has the right to move
 */
MatchHandler.prototype._isItThisPlayersTurn = function (socketId) {
  return socketId === this.playerWhosMoveItIs;
};
