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

	socket.on("gameField", function (data) {
		var gameFieldArray = data.split(", ");
		for(var i = 0; i < gameFieldArray.length; i++) {
			if(gameFieldArray[i] === "x") {
				$("#myGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("shipPart");
			}
		}
	});

});

function generateGameFields () {
	var characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
	var gameFieldHtml = "<table><tr><td class='gameFieldHeaderSquare'></td>";
	for(var i = 1; i <= 10; i++) {
		gameFieldHtml += "<td class='gameFieldHeaderSquare'>" + i + "</td>";
	}
	gameFieldHtml += "</tr>"
	var squareCount = 0;
	for(var i = 0; i < 10; i++) {
		gameFieldHtml += "<tr><td class='gameFieldHeaderSquare'>" + characters[i] + "</td>";
		for(var j = 0; j < 10; j++) {
			gameFieldHtml += "<td class='gameFieldSquare' squareNumber='" + squareCount + "'></td>";
			squareCount++;
		}
		gameFieldHtml += "</tr>";
	}
	gameFieldHtml += "</table>"
	$(".gameField").append(gameFieldHtml);
}