/* Minimal inline icon set (stroked, currentColor). */
import type { SVGProps } from 'react'

type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'check'
  | 'x'
  | 'refresh'
  | 'sun'
  | 'moon'
  | 'sparkles'
  | 'clock'
  | 'heart'
  | 'flame'
  | 'volume'
  | 'home'
  | 'list'
  | 'target'
  | 'keyboard'
  | 'layers'
  | 'grid'
  | 'chart'
  | 'zap'
  | 'ear'
  | 'volume-x'

const PATHS: Record<IconName, string> = {
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  sparkles: 'M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4L12 3zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  heart: 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z',
  flame: 'M12 2c1 3-1 5-2 6.5C8.5 10.5 8 12 8 13a4 4 0 0 0 8 0c0-1.8-1-3.4-2-4.5 2 .5 3 2 3 4.5a7 7 0 1 1-13.5-2.6C5 7 9 6 12 2z',
  volume: 'M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
  home: 'M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  target:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.4a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2z',
  keyboard:
    'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8',
  layers: 'M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  chart: 'M3 3v18h18M8 16V9M13 16V5M18 16v-4',
  zap: 'M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z',
  ear: 'M6 11a6 6 0 1 1 12 0c0 2.5-1.5 3.5-2.5 4.5S14 17.5 14 19a2.5 2.5 0 0 1-5 0M8.5 9a3.5 3.5 0 0 1 5.5-2.5',
  'volume-x': 'M11 5L6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6',
}

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
