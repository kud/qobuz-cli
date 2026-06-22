const ESC = String.fromCharCode(27)
const colour = process.stdout.isTTY
const ansi = new RegExp(`${ESC}\\[[0-9;]*m`, "g")

const style = (open: string, close: string) => (text: string) =>
  colour ? `${ESC}[${open}m${text}${ESC}[${close}m` : text

export const bold = style("1", "22")
export const dim = style("2", "22")
export const accent = style("36", "39")
export const muted = style("90", "39")
export const good = style("32", "39")

export const heading = (text: string) => console.log(`\n${bold(text)}`)

export const success = (text: string) => console.log(`${good("✓")} ${text}`)

export const link = (url: string) => `${dim("↗")} ${accent(url)}`

const visibleWidth = (text: string) => text.replace(ansi, "").length

/**
 * Align rows of pre-styled cells into columns. Widths are measured on the
 * *visible* text (ANSI escapes stripped), so colour never breaks alignment.
 */
export const columns = (
  rows: string[][],
  aligns: Array<"left" | "right"> = [],
) => {
  const colCount = Math.max(0, ...rows.map((row) => row.length))
  const widths = Array.from({ length: colCount }, (_, i) =>
    Math.max(0, ...rows.map((row) => visibleWidth(row[i] ?? ""))),
  )
  const pad = (cell: string, i: number) => {
    const gap = " ".repeat(Math.max(0, (widths[i] ?? 0) - visibleWidth(cell)))
    return aligns[i] === "right" ? gap + cell : cell + gap
  }
  return rows.map((row) => `  ${row.map(pad).join("  ").trimEnd()}`).join("\n")
}

const BLOCKS = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"]

/** Render a smooth horizontal bar using eighth-block glyphs. */
export const bar = (value: number, max: number, width = 22) => {
  const units = max > 0 ? (value / max) * width : 0
  const full = Math.floor(units)
  const partial = BLOCKS[Math.round((units - full) * 8)] ?? ""
  return `${"█".repeat(full)}${partial}`.padEnd(width)
}
