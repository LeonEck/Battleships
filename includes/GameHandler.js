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
		if (!this.isThisPlayerInAnyMatch(socketId)) {
			if (this._shouldANewMatchBeCreated()) {
				this.matches.push(new MatchHandler(socketId, this.io));
			}	else {
				this.matches[this.matches.length - 1].addPlayer(socketId);
			}
		}
	}

	/**
	 * Close the match that the given player is in
	 * @param  {String} socketId SocketId of the player who's match should be closed
	 * @param  {Boolean} aborted  If true the clients gets a message that there game was aborted
	 */
	closeMatch (socketId, aborted) {
		for (let i = 0; i < this.matches.length; i++) {
			if (this.matches[i].isAPlayerOfThisMatch(socketId)) {
				if (aborted) {
					this.matches[i].closeMatch();
				}
				this.matches.splice(i, 1);
				return;
			}
		}
	}

	/**
	 * Returns the MatchHandler object for a player
	 * @param  {String} socketId socketId of a player you want to get the match for
	 * @return {Object}                   MatchHandler
	 */
	getMatch (socketId) {
		for (let i = 0; i < this.matches.length; i++) {
			if (this.matches[i].isAPlayerOfThisMatch(socketId)) {
				return this.matches[i];
			}
		}
	}

	/**
	 * Checks if a given socketId if it exists in any match
	 * @param  {String}  socketId socketId of the player to check
	 * @return {Boolean}          True when there is a match with this player in
	 * it
	 */
	isThisPlayerInAnyMatch(socketId) {
		for (let i = 0; i < this.matches.length; i++) {
			if (this.matches[i].isAPlayerOfThisMatch(socketId)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * If there are no matches or the last one is already full than an new one
	 * need to be created
	 * @return {Boolean} True when all matches are full or there are no matches
	 */
	_shouldANewMatchBeCreated () {
		return this.matches.length === 0 || this.matches[this.matches.length - 1].isFull();
	}
}

module.exports = GameHandler;
