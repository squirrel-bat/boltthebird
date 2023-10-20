import { Hand } from './hand.js'
import { AnimationPlayer } from './animationPlayer.js'
import { Bird } from './bird.js'
import { formatSecondsToTimer, GAME_STATUS, sleep } from './shared.js'
import { Score } from './score.js'

window.settings = {
  AUDIO_MUTED: true,
  BGM_START: 0,
  MAX_BIRDS_ON_SCREEN: 3,
  BIRD_SPAWN_INITIAL_DELAY: 300,
  BIRD_TRAVEL_DURATION: 5000,
  MAGAZINE_SIZE: 7,
  DAMAGE_TEXT: '-3',
  GAME_DURATION_SECONDS: 60,
  START_COUNTDOWN_AUDIO_AT: 3,
  UI_COOLDOWN: 2000,
}

window.gameTracker = {
  bolted: 0,
  escaped: 0,
  missed: 0,
}

const statLabels = {
  bolted: 'Bolted:',
  missed: 'Missed Bolts:',
  escaped: 'Escaped:',
}
const hl = '------------------\n'

// FIXME: Cache assets

window.copyResultsToClipboard = () => {
  const sound = new Audio('./copy_cam.mp3')
  const res = Object.keys(window.gameTracker)
    .map(
      (key) =>
        statLabels[key].padEnd(14) +
        window.gameTracker[key].toString().padStart(4)
    )
    .join('\n')

  sound.pause()
  sound.currentTime = 0
  if (!window.settings.AUDIO_MUTED) {
    sound.play().catch((_) => {})
  }

  navigator.clipboard.writeText(res).catch((reason) => console.error(reason))

  console.info('My Results:\n' + hl + res)
}

window.toggleSummary = () => {
  document
    .querySelectorAll('.results')
    .forEach((it) => it.classList.toggle('display-none'))
}

window.addEventListener(
  'load',
  async () => {
    window.gameStatus = GAME_STATUS.IDLE
    const game = document.getElementById('game')
    const score = new Score(0)
    const hand = new Hand(new AnimationPlayer(), score)
    const endSound = new Audio('./end.mp3')
    const countSound = new Audio('./beep.mp3')
    countSound.volume = 0.8
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

    window.toggleHelp = (reload = false) => {
      document.getElementById('start-screen').classList.toggle('display-none')
      document.getElementById('help-screen').classList.toggle('display-none')
      document.getElementById('game').classList.toggle('display-none')
      if (reload === true) hand.reload(true)
    }

    document
      .getElementById('start-game')
      .addEventListener('click', startGame, { once: true })

    document
      .querySelectorAll('.toggle-audio')
      .forEach((it) => it.addEventListener('click', toggleMuted))

    document
      .getElementById('show-help')
      .addEventListener('click', () => window.toggleHelp(true))

    document.querySelectorAll('.scroll-spy').forEach((it) => {
      const topEndElement = it.querySelector('.scroll-top-end')
      const bottomEndElement = it.querySelector('.scroll-bottom-end')
      const opts = {
        root: it,
        threshold: 0.2,
      }
      const topObserver = new IntersectionObserver((some) => {
        it.classList.toggle('show-up', !some[0].isIntersecting)
      }, opts)
      const bottomObserver = new IntersectionObserver((some) => {
        it.classList.toggle('show-down', !some[0].isIntersecting)
      }, opts)

      topObserver.observe(topEndElement)
      bottomObserver.observe(bottomEndElement)
    })

    document.querySelectorAll('.card').forEach((it) => {
      it.ontouchstart = (elem) => {
        document
          .querySelectorAll('.card')
          .forEach((it) => it.classList.remove('hover'))
        elem.currentTarget.classList.add('hover')
      }
    })

    async function toggleMuted() {
      document
        .querySelectorAll('.toggle-audio')
        .forEach((it) => it.classList.toggle('sound-off'))
      window.settings.AUDIO_MUTED = !window.settings.AUDIO_MUTED
      ambientSound.muted = window.settings.AUDIO_MUTED
      backgroundMusic.muted = window.settings.AUDIO_MUTED
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

    const repeatSoundEverySecond = (sound, repeats) => {
      if (repeats <= 0) return false
      if (!window.settings.AUDIO_MUTED) {
        sound.pause()
        sound.currentTime = 0
        sound.play()
      }
      setTimeout(() => repeatSoundEverySecond(sound, repeats - 1), 1000)
    }

    const countdownSecondsFrom = (fromSeconds, text, countSound) => {
      return new Promise((resolve) => {
        let diff
        let repeatStarted = false
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
          if (
            diff === window.settings.START_COUNTDOWN_AUDIO_AT &&
            !repeatStarted
          ) {
            repeatSoundEverySecond(
              countSound,
              window.settings.START_COUNTDOWN_AUDIO_AT
            )
            repeatStarted = true
          }
          text.innerText = formatSecondsToTimer(diff)
        }
      })
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
        document.getElementById('timer-val'),
        countSound,
        endSound
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
        }, window.settings.UI_COOLDOWN)
      })
      document.querySelectorAll('.bird').forEach((it) => it.remove())
      game.removeEventListener('pointerdown', handleGamePointerDown)
      game.classList.add('display-none')

      Object.keys(window.gameTracker).forEach((key) => {
        try {
          document
            .querySelectorAll(`.${key}-score .score-value`)
            .forEach((it) => (it.innerText = window.gameTracker[key]))
        } catch (_) {}
      })
      document
        .querySelectorAll('.results')
        .forEach((it) => it.classList.remove('visited'))

      document.getElementById('end-screen').classList.remove('display-none')
      document
        .getElementById('restart-game')
        .addEventListener('click', startGame, { once: true })

      if (!window.settings.AUDIO_MUTED) {
        endSound.play()
        applauseSound.play()
      }
    }
  },
  { once: true }
)
