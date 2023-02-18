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
      document
        .getElementById('site-title')
        .scrollIntoView({
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
