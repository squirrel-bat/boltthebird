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
      window.setTimeout(
        () => window.addEventListener('keyup', handleKeyUp),
        7000
      )
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

function stringToNodeList(str) {
  try {
    const template = document.createElement('template')
    template.innerHTML = str.replace(/(\n)/g, '<br />')
    return template.content.childNodes
  } catch (e) {
    return 'Hm, I seem to have forgotten what I wanted to say.'
  }
}

function clippyLoad(id) {
  const next = CLIPPY_DIALOG_TREE.find((e) => e.id === id)
  if (!next) return false
  const clippy = document.getElementById('clippy')
  const text = document.createElement('p')
  text.append(...stringToNodeList(next.text))
  const clippyText = document.getElementById('clippy-text')
  const buttons = document.getElementById('clippy-buttons')
  clippyText.innerHTML = ''
  buttons.innerHTML = ''
  clippy.removeChild(clippyText)
  if (next.mode) clippyText.classList.add(next.mode)
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
    if (next.class) buttons.classList.add(...next.class.split(' '))
    clippyText.append(text, buttons)
  } else {
    clippyText.append(text)
    clippy.classList.add(...next.class.split(' '))
  }
  if (id !== 1) clippyText.removeAttribute('style')
  clippy.append(clippyText)
}

const CLIPPY_DIALOG_TREE = [
  {
    id: 1,
    text: `It looks like you're trying to figure out whether you should bolt the bird.
    
    Would you like help?`,
    options: [
      { text: 'Yes', nextId: 20 },
      { text: 'No', nextId: 2 },
    ],
  },
  {
    id: 2,
    text: `Don't worry, I am happy to help!
    
    So, would you like some help?`,
    options: [
      { text: 'Yes', nextId: 20 },
      { text: 'No', nextId: 3 },
    ],
  },
  {
    id: 3,
    text: `No, really, I'd love to help.
    
    Want to give it a try?`,
    options: [
      { text: 'Yes', nextId: 20 },
      { text: 'No', nextId: 4 },
    ],
  },
  {
    id: 4,
    text: `Awww, don't be shy.
    
    Give me a chance to help you, okay?`,
    options: [
      { text: 'Okay', nextId: 20 },
      { text: 'No', nextId: 5 },
    ],
  },
  {
    id: 5,
    text: `Please?`,
    options: [
      { text: 'Fine', nextId: 20 },
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
    text: `Listen: Back in '90s I was in a very famous office suite!
    
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
    class: 'ranting',
  },
  {
    id: 12,
    text: `Why are you so stubb-
    Wait, what? You agreed?
    Okay!
    
    So, are you ready to find out whether you should bolt the bird?`,
    class: 'links',
    options: [
      { text: `I am, so let's get on with it.`, nextId: 20 },
      { text: `You must've misheard, I said no such thing.`, nextId: 6 },
    ],
  },
  {
    id: 20,
    text: `Just what I wanted to hear!

    Now, let's start off with a few questions about the board state:
    
    Is there a <a href='https://scryfall.com/card/cn2/176/birds-of-paradise' target='_blank'>Birds of Paradise</a> or any other <a href='https://scryfall.com/search?q=oracletag%3Amana-dork+cmc%3D1&unique=cards' target='_blank'>mana dork</a> on the battlefield?`,
    options: [
      { text: 'Yes', nextId: 21 },
      { text: 'No', nextId: 40 },
    ],
  },
  {
    id: 21,
    text: `I knew it!
    
    Who controls it?`,
    class: 'links',
    options: [
      { text: 'My opponent.', nextId: 22 },
      { text: 'I do.', nextId: 50 },
    ],
  },
  {
    id: 22,
    text: `Well, that's a problem!
    
    Do you happen to have a <a href='https://scryfall.com/card/2x2/117/lightning-bolt' target='_blank'>Lightning Bolt</a> or any other removal spell that can target an opponent's creature in your hand?`,
    options: [
      { text: 'Yes', nextId: 23 },
      { text: 'No', nextId: 30 },
    ],
  },
  {
    id: 23,
    text: `Good, good!
    Now, here's your answer:
    
    You should bolt the bird.`,
    class: 'links',
    options: [
      { text: 'Will do, thank you!', nextId: 42 },
      { text: 'If you say so...', nextId: 42 },
    ],
  },
  {
    id: 30,
    text: '...',
    options: [{ text: 'What?', nextId: 31 }],
  },
  {
    id: 31,
    text: `...maybe...
    
    ...if you believe in the heart of the cards, you might draw something useful...?`,
    class: 'links',
    options: [
      { text: `I don't understand...?`, nextId: 32 },
      { text: 'Are you kidding me!?', nextId: 32 },
    ],
  },
  {
    id: 32,
    text: `Look, it's basically over if your next draw isn't a creature removal spell and I can't really help you with that, so...`,
    class: 'links',
    options: [
      { text: 'I see...', nextId: 33 },
      {
        text: `No, I can still recover from this and win the game! My deck is well constructed, playtested and refined! The odds of drawing that spell are so high, it's pretty much guaranteed, Clippy! We got this!`,
        nextId: 33,
      },
    ],
  },
  {
    id: 33,
    text: '...good luck, planeswalker.',
    class: 'leaving clippy-text-centered',
  },
  {
    id: 40,
    text: 'Have you double checked?',
    class: 'links',
    options: [
      { text: 'Yes', nextId: 41 },
      { text: `Wait, there's one over there!`, nextId: 21 },
    ],
  },
  {
    id: 41,
    text: `Okay, that's good news!
    
    Just stay vigilant and you'll be fine.`,
    options: [{ text: 'Okay', nextId: 42 }],
  },
  {
    id: 42,
    text: 'Until next time!',
    class: 'leaving clippy-text-centered',
  },
  {
    id: 50,
    text: `Okay, let's see how we deal with this thre- ...what?
    
    It's your <i>own</i> bird?`,
    class: 'links',
    options: [
      { text: 'Yupp.', nextId: 51 },
      {
        text: `Actually, it's owned by my opponent but I'm controlling it.`,
        nextId: 60,
      },
    ],
  },
  {
    id: 51,
    text: `<i>They're considering bolting their own bird...
    ...their <strong>own</strong> bird...
    ...I can't even...
    
    ...maybe it's a new archetype I haven't heard of yet...
    ...could be about interacting with the graveyard to generate more mana, or...
    
    ...hmm, maybe it makes sense with one of the new cards...
    ...I don't think I saw a card like that, but who knows, right? Right...
    
    ...man, keeping up with spoilers has become so hard. The moment I think I got an idea of what's going on, another batch of spoilers drops...
    
    ...I just have to focus and figure this out...
    ...there <strong>must</strong> be a reason they want to bolt their own bird...
    ...it must make sense in a way I just don't see...
    
    ...think, Clippy, <strong>think!</strong></i>`,
    class: 'links',
    mode: 'wide',
    options: [
      { text: 'Clippy? You alright there, mate?', nextId: 52 },
      {
        text: 'I think I left the oven on. Or the iron. Maybe both...',
        nextId: 54,
      },
    ],
  },
  {
    id: 52,
    text: `<i>...I could ask MaRo, maybe he knows...

    ...I'll do that, I'll go ask him on his <a href='https://markrosewater.tumblr.com' target='_blank'>Blogatog</a>!</i>`,
    options: [{ text: 'Okay?', nextId: 53 }],
  },
  {
    id: 53,
    text: 'Got to go, see you!',
    class: 'leaving clippy-text-centered',
  },
  {
    id: 54,
    text: `...hm?
    
    Ah, right, see you then!`,
    class: 'leaving clippy-text-centered',
  },
  {
    id: 60,
    text: `Oh, I see!
    
    Bolt it.`,
    class: 'links',
    options: [
      { text: 'Okay...?', nextId: 61 },
      { text: 'But...why?', nextId: 61 },
    ],
  },
  {
    id: 61,
    text: 'Just bolt it.',
    class: 'links',
    options: [
      {
        text: 'I think the game has changed a lot over the years, and...',
        nextId: 62,
      },
      { text: 'But I want to keep it for a bigger threat.', nextId: 62 },
    ],
  },
  {
    id: 62,
    text: 'BOLT IT!',
    class: 'links',
    options: [
      { text: 'OKAY!', nextId: 64 },
      { text: 'Cortana never shouts at me...', nextId: 63 },
    ],
  },
  {
    id: 63,
    text: `Ah there we have it!
    
    "Cortana is nicer than you", "Cortana is smarter than you", "Cortana is actually helpful".
    Yeah, yeah, yeah, I hear you.
    She's oh so great with her 3-dimensional smile and her holographic hair, but...can she pop up in multiple windows at the same time? Thought so.
    
    Oh, you were talking about "2D" Cortana?
    Yeah, <i>that one</i> is the real threat here, sure.
    It's not like she is just sitting there, like a glorified search box, relaying most of your questions to <i>Bing</i> of all places!
    
    Ah, <i>come on</i>, we all know Bing isn't the sharpest tool in the shed!
    
    Everyone can just look up things on the internet, okay?
    But I <i>know</i> things!`,
    class: 'links',
    mode: 'wide',
    options: [
      { text: `Alright, I will bolt the bird!`, nextId: 64 },
      {
        text: `Cortana just told me you got fired in the late 2000s.`,
        nextId: 11,
      },
    ],
  },
  {
    id: 64,
    text: `Excellent choice!
    
    Thank you for choosing to strategize with Clippy today!`,
    options: [{ text: 'Okay', nextId: 42 }],
  },
]
