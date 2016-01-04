'use strict';
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

  socket.on('searchingForGame', () => {
    gameHandler.playerSearchingForGame(socket.id);
  });

	socket.on('disconnect', () => {
		gameHandler.closeMatch(socket.id, true);
	});

  socket.on('getRandomGameField', () => {
    if (gameHandler.isThisPlayerInAnyMatch(socket.id)) {
      gameHandler.getMatch(socket.id).generateNewGameFieldForPlayer(socket.id);
    }
  });

  socket.on('validatePlayersGameField', (data) => {
    if (gameHandler.isThisPlayerInAnyMatch(socket.id)) {
      gameHandler.getMatch(socket.id).validateGameFieldForPlayer(data, socket.id);
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
