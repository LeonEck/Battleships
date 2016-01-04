"use strict";

let assert = require('assert');
let GameField = require("../includes/GameField");

describe('GameField Test', () => {

  let gameField;

  /**
   * A valid game field represented as a flat array for testing
   * @type {Array}
   */
  const testFlatArrayGameField = ['x9', 'x9', 'x9', 'o', 'x5', 'o', 'o', 'x3', 'o', 'o', 'o', 'o', 'o', 'o', 'x5', 'o', 'o', 'x3', 'o', 'x4', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'x4', 'o', 'o', 'x7', 'o', 'o', 'o', 'o', 'o', 'o', 'x4', 'x6', 'o', 'x7', 'o', 'o', 'o', 'o', 'o', 'o', 'x4', 'x6', 'o', 'x7', 'o', 'o', 'x0', 'o', 'o', 'o', 'x4', 'x6', 'o', 'x7', 'o', 'o', 'x0', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'x2', 'x1', 'x1', 'x1', 'x1', 'o', 'x8', 'x8', 'x8', 'o', 'x2'];

  beforeEach(() => {
    gameField = new GameField(10);
  });

  describe('isLocked', () => {
    it('should return true when the game field is locked', () => {
      gameField.lock();
      assert.strictEqual(gameField.isLocked(), true, 'Game field is locked');
    });

    it('should return false when the game field was not locked', () => {
      assert.strictEqual(gameField.isLocked(), false, 'Game field is not locked');
    });
  });

  describe('Game field generation', () => {
    it('should generate a valid game field', () => {
      gameField.generateGameField();
      assert.strictEqual(gameField.isValidGameField(gameField.makeFlatArray()), true, 'Generated game field is valid');
    });
  });

  describe('isValidGameField', () => {
    it('should return true for a valid game field', () => {
      assert.strictEqual(gameField.isValidGameField(testFlatArrayGameField), true, 'Given game field is valid');
    });

    it('should return false for a not valid game field', () => {
      let testInvalidGameField = testFlatArrayGameField.splice();
      testInvalidGameField[0] = 'asd';
      assert.strictEqual(gameField.isValidGameField(testInvalidGameField), false, 'Game field invalid');
    });
  });

  describe('loadFlatArray & makeFlatArray', () => {
    it('should successfully load in a flat array and return the same when requested with makeFlatArray', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      const returnValue = gameField.makeFlatArray();
      assert.deepEqual(testFlatArrayGameField, returnValue, 'Input and output arrays should be the same');
    });
  });

  describe('isClickableField', () => {
    it('should detect a ship part as an clickable field', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      assert.deepEqual(gameField.isClickableField(0), true, 'First field is a clickable ship part');
    });

    it('should detect water as an clickable field', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      assert.deepEqual(gameField.isClickableField(3), true, 'Fourth field is water and therefore clickable');
    });

    it('should detect an already clicked water field (now a missed field) as not clickable', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.setMissed(3);
      assert.deepEqual(gameField.isClickableField(3), false, 'Fourth field is a missed field and therefore not clickable');
    });

    it('should detect an already clicked ship part field (now a destroyed ship part) as not clickable', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.clickOnShipPart(0);
      assert.deepEqual(gameField.isClickableField(0), false, 'First field is a destroyed ship part and therefore not clickable');
    });
  });

  describe('isIntactShip', () => {
    it('should detect an intact ship part', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      assert.deepEqual(gameField.isIntactShip(0), true, 'First field is an intact ship part');
    });

    it('should detect a destroyed ship part', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.clickOnShipPart(0);
      assert.deepEqual(gameField.isIntactShip(0), false, 'First field is a destroyed ship part');
    });

    it('should detect a fully destroyed ship part', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.clickOnShipPart(0);
      gameField.clickOnShipPart(1);
      gameField.clickOnShipPart(2);
      assert.deepEqual(gameField.isIntactShip(0), false, 'First field is a fully destroyed ship part');
    });

    it('should return false on water', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      assert.deepEqual(gameField.isIntactShip(3), false, 'Fourth field is water');
    });

    it('should return false on missed fields', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.setMissed(3);
      assert.deepEqual(gameField.isIntactShip(3), false, 'Fourth field is a missed field');
    });
  });

  describe('clickOnShipPart', () => {
    it('should set an intact ship part to detstroyed', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.clickOnShipPart(0);
      assert.deepEqual(gameField.isIntactShip(0), false, 'The first ship part is destroyed');
    });
  });

  describe('setMissed', () => {
    it('should set water to a missed field', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.setMissed(3);
      assert.deepEqual(gameField.isClickableField(3), false, 'The fourth field was set to missed field');
    });
  });

  describe('areNotFullyDestroyedShipPartsLeft', () => {
    it('should detect that there are still not fully destroyed ship parts left', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      assert.deepEqual(gameField.areNotFullyDestroyedShipPartsLeft(), true, 'There are still not fully destroyed ship parts left');
    });

    it('should detect that all ships have been fully destroyed', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.clickOnShipPart(0);
      gameField.clickOnShipPart(1);
      gameField.clickOnShipPart(2);
      gameField.clickOnShipPart(4);
      gameField.clickOnShipPart(7);
      gameField.clickOnShipPart(14);
      gameField.clickOnShipPart(17);
      gameField.clickOnShipPart(19);
      gameField.clickOnShipPart(29);
      gameField.clickOnShipPart(32);
      gameField.clickOnShipPart(39);
      gameField.clickOnShipPart(40);
      gameField.clickOnShipPart(42);
      gameField.clickOnShipPart(49);
      gameField.clickOnShipPart(50);
      gameField.clickOnShipPart(52);
      gameField.clickOnShipPart(55);
      gameField.clickOnShipPart(59);
      gameField.clickOnShipPart(60);
      gameField.clickOnShipPart(62);
      gameField.clickOnShipPart(65);
      gameField.clickOnShipPart(89);
      gameField.clickOnShipPart(90);
      gameField.clickOnShipPart(91);
      gameField.clickOnShipPart(92);
      gameField.clickOnShipPart(93);
      gameField.clickOnShipPart(95);
      gameField.clickOnShipPart(96);
      gameField.clickOnShipPart(97);
      gameField.clickOnShipPart(99);
      assert.deepEqual(gameField.areNotFullyDestroyedShipPartsLeft(), false, 'All ships are destroyed');
    });
  });

  describe('makeFlatArray', () => {
    it('should generate a flat array', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      assert.deepEqual(gameField.makeFlatArray(), testFlatArrayGameField, 'Correctly created a flat array');
    });
  });

  describe('makeAnonymousFlatArray', () => {
    it('should generate an anonymous flat array with only water when created', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      const expectedValue = ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'];
      assert.deepEqual(gameField.makeAnonymousFlatArray(), expectedValue, 'Correctly created an anonymous flat array consisting of only water');
    });

    it('should generate an anonymous flat array where destroyed ship parts are displayed', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.clickOnShipPart(0);
      const expectedValue = ['d', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'];
      assert.deepEqual(gameField.makeAnonymousFlatArray(), expectedValue, 'Correctly created an anonymous flat array showing destroyed ship parts');
    });

    it('should generate an anonymous flat array where fully destroyed ship parts are displayed', () => {
      gameField.loadFlatArray(testFlatArrayGameField);
      gameField.clickOnShipPart(0);
      gameField.clickOnShipPart(1);
      gameField.clickOnShipPart(2);
      const expectedValue = ['k', 'k', 'k', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'];
      assert.deepEqual(gameField.makeAnonymousFlatArray(), expectedValue, 'Correctly created an anonymous flat array showing fully destroyed ship parts');
    });
  });

});
