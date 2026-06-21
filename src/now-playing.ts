import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"

const playerStatePath = join(
  homedir(),
  "Library/Application Support/Qobuz/player-0.json",
)

export const currentTrackId = async (): Promise<number | undefined> => {
  try {
    const state = JSON.parse(await readFile(playerStatePath, "utf8"))
    const queue = state?.playqueue?.data
    const trackId = queue?.items?.[queue?.currentIndex]?.trackId
    return typeof trackId === "number" ? trackId : undefined
  } catch {
    return undefined
  }
}
