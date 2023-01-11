import { Hand } from './hand.js'
import { AnimationPlayer } from './animationPlayer.js'
import { Bird } from './bird.js'
import { countdownSecondsFrom, sleep } from './shared.js'
import { Score } from './score.js'

window.settings = {
  MAX_BIRDS_ON_SCREEN: 3,
  BIRD_TRAVEL_DURATION: 5000,
  MAGAZINE_SIZE: 7,
  DAMAGE_TEXT: '-3',
  AUDIO_MUTED: true,
}

window.addEventListener(
  'load',
  async () => {
    const hand = new Hand(new AnimationPlayer(), new Score(0))
    const ambientSound = new Audio('./ambient_sea.mp3')
    ambientSound.volume = 0.8
    ambientSound.loop = true
    ambientSound.muted = window.settings.AUDIO_MUTED
    window.ambientSound = ambientSound

    document.getElementById('start-game').addEventListener(
      'click',
      async () => {
        document.getElementById('start-screen').classList.toggle('display-none')
        document.getElementById('game').classList.toggle('display-none')
        await startGame()
      },
      { once: true }
    )

    document
      .getElementById('toggle-audio')
      .addEventListener('click', toggleMuted)

    async function toggleMuted() {
      document.getElementById('toggle-audio').classList.toggle('sound-off')
      window.settings.AUDIO_MUTED = !window.settings.AUDIO_MUTED
      ambientSound.muted = window.settings.AUDIO_MUTED
      await ambientSound.play()
    }

    async function startGame() {
      // register some hotkeys
      window.addEventListener('keyup', async (e) => {
        switch (e.key) {
          case 'r':
            hand.reload()
            break
          case 'm':
            await toggleMuted()
            break
        }
      })

      // handle shots that miss
      document
        .getElementById('game')
        .addEventListener('pointerdown', async (event) => {
          await hand.shoot(event)
        })

      // start ambient sounds
      window.ambientSound.play().catch((_) => _)
      // initial magazine reload
      hand.reload()

      // set and start the timer
      countdownSecondsFrom(60, document.getElementById('timer-val')).then(
        () => {
          //TODO: End game, Ending Screen
          console.warn('GAME ENDED')
        }
      )

      // kick off the first wave of birds
      for (let i = 0; i < window.settings.MAX_BIRDS_ON_SCREEN; i++) {
        new Bird(hand).spawn(5000)
        await sleep(300)
      }
    }
  },
  { once: true }
)
