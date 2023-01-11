import { sleep } from './shared.js'

export class AnimationPlayer {
  RELOAD_BULLET_DELAY = 100
  #magazine
  #bullet = document.createElement('i')

  constructor() {
    this.#magazine = document.getElementById('magazine')
    this.#bullet.classList.add('bullet')
  }

  async #playReloadAnim(count) {
    const DELAY = 100
    const DURATION = 150
    const reload = document.getElementById('reload')
    const reloadText = document.getElementById('reload-text')
    const mountains = document.getElementById('mountains')

    const soundSlide = new Audio('./whoosh.mp3')
    soundSlide.volume = 0.8
    if (!window.settings.AUDIO_MUTED) await soundSlide.play()

    reloadText.classList.remove('display-none')
    for (let i = 0; i < count; i++) {
      const delay = i * DELAY
      const mountain = document.createElement('div')
      mountain.classList.add('mountain')
      mountain.style.setProperty('--mountain-delay', delay + 'ms')
      mountain.style.setProperty('--mountain-duration', '300ms')
      mountains.prepend(mountain)

      const soundCard = new Audio('./slash.mp3')
      soundCard.volume = 0.6
      setTimeout(async () => {
        if (!window.settings.AUDIO_MUTED) await soundCard.play()
      }, delay)
    }
    reload.style.setProperty('--fade-duration', DURATION + 'ms')
    reload.style.setProperty(
      '--fade-delay',
      (count - 1) * DELAY + DURATION + 'ms'
    )
    reload.classList.add('fade-out')
    return new Promise((resolve) => {
      reload.addEventListener('animationend', (e) => {
        if (e.target === reload) {
          e.currentTarget.classList.remove('fade-out')
          mountains.innerHTML = ''
          reloadText.classList.add('display-none')
          resolve()
        }
      })
    })
  }

  spawnElementAt(element, at) {
    element.style.setProperty('--cursor-x', at.x.toString())
    element.style.setProperty('--cursor-y', at.y.toString())
    element.addEventListener('animationend', (e) => e.currentTarget.remove())
    document.body.prepend(element)
  }

  spawnDamageText(at, text) {
    const dmgText = document.createElement('div')
    dmgText.innerText = text
    const dmg = document.createElement('div')
    dmg.classList.add('damage', 'at-cursor')
    dmg.appendChild(dmgText)
    this.spawnElementAt(dmg, at)
  }

  spawnSplash(at) {
    const splashInner = document.createElement('div')
    const splash = document.createElement('div')
    splash.classList.add('splash', 'at-cursor')
    splash.appendChild(splashInner)
    this.spawnElementAt(splash, at)
    return true
  }

  spawnPuff(at) {
    const puffInner = document.createElement('div')
    const puff = document.createElement('div')
    puff.classList.add('puff', 'at-cursor')
    puff.appendChild(puffInner)
    this.spawnElementAt(puff, at)
    return true
  }

  async reloadMagazine(amount) {
    await Promise.all([
      this.#playReloadAnim(amount),
      this.updateMagazineHUD(amount, true),
    ])
  }

  async updateMagazineHUD(amount, reloading = false) {
    const bullets = this.#magazine.querySelectorAll('.bullet:not(.shot)')
    if (reloading === true) {
      this.#magazine.innerHTML = ''
      for (let i = 0; i < amount; i++) {
        const bullet = this.#bullet.cloneNode()
        await sleep(this.RELOAD_BULLET_DELAY)
        this.#magazine.prepend(bullet)
      }
    } else {
      const shotBullet = bullets.item(0)
      shotBullet.classList.add('shot')
      shotBullet.addEventListener('animationend', (e) => {
        e.currentTarget.remove()
      })
    }
  }
}
