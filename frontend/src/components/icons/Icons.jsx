function base(props) {
  return {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  }
}

export function IconSparkle(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  )
}

export function IconShieldCheck(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.2 7 8.5 4.1-1.3 7-4.3 7-8.5V6z" />
      <path d="m9 12 2 2 4-4.2" />
    </svg>
  )
}

export function IconHeart(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 20s-7-4.4-9.4-9C1.2 8 2 5 5 4.3c2-.5 3.8.4 5 2.2 1.2-1.8 3-2.7 5-2.2 3 .7 3.8 3.7 2.4 6.7C19 15.6 12 20 12 20Z" />
    </svg>
  )
}

export function IconTruck(props) {
  return (
    <svg {...base(props)}>
      <path d="M3 7h10v9H3z" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  )
}

export function IconSearch(props) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  )
}

export function IconCart(props) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
      <path d="M2.5 3.5h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7.5H6" />
    </svg>
  )
}

export function IconUser(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" />
    </svg>
  )
}

export function IconChat(props) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5h16v10H9.5L5 19v-3.5H4Z" />
    </svg>
  )
}

export function IconArrowRight(props) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconClose(props) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function IconSend(props) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12 20 4.5 16.2 20l-4.6-6-6.2-2Z" />
      <path d="M11.6 14 20 4.5" />
    </svg>
  )
}

export function IconRobot(props) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="8.5" width="15" height="11" rx="3.5" />
      <path d="M12 8.5V5M9.5 5h5" />
      <circle cx="9.3" cy="14" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="14" r="1.3" fill="currentColor" stroke="none" />
      <path d="M9.5 17.3h5" />
    </svg>
  )
}

export function IconMinus(props) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function IconPlus(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconBell(props) {
  return (
    <svg {...base(props)}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.4 5.2 1.4 5.2H4.6S6 14 6 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function IconTrash(props) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M9 7V4.8c0-.6.5-1.1 1.1-1.1h3.8c.6 0 1.1.5 1.1 1.1V7M6.5 7 7.3 19.2c0 .7.6 1.3 1.3 1.3h6.8c.7 0 1.3-.6 1.3-1.3L17.5 7" />
    </svg>
  )
}
