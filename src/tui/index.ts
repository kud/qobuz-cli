import { render } from "ink"
import { createElement } from "react"
import { App } from "./App.js"

export const runTui = async () => {
  if (!process.stdin.isTTY) {
    console.error("The interactive TUI needs an interactive terminal.")
    return
  }

  process.stdout.write("\x1b[?1049h")

  let restored = false
  const restore = () => {
    if (restored) return
    restored = true
    process.stdout.write("\x1b[?1049l\x1b[?25h")
  }

  process.once("SIGINT", restore)
  process.once("SIGTERM", restore)
  process.once("exit", restore)

  const { waitUntilExit } = render(createElement(App), { exitOnCtrlC: false })
  try {
    await waitUntilExit()
  } finally {
    restore()
  }
}
