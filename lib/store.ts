import { create } from 'zustand'

export type GameScene = 'landing' | 'transitioning'

interface GameState {
  scene: GameScene
  setScene: (scene: GameScene) => void
}

export const useGameStore = create<GameState>(set => ({
  scene: 'landing',
  setScene: scene => set({ scene }),
}))
