import {
  createOppositeSidePositionOffscreen,
  createRandomPositionOffscreen,
  movesToLeft,
  randomBool,
  randomIntBetween0and,
} from './shared.js'

export class Bird {
  #element = document.createElement('div')
  #sound
  SPAWN_OFFSET = 5
  TYPES = [
    {
      src: './bird_a.png',
      sound: './wilhelm.mp3',
      volume: 0.8,
    },
    {
      src: './bird_b.png',
      sound: './bruh.mp3',
      volume: 0.5,
    },
    {
      src: './bird_c.png',
      sound: './oof.mp3',
      volume: 0.8,
    },
    {
      src: './bird_d.png',
      sound: './toy.mp3',
      volume: 0.5,
    },
  ]

  constructor(hand) {
    const birdType = this.TYPES.at(randomIntBetween0and(this.TYPES.length))
    const birdSound = new Audio(birdType.sound)
    birdSound.volume = birdType.volume
    this.#sound = birdSound
    this.hand = hand

    const img = document.createElement('img')
    img.setAttribute('draggable', 'false')
    img.src = birdType.src
    img.addEventListener('pointerdown', async (event) => {
      await hand.shoot(event, this)
    })

    const inner = document.createElement('div')
    inner.classList.add('bird-inner')
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
    const animation = this.element.animate(
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
    this.element.animation = animation
    const birdInner = this.#element.querySelector('.bird-inner')
    if (movesToLeft(from, to)) {
      birdInner.classList.add('flip-y')
    } else if (randomBool() && randomBool()) {
      // we want this to be rare, hence multiple coin flips
      birdInner.classList.add('spinning')
    }

    animation.addEventListener('finish', () => {
      document.body.removeChild(this.element)
      new Bird(this.hand).spawn(duration)
    })
    document.body.appendChild(this.element)
  }
}
