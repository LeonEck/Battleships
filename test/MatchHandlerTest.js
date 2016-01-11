"use strict";

let assert = require('assert');
let MatchHandler = require("../includes/MatchHandler");

//////////////////////////////////////////////
/// This is necessary to mock the io object //
//////////////////////////////////////////////
let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io = require("socket.io").listen(server);

server.listen(8002);

describe('MatchHandler Test', () => {

  let matchHandler;

  beforeEach(() => {
    matchHandler = new MatchHandler('abc', io);
  });

  describe('isFull & addPlayer', () => {
    it('should return true when a new player was added', () => {
      matchHandler.addPlayer("123");
      assert.strictEqual(matchHandler.isFull(), true, 'Game has two players');
    });

    it('should return false when there is only one player in the game', () => {
      assert.strictEqual(matchHandler.isFull(), false, 'Game has only one player');
    });
  });

  describe('isAPlayerOfThisMatch', () => {
    it('should return true if "abc" is a player of the match', () => {
      assert.strictEqual(matchHandler.isAPlayerOfThisMatch('abc'), true, 'abc is a player of the game');
    });

    it('should return false if "def" is not a player of this match', () => {
      assert.strictEqual(matchHandler.isAPlayerOfThisMatch('def'), false, 'def is not a player of the game');
    });
  });

});

server.close();
