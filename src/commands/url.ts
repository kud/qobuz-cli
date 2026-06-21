import { defineCommand } from "citty"
import { readNowPlayingTrackId, type QobuzClient } from "@kud/qobuz"
import { connect, deepLinkFor } from "../lib.js"
import { copyToClipboard } from "../prompts.js"

const currentTrackLink = async (client: QobuzClient) => {
  const trackId = await readNowPlayingTrackId()
  if (!trackId) {
    console.error(
      "Nothing playing — couldn't read Qobuz's current track. Is the Qobuz app open and playing?",
    )
    process.exit(1)
  }
  return client.deepLink.track(trackId)
}

const specificLink = (client: QobuzClient, type: string, id?: string) => {
  if (!id) {
    console.error("usage: qobuz url <album|track|playlist|artist> <id>")
    process.exit(1)
  }
  const link = deepLinkFor(client, type, id)
  if (!link) {
    console.error("type must be one of: album, track, playlist, artist")
    process.exit(1)
  }
  return link
}

export const url = defineCommand({
  meta: {
    name: "url",
    description:
      "Copy a deep-link to the clipboard — the playing track, or a given item",
  },
  args: {
    type: {
      type: "positional",
      description:
        "album | track | playlist | artist (omit for the current track)",
      required: false,
    },
    id: {
      type: "positional",
      description: "ID (omit for the current track)",
      required: false,
    },
    plain: {
      type: "boolean",
      description:
        "Print the bare URL to stdout (no clipboard) — for scripting",
      default: false,
    },
  },
  run: async ({ args }) => {
    const client = await connect()
    const link = args.type
      ? specificLink(client, args.type, args.id)
      : await currentTrackLink(client)

    if (args.plain) {
      console.log(link)
      return
    }
    const copied = await copyToClipboard(link)
    console.log(copied ? `✓ copied ${link}` : link)
  },
})
