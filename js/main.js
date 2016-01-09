'use strict';

$(document).ready(function () {
  var socket = io.connect();

  $(document).on('click', '#searchForGameButton', function () {
    $('#searchForGameButton').text('Searching for game...');
    socket.emit('searchingForGame', true);
  });

  $(document).on('click', '#getRandomGameFieldButton', function () {
    socket.emit('getRandomGameField', true);
  });

  $(document).on('click', '#readyToPlayButton', function () {
    socket.emit('playerIsReady', true);
  });

  $(document).on('click', '#opponentGameField .gameFieldSquare', function () {
    socket.emit('clickOnOpponentGameField', $(this).attr('squareNumber'));
  });

  socket.on('preGame', function () {
    $('#lobbyContainer').hide();
    hideAllAlerts();
    generateGameFields();
    $('#getRandomGameFieldButton').show();
    $('#readyToPlayButton').text('Ready to play...');
    $('#readyToPlayButton').removeClass('btn-success');
    $('#readyToPlayButton').addClass('btn-danger');
    $('#readyToPlayButton').show();
    $('#gameContainer').show();
    $('#opponentDisplay').hide();
    $('#opponentsShips').hide();
  });

  socket.on('waitingForOpponent', function () {
    $('#readyToPlayButton').removeClass('btn-danger');
    $('#readyToPlayButton').addClass('btn-success');
    $('#readyToPlayButton').text('Waiting for opponent...');
    showAlert('waitingForOpponent');
  });

  socket.on('gameIsStarting', function () {
    hideAllAlerts();
    $('#getRandomGameFieldButton').hide();
    $('#readyToPlayButton').hide();
    $('#opponentDisplay').show();
    $('#opponentsShips').show();
  });

  socket.on('gameIsAborted', function () {
    returnToLobbyWithAlert('gameWasClosed');
  });

  socket.on('gameField', function (data) {
    fillGameField('myGameField', data);
  });

  socket.on('opponentGameField', function (data) {
    fillGameField('opponentGameField', data);
  });

  socket.on('shipMap', function (data) {
    parseShipMapArray(data);
  });

  socket.on('isItMyTurn', function (data) {
    turnDisplay(data);
  });

  socket.on('won', function (data) {
    if (data) {
      returnToLobbyWithAlert('gameWon');
    } else {
      returnToLobbyWithAlert('gameLost');
    }
  });
});

function parseShipMapArray (data) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].isFullyDestroyed) {
      $('.shipMapKey[shipId="' + i + '"]').attr('src', 'img/Ship' + data[i].length + 'Destroyed.png');
    } else {
      $('.shipMapKey[shipId="' + i + '"]').attr('src', 'img/Ship' + data[i].length + 'Intact.png');
    }
  }
}

function generateGameFields () {
  $('.gameField').empty();
  var characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  var gameFieldHtml = '<table class="margin-auto"><tr><td class="gameFieldHeaderSquare"></td>';
  for(var i = 1; i <= 10; i++) {
    gameFieldHtml += '<td class="gameFieldHeaderSquare">' + i + '</td>';
  }
  gameFieldHtml += '</tr>';
  var squareCount = 0;
  for(var j = 0; j < 10; j++) {
    gameFieldHtml += '<tr><td class="gameFieldHeaderSquare">' + characters[j] + '</td>';
    for(var k = 0; k < 10; k++) {
      gameFieldHtml += '<td class="gameFieldSquare" squareNumber="' + squareCount + '"></td>';
      squareCount++;
    }
    gameFieldHtml += '</tr>';
  }
  gameFieldHtml += '</table>';
  $('.gameField').html(gameFieldHtml);
}

function fillGameField (targetGameField, data) {
  $('#' + targetGameField + ' .shipPart').removeClass('shipPart');
  for(var i = 0; i < data.length; i++) {
    switch (data[i]) {
      case 'i':
        $('#' + targetGameField + ' .gameFieldSquare[squareNumber=' + i + ']').addClass('shipPart');
        break;

      case 'h':
        $('#' + targetGameField + ' .gameFieldSquare[squareNumber=' + i + ']').addClass('shipPartHit');
        break;

      case 'm':
        $('#' + targetGameField + ' .gameFieldSquare[squareNumber=' + i + ']').addClass('missed');
        break;

      case 'd':
        $('#' + targetGameField + ' .gameFieldSquare[squareNumber=' + i + ']').addClass('fullyDestroyedShip');
        break;

      default:
        break;
    }
  }
}

function turnDisplay (isItMyTurn) {
  if (isItMyTurn) {
    $('#myTitle').addClass('text-danger');
    $('#myTitle').text('Your Turn *** My game field *** Your Turn');
    $('#opponentTitle').text('Opponents game field');
    $('#opponentTitle').removeClass('text-danger');
    $('#opponentGameField > table').addClass('tableRedBorder');
  } else {
    $('#myTitle').removeClass('text-danger');
    $('#opponentTitle').text('Opponents Turn - Opponents game field - Opponents Turn');
    $('#myTitle').text('My game field');
    $('#opponentTitle').addClass('text-danger');
    $('#opponentGameField > table').removeClass('tableRedBorder');
  }
}

function showAlert (alertToShow) {
  hideAllAlerts();
  switch (alertToShow) {
    case 'gameWasClosed':
      $('#gameWasClosedAlert').show();
      break;
    case 'gameWon':
      $('#gameWonAlert').show();
      break;
    case 'gameLost':
      $('#gameLostAlert').show();
      break;
    case 'waitingForOpponent':
      $('#waitingForOpponentAlert').show();
      break;
  }
}

function hideAllAlerts () {
  $('#gameWasClosedAlert').hide();
  $('#gameWonAlert').hide();
  $('#gameLostAlert').hide();
  $('#waitingForOpponentAlert').hide();
}

function returnToLobbyWithAlert (alertToShow) {
  $('#gameContainer').hide();
  showAlert(alertToShow);
  $('#searchForGameButton').text('Search for game');
  $('#lobbyContainer').show();
}
