import { defineCommand } from "citty"
import { connect, formatDuration } from "../lib.js"

export const track = defineCommand({
  meta: { name: "track", description: "Show track details" },
  args: {
    id: { type: "positional", description: "Track ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const track = await client.tracks.get(Number(args.id))
    console.log(track.title)
    console.log(
      `by ${track.artist?.name ?? "?"}${track.album ? ` · ${track.album.title}` : ""}`,
    )
    console.log(
      `${formatDuration(track.duration)}${track.hires ? " · Hi-Res" : ""}`,
    )
    console.log(`open: ${client.deepLink.track(track.id)}`)
  },
})
