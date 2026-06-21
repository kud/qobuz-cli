import { defineCommand } from "citty"
import { connect, deepLinkFor } from "../lib.js"

export const url = defineCommand({
  meta: {
    name: "url",
    description:
      "Print the open.qobuz.com deep-link for an item (without opening it)",
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
    const link = deepLinkFor(client, args.type, args.id)
    if (!link) {
      console.error("type must be one of: album, track, playlist, artist")
      process.exit(1)
    }
    console.log(link)
  },
})
