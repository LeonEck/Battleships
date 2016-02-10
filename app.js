'use strict';
let logger = require('./includes/Logger');
let GameHandler = require('./includes/GameHandler');

let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);

server.listen(8000);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/'));

let gameHandler = new GameHandler(io);

io.sockets.on('connection', (socket) => {

  logger.info('Client(' + socket.id + ') connected');

  socket.on('searchingForGame', () => {
    logger.info('Client(' + socket.id + ') is searching for a game');
    gameHandler.playerSearchingForGame(socket.id);
  });

	socket.on('disconnect', () => {
    logger.info('Client(' + socket.id + ') disconnected');
    gameHandler.closeMatch(socket.id, true);
	});

  socket.on('chatMessage', (message) => {
    if (!message || message.length === 0) {
      return;
    }
    io.emit('newChatMessage', message);
    logger.debug('Client(' + socket.id + ') send this chat message: ' + message);
  });

  socket.on('getRandomGameField', () => {
    if (gameHandler.isThisPlayerInAnyMatch(socket.id)) {
      gameHandler.getMatch(socket.id).generateNewGameFieldForPlayer(socket.id);
      logger.debug('Client(' + socket.id + ') got send a new game field');
    }
  });

  socket.on('playerIsReady', () => {
    if (gameHandler.isThisPlayerInAnyMatch(socket.id)) {
      logger.debug('Client(' + socket.id + ') is ready to play');
      gameHandler.getMatch(socket.id).playerIsReady(socket.id);
    }
  });

	socket.on('clickOnOpponentGameField', (data) => {
    if (gameHandler.isThisPlayerInAnyMatch(socket.id)) {
  		if (gameHandler.getMatch(socket.id).clickOnOpponentGameField(socket.id, data)) {
        gameHandler.closeMatch(socket.id, false);
      }
    }
	});

});
