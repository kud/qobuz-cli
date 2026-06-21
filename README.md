<div align="center">

![npm](https://img.shields.io/npm/v/%40kud%2Fqobuz-cli?style=flat-square&color=CB3837)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)
![MIT](https://img.shields.io/badge/licence-MIT-22C55E?style=flat-square)

**Command-line interface for Qobuz — search, library, and quick-open in the app**

<a href="https://kud.io/projects/qobuz-cli">Website</a> · <a href="https://kud.io/projects/qobuz-cli/docs">Documentation</a>

</div>

## Features

- **Fast search & metadata** — search albums, tracks, and artists; inspect album, artist, and track details.
- **Library & playlists** — list, add, and remove favourites; list, show, create, and edit playlists.
- **Media-key playback control** — `play`, `next`, and `previous` drive the Qobuz desktop app via real media keys (macOS, requires Accessibility permission).
- **Quick open & copy** — `open` deep-links straight into the Qobuz app; `url` (alias `copy-url`) copies the link to the clipboard.
- **Secure login** — stores a browser-borrowed token in the macOS Keychain; no password handling.

## Install

```sh
npm install -g @kud/qobuz-cli
```

## Usage

```console
$ qobuz login                      # connect (opens browser, paste app_id + token)
$ qobuz search "radiohead"
$ qobuz album 0634904032432
$ qobuz fav list
$ qobuz playlist create "Focus"
$ qobuz play                       # toggle play/pause in Qobuz
$ qobuz next                       # skip track
$ qobuz open album 0634904032432   # open in the Qobuz app
$ qobuz url album 0634904032432    # copy the deep link to the clipboard
```

Full command set: `login`, `logout`, `search`, `album`, `artist`, `track`, `similar`, `fav` (list/add/remove), `playlist` (list/show/create/add/remove), `url` / `copy-url`, `open`, `play`, `next`, `previous` / `prev`.

> **macOS note** — playback commands (`play`, `next`, `previous`) use real media keys and require Accessibility permission granted to your terminal. The first playback command compiles a small Swift helper via `swiftc`.

## Development

```sh
git clone https://github.com/kud/qobuz-cli.git
cd qobuz-cli
npm install
npm run dev -- search "radiohead"   # run from source via tsx
npm run build
npm run typecheck
```

📚 **Full documentation → [qobuz-cli/docs](https://kud.io/projects/qobuz-cli/docs)**
