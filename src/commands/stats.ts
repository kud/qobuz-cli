import { defineCommand } from "citty"
import { readLibraryStats } from "@kud/qobuz"

const pct = (count: number, total: number) =>
  total ? `${Math.round((1000 * count) / total) / 10}%` : ""

const section = (title: string, rows: Array<[string, string]>) => {
  if (!rows.length) return
  const width = Math.max(...rows.map(([label]) => label.length))
  console.log(`\n${title}`)
  for (const [label, value] of rows)
    console.log(`  ${label.padEnd(width)}  ${value}`)
}

export const stats = defineCommand({
  meta: {
    name: "stats",
    description: "Show collection analytics from your Qobuz desktop library",
  },
  args: {
    limit: { type: "string", description: "Rows per breakdown", default: "10" },
  },
  run: async ({ args }) => {
    const data = await readLibraryStats({ limit: Number(args.limit) })
    if (!data) {
      console.error(
        "No Qobuz library found — is the desktop app installed (macOS)?",
      )
      process.exit(1)
    }

    const { totals, quality, topGenres, topLabels, topArtists, recentlyAdded } =
      data
    console.log(
      `Collection: ${totals.offlineAlbums} albums · ${totals.offlineArtists} artists · ${totals.offlineTracks} offline tracks · ${totals.savedTracks} saved tracks`,
    )

    section(
      "Quality (offline tracks)",
      quality.map((q) => [
        `${q.bitDepth}-bit`,
        `${q.count}  ${pct(q.count, totals.offlineTracks)}`,
      ]),
    )
    section(
      "Top genres",
      topGenres.map((g) => [g.name, String(g.count)]),
    )
    section(
      "Top artists (by albums)",
      topArtists.map((a) => [a.name, String(a.count)]),
    )
    section(
      "Top labels",
      topLabels.map((l) => [l.name, String(l.count)]),
    )
    section(
      "Added recently",
      recentlyAdded.map((m) => [m.month, String(m.count)]),
    )
  },
})
