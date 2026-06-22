import { defineCommand } from "citty"
import { connect } from "../lib.js"
import { bold, dim, link } from "../ui.js"

export const album = defineCommand({
  meta: { name: "album", description: "Show album details" },
  args: {
    id: { type: "positional", description: "Album ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const album = await client.albums.get(args.id)
    const meta = [
      `${album.tracksCount ?? "?"} tracks`,
      `released ${album.releaseDate ?? "?"}`,
      album.hires ? "Hi-Res" : undefined,
    ]
      .filter(Boolean)
      .join(" · ")
    console.log(`\n${bold(`💿  ${album.title}`)}`)
    console.log(`  ${dim(`by ${album.artist?.name ?? "?"}`)}`)
    console.log(`  ${dim(meta)}`)
    console.log(`  ${link(client.deepLink.album(album.id))}`)
  },
})
