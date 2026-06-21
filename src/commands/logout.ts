import { defineCommand } from "citty"
import { store } from "../lib.js"

export const logout = defineCommand({
  meta: {
    name: "logout",
    description: "Remove the stored Qobuz session from the Keychain",
  },
  run: async () => {
    await store.clear()
    console.log("✓ logged out. Keychain session cleared.")
  },
})
