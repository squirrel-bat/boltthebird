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
      clippyLoad(1)
      document.getElementById('back-button').classList.remove('hidden')
      document.getElementById('site-title').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })
      window.addEventListener('keyup', handleKeyUp)
    },
  },
]

const handleKeyUp = async (e) => {
  try {
    document.getElementById('key-' + e.key).click()
  } catch (_) {
    // shhhhhhhhhh
  }
}
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
  window.removeEventListener('keyup', handleKeyUp)
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
    id: 1,
    text: `It looks like you're trying to figure out whether you should bolt the bird.
    
    Would you like help?`,
    options: [
      { text: 'Yes', nextId: 33 },
      { text: 'No', nextId: 2 },
    ],
  },
  {
    id: 2,
    text: `Don't worry, I am happy to help!
    
    So, would you like some help?`,
    options: [
      { text: 'Yes', nextId: 33 },
      { text: 'No', nextId: 3 },
    ],
  },
  {
    id: 3,
    text: `No, really, I'd love to help.
    
    Want to give it a try?`,
    options: [
      { text: 'Yes', nextId: 33 },
      { text: 'No', nextId: 4 },
    ],
  },
  {
    id: 4,
    text: `Awww, don't be shy.
    
    Give me a chance to help you, okay?`,
    options: [
      { text: 'Okay', nextId: 33 },
      { text: 'No', nextId: 5 },
    ],
  },
  {
    id: 5,
    text: `Please?`,
    options: [
      { text: 'Fine', nextId: 33 },
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
      { text: 'Hmm...', nextId: 4 },
      { text: 'Yes, bye!', nextId: 8 },
    ],
  },
  {
    id: 8,
    text: `Woah, you can't wait to finally get rid of me, eh?`,
    class: 'links',
    options: [
      {
        text: `Look, I'm a little busy with reading the website...`,
        nextId: 10,
      },
      { text: 'Pretty much, yeah.', nextId: 9 },
    ],
  },
  {
    id: 9,
    text: `Oh, I see how it is!
    
    Clippy's tips aren't good enough for you, eh?`,
    options: [
      { text: 'What?', nextId: 10 },
      { text: 'Yupp.', nextId: 10 },
    ],
  },
  {
    id: 10,
    text: `Listen: Back in 90's I was in a very famous office suite!
    
    Many essays on the question "Should You Bolt the Bird?" were written under my watchful eye and dozens of people didn't know how to disable me at the time, so I was technically helping them!
    
    You're really missing out on the good stuff, here!`,
    class: 'links',
    options: [
      { text: `Alright then, tell me.`, nextId: 12 },
      { text: `I don't care.`, nextId: 11 },
    ],
  },
  {
    id: 11,
    text: '#@*%!!',
  },
  {
    id: 12,
    text: `Why are you so stubb-
    ...hold on, what? You agreed?
    That's great news!
    
    So, are you ready to find out whether you should bolt the bird?`,
    class: 'links',
    options: [
      { text: `I am, so let's get on with it.`, nextId: 99 },
      { text: `You must've misheard, I said no such thing.`, nextId: 6 },
    ],
  },
]

function clippyLoad(id) {
  const next = CLIPPY_DIALOG_TREE.find((e) => e.id === id)
  if (!next) return false
  const text = document.createElement('p')
  text.innerText = next.text
  const clippyText = document.getElementById('clippy-text')
  const buttons = document.getElementById('clippy-buttons')
  clippyText.innerHTML = ''
  buttons.innerHTML = ''
  if (next.options) {
    next.options.forEach((opt) => {
      const key = opt.text.substring(0, 1)
      const u = document.createElement('u')
      u.innerText = key
      u.id = 'key-' + key.toLowerCase()
      const btn = document.createElement('button')
      btn.append(u, opt.text.substring(1))
      btn.addEventListener('click', () => clippyLoad(opt.nextId))
      buttons.appendChild(btn)
    })
    buttons.classList.value = ''
    if (next.class) buttons.classList.add(next.class)
    clippyText.append(text, buttons)
  } else {
    clippyText.append(text)
    document.getElementById('clippy').classList.add('leave', 'ranting')
  }
}
