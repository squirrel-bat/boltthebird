import { Hand } from './hand.js'
import { AnimationPlayer } from './animationPlayer.js'
import { Bird } from './bird.js'
import { countdownSecondsFrom, GAME_STATUS, sleep } from './shared.js'
import { Score } from './score.js'

window.settings = {
  GAME_DURATION_SECONDS: 60,
  MAX_BIRDS_ON_SCREEN: 3,
  BIRD_TRAVEL_DURATION: 5000,
  BIRD_SPAWN_INITIAL_DELAY: 300,
  MAGAZINE_SIZE: 7,
  DAMAGE_TEXT: '-3',
  AUDIO_MUTED: true,
  BGM_START: 0,
}

window.gameTracker = {
  bolted: 0,
  escaped: 0,
  missed: 0,
}

const statLabels = {
  bolted: 'Bolted:',
  escaped: 'Escaped:',
  missed: 'Missed Bolts:',
}

window.copyResultsToClipboard = () => {
  const res = Object.keys(window.gameTracker).map(
    (key) =>
      statLabels[key].padEnd(14) +
      window.gameTracker[key].toString().padStart(4)
  )
  navigator.clipboard
    .writeText(res.join('\n'))
    .catch((reason) => console.error(reason))
}

window.addEventListener(
  'load',
  async () => {
    window.gameStatus = GAME_STATUS.IDLE
    const game = document.getElementById('game')
    const score = new Score(0)
    const hand = new Hand(new AnimationPlayer(), score)
    const ambientSound = new Audio('./ambient_sea.mp3')
    ambientSound.volume = 0.9
    ambientSound.loop = true
    ambientSound.muted = window.settings.AUDIO_MUTED
    window.ambientSound = ambientSound

    const backgroundMusic = new Audio('./bgm.mp3')
    backgroundMusic.volume = 0.65
    backgroundMusic.currentTime = window.settings.BGM_START
    backgroundMusic.muted = window.settings.AUDIO_MUTED
    window.backgroundMusic = backgroundMusic

    document
      .getElementById('start-game')
      .addEventListener('click', startGame, { once: true })

    document
      .querySelectorAll('.toggle-audio')
      .forEach((it) => it.addEventListener('click', toggleMuted))

    async function toggleMuted() {
      document
        .querySelectorAll('.toggle-audio')
        .forEach((it) => it.classList.toggle('sound-off'))
      window.settings.AUDIO_MUTED = !window.settings.AUDIO_MUTED
      ambientSound.muted = window.settings.AUDIO_MUTED
      await ambientSound.play()
    }

    const handleKeyUp = async (e) => {
      switch (e.key) {
        case 'r':
          hand.reload()
          break
        case 'm':
          await toggleMuted()
          break
      }
    }

    const handleGamePointerDown = async (event) => {
      await hand.shoot(event)
    }

    async function startGame() {
      Object.keys(window.gameTracker).forEach(
        (key) => (window.gameTracker[key] = 0)
      )
      score.value = 0
      // register some hotkeys
      window.addEventListener('keyup', handleKeyUp)
      // handle shots that miss
      game.addEventListener('pointerdown', handleGamePointerDown)
      document.getElementById('start-screen').classList.add('display-none')
      document.getElementById('end-screen').classList.add('display-none')
      document.getElementById('game').classList.remove('display-none')
      // start ambient sounds
      if (window.ambientSound.ended) {
        window.ambientSound.play().catch((_) => _)
      }
      // start music
      window.backgroundMusic.muted = window.settings.AUDIO_MUTED
      window.backgroundMusic.play().catch((_) => _)

      // initial magazine reload
      hand.reload()
      window.gameStatus = GAME_STATUS.RUNNING
      // set and start the timer
      countdownSecondsFrom(
        window.settings.GAME_DURATION_SECONDS,
        document.getElementById('timer-val')
      ).then(endGame)
      // kick off the first wave of birds
      for (let i = 0; i < window.settings.MAX_BIRDS_ON_SCREEN; i++) {
        new Bird(hand).spawn(window.settings.BIRD_TRAVEL_DURATION)
        await sleep(window.settings.BIRD_SPAWN_INITIAL_DELAY)
      }
    }

    function endGame() {
      window.backgroundMusic.pause()
      window.backgroundMusic.currentTime = window.settings.BGM_START

      const applauseSound = new Audio('./applause.mp3')
      applauseSound.volume = 1.0

      window.gameStatus = GAME_STATUS.ENDED
      window.removeEventListener('keyup', handleKeyUp)
      document.querySelectorAll('button').forEach((it) => {
        it.setAttribute('disabled', 'disabled')
        setTimeout(() => {
          it.removeAttribute('disabled')
        }, 3000)
      })
      document.querySelectorAll('.bird').forEach((it) => it.remove())
      game.removeEventListener('pointerdown', handleGamePointerDown)
      game.classList.add('display-none')

      Object.keys(window.gameTracker).forEach((key) => {
        try {
          document
            .getElementById(`${key}-score`)
            .querySelector('.score-value').innerText = window.gameTracker[key]
        } catch (_) {}
      })

      document.getElementById('end-screen').classList.remove('display-none')
      applauseSound.play()

      document
        .getElementById('restart-game')
        .addEventListener('click', startGame, { once: true })
    }
  },
  { once: true }
)
