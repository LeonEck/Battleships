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

  describe('lock', () => {
    it('should lock the game field', () => {
      gameField.lock();
      assert.strictEqual(gameField.isLocked(), true, 'Game field is locked');
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

});
