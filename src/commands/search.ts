import { defineCommand } from "citty"
import { connect, formatDuration } from "../lib.js"
import { accent, columns, dim, heading, muted } from "../ui.js"

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
      heading("💿  Albums")
      console.log(
        columns(
          results.albums.map((album) => [
            accent(album.title),
            dim(album.artist?.name ?? "?"),
            muted(String(album.id)),
          ]),
        ),
      )
    }
    if (results.artists.length) {
      heading("🎤  Artists")
      console.log(
        columns(
          results.artists.map((artist) => [
            accent(artist.name),
            muted(String(artist.id)),
          ]),
        ),
      )
    }
    if (results.tracks.length) {
      heading("🎵  Tracks")
      console.log(
        columns(
          results.tracks.map((track) => [
            accent(track.title),
            dim(track.artist?.name ?? "?"),
            dim(formatDuration(track.duration)),
            muted(String(track.id)),
          ]),
          ["left", "left", "right", "left"],
        ),
      )
    }
  },
})
