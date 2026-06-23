import { createQobuzClient, type QobuzClient } from "@kud/qobuz"
import { store } from "../../lib.js"

export type ConnectResult =
  | { ok: true; client: QobuzClient }
  | { ok: false; reason: "auth" | "error"; message?: string }

export const connectTui = async (): Promise<ConnectResult> => {
  try {
    const client = await createQobuzClient({ store })
    return { ok: true, client }
  } catch (error) {
    const qobuzError = error as { kind?: string; message?: string }
    if (qobuzError.kind === "auth") return { ok: false, reason: "auth" }
    return {
      ok: false,
      reason: "error",
      message: qobuzError.message ?? String(error),
    }
  }
}

export { formatDuration, deepLinkFor, appLinkFor } from "../../lib.js"
