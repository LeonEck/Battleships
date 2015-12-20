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

server.listen(8000);

describe('MatchHandler Test', function () {

  let matchHandler;

  beforeEach(function () {
    matchHandler = new MatchHandler('abc', io);
  });

  describe('isFull', function () {
    it('true', function () {
      matchHandler.addPlayer("123");
      assert.strictEqual(matchHandler.isFull(), true, 'Game has two players');
    });

    it('false', function () {
      assert.strictEqual(matchHandler.isFull(), false, 'Game has only one player');
    });
  });

  describe('isAPlayerOfThisMatch', function () {
    it('true', function () {
      assert.strictEqual(matchHandler.isAPlayerOfThisMatch('abc'), true, 'abc is a player of the game');
    });

    it('false', function () {
      assert.strictEqual(matchHandler.isAPlayerOfThisMatch('def'), false, 'def is not a player of the game');
    });
  });

});
