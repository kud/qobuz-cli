// Assisted login: open a real, headed browser on play.qobuz.com, let the user
// sign in there, and capture the session token the web player then sends.
// The CLI never sees the password — it only reads the X-User-Auth-Token header
// (or the token the player keeps in localStorage) once the user is signed in.

export const LOGIN_URL = "https://play.qobuz.com/login"
export const DEFAULT_TIMEOUT_MS = 5 * 60_000
export const PLAYWRIGHT_INSTALL_COMMAND =
  "npm install -g playwright && npx playwright install chromium"

export type Captured = {
  token: string
  appId?: string
  source: "request" | "localStorage"
}

// Minimal structural slices of the Playwright API, so tests can pass fakes and
// the package type-checks without Playwright installed.
export type RequestLike = { headers: () => Record<string, string> }
export type ContextLike = {
  on: (event: "request", listener: (request: RequestLike) => void) => unknown
  off: (event: "request", listener: (request: RequestLike) => void) => unknown
}
export type PageLike = {
  goto: (url: string) => Promise<unknown>
  evaluate: <T>(fn: () => T) => Promise<T>
}
export type BrowserLike = {
  newContext: () => Promise<ContextLike & { newPage: () => Promise<PageLike> }>
  close: () => Promise<void>
  on?: (event: "disconnected", listener: () => void) => unknown
}
export type PlaywrightLike = {
  chromium: { launch: (options: { headless: boolean }) => Promise<BrowserLike> }
}

export class PlaywrightMissingError extends Error {
  constructor() {
    super(
      `--browser needs Playwright, which is not installed.\n  Install it with: ${PLAYWRIGHT_INSTALL_COMMAND}`,
    )
    this.name = "PlaywrightMissingError"
  }
}

export class CaptureTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `No Qobuz session token seen within ${Math.round(timeoutMs / 1000)}s.\n  Run \`qobuz login\` without --browser to paste the token manually.`,
    )
    this.name = "CaptureTimeoutError"
  }
}

const isModuleNotFound = (error: unknown) => {
  const code = (error as { code?: string } | null)?.code
  return code === "ERR_MODULE_NOT_FOUND" || code === "MODULE_NOT_FOUND"
}

// A non-literal specifier keeps bundlers and tsc from resolving Playwright at
// build time: it is an optional peer dependency, loaded only for --browser.
const PLAYWRIGHT_MODULE = "playwright"
const defaultImporter = (specifier: string): Promise<unknown> =>
  import(specifier)

export const loadPlaywright = async (
  importer: (specifier: string) => Promise<unknown> = defaultImporter,
): Promise<PlaywrightLike> => {
  try {
    const mod = (await importer(PLAYWRIGHT_MODULE)) as
      | (PlaywrightLike & { default?: PlaywrightLike })
      | undefined
    const playwright = mod?.chromium ? mod : mod?.default
    if (!playwright?.chromium) throw new PlaywrightMissingError()
    return playwright
  } catch (error) {
    if (error instanceof PlaywrightMissingError || isModuleNotFound(error))
      throw new PlaywrightMissingError()
    throw error
  }
}

// Header names from Playwright's request.headers() are lower-cased, but fakes
// and other drivers may not be: match case-insensitively.
const header = (headers: Record<string, string>, name: string) => {
  const wanted = name.toLowerCase()
  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === wanted,
  )
  const value = entry?.[1]?.trim()
  return value ? value : undefined
}

export const tokenFromHeaders = (
  headers: Record<string, string>,
): Captured | undefined => {
  const token = header(headers, "x-user-auth-token")
  if (!token) return undefined
  const appId = header(headers, "x-app-id")
  return { token, ...(appId ? { appId } : {}), source: "request" }
}

// Walk a parsed localStorage value looking for a `user_auth_token` field. The
// web player's storage layout is not a public contract, so this searches
// rather than assuming one key path.
const findToken = (value: unknown, depth = 0): string | undefined => {
  if (depth > 6 || value === null || typeof value !== "object") return undefined
  for (const [key, inner] of Object.entries(value)) {
    if (key === "user_auth_token" && typeof inner === "string" && inner.trim())
      return inner.trim()
    const nested = findToken(inner, depth + 1)
    if (nested) return nested
  }
  return undefined
}

export const tokenFromStorage = (
  entries: Record<string, string | null>,
): Captured | undefined => {
  for (const raw of Object.values(entries)) {
    if (!raw) continue
    try {
      const token = findToken(JSON.parse(raw))
      if (token) return { token, source: "localStorage" }
    } catch {
      // Not JSON: ignore.
    }
  }
  return undefined
}

// Runs inside the browser page.
const readLocalStorage = () => {
  const out: Record<string, string | null> = {}
  const storage = (globalThis as unknown as { localStorage: Storage })
    .localStorage
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key !== null) out[key] = storage.getItem(key)
  }
  return out
}

export type CaptureOptions = {
  context: ContextLike
  page: PageLike
  timeoutMs?: number
  pollIntervalMs?: number
  signal?: AbortSignal
}

export const captureToken = ({
  context,
  page,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  pollIntervalMs = 1000,
  signal,
}: CaptureOptions): Promise<Captured> =>
  new Promise<Captured>((resolve, reject) => {
    let settled = false
    let polling = false

    const finish = (outcome: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      clearInterval(poller)
      context.off("request", onRequest)
      signal?.removeEventListener("abort", onAbort)
      outcome()
    }

    const onRequest = (request: RequestLike) => {
      const captured = tokenFromHeaders(request.headers())
      if (captured) finish(() => resolve(captured))
    }

    const poll = async () => {
      if (settled || polling) return
      polling = true
      try {
        const captured = tokenFromStorage(await page.evaluate(readLocalStorage))
        if (captured) finish(() => resolve(captured))
      } catch {
        // Page mid-navigation or closed: try again on the next tick.
      } finally {
        polling = false
      }
    }

    const onAbort = () =>
      finish(() => reject(signal?.reason ?? new Error("capture aborted")))

    context.on("request", onRequest)
    signal?.addEventListener("abort", onAbort)
    const poller = setInterval(() => void poll(), pollIntervalMs)
    const timer = setTimeout(
      () => finish(() => reject(new CaptureTimeoutError(timeoutMs))),
      timeoutMs,
    )
    if (signal?.aborted) onAbort()
  })

export type BrowserLoginOptions = {
  timeoutMs?: number
  importer?: (specifier: string) => Promise<unknown>
}

export const runBrowserCapture = async ({
  timeoutMs,
  importer,
}: BrowserLoginOptions = {}): Promise<Captured> => {
  const playwright = await loadPlaywright(importer)
  const browser = await playwright.chromium.launch({ headless: false })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    const abort = new AbortController()
    const capture = captureToken({
      context,
      page,
      timeoutMs,
      signal: abort.signal,
    })
    // Swallow the rejection here only so an aborted capture is never reported
    // as unhandled; the awaited copy below still surfaces real failures.
    capture.catch(() => {})
    browser.on?.("disconnected", () =>
      abort.abort(
        new Error(
          "The browser was closed before sign-in completed.\n  Run `qobuz login --browser` again, or `qobuz login` to paste the token.",
        ),
      ),
    )
    try {
      await page.goto(LOGIN_URL)
    } catch (error) {
      abort.abort(error)
      throw error
    }
    return await capture
  } finally {
    await browser.close().catch(() => {})
  }
}
