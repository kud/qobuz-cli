import { describe, expect, it, vi } from "vitest"

vi.mock("@kud/qobuz", () => ({
  createQobuzClient: vi.fn(),
  createKeychainStore: vi.fn(() => ({})),
}))

vi.mock("../../lib.js", () => ({
  store: {},
  formatDuration: vi.fn(),
  deepLinkFor: vi.fn(),
  appLinkFor: vi.fn(),
}))

import { createQobuzClient } from "@kud/qobuz"
import { connectTui } from "./client.js"

const mockCreateQobuzClient = vi.mocked(createQobuzClient)

describe("connectTui", () => {
  it("returns ok:true with the client on success", async () => {
    const fakeClient = { deepLink: {}, appLink: {} } as never
    mockCreateQobuzClient.mockResolvedValueOnce(fakeClient)

    const result = await connectTui()

    expect(result).toEqual({ ok: true, client: fakeClient })
  })

  it("returns ok:false with reason:auth when the error has kind=auth", async () => {
    mockCreateQobuzClient.mockRejectedValueOnce({ kind: "auth" })

    const result = await connectTui()

    expect(result).toEqual({ ok: false, reason: "auth" })
  })

  it("returns ok:false with reason:error and the message for a generic Error", async () => {
    mockCreateQobuzClient.mockRejectedValueOnce(new Error("network timeout"))

    const result = await connectTui()

    expect(result).toEqual({
      ok: false,
      reason: "error",
      message: "network timeout",
    })
  })
})
