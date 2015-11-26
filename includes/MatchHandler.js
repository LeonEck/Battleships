module.exports = {
	MatchHandler: function (playerOne, playerTwo, gameFieldOne, gameFieldTwo) {
		this.playerOne = playerOne;
		this.playerTwo = playerTwo;
		this.gameFieldOne = gameFieldOne.slice();
		this.gameFieldTwo = gameFieldTwo.slice();
		this.playerWhosMoveItIs = playerOne;
		this.playerWhoWon = 'none';
		
		this.passTurnOn = function () {
			if (this.playerWhosMoveItIs === this.playerOne) {
				this.playerWhosMoveItIs = this.playerTwo;
			} else {
				this.playerWhosMoveItIs = this.playerOne;
			}
		};
	}
};