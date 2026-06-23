import { Box, Text } from "ink"

type ErrorBannerProps = {
  message: string
}

export const ErrorBanner = ({ message }: ErrorBannerProps) => (
  <Box>
    <Text color="red">✗ {message}</Text>
  </Box>
)
