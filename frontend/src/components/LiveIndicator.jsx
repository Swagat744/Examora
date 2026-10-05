import { useEffect, useState } from 'react'
import { subscribeConnectionStatus } from '../services/socketService'

export default function LiveIndicator() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeConnectionStatus((connected) => {
      setIsConnected(connected)
    })
    return unsubscribe
  }, [])

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
        isConnected
          ? 'border-teal/30 bg-teal-soft text-teal'
          : 'border-line bg-paper-raised text-muted'
      }`}
      title={isConnected ? 'Real-time WebSocket connected' : 'Real-time WebSocket disconnected / reconnecting'}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isConnected ? 'bg-teal' : 'bg-muted/60'
          }`}
        />
      </span>
      <span>{isConnected ? 'Live' : 'Offline'}</span>
    </div>
  )
}
