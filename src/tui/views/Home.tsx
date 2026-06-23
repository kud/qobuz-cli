import { Box, Text } from "ink"
import { useNav, type View } from "../lib/context.js"
import { SelectList, type ListItem } from "../components/SelectList.js"
import { Footer } from "../components/Footer.js"

const entries: ListItem<View>[] = [
  { key: "search", label: "Search", value: { kind: "search" } },
  { key: "favourites", label: "Favourites", value: { kind: "favourites" } },
  { key: "playlists", label: "Playlists", value: { kind: "playlists" } },
  { key: "nowPlaying", label: "Now Playing", value: { kind: "nowPlaying" } },
]

export const Home = () => {
  const nav = useNav()
  return (
    <Box flexDirection="column">
      <Text bold>Qobuz</Text>
      <Box marginTop={1}>
        <SelectList
          sections={[{ title: "", items: entries }]}
          onSubmit={(view) => nav.push(view)}
        />
      </Box>
      <Footer
        hints={[
          { key: "↵", label: "open" },
          { key: "↑↓/jk", label: "move" },
          { key: "q", label: "quit" },
        ]}
      />
    </Box>
  )
}
