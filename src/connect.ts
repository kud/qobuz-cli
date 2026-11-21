import { connect, fetchAppId, type CredentialStore } from "@kud/qobuz"
import { store } from "./lib.js"
import { countdownAndOpen, createPrompts } from "./prompts.js"

const scrapeAppId = () =>
  fetchAppId()
    .then((result) => result.appId)
    .catch(() => "")

// Shared by the paste flow and `--browser`. The core's connect() validates the
// pair against the live API, persists it to the Keychain, then opens a client
// from what it stored. The last step can still fail after the save (the
// Keychain read back, for instance), so record whether the save happened:
// credentials on disk are a successful login, with a warning, not a failure.
export const validateAndSave = async ({
  appId,
  token,
}: {
  appId: string
  token: string
}) => {
  let saved = false
  const recordingStore: CredentialStore = {
    load: () => store.load(),
    clear: () => store.clear(),
    save: async (credentials) => {
      await store.save(credentials)
      saved = true
    },
  }

  process.stdout.write("\n  Validating… ")
  try {
    await connect({ token, appId, store: recordingStore })
  } catch (error) {
    const reason = (error as Error).message
    if (!saved) {
      console.error(`\n✗ ${reason}`)
      process.exit(1)
    }
    console.log('✓ saved to the Keychain (service "qobuz").')
    console.warn(
      `⚠ Connecting with the saved session failed: ${reason}\n` +
        "  Try a command such as `qobuz search <query>`; if it fails the same way, run `qobuz login` again.",
    )
    return
  }

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
