import { defineCommand } from "citty"
import { connect } from "../lib.js"
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
    const builders: Record<string, (id: string) => string> = {
      album: (id) => client.deepLink.album(id),
      track: (id) => client.deepLink.track(Number(id)),
      playlist: (id) => client.deepLink.playlist(Number(id)),
      artist: (id) => client.deepLink.artist(Number(id)),
    }
    const build = builders[args.type]
    if (!build) {
      console.error("type must be one of: album, track, playlist, artist")
      process.exit(1)
    }
    const link = build(args.id)
    console.log(`opening ${link}`)
    await openUrl(link)
  },
})
