import { defineCommand } from "citty"
import { connect, formatDuration } from "../lib.js"
import { bold, dim, link } from "../ui.js"

export const track = defineCommand({
  meta: { name: "track", description: "Show track details" },
  args: {
    id: { type: "positional", description: "Track ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const track = await client.tracks.get(Number(args.id))
    const meta = [
      formatDuration(track.duration),
      track.hires ? "Hi-Res" : undefined,
    ]
      .filter(Boolean)
      .join(" · ")
    console.log(`\n${bold(`🎵  ${track.title}`)}`)
    console.log(
      `  ${dim(`by ${track.artist?.name ?? "?"}${track.album ? ` · ${track.album.title}` : ""}`)}`,
    )
    if (meta) console.log(`  ${dim(meta)}`)
    console.log(`  ${link(client.deepLink.track(track.id))}`)
  },
})
