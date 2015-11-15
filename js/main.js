$(document).ready(function () {
	var socket = io.connect();

	generateGameFields();

	socket.on("gameIsStarting", function (data) {
		$("#lobbyContainer").hide();
		$("#gameContainer").show();
	});

	socket.on("gameIsAborted", function (data) {
		$("#lobbyContainer").show();
		$("#gameContainer").hide();
	});

});

function generateGameFields () {
	var gameFieldHtml = "";
	for(var i = 0; i < 10; i++) {
		gameFieldHtml += "<div class='gameFieldRow'>";
		for(var j = 0; j < 10; j++) {
			gameFieldHtml += "<div class='gameFieldSquare'></div>";
		}
		gameFieldHtml += "</div>";
	}

	$(".gameField").append(gameFieldHtml);
}