import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const exec = promisify(execFile)

const findPackageRoot = () => {
  let dir = dirname(fileURLToPath(import.meta.url))
  while (!existsSync(join(dir, "package.json"))) {
    const parent = dirname(dir)
    if (parent === dir)
      throw new Error("could not locate the qobuz-cli package root")
    dir = parent
  }
  return dir
}

const root = findPackageRoot()
const source = join(root, "native", "media-key.swift")
const binary = join(root, "native", "media-key")

export type MediaKey = "play" | "next" | "previous" | "forward" | "rewind"

const ensureBinary = async () => {
  if (!existsSync(binary)) await exec("swiftc", ["-O", source, "-o", binary])
  return binary
}

export const sendMediaKey = async (key: MediaKey) => {
  const bin = await ensureBinary()
  try {
    await exec(bin, [key])
  } catch (error) {
    throw new Error(
      ((error as { stderr?: string }).stderr ?? String(error)).trim(),
    )
  }
}
