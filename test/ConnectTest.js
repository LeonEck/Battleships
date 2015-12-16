"use strict";

var assert = require('assert');
var io = require('socket.io-client');

describe('Join and leave handling', function () {

    it('A player can join', function (done) {
        var clientOne = io.connect('http://localhost:8000', {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true
        });

        clientOne.on('connect', function () {
            assert.strictEqual(true, true, "Connection established");
            clientOne.disconnect();
            done();
        });
    });

    it('When a player connects and there is already one waiting than the game should start for the player who connected last', function (done) {
        var clientOne = io.connect('http://localhost:8000', {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true
        });
        var clientTwo = io.connect('http://localhost:8000', {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true
        });

        clientTwo.on('gameIsStarting', function (data) {
            assert.strictEqual(data, true, "Game is starting");
            clientOne.disconnect();
            clientTwo.disconnect();
            done();
        });
    });

    it('If one player leaves the game than the other player gets a "gameIsAborted" message', function (done) {
        var clientOne = io.connect('http://localhost:8000', {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true
        });
        var clientTwo = io.connect('http://localhost:8000', {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true
        });

        clientOne.on('gameIsStarting', function () {
        	clientOne.disconnect();
        });

        clientTwo.on('gameIsAborted', function (data) {
            assert.strictEqual(data, true, 'Game ist aborted');
            clientTwo.disconnect();
            done();
        });
    });
});

