import type { MediaKey } from "@kud/macos-media-keys"

export const mediaKeysAvailable = process.platform === "darwin"

export const sendMediaKey = async (key: MediaKey): Promise<boolean> => {
  try {
    const { sendMediaKey: send } = await import("@kud/macos-media-keys")
    await send(key)
    return true
  } catch {
    return false
  }
}
