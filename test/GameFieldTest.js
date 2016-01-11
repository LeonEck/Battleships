"use strict";

let assert = require('assert');
let GameField = require("../includes/GameField");

describe('GameField Test', () => {

  let gameField;

  beforeEach(() => {
    gameField = new GameField(10);
  });

  describe('isLocked & lock', () => {
    it('should return true when the game field is locked', () => {
      gameField.lock();
      assert.strictEqual(gameField.isLocked(), true, 'Game field is locked');
    });

    it('should return false when the game field was not locked', () => {
      assert.strictEqual(gameField.isLocked(), false, 'Game field is not locked');
    });
  });

  describe('Testing a generated game field', () => {

    let flatArray;

    beforeEach(() => {
      flatArray = gameField.makeFlatArray();
    });

    describe('isClickableField', () => {

      it('should detect water as clickable field', () => {
        let positionInFlatArray = 0;
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'w') {
            positionInFlatArray = i;
            break;
          }
        }
        assert.strictEqual(gameField.isClickableField(positionInFlatArray), true);
      });

      it('should detect shipPart as clickable field', () => {
        let positionInFlatArray = 0;
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'i') {
            positionInFlatArray = i;
            break;
          }
        }
        assert.strictEqual(gameField.isClickableField(positionInFlatArray), true);
      });

      it('should detect shipPartHit as not clickable field', () => {
        let positionInFlatArray = 0;
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'i') {
            positionInFlatArray = i;
            break;
          }
        }
        gameField.clickOnShipPart(positionInFlatArray);
        assert.strictEqual(gameField.isClickableField(positionInFlatArray), false);
      });

      it('should detect missed as not clickable field', () => {
        let positionInFlatArray = 0;
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'w') {
            positionInFlatArray = i;
            break;
          }
        }
        gameField.setMissed(positionInFlatArray);
        assert.strictEqual(gameField.isClickableField(positionInFlatArray), false);
      });

    });

    describe('isIntactShip', () => {

      it('should detect shipPart as intact', () => {
        let positionInFlatArray = 0;
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'i') {
            positionInFlatArray = i;
            break;
          }
        }
        assert.strictEqual(gameField.isIntactShip(positionInFlatArray), true);
      });

      it('should detect shipPartHit as not intact', () => {
        let positionInFlatArray = 0;
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'i') {
            positionInFlatArray = i;
            break;
          }
        }
        gameField.clickOnShipPart(positionInFlatArray);
        assert.strictEqual(gameField.isIntactShip(positionInFlatArray), false);
      });

    });

    describe('clickOnShipPart', () => {

      it('should set ship part to hit', () => {
        let positionInFlatArray = 0;
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'i') {
            positionInFlatArray = i;
            break;
          }
        }
        gameField.clickOnShipPart(positionInFlatArray);
        assert.strictEqual(gameField.isIntactShip(positionInFlatArray), false);
      });

    });

    describe('setMissed', () => {

      it('should set water to missed', () => {
        let positionInFlatArray = 0;
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'w') {
            positionInFlatArray = i;
            break;
          }
        }
        gameField.setMissed(positionInFlatArray);
        assert.strictEqual(gameField.isClickableField(positionInFlatArray), false);
      });

    });

    describe('areNotFullyDestroyedShipPartsLeft', () => {

      it('should return true when game field is newly generated', () => {
        assert.strictEqual(gameField.areNotFullyDestroyedShipPartsLeft(), true);
      });

      it('should return false when all ships have been destroyed', () => {
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'i') {
            gameField.clickOnShipPart(i);
          }
        }
        assert.strictEqual(gameField.areNotFullyDestroyedShipPartsLeft(), false);
      });

    });

    describe('makeAnonymousFlatArray', () => {

      it('should not contain any ships when newly generated', () => {
        let anonymousFlatArray = gameField.makeAnonymousFlatArray();
        let doesContainShips = false;
        for (let i = 0; i < anonymousFlatArray.length; i++) {
          if (anonymousFlatArray[i] === 'i') {
            doesContainShips = true;
          }
        }
        assert.strictEqual(doesContainShips, false);
      });

      it('should display hit ship parts', () => {
        let positionInFlatArray = 0;
        for (var i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'i') {
            positionInFlatArray = i;
            break;
          }
        }
        gameField.clickOnShipPart(positionInFlatArray);
        let anonymousFlatArray = gameField.makeAnonymousFlatArray();
        assert.strictEqual(anonymousFlatArray[i], 'h');
      });

    });

    describe('getShipMapAsArray', () => {

      it('should return an array with all ships intact when newly generated', () => {
        const expectedValue = [
          {
            length: 2,
            isFullyDestroyed: false
          },
          {
            length: 2,
            isFullyDestroyed: false
          },
          {
            length: 2,
            isFullyDestroyed: false
          },
          {
            length: 2,
            isFullyDestroyed: false
          },
          {
            length: 3,
            isFullyDestroyed: false
          },
          {
            length: 3,
            isFullyDestroyed: false
          },
          {
            length: 3,
            isFullyDestroyed: false
          },
          {
            length: 4,
            isFullyDestroyed: false
          },
          {
            length: 4,
            isFullyDestroyed: false
          },
          {
            length: 5,
            isFullyDestroyed: false
          }
        ];
        assert.deepEqual(gameField.getShipMapAsArray(), expectedValue);
      });

      it('should return an array with all ships destroyed when the match is finished', () => {
        for (let i = 0; i < flatArray.length; i++) {
          if (flatArray[i] === 'i') {
            gameField.clickOnShipPart(i);
          }
        }
        const expectedValue = [
          {
            length: 2,
            isFullyDestroyed: true
          },
          {
            length: 2,
            isFullyDestroyed: true
          },
          {
            length: 2,
            isFullyDestroyed: true
          },
          {
            length: 2,
            isFullyDestroyed: true
          },
          {
            length: 3,
            isFullyDestroyed: true
          },
          {
            length: 3,
            isFullyDestroyed: true
          },
          {
            length: 3,
            isFullyDestroyed: true
          },
          {
            length: 4,
            isFullyDestroyed: true
          },
          {
            length: 4,
            isFullyDestroyed: true
          },
          {
            length: 5,
            isFullyDestroyed: true
          }
        ];
        assert.deepEqual(gameField.getShipMapAsArray(), expectedValue);
      });

    });

  });

});
