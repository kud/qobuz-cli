import { defineCommand } from "citty"
import { appLinkFor, connect } from "../lib.js"
import { openUrl } from "../prompts.js"

export const open = defineCommand({
  meta: {
    name: "open",
    description: "Open an album/track/playlist/artist in the Qobuz app",
  },
  args: {
    type: {
      type: "positional",
      description: "album | track | playlist | artist",
      required: true,
    },
    id: { type: "positional", description: "ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const link = appLinkFor(client, args.type, args.id)
    if (!link) {
      console.error("type must be one of: album, track, playlist, artist")
      process.exit(1)
    }
    console.log(`opening ${link}`)
    await openUrl(link)
  },
})
