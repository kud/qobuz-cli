import { defineCommand } from "citty"
import { connect, formatDuration } from "../lib.js"

export const search = defineCommand({
  meta: {
    name: "search",
    description: "Search Qobuz for albums, tracks, and artists",
  },
  args: {
    query: { type: "positional", description: "Search query", required: true },
    limit: {
      type: "string",
      description: "Max results per category",
      default: "10",
    },
  },
  run: async ({ args }) => {
    const client = await connect()
    const results = await client.search.search(args.query, {
      limit: Number(args.limit),
    })

    if (results.albums.length) {
      console.log("\nAlbums")
      for (const album of results.albums) {
        console.log(
          `  ${album.id}  ${album.artist?.name ?? "?"} — ${album.title}`,
        )
      }
    }
    if (results.artists.length) {
      console.log("\nArtists")
      for (const artist of results.artists)
        console.log(`  ${artist.id}  ${artist.name}`)
    }
    if (results.tracks.length) {
      console.log("\nTracks")
      for (const track of results.tracks) {
        console.log(
          `  ${track.id}  ${track.artist?.name ?? "?"} — ${track.title}  ${formatDuration(track.duration)}`,
        )
      }
    }
  },
})
