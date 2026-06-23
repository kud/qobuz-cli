import { Box, Text } from "ink"
import type { UserFavourites } from "@kud/qobuz"
import { useClient, useNav, type DetailTarget } from "../lib/context.js"
import { formatDuration } from "../lib/client.js"
import { useAsync } from "../lib/use-async.js"
import { SelectList, type ListSection } from "../components/SelectList.js"
import { Spinner } from "../components/Spinner.js"
import { ErrorBanner } from "../components/ErrorBanner.js"
import { Footer } from "../components/Footer.js"

const buildSections = (
  favourites: UserFavourites | undefined,
): ListSection<DetailTarget>[] => {
  if (!favourites) return []
  return [
    {
      title: "Tracks",
      items: favourites.tracks.map((track) => ({
        key: `track-${track.id}`,
        label: track.title,
        hint: `${track.artist?.name ?? ""} ${formatDuration(track.duration)}`.trim(),
        value: { type: "track", track },
      })),
    },
    {
      title: "Albums",
      items: favourites.albums.map((album) => ({
        key: `album-${album.id}`,
        label: album.title,
        hint: album.artist?.name,
        value: { type: "album", album },
      })),
    },
    {
      title: "Artists",
      items: favourites.artists.map((artist) => ({
        key: `artist-${artist.id}`,
        label: artist.name,
        value: { type: "artist", artist },
      })),
    },
  ]
}

export const Favourites = () => {
  const client = useClient()
  const nav = useNav()

  const { data, error, loading } = useAsync(async () => {
    const [albums, artists, tracks] = await Promise.all([
      client.favourites.list("albums", { limit: 50 }),
      client.favourites.list("artists", { limit: 50 }),
      client.favourites.list("tracks", { limit: 50 }),
    ])
    return {
      albums: albums.albums,
      artists: artists.artists,
      tracks: tracks.tracks,
    }
  }, [])

  return (
    <Box flexDirection="column">
      <Text bold>Favourites</Text>
      <Box marginTop={1} flexDirection="column">
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? <Spinner /> : null}
        {!loading && !error ? (
          <SelectList
            sections={buildSections(data)}
            onSubmit={(item) => nav.push({ kind: "detail", item })}
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
