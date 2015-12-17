/**
 * The GameHandler is responsible for matching players together in a new game
 * He creates new games(MatchHandler) and destroys them when they aren't necessary an more
 */

"use strict";

let MatchHandler = require("./MatchHandler");

module.exports = GameHandler;

function GameHandler (io) {
	this.io = io;

	this.matches = [];
}


GameHandler.prototype.playerConnected = function (socketId) {
	if (this.matches.length === 0) {
		this.matches.push(new MatchHandler(socketId, this.io));
		return;
	}

	if (this.matches[this.matches.length - 1].isFull()) {
		this.matches.push(new MatchHandler(socketId, this.io));
		return;
	}

	this.matches[this.matches.length - 1].addPlayer(socketId);
};

GameHandler.prototype.playerDisconnected = function (socketId) {
	for (let i = 0; i < this.matches.length; i++) {
		if (this.matches[i].isAPlayerOfThisMatch(socketId)) {
			this.matches[i].closeMatch();
			this.matches.splice(i, 1);
			break;
		}
	}
};

GameHandler.prototype.getMatch = function (socketIdOfAPlayer) {
	for (let i = 0; i < this.matches.length; i++) {
		if (this.matches[i].isAPlayerOfThisMatch(socketIdOfAPlayer)) {
			return this.matches[i];
		}
	}
};
