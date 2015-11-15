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
	var characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
	var gameFieldHtml = "<table><tr><td class='gameFieldHeaderSquare'></td>";
	for(var i = 1; i <= 10; i++) {
		gameFieldHtml += "<td class='gameFieldHeaderSquare'>" + i + "</td>";
	}
	gameFieldHtml += "</tr>"
	for(var i = 0; i < 10; i++) {
		gameFieldHtml += "<tr><td class='gameFieldHeaderSquare'>" + characters[i] + "</td>";
		for(var j = 0; j < 10; j++) {
			gameFieldHtml += "<td class='gameFieldSquare'></td>";
		}
		gameFieldHtml += "</tr>";
	}
	gameFieldHtml += "</table>"
	$(".gameField").append(gameFieldHtml);
}