const VP_SIZE = { height: 0, width: 0 }
const LINE_MARGIN = () => {
  return IS_MOBILE ? 5 : 10
}
const ARROW_HEIGHT = () => {
  return IS_MOBILE ? 7 : 14
}
const NAMESPACE_URI = 'http://www.w3.org/2000/svg'
let IS_MOBILE = false

const ROUTES = [
  {
    route: '/',
    navigate: () => {
      hideAllPages()
      document.getElementById('back-button').classList.add('hidden')
      window.location.hash = ''
      window.setTimeout(() => showPage('start'), 2000)
    },
  },
  {
    route: 'always',
    navigate: () => {
      hideAllPages()
      document.getElementById('back-button').classList.add('hidden')
      window.location.hash = 'always'
      showPage('always')
      drawLines()
      document.querySelectorAll('.question').forEach((q) => {
        q.addEventListener('click', (e) =>
          e.currentTarget.classList.add('struck')
        )
        q.addEventListener('animationend', (e) =>
          e.currentTarget.classList.remove('struck')
        )
      })
      document.getElementById('back-button').classList.remove('hidden')
      scrollToBottom()
    },
  },
]

function callRoute(route) {
  try {
    ROUTES.find((e) => e.route === route).navigate()
    return Promise.resolve()
  } catch (e) {
    ROUTES.find((e) => e.route === '/').navigate()
    return Promise.reject()
  }
}
function hideAllPages() {
  document
    .querySelectorAll('*[data-route]')
    .forEach((main) => main.classList.add('display-none'))
}

function showPage(id) {
  const page = document.querySelector('*[data-route="' + id + '"]')
  if (!page) return false
  page.classList.remove('display-none')
}

function drawLines(manual = false) {
  if (
    !manual &&
    VP_SIZE.height === window.innerHeight &&
    VP_SIZE.width === window.innerWidth
  ) {
    return false
  }
  VP_SIZE.height = window.innerHeight
  VP_SIZE.width = window.innerWidth
  IS_MOBILE = window.matchMedia('(max-device-width: 480px)').matches
  const html = document.querySelector('html')
  const htmlRect = html.getBoundingClientRect()
  const svg = document.createElementNS(NAMESPACE_URI, 'svg')
  const oldSVG = document.querySelector('svg')
  if (oldSVG !== null) {
    oldSVG.remove()
  }
  const steps = document.querySelectorAll('.step')
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (!step.classList.contains('display-none')) {
      const question = step.querySelector('.question')
      const answers = step.querySelectorAll('.answer:not(.display-none)')
      for (const answer of answers) {
        const isStatic = answer.classList.contains('static')
        if (isStatic) {
          const nextSteps = Array.from(steps).filter(
            (s) =>
              s.dataset.id === answer.dataset.next &&
              !s.classList.contains('display-none')
          )
          if (nextSteps.length > 0) {
            drawArrow(svg, answer, nextSteps.at(0).querySelector('.question'))
          }
        }
        drawArrow(svg, question, answer, !isStatic)
      }
    }
  }
  svg.setAttribute('viewBox', '0 0 ' + htmlRect.width + ' ' + htmlRect.height)
  svg.classList.add('svg-lines')
  document.querySelector('main').appendChild(svg)
}

function drawArrow(svg, from, to, hasArrowHead = true) {
  const fromCoords = getBottomCenterCoords(from.getBoundingClientRect())
  const toCoords = getTopCenterCoords(to.getBoundingClientRect())
  const children = []
  // SVG drawing order matters as there is no simple z-index solution.
  if (hasArrowHead) {
    const arrowHead = createArrowHead(toCoords)
    toCoords.y -= ARROW_HEIGHT() - LINE_MARGIN()
    const line = createPath(fromCoords, toCoords)
    children.push(line, arrowHead)
  } else {
    children.push(createPath(fromCoords, toCoords))
  }
  children.forEach((child) => svg.appendChild(child))
}

function createPath(fromCoords, toCoords) {
  const path = document.createElementNS(NAMESPACE_URI, 'path')
  const fromPoint = ['M', fromCoords.x, fromCoords.y].join(' ')
  const curve = ['C', fromCoords.x, toCoords.y, toCoords.x, fromCoords.y].join(
    ' '
  )
  const toPoint = toCoords.x + ' ' + toCoords.y
  const drawPath = [fromPoint, curve, toPoint].join(' ')
  path.setAttribute('d', drawPath)
  path.classList.add('line')
  return path
}
function createArrowHead(at_coords) {
  const polygon = document.createElementNS(NAMESPACE_URI, 'polygon')
  at_coords.y -= ARROW_HEIGHT()
  const point_at = at_coords.x + ',' + (at_coords.y + ARROW_HEIGHT())
  const point_top_left = at_coords.x - ARROW_HEIGHT() * 0.8 + ',' + at_coords.y
  const point_top_right = at_coords.x + ARROW_HEIGHT() * 0.8 + ',' + at_coords.y
  const points = [point_at, point_top_left, point_top_right].join(' ')
  polygon.setAttribute('points', points)
  polygon.classList.add('arrow-head')
  return polygon
}

function getBottomCenterCoords(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height + window.scrollY + LINE_MARGIN(),
  }
}
function getTopCenterCoords(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + window.scrollY - LINE_MARGIN(),
  }
}

function replayIntro() {
  const island = document.querySelector('.island')
  const splash = document.querySelector('.water-splash')
  island.classList.add('display-none')
  splash.classList.add('display-none')
  window.setTimeout(() => {
    island.classList.remove('display-none')
    splash.classList.remove('display-none')
  }, 100)
}

function scrollToBottom() {
  window.scrollTo({
    left: 0,
    top: document.body.scrollHeight,
    behavior: 'smooth',
  })
}

function answer(el) {
  const step = el.parentElement.parentElement
  const allAnswers = el.parentElement.querySelectorAll('button')
  allAnswers.forEach((answer) => answer.classList.add('display-none'))
  const answerTextElement = document.createElement('div')
  answerTextElement.innerText = el.innerText.trim()
  answerTextElement.dataset.next = el.dataset.next
  answerTextElement.classList.add('answer', 'static')

  step.appendChild(answerTextElement)
  el.parentElement.remove()

  try {
    const nextStep = document.querySelector(
      '.step[data-id="' + el.dataset.next + '"]'
    )
    step.querySelector('.question').classList.remove('active')
    nextStep.querySelector('.question').classList.add('active')
    nextStep.remove()
    document.querySelector('main').appendChild(nextStep)
    nextStep.classList.remove('display-none')
  } catch (e) {}

  drawLines(true)

  scrollToBottom()
}

window.addEventListener(
  'load',
  () => {
    let route = window.location.hash.slice(1)
    callRoute(route).then(
      (_resolve) => {
        document.getElementById('site-title').classList.add('skip-animation')
      },
      (_reject) => {}
    )
    let timeout = 0
    window.addEventListener('resize', () => {
      clearTimeout(timeout)
      // start timing for event "completion"
      timeout = setTimeout(drawLines, 166)
    })
  },
  { once: true }
)
