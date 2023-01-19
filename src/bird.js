import {
  createOppositeSidePositionOffscreen,
  createRandomPositionOffscreen,
  GAME_STATUS,
  movesToLeft,
  randomBoolFromManyRandomBools,
  randomIntBetweenZeroAnd,
} from './shared.js'

export class Bird {
  #element = document.createElement('div')
  #sound
  SPAWN_OFFSET = 10
  TYPES = [
    {
      src: './bird_a.png',
      sound: './wilhelm.mp3',
      volume: 1.0,
    },
    {
      src: './bird_b.png',
      sound: './bruh.mp3',
      volume: 0.5,
    },
    {
      src: './bird_c.png',
      sound: './oof.mp3',
      volume: 1.0,
    },
    {
      src: './bird_d.png',
      sound: './toy.mp3',
      volume: 0.6,
    },
  ]

  constructor(hand) {
    this.birdType = this.TYPES.at(randomIntBetweenZeroAnd(this.TYPES.length))
    const birdSound = new Audio(this.birdType.sound)
    birdSound.volume = this.birdType.volume
    this.#sound = birdSound
    this.hand = hand

    const img = document.createElement('img')
    img.setAttribute('draggable', 'false')
    img.src = this.birdType.src

    const inner = document.createElement('div')
    inner.classList.add('bird-inner')
    inner.addEventListener('pointerdown', async (event) => {
      await hand.shoot(event, this)
    })
    inner.appendChild(img)

    this.#element.classList.add('bird')
    this.#element.appendChild(inner)
  }

  get element() {
    return this.#element
  }

  get sound() {
    return this.#sound
  }

  spawn(duration) {
    const from = createRandomPositionOffscreen(this.SPAWN_OFFSET)
    const to = createOppositeSidePositionOffscreen(from, this.SPAWN_OFFSET)
    const animation = this.#element.animate(
      [
        {
          transform:
            'translate(calc(' + from.x + ' * 1vw), calc(' + from.y + ' * 1vh))',
        },
        {
          transform:
            'translate(calc(' + to.x + ' * 1vw), calc(' + to.y + ' * 1vh))',
        },
      ],
      duration
    )
    this.#element.animation = animation
    const birdInner = this.#element.querySelector('.bird-inner')
    birdInner.classList.toggle('bird-flip-y', movesToLeft(from, to))
    birdInner.classList.toggle(
      'spinning',
      randomBoolFromManyRandomBools(3, true)
    )

    animation.addEventListener('finish', () => {
      try {
        if (document.body.removeChild(this.#element)) {
          window.gameTracker.escaped++
        }
        if (window.gameStatus === GAME_STATUS.RUNNING) {
          new Bird(this.hand).spawn(duration)
        }
      } catch (_) {}
    })
    document.body.appendChild(this.#element)
  }
}
