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
		$(".shipPart").removeClass("shipPart");
		for(var i = 0; i < data.length; i++) {
			if(data[i] === "x") {
				$("#myGameField .gameFieldSquare[squareNumber=" + i + "]").addClass("shipPart");
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
	
	$(document).on("click", "#opponentGameField .gameFieldSquare", function () {
		//console.log($(this).attr("squareNumber"));
		socket.emit("clickOnOpponentGameField", $(this).attr("squareNumber"));
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