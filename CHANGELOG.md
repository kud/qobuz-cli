# Changelog

All notable changes to this project are documented here.

---

## Unreleased — 2026-06-23

### Highlights

- **A full-screen interactive TUI is now available.** Running `qobuz` with no arguments (or `qobuz tui`) opens an Ink/React terminal UI with type-to-search, arrow-key navigation, detail views for tracks, albums, artists and playlists, now-playing display, and playback control — the "Raycast in the terminal" experience that was previously macOS-only via the Raycast extension. Linux and any terminal user can now access the same interactive flow. All existing one-shot commands (`qobuz search`, `qobuz album`, etc.) are unaffected. ([e8b9dc8](https://github.com/kud/qobuz-cli/commit/e8b9dc8))

- **Convert and open directly from the TUI.** The interactive mode surfaces the `convert` command inline — search for a track or album, then jump straight to Deezer, Spotify, or YouTube without leaving the terminal. Opening in the Qobuz desktop app via deep link is also available from the detail view.

### Documentation

- README updated with a dedicated TUI section covering launch options, key bindings, and the interactive feature surface. ([cca99e6](https://github.com/kud/qobuz-cli/commit/cca99e6))

### Internal

- Vitest test suite added with unit test coverage for core logic. ([cca99e6](https://github.com/kud/qobuz-cli/commit/cca99e6))

---

## Unreleased — 2026-06-22

### Fixes

- `qobuz-cli` can now be installed on Linux and other non-macOS platforms without errors. The `@kud/macos-media-keys` dependency is now declared as optional, so npm skips it on non-macOS systems instead of failing with `EBADPLATFORM`. Playback commands load the library dynamically at runtime, meaning non-macOS installs work for everything except media-key playback control. macOS users are unaffected. ([548bc25](https://github.com/kud/qobuz-cli/commit/548bc2568b190f1c7ca1fe94df427e160d05950c))

---

## Unreleased — 2026-06-22

### Internal

- Playback commands (`play`, `next`, `previous`, `forward`, `rewind`) now delegate media key dispatch to the published `@kud/macos-media-keys` package instead of a Swift file compiled and bundled inside the CLI itself. The bundled `native/media-key.swift` source and the `build:native` step have been removed. No change in behaviour — this reduces the build surface and makes the media-key logic reusable independently of the CLI. ([44dc0c3](https://github.com/kud/qobuz-cli/commit/44dc0c39e639d6c4e927fa1ecd4169e08de6898c))

---

## Unreleased — 2026-06-22

### Highlights

- **`qobuz open` now launches items directly in the Qobuz desktop app.** Running `qobuz open <type> <id>` sends a `qobuzapp://` deep link to the native app rather than opening a browser tab, giving you a seamless in-app experience for albums, artists, tracks, and playlists. ([abc1c69](https://github.com/kud/qobuz-cli/commit/abc1c690b48fc5bae1b302854268ff7a9ecb8b7b))

### Internal

- Bumped `@kud/qobuz` core dependency to 0.5.0, which introduces the `client.appLink` method used by the new `appLinkFor` helper. ([abc1c69](https://github.com/kud/qobuz-cli/commit/abc1c690b48fc5bae1b302854268ff7a9ecb8b7b))

---

## Unreleased — 2026-06-22

### Highlights

- **All CLI commands now render rich, readable terminal output.** A new shared `src/ui.ts` module brings consistent ANSI styling across every command — bold titles, dim metadata, accent-coloured names, muted IDs, and aligned column tables. The `search`, `album`, `artist`, `track`, `similar`, `fav`, and `playlist` commands all produce polished output without any extra flags. ([c26d6ac](https://github.com/kud/qobuz-cli/commit/c26d6ace6aa8a5a1bcee5882060808e0054df18f))

- **`qobuz stats` gains bar charts with localised number formatting.** The stats command now renders horizontal bar graphs for genre and bit-depth breakdowns, making the distribution data immediately scannable at a glance. ([c26d6ac](https://github.com/kud/qobuz-cli/commit/c26d6ace6aa8a5a1bcee5882060808e0054df18f))

- **Output degrades gracefully when piped.** When stdout is not a TTY (e.g. redirected to a file or another command), all ANSI colour and formatting is stripped automatically — plain text passes through cleanly for scripting. ([c26d6ac](https://github.com/kud/qobuz-cli/commit/c26d6ace6aa8a5a1bcee5882060808e0054df18f))

---

## 0.3.0 — 2026-06-22

### Highlights

- **See your Qobuz collection in numbers with `qobuz stats`.** The new command reads the Qobuz desktop app's local library database (no account call or auth required) and prints a full analytics breakdown: genre distribution, hi-res and bit-depth ratios, top artists by album count, top labels, and a month-by-month "recently added" timeline. macOS only. ([98c0bd1](https://github.com/kud/qobuz-cli/commit/98c0bd1e85f6cdf9be4cec023a95f9cbc5af7abb))

### Documentation

- Docs index rewritten as an orientation guide rather than a copy of the README, giving first-time visitors a clearer entry point into the command reference. ([b63fc63](https://github.com/kud/qobuz-cli/commit/b63fc630cf8dcf3c380a3893a62e61998820579a))

---

## 0.2.0 — 2026-06-22

### Highlights

- **`qobuz url` now copies to the clipboard.** Running `qobuz url <track-id>` pipes the open.qobuz.com deep link directly to `pbcopy` and prints a `✓ copied <link>` confirmation. A `copy-url` alias is also registered for discoverability. ([41fde0f](https://github.com/kud/qobuz-cli/commit/41fde0f314cfb5264812287f4aab952658919d8b))

- **Bare `qobuz url` copies the currently-playing track.** Calling the command with no arguments reads the Qobuz desktop app's state, resolves the active track, and copies its deep link — no manual ID needed. ([115d1ee](https://github.com/kud/qobuz-cli/commit/115d1ee93afeec8445e9bfdf82458c0bb2177822))

- **`--plain` flag for scripting.** Pass `--plain` to `qobuz url` to print the bare URL to stdout without touching the clipboard — useful for capturing the link in shell pipelines (e.g. `NOW=$(qobuz url --plain)`). ([ff2a52a](https://github.com/kud/qobuz-cli/commit/ff2a52aee8b9e69fdef566c7c0c227eb25aff24e))

- **Forward and rewind media keys.** Two new playback actions — `forward` (`ff`) and `rewind` (`rew`) — send the native NX_KEYTYPE_FAST and NX_KEYTYPE_REWIND media key events to seek within the current track, rounding out the media-key control surface alongside play/next/previous. ([518698d](https://github.com/kud/qobuz-cli/commit/518698d038d9f2a2fe2d2340bb7419ce4c2d6c87))

- **Cleaner `--help` output.** The top-level help now shows a single `qobuz <command> [options]` usage line instead of the unwieldy pipe-joined subcommand list, and aliases no longer appear as duplicate entries in the command registry. ([09ebb5c](https://github.com/kud/qobuz-cli/commit/09ebb5ccba03f402d6008a631fa76b5dd2123120))

### Fixes

- **Now-playing detection moved to core.** The logic for reading the Qobuz desktop app state was extracted into the `@kud/qobuz` library (now at 0.3.0), removing duplicated code from the CLI and making it available to other consumers. ([6b837d9](https://github.com/kud/qobuz-cli/commit/6b837d9d6013375a95d753a4db300700545fcd96))

### Documentation

- Added a full six-page documentation site covering authentication, search, library, and playback commands. ([1a56d50](https://github.com/kud/qobuz-cli/commit/1a56d5019eb5f2973fbc73ed6ab0cac66367c58b))

<details>
<summary>Internal (4 commits)</summary>

- Alias resolution refactored to a single `rawArgs` pre-processing step, keeping the command registry free of duplicate entries. ([dcc5c1c](https://github.com/kud/qobuz-cli/commit/dcc5c1c379f9cf04e212b1657b252786d91ea13d))
- Automated npm publishing set up via GitHub Actions with OIDC Trusted Publishers — no long-lived tokens required. ([d8c18fa](https://github.com/kud/qobuz-cli/commit/d8c18fa3bceada5b4364059d64aaa0fc4b6bd01c))
- CI Node.js upgraded from 20 to 24. ([70a2b0d](https://github.com/kud/qobuz-cli/commit/70a2b0d039989a4c60ed435f1f27a5158e5a9368))
- Minor docs page title and icon tweaks.

</details>
