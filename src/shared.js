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

function randomIntBetween0and(max) {
  return Math.floor(Math.random() * max)
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
    randomIntBetween0and(100),
    // int below 0 or above 100 by value of offset
    randomBool() ? 100 + offset : offset * -1,
  ]
  if (randomBool()) values.reverse()
  const side = identifyRectangleSideAligment(values[0], values[1])
  return new PositionOffscreen(values[0], values[1], side)
}

function createOppositeSidePositionOffscreen(startPos, offset) {
  const newPos = new PositionOffscreen()
  switch (startPos.side) {
    case RECTANGLE_SIDES.TOP:
      newPos.x = randomIntBetween0and(100)
      newPos.y = 100 + offset
      break
    case RECTANGLE_SIDES.BOTTOM:
      newPos.x = randomIntBetween0and(100)
      newPos.y = offset * -1
      break
    case RECTANGLE_SIDES.LEFT:
      newPos.x = 100 + offset
      newPos.y = randomIntBetween0and(100)
      break
    case RECTANGLE_SIDES.RIGHT:
      newPos.x = offset * -1
      newPos.y = randomIntBetween0and(100)
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

function countdownSecondsFrom(fromSeconds, element) {
  return new Promise((resolve) => {
    let diff
    const start = Date.now()
    // will start in a second, but...
    const intervalID = setInterval(updateCounter, 500)
    // we want the first run right now!
    updateCounter()
    function updateCounter() {
      diff = fromSeconds - (((Date.now() - start) / 1000) | 0)
      if (diff <= 0) {
        clearInterval(intervalID)
        resolve()
      }
      element.innerText = formatSecondsToTimer(diff)
    }
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isNotActionShoot(event) {
  return (
    !event.isPrimary || (event.pointerType === 'mouse' && event.button === 2)
  )
}

export {
  MAG_STATUS,
  RECTANGLE_SIDES,
  randomBool,
  randomIntBetween0and,
  createRandomPositionOffscreen,
  createOppositeSidePositionOffscreen,
  countdownSecondsFrom,
  sleep,
  movesToLeft,
  isNotActionShoot,
}
