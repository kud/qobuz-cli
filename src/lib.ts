import {
  createKeychainStore,
  createQobuzClient,
  type QobuzClient,
} from "@kud/qobuz"

export const store = createKeychainStore()

export const connect = async (): Promise<QobuzClient> => {
  try {
    return await createQobuzClient({ store })
  } catch (error) {
    const qobuzError = error as { kind?: string; message?: string }
    if (qobuzError.kind === "auth") {
      console.error("Not connected — run `qobuz login` first.")
    } else {
      console.error(`Error: ${qobuzError.message ?? error}`)
    }
    process.exit(1)
  }
}

export const formatDuration = (seconds?: number) => {
  if (!seconds) return ""
  const minutes = Math.floor(seconds / 60)
  const remainder = String(seconds % 60).padStart(2, "0")
  return `${minutes}:${remainder}`
}

export const deepLinkFor = (
  client: QobuzClient,
  type: string,
  id: string,
): string | undefined => {
  const builders: Record<string, (id: string) => string> = {
    album: (value) => client.deepLink.album(value),
    track: (value) => client.deepLink.track(Number(value)),
    playlist: (value) => client.deepLink.playlist(Number(value)),
    artist: (value) => client.deepLink.artist(Number(value)),
  }
  return builders[type]?.(id)
}
