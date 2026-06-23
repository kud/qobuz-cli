import { Box, Text, useApp, useInput } from "ink"

export const NotLoggedIn = () => {
  const { exit } = useApp()

  useInput((input, key) => {
    if (input === "q" || key.escape || (key.ctrl && input === "c")) exit()
  })

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="yellow">Not logged in.</Text>
      <Text dimColor>
        Run <Text color="cyan">qobuz login</Text> to connect your account.
      </Text>
      <Box marginTop={1}>
        <Text dimColor>q quit</Text>
      </Box>
    </Box>
  )
}
