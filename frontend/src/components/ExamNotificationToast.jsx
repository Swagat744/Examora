import { useNavigate } from 'react-router-dom'
import { Bell, X, ArrowRight } from 'lucide-react'

export default function ExamNotificationToast({ notification, onDismiss }) {
  const navigate = useNavigate()

  if (!notification) return null

  const handleViewExam = () => {
    onDismiss()
    if (notification.examId) {
      navigate(`/student/exam/${notification.examId}`)
    }
  }

  return (
    <aside
      role="region"
      aria-label="Real-time exam notification"
      className="neo-card fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-full sm:max-w-sm overflow-hidden p-4 sm:p-5 shadow-[5px_5px_0px_var(--color-line)]"
    >
      <div className="flex items-start justify-between gap-3 border-b-2 border-line/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded border-2 border-line bg-amber text-ink">
            <Bell size={13} className="animate-pulse" />
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
            EXAM DISPATCH // LIVE
          </span>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring rounded p-1 text-muted hover:bg-paper hover:text-ink"
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-3">
        <h4 className="font-display text-base font-bold text-ink">
          {notification.title}
        </h4>
        <p className="mt-1 flex items-center gap-2 font-mono text-xs text-muted">
          <span className="text-cobalt font-semibold">{notification.subject}</span>
          {notification.duration && (
            <>
              <span>•</span>
              <span>{notification.duration}m</span>
            </>
          )}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          {notification.message || 'This examination is now available for candidates.'}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t-2 border-line/10 pt-3">
        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring rounded px-3 py-1 font-mono text-xs font-semibold text-muted hover:text-ink"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={handleViewExam}
          className="focus-ring neo-btn-press inline-flex items-center gap-1.5 rounded border-2 border-line bg-cobalt px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-[2px_2px_0px_var(--color-line)]"
        >
          <span>OPEN DOSSIER</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </aside>
  )
}
