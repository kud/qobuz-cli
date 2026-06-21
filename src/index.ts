import { defineCommand, runMain } from "citty"
import { album } from "./commands/album.js"
import { artist } from "./commands/artist.js"
import { fav } from "./commands/fav.js"
import { login } from "./commands/login.js"
import { logout } from "./commands/logout.js"
import { open } from "./commands/open.js"
import { next, play, previous } from "./commands/playback.js"
import { playlist } from "./commands/playlist.js"
import { search } from "./commands/search.js"
import { similar } from "./commands/similar.js"
import { track } from "./commands/track.js"
import { url } from "./commands/url.js"

const main = defineCommand({
  meta: {
    name: "qobuz",
    description:
      "Qobuz from the command line — search, library, and quick-open in the app",
  },
  subCommands: {
    login,
    logout,
    search,
    album,
    artist,
    track,
    similar,
    fav,
    playlist,
    url,
    "copy-url": url,
    open,
    play,
    next,
    previous,
    prev: previous,
  },
})

runMain(main)
