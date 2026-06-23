import { defineCommand, runMain } from "citty"
import { renderGenericUsage } from "./help.js"
import { album } from "./commands/album.js"
import { artist } from "./commands/artist.js"
import { convert } from "./commands/convert.js"
import { fav } from "./commands/fav.js"
import { login } from "./commands/login.js"
import { logout } from "./commands/logout.js"
import { nowPlaying } from "./commands/now-playing.js"
import { open } from "./commands/open.js"
import { forward, next, play, previous, rewind } from "./commands/playback.js"
import { playlist } from "./commands/playlist.js"
import { search } from "./commands/search.js"
import { similar } from "./commands/similar.js"
import { stats } from "./commands/stats.js"
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
    convert,
    "now-playing": nowPlaying,
    stats,
    url,
    open,
    play,
    next,
    previous,
    forward,
    rewind,
  },
})

const aliases: Record<string, string> = {
  "copy-url": "url",
  np: "now-playing",
  prev: "previous",
  ff: "forward",
  rew: "rewind",
}

const args = process.argv.slice(2)
const [command, ...rest] = args
const rawArgs = command && aliases[command] ? [aliases[command], ...rest] : args

const isTopLevelHelp =
  rawArgs.length === 0 || rawArgs[0] === "--help" || rawArgs[0] === "-h"

if (isTopLevelHelp) {
  console.log(await renderGenericUsage(main))
} else {
  runMain(main, { rawArgs })
}
