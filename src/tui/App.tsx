import { useEffect, useMemo, useState } from "react"
import { Box, Text, useApp, useInput } from "ink"
import type { QobuzClient } from "@kud/qobuz"
import {
  ClientContext,
  InputFocusContext,
  NavContext,
  type View,
} from "./lib/context.js"
import { connectTui, deepLinkFor } from "./lib/client.js"
import { mediaKeysAvailable, sendMediaKey } from "./lib/media.js"
import { openUrl } from "../prompts.js"
import { Spinner } from "./components/Spinner.js"
import { ErrorBanner } from "./components/ErrorBanner.js"
import { NotLoggedIn } from "./views/NotLoggedIn.js"
import { Home } from "./views/Home.js"
import { Search } from "./views/Search.js"
import { Detail } from "./views/Detail.js"
import { Favourites } from "./views/Favourites.js"
import { Playlists } from "./views/Playlists.js"
import { Playlist } from "./views/Playlist.js"
import { NowPlaying } from "./views/NowPlaying.js"
import { Convert } from "./views/Convert.js"

type ConnectState =
  | { status: "pending" }
  | { status: "ready"; client: QobuzClient }
  | { status: "auth" }
  | { status: "error"; message: string }

const renderView = (view: View) => {
  switch (view.kind) {
    case "home":
      return <Home />
    case "search":
      return <Search />
    case "detail":
      return <Detail target={view.item} />
    case "favourites":
      return <Favourites />
    case "playlists":
      return <Playlists />
    case "playlist":
      return <Playlist playlist={view.playlist} />
    case "nowPlaying":
      return <NowPlaying />
    case "convert":
      return <Convert track={view.track} />
  }
}

const openTargetUrl = async (client: QobuzClient, view: View) => {
  if (view.kind === "detail") {
    const { item } = view
    const url =
      item.type === "track"
        ? deepLinkFor(client, "track", String(item.track.id))
        : item.type === "album"
          ? deepLinkFor(client, "album", item.album.id)
          : item.type === "artist"
            ? deepLinkFor(client, "artist", String(item.artist.id))
            : deepLinkFor(client, "playlist", String(item.playlist.id))
    if (url) await openUrl(url)
  }
}

export const App = () => {
  const { exit } = useApp()
  const [stack, setStack] = useState<View[]>([{ kind: "home" }])
  const [connectState, setConnectState] = useState<ConnectState>({
    status: "pending",
  })
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    let active = true
    connectTui().then((result) => {
      if (!active) return
      if (result.ok) setConnectState({ status: "ready", client: result.client })
      else if (result.reason === "auth") setConnectState({ status: "auth" })
      else
        setConnectState({
          status: "error",
          message: result.message ?? "Failed to connect.",
        })
    })
    return () => {
      active = false
    }
  }, [])

  const nav = useMemo(
    () => ({
      push: (view: View) => setStack((views) => [...views, view]),
      pop: () =>
        setStack((views) => (views.length > 1 ? views.slice(0, -1) : views)),
      replace: (view: View) =>
        setStack((views) => [...views.slice(0, -1), view]),
    }),
    [],
  )

  const focus = useMemo(
    () => ({ inputFocused, setInputFocused }),
    [inputFocused],
  )

  const current = stack[stack.length - 1] ?? { kind: "home" }
  const atRoot = stack.length <= 1

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      exit()
      return
    }
    if (key.escape) {
      if (atRoot) exit()
      else nav.pop()
      return
    }
    if (inputFocused) return
    if (input === "q") {
      exit()
      return
    }
    if (key.backspace && !key.meta) {
      if (atRoot) exit()
      else nav.pop()
      return
    }
    if (connectState.status !== "ready") return
    if (input === "o") {
      void openTargetUrl(connectState.client, current)
      return
    }
    if (
      input === "c" &&
      current.kind === "detail" &&
      current.item.type === "track"
    )
      nav.push({ kind: "convert", track: current.item.track })
    if (mediaKeysAvailable) {
      if (input === " ") void sendMediaKey("play")
      if (input === "n") void sendMediaKey("next")
      if (input === "p") void sendMediaKey("previous")
    }
  })

  if (connectState.status === "pending") return <Spinner label="Connecting…" />
  if (connectState.status === "auth") return <NotLoggedIn />

  return (
    <InputFocusContext.Provider value={focus}>
      <Box flexDirection="column" padding={1}>
        {connectState.status === "error" ? (
          <ClientContext.Provider value={null as unknown as QobuzClient}>
            <NavContext.Provider value={nav}>
              <ErrorBanner message={connectState.message} />
              <Box marginTop={1}>
                <Text dimColor>q quit</Text>
              </Box>
            </NavContext.Provider>
          </ClientContext.Provider>
        ) : (
          <ClientContext.Provider value={connectState.client}>
            <NavContext.Provider value={nav}>
              {renderView(current)}
            </NavContext.Provider>
          </ClientContext.Provider>
        )}
      </Box>
    </InputFocusContext.Provider>
  )
}
