import { Box, Text } from "ink"
import { mediaKeysAvailable } from "../lib/media.js"

export type KeyHint = {
  key: string
  label: string
  playback?: boolean
}

type FooterProps = {
  hints: KeyHint[]
}

export const Footer = ({ hints }: FooterProps) => {
  const visible = hints.filter((hint) => !hint.playback || mediaKeysAvailable)
  return (
    <Box marginTop={1}>
      <Text dimColor>
        {visible.map((hint) => `${hint.key} ${hint.label}`).join("   ")}
      </Text>
    </Box>
  )
}
