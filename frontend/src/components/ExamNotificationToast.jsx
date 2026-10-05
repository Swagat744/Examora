import { useNavigate } from 'react-router-dom'
import { Bell, X, ArrowRight, Clock, BookOpen } from 'lucide-react'

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
      className="fixed bottom-6 right-6 z-50 w-full max-w-sm overflow-hidden rounded-2xl border border-teal/40 bg-paper-raised shadow-[0_12px_36px_-8px_rgba(20,33,61,0.25)] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {/* Decorative top accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal via-teal to-amber" />

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-teal">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-soft">
              <Bell size={15} className="animate-pulse" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">New Exam Published</span>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="focus-ring -mr-1 -mt-1 rounded-lg p-1 text-muted transition hover:bg-line/40 hover:text-ink"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-2.5">
          <h4 className="font-display text-base font-semibold text-ink sm:text-lg">
            {notification.title}
          </h4>
          <p className="mt-0.5 text-xs text-muted flex items-center gap-1.5">
            <BookOpen size={13} className="text-teal" />
            <span>{notification.subject}</span>
            {notification.duration && (
              <>
                <span className="text-muted/40">•</span>
                <Clock size={13} className="text-muted" />
                <span>{notification.duration} mins</span>
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-ink-soft leading-relaxed">
            {notification.message || 'This exam is now available for taking.'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line/60 pt-3">
          <button
            type="button"
            onClick={onDismiss}
            className="focus-ring rounded-xl px-3 py-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleViewExam}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-teal px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal/90 active:scale-95"
          >
            <span>View Exam</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
