'use strict';

module.exports = MatchHandler;

/**
 * MatchHandler constructor
 * @param {String} playerOne socketId of the first player in the match
 * @param {Object} io        io object to connect to clients
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
  this.startMatch();
};

/**
 * Inform the players that the game is starting and send them initial information
 */
MatchHandler.prototype.startMatch = function () {
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
		let affectedGameField = this._getOpponentGameField(socketId);

		if (this._isNotClickableField(affectedGameField[fieldId])) {
			return;
		}

		if (this._isShip(affectedGameField[fieldId])) {
			this._clickOnShippart(affectedGameField, fieldId);
		} else {
			affectedGameField[fieldId] = 'z';
			this._passTurnOn();
		}

		if (!this._areShipPartsLeft(affectedGameField)) {
			this.playerWhoWon = socketId;
		}
	} catch (error) {
		console.log(error, 'ClickOnOpponentGameField - ERROR');
	}
};

/**
 * Send this match its necessary information
 */
MatchHandler.prototype.sendGameItsInformations = function () {
	this.io.sockets.to(this.playerOne).emit('gameField', this.gameFieldOne);
	this.io.sockets.to(this.playerTwo).emit('gameField', this.gameFieldTwo);

	this.io.sockets.to(this.playerOne).emit('opponentGameField', this._removeShipsAndIdsFromGamefield(this.gameFieldTwo));
	this.io.sockets.to(this.playerTwo).emit('opponentGameField', this._removeShipsAndIdsFromGamefield(this.gameFieldOne));

	if (this.playerWhoWon === 'none') {
		this._sendOutTurnInformation();
	} else {
		this._sendOutWinningAndLoosingInformation();
	}
};

/**
 * Inform both players that their match has been closed
 */
MatchHandler.prototype.closeMatch = function () {
	this.io.sockets.to(this.playerTwo).emit("gameIsAborted", true);
	this.io.sockets.to(this.playerOne).emit("gameIsAborted", true);
};

/**
 * Return the game field of the opposite player that was passed in
 * @param  {Number} socketId socketId
 * @return {Array}          Opponent game field
 */
 MatchHandler.prototype._getOpponentGameField = function (socketId) {
  if (socketId === this.playerOne) {
    return this.gameFieldTwo;
  } else {
    return this.gameFieldOne;
  }
};

/**
 * Send both players if it is there turn
 */
MatchHandler.prototype._sendOutTurnInformation = function () {
  if (this.playerOne === this.playerWhosMoveItIs) {
    this.io.sockets.to(this.playerOne).emit('isItMyTurn', true);
    this.io.sockets.to(this.playerTwo).emit('isItMyTurn', false);
  } else {
    this.io.sockets.to(this.playerOne).emit('isItMyTurn', false);
    this.io.sockets.to(this.playerTwo).emit('isItMyTurn', true);
  }
};

/**
 * Send both players the information if they have won
 */
MatchHandler.prototype._sendOutWinningAndLoosingInformation = function () {
  this.io.sockets.to(this.playerWhoWon).emit('won', true);
  if (this.playerWhoWon === this.playerOne) {
    this.io.sockets.to(this.playerTwo).emit('won', false);
  } else {
    this.io.sockets.to(this.playerOne).emit('won', false);
  }
};

/**
 * Passes the turn on to the next player
 */
MatchHandler.prototype._passTurnOn = function () {
  if (this.playerWhosMoveItIs === this.playerOne) {
    this.playerWhosMoveItIs = this.playerTwo;
  } else {
    this.playerWhosMoveItIs = this.playerOne;
  }
};

/**
 * Takes in a game field and returns the same one, but with all undiscovered ship parts as water
 *   and without any IDs
 * @param  {Array} gameField Given game field
 * @return {Array}           New game field
 */
MatchHandler.prototype._removeShipsAndIdsFromGamefield = function (gameField) {
  let gameFieldCopy = gameField.slice();
  for (let i = 0; i < gameFieldCopy.length; i++) {
    // Change not yet found ship parts to water
    if (gameFieldCopy[i].substring(0, 1) === 'x') {
      gameFieldCopy[i] = 'o';
    }
    // Remove the IDs from hit ship parts
    if (gameFieldCopy[i].substring(0, 1) === 'd') {
      gameFieldCopy[i] = 'd';
    }
  }

  return gameFieldCopy;
};

/**
 * Check if the given player has the right to move
 * @param  {String}  socketId SocketId of the player to check
 * @return {Boolean}          True if the given player has the right to move
 */
MatchHandler.prototype._isItThisPlayersTurn = function (socketId) {
  return socketId === this.playerWhosMoveItIs;
};

/**
 * Checks if a given field value is of type 'not clickable'
 * @param  {String}  fieldValue Given field value to check
 * @return {Boolean}            True if the given value can not be clicked
 */
MatchHandler.prototype._isNotClickableField = function (fieldValue) {
  return fieldValue.substring(0, 1) === 'd' || fieldValue === 'z' || fieldValue === 'k';
};

/**
 * Checks if a given field value is of type 'ship'
 * @param  {String}  fieldValue Given field value to check
 * @return {Boolean}            True if the given value is a ship
 */
MatchHandler.prototype._isShip = function (fieldValue) {
  return fieldValue.substring(0, 1) === 'x';
};

/**
 * Performs the action behind a valid ship part click
 * @param  {Array} affectedGameField Game field
 * @param  {Number} fieldId           Index of hit ship part
 */
MatchHandler.prototype._clickOnShippart = function (affectedGameField, fieldId) {
  let shipId = affectedGameField[fieldId].substring(1, 2);
  affectedGameField[fieldId] = 'd' + shipId; // Marks field as a hit ship part

  if (this._isAShipCompletelyDestroyed(affectedGameField, shipId)) {
    this._markShipAsCompletelyDestroyed(affectedGameField, shipId);
  }
};

/**
 * Check if all parts of a given shipId have been destroyed
 * @param  {Array}  affectedGameField Game field
 * @param  {Number}  shipId            ShipId to check
 * @return {Boolean}                   True if a given shipId is completely destroyed
 */
MatchHandler.prototype._isAShipCompletelyDestroyed = function (affectedGameField, shipId) {
  for (let i = 0; i < affectedGameField.length; i++) {
    if (affectedGameField[i].substring(0, 1) === 'x' && affectedGameField[i].substring(1, 2) === shipId) {
      return false;
    }
  }

  return true;
};

/**
 * Marks all parts of a given ship as completely destroyed
 * @param  {Array} affectedGameField Game field
 * @param  {Number} shipId            Given shipId
 */
MatchHandler.prototype._markShipAsCompletelyDestroyed = function (affectedGameField, shipId) {
  for (let i = 0; i < affectedGameField.length; i++) {
    if (affectedGameField[i].substring(0, 1) === 'd' && affectedGameField[i].substring(1, 2) === shipId) {
      affectedGameField[i] = 'k';
    }
  }
};

/**
 * Check if there are any ship parts in a given game field
 * @param  {Array} affectedGameField Game field
 * @return {Boolean}                   True if there are still ship parts on the field
 */
MatchHandler.prototype._areShipPartsLeft = function (affectedGameField) {
  for (let i = 0; i < affectedGameField.length; i++) {
    if (affectedGameField[i].substring(0, 1) === 'd' || affectedGameField[i].substring(0, 1) === 'x') {
      return true;
    }
  }

  return false;
};
