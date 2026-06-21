import { defineCommand } from "citty"
import { type MediaKey, sendMediaKey } from "../media-key.js"

const playbackCommand = (name: string, description: string, key: MediaKey) =>
  defineCommand({
    meta: { name, description },
    run: async () => {
      try {
        await sendMediaKey(key)
      } catch (error) {
        console.error((error as Error).message)
        process.exit(1)
      }
    },
  })

export const play = playbackCommand(
  "play",
  "Toggle play/pause in the active player (Qobuz)",
  "play",
)
export const next = playbackCommand("next", "Skip to the next track", "next")
export const previous = playbackCommand(
  "previous",
  "Go to the previous track",
  "previous",
)
export const forward = playbackCommand(
  "forward",
  "Fast-forward within the current track",
  "forward",
)
export const rewind = playbackCommand(
  "rewind",
  "Rewind within the current track",
  "rewind",
)
