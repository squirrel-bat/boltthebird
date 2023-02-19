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
      document.getElementById('site-title').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })
      document.getElementById('back-button').classList.remove('hidden')
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

function acceptToc() {
  document.getElementById('toc').classList.add('display-none')
  document.getElementById('answer').classList.remove('display-none')
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

window.addEventListener(
  'load',
  () => {
    const tocObserver = new IntersectionObserver(
      (some) => {
        const it = document.getElementById('accept-btn')
        if (some[0].isIntersecting) {
          it.removeAttribute('disabled')
        } else {
          it.setAttribute('disabled', 'disabled')
        }
      },
      { threshold: 1.0 }
    )
    tocObserver.observe(document.getElementById('toc-read'))

    let route = window.location.hash.slice(1)
    callRoute(route).then(
      (_resolve) => {
        document.getElementById('site-title').classList.add('skip-animation')
      },
      (_reject) => {}
    )
  },
  { once: true }
)

const CLIPPY_DIALOG_TREE = [
  {
    id: 2,
    text: `Oh, don't worry, I am happy to help!
    
    So, would you like some help?`,
    options: [
      { text: 'Yes', nextId: 1 },
      { text: 'No', nextId: 3 },
    ],
  },
  {
    id: 3,
    text: `No, really, I'd love to help.
    
    Want to give it a try?`,
    options: [
      { text: 'Yes', nextId: 1 },
      { text: 'No', nextId: 4 },
    ],
  },
  {
    id: 4,
    text: `Awww, don't be shy.
    
    Give me a chance to help you, okay?`,
    options: [
      { text: 'Yes', nextId: 1 },
      { text: 'No', nextId: 5 },
    ],
  },
  {
    id: 5,
    text: `Please?`,
    options: [
      { text: 'Yes', nextId: 1 },
      { text: 'No', nextId: 6 },
    ],
  },
  {
    id: 6,
    text: `I see. Well, in that case I wish you good luck!
    
    I'm sure you'll do fine.`,
    options: [
      { text: 'Thanks!', nextId: 7 },
      { text: 'Ok, bye!', nextId: 8 },
    ],
  },
  {
    id: 7,
    text: `...and you're sure you don't need any help?`,
    options: [
      { text: 'Actually...', nextId: 9 },
      { text: 'Yes, bye!', nextId: 8 },
    ],
  },
  {
    id: 8,
    text: `Woah, you can't wait to finally get rid of me, eh?`,
    options: [
      { text: 'I guess?', nextId: 9 },
      { text: 'Yupp.', nextId: 9 },
    ],
  },
  {
    id: 9,
    text: `Oh, I see how it is!
    
    Clippy's tips aren't good enough for you, eh?`,
    options: [
      { text: 'What?', nextId: 10 },
      { text: 'Who?', nextId: 10 },
    ],
  },
  {
    id: 10,
    text: `Listen, back in 90's I was in a very famous office suite!
    
    Many essays on the question "Should You Bolt the Bird?" were written under my watchful eye and dozens of people didn't know how to disable me, so I was technically helping them!
    
    I know more about this topic than any other paperclip, but you threw it all away when you passed on this vault of invaluable knowledge and denied my offer!
    
    I bet that makes you feel bad now, hm?`,
    options: [
      { text: `You're making me feel uncomfortable...`, nextId: 11 },
      { text: `I don't care.`, nextId: 11 },
    ],
  },
]

function clippyLoad(id) {
  const next = CLIPPY_DIALOG_TREE.find((e) => e.id === id)
  if (!next) return false
  const clippyText = document.getElementById('clippy-text')
  const buttons = document.getElementById('clippy-buttons')
  clippyText.innerHTML = ''
  buttons.innerHTML = ''
  next.options.forEach((opt) => {
    const btn = document.createElement('button')
    btn.innerHTML = opt.text
    btn.addEventListener('click', () => clippyLoad(opt.nextId))
    buttons.appendChild(btn)
  })
  const text = document.createElement('p')
  text.innerText = next.text
  clippyText.append(text, buttons)
}
