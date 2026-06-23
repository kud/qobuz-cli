import { useEffect, useState } from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import type { SearchResults } from "@kud/qobuz"
import {
  useClient,
  useInputFocus,
  useNav,
  type DetailTarget,
} from "../lib/context.js"
import { formatDuration } from "../lib/client.js"
import { useAsync } from "../lib/use-async.js"
import { useDebouncedValue } from "../lib/use-debounced.js"
import { SelectList, type ListSection } from "../components/SelectList.js"
import { Spinner } from "../components/Spinner.js"
import { ErrorBanner } from "../components/ErrorBanner.js"
import { Footer } from "../components/Footer.js"

const buildSections = (
  results: SearchResults | undefined,
): ListSection<DetailTarget>[] => {
  if (!results) return []
  return [
    {
      title: "Tracks",
      items: results.tracks.map((track) => ({
        key: `track-${track.id}`,
        label: track.title,
        hint: `${track.artist?.name ?? ""} ${formatDuration(track.duration)}`.trim(),
        value: { type: "track", track },
      })),
    },
    {
      title: "Albums",
      items: results.albums.map((album) => ({
        key: `album-${album.id}`,
        label: album.title,
        hint: album.artist?.name,
        value: { type: "album", album },
      })),
    },
    {
      title: "Artists",
      items: results.artists.map((artist) => ({
        key: `artist-${artist.id}`,
        label: artist.name,
        value: { type: "artist", artist },
      })),
    },
  ]
}

export const Search = () => {
  const client = useClient()
  const nav = useNav()
  const { setInputFocused } = useInputFocus()
  const [query, setQuery] = useState("")
  const debounced = useDebouncedValue(query, 300)
  const term = debounced.trim()

  useEffect(() => {
    setInputFocused(true)
    return () => setInputFocused(false)
  }, [setInputFocused])

  const { data, error, loading } = useAsync<SearchResults | undefined>(
    () =>
      term.length >= 2
        ? client.search.search(term, { limit: 20 })
        : Promise.resolve(undefined),
    [term],
  )

  const sections = buildSections(data)

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>Search </Text>
        <TextInput value={query} onChange={setQuery} placeholder="type…" />
      </Box>
      <Box marginTop={1} flexDirection="column">
        {error ? <ErrorBanner message={error} /> : null}
        {term.length >= 2 && loading ? <Spinner /> : null}
        {term.length >= 2 && !loading && !error ? (
          <SelectList
            sections={sections}
            arrowOnly
            onSubmit={(item) => nav.push({ kind: "detail", item })}
          />
        ) : null}
        {term.length < 2 ? (
          <Text dimColor>Type at least 2 characters.</Text>
        ) : null}
      </Box>
      <Footer
        hints={[
          { key: "↵", label: "open" },
          { key: "esc", label: "back" },
        ]}
      />
    </Box>
  )
}
