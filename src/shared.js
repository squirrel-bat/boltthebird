const GAME_STATUS = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  ENDED: 'ENDED',
}
const MAG_STATUS = {
  IDLE: 'IDLE',
  RELOADING: 'RELOADING',
}
const RECTANGLE_SIDES = {
  TOP: 'AB',
  RIGHT: 'BC',
  BOTTOM: 'CD',
  LEFT: 'DA',
}

class PositionOffscreen {
  constructor(x = 0, y = 0, side = '') {
    this.x = x
    this.y = y
    this.side = side
  }
}

function randomBool() {
  return Math.random() >= 0.5
}

function randomBoolFromManyRandomBools(amount, mustBeAllEqual = false) {
  if (amount < 2) throw Error('Amount must be higher than 1')
  // Make sure to only do an odd number of flips for a clear end result
  if (amount % 2 === 0) amount++

  const coinFlips = { true: 0, false: 0 }
  for (let i = 0; i < amount; i++) {
    coinFlips[randomBool()]++
  }

  if (mustBeAllEqual) {
    const hasMultipleResults = Object.values(coinFlips).indexOf(0) === -1
    return !hasMultipleResults
  } else {
    return (
      Object.keys(coinFlips).reduce((a, b) =>
        coinFlips[a] > coinFlips[b] ? a : b
      ) === 'true'
    )
  }
}

function randomIntBetweenZeroAnd(max) {
  return Math.floor(Math.random() * max)
}

function pushValueFurtherSignedDirBy(value, by) {
  return value + by * Math.sign(value)
}

function identifyRectangleSideAligment(x, y) {
  let side
  if (x > y) {
    side = y < 0 ? RECTANGLE_SIDES.TOP : RECTANGLE_SIDES.RIGHT
  } else {
    side = x < 0 ? RECTANGLE_SIDES.LEFT : RECTANGLE_SIDES.BOTTOM
  }
  return side
}

function createRandomPositionOffscreen(offset) {
  const values = [
    // int between 0 and 100
    randomIntBetweenZeroAnd(100),
    // int below 0 or above 100 by value of offset
    randomBool() ? 100 + offset : offset * -1,
  ]
  if (randomBool()) values.reverse()
  const side = identifyRectangleSideAligment(values[0], values[1])
  return new PositionOffscreen(values[0], values[1], side)
}

function createOppositeSidePositionOffscreen(startPos, offset) {
  const newPos = new PositionOffscreen()
  // BUG: new pos angle fixing is sometimes producing steeper angles instead of flatter ones
  switch (startPos.side) {
    case RECTANGLE_SIDES.TOP:
      newPos.x = randomIntBetweenZeroAnd(100)
      if (Math.abs(startPos.x - newPos.x) < offset) {
        newPos.x = pushValueFurtherSignedDirBy(newPos.x, offset)
      }
      newPos.y = 100 + offset
      break
    case RECTANGLE_SIDES.BOTTOM:
      newPos.x = randomIntBetweenZeroAnd(100)
      if (Math.abs(startPos.x - newPos.x) < offset) {
        newPos.x = pushValueFurtherSignedDirBy(newPos.x, offset)
      }
      newPos.y = offset * -1
      break
    case RECTANGLE_SIDES.LEFT:
      newPos.x = 100 + offset
      newPos.y = randomIntBetweenZeroAnd(100)
      if (Math.abs(startPos.y - newPos.y) < offset) {
        newPos.y = pushValueFurtherSignedDirBy(newPos.y, offset)
      }
      break
    case RECTANGLE_SIDES.RIGHT:
      newPos.x = offset * -1
      newPos.y = randomIntBetweenZeroAnd(100)
      if (Math.abs(startPos.y - newPos.y) < offset) {
        newPos.y = pushValueFurtherSignedDirBy(newPos.y, offset)
      }
      break
  }
  newPos.side = identifyRectangleSideAligment(newPos.x, newPos.y)
  return newPos
}

function movesToLeft(from, to) {
  let res = false
  switch (from.side) {
    case RECTANGLE_SIDES.RIGHT:
      res = true
      break
    case RECTANGLE_SIDES.TOP:
    case RECTANGLE_SIDES.BOTTOM:
      if (from.x > to.x) {
        res = true
      }
      break
  }
  return res
}

function formatSecondsToTimer(seconds) {
  const m = Math.floor(seconds / 60).toString()
  const s = (seconds % 60).toString().padStart(2, '0')
  return [m, s].join(':')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isNotActionShoot(event) {
  return (
    !event.isPrimary || (event.pointerType === 'mouse' && event.button === 2)
  )
}

/**
 * Written by "etham", modified by me
 * See https://stackoverflow.com/a/42769683
 * @param rem
 * @returns {number}
 */
function convertRemToPixels(rem) {
  if (rem.match(/[^\d.]+$/) != null)
    throw Error('Failed to parse non-numeric value')
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}

export {
  GAME_STATUS,
  MAG_STATUS,
  RECTANGLE_SIDES,
  randomBool,
  randomBoolFromManyRandomBools,
  randomIntBetweenZeroAnd,
  createRandomPositionOffscreen,
  createOppositeSidePositionOffscreen,
  formatSecondsToTimer,
  sleep,
  movesToLeft,
  isNotActionShoot,
  convertRemToPixels,
}
