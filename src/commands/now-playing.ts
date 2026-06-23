import { defineCommand } from "citty"
import { connect, formatDuration } from "../lib.js"
import { bold, dim, link } from "../ui.js"

export const nowPlaying = defineCommand({
  meta: {
    name: "now-playing",
    description: "Show the track currently playing in the Qobuz desktop app",
  },
  run: async () => {
    const client = await connect()
    const track = await client.nowPlaying()
    if (!track) {
      console.error("Nothing playing in Qobuz.")
      process.exit(1)
    }
    console.log(`\n${bold(`🎵  ${track.title}`)}`)
    console.log(`  ${dim(`by ${track.artist?.name ?? "?"}`)}`)
    if (track.album?.title) console.log(`  ${dim(track.album.title)}`)
    const duration = formatDuration(track.duration)
    if (duration) console.log(`  ${dim(duration)}`)
    console.log(`  ${link(client.deepLink.track(track.id))}`)
  },
})
