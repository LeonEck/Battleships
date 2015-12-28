/**
 * The GameHandler is responsible for matching players together in a new game
 * He creates new games(MatchHandler) and destroys them when they aren't necessary any more
 */

"use strict";

let MatchHandler = require("./MatchHandler");

class GameHandler {
	/**
	 * GameHandler constructor
	 * @param  {Object} io io object to connect to clients
	 */
	constructor (io) {
		this.io = io;

		this.matches = [];
	}

	/**
	 * Adds a player to a game that is not yet full or creates a new one for him
	 * @param  {String} socketId socketId of the player connecting
	 */
	playerSearchingForGame (socketId) {
		if (this.matches.length === 0 || this.matches[this.matches.length - 1].isFull()) {
			this.matches.push(new MatchHandler(socketId, this.io));
		}	else {
			let affectedMatch = this.matches[this.matches.length - 1];
			affectedMatch.addPlayer(socketId);
		}
	}

	/**
	 * Searches for the game the player disconnected from and closes it
	 * @param  {String} socketId socketId of the player disconnecting
	 */
	playerDisconnected (socketId) {
		for (let i = 0; i < this.matches.length; i++) {
			if (this.matches[i].isAPlayerOfThisMatch(socketId)) {
				this.matches[i].closeMatch();
				this.matches.splice(i, 1);
				break;
			}
		}
	}

	/**
	 * Returns the MatchHandler object for a player
	 * @param  {String} socketIdOfAPlayer socketId of a player you want to get the match for
	 * @return {Object}                   MatchHandler
	 */
	getMatch (socketIdOfAPlayer) {
		for (let i = 0; i < this.matches.length; i++) {
			if (this.matches[i].isAPlayerOfThisMatch(socketIdOfAPlayer)) {
				return this.matches[i];
			}
		}
	}
}

module.exports = GameHandler;
