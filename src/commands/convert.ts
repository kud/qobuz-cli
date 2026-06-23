import { defineCommand } from "citty"
import { connect } from "../lib.js"
import { bold, dim, good, heading, link, muted } from "../ui.js"
import {
  deezerByIsrc,
  findIsrc,
  isLikelyMatch,
  resolveLink,
  spotifySearchUrl,
  ytMusicSearchUrl,
  type ResolveFailure,
} from "../resolve.js"

const FAILURE: Record<ResolveFailure, string> = {
  invalid: "Not a URL. Pass a Spotify, YouTube Music, or Qobuz track link.",
  qobuz: "Unsupported Qobuz link — pass a track link.",
  "unsupported-type":
    "Only track links are supported (not albums, playlists, or podcasts).",
  unknown: "Unsupported link — Spotify, YouTube Music, or Qobuz only.",
}

export const convert = defineCommand({
  meta: {
    name: "convert",
    description:
      "Convert a Spotify / YouTube Music / Qobuz track link to the other services",
  },
  args: {
    url: { type: "positional", description: "Track link", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const outcome = await resolveLink(args.url)

    if (!outcome.ok) {
      console.error(FAILURE[outcome.reason])
      process.exit(1)
    }

    // Reverse: a Qobuz track → links on the other services.
    if (outcome.direction === "from-qobuz") {
      const track = await client.tracks.get(outcome.qobuzTrackId)
      const query = `${track.artist?.name ?? ""} ${track.title}`.trim()
      const deezer = track.isrc ? await deezerByIsrc(track.isrc) : undefined
      console.log(`\n${bold(`🎵  ${track.title}`)}`)
      console.log(`  ${dim(`by ${track.artist?.name ?? "?"}`)}`)
      heading("Find elsewhere")
      console.log(`  ${dim("YouTube Music")}  ${link(ytMusicSearchUrl(query))}`)
      console.log(`  ${dim("Spotify      ")}  ${link(spotifySearchUrl(query))}`)
      if (deezer)
        console.log(
          `  ${dim("Deezer       ")}  ${link(deezer)} ${good("exact")}`,
        )
      return
    }

    // Forward: a foreign track → the matching Qobuz track.
    const resolved = outcome.track
    const query = `${resolved.artist} ${resolved.title}`
    const isrc = await findIsrc(resolved)
    const exact = isrc ? await client.tracks.match({ isrc, query }) : undefined
    const track =
      exact ??
      (await client.search.search(query, { limit: 5 })).tracks.find((t) =>
        isLikelyMatch(resolved, t),
      )

    console.log(`\n${dim(`From  ${resolved.artist} — ${resolved.title}`)}`)
    if (!track) {
      console.error(`\nNo Qobuz match found.`)
      process.exit(1)
    }
    console.log(`${bold(`🎵  ${track.title}`)}`)
    console.log(`  ${dim(`by ${track.artist?.name ?? "?"}`)}`)
    console.log(
      `  ${exact ? good("exact match (ISRC)") : muted("approximate match")}`,
    )
    console.log(`  ${link(client.deepLink.track(track.id))}`)
  },
})
