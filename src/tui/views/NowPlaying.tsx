import { useEffect } from "react"
import { Box, Text, useInput } from "ink"
import { useClient, useInputFocus } from "../lib/context.js"
import { deepLinkFor, formatDuration } from "../lib/client.js"
import { openUrl } from "../../prompts.js"
import { useAsync } from "../lib/use-async.js"
import { Spinner } from "../components/Spinner.js"
import { ErrorBanner } from "../components/ErrorBanner.js"
import { Footer } from "../components/Footer.js"

export const NowPlaying = () => {
  const client = useClient()
  const { data, error, loading, reload } = useAsync(
    () => client.nowPlaying(),
    [],
  )

  const { inputFocused } = useInputFocus()

  useEffect(() => {
    const timer = setInterval(reload, 3000)
    return () => clearInterval(timer)
  }, [reload])

  useInput(
    (input) => {
      if (input !== "o" || !data) return
      const url = deepLinkFor(client, "track", String(data.id))
      if (url) void openUrl(url)
    },
    { isActive: !inputFocused },
  )

  return (
    <Box flexDirection="column">
      <Text bold>Now Playing</Text>
      <Box marginTop={1} flexDirection="column">
        {error ? <ErrorBanner message={error} /> : null}
        {loading && !data ? <Spinner /> : null}
        {!loading && !error && !data ? (
          <Text dimColor>Nothing is playing.</Text>
        ) : null}
        {data ? (
          <Box flexDirection="column">
            <Text bold>🎵 {data.title}</Text>
            <Text>
              <Text dimColor>Artist </Text>
              {data.artist?.name ?? "?"}
            </Text>
            {data.album?.title ? (
              <Text>
                <Text dimColor>Album </Text>
                {data.album.title}
              </Text>
            ) : null}
            <Text>
              <Text dimColor>Duration </Text>
              {formatDuration(data.duration)}
            </Text>
          </Box>
        ) : null}
      </Box>
      <Footer
        hints={[
          { key: "o", label: "open in Qobuz" },
          { key: "space", label: "play/pause", playback: true },
          { key: "n", label: "next", playback: true },
          { key: "p", label: "prev", playback: true },
          { key: "esc", label: "back" },
        ]}
      />
    </Box>
  )
}
