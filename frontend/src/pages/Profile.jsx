import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Pencil, Check, X, Shield, Calendar, Mail, Key } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import { logout, updateProfile } from '../redux/slices/authSlice'
import { studentSidebarLinks, adminSidebarLinks } from '../data/sidebarLinks'

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [profileImage, setProfileImage] = useState(user?.profileImage || '')
  const [isSaving, setIsSaving] = useState(false)

  const sidebarLinks = user?.role === 'admin' || user?.role === 'teacher' ? adminSidebarLinks : studentSidebarLinks

  if (!user) return null

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const handleSave = async () => {
    setIsSaving(true)
    const result = await dispatch(updateProfile({ name, profileImage }))
    setIsSaving(false)
    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setName(user.name)
    setProfileImage(user.profileImage || '')
    setIsEditing(false)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-paper swiss-grid-pattern">
      <Sidebar
        links={sidebarLinks}
        footerLabel={`USER_SESSION // ${user.role.toUpperCase()}`}
      />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="border-b-2 border-line/10 pb-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cobalt">
              CREDENTIAL DOSSIER // IDENTITY
            </span>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              User Profile
            </h1>
            <p className="mt-1 text-xs text-muted">
              Manage your personal credentials, display name, and active session.
            </p>
          </div>

          <div className="neo-card mt-6 p-6 sm:p-8 shadow-[5px_5px_0px_var(--color-line)]">
            <div className="flex flex-col items-center text-center">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  className="h-24 w-24 rounded-lg border-2 border-line object-cover shadow-[3px_3px_0px_var(--color-line)]"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-lg border-2 border-line bg-cobalt text-white shadow-[3px_3px_0px_var(--color-line)]">
                  <User size={36} aria-hidden="true" />
                </div>
              )}

              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus-ring mt-4 w-full max-w-xs rounded-lg border-2 border-line bg-paper px-3 py-1.5 text-center font-display text-lg font-bold text-ink"
                  placeholder="Enter full name"
                />
              ) : (
                <h2 className="mt-4 font-display text-xl font-bold text-ink">{user.name}</h2>
              )}

              <span className="mt-1 inline-block rounded border border-line bg-paper px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                ROLE: {user.role}
              </span>
            </div>

            {isEditing && (
              <div className="mt-5 rounded-lg border-2 border-line bg-paper p-4">
                <label htmlFor="profileImage" className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  Avatar Image URL
                </label>
                <input
                  id="profileImage"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://…"
                  className="focus-ring w-full rounded-md border-2 border-line bg-paper-raised px-3 py-2 font-sans text-xs font-medium text-ink placeholder:text-muted"
                />
              </div>
            )}

            {/* Swiss Metadata Table */}
            <dl className="mt-6 divide-y-2 divide-line/10 border-y-2 border-line/10 font-mono text-xs">
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-muted">
                  <Mail size={14} /> Email
                </dt>
                <dd className="font-semibold text-ink">{user.email}</dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-muted">
                  <Shield size={14} /> Authorization
                </dt>
                <dd className="font-semibold uppercase text-ink">{user.role}</dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-muted">
                  <Key size={14} /> Authentication Provider
                </dt>
                <dd className="font-semibold uppercase text-ink">{user.provider === 'google' ? 'Google OAuth' : 'Local Password'}</dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-muted">
                  <Calendar size={14} /> Member Since
                </dt>
                <dd className="font-semibold text-ink">{memberSince}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              {isEditing ? (
                <>
                  <Button variant="accent" onClick={handleSave} disabled={isSaving} className="flex-1">
                    <Check size={16} aria-hidden="true" />
                    <span>{isSaving ? 'SAVING…' : 'SAVE CHANGES'}</span>
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1">
                    <X size={16} aria-hidden="true" />
                    <span>CANCEL</span>
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1">
                  <Pencil size={15} aria-hidden="true" />
                  <span>EDIT PROFILE</span>
                </Button>
              )}
            </div>

            <div className="mt-4 border-t-2 border-line/10 pt-4">
              <Button variant="danger" onClick={handleLogout} className="w-full">
                <LogOut size={16} aria-hidden="true" />
                <span>TERMINATE ACTIVE SESSION (LOGOUT)</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
