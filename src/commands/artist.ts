import { defineCommand } from "citty"
import { connect } from "../lib.js"
import { bold, dim, link } from "../ui.js"

export const artist = defineCommand({
  meta: { name: "artist", description: "Show artist details" },
  args: {
    id: { type: "positional", description: "Artist ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const artist = await client.artists.get(Number(args.id))
    console.log(`\n${bold(`🎤  ${artist.name}`)}`)
    if (artist.albumsCount !== undefined)
      console.log(`  ${dim(`${artist.albumsCount} albums`)}`)
    console.log(`  ${link(client.deepLink.artist(artist.id))}`)
  },
})
