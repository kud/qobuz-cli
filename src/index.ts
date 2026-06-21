import { defineCommand, runMain } from "citty"
import { album } from "./commands/album.js"
import { fav } from "./commands/fav.js"
import { login } from "./commands/login.js"
import { logout } from "./commands/logout.js"
import { open } from "./commands/open.js"
import { playlist } from "./commands/playlist.js"
import { search } from "./commands/search.js"

const main = defineCommand({
  meta: {
    name: "qobuz",
    description:
      "Qobuz from the command line — search, library, and quick-open in the app",
  },
  subCommands: { login, logout, search, album, fav, playlist, open },
})

runMain(main)
