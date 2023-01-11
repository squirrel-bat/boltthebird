import { convertRemToPixels, isNotActionShoot, MAG_STATUS } from './shared.js'
import { Bird } from './bird.js'

export class Hand {
  #rounds = 0

  constructor(animPlayer, score) {
    this.AnimPlayer = animPlayer
    this.Score = score
    this.status = MAG_STATUS.IDLE
  }

  get rounds() {
    return this.#rounds
  }

  async shoot(event, target) {
    if (this.status !== MAG_STATUS.IDLE || isNotActionShoot(event)) return false
    --this.#rounds

    const body = document.querySelector('body')
    body.addEventListener('animationend', (e) => {
      if (e.target === body) body.classList.remove('shake')
    })
    body.classList.add('shake')

    if (
      typeof target?.element !== 'undefined' &&
      !target?.element.classList.contains('hit')
    ) {
      // HIT
      this.Score.value++

      const soundHit = new Audio('./hit_slap.mp3')
      soundHit.volume = 0.6
      if (!window.settings.AUDIO_MUTED) await soundHit.play()
      setTimeout(async () => {
        if (!window.settings.AUDIO_MUTED) await target.sound.play()
      }, 100)

      const element = target.element
      element.classList.add('hit')
      element.animation.pause()
      element.addEventListener('animationend', () => {
        document.body.removeChild(element)
        new Bird(this).spawn(window.settings.BIRD_TRAVEL_DURATION)
      })
      this.AnimPlayer.spawnDamageText(
        { x: event.clientX, y: event.clientY },
        window.settings.DAMAGE_TEXT
      )
    } else {
      // MISSED
      const soundMissedAir = new Audio('./dry_puff.mp3')
      soundMissedAir.volume = 1.0
      const soundMissedWater = new Audio('./splash.mp3')
      soundMissedWater.volume = 0.8
      const at = { x: event.clientX, y: event.clientY }

      const horizon = getComputedStyle(
        document.documentElement
      ).getPropertyValue('--bg-horizon-pos')
      const horizonPos = convertRemToPixels(horizon.slice(0, -3))
      const hitWater = at.y > horizonPos
      if (hitWater) {
        this.AnimPlayer.spawnSplash(at)
      } else {
        this.AnimPlayer.spawnPuff(at)
      }

      if (!window.settings.AUDIO_MUTED) {
        await (hitWater ? soundMissedWater.play() : soundMissedAir.play())
      }
    }
    if (this.rounds <= 0) return this.reload()
    return this.AnimPlayer.updateMagazineHUD(this.rounds)
  }

  reload() {
    if (this.status !== MAG_STATUS.IDLE) return false
    this.status = MAG_STATUS.RELOADING
    this.#rounds = window.settings.MAGAZINE_SIZE
    this.AnimPlayer.reloadMagazine(this.rounds).then((_) => {
      this.status = MAG_STATUS.IDLE
    })
  }
}
