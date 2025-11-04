/**
 * Application constants
 */

export const MAX_HORSES = 20
export const HORSES_PER_RACE = 10
export const TOTAL_ROUNDS = 6

export const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const

export const MAX_SPEED = 100
export const MIN_CONDITION = 1
export const MAX_CONDITION = 100

// Points awarded based on position (1st gets 10 points, 10th gets 1 point)
export const POSITION_POINTS = [10, 8, 6, 5, 4, 3, 2, 1, 1, 1] as const

// Horse names pool
export const HORSE_NAMES = [
  'Thunder Strike',
  'Lightning Bolt',
  'Golden Wind',
  'Silver Arrow',
  'Midnight Star',
  'Desert Storm',
  'Ocean Breeze',
  'Mountain King',
  'Fire Spirit',
  'Ice Runner',
  'Brave Heart',
  'Swift Shadow',
  'Royal Prince',
  'Wild Mustang',
  'Storm Chaser',
  'Victory Dance',
  'Noble Knight',
  'Mystic Dream',
  'Phoenix Rising',
  'Eternal Flame',
] as const

// Distinct colors for horses (using color theory for maximum differentiation)
export const HORSE_COLORS = [
  '#FF4444', // Red
  '#44FF44', // Green
  '#4444FF', // Blue
  '#FFFF44', // Yellow
  '#FF44FF', // Magenta
  '#44FFFF', // Cyan
  '#FF8844', // Orange
  '#8844FF', // Purple
  '#44FF88', // Mint
  '#FF4488', // Pink
  '#88FF44', // Lime
  '#4488FF', // Sky Blue
  '#FFB700', // Gold
  '#00FFB7', // Turquoise
  '#B700FF', // Violet
  '#FF00B7', // Hot Pink
  '#B7FF00', // Chartreuse
  '#00B7FF', // Azure
  '#8B4513', // Saddle Brown
  '#2E8B57', // Sea Green
] as const

// Animation constants
export const ANIMATION_FPS = 60
export const FRAME_DURATION = 1000 / ANIMATION_FPS // ~16.67ms

// Race speed factors
export const CONDITION_WEIGHT = 0.4
export const RANDOM_FACTOR_MIN = 0.8
export const RANDOM_FACTOR_MAX = 1.2
export const FATIGUE_FACTOR = 0.95 // Condition multiplier after each race

// Rest recovery (applied to horses that do not run a round)
export const REST_RECOVERY_MIN = 2
export const REST_RECOVERY_MAX = 6
