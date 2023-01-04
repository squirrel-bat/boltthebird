const MAG_STATUS = {
  IDLE: 'IDLE',
  RELOADING: 'RELOADING',
}

class Hand {
  SIZE = 7
  #rounds = 0
  STATUS

  constructor(animPlayer, magStatus) {
    this.animPLayer = animPlayer
    this.STATUS = magStatus.IDLE
  }
  get rounds() {
    return this.#rounds
  }
  async shoot() {
    if (this.STATUS !== MAG_STATUS.IDLE) return false
    // play shoot anim
    --this.#rounds
    if (this.rounds <= 0) return this.reload()
    return ANIMATIONPLAYER.updateMagazineHUD(HAND.rounds)
  }
  async reload() {
    if (this.STATUS !== MAG_STATUS.IDLE) return false
    this.STATUS = MAG_STATUS.RELOADING
    this.#rounds = this.SIZE
    await this.animPLayer.reloadMagazine(this.#rounds)
    this.STATUS = MAG_STATUS.IDLE
  }
}

class AnimationPlayer {
  #magazine
  RELOAD_BULLET_DELAY = 100
  BULLET = document.createElement('i')

  constructor() {
    this.#magazine = document.getElementById('magazine')
    this.BULLET.classList.add('bullet')
  }

  async #playReloadAnim(count) {
    const reload = document.getElementById('reload')
    const DELAY = 100
    const DURATION = 300
    for (let i = 0; i < count; i++) {
      const delay = i * DELAY
      const mountain = document.createElement('i')
      mountain.classList.add('mountain')
      mountain.setAttribute('style', '--mountain-delay: ' + delay + 'ms')
      reload.prepend(mountain)
    }
    //TODO: refactor to .style.setProperty()
    reload.setAttribute(
      'style',
      '--fade-duration: ' +
        DURATION +
        'ms; --fade-delay: ' +
        ((count - 1) * DELAY + DURATION) +
        'ms'
    )
    reload.classList.add('fade-out')
    return new Promise((resolve) => {
      reload.addEventListener('animationend', (e) => {
        if (e.target === reload) {
          e.currentTarget.classList.remove('fade-out')
          e.currentTarget.innerHTML = ''
          resolve()
        }
      })
    })
  }
  async reloadMagazine(amount) {
    await Promise.all([
      this.#playReloadAnim(amount),
      this.updateMagazineHUD(amount, true),
    ])
  }
  async updateMagazineHUD(amount, reloading = false) {
    const bullets = this.#magazine.querySelectorAll('.bullet')
    if (reloading === true) {
      this.#magazine.innerHTML = ''
      for (let i = 0; i < amount; i++) {
        const bullet = this.BULLET.cloneNode()
        await sleep(this.RELOAD_BULLET_DELAY)
        this.#magazine.appendChild(bullet)
      }
    } else {
      const diff = bullets.length - amount
      for (let i = 0; i < diff; i++) {
        this.#magazine.querySelector('.bullet:last-of-type').remove()
      }
    }
  }
}

class Bird {
  DMG_TEXT = '-3'
  element = document.createElement('div')

  constructor(position) {
    const innerElement = document.createElement('div')
    innerElement.innerText = 'Bird'
    this.element.appendChild(innerElement)
    this.element.classList.add('bird')
    this.element.style.setProperty('--bird-x', position.x)
    this.element.style.setProperty('--bird-y', position.y)
    this.element.addEventListener(
      'pointerdown',
      (e) => {
        this.element.classList.add('hit')
        this.spawnDmgText(e)
        this.element.addEventListener('animationend', () => {
          document.body.removeChild(this.element)
        })
      },
      { once: true }
    )
  }

  spawnDmgText(pointerEvent) {
    const dmgText = document.createElement('div')
    dmgText.innerText = this.DMG_TEXT
    const dmg = document.createElement('div')
    dmg.classList.add('damage')
    dmg.style.setProperty('--cursor-x', pointerEvent.clientX.toString())
    dmg.style.setProperty('--cursor-y', pointerEvent.clientY.toString())
    dmg.appendChild(dmgText)
    dmg.addEventListener('animationend', (e) => e.currentTarget.remove())
    document.body.appendChild(dmg)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let ANIMATIONPLAYER
let HAND

window.addEventListener(
  'load',
  async () => {
    ANIMATIONPLAYER = new AnimationPlayer()
    HAND = new Hand(ANIMATIONPLAYER, MAG_STATUS)
    await HAND.reload()

    //TODO: Flying across the screen from random angle
    const firstBird = new Bird({ x: 50, y: 40 })
    document.body.appendChild(firstBird.element)

    window.addEventListener('keyup', async (e) => {
      if (e.key === 'r') {
        await HAND.reload()
      }
    })
  },
  { once: true }
)
