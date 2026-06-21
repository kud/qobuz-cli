import { defineCommand } from "citty"
import { connect } from "../lib.js"

export const similar = defineCommand({
  meta: {
    name: "similar",
    description: "List artists similar to the given artist",
  },
  args: {
    id: { type: "positional", description: "Artist ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const artists = await client.artists.getSimilar(Number(args.id))
    for (const artist of artists) console.log(`  ${artist.id}  ${artist.name}`)
  },
})
