'use strict';

let GameField = require('./GameField');

class MatchHandler {
  /**
   * MatchHandler constructor
   * @param {String} playerOne socketId of the first player in the match
   * @param {Object} io        io object to connect to clients
   */
  constructor (playerOne, io) {
    this.io = io;

    this.playerOne = playerOne;
    this.playerTwo = '';
    this.gameFieldOne = new GameField(10);
    this.gameFieldTwo = new GameField(10);
    this.playerWhosMoveItIs = 'none';
    this.playerWhoWon = 'none';
  }

  /**
   * Check if the match already has two players in it
   * @return {Boolean} True if there are two players in the game
   */
  isFull () {
    return this.playerOne !== '' && this.playerTwo !== '';
  }

  /**
   * Check if a given socketId is one of the players in the game
   * @param  {String}  possiblePlayerId socketId of a player to check
   * @return {Boolean}                  True if the given player is in this match
   */
  isAPlayerOfThisMatch (possiblePlayerId) {
    return this.playerOne === possiblePlayerId || this.playerTwo === possiblePlayerId;
  }

  /**
   * Add a new player to this game and start the game
   * @param {String} socketId socketId of the player to add
   */
  addPlayer (socketId) {
    this.playerTwo = socketId;
    this._startPreGame();
  }

  /**
   * Generates a new random game field for the given player and sends it to him
   * @param  {String} socketId SocketId of the player to generate the game field for
   */
  generateNewGameFieldForPlayer (socketId) {
    if (socketId === this.playerOne) {
      if (!this.gameFieldOne.isLocked()) {
        this.gameFieldOne.generateGameField();
        this.io.sockets.to(this.playerOne).emit('gameField', this.gameFieldOne.makeFlatArray());
      }
    } else if (socketId === this.playerTwo) {
      if (!this.gameFieldTwo.isLocked()) {
        this.gameFieldTwo.generateGameField();
        this.io.sockets.to(this.playerTwo).emit('gameField', this.gameFieldTwo.makeFlatArray());
      }
    }
  }

  /**
   * Validates the given game field and assigns it to the given player if it is valid. When both players have valid game fields this method picks a random player to begin and starts the match
   * @param  {Array(String)} data     Given game field to validate
   * @param  {String} socketId Given player to validate the game field for
   */
  validateGameFieldForPlayer (data, socketId) {
    let validatorGameField = new GameField(10);

    if (!validatorGameField.isValidGameField(data)) {
      this.io.sockets.to(socketId).emit('gameFieldValid', false);
      return;
    }

    if (socketId === this.playerOne) {
      this.gameFieldOne.loadFlatArray(data);
      this.io.sockets.to(this.playerOne).emit('gameField', this.gameFieldOne.makeFlatArray());
      this.gameFieldOne.lock();
      this.io.sockets.to(this.playerOne).emit('gameFieldValid', true);
    } else if (socketId === this.playerTwo) {
      this.gameFieldTwo.loadFlatArray(data);
      this.io.sockets.to(this.playerTwo).emit('gameField', this.gameFieldTwo.makeFlatArray());
      this.gameFieldTwo.lock();
      this.io.sockets.to(this.playerTwo).emit('gameFieldValid', true);
    }

    if (this.gameFieldOne.isLocked() && this.gameFieldTwo.isLocked()) {
      const randomNumber = Math.floor((Math.random() * 10) + 1);
      if (randomNumber <= 5) {
        this.playerWhosMoveItIs = this.playerOne;
      } else {
        this.playerWhosMoveItIs = this.playerTwo;
      }
      this._startMatch();
    }
  }

