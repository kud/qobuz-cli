import { useState } from "react"
import { Box, Text, useInput } from "ink"
import { useInputFocus } from "../lib/context.js"

export type ListItem<T> = {
  key: string
  label: string
  hint?: string
  value: T
}

export type ListSection<T> = {
  title: string
  items: ListItem<T>[]
}

type SelectListProps<T> = {
  sections: ListSection<T>[]
  onSubmit: (value: T) => void
  viewport?: number
  arrowOnly?: boolean
}

type FlatRow<T> =
  | { kind: "header"; title: string }
  | { kind: "item"; item: ListItem<T> }

const flatten = <T,>(sections: ListSection<T>[]): FlatRow<T>[] =>
  sections.flatMap((section) =>
    section.items.length === 0
      ? []
      : [
          ...(section.title
            ? [{ kind: "header" as const, title: section.title }]
            : []),
          ...section.items.map((item) => ({ kind: "item" as const, item })),
        ],
  )

const selectableIndices = <T,>(rows: FlatRow<T>[]): number[] =>
  rows.reduce<number[]>((acc, row, index) => {
    if (row.kind === "item") acc.push(index)
    return acc
  }, [])

export const SelectList = <T,>({
  sections,
  onSubmit,
  viewport = 12,
  arrowOnly = false,
}: SelectListProps<T>) => {
  const rows = flatten(sections)
  const selectable = selectableIndices(rows)
  const [cursor, setCursor] = useState(0)
  const { inputFocused } = useInputFocus()
  const active = arrowOnly || !inputFocused

  const clampedCursor = Math.min(cursor, Math.max(0, selectable.length - 1))

  useInput(
    (input, key) => {
      if (selectable.length === 0) return
      if (key.downArrow || (!arrowOnly && input === "j"))
        setCursor((value) => Math.min(value + 1, selectable.length - 1))
      if (key.upArrow || (!arrowOnly && input === "k"))
        setCursor((value) => Math.max(value - 1, 0))
      if (key.return) {
        const rowIndex = selectable[clampedCursor]
        if (rowIndex === undefined) return
        const row = rows[rowIndex]
        if (row && row.kind === "item") onSubmit(row.item.value)
      }
    },
    { isActive: active },
  )

  if (selectable.length === 0) return <Text dimColor>No results.</Text>

  const activeRow = selectable[clampedCursor] ?? 0
  const half = Math.floor(viewport / 2)
  const start = Math.max(0, Math.min(activeRow - half, rows.length - viewport))
  const windowed = rows.slice(start, start + viewport)

  return (
    <Box flexDirection="column">
      {windowed.map((row, offset) => {
        const index = start + offset
        if (row.kind === "header")
          return (
            <Text key={`header-${index}`} bold color="cyan">
              {row.title}
            </Text>
          )
        const selected = index === activeRow
        return (
          <Text key={row.item.key} color={selected ? "green" : undefined}>
            {selected ? "❯ " : "  "}
            {row.item.label}
            {row.item.hint ? <Text dimColor> {row.item.hint}</Text> : null}
          </Text>
        )
      })}
    </Box>
  )
}
