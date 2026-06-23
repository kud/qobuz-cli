import { Box, Text } from "ink"
import type { Playlist as QobuzPlaylist } from "@kud/qobuz"
import { useClient, useNav } from "../lib/context.js"
import { useAsync } from "../lib/use-async.js"
import { SelectList, type ListItem } from "../components/SelectList.js"
import { Spinner } from "../components/Spinner.js"
import { ErrorBanner } from "../components/ErrorBanner.js"
import { Footer } from "../components/Footer.js"

export const Playlists = () => {
  const client = useClient()
  const nav = useNav()

  const { data, error, loading } = useAsync(
    () => client.playlists.listForUser({ limit: 50 }),
    [],
  )

  const items: ListItem<QobuzPlaylist>[] = (data ?? []).map((playlist) => ({
    key: `playlist-${playlist.id}`,
    label: playlist.name,
    hint: playlist.tracksCount ? `${playlist.tracksCount} tracks` : undefined,
    value: playlist,
  }))

  return (
    <Box flexDirection="column">
      <Text bold>Playlists</Text>
      <Box marginTop={1} flexDirection="column">
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? <Spinner /> : null}
        {!loading && !error ? (
          <SelectList
            sections={[{ title: "", items }]}
            onSubmit={(playlist) => nav.push({ kind: "playlist", playlist })}
          />
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
