import { useState, useEffect, useRef, useCallback } from 'react'
import client from '../api/client'

export function useJobPoller() {
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startPolling = useCallback((id) => {
    setJobId(id)
    setError(null)
    setResult(null)
    setJobStatus({ status: 'queued', progress: 0, current_step: 'Uploading video', step_index: 0 })

    const poll = async () => {
      try {
        const { data } = await client.get(`/api/job/${id}`)
        setJobStatus(data)

        if (data.status === 'complete') {
          stopPolling()
          const { data: resultData } = await client.get(`/api/result/${id}`)
          setResult(resultData)
        } else if (data.status === 'failed') {
          stopPolling()
          setError(data.error || 'Analysis failed. Please try again.')
        }
      } catch (err) {
        stopPolling()
        setError(err.message)
      }
    }

    // Poll immediately, then every 2 seconds
    poll()
    intervalRef.current = setInterval(poll, 2000)
  }, [stopPolling])

  const reset = useCallback(() => {
    stopPolling()
    setJobId(null)
    setJobStatus(null)
    setResult(null)
    setError(null)
  }, [stopPolling])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  return { jobId, jobStatus, result, error, startPolling, reset }
}
