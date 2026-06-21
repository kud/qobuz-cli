import { defineCommand } from "citty"
import { runConnect } from "../connect.js"

export const login = defineCommand({
  meta: {
    name: "login",
    description: "Connect your Qobuz account (stores a token in the Keychain)",
  },
  run: () => runConnect(),
})
