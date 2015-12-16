"use strict";

var assert = require('assert');
var io = require('socket.io-client');

describe('Test basic game operations individually', function () {

    var clientOne;
    var clientTwo;

    before(function (done) {
        clientOne = io.connect('http://localhost:8000', {
            'force new connection': true
        });

        clientOne.on('connect', function () {
            console.log("Client one connected");
            done();
        });
    });

    after(function (done) {
        if (clientOne.connected) {
            clientOne.disconnect();
            console.log("Client one disconnected");
        }
        done();
    });

    beforeEach(function (done) {
        clientTwo = io.connect('http://localhost:8000', {
            'force new connection': true
        });

        clientTwo.on('connect', function () {
            console.log("Client two connected");
        });

        clientTwo.on('gameIsStarting', function () {
            console.log("Client two game started");
            done();
        });
    });

    afterEach(function (done) {
        if (clientTwo.connected) {
            clientTwo.disconnect();
            console.log("Client two disconnected");
        }
        done();
    });

    it('Player who connects last has the first move', function (done) {
        clientTwo.on('isItMyTurn', function (data) {
            assert.strictEqual(data, true, 'Player two has the first move');
            done();
        });
    });

    it('Players get send their own game field', function (done) {
        clientTwo.on('gameField', function (data) {
            let expectedValue = ["x1", "x1", "x1", "x1", "x1", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x2", "x2", "x2", "x3", "o", "o", "o", "o", "x5", "o", "o", "o", "o", "x3", "o", "x4", "x4", "o", "x5", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x9", "x9", "x9", "x6", "o", "o", "x7", "x7", "x7", "o", "o", "o", "o", "x6", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x0", "x0", "x0", "x0", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x8", "x8", "x8", "x8", "o", "o", "o", "o", "o", "o"];
            assert.deepEqual(data, expectedValue, 'Game field should equal predefined game field');
            done();
        });
    });

    it('Players get send their opponent game field', function (done) {
        clientTwo.on('opponentGameField', function (data) {
            let expectedValue = ["o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o"];
            assert.deepEqual(data, expectedValue, 'Game field should only be filled with water');
            done();
        });
    });

    it('Player who clicked a ship part (id=0 "o") results in getting a new game field where this position is a "shipPartHit" now ("d")', function (done) {
        clientTwo.emit('clickOnOpponentGameField', 0);
        clientTwo.on('opponentGameField', function (data) {
            let expectedValue = ["d", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o"];
            // This condition is necessary because it ignores the initial game field where the first field is water
            if (data[0] !== 'o') {
                assert.deepEqual(data, expectedValue, 'Field 0 is now a "shipPartHit"');
                done();
            }
        });
    });

    it('If a player hits a ship part the turn is not passed on', function (done) {
        clientTwo.emit('clickOnOpponentGameField', 0);
        let turnCounter = 0; // Goes up every time a player gets send the "isItMyTurn" socket
        clientTwo.on('isItMyTurn', function (data) {
            turnCounter++;
            if (turnCounter === 2) {
                assert.ok(data, 'Player two still has the right to play');
                done();
            }
        });
    });

    it('If a player whos move it is clicks not on a ship part the turn is passed on', function (done) {
        clientTwo.emit('clickOnOpponentGameField', 5);
        clientOne.on('isItMyTurn', function (data) {
            // If the turn is not passed on the test will fail with a timeout
            if (data !== false) {
                assert.ok(data, 'Player one now has the right to move');
                done();
            }
        });
    });

    it('If a player hits a ship part the opponent gets a damage indication on his game field', function (done) {
        clientTwo.emit('clickOnOpponentGameField', 0);
        clientOne.on('gameField', function (data) {
            let expectedValue = ["d1", "x1", "x1", "x1", "x1", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x2", "x2", "x2", "x3", "o", "o", "o", "o", "x5", "o", "o", "o", "o", "x3", "o", "x4", "x4", "o", "x5", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x9", "x9", "x9", "x6", "o", "o", "x7", "x7", "x7", "o", "o", "o", "o", "x6", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x0", "x0", "x0", "x0", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "x8", "x8", "x8", "x8", "o", "o", "o", "o", "o", "o"];
            // This condition is necessary because it ignores the initial game field where the first field is water
            if (data[0] !== 'x1') {
                assert.deepEqual(data, expectedValue, 'Field 0 is now a "shipPartHit"');
                done();
            }
        });
    });

});

