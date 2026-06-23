import { Box, Text } from "ink"
import type { Playlist as QobuzPlaylist, Track } from "@kud/qobuz"
import { useClient, useNav } from "../lib/context.js"
import { formatDuration } from "../lib/client.js"
import { useAsync } from "../lib/use-async.js"
import { SelectList, type ListItem } from "../components/SelectList.js"
import { Spinner } from "../components/Spinner.js"
import { ErrorBanner } from "../components/ErrorBanner.js"
import { Footer } from "../components/Footer.js"

type PlaylistProps = {
  playlist: QobuzPlaylist
}

export const Playlist = ({ playlist }: PlaylistProps) => {
  const client = useClient()
  const nav = useNav()

  const { data, error, loading } = useAsync(
    () => client.playlists.get(playlist.id, { limit: 100 }),
    [playlist.id],
  )

  const tracks = data?.tracks ?? []
  const items: ListItem<Track>[] = tracks.map((track) => ({
    key: `track-${track.id}`,
    label: track.title,
    hint: `${track.artist?.name ?? ""} ${formatDuration(track.duration)}`.trim(),
    value: track,
  }))

  return (
    <Box flexDirection="column">
      <Text bold>{data?.name ?? playlist.name}</Text>
      <Box marginTop={1} flexDirection="column">
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? <Spinner /> : null}
        {!loading && !error ? (
          <SelectList
            sections={[{ title: "", items }]}
            onSubmit={(track) =>
              nav.push({ kind: "detail", item: { type: "track", track } })
            }
          />
        ) : null}
      </Box>
      <Footer
        hints={[
          { key: "↵", label: "open track" },
          { key: "esc", label: "back" },
        ]}
      />
    </Box>
  )
}