  /**
   * Handles when a player clicks on his opponents game field
   * @param {Number} socketId socketId
   * @param {Number} fieldId Index of the game field array where the player clicked
   * @return {Boolean} Return true if the turn ended the game
   */
  clickOnOpponentGameField (socketId, fieldId) {
    if (!this._isItThisPlayersTurn(socketId)) {
      return;
    }

    // Get a reference for the opponent game field
    let affectedGameField = this._getOpponentGameField(socketId);

    if (!affectedGameField.isClickableField(fieldId)) {
      return;
    }

    if (affectedGameField.isIntactShip(fieldId)) {
      affectedGameField.clickOnShipPart(fieldId);
    } else {
      affectedGameField.setMissed(fieldId);
      this._passTurnOn();
    }

    if (!affectedGameField.areNotFullyDestroyedShipPartsLeft()) {
      this.playerWhoWon = socketId;
    }

    if (this._sendMatchItsInformations()) {
      return true;
    }
  }

  /**
   * Inform both players that their match has been closed
   */
  closeMatch () {
    this.io.sockets.to(this.playerTwo).emit('gameIsAborted', true);
    this.io.sockets.to(this.playerOne).emit('gameIsAborted', true);
  }

  /**
   * Send this match its necessary information
   * @return {Boolean} Returns true if someone won the match
   */
  _sendMatchItsInformations () {
    this.io.sockets.to(this.playerOne).emit('gameField', this.gameFieldOne.makeFlatArray());
    this.io.sockets.to(this.playerTwo).emit('gameField', this.gameFieldTwo.makeFlatArray());

    this.io.sockets.to(this.playerOne).emit('opponentGameField', this.gameFieldTwo.makeAnonymousFlatArray());
    this.io.sockets.to(this.playerTwo).emit('opponentGameField', this.gameFieldOne.makeAnonymousFlatArray());

    if (this.playerWhoWon === 'none') {
      this._sendOutTurnInformation();
    } else {
      this._sendOutWinningAndLoosingInformation();
      return true;
    }
  }

  /**
   * Inform both players that the game is in the pre game phase
   */
  _startPreGame () {
    this.io.sockets.to(this.playerTwo).emit('preGame', true);
    this.io.sockets.to(this.playerOne).emit('preGame', true);
  }

  /**
   * Inform the players that the game is starting and send them initial information
   */
  _startMatch () {
    this.io.sockets.to(this.playerOne).emit('gameIsStarting', true);
    this.io.sockets.to(this.playerTwo).emit('gameIsStarting', true);
    this._sendMatchItsInformations();
  }

  /**
   * Return the game field of the opposite player that was passed in
   * @param  {Number} socketId socketId
   * @return {Array}          Opponent game field
   */
   _getOpponentGameField (socketId) {
    if (socketId === this.playerOne) {
      return this.gameFieldTwo;
    } else {
      return this.gameFieldOne;
    }
  }

  /**
   * Send both players if it is there turn
   */
  _sendOutTurnInformation () {
    if (this.playerOne === this.playerWhosMoveItIs) {
      this.io.sockets.to(this.playerOne).emit('isItMyTurn', true);
      this.io.sockets.to(this.playerTwo).emit('isItMyTurn', false);
    } else {
      this.io.sockets.to(this.playerOne).emit('isItMyTurn', false);
      this.io.sockets.to(this.playerTwo).emit('isItMyTurn', true);
    }
  }

  /**
   * Send both players the information if they have won
   */
  _sendOutWinningAndLoosingInformation () {
    this.io.sockets.to(this.playerWhoWon).emit('won', true);
    if (this.playerWhoWon === this.playerOne) {
      this.io.sockets.to(this.playerTwo).emit('won', false);
    } else {
      this.io.sockets.to(this.playerOne).emit('won', false);
    }
  }

  /**
   * Passes the turn on to the next player
   */
  _passTurnOn () {
    if (this.playerWhosMoveItIs === this.playerOne) {
      this.playerWhosMoveItIs = this.playerTwo;
    } else {
      this.playerWhosMoveItIs = this.playerOne;
    }
  }

  /**
   * Check if the given player has the right to move
   * @param  {String}  socketId SocketId of the player to check
   * @return {Boolean}          True if the given player has the right to move
   */
  _isItThisPlayersTurn (socketId) {
    return socketId === this.playerWhosMoveItIs;
  }
}

module.exports = MatchHandler;
