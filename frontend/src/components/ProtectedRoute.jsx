import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isRestoring } = useSelector((state) => state.auth)
  const location = useLocation()

  // A token is in localStorage and we're still confirming it with the
  // backend (e.g. right after a page refresh) — wait rather than
  // redirecting, or a valid session would bounce to /login for a moment.
  if (isRestoring) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // If this route is restricted to specific roles and the authenticated
  // user lacks the required role, redirect to student dashboard.
  if (allowedRoles && Array.isArray(allowedRoles) && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/student" replace />
  }

  return children
}
