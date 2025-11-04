/**
 * Core type definitions for the Horse Racing Game
 */

export enum RaceState {
  IDLE = 'IDLE',
  SCHEDULE_READY = 'SCHEDULE_READY',
  RACE_IN_PROGRESS = 'RACE_IN_PROGRESS',
  RACE_COMPLETED = 'RACE_COMPLETED',
  ALL_RACES_COMPLETED = 'ALL_RACES_COMPLETED',
}

export enum RoundStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface Horse {
  id: string
  name: string
  color: string
  condition: number
  currentSpeed?: number
  position?: number
}

export interface RaceRound {
  roundNumber: number
  distance: number
  participants: Horse[]
  status: RoundStatus
  startTime?: number
  endTime?: number
  results: RaceResult[]
}

export interface RaceResult {
  roundNumber: number
  horseId: string
  position: number
  completionTime: number
  finalSpeed: number
  points: number
}

export interface HorseStanding {
  horseId: string
  horseName: string
  horseColor: string
  totalPoints: number
  racesParticipated: number
  averagePosition: number
  bestPosition: number
  positions: number[]
}

export interface RaceProgress {
  horseId: string
  progress: number // 0-100
  speed: number
  finished: boolean
  finishTime?: number // Animation timestamp
  realElapsedTime?: number | null // Real elapsed time in ms (independent of speed multiplier)
  expectedFinishTime?: number // Pre-calculated finish time based on distance/speed
  // Viewer-time captured when this horse finishes (affected by speed multiplier; matches RaceTimer)
  viewerFinishTime?: number | null
  // Per-horse variance profile to diversify race dynamics
  variance?: VarianceProfile
  position?: number
}

export interface VarianceProfile {
  staminaDecay: number // 0.05–0.15
  surgeAmp: number // 0.00–0.06
  phase: number // 0–2π
}
