import { fetchAppId, validateCredentials } from "@kud/qobuz"
import { store } from "./lib.js"
import { countdownAndOpen, createPrompts } from "./prompts.js"

export const runConnect = async () => {
  console.log("Connect your Qobuz account.")
  console.log(
    "In the page that opens: log in, then DevTools → Network, click any",
  )
  console.log(
    "request to www.qobuz.com/api.json and copy these from its headers:\n",
  )

  const scraped = await fetchAppId()
    .then((result) => result.appId)
    .catch(() => "")
  await countdownAndOpen("https://play.qobuz.com/login")

  const prompts = createPrompts()
  const appIdInput = await prompts.ask(
    `  X-App-Id${scraped ? ` [${scraped}]` : ""}: `,
  )
  const token = await prompts.askHidden("  X-User-Auth-Token: ")
  prompts.close()

  const appId = appIdInput || scraped
  if (!appId || !token) {
    console.error("\nBoth X-App-Id and X-User-Auth-Token are required.")
    process.exit(1)
  }

  process.stdout.write("\n  Validating… ")
  try {
    await validateCredentials({ appId, token })
  } catch (error) {
    console.error(`\n✗ ${(error as Error).message}`)
    process.exit(1)
  }

  await store.save({ appId, token })
  console.log('✓ connected. Session saved to the Keychain (service "qobuz").')
}
