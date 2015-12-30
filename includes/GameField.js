'use strict';

class GameField {
  constructor (size) {
    this.size = size;
    this._initGameField();
  }

  generateGameField () {
    this._initGameField();
    let gameFieldGenerated = false;
    while (!gameFieldGenerated) {
      if (this._generateGameField()) {
        gameFieldGenerated = true;
      }
    }
  }

  makeFlatArray () {
    let returnArray = [];

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.gameField[j][i].getType() === 'water') {
          returnArray.push(this.gameField[j][i].getLabel());
        } else {
          returnArray.push(this.gameField[j][i].getLabel() + this.gameField[j][i].getShipId());
        }
      }
    }

    return returnArray;
  }

  _initGameField () {
    this.gameField = new Array(this.size);
    for (let i = 0; i < this.size; i++) {
      this.gameField[i] = new Array(this.size);
    }
    this._fillGameFieldWithWater();
  }

  _fillGameFieldWithWater () {
    for (let i = 0; i < this.gameField.length; i++) {
      for (let j = 0; j < this.gameField[i].length; j++) {
        this.gameField[i][j] = new Water();
      }
    }
  }

  _generateGameField () {
    let tmpShipsToPlace = this._getShipsToPlace();

    let nextShipId = 0;
    let iterationCounter = 0;

    while (tmpShipsToPlace.length > 0) {
      iterationCounter++;
      // Fallback to ensure the generator doesn't get stuck
      if (iterationCounter > 1000) {
        this._initGameField();
        return false;
      }
      const randomShipIndex = this._getRandomInt(0, tmpShipsToPlace.length - 1);
      const randomShip = tmpShipsToPlace[randomShipIndex];
      if (this._placeShip(randomShip.length, this._getRandomInt(0, this.size - 1), this._getRandomInt(0, this.size - 1), this._getRandomDirection(), nextShipId)) {
        nextShipId++;
        iterationCounter = 0;
        if (tmpShipsToPlace[randomShipIndex].amount === 1) {
          tmpShipsToPlace.splice(randomShipIndex, 1);
        } else {
          tmpShipsToPlace[randomShipIndex].amount = tmpShipsToPlace[randomShipIndex].amount - 1;
        }
        // console.log("ShipId: " + nextShipId + " " + iterationCounter);
        // this._DEBUG_PRINT_GAME_FIELD();
      }
    }

    return true;
  }

  _getShipsToPlace () {
    return [
      {
        length: 2,
        amount: 4
      },
      {
        length: 3,
        amount: 3
      },
      {
        length: 4,
        amount: 2
      },
      {
        length: 5,
        amount: 1
      }
    ];
  }

  /**
   * Places a ship in the game field
   * @param  {Number} length    Length of the ship
   * @param  {Number} x         Start x coordinate of the ship
   * @param  {Number} y         Start y coordiante of the ship
   * @param  {String} direction Orientation of the ship ('up', 'down', 'left', 'right')
   * @param  {Number} id         Id of the ship
   * @return {Boolean}           True if the ship could be placed
   */
  _placeShip (length, x, y, direction, id) {
    //console.log(length + ' - ' + x + ' - ' + y + ' - ' + direction + ' - ' + id);
    if (!this._isFieldWater(x, y) || !this._areCoordinatesWithinBounds(x, y) || !this._wouldShipFitInGameField(length, x, y, direction)) {
      return false;
    }

    if (!this._wouldAllFieldsOfTheShipBeValidFieldsToPlaceAShipOn(length, x, y, direction)) {
      return false;
    }

    // Place ship
    switch (direction) {
      case 'up':
        for (let i = y; i > y - length; i--) {
          this.gameField[x][i] = new ShipPart(id);
        }
        break;
      case 'down':
        for (let i = y; i < y + length; i++) {
          this.gameField[x][i] = new ShipPart(id);
        }
        break;
      case 'left':
        for (let i = x; i > x - length; i--) {
          this.gameField[i][y] = new ShipPart(id);
        }
        break;
      case 'right':
        for (let i = x; i < x + length; i++) {
          this.gameField[i][y] = new ShipPart(id);
        }
        break;
    }

    return true;
  }

  _areCoordinatesWithinBounds (x, y) {
    return (x < this.size && x >= 0 && y < this.size && y >= 0);
  }

  _isFieldWater (x, y) {
    if (!this._areCoordinatesWithinBounds(x, y)) {
      return 'water';
    } else {
      return this.gameField[x][y].getType() === 'water';
    }
  }

  _areAllAdjacentFieldsWater (x, y) {
    // up
    if (this._areCoordinatesWithinBounds(x, y - 1)) {
      if (!this._isFieldWater(x, y - 1)) {
        return false;
      }
    }

    // down
    if (this._areCoordinatesWithinBounds(x, y + 1)) {
      if (!this._isFieldWater(x, y + 1)) {
        return false;
      }
    }

    // left
    if (this._areCoordinatesWithinBounds(x - 1, y)) {
      if (!this._isFieldWater(x - 1, y)) {
        return false;
      }
    }

    // right
    if (this._areCoordinatesWithinBounds(x + 1, y)) {
      if (!this._isFieldWater(x + 1, y)) {
        return false;
      }
    }

    // up left
    if (this._areCoordinatesWithinBounds(x - 1, y - 1)) {
      if (!this._isFieldWater(x - 1, y - 1)) {
        return false;
      }
    }

    // up right
    if (this._areCoordinatesWithinBounds(x + 1, y - 1)) {
      if (!this._isFieldWater(x + 1, y - 1)) {
        return false;
      }
    }

    // down left
    if (this._areCoordinatesWithinBounds(x - 1, y + 1)) {
      if (!this._isFieldWater(x - 1, y + 1)) {
        return false;
      }
    }

    // down right
    if (this._areCoordinatesWithinBounds(x + 1, y + 1)) {
      if (!this._isFieldWater(x + 1, y + 1)) {
        return false;
      }
    }

    return true;
  }

  _wouldShipFitInGameField (length, x, y, direction) {
    switch (direction) {
      case 'up':
        return (y - length >= -1);
      case 'down':
        return (y + length <= this.size);
      case 'left':
        return (x - length >= -1);
      case 'rigth':
        return (x + length <= this.size);
    }
  }

  // Checks if all fields on the way are water and also if all adjacent fields are water to
  _wouldAllFieldsOfTheShipBeValidFieldsToPlaceAShipOn (length, x, y, direction) {
    switch (direction) {
      case 'up':
        for (let i = y; i > y - length; i--) {
          if (this._isFieldWater(x, i)) {
            if (!this._areAllAdjacentFieldsWater(x, i)) {
              return false;
            }
          } else {
            return false;
          }
        }
        break;
      case 'down':
        for (let i = y; i < y + length; i++) {
          if (this._isFieldWater(x, i)) {
            if (!this._areAllAdjacentFieldsWater(x, i)) {
              return false;
            }
          } else {
            return false;
          }
        }
        break;
      case 'left':
        for (let i = x; i > x - length; i--) {
          if (this._isFieldWater(i, y)) {
            if (!this._areAllAdjacentFieldsWater(i, y)) {
              return false;
            }
          } else {
            return false;
          }
        }
        break;
      case 'right':
        for (let i = x; i < x + length; i++) {
          if (this._isFieldWater(i, y)) {
            if (!this._areAllAdjacentFieldsWater(i, y)) {
              return false;
            }
          } else {
            return false;
          }
        }
        break;
    }

    return true;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   */
  _getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _getRandomDirection () {
    const randomNumber = this._getRandomInt(0, 3);

    switch (randomNumber) {
      case 0:
        return 'up';
      case 1:
        return 'down';
      case 2:
        return 'left';
      case 3:
        return 'right';
    }
  }

  _DEBUG_PRINT_GAME_FIELD () {
    console.log("Game Field: ");
    for (let i = 0; i < this.size; i++) {
      let rowString = '';
      for (let j = 0; j < this.size; j++) {
        rowString += this.gameField[j][i].getLabel() + ' ';
      }
      console.log(rowString);
    }
  }
}

class Field {
  constructor (label, type) {
    this.label = label;
    this.type = type;
  }

  getLabel () {
    return this.label;
  }

  getType () {
    return this.type;
  }
}

class Water extends Field {
  constructor () {
    super('o', 'water');
  }
}

class ShipPart extends Field {
  constructor (shipId) {
    super('x', 'shipPart');
    this.shipId = shipId;
    this.levelOfDestructionEnum = Object.freeze({
      INTACT: 'intact',
      DESTROYED: 'destroyed',
      WHOLESHIPDESTROYED: 'wholeShipDestroyed'
    });
    this.destroyed = this.levelOfDestructionEnum.INTACT;
  }

  getShipId () {
    return this.shipId;
  }

  getDestroyed () {
    return this.destroyed;
  }
}

module.exports = GameField;
