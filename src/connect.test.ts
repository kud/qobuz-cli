import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const connectMock = vi.fn()
const store = { load: vi.fn(), save: vi.fn(), clear: vi.fn() }

vi.mock("@kud/qobuz", () => ({
  connect: connectMock,
  fetchAppId: vi.fn(),
  createKeychainStore: () => store,
  createQobuzClient: vi.fn(),
}))

const { validateAndSave } = await import("./connect.js")

class ExitError extends Error {
  constructor(readonly code: number | undefined) {
    super(`process.exit(${code})`)
  }
}

describe("validateAndSave", () => {
  let log: ReturnType<typeof vi.spyOn>
  let error: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    connectMock.mockReset()
    vi.spyOn(process.stdout, "write").mockReturnValue(true)
    log = vi.spyOn(console, "log").mockImplementation(() => {})
    error = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new ExitError(code as number | undefined)
    })
  })

  afterEach(() => vi.restoreAllMocks())

  it("delegates to the core's connect() with the CLI's store", async () => {
    connectMock.mockResolvedValue({})
    await validateAndSave({ appId: "42", token: "tok" })

    expect(connectMock).toHaveBeenCalledWith({
      token: "tok",
      appId: "42",
      store,
    })
    expect(log).toHaveBeenCalledWith(expect.stringContaining("✓ connected"))
    expect(process.exit).not.toHaveBeenCalled()
  })

  it("prints ✗ and exits 1 when connect() rejects", async () => {
    connectMock.mockRejectedValue(new Error("invalid token"))

    await expect(
      validateAndSave({ appId: "42", token: "bad" }),
    ).rejects.toThrow(ExitError)
    expect(error).toHaveBeenCalledWith("\n✗ invalid token")
    expect(process.exit).toHaveBeenCalledWith(1)
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("✓"))
  })
})
