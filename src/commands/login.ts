import { defineCommand } from "citty"
import { runBrowserConnect, runConnect } from "../connect.js"

export const login = defineCommand({
  meta: {
    name: "login",
    description: "Connect your Qobuz account (stores a token in the Keychain)",
  },
  args: {
    browser: {
      type: "boolean",
      description:
        "Sign in through a real browser window and capture the token automatically (needs Playwright)",
      default: false,
    },
  },
  run: ({ args }) => (args.browser ? runBrowserConnect() : runConnect()),
})
