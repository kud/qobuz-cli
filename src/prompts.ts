import readline from "node:readline"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const exec = promisify(execFile)

type MutableInterface = readline.Interface & {
  _writeToOutput: (chunk: string) => void
}

export const createPrompts = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }) as MutableInterface

  const ask = (question: string) =>
    new Promise<string>((resolve) =>
      rl.question(question, (answer) => resolve(answer.trim())),
    )

  const askHidden = (question: string) =>
    new Promise<string>((resolve) => {
      let muted = false
      rl._writeToOutput = (chunk) => {
        if (!muted) process.stdout.write(chunk)
      }
      rl.question(question, (answer) => {
        rl._writeToOutput = (chunk) => process.stdout.write(chunk)
        process.stdout.write("\n")
        resolve(answer)
      })
      muted = true
    })

  return { ask, askHidden, close: () => rl.close() }
}

export const openUrl = async (url: string): Promise<boolean> => {
  try {
    await exec("open", [url])
    return true
  } catch {
    return false
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const countdownAndOpen = async (url: string, seconds = 3) => {
  for (const n of Array.from({ length: seconds }, (_, i) => seconds - i)) {
    process.stdout.write(`\r  Opening ${url} in ${n}… `)
    await sleep(1000)
  }
  process.stdout.write(`\r  Opening ${url} now.${" ".repeat(20)}\n\n`)
  if (!(await openUrl(url)))
    console.log(`  (couldn't open a browser — visit ${url} manually)`)
}
