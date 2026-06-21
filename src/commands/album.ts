import { defineCommand } from "citty"
import { connect } from "../lib.js"

export const album = defineCommand({
  meta: { name: "album", description: "Show album details" },
  args: {
    id: { type: "positional", description: "Album ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const album = await client.albums.get(args.id)
    console.log(`${album.title}`)
    console.log(`by ${album.artist?.name ?? "?"}`)
    console.log(
      `${album.tracksCount ?? "?"} tracks · released ${album.releaseDate ?? "?"}${album.hires ? " · Hi-Res" : ""}`,
    )
    console.log(`open: ${client.deepLink.album(album.id)}`)
  },
})
