import { useEffect } from "react"
import { Box, Text } from "ink"
import type { Artist } from "@kud/qobuz"
import { useClient, useNav, type DetailTarget } from "../lib/context.js"
import { formatDuration } from "../lib/client.js"
import { useAsync } from "../lib/use-async.js"
import { SelectList, type ListItem } from "../components/SelectList.js"
import { Spinner } from "../components/Spinner.js"
import { ErrorBanner } from "../components/ErrorBanner.js"
import { Footer } from "../components/Footer.js"

type DetailProps = {
  target: DetailTarget
}

const Field = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <Text>
      <Text dimColor>{label} </Text>
      {value}
    </Text>
  ) : null

const TrackDetail = ({
  target,
}: {
  target: Extract<DetailTarget, { type: "track" }>
}) => {
  const { track } = target
  return (
    <Box flexDirection="column">
      <Text bold>🎵 {track.title}</Text>
      <Field label="Artist" value={track.artist?.name} />
      <Field label="Album" value={track.album?.title} />
      <Field label="Duration" value={formatDuration(track.duration)} />
      {track.hires ? <Text color="green">Hi-Res</Text> : null}
      <Footer
        hints={[
          { key: "o", label: "open in Qobuz" },
          { key: "c", label: "convert" },
          { key: "space", label: "play", playback: true },
          { key: "esc", label: "back" },
        ]}
      />
    </Box>
  )
}

const AlbumDetail = ({
  target,
}: {
  target: Extract<DetailTarget, { type: "album" }>
}) => {
  const { album } = target
  return (
    <Box flexDirection="column">
      <Text bold>💿 {album.title}</Text>
      <Field label="Artist" value={album.artist?.name} />
      <Field label="Released" value={album.releaseDate} />
      <Field label="Genre" value={album.genre} />
      <Field
        label="Tracks"
        value={album.tracksCount ? String(album.tracksCount) : undefined}
      />
      {album.hires ? <Text color="green">Hi-Res</Text> : null}
      <Footer
        hints={[
          { key: "o", label: "open in Qobuz" },
          { key: "esc", label: "back" },
        ]}
      />
    </Box>
  )
}

const ArtistDetail = ({
  target,
}: {
  target: Extract<DetailTarget, { type: "artist" }>
}) => {
  const client = useClient()
  const nav = useNav()
  const artistId = target.artist.id

  const { data, error, loading } = useAsync(async () => {
    const [artist, similar] = await Promise.all([
      client.artists.get(artistId),
      client.artists.getSimilar(artistId, { limit: 20 }),
    ])
    return { artist, similar }
  }, [artistId])

  const items: ListItem<Artist>[] = (data?.similar ?? []).map((artist) => ({
    key: `artist-${artist.id}`,
    label: artist.name,
    value: artist,
  }))

  return (
    <Box flexDirection="column">
      <Text bold>🎤 {data?.artist.name ?? target.artist.name}</Text>
      <Field
        label="Albums"
        value={
          data?.artist.albumsCount ? String(data.artist.albumsCount) : undefined
        }
      />
      <Box marginTop={1} flexDirection="column">
        <Text bold color="cyan">
          Similar artists
        </Text>
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? <Spinner /> : null}
        {!loading && !error ? (
          <SelectList
            sections={[{ title: "", items }]}
            onSubmit={(artist) =>
              nav.push({ kind: "detail", item: { type: "artist", artist } })
            }
          />
        ) : null}
      </Box>
      <Footer
        hints={[
          { key: "↵", label: "open artist" },
          { key: "o", label: "open in Qobuz" },
          { key: "esc", label: "back" },
        ]}
      />
    </Box>
  )
}

export const Detail = ({ target }: DetailProps) => {
  switch (target.type) {
    case "track":
      return <TrackDetail target={target} />
    case "album":
      return <AlbumDetail target={target} />
    case "artist":
      return <ArtistDetail target={target} />
    case "playlist":
      return <PlaylistRedirect target={target} />
  }
}

const PlaylistRedirect = ({
  target,
}: {
  target: Extract<DetailTarget, { type: "playlist" }>
}) => {
  const nav = useNav()
  useEffect(() => {
    nav.replace({ kind: "playlist", playlist: target.playlist })
  }, [nav, target.playlist])
  return null
}
