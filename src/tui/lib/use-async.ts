import { useCallback, useEffect, useState } from "react"

type AsyncState<T> = {
  data: T | undefined
  error: string | undefined
  loading: boolean
  reload: () => void
}

export const useAsync = <T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
): AsyncState<T> => {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  const run = useCallback(fn, deps)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(undefined)
    run()
      .then((result) => {
        if (!active) return
        setData(result)
        setLoading(false)
      })
      .catch((cause) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : String(cause))
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [run, nonce])

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  return { data, error, loading, reload }
}
