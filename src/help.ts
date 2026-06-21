import { renderUsage } from "citty"
import type { CommandDef } from "citty"

const ESC = String.fromCharCode(27)
const stripAnsi = (value: string) =>
  value.replace(new RegExp(`${ESC}\\[[0-9;]*m`, "g"), "")
const bold = (value: string) => `${ESC}[1m${value}${ESC}[22m`
const underline = (value: string) => `${ESC}[4m${value}${ESC}[24m`
const cyan = (value: string) => `${ESC}[36m${value}${ESC}[39m`

/**
 * citty builds its USAGE line by piping every subcommand name together, which
 * gets unwieldy. Render the standard help, then replace that one line with a
 * generic `qobuz <command> [options]` — the COMMANDS list stays auto-generated.
 */
export const renderGenericUsage = async (
  command: CommandDef,
): Promise<string> => {
  const lines = (await renderUsage(command)).split("\n")
  const usageIndex = lines.findIndex((line) =>
    stripAnsi(line).startsWith("USAGE"),
  )
  if (usageIndex !== -1)
    lines[usageIndex] =
      `${underline(bold("USAGE"))} ${cyan("qobuz <command> [options]")}`
  return lines.join("\n")
}
