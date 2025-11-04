/**
 * Vuex Store
 * Root store configuration with all modules
 */

import { createStore, Store } from 'vuex'
import horses, { HorsesState } from './horses'
import races, { RacesState } from './races'
import results, { ResultsState } from './results'

export interface RootState {
  horses: HorsesState
  races: RacesState
  results: ResultsState
}

const store = createStore<RootState>({
  modules: {
    horses,
    races,
    results,
  },
})

export default store

// TypeScript helper for useStore
export function useStore(): Store<RootState> {
  return store as Store<RootState>
}
