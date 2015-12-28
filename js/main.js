'use strict';
$(document).ready(function () {
  var socket = io.connect();

  $(document).on('click', '#searchForGameButton', function () {
    $('#searchForGameButton').text('Searching for game...');
    socket.emit('searchingForGame', true);
  });

  $(document).on('click', '#opponentGameField .gameFieldSquare', function () {
    socket.emit('clickOnOpponentGameField', $(this).attr('squareNumber'));
  });

  socket.on('gameIsStarting', function () {
    $('#lobbyContainer').hide();
    generateGameFields();
    $('#gameContainer').show();
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

  socket.on('isItMyTurn', function (data) {
    if (data) {
      $('#myTitle').addClass('text-danger');
      $('#opponentTitle').removeClass('text-danger');
    } else {
      $('#myTitle').removeClass('text-danger');
      $('#opponentTitle').addClass('text-danger');
    }
  });

  socket.on('won', function (data) {
    if (data) {
      returnToLobbyWithAlert('gameWon');
    } else {
      returnToLobbyWithAlert('gameLost');
    }
  });



});

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
    switch (data[i].substring(0,1)) {
      case 'x':
        $('#' + targetGameField + ' .gameFieldSquare[squareNumber=' + i + ']').addClass('shipPart');
        break;

      case 'd':
        $('#' + targetGameField + ' .gameFieldSquare[squareNumber=' + i + ']').addClass('shipPartHit');
        break;

      case 'z':
        $('#' + targetGameField + ' .gameFieldSquare[squareNumber=' + i + ']').addClass('missed');
        break;

      case 'k':
        $('#' + targetGameField + ' .gameFieldSquare[squareNumber=' + i + ']').addClass('fullyDestroyedShip');
        break;

      default:
        break;
    }
  }
}

function showAlert (alertToShow) {
  $('#gameWasClosedAlert').hide();
  $('#gameWonAlert').hide();
  $('#gameLostAlert').hide();
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
  }
}

function returnToLobbyWithAlert (alertToShow) {
  $('#gameContainer').hide();
  showAlert(alertToShow);
  $('#searchForGameButton').text('Search for game');
  $('#lobbyContainer').show();
}
