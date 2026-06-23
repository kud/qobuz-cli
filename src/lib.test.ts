import { describe, expect, it } from "vitest"
import { formatDuration } from "./lib.js"

describe("formatDuration", () => {
  it("returns empty string for undefined", () => {
    expect(formatDuration(undefined)).toBe("")
  })

  it("returns empty string for 0 (falsy-branch edge case)", () => {
    expect(formatDuration(0)).toBe("")
  })

  it("formats 60 seconds as 1:00", () => {
    expect(formatDuration(60)).toBe("1:00")
  })

  it("pads single-digit seconds (65 → 1:05)", () => {
    expect(formatDuration(65)).toBe("1:05")
  })

  it("formats sub-minute duration (45 → 0:45)", () => {
    expect(formatDuration(45)).toBe("0:45")
  })

  it("minutes do not roll into hours (3661 → 61:01)", () => {
    expect(formatDuration(3661)).toBe("61:01")
  })
})
