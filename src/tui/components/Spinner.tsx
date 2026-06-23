import { useEffect, useState } from "react"
import { Text } from "ink"

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

type SpinnerProps = {
  label?: string
}

export const Spinner = ({ label = "Loading…" }: SpinnerProps) => {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setFrame((value) => (value + 1) % FRAMES.length),
      80,
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <Text color="cyan">
      {FRAMES[frame]} {label}
    </Text>
  )
}
