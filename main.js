// Clarq landing page v2 — replaces v1's React + Framer Motion behaviour with plain DOM code.

// The Google Form that receives pilot inquiries (same form and entry IDs as v1).
const FORM_RESPONSE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf3px-p8kJlYTGSl-bGgB7Z8Dg3eYnyM8dOSIoXW3yzxUyElQ/formResponse'
const FORM_ENTRIES = {
  name: 'entry.1201728412',
  email: 'entry.647742873',
  company: 'entry.1491683997',
  role: 'entry.628775419',
  message: 'entry.1783845841',
  consent: 'entry.1514486736',
  action: 'entry.268028405',
}
const LEGACY_ACTION_LABEL = 'Join Pilot'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- top nav: appears after scrolling 80% of the viewport ----------

function initTopNav() {
  const nav = document.getElementById('topnav')
  const update = () => nav.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8)

  window.addEventListener('scroll', update, { passive: true })
  update()
}

// ---------- scroll reveal ----------

function initReveal() {
  const items = document.querySelectorAll('.reveal')

  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.remove('reveal'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        const el = entry.target
        observer.unobserve(el)
        el.classList.add('is-visible')
        el.addEventListener(
          'transitionend',
          () => el.classList.remove('reveal', 'is-visible'),
          { once: true },
        )
      })
    },
    { threshold: 0.3 },
  )

  items.forEach((el) => observer.observe(el))
}

// ---------- count-up numbers ("100+", "3,000+", "-90%") ----------

function initCountUp() {
  const items = document.querySelectorAll('[data-count]')
  if (reducedMotion || !('IntersectionObserver' in window)) return

  const run = (el) => {
    const match = el.dataset.count.match(/^(.*?)([\d,]+(?:\.\d+)?)(.*)$/)
    if (!match) return

    const [, prefix, rawNumber, suffix] = match
    const target = Number(rawNumber.replace(/,/g, ''))
    const hasComma = rawNumber.includes(',')
    const duration = 480
    const start = performance.now()

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - t) ** 3
      const value = Math.round(target * eased)
      el.textContent = prefix + (hasComma ? value.toLocaleString('en-US') : value) + suffix
      if (t < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        observer.unobserve(entry.target)
        run(entry.target)
      })
    },
    { threshold: 0.75 },
  )

  items.forEach((el) => observer.observe(el))
}

// ---------- use-case tabs ----------

function initUseCaseTabs() {
  const tabs = document.querySelectorAll('.tab')
  const panels = document.querySelectorAll('.usecase-panel')

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const index = tab.dataset.tab

      tabs.forEach((t) => {
        const active = t === tab
        t.classList.toggle('is-active', active)
        t.setAttribute('aria-pressed', String(active))
      })

      panels.forEach((panel) => {
        const active = panel.dataset.panel === index
        panel.hidden = !active
        panel.classList.toggle('is-active', active)
        if (active && !reducedMotion) {
          panel.classList.remove('is-entering')
          void panel.offsetWidth // restart the animation
          panel.classList.add('is-entering')
        }
      })
    })
  })
}

// ---------- FAQ: one item open at a time ----------

function initFaq() {
  const items = document.querySelectorAll('.faq-item')

  items.forEach((item) => {
    const button = item.querySelector('.faq-q')

    button.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open')

      items.forEach((other) => {
        const open = other === item && willOpen
        other.classList.toggle('is-open', open)
        other.querySelector('.faq-q').setAttribute('aria-expanded', String(open))
      })
    })
  })
}

// ---------- pilot form ----------

function initPilotForm() {
  const form = document.querySelector('.pilot-form')
  const success = document.querySelector('.form-success')
  const formError = form.querySelector('.form-error')
  const roleInput = form.elements.role
  const chips = document.querySelectorAll('.role-chip')
  const submitButton = form.querySelector('button[type="submit"]')
  const submitLabel = submitButton.textContent

  const showForm = () => {
    success.hidden = true
    form.hidden = false
    formError.hidden = true
  }

  const selectRole = (role) => {
    roleInput.value = role
    chips.forEach((chip) => chip.classList.toggle('is-active', chip.dataset.role === role))
    showForm()
  }

  chips.forEach((chip) => chip.addEventListener('click', () => selectRole(chip.dataset.role)))

  // "Start a partnership inquiry" pre-selects the AI / Data Partnership role
  document.querySelectorAll('[data-request-role]').forEach((link) => {
    link.addEventListener('click', () => selectRole(link.dataset.requestRole))
  })

  const setError = (field, message) => {
    const el = form.querySelector(`[data-error="${field}"]`)
    el.textContent = message || ''
    el.hidden = !message
  }

  const validate = () => {
    const name = form.elements.name.value.trim()
    const email = form.elements.email.value.trim()
    const consent = form.elements.consent.checked
    const errors = {
      name: name.length < 2 ? 'Please enter your name.' : '',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please use a valid work email.',
      consent: consent ? '' : 'Please confirm consent to proceed.',
    }

    Object.entries(errors).forEach(([field, message]) => setError(field, message))
    return Object.values(errors).every((message) => !message)
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    formError.hidden = true
    if (!validate()) return

    const values = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      company: form.elements.company.value.trim(),
      role: roleInput.value,
      message: form.elements.message.value.trim(),
    }

    const data = new URLSearchParams()
    if (values.name) data.append(FORM_ENTRIES.name, values.name)
    data.append(FORM_ENTRIES.email, values.email)
    if (values.company) data.append(FORM_ENTRIES.company, values.company)
    if (values.role) data.append(FORM_ENTRIES.role, values.role)
    if (values.message) data.append(FORM_ENTRIES.message, values.message)
    data.append(FORM_ENTRIES.consent, 'Yes')
    data.append(FORM_ENTRIES.action, LEGACY_ACTION_LABEL)

    submitButton.disabled = true
    submitButton.textContent = 'Sending...'

    try {
      // no-cors: Google Forms gives no readable response, so a network
      // failure is the only error we can detect (same as v1)
      await fetch(FORM_RESPONSE_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      })
      form.reset()
      roleInput.value = ''
      chips.forEach((chip) => chip.classList.remove('is-active'))
      form.hidden = true
      success.hidden = false
    } catch {
      formError.hidden = false
    } finally {
      submitButton.disabled = false
      submitButton.textContent = submitLabel
    }
  })
}

initTopNav()
initReveal()
initCountUp()
initUseCaseTabs()
initFaq()
initPilotForm()
