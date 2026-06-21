import { defineCommand } from "citty"
import { connect, deepLinkFor } from "../lib.js"
import { currentTrackId } from "../now-playing.js"
import { copyToClipboard } from "../prompts.js"

const copyLink = async (link: string) => {
  const copied = await copyToClipboard(link)
  console.log(copied ? `✓ copied ${link}` : link)
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
  },
  run: async ({ args }) => {
    const client = await connect()

    if (!args.type) {
      const trackId = await currentTrackId()
      if (!trackId) {
        console.error(
          "Nothing playing — couldn't read Qobuz's current track. Is the Qobuz app open and playing?",
        )
        process.exit(1)
      }
      await copyLink(client.deepLink.track(trackId))
      return
    }

    if (!args.id) {
      console.error("usage: qobuz url <album|track|playlist|artist> <id>")
      process.exit(1)
    }
    const link = deepLinkFor(client, args.type, args.id)
    if (!link) {
      console.error("type must be one of: album, track, playlist, artist")
      process.exit(1)
    }
    await copyLink(link)
  },
})
