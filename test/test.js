var assert = require('assert');
var io = require('socket.io-client');

describe('Join and leave handling', function () {

    it('A player can join', function (done) {
        var testClient = io.connect('http://localhost:8000', {
            'reconnection delay': 0
            , 'reopen delay': 0
            , 'force new connection': true
        });

        testClient.on('connect', function (data) {
            assert.equal(true, true, "Connection established");
            testClient.disconnect();
            done();
        });
    });

    it('When a player connects and there is already one waiting than the game should start for the player who connected last', function (done) {
        var dummyClient = io.connect('http://localhost:8000', {
            'reconnection delay': 0
            , 'reopen delay': 0
            , 'force new connection': true
        });
        var testClient = io.connect('http://localhost:8000', {
            'reconnection delay': 0
            , 'reopen delay': 0
            , 'force new connection': true
        });

        testClient.on('connect', function (data) {
            testClient.on('gameIsStarting', function (data) {
                assert.equal(data, true, "Game is starting");
                testClient.disconnect();
                dummyClient.disconnect();
                done();
            });
        });
    });
});