$(document).ready(function () {
	var socket = io.connect();

	socket.on("gameIsStarting", function (data) {
		$("#lobbyContainer").hide();
		$("#gameContainer").show();
	});

});
