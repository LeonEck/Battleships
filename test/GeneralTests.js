"use strict";

let assert = require('assert');
let io = require('socket.io-client');

// Tests are deactivated because of move to ssl

/*describe('Connection testing', () => {

  it('should be able to connect to the server', (done) => {
    let clientOne = io.connect('http://localhost:8000', {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true
    });

    clientOne.on('connect', () => {
      assert.strictEqual(true, true, "Connection established");
      clientOne.disconnect();
      done();
    });
  });
});

describe('Play test', () => {

  let clientOne;
  let clientTwo;

  beforeEach((done) => {
    clientOne = io.connect('http://localhost:8000', {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true
    });

    clientOne.on('connect', () => {
      clientTwo = io.connect('http://localhost:8000', {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true
      });

      clientTwo.on('connect', () => {
        // Ensure that both clients are connected to the server before
        // continuing
        done();
      });
    });
  });

  it('should start the pre game when two players are searching for a game', (done) => {
    clientOne.emit('searchingForGame', true);
    clientTwo.emit('searchingForGame', true);
    clientTwo.on('preGame', () => {
      clientOne.disconnect();
      clientTwo.disconnect();
      done();
    });
  });

  it('should inform the players that there game has been aborted if one leaves', (done) => {
    clientOne.emit('searchingForGame', true);
    clientTwo.emit('searchingForGame', true);
    clientTwo.on('preGame', () => {
      clientTwo.disconnect();
      clientOne.on('gameIsAborted', () => {
        clientOne.disconnect();
        done();
      });
    });
  });


  describe('In game test', () => {

    beforeEach((done) => {
      clientOne.emit('searchingForGame', true);
      clientTwo.emit('searchingForGame', true);
      clientTwo.on('preGame', () => {
        done();
      });
    });

    afterEach(() => {
      clientOne.disconnect();
      clientTwo.disconnect();
    });

    it('should inform one player that he is waiting for his opponent if the first player already picked a game field but the second one did not', (done) => {
      clientOne.emit('playerIsReady', true);
      clientOne.on('waitingForOpponent', () => {
        done();
      });
    });

    it('should start the game when both players are ready', (done) => {
      clientOne.emit('playerIsReady', true);
      clientTwo.emit('playerIsReady', true);
      clientTwo.on('gameIsStarting', () => {
        done();
      });
    });

  });

  describe('Chat testing', () => {

    it('a message from one client should be send to another', (done) => {
      clientOne.emit('chatMessage', 'Test message');
      clientTwo.on('newChatMessage', (message) => {
        assert.strictEqual(message, 'Test message');
        done();
      });
    });

  });

});
*/
