import { defineCommand } from "citty"
import { connect } from "../lib.js"

export const artist = defineCommand({
  meta: { name: "artist", description: "Show artist details" },
  args: {
    id: { type: "positional", description: "Artist ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const artist = await client.artists.get(Number(args.id))
    console.log(artist.name)
    if (artist.albumsCount !== undefined)
      console.log(`${artist.albumsCount} albums`)
    console.log(`open: ${client.deepLink.artist(artist.id)}`)
  },
})
