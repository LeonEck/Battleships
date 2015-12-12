'use strict';

module.exports = MatchHandler;

function MatchHandler (playerOne, playerTwo, gameFieldOne, gameFieldTwo, io) {
	this.io = io;

	this.playerOne = playerOne;
	this.playerTwo = playerTwo;
	this.gameFieldOne = gameFieldOne.slice();
	this.gameFieldTwo = gameFieldTwo.slice();
	this.playerWhosMoveItIs = playerOne;
	this.playerWhoWon = 'none';

	io.sockets.to(playerOne).emit('gameIsStarting', true);
	io.sockets.to(playerTwo).emit('gameIsStarting', true);

	this.sendGameItsInformations();
}

/**
 * Handles when a player clicks on his opponents game field
 * @param {Number} socketId socketId
 * @param  {Number} fieldId Index of the game field array where the player clicked
 */
MatchHandler.prototype.clickOnOpponentGameField = function (socketId, fieldId) {
	try {
		// Check if the player has the right to move
		if (socketId !== this.playerWhosMoveItIs) {
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

MatchHandler.prototype.closeMatch = function (playerWhichLeft) {
	if (this.playerOne === playerWhichLeft) {
		this.io.sockets.to(this.playerTwo).emit("gameIsAborted", true);
	} else {
		this.io.sockets.to(this.playerOne).emit("gameIsAborted", true);
	}
};
