"use strict";

module.exports = MatchHandler;

function MatchHandler (playerOne, playerTwo, gameFieldOne, gameFieldTwo) {
	this.playerOne = playerOne;
	this.playerTwo = playerTwo;
	this.gameFieldOne = gameFieldOne.slice();
	this.gameFieldTwo = gameFieldTwo.slice();
	this.playerWhosMoveItIs = playerOne;
	this.playerWhoWon = 'none';
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
		if (affectedGameField[fieldId] === "d" || affectedGameField[fieldId] === "z" || affectedGameField[fieldId] === "k") {
			return;
		}

		// Check if the player clicked on a ship or water
		if (affectedGameField[fieldId].substring(0, 1) === "x") {
			let shipId = affectedGameField[fieldId].substring(1, 2);
			affectedGameField[fieldId] = "d" + shipId;
			// Check if all ship parts of this ship have been destroyed
			let allDestroyed = true;
			for (let i = 0; i < affectedGameField.length; i++) {
				if (affectedGameField[i].substring(0, 1) === "x" && affectedGameField[i].substring(1, 2) === shipId) {
					allDestroyed = false;
				}
			}
			if (allDestroyed) {
				for (let i = 0; i < affectedGameField.length; i++) {
					if (affectedGameField[i].substring(0, 1) === "d" && affectedGameField[i].substring(1, 2) === shipId) {
						affectedGameField[i] = "k";
					}
				}
			}
		} else {
			affectedGameField[fieldId] = "z";
			this.passTurnOn();
		}

		// Check if the affected game field has no more ship parts
		let noMoreShipParts = true;
		for (let i = 0; i < affectedGameField.length; i++) {
			if (affectedGameField[i].substring(0, 1) === "d" || affectedGameField[i].substring(0, 1) === "x") {
				noMoreShipParts = false;
			}
		}

		if (noMoreShipParts) {
			this.playerWhoWon = socketId;
		}
	} catch (error) {
		console.log(error, "ClickOnOpponentGameField - ERROR");
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
