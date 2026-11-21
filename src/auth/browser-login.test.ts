import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  CaptureTimeoutError,
  LOGIN_URL,
  PLAYWRIGHT_INSTALL_COMMAND,
  PlaywrightMissingError,
  captureToken,
  loadPlaywright,
  runBrowserCapture,
  tokenFromHeaders,
  tokenFromStorage,
  type RequestLike,
} from "./browser-login.js"

type Listener = (request: RequestLike) => void

const fakeContext = () => {
  const listeners = new Set<Listener>()
  return {
    on: vi.fn((_event: "request", listener: Listener) =>
      listeners.add(listener),
    ),
    off: vi.fn((_event: "request", listener: Listener) =>
      listeners.delete(listener),
    ),
    emit: (headers: Record<string, string>) =>
      [...listeners].forEach((listener) =>
        listener({ headers: () => headers }),
      ),
    listenerCount: () => listeners.size,
  }
}

const fakePage = (
  storage: () => Record<string, string | null> = () => ({}),
) => ({
  goto: vi.fn(async () => undefined),
  evaluate: vi.fn(async () => storage()) as unknown as <T>(
    fn: () => T,
  ) => Promise<T>,
})

const moduleNotFound = () =>
  Object.assign(new Error("Cannot find package 'playwright'"), {
    code: "ERR_MODULE_NOT_FOUND",
  })

describe("tokenFromHeaders", () => {
  it("reads the token and app id case-insensitively", () => {
    expect(
      tokenFromHeaders({ "X-User-Auth-Token": " tok ", "x-app-id": "123" }),
    ).toEqual({ token: "tok", appId: "123", source: "request" })
  })

  it("ignores requests without a token", () => {
    expect(tokenFromHeaders({ "x-app-id": "123" })).toBeUndefined()
    expect(tokenFromHeaders({ "x-user-auth-token": "  " })).toBeUndefined()
  })
})

describe("tokenFromStorage", () => {
  it("finds a nested user_auth_token in a JSON value", () => {
    const entries = {
      theme: "dark",
      localuser: JSON.stringify({
        user: { id: 1 },
        infos: { user_auth_token: "abc" },
      }),
    }
    expect(tokenFromStorage(entries)).toEqual({
      token: "abc",
      source: "localStorage",
    })
  })

  it("returns undefined for non-JSON or token-less entries", () => {
    expect(
      tokenFromStorage({ a: "not json", b: null, c: "{}" }),
    ).toBeUndefined()
  })
})

