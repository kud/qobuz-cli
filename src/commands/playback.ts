import { defineCommand } from "citty"
import type { MediaKey } from "@kud/macos-media-keys"

const playbackCommand = (name: string, description: string, key: MediaKey) =>
  defineCommand({
    meta: { name, description },
    run: async () => {
      try {
        const { sendMediaKey } = await import("@kud/macos-media-keys")
        await sendMediaKey(key)
      } catch (error) {
        console.error((error as Error).message ?? `playback (${key}) failed`)
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
