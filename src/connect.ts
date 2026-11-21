import { fetchAppId, validateCredentials } from "@kud/qobuz"
import { store } from "./lib.js"
import { countdownAndOpen, createPrompts } from "./prompts.js"

const scrapeAppId = () =>
  fetchAppId()
    .then((result) => result.appId)
    .catch(() => "")

// Shared by the paste flow and `--browser`: validate the pair against the live
// API, then persist it to the Keychain. Nothing is saved unless it validates.
export const validateAndSave = async ({
  appId,
  token,
}: {
  appId: string
  token: string
}) => {
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

export const runConnect = async () => {
  console.log("Connect your Qobuz account.")
  console.log(
    "In the page that opens: log in, then DevTools → Network, click any",
  )
  console.log(
    "request to www.qobuz.com/api.json and copy these from its headers:\n",
  )

  const scraped = await scrapeAppId()
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

  await validateAndSave({ appId, token })
}

export const runBrowserConnect = async () => {
  const { runBrowserCapture } = await import("./auth/browser-login.js")

  console.log("Connect your Qobuz account in a browser window.")
  console.log(
    "Sign in as usual; the CLI only reads the session token once you are in.\n",
  )

  let captured
  try {
    captured = await runBrowserCapture()
  } catch (error) {
    console.error(`✗ ${(error as Error).message}`)
    process.exit(1)
  }

  console.log(`  Session token captured (from ${captured.source}).`)
  const appId = captured.appId || (await scrapeAppId())
  if (!appId) {
    console.error(
      "\n✗ Could not determine X-App-Id. Run `qobuz login` to enter it manually.",
    )
    process.exit(1)
  }

  await validateAndSave({ appId, token: captured.token })
}