describe("captureToken", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("resolves with the first request carrying X-User-Auth-Token", async () => {
    const context = fakeContext()
    const capture = captureToken({
      context,
      page: fakePage(),
      timeoutMs: 10_000,
    })

    context.emit({ accept: "*/*" })
    context.emit({ "x-user-auth-token": "first", "x-app-id": "42" })
    context.emit({ "x-user-auth-token": "second" })

    await expect(capture).resolves.toEqual({
      token: "first",
      appId: "42",
      source: "request",
    })
    expect(context.listenerCount()).toBe(0)
  })

  it("falls back to localStorage once it holds a token", async () => {
    let storage: Record<string, string | null> = {}
    const context = fakeContext()
    const page = fakePage(() => storage)
    const capture = captureToken({
      context,
      page,
      timeoutMs: 10_000,
      pollIntervalMs: 500,
    })

    await vi.advanceTimersByTimeAsync(1000)
    storage = { localuser: JSON.stringify({ user_auth_token: "stored" }) }
    await vi.advanceTimersByTimeAsync(500)

    await expect(capture).resolves.toEqual({
      token: "stored",
      source: "localStorage",
    })
    expect(context.listenerCount()).toBe(0)
  })

  it("keeps polling when page.evaluate throws mid-navigation", async () => {
    const context = fakeContext()
    let calls = 0
    const page = {
      goto: vi.fn(),
      evaluate: vi.fn(async () => {
        calls++
        if (calls === 1) throw new Error("Execution context was destroyed")
        return { k: JSON.stringify({ user_auth_token: "late" }) }
      }) as unknown as <T>(fn: () => T) => Promise<T>,
    }
    const capture = captureToken({
      context,
      page,
      timeoutMs: 10_000,
      pollIntervalMs: 100,
    })
    await vi.advanceTimersByTimeAsync(200)
    await expect(capture).resolves.toMatchObject({ token: "late" })
  })

  it("rejects with a pointer to the paste flow after the timeout", async () => {
    const context = fakeContext()
    const capture = captureToken({ context, page: fakePage(), timeoutMs: 3000 })
    const assertion =
      expect(capture).rejects.toBeInstanceOf(CaptureTimeoutError)

    await vi.advanceTimersByTimeAsync(3000)
    await assertion
    await expect(capture).rejects.toThrow(/qobuz login` without --browser/)
    expect(context.listenerCount()).toBe(0)
  })

  it("rejects when aborted", async () => {
    const abort = new AbortController()
    const capture = captureToken({
      context: fakeContext(),
      page: fakePage(),
      signal: abort.signal,
    })
    abort.abort(new Error("browser closed"))
    await expect(capture).rejects.toThrow("browser closed")
  })
})

describe("loadPlaywright", () => {
  it("returns the module when it is installed", async () => {
    const chromium = { launch: vi.fn() }
    await expect(loadPlaywright(async () => ({ chromium }))).resolves.toEqual({
      chromium,
    })
  })

  it("accepts a default export (CJS interop)", async () => {
    const chromium = { launch: vi.fn() }
    const loaded = await loadPlaywright(async () => ({ default: { chromium } }))
    expect(loaded.chromium).toBe(chromium)
  })

  it("throws PlaywrightMissingError with the install command when absent", async () => {
    const load = loadPlaywright(async () => {
      throw moduleNotFound()
    })
    await expect(load).rejects.toBeInstanceOf(PlaywrightMissingError)
    await expect(
      loadPlaywright(async () => {
        throw moduleNotFound()
      }),
    ).rejects.toThrow(PLAYWRIGHT_INSTALL_COMMAND)
  })

  it("rethrows unrelated import failures", async () => {
    await expect(
      loadPlaywright(async () => {
        throw new Error("boom")
      }),
    ).rejects.toThrow("boom")
  })
})

describe("runBrowserCapture", () => {
  it("opens a headed browser on the login page, captures, then closes", async () => {
    const context = {
      ...fakeContext(),
      newPage: vi.fn(async () => page),
    }
    const page = {
      ...fakePage(),
      goto: vi.fn(async () => {
        queueMicrotask(() => context.emit({ "x-user-auth-token": "tok" }))
      }),
    }
    const browser = {
      newContext: vi.fn(async () => context),
      close: vi.fn(async () => undefined),
      on: vi.fn(),
    }
    const launch = vi.fn(async () => browser)

    const captured = await runBrowserCapture({
      importer: async () => ({ chromium: { launch } }),
    })

    expect(captured).toEqual({ token: "tok", source: "request" })
    expect(launch).toHaveBeenCalledWith({ headless: false })
    expect(page.goto).toHaveBeenCalledWith(LOGIN_URL)
    expect(browser.close).toHaveBeenCalledOnce()
  })

  it("closes the browser and reports when the window is closed early", async () => {
    let onDisconnect: () => void = () => {}
    const context = { ...fakeContext(), newPage: vi.fn(async () => fakePage()) }
    const browser = {
      newContext: vi.fn(async () => context),
      close: vi.fn(async () => undefined),
      on: vi.fn((_event: "disconnected", listener: () => void) => {
        onDisconnect = listener
      }),
    }
    const run = runBrowserCapture({
      importer: async () => ({ chromium: { launch: async () => browser } }),
    })
    await vi.waitFor(() => expect(browser.on).toHaveBeenCalled())
    onDisconnect()

    await expect(run).rejects.toThrow(/closed before sign-in/)
    expect(browser.close).toHaveBeenCalledOnce()
  })

  it("does not launch anything when Playwright is missing", async () => {
    await expect(
      runBrowserCapture({
        importer: async () => {
          throw moduleNotFound()
        },
      }),
    ).rejects.toBeInstanceOf(PlaywrightMissingError)
  })
})
