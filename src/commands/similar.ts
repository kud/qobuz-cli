import { defineCommand } from "citty"
import { connect } from "../lib.js"
import { accent, columns, heading, muted } from "../ui.js"

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
    if (!artists.length) return
    heading("🎤  Similar artists")
    console.log(
      columns(
        artists.map((artist) => [
          accent(artist.name),
          muted(String(artist.id)),
        ]),
      ),
    )
  },
})
