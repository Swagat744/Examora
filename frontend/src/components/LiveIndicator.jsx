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
      className={`inline-flex items-center gap-2 rounded-md border-2 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--color-line)] ${
        isConnected
          ? 'border-line bg-teal text-white'
          : 'border-line bg-paper-raised text-muted'
      }`}
      title={isConnected ? 'Real-time WebSocket connected' : 'Real-time WebSocket disconnected / reconnecting'}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isConnected ? 'bg-white' : 'bg-muted'
          }`}
        />
      </span>
      <span>{isConnected ? 'LIVE SYNC' : 'DISCONNECTED'}</span>
    </div>
  )
}
