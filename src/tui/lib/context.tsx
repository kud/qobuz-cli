import { createContext, useContext } from "react"
import type { Album, Artist, Playlist, QobuzClient, Track } from "@kud/qobuz"

export type DetailTarget =
  | { type: "track"; track: Track }
  | { type: "album"; album: Album }
  | { type: "artist"; artist: Artist }
  | { type: "playlist"; playlist: Playlist }

export type View =
  | { kind: "home" }
  | { kind: "search" }
  | { kind: "detail"; item: DetailTarget }
  | { kind: "favourites" }
  | { kind: "playlists" }
  | { kind: "playlist"; playlist: Playlist }
  | { kind: "nowPlaying" }
  | { kind: "convert"; track: Track }

export const ClientContext = createContext<QobuzClient | null>(null)

export const useClient = (): QobuzClient => {
  const client = useContext(ClientContext)
  if (!client) throw new Error("ClientContext is not provided")
  return client
}

type Nav = {
  push: (view: View) => void
  pop: () => void
  replace: (view: View) => void
}

export const NavContext = createContext<Nav | null>(null)

export const useNav = (): Nav => {
  const nav = useContext(NavContext)
  if (!nav) throw new Error("NavContext is not provided")
  return nav
}

type InputFocus = {
  inputFocused: boolean
  setInputFocused: (focused: boolean) => void
}

export const InputFocusContext = createContext<InputFocus | null>(null)

export const useInputFocus = (): InputFocus => {
  const focus = useContext(InputFocusContext)
  if (!focus) throw new Error("InputFocusContext is not provided")
  return focus
}
