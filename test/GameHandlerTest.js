"use strict";

let assert = require('assert');
let GameHandler = require("../includes/GameHandler");

describe('GameHandler Test', () => {

  //////////////////////////////////////////////
  /// This is necessary to mock the io object //
  //////////////////////////////////////////////
  let express = require("express");
  let app = express();
  let server = require("http").createServer(app);
  let io = require("socket.io").listen(server);

  server.listen(8001);

  let gameHandler;

  beforeEach(() => {
    gameHandler = new GameHandler(io);
  });

  describe('getMatch', () => {
    it('should return a match which contains the players that joined', () => {
      gameHandler.playerSearchingForGame('abc');
      gameHandler.playerSearchingForGame('def');
      const match = gameHandler.getMatch('abc');
      const bothInThere = match.isAPlayerOfThisMatch('abc') && match.isAPlayerOfThisMatch('def');
      assert.strictEqual(bothInThere, true, 'Match contains both players');
    });
  });

  describe('isThisPlayerInAnyMatch', () => {
    it('should return true if "abc" is a player in any match', () => {
      gameHandler.playerSearchingForGame('abc');
      assert.strictEqual(gameHandler.isThisPlayerInAnyMatch('abc'), true, 'abc is a player in a match');
    });

    it('should return false if "def" is not a player in any match', () => {
      assert.strictEqual(gameHandler.isThisPlayerInAnyMatch('def'), false, 'def is not a player in a match');
    });
  });

});
