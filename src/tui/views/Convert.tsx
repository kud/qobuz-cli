import { useState } from "react"
import { Box, Text } from "ink"
import type { Track } from "@kud/qobuz"
import { useAsync } from "../lib/use-async.js"
import {
  deezerByIsrc,
  spotifySearchUrl,
  ytMusicSearchUrl,
} from "../../resolve.js"
import { openUrl } from "../../prompts.js"
import { SelectList, type ListItem } from "../components/SelectList.js"
import { Spinner } from "../components/Spinner.js"
import { ErrorBanner } from "../components/ErrorBanner.js"
import { Footer } from "../components/Footer.js"

type ConvertProps = {
  track: Track
}

type ServiceLink = {
  service: string
  url: string
  exact?: boolean
}

export const Convert = ({ track }: ConvertProps) => {
  const [status, setStatus] = useState<string | undefined>(undefined)

  const { data, error, loading } = useAsync(async () => {
    const query = `${track.artist?.name ?? ""} ${track.title}`.trim()
    const deezer = track.isrc ? await deezerByIsrc(track.isrc) : undefined
    const links: ServiceLink[] = [
      { service: "YouTube Music", url: ytMusicSearchUrl(query) },
      { service: "Spotify", url: spotifySearchUrl(query) },
    ]
    if (deezer) links.push({ service: "Deezer", url: deezer, exact: true })
    return links
  }, [track.id])

  const items: ListItem<ServiceLink>[] = (data ?? []).map((link) => ({
    key: link.service,
    label: link.service,
    hint: link.exact ? "exact" : link.url,
    value: link,
  }))

  return (
    <Box flexDirection="column">
      <Text bold>🎵 {track.title}</Text>
      <Text dimColor>by {track.artist?.name ?? "?"}</Text>
      <Box marginTop={1} flexDirection="column">
        <Text bold color="cyan">
          Find elsewhere
        </Text>
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? <Spinner /> : null}
        {!loading && !error ? (
          <SelectList
            sections={[{ title: "", items }]}
            onSubmit={async (link) => {
              const opened = await openUrl(link.url)
              setStatus(
                opened
                  ? `Opened ${link.service}.`
                  : `Couldn't open ${link.service}.`,
              )
            }}
          />
        ) : null}
        {status ? <Text dimColor>{status}</Text> : null}
      </Box>
      <Footer
        hints={[
          { key: "↵", label: "open link" },
          { key: "esc", label: "back" },
        ]}
      />
    </Box>
  )
}
