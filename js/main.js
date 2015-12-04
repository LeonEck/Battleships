"use strict";
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
		$("myGameField .shipPart").removeClass("shipPart");
		for(var i = 0; i < data.length; i++) {
			switch (data[i].substring(0,1)) {
				case "x":
					$("#myGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("shipPart");
					break;

				case "d":
					$("#myGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("shipPartHit");
					break;

				case "z":
					$("#myGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("missed");
					break;

				case "k":
					$("#myGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("fullyDestroyedShip");
					break;

				default:
					break;
			}
		}
	});

	socket.on("opponentGameField", function (data) {
		$("#opponentGameField .shipPart").removeClass("shipPart");
		for(var i = 0; i < data.length; i++) {
			switch (data[i].substring(0,1)) {
				case "x":
					$("#opponentGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("shipPart");
					break;

				case "d":
					$("#opponentGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("shipPartHit");
					break;

				case "z":
					$("#opponentGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("missed");
					break;

				case "k":
					$("#opponentGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("fullyDestroyedShip");
					break;

				default:
					break;
			}
		}
	});

	socket.on("isItMyTurn", function (data) {
		if(data) {
			$("#myTitle").addClass("textRed");
			$("#opponentTitle").removeClass("textRed");
		} else {
			$("#myTitle").removeClass("textRed");
			$("#opponentTitle").addClass("textRed");
		}
	});

	socket.on("won", function (data) {
		if(data) {
			alert("You won!");
		} else {
			alert("You lost!");
		}
	});

	$(document).on("click", "#opponentGameField .gameFieldSquare", function () {
		socket.emit("clickOnOpponentGameField", $(this).attr("squareNumber"));
	});

});

function generateGameFields () {
	var characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
	var gameFieldHtml = "<table><tr><td class='gameFieldHeaderSquare'></td>";
	for(var i = 1; i <= 10; i++) {
		gameFieldHtml += "<td class='gameFieldHeaderSquare'>" + i + "</td>";
	}
	gameFieldHtml += "</tr>";
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
