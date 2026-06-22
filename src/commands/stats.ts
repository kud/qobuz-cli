import { defineCommand } from "citty"
import { readLibraryStats } from "@kud/qobuz"
import { accent, bar, bold, dim } from "../ui.js"

const n = (value: number) => value.toLocaleString("en-US")
const pct = (count: number, total: number) =>
  total ? `${Math.round((1000 * count) / total) / 10}%` : ""

type Row = { label: string; value: number; suffix?: string }

const chart = (title: string, rows: Row[], scaleMax?: number) => {
  if (!rows.length) return
  const max = scaleMax ?? Math.max(...rows.map((r) => r.value))
  const labelWidth = Math.max(...rows.map((r) => r.label.length))
  const valueWidth = Math.max(...rows.map((r) => n(r.value).length))
  console.log(`\n${bold(title)}`)
  for (const { label, value, suffix } of rows) {
    const line = `  ${label.padEnd(labelWidth)}  ${accent(bar(value, max))}  ${dim(n(value).padStart(valueWidth))}`
    console.log(suffix ? `${line}  ${dim(suffix)}` : line)
  }
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
      `${bold("📊  Collection")}  ${dim(
        `${n(totals.offlineAlbums)} albums · ${n(totals.offlineArtists)} artists · ${n(totals.offlineTracks)} offline · ${n(totals.savedTracks)} saved`,
      )}`,
    )

    chart(
      "🎚️  Quality · offline tracks",
      quality.map((q) => ({
        label: `${q.bitDepth}-bit`,
        value: q.count,
        suffix: pct(q.count, totals.offlineTracks),
      })),
      totals.offlineTracks,
    )
    chart(
      "🎸  Top genres",
      topGenres.map((g) => ({ label: g.name, value: g.count })),
    )
    chart(
      "🎤  Top artists · by albums",
      topArtists.map((a) => ({ label: a.name, value: a.count })),
    )
    chart(
      "🏷️  Top labels",
      topLabels.map((l) => ({ label: l.name, value: l.count })),
    )
    chart(
      "📅  Added recently",
      recentlyAdded.map((m) => ({ label: m.month, value: m.count })),
    )
  },
})
