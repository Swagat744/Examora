import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Users,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import {
  getPendingFaculty,
  approveFaculty,
  rejectFaculty,
} from '../services/authService'
import { adminSidebarLinks } from '../data/sidebarLinks'

export default function AdminFacultyApproval() {
  const { user } = useSelector((state) => state.auth)

  const [pendingList, setPendingList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const [actionId, setActionId] = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve' | 'reject'
  const [processing, setProcessing] = useState(false)

  const fetchPending = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getPendingFaculty()
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      setPendingList(list)
    } catch (err) {
      setError(err.message || 'Failed to fetch pending faculty list.')
      setPendingList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async (id) => {
    setProcessing(true)
    setError(null)
    try {
      const res = await approveFaculty(id)
      setFeedback(res?.message || 'Faculty approved successfully.')
      await fetchPending()
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to approve faculty.')
    } finally {
      setProcessing(false)
      setActionId(null)
      setActionType(null)
    }
  }

  const handleReject = async (id) => {
    setProcessing(true)
    setError(null)
    try {
      const res = await rejectFaculty(id)
      setFeedback(res?.message || 'Faculty registration rejected.')
      await fetchPending()
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to reject faculty.')
    } finally {
      setProcessing(false)
      setActionId(null)
      setActionType(null)
    }
  }

  const selectedFaculty = pendingList.find((f) => (f._id || f.id) === actionId)

  return (
    <div className="flex min-h-screen bg-paper swiss-grid-pattern">
      <Sidebar
        links={adminSidebarLinks}
        footerLabel={`ACADEMIC_PORTAL // ${user?.role === 'admin' ? 'DEAN_ADMIN' : 'FACULTY'}`}
      />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex items-center gap-3 border-b-2 border-line/10 pb-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-line bg-cobalt-soft text-cobalt shadow-[2px_2px_0px_var(--color-line)]">
              <Users size={20} />
            </div>
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
                GOVERNANCE // CLEARANCE
              </span>
              <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                Faculty Approvals
              </h1>
              <p className="mt-1 text-xs text-muted">
                Authorize faculty member registrations to grant exam management clearances.
              </p>
            </div>
          </div>

          {feedback && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border-2 border-teal bg-teal-soft p-3 font-mono text-xs font-bold text-teal shadow-[2px_2px_0px_var(--color-teal)]">
              <CheckCircle2 size={16} />
              <span>{feedback}</span>
            </div>
          )}

          {error && !loading && (
            <div className="mt-6 flex items-start gap-2.5 rounded-lg border-2 border-coral bg-coral-soft p-3 font-mono text-xs font-bold text-coral shadow-[2px_2px_0px_var(--color-coral)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pending Queue Table */}
          <div className="neo-card mt-6 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center font-mono text-xs text-muted animate-pulse">
                SCANNING CLEARANCE QUEUE…
              </div>
            ) : error && pendingList.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle size={36} className="mx-auto text-coral" />
                <h3 className="mt-3 font-display text-lg font-bold text-ink">
                  Unable to Load Clearance Queue
                </h3>
                <p className="mt-1 font-mono text-xs text-coral">
                  {error}
                </p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={fetchPending}>
                    RETRY
                  </Button>
                </div>
              </div>
            ) : pendingList.length === 0 ? (
              <div className="p-12 text-center">
                <ShieldCheck size={36} className="mx-auto text-teal" />
                <h3 className="mt-3 font-display text-lg font-bold text-ink">
                  No Pending Faculty Applications
                </h3>
                <p className="mt-1 font-mono text-xs text-muted">
                  All faculty registrations have been reviewed. New applications will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-line/10 bg-paper uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5 font-bold">Faculty Name</th>
                      <th className="px-5 py-3.5 font-bold">Email</th>
                      <th className="px-5 py-3.5 font-bold">Applied At</th>
                      <th className="px-5 py-3.5 text-right font-bold">Decisions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-line/10">
                    {pendingList.map((f) => {
                      const fId = f._id || f.id
                      const appliedDate = f.createdAt
                        ? new Date(f.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent'

                      return (
                        <tr key={fId} className="hover:bg-paper transition-colors">
                          <td className="px-5 py-4 font-sans font-bold text-ink text-sm">
                            {f.name}
                          </td>
                          <td className="px-5 py-4 text-muted">
                            {f.email}
                          </td>
                          <td className="px-5 py-4 text-muted">
                            {appliedDate}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="teal"
                                size="sm"
                                onClick={() => {
                                  setActionId(fId)
                                  setActionType('approve')
                                }}
                              >
                                <Check size={13} />
                                <span>APPROVE</span>
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setActionId(fId)
                                  setActionType('reject')
                                }}
                              >
                                <X size={13} />
                                <span>REJECT</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {actionId && selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="neo-card w-full max-w-md p-6 sm:p-7 shadow-[6px_6px_0px_var(--color-line)]">
            <div className="flex items-center gap-2.5 border-b-2 border-line/10 pb-3">
              {actionType === 'approve' ? (
                <CheckCircle2 size={20} className="text-teal" />
              ) : (
                <AlertTriangle size={20} className="text-coral" />
              )}
              <h3 className="font-display text-lg font-bold text-ink">
                {actionType === 'approve' ? 'Grant Faculty Clearance' : 'Reject Application'}
              </h3>
            </div>

            <p className="mt-4 font-mono text-xs leading-relaxed text-ink-soft">
              {actionType === 'approve' ? (
                <>
                  Confirm approval for <strong className="text-ink">{selectedFaculty.name}</strong> ({selectedFaculty.email})? This grants immediate clearance to author and manage examinations.
                </>
              ) : (
                <>
                  Are you sure you want to reject and purge the registration for <strong className="text-ink">{selectedFaculty.name}</strong> ({selectedFaculty.email})?
                </>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-line/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionId(null)
                  setActionType(null)
                }}
                disabled={processing}
              >
                CANCEL
              </Button>
              <Button
                variant={actionType === 'approve' ? 'teal' : 'danger'}
                size="sm"
                onClick={() => (actionType === 'approve' ? handleApprove(actionId) : handleReject(actionId))}
                disabled={processing}
              >
                {processing ? 'PROCESSING…' : actionType === 'approve' ? 'CONFIRM APPROVAL' : 'CONFIRM REJECTION'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
